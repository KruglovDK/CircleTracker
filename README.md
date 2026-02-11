# CircleTracker

[![Python](https://img.shields.io/badge/Python-3.14-3776AB?style=flat&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.128-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat&logo=postgresql&logoColor=white)](https://postgresql.org)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

A modern expense tracking application with group functionality. Track personal expenses, manage categories, and share costs with friends and family.

## ✨ Features

- **User Authentication** — JWT-based auth with access and refresh tokens
- **Transaction Management** — Track income and expenses with categories
- **Group Expenses** — Create groups and share expenses with other users
- **Categories** — Global and personal categories for better organization
- **Invite System** — Invite users to groups with accept/decline functionality
- **Dashboard** — Visual charts and statistics for expense analysis
- **Dark Theme** — Modern dark UI design

## 🛠️ Tech Stack

### Backend
- **Language**: Python 3.14
- **Framework**: FastAPI
- **Database**: PostgreSQL 16
- **ORM**: psycopg3 (async, raw SQL)
- **Auth**: JWT (PyJWT + bcrypt)
- **Validation**: Pydantic v2
- **Package Manager**: uv

### Frontend
- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite
- **Styling**: CSS Modules
- **Charts**: Recharts
- **Icons**: Lucide React
- **HTTP Client**: Axios

## 📁 Project Structure

```
CircleTracker/
├── src/
│   └── circle_tracker/
│       ├── main.py              # FastAPI app entry
│       ├── config.py            # Configuration
│       ├── database.py          # DB connection pool
│       ├── dependencies.py      # FastAPI dependencies
│       ├── auth/                # Authentication module
│       ├── users/               # Users module
│       ├── categories/          # Categories module
│       ├── transactions/        # Transactions module
│       ├── groups/              # Groups & invites module
│       └── custom_items/        # Custom items module
├── frontend/
│   ├── src/
│   │   ├── api/                 # API client
│   │   ├── components/          # React components
│   │   ├── context/             # Auth context
│   │   ├── pages/               # Page components
│   │   └── types/               # TypeScript types
│   └── package.json
├── migrations/
│   └── 001_initial.sql          # Database schema
├── docker-compose.yml           # PostgreSQL for development
├── docker-compose.full.yml      # docker-compose for profuction
├── pyproject.toml
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Python 3.14+
- Node.js 20+
- PostgreSQL 16+ (or Docker)
- [uv](https://github.com/astral-sh/uv) package manager

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/KruglovDK/CircleTracker.git
cd CircleTracker
```

2. **Set up environment variables**

```bash
cp .env.example .env
```

Edit `.env` file:

```env
DB_HOST=localhost
DB_PORT=5433
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=circle_tracker

JWT_SECRET=your-secret-key-change-in-production
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30
JWT_REFRESH_TOKEN_EXPIRE_DAYS=7

DEBUG=false
```

3. **Start PostgreSQL**

```bash
docker compose up -d
```

4. **Run database migrations**

```bash
docker compose exec -T postgres psql -U postgres -d circle_tracker < migrations/001_initial.sql
```

5. **Install backend dependencies**

```bash
uv sync
```

6. **Run the backend**

```bash
uv run uvicorn circle_tracker.main:app --reload
```

Backend will be available at `http://localhost:8000`

7. **Install frontend dependencies**

```bash
cd frontend
npm install
```

8. **Run the frontend**

```bash
npm run dev
```

Frontend will be available at `http://localhost:5173`

## 🐳 Docker Deployment

### Full Stack with Docker Compose

1. **Build and run all services**

```bash
docker compose -f docker-compose.full.yml up -d --build
```

2. **Run migrations**

```bash
docker compose -f docker-compose.full.yml exec -T postgres psql -U postgres -d circle_tracker < migrations/001_initial.sql
```

3. **Access the application**

- Frontend: `http://localhost`
- Backend API: `http://localhost:8000`
- API Docs: `http://localhost:8000/docs`

### Environment Variables for Docker

Create `.env` file in the project root:

```env
DB_USER=postgres
DB_PASSWORD=your_secure_password
DB_NAME=circle_tracker
DB_PORT=5433
JWT_SECRET=your-super-secret-key
DEBUG=false
```

## 📚 API Documentation

Once the backend is running, access the interactive API documentation:

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

### Main Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login and get tokens |
| POST | `/auth/refresh` | Refresh access token |
| GET | `/users/me` | Get current user |
| GET | `/categories` | List categories |
| POST | `/categories` | Create category |
| GET | `/transactions` | List transactions |
| POST | `/transactions` | Create transaction |
| GET | `/groups` | List user groups |
| POST | `/groups` | Create group |
| POST | `/groups/{id}/invites` | Invite user to group |
| GET | `/invites` | List pending invites |
| POST | `/invites/{id}/accept` | Accept invite |
| POST | `/invites/{id}/decline` | Decline invite |

## 🧪 Development

### Running Backend Tests

```bash
uv run pytest
```

### Linting Backend

```bash
uv run ruff check src/
uv run ruff format src/
```

### Type Checking

```bash
uv run ty check src/
```

### Building Frontend

```bash
cd frontend
npm run build
```

## 🗺️ Roadmap

- [ ] Email verification
- [ ] Password reset
- [ ] Budget planning
- [ ] Recurring transactions
- [ ] Export to CSV/PDF
- [ ] Mobile app / Telegram bot
- [ ] Multi-currency support

## 📄 License

This project is licensed under the MIT License.

## 👤 Author

**Danil Kruglov**

- GitHub: [@KruglovDK](https://github.com/KruglovDK)
