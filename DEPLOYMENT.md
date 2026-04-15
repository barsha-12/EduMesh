# 🚀 Deployment Guide for EduMesh

## Vercel Deployment (Recommended)

### 1. Connect to Vercel
- Go to [vercel.com](https://vercel.com)
- Sign in with GitHub
- Click "Add New" → "Project"
- Select your EduMesh repository
- Click "Import"

### 2. Configure Environment Variables
In Vercel Dashboard → Project Settings → Environment Variables, add:

```
VITE_SUPABASE_URL=https://your-supabase-url.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
VITE_GROQ_API_KEY=your_groq_api_key_here
```

**Get these values from:**
- Supabase: [supabase.com](https://supabase.com) → Settings → API
- Groq: [groq.com](https://groq.com) → Create API Key

### 3. Deploy
- Click "Deploy"
- Wait 2-3 minutes
- Your live URL: `https://edumesh-[random].vercel.app`

---

## Netlify Deployment (Alternative)

### 1. Connect to Netlify
- Go to [netlify.com](https://netlify.com)
- Click "New site from Git"
- Select GitHub and EduMesh repo
- Click "Deploy site"

### 2. Configure Environment Variables
In Netlify → Site Settings → Environment, add the same 3 variables

### 3. Deploy
- Netlify auto-deploys on push
- Your live URL: `https://[random-name].netlify.app`

---

## Local Testing

```bash
cd frontend
npm run dev
# Visit http://localhost:3000
```

## Build Locally

```bash
cd frontend
npm run build
# Output: dist/ folder (this is what gets deployed)
```

---

## Troubleshooting

**404 Error on Routes**: Make sure vercel.json and netlify.toml have proper SPA routing
**Build Fails**: Check that all environment variables are set
**Slow Build**: First build takes longer; subsequent deployments are faster

