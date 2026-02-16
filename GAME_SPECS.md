# F1 Launch Control – Final Specifications

## ✅ Tournament Mode
- **5 launches per session** ✓
- **Store each time** ✓
- **Calculate average** ✓
- **2 false starts invalidates run** ✓

## ✅ Leaderboard Data Model

Stored fields:
```javascript
{
  phone: String,
  name: String,
  number: Number,
  difficulty: String,
  bestSingleReaction: Number,
  bestTournamentAverage: Number,
  falseStarts: Number,
  totalAttempts: Number,
  createdAt: Date
}
```

### Sort Priority:
1. **Tournament Average** (lowest first)
2. **Best Single Reaction** (lowest first)
3. **Lowest False Starts** (lowest first)

## ✅ Broadcast UI Overlays

### Top Left
```
F1 Launch Control
Driver #Number
```

### Top Right
```
Round
X / 5
```

### Center Flash Messages
- `FALSE START`
- `LIGHTS OUT`
- `PERFECT LAUNCH`

### Bottom (Result Screen)
```
Reaction Time
0.184s
```

## ✅ Visual Polish

### Gantry Lights
- Metallic housing with gradient
- Glass lens effect with radial gradients
- Inner reflection highlights
- Extended bloom glow
- Smooth red-to-green transitions

### Track
- Asphalt grain texture
- Noise overlay
- Vignette edges
- Light gradient from top
- Yellow center dashed line

### Car
- Dynamic car number from player input
- Idle engine vibration (2px jitter)
- Soft drop shadow
- Heat haze behind rear
- Dual tire smoke on perfect launches
- Camera shake on launch

### Typography
- Condensed, bold, motorsport style
- Arial Black for headers
- Uppercase tracking
- Semi-transparent panels

## ✅ Audio Polish

### Light Activation
- Sharp mechanical click (800Hz square wave)
- 60ms duration

### Green Signal
- Bright urgent tone (1400Hz + 1600Hz)
- Layered sine waves
- 200ms duration

### False Start
- Deep harsh buzzer (150Hz sawtooth)
- Layered for intensity
- 400ms duration

## ✅ Gameplay Flow

1. Player enters: phone, name, car number
2. Start Championship
3. 5 rounds:
   - Click to arm clutch
   - Hold while lights sequence
   - Release on green
   - View reaction time
4. Tournament summary
5. Leaderboard

## ✅ Anti-Cheat
- Reject reaction times < 80ms
- Server-side validation ready

## ✅ Performance
- `performance.now()` for timing
- `requestAnimationFrame` for animations
- Proper cleanup
- No memory leaks
- Mobile compatible

## Tech Stack
- React 19 + Vite
- Tailwind CSS 4
- Framer Motion
- Web Audio API
- localStorage (MongoDB ready)

## Ready for Backend
All data structures and validation logic are prepared for MongoDB integration via REST API.
