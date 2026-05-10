# LearnIt

Study smarter. LearnIt lets you write and organise your notes, scan textbook pages with your camera, and use AI to summarise, explain, quiz, and chat with your own content.

Built as our major project for Internet Programming 2, Development Software 3, and Information Systems 3 at MUT.

## What it does

- Write notes and organise them by subject
- Upload a photo of a textbook page and get typed text back (OCR)
- AI summarises, explains, and generates quiz questions from your notes
- Click any word to get a definition
- Simulated IoT sensor tracks study sessions
- Power BI dashboard for analytics

## Stack

- **Frontend** — React + Tailwind CSS (Vite)
- **Backend** — Node.js + Express
- **Database** — Supabase (PostgreSQL)
- **AI** — Groq API
- **OCR** — OCR.space
- **IoT** — Cisco Packet Tracer (simulated)
- **Analytics** — Power BI
- **Deployed on** — Vercel (frontend) + Render (backend)

## Running it locally

Clone the repo then:

```bash
# backend
cd backend
npm install
cp .env.example .env
# fill in your .env — see .env.example for what's needed
npm run dev
```

```bash
# frontend (separate terminal)
cd frontend
npm install
npm run dev
```

Backend runs on `http://localhost:5001`  
Frontend runs on `http://localhost:5173`

## Environment variables

All variables are listed in `backend/.env.example` — copy that file, rename it to `.env` and fill in your keys. Don't push `.env` to GitHub.

## Lecturer access

GitHub: `xpiyose`  
Email: `xpiyose@gmail.com`
