# CivicSolve

**CivicSolve** is a real-time, crowdsourced civic issue reporting and resolution system that lets citizens submit complaints (potholes, water leaks, garbage, broken streetlights, etc.) through a web app. The system automatically validates, classifies, prioritises and routes each complaint to the correct municipal department.

**Project ID:** SKIT/CSE/2023-2027/64 | Branch: CSE | Section: F  
**Session:** 2026-27 | Track: R&D / Innovation

---

## Team Members

| Name | Role | Expertise |
|---|---|---|
| Arun Kumar Yadav (Team Lead) | Database & API Integration | MongoDB, Cloud |
| Yogesh Acharya (Member 1) | Classification & Priority Engine | AI/Rule-Based Systems |
| Yogendra Jain (Member 2) | Backend & Workflow Engine | Node.js, Express |
| Kuldeep Singh Rathore (Member 3) | Frontend Development | React, UI/UX |

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React 19, Vite, Tailwind CSS 4 | Citizen app & authority dashboard |
| Backend | Node.js 20, Express 5 | REST API server |
| Database | MongoDB 7, Mongoose 8 | Issue storage & history |
| AI/Rules | Rule-based classification engine | Issue categorisation & priority |
| DevOps | Docker, Docker Compose | Local MongoDB, deployment |

---

## Repository Structure

```
civicsolve/
├── client/                  # React + Vite + Tailwind frontend
│   └── src/
│       ├── components/      # Reusable UI components
│       ├── pages/           # Dashboard, ReportIssue, IssueDetail
│       └── services/        # Axios API client
│
├── server/                  # Node.js + Express REST API
│   └── src/
│       ├── config/          # MongoDB connection
│       ├── controllers/     # Route handlers (issues, departments, analytics)
│       ├── middleware/       # Error handler, validation
│       ├── models/          # Mongoose schemas
│       ├── routes/          # Express routers
│       ├── services/        # Classification engine, priority scoring
│       └── utils/           # HTTP error helper
│
├── docs/                    # API reference, architecture, roadmap
├── weekly_reports/          # Weekly progress report PDFs (Form-3)
├── docker-compose.yml       # MongoDB via Docker
└── README.md
```

---

## Quick Start

### Prerequisites
- Node.js 20+
- npm 10+
- MongoDB 7+ (local) **or** Docker Desktop

### 1. Clone the repository

```bash
git clone https://github.com/Yogesh-27/SKIT-CSE-2023-2027-64.git
cd SKIT-CSE-2023-2027-64
```

### 2. Install dependencies

```powershell
npm run install:all
```

### 3. Configure environment

```powershell
Copy-Item server/.env.example server/.env
```

Edit `server/.env` if your MongoDB URL is different.

### 4. Start MongoDB (Docker)

```bash
docker compose up -d mongo
```

Or start your local MongoDB service.

### 5. Seed the database (optional)

```bash
npm run seed
```

### 6. Start the API server

```bash
npm run dev:server
```

API: http://localhost:5000  
Health check: http://localhost:5000/api/health

### 7. Start the frontend (new terminal)

```bash
npm run dev:client
```

App: http://localhost:5173

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/issues` | List issues (filterable by status, priority, category, department) |
| GET | `/api/issues/:id` | Get a single issue |
| POST | `/api/issues` | Submit a new civic issue |
| PATCH | `/api/issues/:id/status` | Update issue status (workflow) |
| PATCH | `/api/issues/:id/upvote` | Upvote an existing issue |
| GET | `/api/departments` | List departments and their categories |
| GET | `/api/analytics/summary` | Get dashboard analytics summary |

---

## Classification Engine

The rule-based classification engine (written by Yogesh Acharya) categorises civic issues using keyword matching with support for both English and Hinglish terms:

| Category | Example Keywords |
|---|---|
| Roads & Potholes | pothole, gaddha, sadak, broken road |
| Water Supply | paani, water leakage, pipeline, no water |
| Sanitation & Garbage | kachra, garbage, dustbin, dump |
| Electricity & Street Lights | bijli, streetlight, power cut, transformer |
| Drainage & Sewage | nali, drain, sewage, waterlogging |
| Public Safety | fire, accident, open manhole, collapsed |
| Parks & Public Spaces | park, fallen tree, encroachment |

Priority is scored 0–100 based on:
- **Category base weight** (Public Safety = 40, Water = 30, Electricity = 30 …)
- **Urgency keywords** (live wire +20, fire +15, open manhole +15 …)
- **Community upvotes** (+5 per upvote, max +20)
- **Photo evidence** (+5)

---

## Duplicate Detection

When a new report is submitted with GPS coordinates, the system checks for existing open issues within **50 metres** in the same category. If found, the report is merged as an upvote rather than a duplicate complaint.

---

## Sprint Progress

| Sprint | Name | Status |
|---|---|---|
| 1 | Backend & Workflow Engine | ✅ In Progress (Sprints 1–4 complete) |
| 2 | Frontend Development | ✅ In Progress |
| 3 | Classification & Priority Engine | ✅ Core complete |
| 4 | Database & API Integration | ✅ Schema + CRUD complete |

See [docs/roadmap.md](docs/roadmap.md) for detailed task breakdown.

---

## SDG Mapping

**SDG 11 — Sustainable Cities and Communities:**  
CivicSolve directly contributes to making cities inclusive, safe, resilient and sustainable by improving the speed and transparency of civic issue resolution.
