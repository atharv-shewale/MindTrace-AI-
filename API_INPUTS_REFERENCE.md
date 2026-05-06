# MINDTRACE AI+ — API Input Requirements Reference

**Quick reference for all required user inputs for each API endpoint.**

---

## 🔑 Authentication Endpoints

### 1. Sign Up
**Endpoint:** `POST /api/auth/signup`

**User Inputs (Required):**
```
email: "user@example.com"          [string, email format]
username: "john_doe"               [string, unique]
name: "John Doe"                   [string]
password: "SecurePassword123"      [string, min 8 chars]
```

**You Get Back:**
```
access_token: "jwt_token_here"     [Use for Authorization header]
token_type: "bearer"
user_id: "507f1f77bcf86cd799439011"
```

---

### 2. Login
**Endpoint:** `POST /api/auth/login`

**User Inputs (Required):**
```
email: "user@example.com"          [string]
password: "SecurePassword123"      [string]
```

**You Get Back:**
```
access_token: "jwt_token_here"     [Save this!]
token_type: "bearer"
user_id: "507f1f77bcf86cd799439011"
```

---

### 3. Refresh Token
**Endpoint:** `POST /api/auth/refresh`

**User Inputs:**
```
Authorization: Bearer <old_token>  [Header, required]
```

**You Get Back:**
```
access_token: "new_jwt_token"
token_type: "bearer"
```

---

## 👤 User Management Endpoints

### 1. Get Profile
**Endpoint:** `GET /api/users/profile`

**User Inputs:**
```
Authorization: Bearer <token>      [Header, required]
```

**You Get Back:**
```
_id: "507f1f77bcf86cd799439011"
email: "user@example.com"
username: "john_doe"
name: "John Doe"
created_at: "2026-05-06T10:30:00"
updated_at: "2026-05-06T10:30:00"
theme_preference: "light"          [light|dark|system]
wellness_score: 50.0               [0-100]
avatar_url: null
```

---

### 2. Update Profile
**Endpoint:** `PUT /api/users/profile`

**User Inputs (All Optional):**
```
Authorization: Bearer <token>      [Header, required]

name: "Jane Doe"                   [string, optional]
avatar_url: "https://..."          [URL, optional]
theme_preference: "dark"           [light|dark|system, optional]
```

**You Get Back:**
```
message: "Profile updated"
profile: { ... updated profile ... }
```

---

### 3. Get Wellness Stats
**Endpoint:** `GET /api/users/wellness-stats`

**User Inputs:**
```
Authorization: Bearer <token>      [Header, required]
```

**You Get Back:**
```
total_emotions_recorded: 45
average_intensity: 0.62
escalation_score: 0.45
current_status: "normal"
```

---

## 😊 Emotion Tracking Endpoints

### 1. Detect Emotions from Text
**Endpoint:** `POST /api/emotions/detect`

**User Inputs (Required):**
```
Authorization: Bearer <token>      [Header, required]
text: "I'm feeling really anxious"  [string]
```

**You Get Back:**
```
emotions: {
  "anxiety": 0.85,
  "fear": 0.45,
  "sadness": 0.20
}
dominant_emotion: "anxiety"
dominant_intensity: 0.85
sentiment: {
  "negative": 0.88,
  "neutral": 0.10,
  "positive": 0.02
}
positivity: 0.02
```

---

### 2. Record Emotion Event
**Endpoint:** `POST /api/emotions/record`

**User Inputs (Required):**
```
Authorization: Bearer <token>      [Header, required]

emotion: "anxiety"                 [See list below]
intensity: 0.75                    [0.0 to 1.0]
source: "manual"                   [manual|journal|face|chat]
context: "Feeling nervous"         [string, optional]
```

**Emotion Options:**
```
sadness, stress, anxiety, frustration, loneliness, burnout, 
fatigue, anger, fear, joy, calm
```

**You Get Back:**
```
emotion_recorded: true
escalation_score: 0.65
is_critical: false
recommendations: [
  "Try a 5-minute breathing exercise",
  "Reach out to a friend"
]
```

---

### 3. Get Emotion Status
**Endpoint:** `GET /api/emotions/status`

**User Inputs:**
```
Authorization: Bearer <token>      [Header, required]
```

**You Get Back:**
```
current_escalation: 0.65
escalation_level: "normal"         [normal|escalating|critical]
recent_emotions: ["anxiety", "stress"]
is_critical: false
recommendations: [...]
```

---

### 4. WebSocket: Real-time Stream
**Endpoint:** `WS /api/emotions/stream/{user_id}`

**User Inputs:**
```
user_id: "507f1f77bcf86cd799439011"  [In URL path]
token: "<access_token>"              [In query string]
```

**JavaScript Example:**
```javascript
const token = "your_access_token";
const userId = "your_user_id";
const ws = new WebSocket(
  `ws://localhost:8000/api/emotions/stream/${userId}?token=${token}`
);

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log(data);
};
```

**Messages You Receive:**
```json
{
  "type": "emotional_update",
  "timestamp": "2026-05-06T10:30:00",
  "data": {
    "emotion": "joy",
    "intensity": 0.8,
    "escalation_score": 0.45,
    "is_critical": false
  }
}
```

---

## 📝 Journal Endpoints

### 1. Create Journal Entry
**Endpoint:** `POST /api/journal/create`

**User Inputs (Required):**
```
Authorization: Bearer <token>      [Header, required]

content: "Today was a good day..."  [string, required]
mood_intensity: 0.75               [0.0 to 1.0, required]
```

**You Get Back:**
```
entry_id: "507f1f77bcf86cd799439011"
emotions_detected: {
  "joy": 0.7,
  "calm": 0.5
}
dominant_emotion: "joy"
sentiment: {
  "negative": 0.15,
  "neutral": 0.20,
  "positive": 0.65
}
positivity: 0.65
```

---

### 2. List Journal Entries
**Endpoint:** `GET /api/journal/list`

**User Inputs (Optional):**
```
Authorization: Bearer <token>      [Header, required]

skip: 0                            [Default: 0]
limit: 10                          [Default: 10]
days: 7                            [Last N days, Default: 7]
```

**You Get Back:**
```
total: 25
entries: [
  {
    "_id": "507f1f77bcf86cd799439011",
    "content": "Today was...",
    "dominant_emotion": "joy",
    "created_at": "2026-05-06T10:30:00"
  }
]
```

---

### 3. Get Single Entry
**Endpoint:** `GET /api/journal/{entry_id}`

**User Inputs (Required):**
```
Authorization: Bearer <token>      [Header, required]
entry_id: "507f1f77bcf86cd799439011"  [In URL path]
```

**You Get Back:**
```
_id: "507f1f77bcf86cd799439011"
content: "Journal text..."
emotions_detected: { ... }
dominant_emotion: "joy"
created_at: "2026-05-06T10:30:00"
```

---

## 🎯 Intervention Endpoints

### 1. Get Recommended Interventions
**Endpoint:** `GET /api/interventions/recommend`

**User Inputs (Optional):**
```
Authorization: Bearer <token>      [Header, required]

emotion: "anxiety"                 [Specific emotion, optional]
severity: 0.75                     [0.0 to 1.0, optional]
```

**You Get Back:**
```
interventions: [
  {
    "id": "breathing_5m",
    "type": "breathing_exercise",
    "title": "5-Minute Breathing Exercise",
    "description": "...",
    "duration_minutes": 5,
    "effectiveness_score": 0.82
  }
]
```

---

### 2. Trigger Intervention
**Endpoint:** `POST /api/interventions/trigger/{intervention_type}`

**User Inputs (Required):**
```
Authorization: Bearer <token>      [Header, required]
intervention_type: "breathing_exercise"  [In URL path]

duration: 5                        [Minutes, optional]
intensity: "moderate"              [low|moderate|high, optional]
```

**Intervention Types:**
```
breathing_exercise, meditation, grounding, movement, journaling, 
social_connection, self_care
```

**You Get Back:**
```
intervention_id: "507f1f77bcf86cd799439011"
status: "started"
type: "breathing_exercise"
estimated_duration: 5
instructions: "Breathe in for 4 counts..."
```

---

### 3. Log Intervention Feedback
**Endpoint:** `POST /api/interventions/feedback/{intervention_id}`

**User Inputs (Required):**
```
Authorization: Bearer <token>      [Header, required]
intervention_id: "507f1f77bcf86cd799439011"  [In URL path]

effectiveness: 0.8                 [0.0 to 1.0, required]
feedback: "Really helped me relax"  [string, optional]
would_repeat: true                 [boolean, optional]
```

**You Get Back:**
```
message: "Feedback recorded"
intervention_id: "507f1f77bcf86cd799439011"
```

---

## 📊 Analytics Endpoints

### 1. Get Daily Wellness Score
**Endpoint:** `GET /api/analytics/daily-score`

**User Inputs (Optional):**
```
Authorization: Bearer <token>      [Header, required]

date: "2026-05-06"                 [YYYY-MM-DD, optional - defaults to today]
```

**You Get Back:**
```
date: "2026-05-06"
emotional_wellness_score: 65.5     [0-100]
stability_score: 72.0              [0-100]
recovery_index: 58.3               [0-100]
stress_exposure_score: 45.2        [0-100]
trend: "improving"                 [improving|stable|declining]
```

---

### 2. Get Daily Insights
**Endpoint:** `GET /api/analytics/insights`

**User Inputs (Optional):**
```
Authorization: Bearer <token>      [Header, required]

date: "2026-05-06"                 [Optional - defaults to today]
```

**You Get Back:**
```
date: "2026-05-06"
key_insights: [
  "You had a stressful morning but recovered well after your walk",
  "Your anxiety peaks tend to occur around 2 PM"
]
patterns: [
  "Stress increases on weekdays",
  "Anxiety is triggered by work meetings"
]
recommendations: [
  "Try scheduling breaks before meetings",
  "Continue your journaling habit"
]
```

---

### 3. Get Analytics Dashboard
**Endpoint:** `GET /api/analytics/dashboard`

**User Inputs (Optional):**
```
Authorization: Bearer <token>      [Header, required]

days: 7                            [Last N days, Default: 7]
```

**You Get Back:**
```
current_status: {
  "emotional_wellness_score": 65.5,
  "escalation_level": "normal"
}
historical_data: [
  { "date": "2026-05-06", "score": 65.5 },
  { "date": "2026-05-05", "score": 58.2 }
]
emotional_patterns: {
  "dominant_emotions": ["stress", "anxiety"],
  "frequency": { "stress": 12, "anxiety": 8 }
}
insights: { ... }
recovery_patterns: {
  "most_effective_intervention": "breathing_exercise",
  "average_recovery_time": "15 minutes"
}
```

---

## 💬 Chatbot Endpoints

### 1. Send Message
**Endpoint:** `POST /api/chatbot/send-message`

**User Inputs (Required):**
```
Authorization: Bearer <token>      [Header, required]

message: "I'm feeling really anxious"  [string, required]
context_emotion: "anxiety"         [emotion, optional]
```

**You Get Back:**
```
response: "I understand you're feeling anxious. That's valid..."
message_id: "507f1f77bcf86cd799439011"
timestamp: "2026-05-06T10:30:00"
```

---

### 2. Get Conversation History
**Endpoint:** `GET /api/chatbot/conversation-history`

**User Inputs (Optional):**
```
Authorization: Bearer <token>      [Header, required]

limit: 50                          [Number of messages, Default: 50]
```

**You Get Back:**
```
messages: [
  {
    "sender": "user",
    "message": "I'm feeling anxious",
    "timestamp": "2026-05-06T10:30:00"
  },
  {
    "sender": "bot",
    "message": "I understand...",
    "timestamp": "2026-05-06T10:30:05"
  }
]
```

---

## 🔗 Safe Links Endpoints

### 1. Add Comfort Content
**Endpoint:** `POST /api/safe-links/add`

**User Inputs (Required):**
```
Authorization: Bearer <token>      [Header, required]

title: "Calming Meditation"         [string, required]
url: "https://youtube.com/..."     [URL, required]
category: "meditation"             [See list below, required]
```

**Category Options:**
```
music, video, meditation, exercise, motivation, grounding
```

**You Get Back:**
```
link_id: "507f1f77bcf86cd799439011"
added: true
```

---

### 2. List Safe Links
**Endpoint:** `GET /api/safe-links/list`

**User Inputs (Optional):**
```
Authorization: Bearer <token>      [Header, required]

category: "meditation"             [Filter by category, optional]
```

**You Get Back:**
```
total: 12
links: [
  {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Calming Meditation",
    "url": "https://youtube.com/...",
    "category": "meditation",
    "created_at": "2026-05-06T10:30:00",
    "access_count": 5
  }
]
category_filter: "meditation"
```

---

## 🆘 SOS & Safety Endpoints

### 1. Add Emergency Contact
**Endpoint:** `POST /api/sos/contact/add`

**User Inputs (Required):**
```
Authorization: Bearer <token>      [Header, required]

name: "Mom"                        [string, required]
contact_type: "family"            [See list below, required]
phone: "+1-555-123-4567"          [string, optional but recommended]
email: "mom@example.com"          [string, optional but recommended]
```

**Contact Type Options:**
```
emergency, friend, family, professional
```

**You Get Back:**
```
contact_id: "507f1f77bcf86cd799439011"
added: true
```

---

### 2. List Emergency Contacts
**Endpoint:** `GET /api/sos/contact/list`

**User Inputs:**
```
Authorization: Bearer <token>      [Header, required]
```

**You Get Back:**
```
contacts: [
  {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Mom",
    "phone": "+1-555-123-4567",
    "email": "mom@example.com",
    "type": "family",
    "created_at": "2026-05-06T10:30:00"
  }
]
count: 3
```

---

### 3. Send SOS Alert
**Endpoint:** `POST /api/sos/alert`

**User Inputs (Required):**
```
Authorization: Bearer <token>      [Header, required]

severity_level: "high"            [low|moderate|high|critical, required]
message: "I'm in crisis"          [string, optional]
```

**You Get Back:**
```
alert_id: "507f1f77bcf86cd799439011"
status: "sent"
contacts_notified: 3
resources: [
  "National Crisis Hotline: 988",
  "Crisis Text Line: Text HOME to 741741"
]
```

---

## 🔧 System Endpoints

### 1. Health Check
**Endpoint:** `GET /health`

**User Inputs:** None

**You Get Back:**
```
status: "healthy"
```

---

### 2. Root Endpoint
**Endpoint:** `GET /`

**User Inputs:** None

**You Get Back:**
```
message: "Welcome to MINDTRACE AI+"
description: "Realtime Emotional Intelligence and Adaptive Wellness Platform"
status: "operational"
version: "1.0.0"
```

---

### 3. Active WebSocket Connections
**Endpoint:** `GET /api/ws/active`

**User Inputs:** None

**You Get Back:**
```
active_users: 2
connections_per_user: {
  "507f1f77bcf86cd799439011": 1,
  "507f1f77bcf86cd799439012": 2
}
```

---

## 🔐 Authentication Header Format

For all endpoints marked as requiring `Authorization`:

```
Authorization: Bearer <your_access_token_here>
```

**Example:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📊 Quick Reference Table

| Endpoint | Method | Auth | Key Inputs | Returns |
|----------|--------|------|-----------|---------|
| `/api/auth/signup` | POST | ❌ | email, username, password | access_token, user_id |
| `/api/auth/login` | POST | ❌ | email, password | access_token, user_id |
| `/api/users/profile` | GET | ✅ | (none) | user profile |
| `/api/emotions/record` | POST | ✅ | emotion, intensity | escalation_score |
| `/api/journal/create` | POST | ✅ | content | entry_id, emotions |
| `/api/analytics/daily-score` | GET | ✅ | date (opt) | wellness_score |
| `/api/interventions/recommend` | GET | ✅ | (none) | recommendations |
| `/api/chatbot/send-message` | POST | ✅ | message | bot_response |
| `/api/sos/contact/add` | POST | ✅ | name, type | contact_id |
| ... (30+ total) | ... | ... | ... | ... |

---

## 📝 Environment Variables You Need

```ini
MONGODB_URL=mongodb://localhost:27017/mindtrace_db
MONGODB_DB=mindtrace_db
SECRET_KEY=<generate: python -c "import secrets; print(secrets.token_urlsafe(32))">
DEBUG=True
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
CORS_ORIGINS=["http://localhost:3000"]
```

---

## 🎯 Sample Complete User Flow

```bash
# 1. Sign up (no auth needed)
curl -X POST http://localhost:8000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","username":"user123","name":"John","password":"Pass123"}'
# Response: {"access_token":"TOKEN","user_id":"USER_ID"}

# 2. Save TOKEN and USER_ID

# 3. Record emotion (with auth)
curl -X POST http://localhost:8000/api/emotions/record \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"emotion":"anxiety","intensity":0.75,"source":"manual"}'

# 4. Get wellness score
curl -X GET "http://localhost:8000/api/analytics/daily-score" \
  -H "Authorization: Bearer TOKEN"

# 5. Create journal entry
curl -X POST http://localhost:8000/api/journal/create \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content":"Today was good","mood_intensity":0.7}'
```

---

**For full details, see [USER_GUIDE.md](USER_GUIDE.md)**

**For architecture, see [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)**

**To get started, see [QUICK_START.md](QUICK_START.md)**
