# MINDTRACE Frontend

A modern React + Vite + Tailwind CSS application for mental wellness tracking and support.

## Prerequisites

- Node.js 16+ (download from [nodejs.org](https://nodejs.org/))
- npm or yarn package manager
- Backend running on `http://localhost:8000`

## Installation

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create .env file:**
   ```bash
   cp .env.example .env
   ```

4. **Update environment variables (if needed):**
   ```env
   VITE_API_URL=http://localhost:8000
   VITE_WS_URL=ws://localhost:8000
   ```

## Development

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

**Features:**
- Hot Module Replacement (HMR) - Changes reflect instantly
- Real-time compilation errors
- API proxy to backend at `http://localhost:8000`

## Building for Production

Build optimized production bundle:

```bash
npm run build
```

Output files go to `dist/` directory.

Preview production build locally:

```bash
npm run preview
```

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Dashboard.jsx          # Main emotion tracking dashboard
│   │   ├── JournalInput.jsx       # Text input with real-time emotion detection
│   │   ├── EmotionHistory.jsx     # Timeline of past emotions
│   │   ├── RecommendationsPanel.jsx # Intervention recommendations
│   │   ├── DistressMode.jsx       # Distress mode UI with breathing exercises
│   │   ├── Login.jsx              # Authentication form (signup/login)
│   │   ├── Settings.jsx           # User profile and preferences
│   │   ├── PrivateRoute.jsx       # Protected route wrapper
│   │   └── ErrorBoundary.jsx      # Error handling component
│   ├── context/
│   │   └── AuthContext.jsx        # Global authentication state
│   ├── hooks/
│   │   └── useAPI.js              # Custom hooks for API calls
│   ├── utils/
│   │   ├── api.js                 # Axios client with token injection
│   │   └── websocket.js           # WebSocket handler for real-time updates
│   ├── App.jsx                    # Main app with routing
│   ├── main.jsx                   # React entry point
│   └── index.css                  # Global styles with Tailwind
├── index.html                     # HTML entry point
├── package.json                   # Dependencies and scripts
├── vite.config.js                 # Vite configuration
├── tailwind.config.js             # Tailwind CSS configuration
├── postcss.config.js              # PostCSS configuration
└── .env.example                   # Environment variable template
```

## Features

### 🎯 Dashboard
- Display current emotion status
- Mood trends and insights
- Recommended interventions
- Wellness score visualization

### 📝 Journal
- Real-time text input for journaling
- Automatic emotion detection
- Distress alerts on high-intensity emotions
- Emotion intensity scale feedback

### 📊 History
- View past emotion entries
- Emotion trend timeline
- Sentiment distribution
- Analytics dashboard

### ⚙️ Settings
- User profile management
- Wellness preferences
- Emergency contacts management
- Theme and notification preferences

### 🆘 Distress Mode
- Auto-triggers when emotion intensity is critical (≥0.85)
- Guided breathing exercise with visual animation
- 5-4-3-2-1 grounding technique
- Coping statements
- Quick emergency contact calling

### 🔐 Authentication
- User signup with email/password
- Login with JWT tokens
- Automatic token refresh
- Session persistence

## API Integration

All API calls are handled through:

1. **Axios Client** (`src/utils/api.js`)
   - Automatic JWT token injection
   - Centralized error handling
   - Request/response interceptors

2. **Custom Hooks** (`src/hooks/useAPI.js`)
   - `useEmotionDetect()` - Detect emotion from text
   - `useJournalCreate()` - Create journal entries
   - `useAnalytics()` - Fetch wellness scores and insights
   - `useInterventions()` - Get and trigger interventions
   - `useEmotionStatus()` - Get current emotion status

3. **WebSocket** (`src/utils/websocket.js`)
   - Real-time emotion streaming
   - Auto-reconnect with exponential backoff
   - Event listener pattern

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `http://localhost:8000` | Backend API base URL |
| `VITE_WS_URL` | `ws://localhost:8000` | WebSocket URL for real-time |

## Available Scripts

```bash
# Development
npm run dev          # Start dev server

# Production
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality (if configured)
npm run lint        # Run ESLint
npm run format      # Format code with Prettier
```

## Styling

- **Framework:** Tailwind CSS 3.3.6
- **Colors:** Custom theme in `tailwind.config.js`
- **Responsive:** Mobile-first design with breakpoints (sm, md, lg, xl)
- **Icons:** Lucide React (200+ SVG icons)

## Performance

- Vite bundles for fast builds and HMR
- Code splitting for optimal loading
- CSS purging in production
- Asset optimization

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5173
# macOS/Linux:
lsof -ti:5173 | xargs kill -9

# Windows:
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

### Backend Not Responding
- Verify backend is running: `curl http://localhost:8000/health`
- Check `VITE_API_URL` in `.env`
- Check browser console for CORS errors

### Token Expiration
- Tokens stored in `localStorage` under key `token`
- Auto-refresh handled by `api.js`
- Clear localStorage to reset: `localStorage.clear()`

### WebSocket Connection Issues
- Check `VITE_WS_URL` matches backend
- WebSocket won't work if backend is not running
- Check browser console for connection errors

## Testing

To test API integration:

1. **Login:** Use credentials from demo or create new account
2. **Journal:** Enter text and submit - emotion should be detected
3. **Dashboard:** View emotion updates in real-time
4. **Settings:** Update profile and emergency contacts
5. **Distress Mode:** Enter high-intensity emotion text to trigger distress mode

## Deployment

### Deploy to Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

### Deploy to Netlify

```bash
npm run build
# Then drag dist/ folder to Netlify
# Or use: netlify deploy --prod --dir=dist
```

### Deploy to GitHub Pages

Update `vite.config.js`:
```js
export default defineConfig({
  base: '/mindtrace/',  // your repo name
  // ... rest of config
})
```

Then build and push to `gh-pages` branch.

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Create feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -m 'Add feature'`
3. Push to branch: `git push origin feature/your-feature`
4. Open Pull Request

## License

MIT License - See LICENSE file for details

## Support

For issues and questions:
- Check existing GitHub issues
- Create new issue with detailed description
- Include browser console errors and steps to reproduce

---

**Happy coding! 🚀**
