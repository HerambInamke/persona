# F1 Reaction Championship 🏎️

A full-stack MERN web game simulating Formula 1 start lights with realistic broadcast styling, competitive tournament mechanics, and leaderboard tracking.

## Project Status

✅ **Frontend Complete** - Fully functional React game with all features
⏳ **Backend Pending** - MongoDB/Express API to be implemented

## Quick Start

```bash
cd client
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

## Game Features

### Core Mechanics
- 5 sequential red F1 start lights
- Random delay before "lights out"
- Millisecond-precision reaction timing
- False start detection
- Space bar or click controls

### Unique Features
1. **Random Fake Flicker** - Lights flicker during wait phase to test discipline
2. **3 Difficulty Modes**:
   - Normal: Standard timing with flickers
   - Hard: Faster sequence, more flickers
   - Chaos: Extended delays, screen shake, audio offset
3. **Tournament Mode** - 5-round championships with average scoring
4. **Anti-Cheat** - Rejects reaction times under 80ms

### Player System
- Driver name + car number (1-99)
- Difficulty selection
- Session persistence

### Leaderboard
- Best single reaction time
- Best tournament average (5 rounds)
- False start tracking
- Filter by difficulty
- Tournament invalidation (2+ false starts)
- localStorage persistence (will migrate to MongoDB)

### Broadcast-Style UI
- Dark gradient background
- LED-style red lights with glow
- Professional F1 typography
- Framer Motion animations
- Status overlays and round indicators

### Audio
- Light activation beeps
- "Lights out" cue
- False start warning
- Web Audio API synthesis

## Tech Stack

**Frontend:**
- React 19 + Vite
- Tailwind CSS 4
- Framer Motion
- Web Audio API

**Backend (Planned):**
- Node.js + Express
- MongoDB + Mongoose
- REST API

## Project Structure

```
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── StartForm.jsx           # Player registration
│   │   │   ├── GameController.jsx      # Game state manager
│   │   │   ├── StartLights.jsx         # Light sequence logic
│   │   │   ├── TournamentSummary.jsx   # Results display
│   │   │   └── LeaderboardTable.jsx    # Leaderboard UI
│   │   ├── hooks/
│   │   │   └── useAudio.js             # Audio effects
│   │   └── App.jsx
│   └── package.json
└── server/                    # Backend (to be implemented)
```

## How to Play

1. Enter driver name and car number (1-99)
2. Select difficulty mode
3. Click "START CHAMPIONSHIP"
4. Watch the 5 red lights illuminate
5. Wait for lights to go out (don't jump!)
6. Press SPACE or click immediately
7. Complete 5 rounds for tournament score
8. View leaderboard

## Game Rules

- Reactions under 80ms are rejected (anti-cheat)
- False start = reacting before lights out
- Tournament invalid if 2+ false starts
- Leaderboard sorts by tournament avg, then single best

## Development

### Build
```bash
cd client
npm run build
```

### Lint
```bash
cd client
npm run lint
```

## Next Steps (Backend)

- [ ] Set up Express server
- [ ] Create MongoDB schema
- [ ] Implement REST API endpoints:
  - `POST /api/submit-score`
  - `GET /api/leaderboard`
  - `GET /api/leaderboard/:difficulty`
- [ ] Server-side validation
- [ ] Replace localStorage with API calls
- [ ] Add Dockerfile
- [ ] Player authentication (optional)
- [ ] National flags (optional)

## License

MIT
