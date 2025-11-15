# AI Bunny - RAG System with ChromaDB

A Retrieval-Augmented Generation (RAG) system built with TypeScript, ChromaDB, and Google's Gemini AI for document Q&A functionality.

## 🚀 Features

- **RAG System**: Document embedding and retrieval using ChromaDB
- **LangChain Integration**: Text splitting and embeddings
- **Google Gemini AI**: Advanced language model for response generation
- **TypeScript**: Type-safe development
- **CLI Interface**: Easy command-line interaction

## 📋 Prerequisites

- [Bun](https://bun.sh/) (JavaScript runtime)
- [Docker](https://www.docker.com/) and Docker Compose
- Google API Key for Gemini AI

## 🛠️ Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/iamMrGaurav/ai-repository.git
cd ai-repository
```

### 2. Install Dependencies

```bash
bun install
```

### 3. Environment Setup

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Add your Google API Key to the `.env` file:

```env
GOOGLE_API_KEY=your_google_api_key_here
```

**To get a Google API Key:**
1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create a new API key
3. Copy the key to your `.env` file

### 4. Start ChromaDB

#### Option A: Using Docker Compose (Recommended)

```bash
docker-compose up -d
```

#### Option B: Using Docker manually

```bash
docker run -d --name chroma -p 8000:8000 chromadb/chroma
```

#### Option C: Install ChromaDB locally

```bash
pip install chromadb
chroma run --host localhost --port 8000
```

### 5. Verify ChromaDB is Running

Check if ChromaDB is accessible:

```bash
curl http://localhost:8000/api/v1/heartbeat
```

You should receive a response with the current time.

## 🎯 Usage

### Basic Q&A

Ask questions about the document:

```bash
bun rag_system.ts "Who is Professor Kerry Walsh?"
bun rag_system.ts "What are his research interests?"
bun rag_system.ts "Tell me about his awards"
```

### Reset and Re-embed Document

If you update the document, reset the system:

```bash
bun rag_system.ts --reset
```

### Help

View available commands:

```bash
bun rag_system.ts
```

## 📁 Project Structure

```
ai-bunny/
├── README.md                 # This file
├── package.json             # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── docker-compose.yml      # ChromaDB setup
├── Dockerfile.chroma       # Custom ChromaDB image
├── .env.example           # Environment variables template
├── rag_system.ts          # Main RAG system implementation
├── index.ts               # Entry point
└── zeta_finance.txt       # Sample document for Q&A
```

## 🐳 Docker Setup

### Docker Compose Configuration

The included `docker-compose.yml` sets up ChromaDB with persistent storage:

```yaml
version: '3.8'
services:
  chroma:
    image: chromadb/chroma:latest
    ports:
      - "8000:8000"
    volumes:
      - chroma_data:/chroma/chroma
    environment:
      - CHROMA_SERVER_HOST=0.0.0.0
      - CHROMA_SERVER_PORT=8000
    restart: unless-stopped

volumes:
  chroma_data:
    driver: local
```

### Custom Dockerfile for ChromaDB

If you need a custom ChromaDB setup, use the included `Dockerfile.chroma`:

```bash
docker build -f Dockerfile.chroma -t custom-chroma .
docker run -d --name chroma -p 8000:8000 custom-chroma
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GOOGLE_API_KEY` | Google Gemini AI API key | Yes |

### ChromaDB Configuration

- **Host**: localhost
- **Port**: 8000
- **Collection**: zeta_finance_docs
- **Embedding Model**: text-embedding-004
- **Chat Model**: gemini-2.0-flash

## 🚨 Troubleshooting

### ChromaDB Connection Issues

1. **Check if ChromaDB is running:**
   ```bash
   docker ps | grep chroma
   ```

2. **View ChromaDB logs:**
   ```bash
   docker logs chroma
   ```

3. **Restart ChromaDB:**
   ```bash
   docker-compose down
   docker-compose up -d
   ```

### API Key Issues

1. Verify your API key is set in `.env`
2. Check API key permissions in Google AI Studio
3. Ensure the API key has access to Gemini models

### Common Errors

- **"Collection already exists"**: Use `--reset` flag to recreate
- **"Connection refused"**: Ensure ChromaDB is running on port 8000
- **"API key not found"**: Check your `.env` file setup

## 📦 Dependencies

### Main Dependencies
- `chromadb`: Vector database for embeddings
- `@langchain/google-genai`: Google Gemini AI integration
- `@langchain/textsplitters`: Document text splitting
- `@chroma-core/default-embed`: Default embeddings

### Development Dependencies
- `typescript`: Type checking
- `@types/bun`: Bun runtime types

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🔗 Links

- [ChromaDB Documentation](https://docs.trychroma.com/)
- [LangChain Documentation](https://js.langchain.com/)
- [Google AI Studio](https://aistudio.google.com/)
- [Bun Documentation](https://bun.sh/docs)