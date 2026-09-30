# API Contract

## POST /api/issues

Request:

```json
{
  "title": "Large pothole near main gate",
  "description": "A deep pothole is causing problems for vehicles.",
  "latitude": 26.842,
  "longitude": 75.565,
  "imageUrl": null
}
```

Response:

```json
{
  "issue": {
    "_id": "...",
    "title": "Large pothole near main gate",
    "description": "A deep pothole is causing problems for vehicles.",
    "category": "roads",
    "priority": "medium",
    "priorityScore": 35,
    "department": "Roads & Infrastructure",
    "status": "submitted"
  }
}
```

## PATCH /api/issues/:id/status

Request:

```json
{
  "status": "in_review"
}
```

Allowed values:

- `submitted`
- `in_review`
- `assigned`
- `resolved`
