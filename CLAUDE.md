# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Commands

### Development Setup
```bash
# Quick start with Docker Compose
docker-compose up -d

# Manual setup - Backend
cd backend
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload

# Manual setup - Frontend
cd frontend
npm install
npm start

# Access points
# Frontend: http://localhost:3000
# Backend: http://localhost:8000
# Database: localhost:5432
```

### Testing & Quality
```bash
# Backend tests
cd backend
pytest tests/

# Frontend tests
cd frontend
npm test

# Backend linting
cd backend
black .
flake8 .

# Frontend linting
cd frontend
npm run lint
npm run format
```

### Database Operations
```bash
# Create new migration
cd backend
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Rollback migration
alembic downgrade -1
```

## Architecture Overview

### Tech Stack
- **Backend**: FastAPI + SQLAlchemy + PostgreSQL
- **Frontend**: React + TypeScript + Tailwind CSS
- **Auth**: Firebase Authentication (JWT tokens)
- **DevOps**: Docker + Kubernetes (k3s)

### Key Architecture Patterns
- **RESTful API**: FastAPI with automatic OpenAPI docs at `/docs`
- **JWT Authentication**: Firebase tokens verified on backend
- **Database**: SQLAlchemy ORM with Alembic migrations
- **Frontend**: React Router + Context API for auth state
- **Real-time**: WebSockets planned for live updates

### Project Structure
```
backend/
├── app/
│   ├── main.py              # FastAPI app initialization
│   ├── core/                # Core configurations
│   │   ├── config.py        # Settings management
│   │   ├── database.py      # SQLAlchemy setup
│   │   ├── auth.py          # Firebase JWT verification
│   │   └── security.py      # Security utilities
│   ├── models/              # SQLAlchemy models
│   ├── schemas/             # Pydantic request/response models
│   ├── routers/             # API route handlers
│   └── services/            # Business logic layer
├── alembic/                 # Database migrations
└── tests/                   # Backend tests

frontend/
├── src/
│   ├── App.tsx              # Main React app with routing
│   ├── context/             # React Context providers
│   │   └── AuthContext.tsx  # Firebase auth state
│   ├── pages/               # Route components
│   ├── components/          # Reusable UI components
│   ├── services/            # API client & Firebase integration
│   └── types/               # TypeScript type definitions
└── package.json             # Frontend dependencies
```

### Database Schema
- **users**: Firebase UID, email, display_name, household_id
- **households**: name, admin_id, invite_code
- **chores**: household_id, title, description, due_date, is_recurring
- **chore_assignments**: chore_id, user_id, status, completed_at

### Authentication Flow
1. Client signs in with Firebase (frontend)
2. Firebase returns JWT token
3. Client includes token in `Authorization: Bearer <token>` header
4. Backend verifies token using Firebase Admin SDK
5. User record created/updated in database

### API Structure
- Base URL: `/api/v1`
- Main endpoints:
  - `POST /households/` - Create household
  - `POST /households/join` - Join with invite code
  - `GET /chores/` - Get household chores
  - `POST /chores/` - Create chore
  - `POST /chores/{id}/complete` - Mark complete

### Environment Configuration
Copy `.env.example` to `.env` and configure:
- **Backend**: Firebase service account keys, database URL
- **Frontend**: Firebase client config, API URL
- **Docker**: All variables in docker-compose.yml

### Development Notes
- Database migrations run automatically on Docker startup
- Backend hot-reloads with `--reload` flag
- Frontend uses React Scripts with hot reload
- CORS configured for localhost development
- All secrets managed via environment variables