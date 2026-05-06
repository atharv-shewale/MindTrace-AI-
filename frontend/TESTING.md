# MINDTRACE Testing Guide

Complete manual testing checklist to verify all frontend and backend functionality.

## 🚀 Pre-Test Setup

### 1. Start Backend

```bash
cd backend
python -m uvicorn main:app --reload --port 8000
```

**Expected output:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000
```

### 2. Start Frontend

```bash
cd frontend
npm run dev
```

**Expected output:**
```
  ➜  Local:   http://localhost:5173/
```

### 3. Open in Browser

Navigate to: **http://localhost:5173**

---

## 📋 Test Cases

### 1. Authentication Tests

#### 1.1 Signup - New User

```
Step 1: Click "Sign Up" tab on login page
Step 2: Enter:
  - Full Name: "Test User"
  - Email: "testuser@example.com"
  - Password: "TestPass123!"
  - Confirm Password: "TestPass123!"
Step 3: Click "Create Account"
```

**Expected Results:**
- ✅ Account created successfully
- ✅ Redirected to dashboard
- ✅ User name appears in header
- ✅ Token stored in localStorage

**Verify in Browser Console:**
```javascript
// Should return your email
localStorage.getItem('user')
JSON.parse(localStorage.getItem('user')).email
```

#### 1.2 Login - Existing User

```
Step 1: Logout (click logout button)
Step 2: Click "Login" tab
Step 3: Enter:
  - Email: "testuser@example.com"
  - Password: "TestPass123!"
Step 4: Click "Login"
```

**Expected Results:**
- ✅ Logged in successfully
- ✅ Redirected to dashboard
- ✅ Same user appears in header

#### 1.3 Login - Invalid Credentials

```
Step 1: Enter wrong password
Step 2: Click "Login"
```

**Expected Results:**
- ✅ Error message appears
- ✅ Stay on login page
- ✅ Can try again

#### 1.4 Session Persistence

```
Step 1: Login to app
Step 2: Note token in localStorage: localStorage.getItem('token')
Step 3: Refresh page (F5)
Step 4: Observe app state
```

**Expected Results:**
- ✅ Still logged in after refresh
- ✅ Dashboard loads without login
- ✅ Same token in localStorage

---

### 2. Dashboard Tests

#### 2.1 Dashboard Load

```
Step 1: Login to app
Step 2: Observe dashboard page
```

**Expected Results:**
- ✅ Dashboard page loads
- ✅ Shows 3 cards: Current State, Wellness Score, System Status
- ✅ Shows bottom row: Insights & Recommendations

#### 2.2 System Status - Backend API

```
Step 1: Open DevTools (F12) → Network tab
Step 2: Look at dashboard
Step 3: Check "System Status" card
```

**Expected Results:**
- ✅ Backend API: "Connected" (green badge)
- ✅ Real-time Updates: "Active" or "Connecting"
- ✅ Network tab shows successful requests to `/api/emotions/status`

#### 2.3 Wellness Score Display

```
Step 1: Look at "Wellness Score" card
Step 2: Observe number 0-100
```

**Expected Results:**
- ✅ Shows score (0-100)
- ✅ Progress bar reflects score
- ✅ Shows today's average if available

#### 2.4 Auto-Refresh

```
Step 1: Note timestamp in "System Status"
Step 2: Wait 5 seconds
Step 3: Observe timestamp
```

**Expected Results:**
- ✅ Timestamp updates every 5 seconds
- ✅ No manual refresh needed

---

### 3. Emotion Detection Tests

#### 3.1 Text Emotion Detection

```
Step 1: Click "Journal" in navigation
Step 2: Type in text area:
  "I'm so excited about my new job! Today was amazing."
Step 3: Click "Analyze Emotions"
```

**Expected Results:**
- ✅ Analysis card appears
- ✅ Shows detected emotion (should be "joy" or similar)
- ✅ Shows intensity (0-100%)
- ✅ Shows sentiment (Positive/Negative/Neutral)

#### 3.2 Distress Detection

```
Step 1: In Journal, type:
  "I can't handle this anymore. Everything feels hopeless and I'm overwhelmed."
Step 2: Click "Analyze Emotions"
```

**Expected Results:**
- ✅ Analysis shows high intensity (85%+)
- ✅ Red alert appears: "We're concerned about you"
- ✅ Alert mentions Distress Mode

#### 3.3 Mood Intensity Selection

```
Step 1: In Journal, type any text
Step 2: Click mood buttons (Very Bad → Excellent)
Step 3: Observe button highlighting
```

**Expected Results:**
- ✅ Selected button scales up and highlights
- ✅ Can change selection multiple times

#### 3.4 Journal Entry Submission

```
Step 1: Type in text area
Step 2: Select a mood
Step 3: Click "Save Entry"
```

**Expected Results:**
- ✅ Entry saved successfully
- ✅ Text clears after save
- ✅ Mood selection resets
- ✅ Confirmation message or visual feedback

---

### 4. Recommendations Tests

#### 4.1 Get Recommendations

```
Step 1: Go to Dashboard
Step 2: Look for Recommendations Panel
Step 3: Click "Get Recommendations"
```

**Expected Results:**
- ✅ Recommendations panel loads
- ✅ Shows intervention cards (breathing, meditation, etc.)
- ✅ Each card has title, icon, duration

#### 4.2 Trigger Intervention

```
Step 1: In Recommendations panel, click any intervention
  (e.g., "breathing_exercise")
```

**Expected Results:**
- ✅ Button highlights (green checkmark)
- ✅ Intervention is triggered via API
- ✅ Loading state shows briefly

---

### 5. Distress Mode Tests

#### 5.1 Auto-Trigger Distress Mode

```
Step 1: Go to Journal
Step 2: Type high-intensity emotion:
  "I'm completely overwhelmed and can't function"
Step 3: Click "Analyze Emotions"
Step 4: Wait for distress detection
```

**Expected Results:**
- ✅ Modal overlay appears (fixed on screen)
- ✅ Shows "You're in Distress Mode" header
- ✅ Contains breathing exercise visualization
- ✅ Shows grounding technique (5-4-3-2-1)

#### 5.2 Breathing Exercise

```
Step 1: In Distress Mode, observe breathing animation
Step 2: Watch the circle change color and size
```

**Expected Results:**
- ✅ Circle grows with "BREATHE IN" label
- ✅ Circle holds with "HOLD" label
- ✅ Circle shrinks with "BREATHE OUT" label
- ✅ Colors change: yellow → orange → red
- ✅ Cycle repeats continuously

#### 5.3 Grounding Technique

```
Step 1: In Distress Mode, scroll to grounding section
Step 2: Read 5-4-3-2-1 prompts
```

**Expected Results:**
- ✅ 5 things you can see
- ✅ 4 things you can touch
- ✅ 3 things you can hear
- ✅ 2 things you can smell
- ✅ 1 thing you can taste

#### 5.4 Emergency Contacts

```
Step 1: In Distress Mode, look for "Emergency Contacts"
Step 2: Try clicking phone number (if contact exists)
```

**Expected Results:**
- ✅ Shows saved emergency contacts
- ✅ Can call directly (tel: link works)
- ✅ Contact info visible

#### 5.5 Exit Distress Mode

```
Step 1: In Distress Mode, click "I'm Feeling Better"
```

**Expected Results:**
- ✅ Modal closes
- ✅ Back to normal view

---

### 6. History Tests

#### 6.1 View Emotion History

```
Step 1: Click "History" in navigation
Step 2: Observe emotion entries
```

**Expected Results:**
- ✅ Shows list of past entries
- ✅ Each entry shows: date, emotion, intensity
- ✅ Can see at least one entry from previous journal submission

#### 6.2 Emotion Timeline

```
Step 1: In History, look for timeline visualization
Step 2: Check various emotions displayed
```

**Expected Results:**
- ✅ Shows emotion cards with color coding
- ✅ Timestamp shows relative time (e.g., "2 hours ago")
- ✅ Intensity bar visible

---

### 7. Settings Tests

#### 7.1 View Profile

```
Step 1: Click "Settings" in navigation
Step 2: Ensure "Profile" tab is active
Step 3: Observe profile information
```

**Expected Results:**
- ✅ Profile form loads
- ✅ Shows fields: Full Name, Email, Age, Timezone, Gender, Occupation
- ✅ Email is read-only (disabled)

#### 7.2 Update Profile

```
Step 1: In Profile tab, change:
  - Full Name: "Updated Name"
  - Age: 25
  - Timezone: "EST"
Step 2: Click "Save Changes"
```

**Expected Results:**
- ✅ Changes saved successfully
- ✅ Confirmation message appears
- ✅ Data persists after refresh

#### 7.3 Add Emergency Contact

```
Step 1: Click "Emergency Contacts" tab
Step 2: Fill in:
  - Name: "Emergency Friend"
  - Phone: "+1234567890"
  - Relationship: "Friend"
Step 3: Click "Add Contact"
```

**Expected Results:**
- ✅ Contact added successfully
- ✅ Contact appears in list below
- ✅ Can see contact details

#### 7.4 Delete Emergency Contact

```
Step 1: In Emergency Contacts tab, find the contact
Step 2: Click trash/delete button
Step 3: Confirm deletion
```

**Expected Results:**
- ✅ Confirmation dialog appears
- ✅ Contact deleted from list
- ✅ List updates

---

### 8. Navigation Tests

#### 8.1 Mobile Menu

```
Step 1: Resize browser to mobile (< 768px)
Step 2: Click hamburger menu icon
Step 3: Observe menu
```

**Expected Results:**
- ✅ Menu opens/closes
- ✅ Shows all navigation items
- ✅ Can click items to navigate

#### 8.2 Navigation Items

```
Step 1: Click each nav item:
  - Dashboard
  - Journal  
  - History
  - Settings
Step 2: Verify each page loads
```

**Expected Results:**
- ✅ Each page loads correctly
- ✅ Active nav item highlighted
- ✅ No errors in console

#### 8.3 Logout

```
Step 1: Click logout button (in header or settings)
Step 2: Observe redirect
```

**Expected Results:**
- ✅ Redirected to login page
- ✅ Token cleared from localStorage
- ✅ Session ended

---

### 9. Error Handling Tests

#### 9.1 Backend Offline

```
Step 1: Stop backend (Ctrl+C)
Step 2: Try to load dashboard or make API call
```

**Expected Results:**
- ✅ Error message appears (not crash)
- ✅ Error Boundary catches it
- ✅ Can retry or navigate

#### 9.2 Invalid Input

```
Step 1: Try to signup with:
  - Password: "short" (less than 8 chars)
  - Email: "invalid-email"
```

**Expected Results:**
- ✅ Validation error shows
- ✅ Cannot submit until fixed
- ✅ Clear error messages

#### 9.3 Expired Token

```
Step 1: Get token: localStorage.getItem('token')
Step 2: Manually edit token to be invalid
Step 3: Try to make API call
```

**Expected Results:**
- ✅ API returns 401 error
- ✅ App handles gracefully
- ✅ Can login again

---

### 10. WebSocket Tests

#### 10.1 Real-time Connection

```
Step 1: Open DevTools (F12) → Network tab
Step 2: Go to Dashboard
Step 3: Filter by "ws" (WebSocket)
```

**Expected Results:**
- ✅ WebSocket connection established (status 101)
- ✅ Connection URL shows: `ws://localhost:8000/...`

#### 10.2 Real-time Updates

```
Step 1: Keep Dashboard open in one tab
Step 2: In another tab, submit emotion in Journal
Step 3: Watch Dashboard in first tab
```

**Expected Results:**
- ✅ Dashboard updates in real-time (no refresh needed)
- ✅ New emotion appears immediately
- ✅ Scores/stats update

---

## 📊 Performance Tests

### Load Time

```
Step 1: Open DevTools (F12) → Performance tab
Step 2: Click "Record" button
Step 3: Refresh page (Ctrl+Shift+R)
Step 4: Wait for full load
Step 5: Stop recording
```

**Expected Results:**
- ✅ First paint: < 1s
- ✅ Interactive: < 2s
- ✅ Full load: < 3s

### Bundle Size

```bash
# Build production
npm run build

# Check dist size
du -sh dist/
```

**Expected Results:**
- ✅ Total: ~150KB gzipped
- ✅ JavaScript: ~80KB gzipped
- ✅ CSS: ~40KB gzipped

---

## 🔒 Security Tests

### 1. Token Security

```javascript
// In browser console
// Should NOT see token in plain requests
localStorage.getItem('token')

// Should see Authorization header in API requests
// (Check Network tab → Headers)
```

**Expected Results:**
- ✅ Token only in localStorage
- ✅ Sent in Authorization header to API
- ✅ Not in URL or cookie

### 2. XSS Protection

```
Step 1: In Journal, type: <script>alert('xss')</script>
Step 2: Submit
```

**Expected Results:**
- ✅ No alert appears
- ✅ Script treated as text
- ✅ No code injection

### 3. CORS

```
Step 1: Open DevTools → Network
Step 2: Make API call
Step 3: Check response headers
```

**Expected Results:**
- ✅ `Access-Control-Allow-Origin: *` or specific origin
- ✅ No CORS errors

---

## 📱 Responsive Design Tests

### Desktop (> 1024px)

```
Step 1: Resize to 1920x1080
Step 2: Go through all pages
```

**Expected Results:**
- ✅ All cards visible
- ✅ Layout uses full width
- ✅ 3-column layouts work

### Tablet (768px - 1024px)

```
Step 1: Resize to 768x1024
Step 2: Go through all pages
```

**Expected Results:**
- ✅ Layout adjusts to 2 columns
- ✅ Cards don't overflow
- ✅ Text readable

### Mobile (< 768px)

```
Step 1: Resize to 375x667 (iPhone SE)
Step 2: Go through all pages
```

**Expected Results:**
- ✅ Layout uses 1 column
- ✅ Nav becomes hamburger menu
- ✅ Touch targets large (44px+)
- ✅ Text readable without zoom

---

## 🎯 Checklist Summary

### Critical (Must Work)
- [ ] Login/Signup works
- [ ] JWT token stored and sent
- [ ] Dashboard loads
- [ ] Emotion detection works
- [ ] Distress mode triggers correctly
- [ ] Backend API responds
- [ ] WebSocket connects

### Important (Should Work)
- [ ] All pages load
- [ ] Emotion history shows
- [ ] Settings editable
- [ ] Recommendations work
- [ ] Mobile responsive
- [ ] Navigation works

### Nice to Have
- [ ] Fast load times
- [ ] Smooth animations
- [ ] Error messages helpful
- [ ] Logout clears all data

---

## 🚨 If Tests Fail

### Diagnosis Steps

1. **Check Backend**
   ```bash
   curl http://localhost:8000/health
   # Should return: {"status": "ok"}
   ```

2. **Check Frontend Logs**
   - Open DevTools (F12)
   - Console tab shows errors
   - Network tab shows failed requests

3. **Check Network Traffic**
   - DevTools → Network tab
   - Filter by XHR to see API calls
   - Check response status & body

4. **Check Terminal Output**
   - Frontend terminal: `npm run dev`
   - Backend terminal: `python -m uvicorn main:app --reload`
   - Look for error messages

### Common Failures & Solutions

| Test Fails | Solution |
|-----------|----------|
| "Cannot connect to backend" | Start backend: `cd backend && python -m uvicorn main:app --reload` |
| "WebSocket won't connect" | Check VITE_WS_URL in .env matches backend |
| "Emotion detection failing" | Check backend emotion endpoint: `curl http://localhost:8000/api/emotions/detect -X POST` |
| "Profile won't save" | Check user profile endpoint: `curl http://localhost:8000/api/users/profile` |
| "Mobile layout broken" | Check Tailwind responsive classes (md:, lg:) |

---

## ✅ Sign-Off

Once all tests pass, you're ready to:
1. ✅ Deploy backend
2. ✅ Deploy frontend
3. ✅ Announce to users

**Congratulations on a working mental wellness app!** 🎉
