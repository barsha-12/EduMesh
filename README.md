# EduMesh: Elite AI Studio 🧠✨

[![Vercel Deployment](https://img.shields.io/badge/Vercel-Deployed-black?style=for-the-badge&logo=vercel)](https://edu-mesh.vercel.app/)
[![React Version](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![MongoDB Scaling](https://img.shields.io/badge/MongoDB-1k+_Members-47A248?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)

**EduMesh** is a premium, high-fidelity research and study platform designed for the modern elite student. It integrates cutting-edge AI (Groq & Gemini) with advanced visual tools (Mind Trees, Knowledge Graphs) to transform raw data into deep intelligence.

---

## 🚀 Key Features

### 🌟 AI Elite Synthesis
- **Dual-Model Switching**: Toggle between **Groq 3.1** (Ultra-fast chat) and **Gemini 1.5 Flash** (Deep reasoning) in real-time.
- **Voice Intelligence**: Interactive audio synthesis with dynamic waveforms and recording toggles.
- **Contextual Knowledge**: Pin insights directly to your research notes for auto-synthesis.

### 🌳 Visual Intelligence Studio
- **Dynamic Mind Tree**: Transform concepts into interactive 2D/3D trees that visualize logical relationships.
- **Knowledge Graphing**: See your notes as a neural network of connected ideas.
- **Feynman Module**: Master any topic using the Feynman technique with structured AI feedback.

### 🛡️ Production-Grade Infrastructure
- **Hybrid Auth Engine**: Secure **Supabase OAuth** login combined with a **MongoDB** member database for 1000+ user scalability.
- **API Guard**: Real-time 100-request daily limit tracking with reset logic for elite free-tier management.
- **Elite Customization**: 4 premium color palettes (Mint, Lavender, Cyber, Latte) with Dark/Light mode and fluid font-scaling.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, Framer Motion, Tailwind CSS, Lucide |
| **Backend** | Node.js, Vercel Functions, JWT |
| **Database** | MongoDB Atlas, Upstash Redis (Cache) |
| **Auth** | Supabase OAuth 2.0 (Google) |
| **AI Providers** | Groq (Llama 3.x), Google Generative AI (Gemini) |

---

## 📦 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/karanray06/EduMesh.git
cd EduMesh/frontend
```

### 2. Environment Configuration
Create a `.env` file in the `frontend/` directory with the following keys:
```env
# MongoDB & Redis
MONGODB_URI=your_mongodb_uri
REDIS_URL=your_upstash_redis_url

# AI Keys
GROQ_API_KEY=your_groq_key
GEMINI_API_KEY=your_gemini_key

# Supabase Auth
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Secrets
NEXTAUTH_SECRET=your_32_char_secret
```

### 3. Install & Run
```bash
npm install
npm run dev
```

The app will launch at `http://localhost:3002`.

---

## 📈 Roadmap
- [x] **v2.1**: Supabase OAuth Restoration & MongoDB Scaling.
- [x] **v2.2**: AI Usage Studio & Integrated Theme Controller.
- [ ] **v2.3**: Real-time collaborative Notebook sharing.
- [ ] **v2.4**: Mobile-native Elite Companion App.

---

## 📄 License
Designed & Built with ❤️ by the EduMesh Intelligence Team. All Rights Reserved.

**Live Demo:** [edu-mesh.vercel.app](https://edu-mesh.vercel.app/)
