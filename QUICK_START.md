# MINDTRACE AI+ MVP — Quick Start Execution Guide

## 🚀 Get Running in 5 Minutes

### Prerequisites Check
- ✅ Python 3.10+ installed (`python --version`)
- ✅ Git installed (`git --version`)
- ✅ Terminal/PowerShell ready

---

## Step 1: Setup Backend (2 minutes)

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

**Expected output:**
```
Successfully installed fastapi-0.104.1 uvicorn-0.24.0 pydantic-2.5.0 ...
```

---

## Step 2: Configure Environment (1 minute)

```bash
# Copy environment template
cp .env.example .env

# Edit .env (open in your editor)
# Minimum required changes:
# - MONGODB_URL: mongodb://localhost:27017/mindtrace_db (for local testing)
# - SECRET_KEY: Keep as-is or generate: python -c "import secrets; print(secrets.token_urlsafe(32))"
```

**For local development, just keep defaults in .env** (MongoDB will try localhost)

---

## Step 3: Start Backend (1 minute)

```bash
# Make sure you're in backend directory and venv is activated
uvicorn main:app --reload
```

**Expected output:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete
✓ Connected to MongoDB
```

If MongoDB connection fails, that's OK for testing—continue to next step.

---

## Step 4: Verify Backend is Running (1 minute)

**Option A: Browser**
1. Open http://localhost:8000/docs
2. You should see the Swagger UI with all API endpoints
3. Try the "Health Check" endpoint (GET /health)

**Option B: Terminal (new window)**
```bash
curl http://localhost:8000/health
# Output: {"status":"healthy"}
```

**Option C: Test with Python**
```python
import requests
response = requests.get('http://localhost:8000/health')
print(response.json())
# Output: {'status': 'healthy'}
```

---

## 🎯 You're Now Running!

Your MINDTRACE AI+ backend is now running at **http://localhost:8000**

### 📚 Access Points:
- **API Docs (Interactive):** http://localhost:8000/docs
- **Alternative Docs (ReDoc):** http://localhost:8000/redoc
- **Health Check:** http://localhost:8000/health
- **Root Endpoint:** http://localhost:8000

---

## 🧪 Test Your First Endpoints

### Sign Up (Create Account)

**Using Swagger UI:**
1. Open http://localhost:8000/docs
2. Find "POST /api/auth/signup"
3. Click "Try it out"
4. Fill in:
   ```json
   {
     "email": "test@example.com",
     "username": "testuser",
     "name": "Test User",
     "password": "SecurePass123"
   }
   ```
5. Click "Execute"

**Using cURL:**
```bash
curl -X POST http://localhost:8000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "name": "Test User",
    "password": "SecurePass123"
  }'
```

**Expected Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user_id": "507f1f77bcf86cd799439011"
}
```

### Login (Get Token)

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123"
  }'
```

**Expected Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user_id": "507f1f77bcf86cd799439011"
}
```

**Save the access_token** — you'll need it for other endpoints!

### Get Your Profile

Replace `TOKEN` with your actual access_token:

```bash
curl -X GET http://localhost:8000/api/users/profile \
  -H "Authorization: Bearer TOKEN"
```

### Record an Emotion

```bash
curl -X POST http://localhost:8000/api/emotions/record \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "emotion": "anxiety",
    "intensity": 0.75,
    "source": "manual",
    "context": "Feeling nervous about tomorrow"
  }'
```

---

## 📖 Complete API Documentation

See **[USER_GUIDE.md](USER_GUIDE.md)** for:
- ✅ All 30+ endpoints documented
- ✅ Request/response examples
- ✅ All required input fields
- ✅ Error handling
- ✅ More cURL examples

---

## 🏗️ Understanding the Architecture

See **[PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)** for:
- ✅ Directory organization
- ✅ Module responsibilities
- ✅ How data flows through the system
- ✅ How to add new features

---

## 🔧 Troubleshooting

### Issue: "Port 8000 already in use"

**Solution:** Use a different port
```bash
uvicorn main:app --port 8001 --reload
# Now access at http://localhost:8001
```

### Issue: "ModuleNotFoundError: No module named 'motor'"

**Solution:** Reinstall dependencies
```bash
pip install -r requirements.txt
```

### Issue: "Cannot connect to MongoDB"

**Solution:** This is OK for testing!
- The backend will still start and most endpoints will work
- For full functionality, set up MongoDB:
  - **Option 1:** Install locally (recommended for dev)
  - **Option 2:** Use MongoDB Atlas (cloud): Update MONGODB_URL in .env

### Issue: Swagger UI looks broken

**Solution:** Clear browser cache
```bash
# Or try a different port:
uvicorn main:app --port 8001 --reload
```

### Issue: "Secret key not configured"

**Solution:** Make sure .env has SECRET_KEY
```bash
# Generate one:
python -c "import secrets; print(secrets.token_urlsafe(32))"

# Add to .env:
# SECRET_KEY=<generated_key>
```

### Issue: CORS errors when calling from frontend

**Solution:** Update CORS_ORIGINS in .env
```ini
CORS_ORIGINS=["http://localhost:3000", "http://localhost:8081", "YOUR_FRONTEND_URL"]
```

---

## 🌐 Optional: Run Frontend Test Client

```bash
# In a new terminal
cd frontend/simple_client
python -m http.server 3000

# Open http://localhost:3000 in browser
```

---

## 📊 API Overview Quick Reference

| Endpoint | Method | Purpose | Auth Required |
|----------|--------|---------|---|
| `/health` | GET | Health check | ❌ |
| `/api/auth/signup` | POST | Register | ❌ |
| `/api/auth/login` | POST | Login | ❌ |
| `/api/users/profile` | GET | Get profile | ✅ |
| `/api/emotions/detect` | POST | Detect emotions | ✅ |
| `/api/emotions/record` | POST | Record emotion | ✅ |
| `/api/journal/create` | POST | Create entry | ✅ |
| `/api/analytics/daily-score` | GET | Get score | ✅ |
| `/api/chatbot/send-message` | POST | Chat | ✅ |
| **30+ more...** | | | |

See [USER_GUIDE.md](USER_GUIDE.md) for complete reference.

---

## ✨ Common Workflows

### Workflow 1: User Signup & Profile

```bash
# 1. Sign up
TOKEN=$(curl -s -X POST http://localhost:8000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"new@example.com","username":"newuser","name":"New User","password":"Pass123"}' \
  | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

# 2. Get profile with token
curl -X GET http://localhost:8000/api/users/profile \
  -H "Authorization: Bearer $TOKEN"
```

### Workflow 2: Record & Get Emotions

```bash
# 1. Record emotion
curl -X POST http://localhost:8000/api/emotions/record \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"emotion":"anxiety","intensity":0.7,"source":"manual"}'

# 2. Get status
curl -X GET http://localhost:8000/api/emotions/status \
  -H "Authorization: Bearer TOKEN"
```

### Workflow 3: Journal Entry with Emotion Detection

```bash
# 1. Create journal entry (emotions auto-detected)
curl -X POST http://localhost:8000/api/journal/create \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content":"Today was stressful but I handled it well","mood_intensity":0.6}'

# 2. View detected emotions in response
```

---

## 🎓 Next Learning Steps

1. **Now:** You can run the backend ✅
2. **Next:** Read [USER_GUIDE.md](USER_GUIDE.md) to understand all endpoints
3. **Then:** Read [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) to understand architecture
4. **Finally:** Connect your frontend or add custom features

---

## 💻 Development Tips

### Reload Code on Changes
The `--reload` flag in uvicorn automatically restarts when you change Python files:
```bash
uvicorn main:app --reload
```

### Enable Debug Logging
Add to .env:
```ini
DEBUG=True
```

### Test Specific Endpoint
Use Swagger UI for interactive testing: http://localhost:8000/docs

### Use Python for Complex Tests
```python
import requests
import json

BASE_URL = "http://localhost:8000"

# Sign up
response = requests.post(f"{BASE_URL}/api/auth/signup", json={
    "email": "test@example.com",
    "username": "testuser",
    "name": "Test User",
    "password": "SecurePass123"
})

if response.status_code == 200:
    token = response.json()["access_token"]
    
    # Get profile
    headers = {"Authorization": f"Bearer {token}"}
    profile = requests.get(f"{BASE_URL}/api/users/profile", headers=headers)
    print(json.dumps(profile.json(), indent=2))
else:
    print(f"Error: {response.json()}")
```

---

## 📞 When Stuck

1. **Check [USER_GUIDE.md](USER_GUIDE.md)** — Complete API reference with examples
2. **Check [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)** — Understand how modules work
3. **Use Swagger UI** — http://localhost:8000/docs for interactive docs
4. **Check logs** — Terminal output shows detailed error messages
5. **Review code comments** — All modules have inline documentation

---

## ✅ Success Checklist

- [ ] Backend is running (`http://localhost:8000/docs` loads)
- [ ] Health check works (`/health` returns `{"status":"healthy"}`)
- [ ] You can sign up and get a token
- [ ] You can login
- [ ] You can get your profile
- [ ] You can record emotions
- [ ] You can make other API calls

If all checked, **you're ready to go!** 🚀

---

## 🎉 You're All Set!

Your MINDTRACE AI+ MVP backend is now:
- ✅ Running locally
- ✅ Accessible via API
- ✅ Testable with Swagger UI
- ✅ Ready for frontend integration
- ✅ Ready for production deployment

Happy coding! 🚀
