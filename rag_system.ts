import { ChromaClient } from 'chromadb';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import fs from 'fs';

const chromaClient = new ChromaClient({ host: "localhost", port: 8000 });

const chatModel = new ChatGoogleGenerativeAI({
  model: "gemini-2.0-flash",
  maxOutputTokens: 2048,
  apiKey: process.env.GOOGLE_API_KEY
});

const embeddings = new GoogleGenerativeAIEmbeddings({
  model: "text-embedding-004",
  apiKey: process.env.GOOGLE_API_KEY
});

const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 400,
  chunkOverlap: 50,
  separators: ["\n\n", "\n", ". ", " ", ""]
});

class ZetaFinanceRAG {
  private collectionName = "zeta_finance_docs";
  private collection: any;

  async initializeCollection() {
    try {
      this.collection = await chromaClient.getCollection({ name: this.collectionName });
      console.log("✓ Found existing collection");
    } catch (error) {
      try {
        this.collection = await chromaClient.createCollection({
          name: this.collectionName,
          metadata: { "hnsw:space": "cosine" }
        });
        console.log("✓ Created new collection");
      } catch (createError: any) {
        if (createError.name === 'ChromaUniqueError' || createError.message?.includes('already exists')) {
          this.collection = await chromaClient.getCollection({ name: this.collectionName });
          console.log("✓ Retrieved existing collection");
        } else {
          throw createError;
        }
      }
    }
  }

  async embedDocument(filePath: string) {
    console.log("📄 Reading document...");
    const text = fs.readFileSync(filePath, 'utf-8');
    
    const existingDocs = await this.collection.count();
    if (existingDocs > 0) {
      console.log("📋 Document already embedded. Skipping.");
      return;
    }

    console.log("✂️  Splitting into chunks with LangChain...");
    const chunks = await textSplitter.splitText(text);
    console.log(`Created ${chunks.length} chunks`);

    console.log("🔄 Generating embeddings with LangChain...");
    const chunkEmbeddings = await embeddings.embedDocuments(chunks);

    console.log("💾 Storing in ChromaDB...");
    await this.collection.add({
      ids: chunks.map((_, i) => `chunk_${i}`),
      embeddings: chunkEmbeddings,
      documents: chunks,
      metadatas: chunks.map((_, i) => ({ 
        chunk_index: i, 
        source: "zeta_finance.txt" 
      }))
    });

    console.log("✅ Document embedded successfully!");
  }

  async queryDatabase(query: string, topK: number = 3): Promise<string[]> {
    console.log(`🔍 Searching for: "${query}"`);
    
    const queryEmbedding = await embeddings.embedQuery(query);
    
    const results = await this.collection.query({
      queryEmbeddings: [queryEmbedding],
      nResults: topK,
      include: ["documents", "distances"]
    });

    console.log(`📋 Found ${results.documents[0].length} relevant chunks`);
    return results.documents[0];
  }

  async generateResponse(userQuery: string): Promise<string> {
    const relevantChunks = await this.queryDatabase(userQuery, 3);
    const context = relevantChunks.join("\n\n");
    
    const prompt = `Based on the following information about Zeta Finance, answer the user's question accurately.

CONTEXT:
${context}

USER QUESTION: ${userQuery}

Provide a detailed answer based on the context. If the context doesn't contain enough information, mention that.

ANSWER:`;

    console.log("🤖 Generating response with Gemini...");
    const response = await chatModel.invoke(prompt);
    return response.content as string;
  }

  async runRAG(userQuery: string): Promise<string> {
    await this.initializeCollection();
    await this.embedDocument('/Users/gaurair/downloads/ai-bunny/zeta_finance.txt');
    return await this.generateResponse(userQuery);
  }
}

// CLI Functions
async function resetAndReEmbed() {
  console.log("🔄 Resetting RAG system for updated document...");
  
  try {
    // Delete existing collection
    console.log("🗑️ Deleting old collection...");
    try {
      await chromaClient.deleteCollection({ name: "zeta_finance_docs" });
      console.log("✅ Old collection deleted");
    } catch (error) {
      console.log("ℹ️ No existing collection to delete");
    }
    
    // Create new RAG instance and process updated document
    console.log("🔄 Processing updated document...");
    const rag = new ZetaFinanceRAG();
    
    // Test with professor-related query
    const testQuery = "Who is Professor Kerry Walsh?";
    console.log(`\n🔸 Testing with query: ${testQuery}`);
    
    const response = await rag.runRAG(testQuery);
    console.log("\n📝 Response:");
    console.log(response);
    
    console.log("\n✅ Successfully re-embedded updated document!");
    console.log("You can now ask questions about Professor Kerry Walsh.");
    
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

async function askSingleQuestion() {
  // Get question from command line arguments
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log("🎓 Professor Kerry Walsh - Q&A System");
    console.log("====================================");
    console.log();
    console.log("Usage:");
    console.log("  bun rag_system.ts \"Your question here\"");
    console.log();
    console.log("Examples:");
    console.log("  bun rag_system.ts \"Who is Professor Kerry Walsh?\"");
    console.log("  bun rag_system.ts \"What are his research interests?\"");
    console.log("  bun rag_system.ts \"Tell me about his awards\"");
    console.log("  bun rag_system.ts \"What is his educational background?\"");
    console.log();
    console.log("Special commands:");
    console.log("  bun rag_system.ts --reset    # Reset and re-embed document");
    return;
  }
  
  // Check for reset command
  if (args[0] === '--reset' || args[0] === '-r') {
    await resetAndReEmbed();
    return;
  }
  
  const question = args.join(' ');
  
  console.log("🎓 Professor Kerry Walsh - Q&A System");
  console.log("====================================");
  console.log(`❓ Question: ${question}`);
  console.log();
  
  try {
    console.log("🔄 Processing your question...");
    
    const rag = new ZetaFinanceRAG();
    const answer = await rag.runRAG(question);
    
    console.log("📝 Answer:");
    console.log("--------");
    console.log(answer);
    
  } catch (error) {
    console.error("❌ Error:", error);
    console.log("Please try asking your question again.");
  }
}

// Export the class
export { ZetaFinanceRAG };

// Run the CLI if this file is executed directly
if (import.meta.main) {
  askSingleQuestion().catch(console.error);
}
