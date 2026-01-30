Phase 6 – Testing & QA

Back‑End Tests
- backend/test/auth.test.ts
- backend/test/projects.test.ts
- backend/test/tasks.test.ts

Run Tests
```
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name init
npm test
```

Manual UI Tests
- Login/register
- Create project and view list
- Create task and update status
- Create report and view list
- View notifications and mark as read

Role Tests
- member cannot create project
- manager can create project
- admin can access /api/users

Notes
- Tests use the local SQLite DB; data is cleaned after tests.
