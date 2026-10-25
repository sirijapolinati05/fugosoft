# FugoSoft HRMS

Full-stack Employee Management and Onboarding application with React + Vite + Tailwind CSS frontend and Python FastAPI + PostgreSQL backend.

## Project Structure

```
FugoSoft/
├── frontend/             # React + Vite + TypeScript + Tailwind CSS
│   ├── src/
│   │   ├── App.tsx       # Main HRMS dashboard & 6-step registration flow
│   │   ├── index.css     # Tailwind styling
│   │   └── main.tsx
│   ├── public/
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts    # Proxies /api to http://127.0.0.1:8000
│
├── backend/              # Python FastAPI + SQLAlchemy + PostgreSQL
│   ├── main.py           # FastAPI application endpoints
│   ├── models.py         # SQLAlchemy Employee model
│   ├── schemas.py        # Pydantic validation schemas
│   ├── database.py       # PostgreSQL database connection
│   ├── uploads/          # Uploaded employee documents
│   └── .env              # Environment config (DATABASE_URL, PORT)
│
└── README.md
```

### 1. Database Setup & Migration
1. Copy `backend/.env.example` to `backend/.env` and update your PostgreSQL credentials:
```bash
cp backend/.env.example backend/.env
```
2. Run the database migration script to automatically create/verify tables and columns:
```bash
cd backend
python migrate.py
```

### 2. Backend (FastAPI + PostgreSQL)
```bash
cd backend
python main.py
```
API Documentation will be available at: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

### 3. Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
Web App will be running at: [http://127.0.0.1:5173](http://127.0.0.1:5173)
