# F1 Launch Control 🏎️

A realistic Formula 1 launch control game with authentic race grid visuals, gantry lights, and hold-to-release mechanics.

## Features

### Core Mechanics
- **Hold-to-Release Gameplay**: Hold space/click before lights sequence, release on green
- 5 sequential red gantry lights above track
- Lights turn GREEN after random delay
- Measure reaction time from green signal to release
- False start detection if released too early
- Perfect launch bonus for sub-200ms reactions

### Visual Design
- Realistic F1 race track with perspective
- Single car positioned on starting grid
- F1-style gantry lights at top center
- Starting grid lines and track markings
- Asphalt texture and track boundaries
- Smooth car acceleration animation
- Tire smoke effect on perfect launches
- Broadcast-style overlays

### Game Mechanics
1. **Hold Phase**: Player must hold before lights start
2. **Light Sequence**: 5 red lights illuminate sequentially
3. **Random Delay**: Unpredictable wait time (2-5 seconds)
4. **Fake Flickers**: Random light flickers to test discipline
5. **Green Signal**: All lights turn green simultaneously
6. **Release**: Player releases to launch
7. **Result**: Reaction time measured in milliseconds

### Player System
- Phone number registration
- Driver name
- Car number (1-99)
- Session-based identity

### Tournament Mode
- 5 rounds per tournament
- Track each round reaction time
- False starts count as disqualified rounds
- Final score = average of valid rounds
- Tournament invalid if 2+ false starts

### Leaderboard
- Best single launch reaction
- Best tournament average (5 rounds)
- False start count
- Total launches
- Persistent localStorage (ready for MongoDB)
- Sort by tournament avg > single best > false starts

### Broadcast UI Overlays
- Top Left: "F1 Launch Control" + Driver info
- Top Right: Round counter
- Center Flash: Status messages (FALSE START, PERFECT LAUNCH, etc.)
- Bottom: Reaction time display

### Audio
- Light activation beeps
- Green signal sound
- False start buzzer
- Web Audio API synthesis

### Anti-Cheat
- Rejects reaction times under 80ms
- Server-side validation ready

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

1. Enter phone number, driver name, and car number
2. Click "START CHAMPIONSHIP"
3. Click "START LAUNCH" to begin round
4. **HOLD** space bar or mouse button
5. Watch the red lights illuminate
6. Wait for lights to turn GREEN
7. **RELEASE** immediately when green
8. Complete 5 rounds for tournament score
9. View leaderboard

## Game Rules

- Must hold before lights sequence begins
- Release before green = False Start
- Reaction times under 80ms rejected (anti-cheat)
- Tournament invalid if 2+ false starts
- Perfect launch bonus for sub-200ms reactions

## Project Structure

```
client/
├── src/
│   ├── components/
│   │   ├── StartForm.jsx          # Player registration
│   │   ├── GameController.jsx     # Main game state manager
│   │   ├── StartLights.jsx        # Track scene & timing logic
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

## Performance

- Uses `performance.now()` for precise timing
- `requestAnimationFrame` for smooth animations
- Proper cleanup of timers and event listeners
- No memory leaks
- Mobile compatible

## Future Enhancements (Backend)

- Replace localStorage with MongoDB
- REST API endpoints
- Server-side validation
- Global leaderboard
- Player authentication
- National flags

## License

MIT

