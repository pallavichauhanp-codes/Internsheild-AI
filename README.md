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
- `GEMINI_API_KEY` with your free Google Gemini API key (optional: a built-in heuristic fallback runs even without an API key).

### 3. Initialize MySQL Database
Run the schema script in your MySQL shell or import it into MySQL Workbench:
```bash
mysql -u root -p < backend/src/db/schema.sql
```
*Note: The backend gracefully runs in demo fallback mode even if MySQL is temporarily offline during initial testing.*

### 4. Install Dependencies
Dependencies have already been locked and initialized:
```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
```

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

## 🔌 API Endpoints Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Service health status and environment check |
| `POST` | `/api/analyze` | AI fraud scan on job description / offer text |
| `GET` | `/api/verify/domain?domain=...` | Verify corporate authenticity of email/domain |
| `GET` | `/api/reports` | Retrieve list of community-reported scams |
| `POST` | `/api/reports` | Submit a new scam report |

---

## 📋 Hackathon Implementation Roadmap
- [x] **Phase 1: Project Scaffolding & Setup** (Current)
  - Clean separation of `frontend/` and `backend/`.
  - Dependencies installed (`react`, `vite`, `express`, `mysql2`, `@google/generative-ai`, `lucide-react`).
  - Dark mode design system with CSS variables.
  - MySQL database schema script.
- [ ] **Phase 2: Core Feature Implementation**
  - Offer letter PDF/Text upload parser.
  - Advanced prompt engineering with scoring breakdown (Salary vs Role authenticity, Recruiter legitimacy, Urgency traps).
  - MySQL CRUD integration for user reports and upvoting.
- [ ] **Phase 3: Testing & Hackathon Presentation Polish**
  - Sample test cases with real scam offer comparisons.
  - Interactive pitch demo deck.
