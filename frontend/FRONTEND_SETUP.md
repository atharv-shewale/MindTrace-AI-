# Frontend Setup & Development Guide

This guide walks you through setting up and running the MINDTRACE frontend locally.

## ✅ Quick Start (5 minutes)

### 1. Prerequisites
- ✅ Node.js 16+ installed ([download here](https://nodejs.org/))
- ✅ npm or yarn available
- ✅ Backend running on `http://localhost:8000`

### 2. Install Dependencies

```bash
cd frontend
npm install
```

**Expected output:**
```
added XXX packages in X.XXs
```

### 3. Start Development Server

```bash
npm run dev
```

**Expected output:**
```
  VITE v5.0.0  ready in 123 ms

  ➜  Local:   http://localhost:5173/
  ➜  Press h to show help
```

### 4. Open in Browser

Navigate to: **http://localhost:5173**

You should see the MINDTRACE login page! 🎉

---

## 📁 Project Structure

### Frontend Architecture

```
frontend/
├── src/
│   ├── App.jsx                         # Main app component with routing
│   ├── main.jsx                        # React entry point
│   ├── index.css                       # Global Tailwind styles
│   │
│   ├── components/
│   │   ├── Login.jsx                   # Auth (signup/login form)
│   │   ├── Dashboard.jsx               # Main emotion tracking page
│   │   ├── JournalInput.jsx            # Journal entry with emotion detection
│   │   ├── EmotionHistory.jsx          # Timeline of past emotions
│   │   ├── RecommendationsPanel.jsx    # Intervention suggestions
│   │   ├── Settings.jsx                # User profile & preferences
│   │   ├── DistressMode.jsx            # Distress UI with breathing exercise
│   │   ├── PrivateRoute.jsx            # Protected route wrapper
│   │   └── ErrorBoundary.jsx           # Error handling
│   │
│   ├── context/
│   │   └── AuthContext.jsx             # Global auth state (user, token, login/logout)
│   │
│   ├── hooks/
│   │   └── useAPI.js                   # Custom hooks for API calls
│   │
│   └── utils/
│       ├── api.js                      # Axios HTTP client with JWT auto-injection
│       └── websocket.js                # WebSocket handler for real-time emotion streaming
│
├── index.html                          # HTML entry point (React mounts here)
├── package.json                        # Dependencies & build scripts
├── vite.config.js                      # Vite config (dev server, API proxy)
├── tailwind.config.js                  # Tailwind CSS theming
├── postcss.config.js                   # CSS processing
└── .env.example                        # Environment variable template
```

---

## 🔌 Component Overview

### Login Component
- **Path:** `src/components/Login.jsx`
- **Purpose:** Signup/Login forms
- **Features:**
  - Email validation
  - Password strength check (8+ chars)
  - Show/hide password toggle
  - Error messages
  - Demo credentials hint
- **Output:** Sets token in localStorage, calls `onLoginSuccess`

### Dashboard Component
- **Path:** `src/components/Dashboard.jsx`
- **Purpose:** Main application dashboard
- **Features:**
  - Real-time emotion status via WebSocket
  - Wellness score display
  - Today's insights & patterns
  - System status (API + WebSocket connection)
  - Auto-refresh every 5 seconds
- **Connections:** EmotionWebSocket, useEmotionStatus, useAnalytics hooks

### JournalInput Component
- **Path:** `src/components/JournalInput.jsx`
- **Purpose:** Text input for journaling
- **Features:**
  - Real-time emotion detection as user types
  - Mood intensity selector (5 levels)
  - Auto-triggers distress alert if intensity ≥ 0.85
  - Character count & submission validation
- **Connections:** useEmotionDetect, useJournalCreate hooks

### EmotionHistory Component
- **Path:** `src/components/EmotionHistory.jsx`
- **Purpose:** Timeline view of past emotion entries
- **Features:**
  - Displays last 10 entries
  - Shows timestamp, emotion, intensity
  - Sentiment indicators (positive/negative/neutral)
- **Connections:** journalAPI

### RecommendationsPanel Component
- **Path:** `src/components/RecommendationsPanel.jsx`
- **Purpose:** Intervention recommendations
- **Features:**
  - Gets recommendations based on current emotion
  - Displays interventions (breathing, meditation, grounding, etc.)
  - Trigger interventions with API call
  - Shows confirmation on successful trigger
- **Connections:** useInterventions hook

### DistressMode Component
- **Path:** `src/components/DistressMode.jsx`
- **Purpose:** Distress support UI
- **Features:**
  - Auto-triggers when escalation_score ≥ 0.85
  - Guided breathing exercise (4-4-4 rhythm)
  - 5-4-3-2-1 grounding technique
  - Coping statements
  - Emergency contact quick-dial
- **Triggered by:** Dashboard, JournalInput

### Settings Component
- **Path:** `src/components/Settings.jsx`
- **Purpose:** User profile & preferences
- **Features:**
  - Update profile (name, age, timezone, etc.)
  - Manage emergency contacts
  - Notification preferences
  - Session management (logout)
- **Connections:** apiClient, useAPI hooks

---

## 🔐 Authentication Flow

```
[Login Form] → POST /auth/login → [Backend validates] → JWT token returned
                                                        ↓
                                    Store in localStorage["token"]
                                                        ↓
                                    AuthContext sets isAuthenticated = true
                                                        ↓
                                    <PrivateRoute> allows Dashboard access
```

### Key Files:
1. **AuthContext.jsx** - Manages global auth state
2. **Login.jsx** - Handles signup/login forms
3. **PrivateRoute.jsx** - Protects routes (redirects to /login if not authenticated)
4. **api.js** - Auto-injects JWT token to all API requests from localStorage

---

## 🌐 API Integration

### How Requests Work:

1. **Axios Client** (`src/utils/api.js`)
   ```javascript
   // Gets JWT from localStorage automatically
   // Adds to all requests: Authorization: Bearer <token>
   // Handles errors globally
   ```

2. **Custom Hooks** (`src/hooks/useAPI.js`)
   ```javascript
   // useEmotionDetect()   → POST /api/emotions/detect
   // useJournalCreate()   → POST /api/journal/create
   // useAnalytics()       → GET /api/analytics/daily-score
   // useInterventions()   → GET /api/interventions/recommend
   // useEmotionStatus()   → GET /api/emotions/status
   ```

3. **WebSocket** (`src/utils/websocket.js`)
   ```javascript
   // Real-time emotion streaming
   // Auto-reconnect on disconnect
   // Event listener pattern
   ```

---

## 📝 Environment Variables

### File: `.env`

```env
# Backend API Configuration
VITE_API_URL=http://localhost:8000       # Backend API base URL
VITE_WS_URL=ws://localhost:8000          # WebSocket URL
```

### Create `.env` file:

```bash
cp .env.example .env
```

### For Production:

```env
VITE_API_URL=https://your-api-domain.com
VITE_WS_URL=wss://your-api-domain.com
```

---

## 🚀 Development Workflow

### 1. Start Dev Server

```bash
npm run dev
```

Features:
- Hot Module Replacement (HMR) - Changes update instantly
- Fast build times (Vite)
- Error overlay in browser
- API proxy to backend

### 2. Make Changes

Edit any file in `src/` - changes will appear immediately in browser!

Example:
- Edit `src/components/Dashboard.jsx`
- Save file
- Browser automatically updates (you'll see changes in ~100ms)

### 3. Check Errors

- **Browser Console** (F12) - JavaScript errors
- **Network Tab** - API calls and WebSocket
- **Terminal** - Build errors

### 4. Test Manually

- **Login:** Use email/password or demo credentials
- **Journal:** Write something and check emotion detection
- **Dashboard:** See real-time updates
- **Settings:** Update profile
- **Distress Mode:** Try high-intensity emotions

---

## 🏗️ Building for Production

### Create Optimized Build

```bash
npm run build
```

**Output:**
- Creates `dist/` folder with optimized files
- Bundles React + Vite + Tailwind
- Minified JavaScript & CSS
- Tree-shaking of unused code

### Preview Production Build

```bash
npm run preview
```

Opens `http://localhost:4173` to preview production build locally.

### Deployment Folder

```
dist/
├── index.html              # Main entry point
├── assets/
│   ├── index-XXXX.js       # Bundled JavaScript
│   └── index-XXXX.css      # Bundled CSS
└── vite.svg                # Static assets
```

---

## 🌐 Deployment Options

### Option 1: Vercel (Recommended - Free tier available)

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Deploy
vercel
```

**Automatic:**
- Builds on every push to GitHub
- SSL certificate included
- Global CDN
- Environment variables via dashboard

**Set Environment Variables:**
```
Dashboard → Project → Settings → Environment Variables
VITE_API_URL=https://your-backend-domain.com
VITE_WS_URL=wss://your-backend-domain.com
```

### Option 2: Netlify

```bash
# 1. Build locally
npm run build

# 2. Install Netlify CLI
npm install -g netlify-cli

# 3. Deploy
netlify deploy --prod --dir=dist
```

### Option 3: GitHub Pages

**Update `vite.config.js`:**
```javascript
export default defineConfig({
  base: '/mindtrace/',  // your repo name
  // ... rest
})
```

**Deploy:**
```bash
npm run build
git add dist/
git commit -m "Build for production"
git push origin main
```

---

## 🐛 Troubleshooting

### Port 5173 Already in Use

```bash
# Find process using port
lsof -ti:5173 | xargs kill -9

# Or just change port
npm run dev -- --port 3000
```

### Backend Not Responding

**Check:**
```bash
# Is backend running?
curl http://localhost:8000/health

# Check environment variable
cat .env | grep VITE_API_URL

# Check browser console (F12) for CORS errors
```

**Solution:**
- Start backend: `cd backend && python -m uvicorn main:app --reload`
- Verify `VITE_API_URL` matches backend URL
- Check backend logs for errors

### WebSocket Won't Connect

**Check:**
```bash
# Is backend running?
curl http://localhost:8000/health

# WebSocket URL in .env
echo $VITE_WS_URL

# Browser console for connection errors (F12)
```

**Solution:**
- Ensure backend is running
- WebSocket URL must match backend (usually same as API URL, just `ws://` instead of `http://`)

### Token Issues / Can't Login

```bash
# Clear localStorage
localStorage.clear()

# Then try login again
```

**Check:**
- Backend auth endpoint working: `curl -X POST http://localhost:8000/api/auth/login`
- Database has users

### Build Errors

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

## 📊 Performance Tips

### Development
- Vite is FAST (builds in <200ms typically)
- HMR updates in <100ms
- Keep browser DevTools closed (slight performance boost)

### Production
- Bundle size: ~150KB gzipped
- Code splitting automatic
- Images optimized
- CSS purged (unused styles removed)

---

## 🧪 Testing Checklist

Before deploying, test:

- [ ] **Login/Signup** - Create new account & login works
- [ ] **Emotion Detection** - Type text, emotion is detected correctly
- [ ] **Journal Submission** - Can create journal entries
- [ ] **Dashboard** - Shows emotion status, insights, wellness score
- [ ] **WebSocket** - Real-time updates (check Network tab)
- [ ] **Settings** - Can update profile and emergency contacts
- [ ] **Distress Mode** - Triggers on high-intensity emotions
- [ ] **Logout** - Token cleared, redirected to login
- [ ] **Error Handling** - Error boundary catches errors gracefully
- [ ] **Mobile** - Responsive design on phone/tablet

---

## 📚 Useful Resources

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Axios Documentation](https://axios-http.com)
- [Lucide React Icons](https://lucide.dev)

---

## 🆘 Getting Help

### Check These First:
1. Browser console (F12) for JavaScript errors
2. Network tab for failed API requests
3. Terminal output for build errors
4. Backend logs for API errors

### Common Errors:

| Error | Solution |
|-------|----------|
| "Cannot GET /" | Run `npm run dev` |
| "API not responding" | Start backend: `cd ../backend && python -m uvicorn main:app --reload` |
| "Port already in use" | Kill process: `lsof -ti:5173 \| xargs kill -9` |
| "token is not defined" | Clear localStorage: `localStorage.clear()` |
| "Module not found" | Reinstall: `rm -rf node_modules && npm install` |

---

## ✨ Next Steps

1. ✅ **Complete Frontend Setup** (you're here!)
2. 🚀 **Start Backend** - See [BACKEND_SETUP.md](../backend/README.md)
3. 📖 **Test Everything** - Use [TESTING.md](./TESTING.md)
4. 🌐 **Deploy** - Use Vercel/Netlify guide above

Happy coding! 💙
