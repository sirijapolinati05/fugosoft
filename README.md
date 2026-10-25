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

## Running the Project

### 1. Backend (FastAPI + PostgreSQL)
```bash
cd backend
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```
API Documentation will be available at: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

### 2. Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
Web App will be running at: [http://127.0.0.1:5173](http://127.0.0.1:5173)
