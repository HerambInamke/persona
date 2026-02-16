# F1 Reaction Championship 🏎️

A realistic Formula 1 start lights reaction game with competitive tournament mechanics and leaderboard tracking.

## Features

### Core Mechanics
- 5 sequential red start lights with realistic F1 broadcast styling
- Random delay before lights out (unpredictable timing)
- Precise reaction time measurement using `performance.now()`
- False start detection
- Space bar or click to react

### Unique Mechanics
1. **Random Fake Flicker**: During the waiting phase, lights randomly flicker to test discipline
2. **Difficulty Modes**:
   - **Normal**: Standard timing with light flickers
   - **Hard**: Faster light sequence, more flickers
   - **Chaos**: Extended delays, multiple flickers, screen shake effects
3. **Tournament Mode**: 5-round tournaments with average scoring

### Player System
- Driver name and car number (1-99) registration
- Difficulty mode selection
- Session-based player identity

### Leaderboard
- Persistent localStorage-based leaderboard
- Tracks:
  - Best single reaction time
  - Best tournament average (5 rounds)
  - False start count
  - Total attempts
- Filter by difficulty mode
- Sort priority: Tournament average > Single reaction > False starts
- Tournament invalidation after 2+ false starts

### Broadcast-Style UI
- Dark gradient background
- Circular LED-style red lights with glow effects
- Professional F1 typography
- Smooth animations with Framer Motion
- Round indicators and status overlays

### Audio
- Light activation sounds
- "Lights out" audio cue
- False start warning sound
- Web Audio API-based sound generation

## Tech Stack

- **React 19** with Vite
- **Tailwind CSS 4** for styling
- **Framer Motion** for animations
- **Web Audio API** for sound effects
- **localStorage** for leaderboard persistence

## Installation

```bash
cd client
npm install
```

## Running the Game

```bash
npm run dev
```

Open your browser to `http://localhost:5173`

## How to Play

1. Enter your driver name and car number
2. Select difficulty mode
3. Click "START CHAMPIONSHIP" to begin
4. Watch the 5 red lights illuminate sequentially
5. Wait for all lights to go out (don't jump!)
6. Press SPACE or click immediately when lights go out
7. Complete 5 rounds for a tournament score
8. View your results on the leaderboard

## Game Rules

- Reaction times under 80ms are rejected as impossible (anti-cheat)
- False starts occur if you react before lights go out
- Tournament is invalid if you have more than 2 false starts
- Leaderboard prioritizes tournament average over single best time

## Project Structure

```
client/
├── src/
│   ├── components/
│   │   ├── StartForm.jsx          # Player registration
│   │   ├── GameController.jsx     # Main game state manager
│   │   ├── StartLights.jsx        # Light sequence & timing logic
│   │   ├── TournamentSummary.jsx  # Results display
│   │   └── LeaderboardTable.jsx   # Leaderboard UI
│   ├── hooks/
│   │   └── useAudio.js            # Audio effects hook
│   ├── App.jsx                    # Root component
│   ├── App.css                    # Global styles
│   ├── index.css                  # Tailwind imports
│   └── main.jsx                   # Entry point
├── package.json
└── vite.config.js
```

## Future Enhancements (Backend Integration)

When backend is ready:
- Replace localStorage with MongoDB via REST API
- Add endpoints:
  - `POST /api/submit-score`
  - `GET /api/leaderboard`
  - `GET /api/leaderboard/:difficulty`
- Server-side validation and anti-cheat
- Global leaderboard across all players
- Player authentication
- National flags and profile customization

## Performance Notes

- Uses `requestAnimationFrame` for smooth animations
- Proper cleanup of timers and event listeners
- No memory leaks
- Optimized re-renders with React hooks

## License

MIT
