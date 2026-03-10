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
| Database | Supabase (PostgreSQL)               |
| Web      | React + Vite + React Router         |
| Mobile   | React Native + Expo + Zustand       |

---

## Project Structure

```
squadup/
├── backend/
│   ├── scoring.py          # Pure scoring functions + HOF
│   ├── recommendations.py  # Functional pipeline
│   ├── database.py         # Supabase client wrapper (I/O layer)
│   ├── app.py              # Flask REST API
│   ├── supabase_setup.sql  # DB schema (run in Supabase SQL Editor)
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
│   ├── App.js              # Bottom tab navigator (Turkish tabs)
│   └── src/
│       ├── screens/        # FeedScreen, RecommendationsScreen, ProfileScreen
│       ├── components/     # ActivityCard
│       ├── store/          # Zustand store (immutable updates)
│       ├── utils/          # scoring.js, pipeline.js (pure functions)
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

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your Supabase URL and anon key

# Run the server
python app.py
# API available at http://localhost:5000
```

### 3. Web App (React)

```bash
cd web

# Install dependencies
npm install

# Start development server
npm run dev
# Available at http://localhost:3000
```

> The Vite dev server proxies `/api` → `http://localhost:5000` automatically.

### 4. Mobile App (React Native + Expo)

```bash
cd mobile

# Install dependencies
npm install

# Update the API base URL in src/store/activityStore.js
# Change: const API_BASE = 'http://localhost:5000/api'
# To your machine's local IP if testing on device

# Start Expo
npx expo start
```

Scan the QR code with the **Expo Go** app on your phone, or press `a` for Android emulator / `i` for iOS simulator.

---

## API Reference

All responses are in English; the frontend maps to Turkish UI text.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/api/health` | Health check |
| `GET`  | `/api/users` | List all users |
| `POST` | `/api/users` | Create user profile |
| `GET`  | `/api/users/{id}/recommendations` | Get top 10 recommendations |
| `GET`  | `/api/activities` | List all activities |
| `POST` | `/api/activities` | Create activity |
| `POST` | `/api/activities/{id}/score` | Score activity for a user |
| `POST` | `/api/activities/{id}/join` | Join an activity |

### Example: Create User

```bash
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ahmet Yılmaz",
    "interests": ["futbol", "koşu"],
    "competition_level": 3
  }'
```

### Example: Get Recommendations

```bash
curl "http://localhost:5000/api/users/<USER_ID>/recommendations?min_score=0.3&top_n=10"
```

---

## Functional Programming Highlights

### Pure Functions (`backend/scoring.py` + `mobile/src/utils/scoring.js`)

```python
# Pure: same inputs always return same output, no side effects
def calculate_interest_score(user_interests: List[str], activity_category: str) -> float:
    category_interests = CATEGORY_INTEREST_MAP.get(activity_category, [])
    matched = set(user_interests) & set(category_interests)
    return min(len(matched) / len(category_interests), 1.0) if category_interests else 0.0
```

### Higher-Order Function (`create_match_scorer`)

```python
# Returns a configured scoring closure — HOF pattern
def create_match_scorer(weights: Dict) -> Callable:
    def score_match(user: Dict, activity: Dict) -> Dict:
        # ... uses weights from closure
    return score_match  # function as return value
```

### Functional Pipeline (`mobile/src/utils/pipeline.js`)

```javascript
// Declarative: filter → map → filter → sort → slice
return activities
  .filter(filterUnjoined(joinedActivityIds))   // remove already-joined
  .map(enrichWithScore(user, scorer))           // add match scores
  .filter(filterByMinScore(minScore))           // remove low scores
  .sort(byScoreDescending)                      // rank best first
  .slice(0, topN);                              // take top N
```

### Immutable State (`mobile/src/store/activityStore.js`)

```javascript
// Zustand: always create new objects, never mutate
set(state => ({
  ...state,                                      // spread = new object
  joinedIds: [...state.joinedIds, activityId],  // spread = new array
  user: { ...state.user, joined_events: state.user.joined_events + 1 },
}));
```

---

## Language Strategy

| Context | Language |
|---------|----------|
| Code (variables, functions, comments) | English |
| UI text (buttons, labels, messages) | Turkish |
| Category DB keys (`sports`, `esports`, …) | English |
| Category display names (`Spor`, `E-Spor`, …) | Turkish |
| README / API docs | English |

---

## Database Schema

```sql
sqlusers        (id, name, interests[], competition_level, attended_events, joined_events)
activities      (id, creator_id, title, category, competition_level, location, datetime, max_participants)
participations  (id, user_id, activity_id, status)
```

---

## Development Notes

- Backend intentionally has **no business logic** in `app.py` — it only wires I/O to pure functions
- `scoring.py` and `scoring.js` are kept **in sync** to demonstrate that pure functions are portable across languages
- All Turkish text lives in `constants/translations.js` (web) and `constants/translations.js` (mobile) — never hardcoded in components
