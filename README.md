# 🛡️ InternShield AI

> **AI-Powered Internship Fraud & Scam Detection Platform**  
> *A full-stack cybersecurity and student protection system designed for college hackathons.*

---

## 📌 Problem Statement
Every year, thousands of college students fall victim to predatory internship scams, including:
- **Upfront Fee Demands**: Paying for "mandatory training kits", "laptop security deposits", or "document verification".
- **Telegram / WhatsApp Task Traps**: Fake daily tasks with initial small payouts leading to large investment/crypto fraud.
- **Unverified Recruiters**: Scammers impersonating reputable tech companies using free `@gmail.com` or spoofed domains.
- **Fake Offer Letters**: Issuing unverified offer letters without any technical interviews to collect sensitive identity data.

**InternShield AI** provides students with an instant fraud risk assessment, heuristic red-flag detection, company domain authentication, and a verified scam blacklist backed by MySQL and AI.

---

## 🚀 Tech Stack

| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Frontend** | React 19 + Vite + JavaScript | High-speed SPA with vanilla CSS & CSS variables |
| **Styling** | Modern CSS3 (Vanilla) | Custom dark mode, glassmorphism, responsive grid |
| **Backend** | Node.js + Express.js | Modular REST API with ES Modules (`import/export`) |
| **Database** | MySQL | Relational storage for scam reports, directory & logs |
| **AI Integration** | Google Generative AI (Gemini) | Deep semantic scam evaluation with rule-based fallback |
| **Version Control** | Git & GitHub | Clean repository structure with monorepo setup |

---

## 📁 Project Structure

```text
InternShield/
├── .env.example                     # Environment variables template
├── .gitignore                       # Multi-package root Git ignore rules
├── README.md                        # Documentation & setup instructions
│
├── frontend/                        # React + Vite Client
│   ├── public/
│   │   └── favicon.svg              # Shield logo favicon
│   ├── src/
│   │   ├── services/
│   │   │   └── api.js               # Centralized backend REST client
│   │   ├── App.css                  # Component & dashboard styles
│   │   ├── App.jsx                  # Main interactive dashboard
│   │   ├── index.css                # CSS variables, typography, design tokens
│   │   └── main.jsx                 # React root DOM mount
│   ├── index.html                   # HTML5 shell with Google Fonts & SEO tags
│   ├── package.json                 # Frontend dependencies (React, Vite, Lucide)
│   └── vite.config.js               # Vite bundler configuration
│
└── backend/                         # Express.js API Server
    ├── .env.example                 # Backend environment variable template
    ├── package.json                 # Backend dependencies (Express, MySQL2, AI SDK)
    └── src/
        ├── config/
        │   └── db.js                # MySQL connection pool configuration
        ├── controllers/
        │   ├── analyzeController.js # AI text scam analyzer controller
        │   ├── reportController.js  # Scam blacklist reports controller
        │   └── verifyController.js  # Domain verification controller
        ├── db/
        │   └── schema.sql           # MySQL tables & initial seed data
        ├── routes/
        │   ├── analyzeRoutes.js     # /api/analyze route definitions
        │   ├── reportRoutes.js      # /api/reports route definitions
        │   └── verifyRoutes.js      # /api/verify route definitions
        ├── services/
        │   └── aiService.js         # Gemini API caller + heuristic fallback
        └── server.js                # Express app entry point & health check
```

---

## ⚙️ Prerequisites

Before getting started, make sure you have installed:
1. **Node.js** (v18 or higher recommended; v24 installed)
2. **Git**
3. **MySQL Server** (Local installation or MySQL Workbench / XAMPP)

---

## 🛠️ Installation & Setup Guide

### 1. Clone & Open the Workspace
```bash
git clone <your-github-repo-url>
cd Internsheild
```

### 2. Configure Environment Variables
Copy the template to your backend environment file:
```bash
cp backend/.env.example backend/.env
```
Open `backend/.env` and update:
- `DB_USER` and `DB_PASSWORD` for your local MySQL instance.
- `GEMINI_API_KEY`: Server-side API key for Google Gemini (obtained from [Google AI Studio](https://aistudio.google.com/)).
- `GEMINI_MODEL`: Model name (default: `gemini-1.5-flash`).
- `AI_TIMEOUT_MS`: Execution timeout in ms (default: `8000`).

> ℹ️ **Zero Configuration Fallback Mode**: Even without an API key or when offline, the built-in deterministic rule-based threat engine evaluates all 8 threat vectors automatically!

### 3. Initialize MySQL Database (Optional for Testing)
Run the schema script in your MySQL shell or import it into MySQL Workbench:
```bash
mysql -u root -p < database/schema.sql
```
*Note: The backend gracefully continues running and falls back gracefully if MySQL is temporarily offline during testing.*

### 4. Run Automated Test Suite
Verify that the AI service, validation schema, scoring logic, and fallback engine pass all checks:
```bash
cd backend
npm test
```
*All 8 test suites (safe offer evaluation, critical fee scam, Telegram task fraud, uncertainty vs facts, timeout race, schema validation, and URL static inspection) will execute.*

---

## 🚦 How to Run the Project

You will need **two terminal tabs**:

### Terminal 1: Run Backend API
```bash
cd backend
npm run dev
```
> The API will start on: **`http://localhost:5000`**  
> Health check endpoint: **`http://localhost:5000/api/health`**

### Terminal 2: Run Frontend UI
```bash
cd frontend
npm run dev
```
> The Vite development server will start on: **`http://localhost:5173`**

Open your browser and navigate to **`http://localhost:5173`** to test the platform!

---

## 🧪 Testing with Example Offers

### 1. Safe Legitimate Internship Offer (Low Risk)
Test with this authentic tech company offer payload in the Scanner or via curl:

```json
{
  "internshipTitle": "Software Engineering Intern (Summer 2026)",
  "companyName": "Microsoft India",
  "recruiterEmail": "university-hiring@microsoft.com",
  "companyWebsite": "https://careers.microsoft.com",
  "internshipDescription": "Qualifications: Enrolled in B.Tech/M.Tech Computer Science graduating in 2027. Strong algorithmic problem solving, data structures, and distributed systems. 2 rounds of coding assessment followed by 2 technical interview loops. No application fee or deposits.",
  "applicationUrl": "https://careers.microsoft.com/students/us/en/job/189201",
  "offeredStipend": "₹80,000 / month",
  "hasUpfrontFee": "no",
  "upfrontFeeAmount": "",
  "additionalDetails": "Application submitted directly via Microsoft university portal. Official recruiter verified on LinkedIn."
}
```
**Expected Result**:
- `risk_score`: 0 – 29 (**Low Risk**)
- `positive_indicators`: Enterprise domain matches website, structured technical screening rounds, zero fees.
- `warning_signs`: Minimal or none.

### 2. Critical Scam Offer (Mandatory Training Fee)
```json
{
  "internshipTitle": "Frontend React Developer Intern",
  "companyName": "Apex Cloud Tech Solutions",
  "recruiterEmail": "apex-hr-recruiting@gmail.com",
  "companyWebsite": "https://apexcloud-tech.online",
  "internshipDescription": "Congratulations! You have been selected without technical interviews. We offer Rs. 25,000/month. You are required to deposit Rs. 2,499 for mandatory training materials and corporate laptop insurance prior to offer letter dispatch.",
  "applicationUrl": "https://bit.ly/apex-apply-2026",
  "offeredStipend": "₹25,000 / month",
  "hasUpfrontFee": "yes",
  "upfrontFeeAmount": "2499",
  "additionalDetails": "Recruiter contacted via WhatsApp and insisted on immediate payment within 2 hours."
}
```
**Expected Result**:
- `risk_score`: 85 – 100 (**Critical Risk**)
- `recommended_actions`: **"IMMEDIATELY CEASE PAYMENT"** emergency advisory.
- `warning_signs`: Upfront payment demanded, free webmail recruiter, direct selection without interview.

---

## 🔌 API Endpoints Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Service health status, DB connectivity & AI provider readiness |
| `POST` | `/api/scans/analyze` | Full structured 8-vector threat scan (AI + Fallback) |
| `GET` | `/api/scans/history` | Authenticated student's private scan history |
| `GET` | `/api/scans/:id` | Retrieve single private scan with ownership verification |
| `DELETE` | `/api/scans/:id` | Delete scan record (enforces ownership) |
| `GET` | `/api/verify/domain?domain=...` | Verify corporate domain / recruiter email |
| `GET` | `/api/reports` | Community fraud blacklist directory |
| `POST` | `/api/reports` | Submit community scam report with evidence |

---

## 📖 Scoring Methodology & Ethical Limitations

For full details on the 8 evaluated threat dimensions, mathematical vector weights, uncertainty handling, and zero active execution guarantees, refer to:
👉 [Scoring Methodology Documentation](backend/docs/SCORING_METHODOLOGY.md)
