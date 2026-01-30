Project Plan – Project Management System

Goal: Provide a complete implementation plan (Front‑End + Back‑End) based on the PDF spec.

---
Phase 1: Requirements Analysis
- [x] Extract detailed requirements from the document (roles, pages, features)
- [x] Define MVP scope and out‑of‑scope items
- [x] Define roles and access levels (team member, project manager, optional admin)
- [x] Define core entities and relationships (project, task, resources, user, report, message)

Phase 2: UX/UI Design
- [x] Site map and user flows
- [x] Wireframes for key pages:
- [x] User profile (assigned tasks, status, history, resources)
- [x] Project management for managers
- [x] Project tasks
- [x] Resource allocation (manual)
- [x] Reports and analytics
- [x] Notifications and messages
- [x] Shared UI components (top bar, navigation, tables, cards, charts)

Phase 3: Technical Setup
- [x] Select technologies (Express + TS + Prisma + SQLite + Vue)
- [x] Repository and folder structure
- [x] Environment configuration (ENV, lint/format)
- [x] API routes definition (REST)

Phase 4: Back‑End
- [x] Authentication (register/login/token)
- [x] Roles and access control
- [x] Projects CRUD
- [x] Tasks CRUD
- [x] Resource management
- [x] Search & filters for projects/tasks
- [x] File management
- [x] Notifications & messages
- [x] Reports & analytics
- [x] Input validation and error handling
- [x] Basic logging/monitoring

Phase 5: Front‑End
- [x] Login/registration page
- [x] User dashboard (projects/tasks overview)
- [x] Profile page
- [x] Project management (list/create/edit)
- [x] Project details
- [x] Project tasks (create/edit/assign/track)
- [x] Resource allocation (manual + charts placeholder)
- [x] Reports (progress, cost, resources)
- [x] Notifications/messages
- [x] Status UI (in progress / done / on hold)
- [x] Client‑side form validation

Phase 6: Testing & QA
- [x] Unit tests for key back‑end services
- [x] API tests (Postman/Insomnia)
- [x] UI flow tests
- [x] Role & permission tests
- [x] Basic performance checks

Phase 7: Deployment & Delivery
- [ ] Build production front‑end
- [ ] Deploy back‑end and DB
- [ ] Security basics (CORS, rate‑limit, …)
- [ ] API documentation & usage guide
- [ ] Final demo/report

---
Expected Outputs
- System architecture (entities + flows)
- MVP demo
- Short technical & user documentation
