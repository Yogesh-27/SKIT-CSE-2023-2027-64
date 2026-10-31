# CivicSolve — API Reference

**Base URL:** `http://localhost:5000`

All endpoints accept and return JSON. The Vite dev server proxies `/api` → `http://localhost:5000` so frontend code simply uses `/api/...`.

---

## Health

### `GET /api/health`

Checks that the API server is running.

**Response**
```json
{
  "status": "ok",
  "service": "civicsolve-api",
  "version": "0.2.0",
  "timestamp": "2026-10-30T12:00:00.000Z"
}
```

---

## Issues

### `GET /api/issues`

Returns a list of civic issues, sorted by priority score descending then newest first.

**Query parameters**

| Parameter | Type | Description |
|---|---|---|
| `status` | string | Filter by status |
| `priority` | string | Filter by priority |
| `category` | string | Filter by category |
| `department` | string | Filter by department |
| `limit` | number | Max results (default 200, max 500) |

**Valid status values:** `submitted`, `in_review`, `assigned`, `in_progress`, `resolved`, `rejected`  
**Valid priority values:** `low`, `medium`, `high`, `critical`

**Response**
```json
{
  "issues": [ /* array of issue objects */ ],
  "total": 42
}
```

---

### `GET /api/issues/:id`

Fetch a single issue by its MongoDB ObjectId.

**Response**
```json
{
  "issue": { /* full issue object */ }
}
```

---

### `POST /api/issues`

Submit a new civic issue. The server automatically classifies the issue, calculates priority, assigns a department, and checks for duplicates.

**Request body**
```json
{
  "title":       "Large pothole near Sindhi Camp",
  "description": "There is a very large pothole causing accidents every day.",
  "latitude":    26.9124,
  "longitude":   75.7873,
  "imageUrl":    null
}
```

| Field | Required | Constraints |
|---|---|---|
| `title` | ✅ | 5–120 characters |
| `description` | ✅ | 15–2000 characters |
| `latitude` | ❌ | -90 to 90 (required if longitude provided) |
| `longitude` | ❌ | -180 to 180 (required if latitude provided) |
| `imageUrl` | ❌ | String URL or null |

**Response (new issue)**
```json
{
  "duplicate": false,
  "issue": { /* full issue object */ }
}
```

**Response (duplicate detected — merged as upvote)**
```json
{
  "duplicate": true,
  "message": "A matching open issue was found within 50 metres. Your report has been added as an upvote.",
  "issue": { /* updated existing issue */ }
}
```

---

### `PATCH /api/issues/:id/status`

Updates an issue's workflow status. Only valid transitions are allowed.

**Workflow transitions**
```
submitted   → in_review, assigned, rejected
in_review   → assigned, rejected
assigned    → in_progress, rejected
in_progress → resolved, assigned
resolved    → (terminal)
rejected    → (terminal)
```

**Request body**
```json
{
  "status": "in_review",
  "note":   "Issue verified by field officer."
}
```

---

### `PATCH /api/issues/:id/upvote`

Adds a community upvote to an issue, which recalculates its priority score.

No request body needed.

**Response**
```json
{
  "issue": { /* updated issue with new upvotes count and priority */ }
}
```

---

## Departments

### `GET /api/departments`

Returns all departments with their assigned issue categories.

**Response**
```json
{
  "departments": [
    {
      "name": "Public Works Department (PWD)",
      "categories": ["Roads & Potholes"]
    }
  ]
}
```

---

## Analytics

### `GET /api/analytics/summary`

Returns aggregated statistics for the authority dashboard.

**Response**
```json
{
  "kpi": {
    "total": 42,
    "pending": 28,
    "resolved": 12,
    "rejected": 2,
    "highPriority": 8,
    "resolvedLast7Days": 5
  },
  "byStatus": [
    { "status": "submitted", "count": 15 }
  ],
  "byCategory": [
    { "category": "Roads & Potholes", "count": 10 }
  ],
  "byPriority": [
    { "priority": "high", "count": 5 }
  ],
  "recentIssues": [ /* 5 most recent */ ]
}
```

---

## Issue Object Schema

```json
{
  "_id":              "ObjectId",
  "title":            "String (5-120 chars)",
  "description":      "String (15-2000 chars)",
  "category":         "Roads & Potholes | Water Supply | ...",
  "department":       "Public Works Department (PWD) | ...",
  "confidence":       0.85,
  "matchedKeywords":  ["pothole", "road"],
  "priority":         "low | medium | high | critical",
  "priorityScore":    72,
  "priorityReasons":  ["Category base score +25", "Urgency: pothole +10"],
  "slaHours":         24,
  "dueBy":            "ISO date string",
  "status":           "submitted | in_review | assigned | in_progress | resolved | rejected",
  "upvotes":          3,
  "location": {
    "latitude":  26.9124,
    "longitude": 75.7873
  },
  "imageUrl":         null,
  "history": [
    { "status": "submitted", "note": "Report received", "at": "ISO date" }
  ],
  "createdAt":        "ISO date",
  "updatedAt":        "ISO date"
}
```
