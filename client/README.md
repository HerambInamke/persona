# F1 Launch Control – Broadcast Edition 🏎️

A cinematic MERN stack F1 launch control game with realistic broadcast visuals, authentic race grid, and professional motorsport styling.

## Visual Features

### Realistic Gantry Lights
- Metallic housing with gradient shading
- 5 LED circular lenses with glass effect
- Radial gradient lighting (red/green)
- Inner glass reflection highlights
- Extended bloom glow using layered shadows
- Smooth color transitions

### Cinematic Track Design
- Asphalt grain texture with noise overlay
- Subtle vignette on screen edges
- Light source gradient from top
- Yellow center dashed line
- White track boundaries
- Starting grid markings
- Perspective depth

### Enhanced F1 Car
- Dynamic car number from player input
- Idle engine vibration (2px jitter) while clutch held
- Soft drop shadow beneath car
- Heat haze effect behind rear
- Dual tire smoke burst on perfect launches (<200ms)
- Smooth acceleration with custom easing
- Camera shake on launch

### Broadcast UI Overlays
- Top Left: Semi-transparent panel with "F1 LAUNCH CONTROL" + Driver info
- Top Right: Round counter with red gradient
- Center Flash: Large motorsport-style messages (FALSE START, PERFECT LAUNCH, LIGHTS OUT)
- Condensed, bold typography
- Minimal, professional styling

## Gameplay

### Core Mechanics
1. **Hold Phase**: Click anywhere or hold space to arm clutch
2. **Light Sequence**: 5 red lights illuminate sequentially
3. **Random Delay**: Unpredictable wait (2-5 seconds)
4. **Fake Flickers**: Random light flickers to test discipline
5. **Green Signal**: All lights turn green simultaneously
6. **Release**: Click/release immediately to launch
7. **Timing**: Reaction measured in milliseconds

### Controls
- **Click anywhere** on screen to start and release
- **Space bar** to hold and release
- Works on both desktop and mobile

### Scoring
- Reaction times under 80ms rejected (anti-cheat)
- Perfect launch bonus for sub-200ms reactions
- False start if released before green
- Tournament mode: 5 rounds, average scoring
- Tournament invalid if 2+ false starts

## Player Registration

Required fields:
- Phone number
- Driver name  
- Car number (1-99) - displayed on car during race

## Tech Stack

- **React 19** with Vite
- **Tailwind CSS 4** for styling
- **Framer Motion** for animations
- **Web Audio API** for sound effects
- **localStorage** for leaderboard (MongoDB ready)

## Installation

```bash
cd client
npm install
```

## Running the Game

```bash
npm run dev
```

Open `http://localhost:5173`

## How to Play

1. Enter phone number, driver name, and car number
2. Click "START CHAMPIONSHIP"
3. Click "START LAUNCH" to begin round
4. Click anywhere to arm clutch (or hold space)
5. Watch red lights illuminate
6. Wait for lights to turn GREEN
7. Click/release immediately when green
8. Complete 5 rounds for tournament score
9. View leaderboard

## Visual Improvements Implemented

✅ Lights with depth - Glass lens effect, metallic housing, bloom glow  
✅ Track texture - Asphalt grain, noise overlay, vignette  
✅ Car presence - Idle vibration, shadow, heat haze, tire smoke  
✅ Broadcast overlays - Semi-transparent panels, motorsport typography  
✅ Immersive instructions - Centered minimal text ("Hold Space to Arm Clutch")  
✅ Dynamic car number - Uses player's chosen number  
✅ Camera shake - On perfect launches  
✅ Enhanced animations - Custom easing, smooth transitions  

## Performance

- Uses `performance.now()` for precise timing
- `requestAnimationFrame` for smooth animations
- Proper cleanup of timers and event listeners
- No memory leaks
- Mobile compatible

## Future Backend Integration

- Replace localStorage with MongoDB
- REST API endpoints
- Server-side validation
- Global leaderboard
- Player authentication

## License

MIT

