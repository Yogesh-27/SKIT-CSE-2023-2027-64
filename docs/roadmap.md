# Development Roadmap — CivicSolve
**Project:** SKIT/CSE/2023-2027/64 | Session: 2026-27

---

## Sprint 1 — Backend Architecture & Workflow Engine
**Owner:** Yogendra Jain (Member 2) | **Start:** 10/08/26

- [x] Backend architecture layout — planned models, APIs and workflow design
- [x] Preprocessing pipeline — input validation, text normalisation
- [x] Workflow engine & logic — status transitions (submitted → in_review → assigned → in_progress → resolved)
- [x] DB setup & schema design — MongoDB Issue schema with history, SLA, upvotes, timestamps
- [x] Upvote endpoint — `PATCH /api/issues/:id/upvote`
- [ ] Citizen App & Authority API integration (due 2/1/27)
- [ ] Authentication middleware (JWT / session) (due 2/1/27)
- [ ] Testing, optimisation, deployment (due 3/2/27 → 15/3/27)

---

## Sprint 2 — Classification & Priority Engine
**Owner:** Yogesh Acharya (Member 1) | **Start:** 10/08/26

- [x] Rule-based classification engine — 7 categories + General Complaint
- [x] English + Hinglish keyword support (paani, bijli, kachra, gaddha, nali, sadak...)
- [x] Title-weighted keyword matching (title words count double)
- [x] Priority scoring (category weight + urgency bonus + upvotes + photo)
- [x] Confidence score & matched keywords returned per classification
- [x] SLA hours assigned per priority level (critical 6h, high 24h, medium 72h, low 168h)
- [x] Priority recalculation on upvote
- [ ] Classifier accuracy tests / unit tests (due 2/1/27)
- [ ] Testing & optimisation (due 3/2/27 → 15/3/27)

---

## Sprint 3 — Database & API Integration
**Owner:** Arun Kumar Yadav (Team Lead) | **Start:** 10/08/26

- [x] MongoDB Issue schema with full fields: history, priorityReasons, slaHours, dueBy, upvotes
- [x] Database indexes for performance (status, category, location, createdAt)
- [x] CRUD API — GET /issues, GET /issues/:id, POST /issues, PATCH /issues/:id/status
- [x] Upvote API — PATCH /api/issues/:id/upvote
- [x] Analytics API — GET /api/analytics/summary (KPIs, by-status, by-category, by-priority)
- [x] Department listing API — GET /api/departments
- [x] Database seeder with 18 realistic Jaipur civic issues
- [ ] Citizen App auth integration (due 2/1/27 → 2/2/27)
- [ ] Final testing & deployment (due 3/2/27 → 15/3/27)

---

## Sprint 4 — Frontend Development
**Owner:** Kuldeep Singh Rathore (Member 3) | **Start:** 10/08/26

- [x] React + Vite + Tailwind CSS 4 project setup
- [x] Navigation with NavLink highlighting
- [x] Citizen Report Form page (`/report`)
  - [x] Title + description with character counter
  - [x] GPS "Use my location" button
  - [x] Submission with classification feedback
- [x] Authority Dashboard page (`/`)
  - [x] KPI stat cards (total, high priority, pending, resolved)
  - [x] Search bar (searches title, description, department, category)
  - [x] Status, category and priority filter dropdowns
  - [x] Issue table with inline status change
  - [x] Click-to-open issue detail modal
- [x] Issue Detail Modal
  - [x] Full issue info (title, description, category, department)
  - [x] Priority score breakdown (reasons list)
  - [x] SLA deadline display
  - [x] GPS → Google Maps link
  - [x] Status history timeline
  - [x] Upvote button (calls API, updates priority)
- [x] Reusable components: StatCard, CategoryBadge, UpvoteButton, IssueDetailModal
- [ ] Interactive map view (Google Maps / Leaflet) (due 2/1/27)
- [ ] Image upload UI with preview (due 2/1/27)
- [ ] Mobile / PWA improvements (due 3/2/27 → 15/3/27)

---

## Upcoming Milestones (per Form-1 schedule)

| Sprint Name | Start | End | Goal |
|---|---|---|---|
| Citizen App & Authority Dashboard | 02/01/27 | 02/02/27 | Auth, map view, image upload |
| API Integration & System Integration | 02/02/27 | 03/03/27 | All systems integrated |
| Testing, Optimisation & Deployment | 03/03/27 | 15/03/27 | Final testing, hosted demo |

---

## Future Scope

- ML-based image classification for issue auto-detection from photos
- Multilingual interface (Hindi, Rajasthani)
- Real-time complaint tracking via WebSockets
- Smart City / IoT sensor data integration
- Government database (e-governance) integrations
- Push notifications for status updates
