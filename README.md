# SquadUp — Smart Activity Matching System

> An academic project demonstrating **Functional Programming** principles through a real-world activity recommendation engine for Turkish users.

## Overview

SquadUp matches users with suitable local activities using a **deterministic scoring algorithm** — no black-box AI, just pure functions and transparent scoring. Every recommendation comes with a full score breakdown so users can see *why* they were matched.

### Key Design Principles
- **Pure Functions** — same input always produces same output
- **Immutability** — state is never mutated; new objects are always created
- **Higher-Order Functions** — `createMatchScorer()` returns configured scorers
- **Function Composition** — recommendation pipeline chains filter → map → filter → sort
- **Declarative Code** — `map/filter/reduce` instead of imperative loops

---

## Tech Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Backend  | Python + Flask                      |
| AI / NLP | OpenAI API / Scikit-learn           |
| Database | Supabase (PostgreSQL)               |
| Web      | React + Vite + React Router         |
| Mobile   | React Native + Expo + Zustand       |

---

## Project Structure

```
squadup/
├── backend/
│   ├── scoring.py          # Pure scoring functions + HOF
│   ├── ai_helper.py        # NLP / AI support
│   ├── recommendations.py  # Functional pipeline
│   ├── database.py         # Supabase client wrapper (I/O layer)
│   ├── app.py              # Flask REST API
│   ├── supabase_setup.sql  # DB schema
│   ├── requirements.txt
│   └── .env.example
│
├── web/
│   └── src/
│       ├── components/     # ProfileForm, ActivityForm, ActivityCard
│       ├── pages/          # Home, Profile, ActivityList, Recommendations
│       ├── services/api.js # Axios API client
│       └── constants/translations.js  # ALL Turkish UI text
│
├── mobile/
│   ├── App.js              # Bottom tab navigator
│   └── src/
│       ├── screens/        # FeedScreen, RecommendationsScreen, ProfileScreen
│       ├── components/     # ActivityCard
│       ├── store/          # Zustand store
│       ├── utils/          # scoring.js, pipeline.js
│       └── constants/      # translations.js
│
└── README.md
```

---

## Scoring System

```
matchScore = w1 × interestScore + w2 × competitionSimilarity + w3 × reliabilityScore
```

| Component            | Formula                                    | Weight |
|----------------------|--------------------------------------------|--------|
| `interestScore`      | `|userInterests ∩ categoryPool|` / `|pool|`| 0.5    |
| `competitionSimilarity` | `1 - |userLevel - activityLevel| / 4`  | 0.3    |
| `reliabilityScore`   | `attended_events / joined_events`          | 0.2    |

Scores are in `[0.0, 1.0]`:
- **≥ 0.8** → Mükemmel Eşleşme (Perfect Match)
- **0.5–0.8** → İyi Eşleşme (Good Match)
- **< 0.5** → Düşük Eşleşme (Low Match)

---

## Setup Guide

### 1. Database (Supabase)

1. Create a free project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** → New Query
3. Paste and run the contents of `backend/supabase_setup.sql`
4. Copy your **Project URL** and **anon key** from Settings → API

### 2. Backend (Flask)

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your Supabase URL and anon key
python app.py
```

### 3. Web App (React)

```bash
cd web
npm install
npm run dev
```

### 4. Mobile App (React Native + Expo)

```bash
cd mobile
npm install
npx expo start
```

---

## Language Strategy

| Context | Language |
|---------|----------|
| Code (variables, functions, comments) | English |
| UI text (buttons, labels, messages) | Turkish |
| README / API docs | English |

---

## Development Notes

- Backend intentionally has **no business logic** in `app.py` — I/O layer.
- `scoring.py` and `scoring.js` are kept **in sync** for portability.
- All Turkish text lives in `translations.js` (SSOT).
