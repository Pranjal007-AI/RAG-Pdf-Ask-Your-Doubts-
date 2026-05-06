# 🤖 RAG Chatbot — Ask Your PDF

A **Retrieval-Augmented Generation (RAG)** powered chatbot that lets you upload PDFs and ask questions about them in natural language.

🌐 **Live Demo:** [https://rag-pdf-ask-your-doubts.vercel.app/](https://rag-pdf-ask-your-doubts.vercel.app/)

---

## 📌 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## 📖 Overview

RAG Chatbot lets you upload any PDF and instantly start asking questions about its content. The backend embeds your document into a **ChromaDB** vector store, retrieves the most relevant chunks on each query, and passes them to an LLM to generate accurate, grounded answers.

---

## ✨ Features

- 📄 **PDF Upload** — Upload any PDF and start chatting with it instantly
- 🔍 **Semantic Search** — ChromaDB-powered vector similarity retrieval
- 💬 **Contextual Answers** — LLM responses grounded in your document's content
- ⚡ **Fast & Lightweight** — Minimal dependencies, quick setup
- 🌐 **Deployed** — Frontend on Vercel, Backend on Render

---

## 🛠️ Tech Stack

| Layer        | Technology                  |
|--------------|-----------------------------|
| Frontend     | React.js / Next.js (Vercel) |
| Backend      | Python / FastAPI            |
| Vector Store | ChromaDB                    |
| Embeddings   | HuggingFace        |
| LLM          | MistralAI         |
| Deployment   | Vercel (FE) + Render (BE)   |

---

## 📁 Project Structure

```
rag-chatbot/
├── backend/
│   ├── Chroma_db/           # Persistent ChromaDB vector store
│   ├── __pycache__/
│   ├── venv/                # Python virtual environment (gitignored)
│   ├── main.py              # FastAPI app — routes, ingestion, chat logic
│   ├── render.yaml          # Render deployment config
│   ├── requirements.txt     # Python dependencies
│   ├── .env                 # Local secrets (gitignored)
│   └── .env.example         # Environment variable template
│
├── frontend/
│   ├── node_modules/        # Node dependencies (gitignored)
│   ├── public/              # Static assets
│   ├── src/                 # React source code
│   ├── vercel.json          # Vercel deployment config
│   ├── package.json         # Node dependencies & scripts
│   ├── package-lock.json
│   ├── .env                 # Local secrets (gitignored)
│   └── .env.example         # Environment variable template
│
├── .env                     # Root-level env (if any)
├── .gitignore
├── DEPLOYMENT.md            # Deployment guide
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Python 3.9+
- Node.js 18+
- An OpenAI API key (or your chosen LLM provider)

---

### Backend Setup

```bash
# 1. Navigate to backend
cd backend

# 2. Create and activate virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Configure environment variables
cp .env.example .env
# Fill in your API keys in .env

# 5. Start the backend server
uvicorn main:app --reload
```

Backend runs at: `http://127.0.0.1:8000`

---

### Frontend Setup

```bash
# 1. Navigate to frontend
cd frontend

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
# Set your backend API URL in .env

# 4. Start the development server
npm run dev
```

Frontend runs at: `http://localhost:3000`

---

## ⚙️ Environment Variables

### `backend/.env`

```env
OPENAI_API_KEY=your_openai_api_key
# Add any other backend secrets here
```

### `frontend/.env`

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
# For production, set this to your Render backend URL
```

---

## 🌍 Deployment

This project is deployed using:

- **Frontend → Vercel** — Auto-deploys from the `frontend/` directory
- **Backend → Render** — Configured via `backend/render.yaml`

For detailed deployment steps, see [DEPLOYMENT.md](./DEPLOYMENT.md).

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "Add your feature"`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License**.

---

> Built with ❤️ using FastAPI, ChromaDB, React, and OpenAI.
