Environment Setup

Backend (.env)
- NODE_ENV
- PORT
- DATABASE_URL (SQLite, use absolute path on macOS if migrations fail)
- JWT_SECRET
- JWT_EXPIRES_IN
- REFRESH_TOKEN_SECRET (optional)
- REFRESH_TOKEN_EXPIRES_IN (optional)
- LOW_RESOURCE_THRESHOLD (optional, default=1)

Frontend (.env)
- VITE_API_BASE_URL

Code Quality
- ESLint + Prettier (optional / not yet configured)
- TypeScript strict
