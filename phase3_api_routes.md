API Routes (REST)

Auth
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/logout
- GET  /api/auth/me

Users (Admin)
- GET  /api/users
- GET  /api/users/{id}
- POST /api/users
- PUT  /api/users/{id}
- DELETE /api/users/{id}

Users (Assignable / Managers)
- GET /api/users/assignable
- GET /api/users/managers
- GET /api/users/me/tasks
- GET /api/users/me/resources

Projects
- GET  /api/projects
- GET  /api/projects/{id}
- POST /api/projects
- PUT  /api/projects/{id}
- PATCH /api/projects/{id}/status
- DELETE /api/projects/{id}
- POST /api/projects/{id}/members
- DELETE /api/projects/{id}/members/{userId}
- GET  /api/projects/{id}/members
- GET  /api/projects/{id}/files

Tasks
- GET  /api/projects/{id}/tasks
- POST /api/projects/{id}/tasks
- GET  /api/tasks/{id}
- PUT  /api/tasks/{id}
- DELETE /api/tasks/{id}
- PATCH /api/tasks/{id}/status

Notes
- When a task is assigned, the assignee is auto-added to project members.
- Project status can be updated by admins, project managers, or project members.
- Task status can be updated by admins, project managers, or the assignee.

Resources
- GET  /api/resources/catalog
- POST /api/resources/catalog
- GET  /api/projects/{id}/resources
- POST /api/projects/{id}/resources
- PUT  /api/resources/{id}
- DELETE /api/resources/{id}

Reports
- GET  /api/reports
- GET  /api/reports/{id}
- POST /api/reports
- GET  /api/reports/summary

Notifications
- GET  /api/notifications
- POST /api/notifications
- PATCH /api/notifications/{id}/read

Files
- POST /api/files
- GET  /api/files/{id}
- DELETE /api/files/{id}
