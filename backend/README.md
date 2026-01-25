# Police Cases Backend

Simple Express backend providing CRUD APIs for police cases. Uses PostgreSQL and JWT-based admin authentication.

Setup

1. Copy `.env.example` to `.env` and set `DATABASE_URL` and admin credentials.
2. Create the database and run `backend/sql/init.sql` to create the table and seed data.
3. Install dependencies and start:

```powershell
cd backend
npm install
npm run dev
```

API

- POST `/api/auth/login` { username, password } -> { token }
- GET `/api/cases` (Authorization: Bearer <token>)
- POST `/api/cases` (Authorization) { county, case_type, details }
- PUT `/api/cases/:id` (Authorization)
- DELETE `/api/cases/:id` (Authorization)
