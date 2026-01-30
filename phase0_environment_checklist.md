Phase 0 – Environment Checklist

Current Status
- Node.js installed: v20.10.0
- npm installed: v10.2.3
- dev/build/test scripts present
- Prisma defined in package.json (requires npm install)
- .env.example present (copy to .env)

Remaining Steps
1) Install dependencies
```
cd backend
npm install
```

2) Create .env
```
cp .env.example .env
```

3) Initialize Prisma
```
npx prisma generate
npx prisma migrate dev --name init
```

Note: On macOS, Prisma migration may require an absolute path in DATABASE_URL.
Example:
DATABASE_URL=file:/Users/yourname/path/to/project/backend/dev.db

After these, Phase 0 is complete.
