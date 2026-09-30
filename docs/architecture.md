# CivicSolve Architecture

## Initial architecture

```text
                    ┌──────────────────────┐
                    │     React Client     │
                    │  Citizen + Authority │
                    └──────────┬───────────┘
                               │ REST API
                               ▼
                    ┌──────────────────────┐
                    │  Express API Server  │
                    └──────────┬───────────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                ▼
       Validation       Classification      Workflow/
                         & Priority           Routing
              │                │                │
              └────────────────┼────────────────┘
                               ▼
                    ┌──────────────────────┐
                    │       MongoDB        │
                    └──────────────────────┘
```

## Processing pipeline

1. Citizen submits title, description, and optional GPS coordinates.
2. API validates the request.
3. Rule-based classification identifies the issue category.
4. Priority engine assigns a score from 0–100.
5. The category maps the issue to a municipal department.
6. The issue is persisted in MongoDB.
7. The authority dashboard displays and updates the workflow status.

## Extension points

- `server/src/services/classificationEngine.js` can later be replaced or extended with ML classification.
- `Issue.imageUrl` provides an initial data-model field for future image upload.
- A map component can consume `issue.location`.
- Authentication middleware can be added before protected authority routes.
- Real-time tracking should be implemented as a future module rather than treated as part of the initial implementation.
