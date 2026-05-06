# MINDTRACE Complete Setup Guide

**Complete instructions to set up and run the entire MINDTRACE application locally.**

This guide covers both backend and frontend setup in one place.

---

## ✅ Prerequisites

Before you start, make sure you have installed:

- **Python 3.11+** - [Download](https://www.python.org/downloads/)
- **Node.js 16+** - [Download](https://nodejs.org/)
- **Git** - [Download](https://git-scm.com/)

### Optional (but recommended)
- **MongoDB 7.0** - [Download](https://www.mongodb.com/try/download/community)
- **Redis 7** - [Download](https://redis.io/download)
- **VS Code** - [Download](https://code.visualstudio.com/)

---

## 🔧 Installation Steps

### Step 1: Backend Setup (Terminal 1)

```bash
# Navigate to backend directory
cd backend

# Create Python virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt
```

**Expected output:**
```
Successfully installed fastapi uvicorn motor pydantic...
```

### Step 2: Configure Backend

```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your settings
# Windows:
notepad .env
# macOS/Linux:
nano .env
```

**Minimum required settings in `.env`:**
```ini
DEBUG=True
SECRET_KEY=your-secret-key-12345
MONGODB_URL=mongodb://localhost:27017/mindtrace_db
REDIS_URL=redis://localhost:6379/0
```

**To generate a secure SECRET_KEY:**
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### Step 3: Start Backend

```bash
# Make sure you're in the backend directory and venv is activated
python -m uvicorn main:app --reload --port 8000
```

**Expected output:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete
Connected to MongoDB successfully ✓
```

✅ **Backend is running!** Keep this terminal open.

---

### Step 4: Frontend Setup (Terminal 2)

```bash
# Open a new terminal window/tab
cd frontend

# Install Node dependencies
npm install
```

**Expected output:**
```
added XXX packages in X.XXs
```

### Step 5: Configure Frontend

```bash
# Copy environment template
cp .env.example .env

# Default settings should work, but verify:
# VITE_API_URL=http://localhost:8000
# VITE_WS_URL=ws://localhost:8000
```

### Step 6: Start Frontend

```bash
# Make sure you're in the frontend directory
npm run dev
```

**Expected output:**
```
➜  Local:   http://localhost:5173/
➜  Press h to show help
```

✅ **Frontend is running!** Keep this terminal open.

---

## 🎉 Success! Your App is Ready!

Open your browser and navigate to:

**Frontend:** http://localhost:5173

You should see the MINDTRACE login page! 🎉

---

## 🧪 Testing the App

### 1. Create an Account

1. Open http://localhost:5173
2. Click "Sign Up" tab
3. Enter:
   - Full Name: `Test User`
   - Email: `test@example.com`
   - Password: `TestPass123!`
   - Confirm: `TestPass123!`
4. Click "Create Account"

✅ You should be redirected to dashboard!

### 2. Test Emotion Detection

1. Click "Journal" in the navigation
2. Type: `I'm feeling amazing today!`
3. Click "Analyze Emotions"
4. Should detect emotion as **joy** or **positive**

### 3. Test Dashboard

1. Click "Dashboard" in navigation
2. You should see:
   - Current emotional state
   - Wellness score (0-100)
   - System status
   - Today's insights
   - Recommendations

### 4. Test WebSocket (Real-time)

1. Keep Dashboard open in Tab 1
2. Open Journal in Tab 2
3. Submit an emotion in Tab 2
4. Dashboard in Tab 1 should update automatically (no refresh needed!)

---

## 📊 API Documentation

### View Interactive API Docs

While backend is running, open:

**Swagger UI:** http://localhost:8000/docs

or

**ReDoc:** http://localhost:8000/redoc

You can test all endpoints directly from the browser!

### Example API Calls

#### Signup
```bash
curl -X POST http://localhost:8000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "TestPass123!",
    "full_name": "Test User"
  }'
```

#### Login
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "TestPass123!"
  }'
```

Response will include your JWT token:
```json
{
  "access_token": "eyJhbGc...",
  "token_type": "bearer",
  "user": {...}
}
```

#### Detect Emotion
```bash
curl -X POST http://localhost:8000/api/emotions/detect \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "I feel amazing!"
  }'
```

---

## 🐛 Troubleshooting

### Port Already in Use

**Error:** "Address already in use"

```bash
# Find and kill process using port 8000 (backend)
# Windows:
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# macOS/Linux:
lsof -ti:8000 | xargs kill -9
```

Same for port 5173 (frontend):
```bash
# Windows:
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# macOS/Linux:
lsof -ti:5173 | xargs kill -9
```

### MongoDB Connection Error

**Error:** "Cannot connect to MongoDB"

```bash
# Check if MongoDB is running
mongosh --eval "db.version()"

# If not installed, create .env with local path:
# MONGODB_URL=mongodb://localhost:27017/mindtrace_db

# Or use MongoDB Atlas (cloud):
# MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/mindtrace_db
```

### Backend Won't Start

```bash
# Make sure you're in backend directory and venv is activated
# Check Python version
python --version  # Should be 3.11+

# Reinstall dependencies
pip install -r requirements.txt

# Try again
python -m uvicorn main:app --reload
```

### Frontend Won't Install

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Try again
npm run dev
```

### Can't Login

```bash
# Check backend is running: http://localhost:8000/health
curl http://localhost:8000/health

# Check VITE_API_URL in .env
cat frontend/.env | grep VITE_API_URL

# Clear browser localStorage
# F12 → Application → localStorage → Clear all
```

### WebSocket Not Connecting

```bash
# Verify backend is running
curl http://localhost:8000/health

# Check VITE_WS_URL in .env (should match backend)
# VITE_WS_URL=ws://localhost:8000

# Check browser console for errors (F12)
```

---

## 📁 Project Structure After Setup

```
mindtrace/
├── backend/
│   ├── .venv/ or venv/           # Python virtual environment
│   ├── .env                       # Backend configuration (local)
│   ├── main.py                    # FastAPI app
│   ├── requirements.txt           # Python dependencies
│   └── app/                       # Application code
│
├── frontend/
│   ├── node_modules/              # Node dependencies
│   ├── .env                       # Frontend configuration (local)
│   ├── src/                       # React source code
│   ├── package.json               # Node dependencies
│   └── index.html                 # HTML entry point
│
└── README.md                      # Project overview
```

---

## 🚀 Running Again Later

### Quick Start (Next Time)

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
python -m uvicorn main:app --reload
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Then open: http://localhost:5173

---

## 📚 Additional Documentation

### Complete Guides
- **[Backend README](./backend/README.md)** - Backend configuration details
- **[Frontend README](./frontend/README.md)** - Frontend development guide
- **[Testing Guide](./frontend/TESTING.md)** - Manual QA checklist
- **[API Reference](./backend/README.md)** - All endpoints and examples

### Architecture
- **[Project Structure Doc](./PROJECT_STRUCTURE.md)** - System design
- **[User Guide](./USER_GUIDE.md)** - Complete API documentation

---

## ✨ Key Features Now Available

- ✅ **User Authentication** - Signup/Login with JWT
- ✅ **Emotion Tracking** - Real-time emotion detection
- ✅ **Journaling** - Create and store journal entries
- ✅ **Dashboard** - View emotions, wellness score, insights
- ✅ **Recommendations** - Get interventions based on emotion state
- ✅ **Distress Mode** - Guided breathing & crisis support
- ✅ **Settings** - Manage profile and emergency contacts
- ✅ **Real-time Updates** - WebSocket for live emotion streaming
- ✅ **Analytics** - Track wellness trends

---

## 🧪 Test Checklist

After setup, verify these work:

- [ ] Can signup with email/password
- [ ] Can login with credentials
- [ ] Can write in journal
- [ ] Emotion is detected from text
- [ ] Dashboard shows emotion status
- [ ] Can select mood intensity
- [ ] Can see recommendations
- [ ] Can navigate between pages
- [ ] Real-time updates work (WebSocket)
- [ ] Can logout successfully

---

## 🌐 What Each Port Does

| Port | Service | URL |
|------|---------|-----|
| 8000 | Backend API | http://localhost:8000 |
| 8000 | API Docs | http://localhost:8000/docs |
| 5173 | Frontend App | http://localhost:5173 |

---

## 💡 Tips

### Development Tips

1. **Keep terminal windows open** while developing
2. **Hot reload is enabled** - Changes auto-update in browser
3. **Check console errors** - F12 to open browser DevTools
4. **Backend logs** - Watch terminal output for API errors
5. **API Testing** - Use http://localhost:8000/docs for interactive testing

### Performance Tips

1. **Frontend builds fast** (Vite is lightning quick ~100ms)
2. **HMR updates instantly** (Hot Module Replacement)
3. **Database queries cached** in Redis
4. **WebSocket efficient** (no polling needed)

---

## 🆘 Need More Help?

### Check These Resources

1. **Backend issues?** → See [backend/README.md](./backend/README.md)
2. **Frontend issues?** → See [frontend/README.md](./frontend/README.md)
3. **API questions?** → See [USER_GUIDE.md](./USER_GUIDE.md)
4. **Testing help?** → See [frontend/TESTING.md](./frontend/TESTING.md)
5. **Architecture?** → See [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)

### Browser DevTools

**Press F12** to open DevTools:
- **Console tab** - JavaScript errors
- **Network tab** - API calls and WebSocket
- **Application tab** - localStorage (tokens)
- **Elements tab** - HTML/CSS inspection

### Backend Logs

Watch the terminal running `uvicorn` for:
- API request logs
- Database errors
- WebSocket connections
- Error tracebacks

---

## 🎯 Next Steps

Once everything is running:

1. ✅ **Explore the UI** - Click around, test features
2. ✅ **Read API docs** - http://localhost:8000/docs
3. ✅ **Try test cases** - See [TESTING.md](./frontend/TESTING.md)
4. ✅ **Understand code** - Read [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)
5. ✅ **Customize** - Modify interventions, themes, colors
6. ✅ **Deploy** - When ready, see deployment guides

---

## 🎉 Congratulations!

You now have a **fully functional mental wellness application** running locally!

**Frontend:** http://localhost:5173
**Backend API:** http://localhost:8000
**API Docs:** http://localhost:8000/docs

---

## 📝 Quick Reference

### Start Everything (Standard)

```bash
# Terminal 1 - Backend
cd backend
source venv/bin/activate  # Windows: venv\Scripts\activate
python -m uvicorn main:app --reload

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Build for Production

```bash
# Frontend production build
cd frontend
npm run build

# Output in: frontend/dist/
```

### Database Management

```bash
# Connect to MongoDB
mongosh

# View databases
show databases

# Use mindtrace database
use mindtrace_db

# View collections
show collections

# View all users
db.users.find()
```

---

## 🎓 Learning Resources

- [React Docs](https://react.dev)
- [FastAPI Docs](https://fastapi.tiangolo.com)
- [MongoDB Docs](https://docs.mongodb.com)
- [Tailwind CSS](https://tailwindcss.com)
- [WebSocket Intro](https://en.wikipedia.org/wiki/WebSocket)

---

**Happy coding! 💙 Your MINDTRACE app is ready to use!**

If you need help, check the documentation files or review the code in the `src/` directories - it's well-commented and organized!
