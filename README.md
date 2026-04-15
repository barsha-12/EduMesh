# EduMesh — AI Study Buddy 🎓

An AI-powered study companion for college students. Get instant explanations, generate smart notes, and practice with quizzes.

![EduMesh](https://img.shields.io/badge/EduMesh-AI%20Study%20Buddy-6366f1?style=for-the-badge)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🤖 **AI Study Chat** | Ask any doubt and get instant, detailed explanations powered by Groq AI |
| 📝 **Smart Notes** | Pick a subject and topic — AI generates structured study notes with examples |
| 📥 **Download PDF** | Export your generated study notes as a PDF for offline reading |
| 🧠 **Practice Quiz** | AI creates MCQ quizzes to test your knowledge with instant feedback |
| 📊 **Study Dashboard** | Track your study streak, notes created, quizzes taken, and average score |

## 🛠️ Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS with glassmorphism effects
- **State**: Zustand
- **Auth & DB**: Supabase (free tier)
- **AI**: Groq AI (free tier with API key)
- **PDF Export**: html2pdf.js
- **Animations**: Framer Motion
- **Icons**: Lucide React

## 🚀 Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/karanray06/EduMesh.git
cd EduMesh/frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the `frontend/` folder:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GROQ_API_KEY=your_groq_api_key
```

**How to get these keys:**
- **Supabase**: Create a free project at [supabase.com](https://supabase.com) → Settings → API → copy URL and anon key
- **Groq API**: Get a free key at [groq.com](https://groq.com) → Create an API key

### 4. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/ui/     # Reusable UI components (GlassCard, Navbar, AnimatedBackground)
│   ├── pages/             # 5 pages (Login, Dashboard, AIChat, StudyNotes, Quiz)
│   ├── services/          # Groq AI service wrapper
│   ├── store/             # Zustand stores (auth, study)
│   ├── lib/               # Supabase client
│   ├── App.jsx            # Router setup
│   ├── main.jsx           # Entry point
│   └── index.css          # Global styles + animations
├── .env                   # Environment variables
├── package.json
├── tailwind.config.js
└── vite.config.js
```

## 🎯 Real-Life Use Case

Every college student struggles with:
- Understanding complex topics quickly
- Creating good study notes
- Testing their own knowledge before exams
- Staying consistent with studies

**EduMesh solves all of these** by putting an AI tutor in your pocket. Just type your question and get a clear explanation. Generate structured notes for any topic. Take AI-generated quizzes to test yourself. Track your study streak to stay motivated.

## 📄 License

MIT
