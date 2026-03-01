# Insight AI 🚀

An AI-orchestrated research engine that transforms unstructured and raw queries into structured, multi-dimensional, data-backed executive decision intelligence. 📊🧠

---

## 1. Problem Statement 🎯

### Problem Title  
Fragmented Research & Unstructured Decision Inputs in Strategic Analysis 📚📈

### Problem Description  
Decision-makers often begin with vague, high-level queries (e.g., "Future of EV industry in India?" or "Impact of AI on fintech growth?"). Traditional search engines return fragmented links, raw articles, and inconsistent data sources. Analysts must manually validate credibility, extract structured insights, compare financial datasets, and consolidate everything into an actionable format. This process is slow, inconsistent, and prone to bias.

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
- 📊 Rich Data Representations — Text, Tables, Bar Graphs, Line Charts, Pie Charts, Radar Charts, and Comparison/Venn Diagrams  

---

## 4. System Architecture 🏗️

### High-Level Flow  
User → Frontend → Backend → LLM Orchestration Engine → Financial API Layer → Database → Structured Response

### Architecture Description  

1. **Query Intelligence Layer**  
   - Detect topic, industry, tone, intent  
   - Generate structured report headers  

2. **Sub-Query Generator**  
   - Create optimized sub-queries per header  

3. **Web Research Layer**  
   - Search API calls  
   - Content fetching  
   - Cleaning and token trimming  

4. **Evidence Extraction Layer**  
   - Extract claims, statistics, findings  
   - Remove fluff  
   - Assign confidence score  

5. **Section Synthesis Layer**  
   - Decide output format (table/graph/text/mixed)  
   - Generate structured JSON  
   - Map citations to content blocks  
   - Data is represented using multiple formats: Text, Tables, Bar Graphs, Line Charts, Pie Charts, Radar Charts, and Comparison/Venn Diagrams — chosen dynamically based on the nature of each section's content  

6. **Financial Intelligence Layer**  
   - Industry mapping via GICS/ETF proxy  
   - Retrieve financial data  
   - Compute industry-level metrics  
   - Generate structured market summary  

7. **Global Consistency Layer**  
   - Enforce no header or format changes  
   - Detect contradictions  
   - Integrate financial signals  

8. **Rendering Layer**  
   - Convert JSON to UI components  
   - Display tables, charts, citations  

### Architecture Diagram  
(Add system architecture diagram image here)

---

## 5. Database Design 🗄️

### ER Diagram  
(Add ER diagram image here)

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
- React 18 + Vite ⚛️  
- Tailwind CSS for styling  
- Recharts for data visualizations (Bar, Line, Pie, Radar charts)  
- Lucide React for icons  
- Axios for API communication  

### Backend  
- Python + FastAPI 🖥️  
- Uvicorn (ASGI server)  
- BeautifulSoup4 + Readability for web scraping & content extraction  
- HTTPX for async HTTP requests  

### ML/AI  
- Groq API (Llama 3.3 70B Versatile) via OpenAI-compatible SDK 🤖  
- Custom credibility scoring engine  
- Multi-agent orchestration pipeline  

### External APIs  
- SerpApi API for web discovery 🔎  
- Financial Modeling Prep (FMP) API for stock & financial data 📈  

### Database  
- Firebase Firestore (NoSQL) 🔥  

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
7. Report is rendered with rich data representations — Text, Tables, Bar Graphs, Line Charts, Pie Charts, Radar Charts, and Comparison/Venn Diagrams  

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
- Rich data visualizations including Text, Tables, Bar Graphs, Line Charts, Pie Charts, Radar Charts, and Comparison Diagrams  

---

## 14. Team Roles & Responsibilities 👥

| Member Name | Role | Responsibilities |
|-------------|------|-----------------|
| Palakpreet Kaur Bhullar | Leader | Research |
| Yasir Eqbal | Member | Backend and APIs |
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
