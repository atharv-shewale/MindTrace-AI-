# MINDTRACE AI+ — Project Structure & Modularity Guide

## Overview

MINDTRACE AI+ is a FastAPI-based backend system for real-time emotional intelligence and adaptive wellness tracking. The codebase is organized for maximum modularity, reusability, and scalability.

---

## Directory Structure

```
backend/
├── main.py                         # FastAPI app entry point
├── requirements.txt                # Python dependencies
├── .env.example                    # Environment variables template
├── README.md                       # Backend setup guide
├── app/
│   ├── __init__.py                 # Package marker
│   ├── core/                       # Core application logic
│   │   ├── __init__.py
│   │   ├── config.py              # Pydantic settings & configuration
│   │   ├── database.py            # MongoDB async driver & connection
│   │   └── security.py            # JWT auth & password hashing
│   ├── api/                        # API route handlers (8 modules)
│   │   ├── __init__.py
│   │   ├── auth.py                # Sign up, login, refresh token
│   │   ├── users.py               # User profile management
│   │   ├── emotions.py            # Emotion detection & recording
│   │   ├── journal.py             # Journal entries CRUD
│   │   ├── interventions.py       # Intervention recommendations
│   │   ├── analytics.py           # Wellness scores & insights
│   │   ├── chatbot.py             # Emotional chatbot
│   │   ├── sos.py                 # SOS & emergency features
│   │   ├── safe_links.py          # Comfort content management
│   │   └── websockets.py          # WebSocket debug endpoint
│   ├── services/                   # Business logic & engines
│   │   ├── __init__.py
│   │   ├── emotional_tracking.py   # Real-time emotion tracking
│   │   ├── scoring_engine.py       # Wellness score calculation
│   │   ├── intervention_engine.py  # Intervention recommendations
│   │   └── analytics_engine.py     # Analytics & insights
│   ├── ai/                         # AI/ML components
│   │   ├── __init__.py
│   │   └── emotion_detector.py     # Emotion detection engine (lazy-loaded)
│   ├── websocket/                  # WebSocket management
│   │   ├── __init__.py
│   │   └── manager.py              # Connection lifecycle & broadcast
│   └── schemas/                    # Data validation models
│       ├── __init__.py
│       └── models.py               # Pydantic models for all entities
└── app.db                          # SQLite (if used locally)
```

---

## Core Architecture

### 1. **app/core/** — Foundation Layer

#### `config.py` — Configuration Management
- **Purpose**: Centralized environment variable handling
- **Key Classes**: `Settings` (Pydantic BaseSettings)
- **Exports**: `settings` singleton
- **Usage**:
  ```python
  from app.core.config import settings
  db_url = settings.MONGODB_URL
  secret = settings.SECRET_KEY
  ```
- **Responsibilities**:
  - Load environment variables from `.env`
  - Validate configuration on startup
  - Provide defaults for optional configs
  - Expose all settings to rest of application

#### `database.py` — MongoDB Async Driver
- **Purpose**: Async MongoDB connection management
- **Key Functions**: 
  - `connect_to_mongo()` — Called at app startup
  - `close_mongo_connection()` — Called at shutdown
  - `get_database()` — Returns active database instance
- **Exports**: `client` (AsyncIOMotorClient), `db` (AsyncIOMotorDatabase)
- **Usage**:
  ```python
  from app.core.database import get_database
  db = get_database()
  users = await db.users.find_one({"_id": ObjectId(user_id)})
  ```
- **Collections** (auto-created on first use):
  - `users` — User accounts
  - `realtime_emotion_events` — Emotion records
  - `journal_entries` — Journal entries
  - `intervention_logs` — Intervention history
  - `wellness_scores` — Daily scores
  - `user_safe_links` — Comfort content
  - `sos_contacts` — Emergency contacts
  - `chat_history` — Chatbot messages

#### `security.py` — Authentication & Authorization
- **Purpose**: JWT token generation/validation + password hashing
- **Key Functions**:
  - `hash_password(password)` — Bcrypt hashing
  - `verify_password(plain, hashed)` — Bcrypt verification
  - `create_access_token(data, expires_delta)` — JWT token generation
  - `verify_token(token)` — JWT validation
  - `get_current_user(credentials)` — Dependency for protected routes
- **Dependencies**: `python-jose`, `passlib`, `bcrypt`
- **Usage**:
  ```python
  from app.core.security import get_current_user
  
  @router.get("/profile")
  async def get_profile(current_user: dict = Depends(get_current_user)):
      user_id = current_user["sub"]
      # ...
  ```
- **Token Format**: JWT with `sub` (user_id), `email`, `exp` claims

---

### 2. **app/schemas/** — Data Validation Layer

#### `models.py` — Pydantic Models
- **Purpose**: Request/response validation and serialization
- **Key Models**:
  - `UserCreate`, `User` — User data
  - `EmotionEventCreate`, `EmotionEvent` — Emotion tracking
  - `JournalEntryCreate`, `JournalEntry` — Journal entries
  - `InterventionLog` — Intervention history
  - `ChatMessage` — Chatbot messages
  - `SafeLink` — Comfort content
  - `SOSContact` — Emergency contacts
  - `WellnessScore` — Daily scores
  - `DailyInsight` — Personalized insights

- **Features**:
  - Automatic validation on POST/PUT
  - JSON serialization/deserialization
  - Default values and optional fields
  - Field aliases for MongoDB (`_id` ↔ `id`)
  - Config for `populate_by_name` compatibility

---

### 3. **app/services/** — Business Logic Layer

#### `emotional_tracking.py` — Realtime Emotion Tracking
- **Class**: `EmotionalTrackingEngine`
- **Responsibilities**:
  - Track emotion events in-memory with sliding window
  - Calculate escalation scores (0-1 scale)
  - Detect escalation patterns
  - Compute emotional statistics
- **Key Methods**:
  - `add_emotion_event(user_id, emotion, intensity, source)` → escalation score
  - `detect_escalation_patterns(user_id)` → escalation level + trigger emotions
  - `get_emotional_stats(user_id, hours=24)` → dominant emotions, volatility
- **Singleton**: `emotional_tracking_engine` instance in module
- **Usage**:
  ```python
  from app.services.emotional_tracking import emotional_tracking_engine
  result = emotional_tracking_engine.add_emotion_event(
      user_id="...", emotion="anxiety", intensity=0.75, source="manual"
  )
  ```

#### `scoring_engine.py` — Wellness Score Calculation
- **Class**: `ScoringEngine`
- **Responsibilities**:
  - Calculate daily wellness scores
  - Compute emotional wellness, stability, recovery metrics
  - Generate score trends
- **Key Methods**:
  - `generate_daily_score(user_id, emotional_events, interventions)` → score object
  - `calculate_stability_score(emotions)` → 0-100
  - `calculate_recovery_index(interventions)` → recovery effectiveness
- **Singleton**: `scoring_engine` instance
- **Usage**:
  ```python
  from app.services.scoring_engine import scoring_engine
  daily = scoring_engine.generate_daily_score(
      user_id="...", emotional_events=[...], interventions=[...]
  )
  ```

#### `intervention_engine.py` — Intervention Recommendations
- **Class**: `InterventionEngine`
- **Responsibilities**:
  - Recommend interventions based on escalation level
  - Generate intervention sequences
  - Track intervention effectiveness
- **Predefined Interventions**:
  - `breathing_exercise` — Guided breathing (5-10 mins)
  - `meditation` — Guided meditation (10-20 mins)
  - `grounding` — 5-senses grounding technique
  - `movement` — Physical activity recommendations
  - `journaling` — Reflective writing
  - `social_connection` — Reach out to contacts
  - `self_care` — Self-care activities
- **Key Methods**:
  - `recommend_interventions(escalation_pattern, user_safe_links)` → recommendations
  - `generate_intervention_sequence(escalation_pattern)` → ordered list
- **Singleton**: `intervention_engine` instance
- **Usage**:
  ```python
  from app.services.intervention_engine import intervention_engine
  recs = intervention_engine.recommend_interventions(
      escalation_pattern=..., user_safe_links=[...]
  )
  ```

#### `analytics_engine.py` — Analytics & Insights
- **Class**: `AnalyticsEngine`
- **Responsibilities**:
  - Generate daily insights
  - Detect emotional patterns
  - Provide recommendations
  - Calculate trend analysis
- **Key Methods**:
  - `generate_daily_insights(user_id, emotional_events)` → insights object
  - `detect_patterns(emotional_events)` → recurring patterns
  - `calculate_trends(wellness_history)` → trend direction + velocity
- **Singleton**: `analytics_engine` instance
- **Usage**:
  ```python
  from app.services.analytics_engine import analytics_engine
  insights = analytics_engine.generate_daily_insights(
      user_id="...", emotional_events=[...]
  )
  ```

---

### 4. **app/ai/** — Machine Learning Layer

#### `emotion_detector.py` — Emotion Detection Engine
- **Class**: `EmotionDetectionEngine`
- **Responsibilities**:
  - Detect emotions from text using transformer models
  - Analyze sentiment (positive/negative/neutral)
  - Generate text embeddings for semantic search
  - Lazy-load ML models (graceful fallback if unavailable)
- **Models Used** (if available):
  - `j-hartmann/emotion-english-distilroberta-base` — Emotion detection
  - `cardiffnlp/twitter-roberta-base-sentiment-latest` — Sentiment analysis
  - `sentence-transformers/all-MiniLM-L6-v2` — Embeddings
- **Key Methods**:
  - `initialize()` — Async init (loads models on first call)
  - `detect_emotions(text)` → emotion probabilities
  - `analyze_sentiment(text)` → positive/negative/neutral scores
  - `analyze_text_comprehensive(text)` → combined analysis
  - `get_embeddings(text)` → vector representation
- **Singleton**: `emotion_engine` instance
- **Graceful Degradation**: 
  - If ML packages missing, logs warning and sets `_available=False`
  - Methods return empty/default responses
  - Backend continues working
- **Usage**:
  ```python
  from app.ai.emotion_detector import emotion_engine
  analysis = await emotion_engine.analyze_text_comprehensive("I'm anxious")
  # Returns: {"emotions": {...}, "sentiment": {...}, "embeddings": [...]}
  ```

---

### 5. **app/websocket/** — Real-time Communication

#### `manager.py` — Connection Management
- **Class**: `ConnectionManager`
- **Responsibilities**:
  - Manage WebSocket connections per user
  - Send real-time updates
  - Broadcast emotional events
  - Handle connection lifecycle
- **Data Structure**:
  ```python
  active_connections: Dict[str, Set[WebSocket]]
  # user_id -> set of connected WebSockets
  ```
- **Key Methods**:
  - `connect(websocket, user_id)` — Register connection
  - `disconnect(websocket, user_id)` — Unregister connection
  - `send_personal_message(message, user_id)` → to all user's connections
  - `broadcast_to_user(user_id, event_type, data)` → typed events
  - `broadcast_emotional_update(...)` → emotion-specific events
- **Singleton**: `manager = ConnectionManager()` instance in `main.py`
- **Usage**:
  ```python
  from app.websocket.manager import manager
  await manager.broadcast_to_user(
      user_id=user_id,
      event_type="emotion_detected",
      data={"emotion": "anxiety", "intensity": 0.75}
  )
  ```

---

### 6. **app/api/** — Route Handlers (8 modules)

Each module is a self-contained router with its own routes and business logic.

#### `auth.py` — Authentication
- **Routes**:
  - `POST /api/auth/signup` → Register new user
  - `POST /api/auth/login` → Get JWT token
  - `POST /api/auth/refresh` → Refresh token
- **Dependencies**: `security.py`, `database.py`, `schemas/models.py`
- **Database Collections**: `users`

#### `users.py` — User Management
- **Routes**:
  - `GET /api/users/profile` → Get user profile
  - `PUT /api/users/profile` → Update profile
  - `GET /api/users/wellness-stats` → Wellness statistics
- **Dependencies**: `security.py`, `database.py`
- **Auth**: All routes require JWT token

#### `emotions.py` — Emotion Tracking
- **Routes**:
  - `POST /api/emotions/detect` → Analyze text for emotions
  - `POST /api/emotions/record` → Record emotion event
  - `GET /api/emotions/status` → Current escalation status
  - `WS /api/emotions/stream/{user_id}` → Real-time stream
- **Dependencies**: `security.py`, `database.py`, `ai/emotion_detector.py`, `services/emotional_tracking.py`, `websocket/manager.py`
- **Database Collections**: `realtime_emotion_events`

#### `journal.py` — Journal Management
- **Routes**:
  - `POST /api/journal/create` → Create entry
  - `GET /api/journal/list` → List entries
  - `GET /api/journal/{entry_id}` → Get single entry
  - `PUT /api/journal/{entry_id}` → Update entry
  - `DELETE /api/journal/{entry_id}` → Delete entry
- **Dependencies**: `security.py`, `database.py`, `ai/emotion_detector.py`
- **Database Collections**: `journal_entries`

#### `interventions.py` — Intervention Management
- **Routes**:
  - `GET /api/interventions/recommend` → Get recommendations
  - `GET /api/interventions/sequence` → Intervention workflow
  - `POST /api/interventions/trigger/{type}` → Trigger intervention
  - `POST /api/interventions/feedback/{id}` → Log feedback
- **Dependencies**: `security.py`, `database.py`, `services/intervention_engine.py`, `services/emotional_tracking.py`
- **Database Collections**: `intervention_logs`, `user_safe_links`

#### `analytics.py` — Analytics & Insights
- **Routes**:
  - `GET /api/analytics/daily-score` → Wellness score
  - `GET /api/analytics/insights` → Daily insights
  - `GET /api/analytics/dashboard` → Full analytics dashboard
  - `GET /api/analytics/trends` → Historical trends
- **Dependencies**: `security.py`, `database.py`, `services/scoring_engine.py`, `services/analytics_engine.py`
- **Database Collections**: `wellness_scores`, `realtime_emotion_events`

#### `chatbot.py` — Emotional Chatbot
- **Routes**:
  - `POST /api/chatbot/send-message` → Send message to chatbot
  - `GET /api/chatbot/history` → Get conversation history
- **Dependencies**: `security.py`, `database.py`, `ai/emotion_detector.py`
- **Database Collections**: `chat_history`

#### `sos.py` — Safety & Emergency
- **Routes**:
  - `POST /api/sos/contact/add` → Add emergency contact
  - `GET /api/sos/contacts` → List contacts
  - `DELETE /api/sos/contact/{id}` → Delete contact
  - `POST /api/sos/alert` → Send SOS alert
- **Dependencies**: `security.py`, `database.py`
- **Database Collections**: `sos_contacts`

#### `safe_links.py` — Comfort Content
- **Routes**:
  - `POST /api/safe-links/add` → Add comfort content
  - `GET /api/safe-links/list` → List links
  - `DELETE /api/safe-links/{id}` → Delete link
- **Dependencies**: `security.py`, `database.py`
- **Database Collections**: `user_safe_links`

#### `websockets.py` — WebSocket Debug
- **Routes**:
  - `GET /api/ws/active` → Active connections info
- **Dependencies**: `websocket/manager.py`

---

## Data Flow

### Example: Record Emotion Flow

```
User Request (POST /api/emotions/record)
    ↓
[Route Handler] emotions.py:record_emotion()
    ↓
    ├─→ [Auth] get_current_user() ← validates JWT
    ├─→ [Service] emotional_tracking_engine.add_emotion_event()
    │   ├─→ Calculate emotion weight
    │   ├─→ Calculate escalation score
    │   └─→ Return escalation metrics
    ├─→ [Database] db.realtime_emotion_events.insert_one()
    ├─→ [WebSocket] manager.broadcast_emotional_update()
    │   └─→ Send real-time notification to user
    └─→ Return response
         ↓
Response (emotion_recorded, escalation_score, recommendations)
```

### Example: Get Insights Flow

```
User Request (GET /api/analytics/insights)
    ↓
[Route Handler] analytics.py:get_daily_insights()
    ↓
    ├─→ [Auth] get_current_user()
    ├─→ [Database] db.wellness_scores.find_one()
    ├─→ [Database] db.realtime_emotion_events.find()
    ├─→ [Service] analytics_engine.generate_daily_insights()
    │   ├─→ Analyze emotional patterns
    │   ├─→ Detect recurring emotions
    │   ├─→ Generate recommendations
    │   └─→ Calculate trend analysis
    └─→ Return insights object
         ↓
Response (insights, patterns, recommendations)
```

---

## Modularity Principles

### 1. **Separation of Concerns**
- **Routes** (`app/api/`) — Handle HTTP requests
- **Business Logic** (`app/services/`) — Core algorithms
- **AI/ML** (`app/ai/`) — ML components
- **Data** (`app/core/database.py`) — Database access
- **Auth** (`app/core/security.py`) — Security
- **Schemas** (`app/schemas/`) — Validation

### 2. **Dependency Injection**
```python
# Routes depend on services, not implementations
@router.get("/recommend")
async def get_recommendations(
    current_user: dict = Depends(get_current_user)
):
    # Use injected dependency
    pass
```

### 3. **Singleton Patterns**
```python
# Core services exported as singletons
from app.services.emotional_tracking import emotional_tracking_engine
from app.services.intervention_engine import intervention_engine
from app.services.scoring_engine import scoring_engine
```

### 4. **Graceful Degradation**
```python
# ML features fail gracefully
# If torch/transformers missing:
# - Log warning
# - Set _available=False
# - Return empty/default responses
# - Backend continues working
```

### 5. **Loose Coupling**
- Routes don't directly import other routes
- Services don't know about API layer
- Each module has clear inputs/outputs
- Easy to replace/mock components

### 6. **High Cohesion**
- Each module has single responsibility
- Related functionality grouped together
- Clear interfaces between modules

---

## Environment Setup

### Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### Configure Environment
```bash
cp .env.example .env
# Edit .env with your configuration
```

### Run Application
```bash
uvicorn main:app --reload
```

### Access API Documentation
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

---

## Adding New Features

### 1. Add Pydantic Model
```python
# app/schemas/models.py
class MyNewModel(BaseModel):
    field1: str
    field2: int
```

### 2. Create Service Logic
```python
# app/services/my_service.py
class MyService:
    def my_method(self, ...):
        # Business logic
        pass

my_service = MyService()  # Singleton
```

### 3. Add API Route
```python
# app/api/my_feature.py
from fastapi import APIRouter, Depends
from app.core.security import get_current_user
from app.services.my_service import my_service

router = APIRouter()

@router.get("/my-endpoint")
async def my_endpoint(current_user: dict = Depends(get_current_user)):
    result = my_service.my_method(...)
    return result
```

### 4. Register Route in main.py
```python
from app.api import my_feature
app.include_router(my_feature.router, prefix="/api/my-feature", tags=["My Feature"])
```

---

## Error Handling

All endpoints return errors in this format:
```json
{
  "detail": "Error message"
}
```

**Status Codes**:
- `200` OK — Success
- `201` Created — Resource created
- `400` Bad Request — Validation error
- `401` Unauthorized — Missing/invalid token
- `403` Forbidden — Permission denied
- `404` Not Found — Resource not found
- `500` Internal Server Error — Server error

---

## Testing

### Using Swagger UI
1. Navigate to http://localhost:8000/docs
2. Click on endpoint
3. Click "Try it out"
4. Enter parameters
5. Click "Execute"

### Using cURL
```bash
curl -X POST http://localhost:8000/api/emotions/record \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"emotion":"anxiety","intensity":0.75,"source":"manual"}'
```

### Using Python
```python
import requests

headers = {"Authorization": f"Bearer {token}"}
response = requests.post(
    "http://localhost:8000/api/emotions/record",
    json={"emotion": "anxiety", "intensity": 0.75, "source": "manual"},
    headers=headers
)
print(response.json())
```

---

## Performance Considerations

1. **In-Memory Tracking**: `emotional_tracking_engine` uses in-memory storage for real-time performance
2. **Sliding Windows**: Old events automatically cleaned to prevent memory bloat
3. **Lazy ML Loading**: Models loaded only when first needed
4. **Async Database**: All DB calls are non-blocking
5. **WebSocket Broadcast**: Efficient connection management

---

## Security Features

1. **JWT Authentication**: All protected routes require valid token
2. **Password Hashing**: Bcrypt with salt
3. **CORS**: Configurable origins
4. **Async Operations**: Prevent blocking attacks
5. **Input Validation**: Pydantic models validate all inputs

---

## Extending the System

### Add New Emotion Type
1. Update `emotional_tracking_engine.emotion_weights`
2. Update emotion model validation
3. Add handling in analytics engines

### Add New Intervention
1. Add to `intervention_engine.interventions`
2. Create route handler
3. Add to intervention recommendations logic

### Connect to Frontend
1. Use JWT from login endpoint
2. Include token in `Authorization` header
3. Connect to WebSocket with token in query string
4. Parse event messages from WebSocket stream

---

## Production Deployment

For production:
1. Set `DEBUG=False` in `.env`
2. Generate strong `SECRET_KEY` (use: `python -c "import secrets; print(secrets.token_urlsafe(32))"`)
3. Use production MongoDB cluster
4. Use production Redis instance
5. Set up reverse proxy (nginx)
6. Enable HTTPS
7. Update `CORS_ORIGINS` to production domain

See `DEPLOYMENT.md` for detailed instructions.

---

Enjoy building with MINDTRACE AI+!
