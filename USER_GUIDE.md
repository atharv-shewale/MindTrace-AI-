# MINDTRACE AI+ — User Guide & API Documentation

## Quick Start

### Step 1: Start the Backend

```bash
cd backend
python -m venv venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload
```

Backend will run at: `http://localhost:8000`
API docs available at: `http://localhost:8000/docs`

### Step 2: Start the Frontend Test Client

```bash
cd frontend/simple_client
python -m http.server 3000
```

Open `http://localhost:3000` in your browser.

---

## API Endpoints

All API endpoints require an **Authorization** header with a valid JWT token after login/signup, except for `/signup` and `/login`.

**Header format:**
```
Authorization: Bearer <access_token>
```

---

## Authentication Endpoints

### 1. Sign Up (Register New User)

**Endpoint:** `POST /api/auth/signup`

**Required Inputs (JSON Body):**
```json
{
  "email": "user@example.com",
  "username": "john_doe",
  "name": "John Doe",
  "password": "SecurePassword123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user_id": "507f1f77bcf86cd799439011"
}
```

**Notes:**
- Email must be unique
- Password must be at least 8 characters
- Save the `access_token` for authenticated requests

---

### 2. Login

**Endpoint:** `POST /api/auth/login`

**Required Inputs (Form Data or Query Parameters):**
```
email: user@example.com
password: SecurePassword123
```

**Or as JSON Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user_id": "507f1f77bcf86cd799439011"
}
```

---

### 3. Refresh Token

**Endpoint:** `POST /api/auth/refresh`

**Required Inputs:**
- Authorization header with valid token

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

---

## User Profile Endpoints

### 1. Get User Profile

**Endpoint:** `GET /api/users/profile`

**Required Inputs:**
- Authorization header with valid token

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "email": "user@example.com",
  "username": "john_doe",
  "name": "John Doe",
  "created_at": "2026-05-06T10:30:00",
  "updated_at": "2026-05-06T10:30:00",
  "theme_preference": "light",
  "wellness_score": 50.0,
  "avatar_url": null
}
```

---

### 2. Update User Profile

**Endpoint:** `PUT /api/users/profile`

**Required Inputs (all optional):**
```
name: "Jane Doe" (optional)
avatar_url: "https://example.com/avatar.jpg" (optional)
theme_preference: "dark" (optional - light|dark|system)
```

**Response:**
```json
{
  "message": "Profile updated",
  "profile": { ... }
}
```

---

## Emotion Tracking Endpoints

### 1. Detect Emotions from Text

**Endpoint:** `POST /api/emotions/detect`

**Required Inputs (Query Parameter or JSON):**
```
text: "I'm feeling really sad and anxious today"
```

**Response:**
```json
{
  "emotions": {
    "sadness": 0.85,
    "anxiety": 0.72,
    "fear": 0.45
  },
  "dominant_emotion": "sadness",
  "dominant_intensity": 0.85,
  "sentiment": {
    "negative": 0.88,
    "neutral": 0.10,
    "positive": 0.02
  },
  "positivity": 0.02
}
```

---

### 2. Record Emotion Event

**Endpoint:** `POST /api/emotions/record`

**Required Inputs (JSON Body):**
```json
{
  "emotion": "anxiety",
  "intensity": 0.75,
  "source": "manual",
  "context": "Feeling anxious about tomorrow's meeting"
}
```

**Emotion options:**
- `sadness`, `stress`, `anxiety`, `frustration`, `loneliness`, `burnout`, `fatigue`, `anger`, `fear`, `joy`, `calm`

**Source options:**
- `manual` (user input)
- `journal` (from journaling)
- `face` (from face detection - future)
- `chat` (from chatbot conversation)

**Response:**
```json
{
  "emotion_recorded": true,
  "escalation_score": 0.65,
  "is_critical": false,
  "recommendations": [
    "Try a 5-minute breathing exercise",
    "Reach out to a friend",
    "Take a short walk"
  ]
}
```

---

### 3. Get Emotion Status

**Endpoint:** `GET /api/emotions/status`

**Required Inputs:**
- Authorization header

**Response:**
```json
{
  "current_escalation": 0.65,
  "escalation_level": "normal",
  "recent_emotions": ["anxiety", "stress"],
  "is_critical": false,
  "recommendations": [...]
}
```

---

### 4. WebSocket: Real-time Emotional Streaming

**Endpoint:** `WS /api/emotions/stream/{user_id}`

**Connection (JavaScript Example):**
```javascript
const token = localStorage.getItem('access_token');
const ws = new WebSocket(`ws://localhost:8000/api/emotions/stream/USER_ID?token=${token}`);

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Emotional Update:', data);
};

ws.send(JSON.stringify({
  type: "emotion_update",
  emotion: "joy",
  intensity: 0.8
}));
```

**Message Format (Incoming):**
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

## Journal Endpoints

### 1. Create Journal Entry

**Endpoint:** `POST /api/journal/create`

**Required Inputs (JSON Body):**
```json
{
  "content": "Today was challenging. I had a difficult conversation with my colleague and felt really frustrated. But then I went for a walk and felt better.",
  "mood_intensity": 0.6
}
```

**Response:**
```json
{
  "entry_id": "507f1f77bcf86cd799439011",
  "emotions_detected": {
    "frustration": 0.75,
    "anxiety": 0.45,
    "calm": 0.30
  },
  "dominant_emotion": "frustration",
  "sentiment": {
    "negative": 0.65,
    "neutral": 0.20,
    "positive": 0.15
  },
  "positivity": 0.15
}
```

---

### 2. Get Journal Entries

**Endpoint:** `GET /api/journal/list`

**Optional Query Parameters:**
```
skip: 0 (default)
limit: 10 (default)
days: 7 (default - last N days)
```

**Response:**
```json
{
  "total": 25,
  "entries": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "content": "Today was...",
      "dominant_emotion": "frustration",
      "created_at": "2026-05-06T10:30:00"
    }
  ]
}
```

---

### 3. Get Single Journal Entry

**Endpoint:** `GET /api/journal/{entry_id}`

**Required Inputs:**
- `entry_id` in URL path

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "content": "Today was...",
  "emotions_detected": { ... },
  "dominant_emotion": "frustration",
  "sentiment": { ... },
  "embeddings": [...],
  "created_at": "2026-05-06T10:30:00"
}
```

---

## Interventions Endpoints

### 1. Get Intervention Recommendations

**Endpoint:** `GET /api/interventions/recommend`

**Optional Query Parameters:**
```
emotion: "anxiety" (optional - specific emotion)
severity: 0.75 (optional - 0-1)
```

**Response:**
```json
{
  "recommendations": [
    {
      "id": "breathing_5m",
      "type": "breathing_exercise",
      "title": "5-Minute Breathing Exercise",
      "description": "A guided breathing exercise to calm anxiety",
      "duration_minutes": 5,
      "effectiveness_score": 0.82
    },
    {
      "id": "walk_10m",
      "type": "movement",
      "title": "10-Minute Walk",
      "description": "A gentle walk to clear your mind",
      "duration_minutes": 10,
      "effectiveness_score": 0.75
    }
  ]
}
```

---

### 2. Trigger Intervention

**Endpoint:** `POST /api/interventions/trigger/{intervention_type}`

**Required Inputs:**
- `intervention_type` in URL path (e.g., `breathing_exercise`, `meditation`, `grounding`, `movement`)
- JSON body:
```json
{
  "duration": 5,
  "intensity": "moderate"
}
```

**Response:**
```json
{
  "intervention_id": "507f1f77bcf86cd799439011",
  "status": "started",
  "type": "breathing_exercise",
  "estimated_duration": 5,
  "instructions": "Breathe in for 4 counts, hold for 4 counts, exhale for 4 counts..."
}
```

---

### 3. Log Intervention Feedback

**Endpoint:** `POST /api/interventions/feedback/{intervention_id}`

**Required Inputs:**
```json
{
  "effectiveness": 0.8,
  "feedback": "This really helped me feel calmer",
  "would_repeat": true
}
```

**Response:**
```json
{
  "message": "Feedback recorded",
  "intervention_id": "507f1f77bcf86cd799439011"
}
```

---

## Analytics Endpoints

### 1. Get Daily Wellness Score

**Endpoint:** `GET /api/analytics/daily-score`

**Optional Query Parameters:**
```
date: "2026-05-06" (optional - specific date, defaults to today)
```

**Response:**
```json
{
  "date": "2026-05-06",
  "emotional_wellness_score": 65.5,
  "stability_score": 72.0,
  "recovery_index": 58.3,
  "stress_exposure_score": 45.2,
  "trend": "improving"
}
```

---

### 2. Get Insights

**Endpoint:** `GET /api/analytics/insights`

**Response:**
```json
{
  "date": "2026-05-06",
  "key_insights": [
    "You had a stressful morning but recovered well after your walk",
    "Your anxiety peaks tend to occur around 2 PM",
    "You're more stable when you exercise regularly"
  ],
  "patterns": [
    "Stress increases on weekdays",
    "Anxiety is triggered by work meetings",
    "You feel calmer after journaling"
  ],
  "recommendations": [
    "Try scheduling breaks before meetings",
    "Continue your journaling habit",
    "Maintain consistent exercise schedule"
  ]
}
```

---

### 3. Get Full Dashboard

**Endpoint:** `GET /api/analytics/dashboard`

**Optional Query Parameters:**
```
days: 7 (optional - last N days)
```

**Response:**
```json
{
  "current_status": {
    "emotional_wellness_score": 65.5,
    "escalation_level": "normal"
  },
  "historical_data": [
    { "date": "2026-05-06", "score": 65.5 },
    { "date": "2026-05-05", "score": 58.2 }
  ],
  "emotional_patterns": {
    "dominant_emotions": ["stress", "anxiety"],
    "frequency": { "stress": 12, "anxiety": 8 }
  },
  "insights": { ... },
  "recovery_patterns": {
    "most_effective_intervention": "breathing_exercise",
    "average_recovery_time": "15 minutes"
  }
}
```

---

## Chatbot Endpoints

### 1. Send Message to Emotional Chatbot

**Endpoint:** `POST /api/chatbot/send-message`

**Required Inputs (JSON Body):**
```json
{
  "message": "I'm feeling really anxious right now",
  "emotional_context": {
    "current_emotion": "anxiety",
    "intensity": 0.75
  }
}
```

**Response:**
```json
{
  "message_id": "507f1f77bcf86cd799439011",
  "bot_response": "I understand you're feeling anxious. That's a valid emotion. What specifically is making you feel this way? Sometimes talking through it helps.",
  "suggested_actions": [
    "breathing_exercise",
    "grounding_technique",
    "meditation"
  ]
}
```

---

## Safe Links Endpoints

### 1. Add Comfort Content

**Endpoint:** `POST /api/safe-links/add`

**Required Inputs (JSON Body):**
```json
{
  "title": "Calming Meditation",
  "url": "https://youtube.com/watch?v=...",
  "category": "meditation"
}
```

**Category options:** `music`, `video`, `exercise`, `meditation`, `other`

**Response:**
```json
{
  "link_id": "507f1f77bcf86cd799439011",
  "message": "Safe link added successfully"
}
```

---

### 2. Get Safe Links List

**Endpoint:** `GET /api/safe-links/list`

**Optional Query Parameters:**
```
category: "meditation" (optional)
```

**Response:**
```json
{
  "total": 12,
  "links": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Calming Meditation",
      "url": "https://youtube.com/watch?v=...",
      "category": "meditation",
      "created_at": "2026-05-06T10:30:00"
    }
  ]
}
```

---

## SOS & Safety Endpoints

### 1. Add Emergency Contact

**Endpoint:** `POST /api/sos/contact/add`

**Required Inputs (JSON Body):**
```json
{
  "name": "Mom",
  "phone": "+1-555-123-4567",
  "email": "mom@example.com",
  "type": "family"
}
```

**Type options:** `emergency`, `friend`, `family`, `professional`

**Response:**
```json
{
  "contact_id": "507f1f77bcf86cd799439011",
  "message": "Emergency contact added"
}
```

---

### 2. Send SOS Alert

**Endpoint:** `POST /api/sos/alert`

**Required Inputs (JSON Body):**
```json
{
  "severity": "high",
  "message": "I'm in crisis and need help",
  "location": "Home"
}
```

**Severity options:** `low`, `moderate`, `high`, `critical`

**Response:**
```json
{
  "alert_id": "507f1f77bcf86cd799439011",
  "status": "sent",
  "contacts_notified": 3,
  "resources": [
    "National Crisis Hotline: 988",
    "Crisis Text Line: Text HOME to 741741"
  ]
}
```

---

## WebSocket Debug Endpoint

### Get Active Connections

**Endpoint:** `GET /api/ws/active`

**Response:**
```json
{
  "active_users": 2,
  "connections_per_user": {
    "507f1f77bcf86cd799439011": 1,
    "507f1f77bcf86cd799439012": 2
  }
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "detail": "Error message here"
}
```

**Common Error Codes:**
- `400` Bad Request - Invalid input
- `401` Unauthorized - Missing or invalid token
- `404` Not Found - Resource not found
- `500` Internal Server Error - Server error

---

## Testing with cURL

### Sign Up:
```bash
curl -X POST http://localhost:8000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "name": "Test User",
    "password": "Password123"
  }'
```

### Login:
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123"
  }'
```

### Get Profile (replace TOKEN with actual token):
```bash
curl -X GET http://localhost:8000/api/users/profile \
  -H "Authorization: Bearer TOKEN"
```

### Create Journal Entry:
```bash
curl -X POST http://localhost:8000/api/journal/create \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Today was a good day",
    "mood_intensity": 0.75
  }'
```

---

## Environment Setup

Create a `.env` file in the `backend/` folder:

```
MONGODB_URL=mongodb+srv://user:password@cluster.mongodb.net/mindtrace_db
MONGODB_DB=mindtrace_db
REDIS_URL=redis://localhost:6379/0
SECRET_KEY=your-secret-key-here
DEBUG=True
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
CORS_ORIGINS=["http://localhost:3000", "http://localhost:8081"]
ESCALATION_THRESHOLD=0.7
CRITICAL_THRESHOLD=0.85
WINDOW_SIZE=3600
```

---

## Next Steps

1. **Local Testing**: Use the Swagger UI at `http://localhost:8000/docs` for interactive API testing
2. **Database Setup**: Configure MongoDB connection in `.env`
3. **Frontend Integration**: Update `frontend/simple_client/index.html` to make API calls
4. **Real-time Features**: Connect to WebSocket endpoints for live emotional tracking

Enjoy using MINDTRACE AI+!
