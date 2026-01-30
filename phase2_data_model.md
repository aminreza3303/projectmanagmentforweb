Phase 2 - Data Model & Migrations

Status
- Models and relations are defined in `backend/prisma/schema.prisma`.
- Migration has been applied to SQLite.
- Seed script exists to populate demo data.

Seed
```
cd backend
npx prisma db seed
```

Seeded Accounts (password: 123456)
- admin@example.com (admin)
- manager1@example.com ... manager5@example.com (manager)
- user1@example.com ... user10@example.com (member)

Seeded Catalog
- 10 equipment items in the resource catalog (ResourceItem)
