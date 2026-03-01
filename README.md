# Insight AI 🚀

An AI-orchestrated research engine that transforms unstructured and raw queries into structured, multi-dimensional, data-backed executive decision intelligence. 📊🧠

---

## 1. Problem Statement 🎯

### Problem Title  
Fragmented Research & Unstructured Decision Inputs in Strategic Analysis 📚📈

### Problem Description  
Decision-makers often begin with vague, high-level queries (e.g., “Future of EV industry in India?” or “Impact of AI on fintech growth?”). Traditional search engines return fragmented links, raw articles, and inconsistent data sources. Analysts must manually validate credibility, extract structured insights, compare financial datasets, and consolidate everything into an actionable format. This process is slow, inconsistent, and prone to bias.

### Target Users  
- Startup Founders 🚀  
- Investors & Venture Capitalists 💼  
- Business Analysts 📊  
- Policy Researchers 🏛️  
- Strategy Teams in Enterprises 🏢  

### Existing Gaps  
- No unified system combining qualitative + quantitative intelligence  
- No automated credibility scoring of sources  
- No integrated stock-industry analysis mapping 📉  
- Lack of structured executive-ready outputs  
- Manual effort in consolidating financial data, and web research  

---

## 2. Problem Understanding & Approach 🧩

### Root Cause Analysis  
- Research data is scattered across articles, financial APIs, and reports  
- No automated industry-level stock clustering  
- No structured research orchestration pipeline   

### Solution Strategy  
Develop a Research-Orchestrated AI Engine using:  
- Search APIs for discovery 🔎   
- Stock data APIs for industry-level quantitative analysis 📈  
- Credibility scoring engine for source validation ✅  
- Structured executive-format response generation  

---

## 3. Proposed Solution 💡

### Solution Overview  
Insight AI is a multi-agent research engine that transforms raw queries into structured, credible, and financially-backed executive reports.

### Core Idea  
Combine:  
- Qualitative intelligence (articles, books, research papers)  
- Quantitative intelligence (industry stock performance data)  
- AI summarization + structured output generation  

### Key Features  
- 🔎 Intelligent Query Understanding   
- 📊 Industry-based Stock Clustering  
- 📉 Historical Stock Performance Aggregation  
- 📈 Industry Growth Prediction Logic  
- ⭐ Credibility Scoring System  
- 🧾 Executive-Ready Actionable Reports  

---

## 4. System Architecture 🏗️

### High-Level Flow
User → Frontend → Backend → LLM Orchestration Engine → Financial API Layer → Database → Structured Response

### Architecture Description
Insight AI follows a layered architecture:

1. Query Intelligence Layer  
   - Detect topic, industry, tone, intent  
   - Generate structured report headers  

2. Sub-Query Generator  
   - Create optimized sub-queries per header  

3. Web Research Layer  
   - Search API calls  
   - Content fetching  
   - Cleaning and token trimming  

4. Evidence Extraction Layer  
   - Extract claims, statistics, findings  
   - Remove fluff  
   - Assign confidence score  

5. Section Synthesis Layer  
   - Decide output format (table/graph/text/mixed)  
   - Generate structured JSON  
   - Map citations to content blocks  

6. Financial Intelligence Layer  
   - Industry mapping via GICS/ETF proxy  
   - Retrieve financial data  
   - Compute industry-level metrics  
   - Generate structured market summary  

7. Global Consistency Layer  
   - Enforce no header or format changes  
   - Detect contradictions  
   - Integrate financial signals  

8. Rendering Layer  
   - Convert JSON to UI components  
   - Display tables, charts, citations  


---

## 5. Database Design 🗄️

### ER Diagram  
(Will Add ER diagram image here)

### ER Diagram Description  
Entities include:  
- Users  
- Queries  
- Sources  
- Credibility Scores  
- Industry Clusters  
- Stocks  
- Historical Stock Data  

Relationships:  
- One user → multiple queries  
- One query → multiple sources  
- One industry → multiple stocks  
- One document → multiple chunks  

---

## 6. Dataset Selected 📂

### Dataset Name
Real-time Web Data + Public Financial Market Data

### Source
- Search API (Brave/Serp-based)
- Financial Modeling Prep / Alpha Vantage
- ETF Holdings Data
- Public company financial statements

### Data Type
- Unstructured text (HTML articles)
- Structured financial time-series data
- Income statements
- Market capitalization data

### Selection Reason
To combine qualitative research with quantitative financial signals for multi-dimensional industry intelligence.

### Preprocessing Steps
- HTML cleaning and boilerplate removal
- Token trimming
- Deduplication
- Chunk-based extraction
- Financial time-series aggregation
- CAGR and margin calculation

---

## 7. Model Selected 🤖

### Model Name  
LLM: Llama 3.3 70B

### Selection Reasoning  
- Strong reasoning capability  
- Structured output generation  
- Supports multi-dimensional summarization  
- Has very large context window

### Alternatives Considered  
- Pure search-based summarization  
- Traditional NLP pipelines  
- Fine-tuned domain-specific models  

### Evaluation Metrics  
- Relevance score  
- Source credibility weight  
- Financial trend accuracy  
- Response structure quality  

---

## 8. Technology Stack 🛠️

### Frontend  
- HTML+ CSS+ JS ⚛️  

### Backend  
- Node.js + Express.js 🖥️  

### ML/AI  
- LLM API  

### Database  
- Firebase / NoSQL Database 🔥  

### Deployment  
- Cloud Deployment (e.g., Vercel / AWS) ☁️  

---

## 9. API Documentation & Testing 🧪

### NA


---

## 10. Module-wise Development & Deliverables 📦

### Checkpoint 1: Research & Planning  
- Deliverables:  
  - Problem validation  
  - Architecture planning  
  - Tech stack selection  

### Checkpoint 2: Backend Development  
- Deliverables:  
  - API development  
  - Industry-stock mapping logic  
  - Credibility scoring engine  

### Checkpoint 3: Frontend Development  
- Deliverables:  
  - Query input UI  
  - Report display interface  

### Checkpoint 4: Model Integration  
- Deliverables:  
  - LLM integration  
  - Structured output formatting  

### Checkpoint 5: Deployment  
- Deliverables:  
  - Cloud deployment  
  - End-to-end testing  

---

## 11. End-to-End Workflow 🔄

1. User submits raw query  
2. System classifies domain & industry  
3. Related stocks identified  
4. Historical stock data retrieved & aggregated  
5. Credibility scoring applied  
6. LLM generates structured executive report  

---

## 12. Demo & Video 🎥

- Live Demo Link:  
- Demo Video Link:  
- GitHub Repository:  

---

## 13. Hackathon Deliverables Summary 🏆

- Full-stack AI research engine  
- Industry-level stock intelligence integration  
- Credibility-based research validation system  
- Structured executive decision reports  

---

## 14. Team Roles & Responsibilities 👥

| Member Name | Role | Responsibilities |
|-------------|------|-----------------|
| Palakpreet Kaur Bhullar | Leader | Research |
| Yasir Eqbal | Member | Backend and APIs|
| Manas Sandhu | Member | Frontend and APIs |

---

## 15. Future Scope & Scalability 🚀

### Short-Term  
- Real-time stock API integration  
- Advanced forecasting models  
- Improved industry clustering  

### Long-Term  
- Multi-industry benchmarking  
- Predictive analytics dashboard  
- Enterprise SaaS model  

---

## 16. Known Limitations ⚠️

- Dependent on third-party APIs  
- Forecasting accuracy varies with historical data quality  
- LLM hallucination risk (eg: credibility scoring)  

---

## 17. Impact 🌍

- Faster executive decision-making  
- Reduced manual research time  
- Improved credibility & financial grounding in strategic planning  
- Democratization of deep research intelligence  
# 🧠 Insight AI — Autonomous Research Intelligence Engine

> A production-grade, full-stack AI research engine that decomposes complex queries, retrieves live web data, scores source credibility, and generates structured McKinsey-style reports with financial intelligence.

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS 4, Recharts, Axios |
| **Backend** | Python, FastAPI, Uvicorn, AsyncOpenAI |
| **LLM** | Groq (`llama-3.1-8b-instant`) or OpenAI GPT-4o |
| **Web Search** | SerpAPI (Google Search) |
| **Financial Data** | Financial Modeling Prep (FMP) |
| **Database/Logging** | Firebase Firestore |

---

## ⚙️ Local Setup Guide

### Prerequisites
- **Python 3.10+** — [Download](https://www.python.org/downloads/)
- **Node.js 18+** — [Download](https://nodejs.org/)
- **Git** — [Download](https://git-scm.com/)

### Step 1: Clone the Repository

```bash
git clone https://github.com/esachdev28/insight_ai_2.git
cd insight_ai_2
```

### Step 2: Get Your API Keys

You will need the following API keys. All are free-tier available:

| Key | Get it from |
|---|---|
| `GROQ_API_KEY` | [console.groq.com/keys](https://console.groq.com/keys) |
| `SERPAPI_API_KEY` | [serpapi.com/manage-api-key](https://serpapi.com/manage-api-key) |
| `FMP_API_KEY` | [financialmodelingprep.com/developer](https://financialmodelingprep.com/developer/docs/) |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | Firebase Console → Project Settings → Service Accounts → **Generate new private key** (JSON file) |

### Step 3: Configure Environment Variables

Copy the example `.env` file and fill in your keys:

```bash
cp .env.example .env
```

Open `.env` in a text editor and replace the placeholder values with your actual keys.

For **Firebase**, open the downloaded service account JSON file, copy the **entire contents**, and paste it as a single-line JSON string as the value of `FIREBASE_SERVICE_ACCOUNT_JSON`. Example:

```
FIREBASE_SERVICE_ACCOUNT_JSON={"type": "service_account", "project_id": "my-project", ...}
```

### Step 4: Set Up and Start the Backend

```bash
# Navigate to backend directory
cd backend

# Create a Python virtual environment
python3 -m venv venv

# Activate the virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install all dependencies
pip install -r requirements.txt

# Start the backend server (from the backend/ directory)
python3 main.py
```

The backend API will be running at: **`http://localhost:8000`**

You can verify it's working by visiting `http://localhost:8000` in your browser — you should see:
```json
{"status": "Research Engine is Online."}
```

### Step 5: Set Up and Start the Frontend

Open a **new terminal window** and run:

```bash
# Navigate to frontend directory
cd insight_ai_2/frontend

# Install Node.js dependencies
npm install

# Start the development server
npm run dev
```

The frontend will be running at: **`http://localhost:5173`**

### Step 6: Start Researching! 🎉

Open **`http://localhost:5173`** in your browser. Try a query like:

> *"Deep dive into Nvidia's competitive moat and future revenue outlook"*

---

## 📂 Project Structure

```
insight_ai_2/
├── frontend/                  # React + Vite Application
│   ├── src/                   # Components & App Logic
│   ├── package.json           # Frontend dependencies
│   └── vite.config.js
├── backend/                   # FastAPI Application
│   ├── main.py                # API entry point & endpoints
│   ├── requirements.txt       # Python dependencies ✅
│   ├── models/
│   │   └── schemas.py         # Pydantic data models
│   └── services/              # Core Business Logic
│       ├── orchestrator.py    # 10-Layer Pipeline Coordinator
│       ├── llm_service.py     # Groq / OpenAI Abstraction
│       ├── search_service.py  # SerpAPI Web Search
│       ├── firebase_logger.py # Firestore Integration
│       ├── financial_service.py # FMP Stock Data
│       └── credibility.py     # Source Credibility Scoring
├── .env.example               # Template for environment variables ✅
├── .gitignore                 # Protects secrets & build artifacts ✅
└── README.md
```

---

## 🔒 Security Note

Your `.env` file is **gitignored** and will never be committed. Never share your `.env` file publicly. Only the `.env.example` (with placeholder values) is committed to the repository.
