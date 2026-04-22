# SquadUp Backend

Flask REST API — Etkinlik eşleştirme sistemi için akıllı öneri motoru.

## Tech Stack

| Katman | Teknoloji |
|--------|-----------|
| API | Python 3.11+ + Flask 3.0 |
| Veritabanı | Supabase (PostgreSQL) |
| Programlama Stili | Functional Programming (pure functions, HOF, composition) |
| CORS | flask-cors |
| Deploy | Gunicorn (production) |

---

## Kurulum

### 1. Bağımlılıkları Yükle

```bash
cd backend
pip install -r requirements.txt
```

### 2. Supabase Projesi Oluştur

1. [https://supabase.com](https://supabase.com) → **New Project**
2. SQL Editor'ı aç → `supabase_setup.sql` içeriğini yapıştır → **Run**
3. Settings → API → **URL** ve **anon key**'i kopyala

### 3. Ortam Değişkenlerini Yapılandır

```bash
cp .env.example .env
# .env dosyasını düzenle:
# SUPABASE_URL=https://xxx.supabase.co
# SUPABASE_ANON_KEY=eyJ...
```

### 4. Sunucuyu Başlat

```bash
python app.py
```

Sunucu `http://localhost:5000` adresinde çalışır.

### 5. Örnek Veri Ekle (Opsiyonel)

```bash
python seed_data.py          # Örnek kullanıcı ve etkinlikler ekle
python seed_data.py --clear  # Önce sil, sonra ekle
```

---

## API Endpoints

### Sağlık Kontrolü

```
GET /api/health
```
```json
{"status": "ok", "service": "SquadUp API"}
```

---

### Kullanıcılar

#### Kullanıcı Oluştur
```
POST /api/users
```
```json
{
  "name": "Ahmet Yılmaz",
  "interests": ["futbol", "valorant"],
  "competition_level": 3
}
```

#### Tüm Kullanıcıları Listele
```
GET /api/users
```

---

### Etkinlikler

#### Etkinlik Oluştur
```
POST /api/activities
```
```json
{
  "creator_id": "<user-uuid>",
  "title": "Kadıköy'de Futbol",
  "category": "sports",
  "competition_level": 3,
  "location": "Kadıköy Halı Saha",
  "datetime": "2025-05-01T18:00:00",
  "max_participants": 10
}
```

Geçerli kategoriler: `sports` | `esports` | `board_games` | `outdoor`

#### Tüm Etkinlikleri Listele
```
GET /api/activities
```

---

### Katılım

#### Etkinliğe Katıl
```
POST /api/activities/<activity_id>/join
```
```json
{"user_id": "<user-uuid>"}
```

---

### 🎯 Öneri Motoru (Core Feature)

```
GET /api/users/<user_id>/recommendations
```

**Query parametreleri:**

| Parametre | Varsayılan | Açıklama |
|-----------|-----------|----------|
| `min_score` | `0.3` | Minimum eşleşme puanı |
| `top_n` | `10` | Maksimum sonuç sayısı |
| `w_interest` | `0.5` | İlgi alanı ağırlığı |
| `w_competition` | `0.3` | Rekabet seviyesi ağırlığı |
| `w_reliability` | `0.2` | Güvenilirlik ağırlığı |

**Örnek:**
```
GET /api/users/abc123/recommendations?min_score=0.5&top_n=5
```

```json
{
  "user_id": "abc123",
  "recommendations": [
    {
      "id": "...",
      "title": "Kadıköy'de Futbol",
      "score": 0.85,
      "match_result": {
        "final_score": 0.85,
        "label": "perfect_match",
        "breakdown": {
          "interest": {"score": 1.0, "weight": 0.5, "contribution": 0.5},
          "competition": {"score": 0.75, "weight": 0.3, "contribution": 0.225},
          "reliability": {"score": 0.833, "weight": 0.2, "contribution": 0.1667}
        }
      }
    }
  ],
  "stats": {
    "count": 1,
    "avg_score": 0.85,
    "perfect": 1,
    "good": 0,
    "low": 0
  }
}
```

---

### Puan Hesapla (Test)

```
POST /api/activities/<activity_id>/score
```
```json
{"user_id": "<user-uuid>"}
```

---

## Puanlama Formülü

```
matchScore = w1 × interestScore + w2 × competitionSimilarity + w3 × reliabilityScore
```

| Bileşen | Formül | Aralık |
|---------|--------|--------|
| `interestScore` | Kullanıcı ilgi alanları ∩ Etkinlik kategorisi | 0.0 – 1.0 |
| `competitionSimilarity` | `1 - \|userLevel - activityLevel\| / 4` | 0.0 – 1.0 |
| `reliabilityScore` | `attended / joined` (yeni kullanıcı = 0.5) | 0.0 – 1.0 |

**Varsayılan ağırlıklar:** `interest: 0.5`, `competition: 0.3`, `reliability: 0.2`

---

## Fonksiyonel Programlama Notları

> Bu backend akademik bir FP gösterimi içerir.

| Kavram | Nerede Kullanıldı |
|--------|------------------|
| **Pure functions** | `scoring.py` — tüm fonksiyonlar yan etkisiz |
| **Higher-order functions** | `create_match_scorer()` — fonksiyon döndüren fonksiyon |
| **Function composition** | `recommendations.py` — `filter → map → filter → sort → slice` pipeline |
| **Immutability** | Tüm pipeline adımları yeni liste döndürür |
| **Closures** | `score_match` iç fonksiyonu ağırlıkları yakalar |
| **reduce()** | `build_recommendations_with_reduce()` alternatif implementasyonu |

---

## Hızlı Test (curl)

```bash
# Sağlık kontrolü
curl http://localhost:5000/api/health

# Kullanıcı oluştur
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","interests":["futbol"],"competition_level":3}'

# Etkinlikleri listele
curl http://localhost:5000/api/activities

# Önerileri getir (user_id'yi gerçek id ile değiştir)
curl http://localhost:5000/api/users/<user_id>/recommendations
```

---

## Deploy (Opsiyonel)

### Railway.app (Ücretsiz)
1. [railway.app](https://railway.app) → **New Project → Deploy from GitHub**
2. Environment variables ekle: `SUPABASE_URL`, `SUPABASE_ANON_KEY`
3. Start command: `gunicorn app:app`

### Render.com (Ücretsiz)
1. [render.com](https://render.com) → **New Web Service**
2. Build: `pip install -r requirements.txt`
3. Start: `gunicorn app:app`
