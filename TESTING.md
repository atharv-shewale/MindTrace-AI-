# MINDTRACE AI+ - Testing Guide

Complete testing strategy and procedures for MINDTRACE AI+ platform.

## 🧪 Testing Strategy

### Test Pyramid

```
        /\
       /  \         E2E Tests (10%)
      /____\
     /      \
    /        \      Integration Tests (30%)
   /___      _\
  /     \    /  \
 /       \  /    \  Unit Tests (60%)
/_________\/_____\
```

## 🔬 Unit Tests

### Backend

```bash
cd backend

# Install test dependencies
pip install pytest pytest-asyncio pytest-cov

# Run all tests
pytest tests/ -v

# Run with coverage
pytest tests/ --cov=app --cov-report=html

# Run specific test
pytest tests/test_emotion_detector.py -v

# Run with markers
pytest -m "unit" -v
```

### Sample Unit Tests

#### Emotion Detection Tests
```python
# tests/test_emotion_detector.py
import pytest
from app.ai.emotion_detector import emotion_engine

@pytest.mark.asyncio
async def test_detect_sadness():
    text = "I feel really sad and alone"
    emotions = await emotion_engine.detect_emotions(text)
    
    assert "sadness" in emotions
    assert emotions["sadness"] > 0.5

@pytest.mark.asyncio
async def test_detect_joy():
    text = "I'm so happy and excited!"
    emotions = await emotion_engine.detect_emotions(text)
    
    assert "joy" in emotions or "love" in emotions
    assert max(emotions.values()) > 0.5
```

#### Emotional Tracking Tests
```python
# tests/test_emotional_tracking.py
from app.services.emotional_tracking import emotional_tracking_engine

def test_add_emotion_event():
    result = emotional_tracking_engine.add_emotion_event(
        user_id="test_user",
        emotion="sadness",
        intensity=0.8,
        source="journal"
    )
    
    assert result["event_added"] == True
    assert result["escalation_score"] > 0

def test_escalation_detection():
    # Add multiple negative emotions
    for i in range(5):
        emotional_tracking_engine.add_emotion_event(
            user_id="test_user",
            emotion="stress",
            intensity=0.9,
            source="test"
        )
    
    escalation = emotional_tracking_engine.detect_escalation_patterns("test_user")
    
    assert escalation["is_escalating"] == True
    assert escalation["escalation_level"] != "normal"
```

#### Scoring Tests
```python
# tests/test_scoring_engine.py
from app.services.scoring_engine import scoring_engine
from datetime import datetime

def test_wellness_score_calculation():
    events = [
        {"emotion": "joy", "intensity": 0.9, "timestamp": datetime.utcnow()},
        {"emotion": "calm", "intensity": 0.8, "timestamp": datetime.utcnow()},
    ]
    
    score = scoring_engine.calculate_wellness_score(events, escalation_score=0.1)
    
    assert score > 70  # Should be high for positive emotions

def test_stress_exposure_score():
    events = [
        {"emotion": "stress", "intensity": 0.9, "timestamp": datetime.utcnow()},
        {"emotion": "anxiety", "intensity": 0.8, "timestamp": datetime.utcnow()},
    ]
    
    stress_score = scoring_engine.calculate_stress_exposure_score(events, 0.5)
    
    assert stress_score > 50
```

### Frontend

```bash
cd frontend

# Install testing dependencies
npm install --save-dev @testing-library/react-native @testing-library/jest-native jest

# Run tests
npm test

# Run with coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
```

## 🔗 Integration Tests

### API Integration Tests

```bash
cd backend

# Install test client
pip install httpx pytest-asyncio

# Run integration tests
pytest tests/integration/ -v
```

### Sample Integration Tests

```python
# tests/integration/test_emotion_flow.py
import pytest
from httpx import AsyncClient
from main import app

@pytest.mark.asyncio
async def test_emotion_detection_flow():
    async with AsyncClient(app=app, base_url="http://test") as client:
        # 1. Signup
        response = await client.post(
            "/api/auth/signup",
            json={
                "email": "test@example.com",
                "username": "testuser",
                "name": "Test User",
                "password": "password123"
            }
        )
        assert response.status_code == 200
        token = response.json()["access_token"]
        
        # 2. Detect emotion
        headers = {"Authorization": f"Bearer {token}"}
        response = await client.post(
            "/api/emotions/detect",
            json={"text": "I feel really sad"},
            headers=headers
        )
        assert response.status_code == 200
        data = response.json()
        assert "emotions" in data
        assert "sadness" in data["emotions"]
        
        # 3. Record emotion
        response = await client.post(
            "/api/emotions/record",
            json={
                "emotion": "sadness",
                "intensity": 0.8,
                "source": "test"
            },
            headers=headers
        )
        assert response.status_code == 200
        assert response.json()["event_recorded"] == True
```

### Database Integration Tests

```python
# tests/integration/test_database.py
import pytest
from motor.motor_asyncio import AsyncClient
from app.core.database import connect_to_mongo, close_mongo_connection, get_database

@pytest.fixture
async def db():
    await connect_to_mongo()
    yield get_database()
    await close_mongo_connection()

@pytest.mark.asyncio
async def test_insert_and_retrieve(db):
    # Insert
    result = await db.users.insert_one({
        "email": "test@example.com",
        "username": "testuser",
        "name": "Test"
    })
    
    # Retrieve
    user = await db.users.find_one({"_id": result.inserted_id})
    assert user is not None
    assert user["email"] == "test@example.com"
```

## 📱 E2E Tests

### Cypress (Web)

```bash
cd frontend

# Install Cypress
npm install --save-dev cypress

# Open Cypress
npx cypress open

# Run headless
npx cypress run
```

### Sample E2E Test

```javascript
// cypress/e2e/emotion_flow.cy.js
describe('Emotion Detection Flow', () => {
  beforeEach(() => {
    cy.visit('http://localhost:19006')
  })

  it('should detect and record emotions', () => {
    // Signup
    cy.contains('Sign Up').click()
    cy.get('[testID="email"]').type('test@example.com')
    cy.get('[testID="password"]').type('password123')
    cy.contains('Create Account').click()
    
    // Wait for home screen
    cy.contains('Home', { timeout: 5000 }).should('be.visible')
    
    // Write journal
    cy.contains('Journal').click()
    cy.get('[testID="journal-input"]').type('I feel really sad today')
    cy.contains('Analyze').click()
    
    // Should detect sadness
    cy.contains('Sadness', { timeout: 3000 }).should('be.visible')
    cy.contains('Wellness Score').should('be.visible')
  })

  it('should trigger intervention on escalation', () => {
    // Login
    cy.login('test@example.com', 'password123')
    
    // Record multiple negative emotions
    for (let i = 0; i < 5; i++) {
      cy.recordEmotion('stress', 0.9)
    }
    
    // Should show escalation alert
    cy.contains('Emotional Escalation Detected', { timeout: 5000 })
      .should('be.visible')
    
    // Should show interventions
    cy.contains('Breathing Exercise').should('be.visible')
    cy.contains('Grounding Technique').should('be.visible')
  })
})
```

### Detox (Mobile)

```bash
cd frontend

# Install Detox
npm install --save-dev detox-cli detox

# Initialize
detox init -r ios

# Build
detox build-framework-cache
detox build-app --configuration ios.sim.debug

# Run
detox test --configuration ios.sim.debug
```

## ⚡ Performance Tests

### Load Testing with Locust

```bash
pip install locust
```

```python
# load_test.py
from locust import HttpUser, task, between

class MindtraceUser(HttpUser):
    wait_time = between(1, 3)
    token = None

    def on_start(self):
        # Signup
        response = self.client.post("/api/auth/signup", json={
            "email": f"user_{self.client.base_url}@test.com",
            "username": "testuser",
            "name": "Test",
            "password": "password123"
        })
        self.token = response.json()["access_token"]

    @task
    def detect_emotion(self):
        self.client.post(
            "/api/emotions/detect",
            json={"text": "I feel stressed"},
            headers={"Authorization": f"Bearer {self.token}"}
        )

    @task
    def get_wellness_score(self):
        self.client.get(
            "/api/analytics/daily-score",
            headers={"Authorization": f"Bearer {self.token}"}
        )

    @task
    def journal_entry(self):
        self.client.post(
            "/api/journal/create",
            json={"content": "My journal entry"},
            headers={"Authorization": f"Bearer {self.token}"}
        )
```

```bash
# Run load test
locust -f load_test.py --host=http://localhost:8000 -u 100 -r 10
```

## 🧪 Test Coverage Goals

| Module | Target Coverage | Status |
|--------|-----------------|--------|
| Emotion Detection | 95% | 🟢 |
| Emotional Tracking | 95% | 🟢 |
| Scoring Engine | 95% | 🟢 |
| Intervention Engine | 90% | 🟢 |
| Analytics Engine | 90% | 🟢 |
| API Endpoints | 85% | 🟡 |
| Frontend Components | 80% | 🟡 |
| **Overall** | **90%** | 🟡 |

## 🔄 Continuous Testing

### GitHub Actions

Tests run automatically on:
- Pull requests
- Commits to main/develop
- Scheduled nightly

```bash
# View test results
gh workflow view backend.yml --log
```

## 🐛 Debugging Tests

### Backend

```bash
# Run tests with print output
pytest tests/ -v -s

# Run specific test with pdb
pytest tests/test_specific.py::test_function -v --pdb

# Check coverage report
open htmlcov/index.html
```

### Frontend

```bash
# Run tests in watch mode
npm test -- --watch

# Debug in Chrome DevTools
node --inspect-brk ./node_modules/.bin/jest --runInBand
```

## ✅ Pre-Release Checklist

- [ ] All unit tests passing
- [ ] Integration tests passing
- [ ] E2E tests passing
- [ ] Load testing (100+ users)
- [ ] Security scanning (OWASP)
- [ ] Code coverage > 90%
- [ ] Performance benchmarks met
- [ ] Documentation updated
- [ ] Dependencies updated
- [ ] Security audit passed

## 📊 Test Metrics

```python
# tests/conftest.py - Generate test report
import pytest

@pytest.hookimpl(tryfirst=True, hookwrapper=True)
def pytest_runtest_makereport(item, call):
    outcome = yield
    rep = outcome.get_result()
    
    if rep.when == "call":
        print(f"Test: {item.name}, Status: {rep.outcome}, Duration: {rep.duration:.2f}s")
```

## 🔗 Resources

- [Pytest Documentation](https://docs.pytest.org/)
- [React Native Testing](https://callstack.github.io/react-native-testing-library/)
- [FastAPI Testing](https://fastapi.tiangolo.com/advanced/testing-dependencies/)
- [Cypress Documentation](https://docs.cypress.io/)
- [Locust Load Testing](https://locust.io/)

---

**Testing is continuous, not a phase!** 🧪
