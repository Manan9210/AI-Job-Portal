# 🚀 NexusJobs — AI-Powered Job Portal

A full-stack AI job portal built with **React + Vite**, **Node.js/Express**, and **Supabase** — powered by **Google Gemini AI**.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 Auth | Supabase Auth — JWT, register/login as Seeker or Employer |
| 💼 Jobs | Post, browse, filter, search jobs with pagination |
| 📋 Applications | Apply to jobs, track status, employer review panel |
| 📄 AI Resume Analyzer | Paste resume → get score, strengths, weaknesses, ATS score |
| 🎯 AI Job Matcher | Compare resume vs job → match score + missing skills |
| ✉️ AI Cover Letter | Generate personalized cover letters in seconds |
| 📝 AI Job Description | Employers generate full JDs with one click |
| 📊 Dashboards | Dedicated seeker & employer dashboards |
| 👤 Profile | Complete profile with skills, links, resume URL |

---

## 🛠 Tech Stack

- **Frontend**: React 18, Vite, React Router v6, Axios
- **Backend**: Node.js, Express.js (AI routes only)
- **Database**: Supabase (PostgreSQL + Auth + RLS)
- **AI**: Google Gemini 1.5 Flash API
- **Styling**: Vanilla CSS (glassmorphism dark mode)

---

## 🚀 Quick Setup

### 1. Supabase Setup
1. Go to [supabase.com](https://supabase.com) → New Project
2. Go to **SQL Editor** → paste & run `supabase/setup.sql`
3. Go to **Settings → API** → copy your `Project URL` and keys

### 2. Gemini API Key
1. Go to [aistudio.google.com](https://aistudio.google.com/app/apikey)
2. Create a free API key

### 3. Backend Setup
```bash
cd backend
cp .env.example .env
# Fill in your .env values
npm install
npm run dev       # Runs on http://localhost:5000
```

**backend/.env**
```
PORT=5000
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key
GEMINI_API_KEY=your_gemini_api_key
CLIENT_URL=http://localhost:5173
```

### 4. Frontend Setup
```bash
cd frontend
cp .env.example .env
# Fill in your .env values
npm install
npm run dev       # Runs on http://localhost:5173
```

**frontend/.env**
```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

---

## 📁 Project Structure

```
ai-job-portal/
├── backend/
│   ├── controllers/aiController.js   # Gemini AI logic
│   ├── middleware/auth.js            # Supabase JWT verify
│   ├── routes/ai.js                  # AI endpoints
│   └── server.js                     # Express app
├── frontend/
│   └── src/
│       ├── components/               # Navbar, JobCard, etc.
│       ├── context/AuthContext.jsx   # Supabase auth state
│       ├── pages/                    # All route pages
│       ├── services/api.js           # Axios AI calls
│       └── lib/supabase.js           # Supabase client
└── supabase/
    └── setup.sql                     # DB schema + RLS
```

---

## 🔗 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/ai/analyze-resume` | AI resume analysis |
| POST | `/api/ai/match-score` | Job match score |
| POST | `/api/ai/cover-letter` | Cover letter generation |
| POST | `/api/ai/job-description` | Job description generation |
| GET  | `/api/health` | Health check |

---

## 🎨 Design

- Dark glassmorphism theme with purple/blue gradients
- Fully responsive (mobile, tablet, desktop)
- Smooth animations and micro-interactions
- Inter font, CSS variables design system
