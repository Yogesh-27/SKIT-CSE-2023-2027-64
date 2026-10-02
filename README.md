# CivicSolve

CivicSolve is a Smart Civic Issue Reporting System that allows citizens to submit civic complaints with text, photo evidence, and GPS location. The system validates the report, classifies the issue using a rule-based engine, calculates priority, detects possible duplicate complaints, and routes the complaint to the appropriate municipal department.

## Current scope

The initial codebase implements the foundation for:

* Citizen issue submission
* Text-based rule classification
* Priority scoring
* Department routing
* Duplicate complaint detection
* MongoDB data model
* Authority dashboard API
* React frontend scaffold

### Explicitly not implemented yet

* Real-time complaint tracking
* Direct integration with government databases
* AI/deep-learning image recognition
* Authentication/authorization
* Production cloud deployment

These can be added in later modules.

## Architecture

```text
civicsolve/

├── client/                  # React + Vite + Tailwind frontend
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── services/
│       ├── App.jsx
│       └── main.jsx

├── server/                  # Node.js + Express REST API
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── middleware/
│       ├── models/
│       ├── routes/
│       ├── services/
│       ├── utils/
│       └── app.js

├── docs/
├── .env.example
├── docker-compose.yml
└── package.json
```

## Requirements

* Node.js 20+
* npm 10+
* MongoDB 7+ (local or Docker)

## Run locally

### 1. Install dependencies

```bash
npm install
npm install --prefix client
npm install --prefix server
```

### 2. Configure environment

```bash
cp server/.env.example server/.env
```

On Windows PowerShell:

```powershell
Copy-Item server/.env.example server/.env
```

Update the MongoDB URL if required.

### 3. Start MongoDB

Using Docker:

```bash
docker compose up -d mongo
```

### 4. Start the API

```bash
npm run dev:server
```

API: `http://localhost:5000`

Health check: `http://localhost:5000/api/health`

### 5. Start the frontend

In another terminal:

```bash
npm run dev:client
```

Frontend: `http://localhost:5173`

## API endpoints

| Method | Endpoint                 | Purpose              |
| ------ | ------------------------ | -------------------- |
| GET    | `/api/health`            | API health check     |
| GET    | `/api/issues`            | List reported issues |
| GET    | `/api/issues/:id`        | Get one issue        |
| POST   | `/api/issues`            | Submit a new issue   |
| PATCH  | `/api/issues/:id/status` | Update issue status  |
| GET    | `/api/departments`       | List departments     |

## Initial classification rules

The rule engine currently recognizes common civic issue keywords such as:

* pothole / road damage → Roads & Infrastructure
* garbage / waste / litter → Sanitation
* water leakage / pipeline → Water Supply
* streetlight / light outage → Public Utilities
* drain / sewage → Drainage & Sewerage

Priority is calculated from factors such as issue category, emergency keywords, description length, and location availability.

## Duplicate complaint detection

CivicSolve also checks whether a newly submitted complaint may already have been reported.

Duplicate detection can consider:

* Similar issue descriptions
* Same or similar issue category
* Nearby GPS locations
* Recently submitted complaints

If a possible duplicate is detected, the system can flag the complaint and associate it with the existing report instead of treating it as a completely separate civic issue.

This helps reduce duplicate reports and gives authorities a clearer picture of the actual number of civic problems in an area.

This is deliberately a transparent rule-based baseline. A future ML image-classification module can be added without replacing the API contract.
