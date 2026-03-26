# EduMesh 🌍

### Decentralized, AI-Personalized Learning for the Unconnected World

> *Bridging 300 million students to quality education — online or offline.*

EduMesh is a production-grade, AI-powered civic education platform that serves students with zero or low internet connectivity — adapting learning content in real-time to each student's pace, language, and knowledge gaps.

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                   CLIENT LAYER                      │
│  Progressive Web App (React + Vite)                 │
│  Works offline via Service Worker + IndexedDB       │
│  Supports: English, Hindi, Arabic, Bengali, Swahili │
└────────────────┬────────────────────────────────────┘
                 │ REST + WebSocket
┌────────────────▼────────────────────────────────────┐
│                   API GATEWAY                       │
│  Node.js / Express  ·  JWT Auth  ·  Rate Limiting   │
│  Role-based: Student | Mentor | Admin | NGO         │
└──────┬──────────────┬──────────────┬────────────────┘
       │              │              │
┌──────▼──────┐ ┌─────▼──────┐ ┌───▼──────────────────┐
│  AI SERVICE │ │  MENTOR    │ │  ANALYTICS SERVICE    │
│  (Python /  │ │  MATCHING  │ │  (Real-time dashboard)│
│  FastAPI)   │ │  SERVICE   │ │                       │
└──────┬──────┘ └─────┬──────┘ └───┬──────────────────┘
       │              │            │
┌──────▼──────────────▼────────────▼──────────────────┐
│                  DATABASE LAYER                     │
│  PostgreSQL  ·  Redis  ·  MongoDB  ·  IPFS/Polygon  │
└─────────────────────────────────────────────────────┘
```

## Prerequisites

- **Node.js** 20 LTS
- **Python** 3.11+
- **Docker** & **Docker Compose**
- **Git**

## Quick Start

```bash
# 1. Clone
git clone https://github.com/your-org/edumesh.git
cd edumesh

# 2. Environment
cp .env.example .env
# Edit .env with your API keys (OpenAI, DeepL, etc.)

# 3. Start all services
docker compose up -d

# 4. Run migrations & seed
cd backend
npm install
npx prisma migrate dev --name init
npx prisma db seed
cd ..

# 5. Start frontend
cd frontend
npm install
npm run dev

# 6. Open browser
# Frontend: http://localhost:3000
# Backend:  http://localhost:4000/api/health
# AI:       http://localhost:8000/health
```

### Demo Credentials

| Role    | Email                | Password      |
|---------|---------------------|---------------|
| Admin   | admin@edumesh.org   | password123   |
| NGO     | ngo@unicef.org      | password123   |
| Student | priya@student.in    | password123   |
| Mentor  | dr.kumar@mentor.in  | password123   |

---

## API Reference

### Auth (`/api/auth`)
| Method | Endpoint          | Description                    | Auth |
|--------|-------------------|-------------------------------|------|
| POST   | `/register`       | Create account                | No   |
| POST   | `/login`          | Login, get tokens             | No   |
| POST   | `/refresh`        | Refresh access token          | No   |
| POST   | `/logout`         | Invalidate refresh token      | Yes  |
| POST   | `/forgot-password`| Send OTP email                | No   |
| POST   | `/reset-password` | Verify OTP, update password   | No   |

### Student (`/api/student`)
| Method | Endpoint           | Description                     | Auth    |
|--------|--------------------|---------------------------------|---------|
| GET    | `/profile`         | Get learner profile             | Student |
| PUT    | `/profile`         | Update preferences              | Student |
| GET    | `/feed`            | AI-curated content feed         | Student |
| POST   | `/session/start`   | Start learning session          | Student |
| POST   | `/session/end`     | End session, update mastery     | Student |
| GET    | `/sessions`        | Paginated session history       | Student |
| GET    | `/streak`          | Current streak + weekly goal    | Student |
| POST   | `/sync`            | Sync offline session data       | Student |

### Content (`/api/content`)
| Method | Endpoint          | Description                    | Auth  |
|--------|-------------------|-------------------------------|-------|
| GET    | `/`               | Search/filter content          | Yes   |
| GET    | `/:id`            | Full content detail            | Yes   |
| GET    | `/:id/offline`    | Offline-packaged content       | Yes   |
| POST   | `/`               | Create content (auto-tag)      | Admin |
| PUT    | `/:id`            | Update content                 | Admin |
| DELETE | `/:id`            | Delete content                 | Admin |

### Mentor (`/api/mentor`)
| Method | Endpoint              | Description                 | Auth    |
|--------|-----------------------|-----------------------------|---------|
| GET    | `/available`          | List available mentors      | Yes     |
| POST   | `/request`            | Request mentor match        | Student |
| GET    | `/matches`            | Get pending/active matches  | Mentor  |
| POST   | `/matches/:id/accept` | Accept match                | Mentor  |
| POST   | `/matches/:id/complete`| Complete session           | Mentor  |
| GET    | `/leaderboard`        | Top mentors                 | Yes     |

### Analytics (`/api/analytics`) — Admin/NGO only
| Method | Endpoint    | Description                      |
|--------|-------------|----------------------------------|
| GET    | `/overview` | Platform-wide stats              |
| GET    | `/region`   | Breakdown by country/region      |
| GET    | `/subject`  | Subject-wise engagement          |
| GET    | `/cohort`   | Track student cohort over time   |
| GET    | `/export`   | CSV export                       |

### Credentials (`/api/credential`)
| Method | Endpoint         | Description                    | Auth  |
|--------|------------------|-------------------------------|-------|
| POST   | `/issue`         | Issue credential to student   | Admin |
| GET    | `/student/:id`   | Get student's credentials     | Yes   |
| GET    | `/verify/:id`    | Public verification           | None  |

---

## Environment Variables

| Variable              | Description                        | Required | Example                        |
|-----------------------|-----------------------------------|----------|--------------------------------|
| `DATABASE_URL`        | PostgreSQL connection string      | Yes      | `postgresql://user:pass@...`   |
| `REDIS_URL`           | Redis connection string           | Yes      | `redis://localhost:6379`       |
| `MONGO_URL`           | MongoDB connection string         | Yes      | `mongodb://localhost:27017/...` |
| `JWT_ACCESS_SECRET`   | JWT access token secret (64+ chars) | Yes    | Random string                  |
| `JWT_REFRESH_SECRET`  | JWT refresh token secret (64+ chars) | Yes   | Random string                  |
| `AI_SERVICE_URL`      | FastAPI AI service URL            | Yes      | `http://localhost:8000`        |
| `OPENAI_API_KEY`      | OpenAI API key                    | Optional | `sk-...`                       |
| `DEEPL_API_KEY`       | DeepL translation API key         | Optional | API key                        |
| `QDRANT_URL`          | Qdrant vector DB URL              | Optional | `http://localhost:6333`        |
| `POLYGON_RPC_URL`     | Polygon RPC endpoint              | Optional | Mumbai RPC URL                 |
| `CLOUDINARY_*`        | Cloudinary credentials            | Optional | Cloud name, key, secret        |
| `SMTP_*`              | Email SMTP settings               | Optional | Gmail SMTP credentials         |

---

## How Offline Mode Works

1. **Service Worker** caches static assets (Cache-First) and API responses (Network-First)
2. **Dexie.js (IndexedDB)** stores content, sessions, and sync queue locally
3. On reconnect, the **sync manager** flushes queued sessions to the backend via `POST /api/student/sync`
4. A badge in the UI shows pending sync count
5. Top 10 content items from the AI feed are pre-cached during sync windows

## How AI Personalization Works

1. Load student's `knowledgeMap` — shape: `{ subject: { topic: mastery 0-1 } }`
2. Identify the 5 weakest topics (sorted by mastery ASC)
3. For each weak topic, retrieve semantically similar content from vector DB
4. Score each candidate: `(1-mastery)*0.5 + recency*0.2 + engagement*0.2 + styleMatch*0.1`
5. Deduplicate, return top 10 with explanations
6. Cache in Redis for 6 hours; invalidate on new session completion

## How Credentials Are Verified

1. Admin issues credential → stored in PostgreSQL with W3C VC metadata
2. Optionally minted as ERC-721 NFT on Polygon → `txHash` recorded
3. Metadata uploaded to IPFS → `ipfsCid` recorded
4. Public `GET /api/credential/verify/:id` returns validity + blockchain proof
5. QR code on credential card links to verification endpoint

---

## Tech Stack

| Layer       | Technology                              |
|-------------|----------------------------------------|
| Frontend    | React 18, Vite, Tailwind CSS, Zustand  |
| Backend     | Node.js 20, Express, Prisma, Socket.io |
| AI Service  | Python 3.11, FastAPI, LangChain        |
| Database    | PostgreSQL, Redis, MongoDB, Qdrant     |
| Blockchain  | Solidity, Hardhat, Polygon             |
| Offline     | Service Worker, Dexie.js (IndexedDB)   |
| CI/CD       | GitHub Actions, Docker Compose         |

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit changes: `git commit -m 'Add my feature'`
4. Push: `git push origin feature/my-feature`
5. Open a Pull Request

## Team

| Name | Role | GitHub |
|------|------|--------|
| TBD  | Full-Stack Lead | @username |
| TBD  | AI/ML Engineer | @username |
| TBD  | Frontend Developer | @username |
| TBD  | DevOps Engineer | @username |

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

**Built with ❤️ for 300 million students who deserve better access to education.**
