Project Plan (Stack: Express + TypeScript + Prisma + SQLite)

Goal: Switch back to Prisma and define the tasks needed for a complete implementation.

---
Phase 0: Environment Setup
- [x] Verify Node.js and npm are installed
- [x] Install Prisma CLI and @prisma/client
- [x] Create .env and set DATABASE_URL for SQLite
- [x] Prepare dev/build/test scripts

Phase 1: Back‑End Setup
- [x] Create Express + TypeScript structure
- [x] Configure tsconfig and scripts
- [x] Set up Prisma and create schema.prisma
- [x] Run initial migration and create SQLite DB
- [x] Enable Swagger API docs

Phase 2: Data Model & Migrations
- [x] Define models: User / Project / Task / Resource / Report / Notification / File
- [x] Define relations (ProjectManager, ProjectMember, TaskAssignee)
- [x] Create migration + generate client
- [x] Seed sample data (admin/manager)

Phase 3: Authentication & Roles
- [x] Register / Login / Me
- [x] JWT auth middleware
- [x] Role policies (admin/manager/member)
- [x] Role‑based access tests

Phase 4: Projects CRUD
- [x] Create project
- [x] Update/delete project
- [x] List & filter projects
- [x] Manage project members

Phase 5: Tasks CRUD
- [x] Create tasks per project
- [x] Update/delete tasks
- [x] Task status updates
- [x] List & filter tasks

Phase 6: Resources & Reports
- [x] Create/update/delete resources
- [x] Project progress reports
- [x] Cost/resource reports

Phase 7: Notifications & Files
- [x] Create/read notifications
- [x] Upload/download project files

Phase 8: Testing & QA
- [ ] Back‑end unit tests (Jest)
- [ ] API tests (Postman/Insomnia)
- [ ] Protected routes & role tests

Phase 9: Release
- [ ] Production build
- [ ] API docs + runbook
- [ ] Demo preparation
