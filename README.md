# 🌲 My Little Light - A Cozy Valentine Adventure

A delightful 2D web-based game where you play as a glowing light character with a customizable color, exploring eight unique forest levels to ultimately receive a sweet Valentine's Day message. Navigate peaceful collection challenges in the first three levels, then face an escalating threat from a mysterious Black Light in levels 4-6, before experiencing two emotionally powerful finale levels where light meets light.

## 📋 Overview

Choose your light color, then guide your glowing character through eight distinct levels while collecting magical orbs with the help of your companion character (a cute Totoro-inspired guide). The game starts peaceful and cozy, introduces tension and challenge as a dark entity begins pursuing you, then culminates in two beautiful finale levels about connection and light. After completing all levels, the game transitions into a heartfelt Valentine's Day reveal.

## 🎮 Game Flow

```
Title Screen → Name Input → Tutorial → Color Selection → 
  Level 1 (Easy) → Level 2 (Obstacles) → Level 3 (Peaceful) → 
  Level 4 (Black Light!) → Level 5 (Faster!) → Level 6 (Final Test!) → 
  Level 7 (Crossing Lights) → Level 8 (Held Against the Dark) →
  Transition → Valentine Reveal 💖
```

## ✨ Key Features

### 🎨 Customization & Personalization
- **Customizable Light Character**: Choose from 6 different light colors:
  - 🤍 Warm White (classic, gentle)
  - 💛 Soft Yellow (cheerful, golden)
  - 💙 Sky Blue (cool, calming)
  - 💜 Lavender (mystical, dreamy)
  - 🧡 Peach (warm, cozy)
  - 💚 Mint Green (fresh, natural)
- **Personalized Experience**: Optional name input personalizes all dialogue throughout the game
- **Full-Screen Pulse Effects**: Color-matched screen pulse when collecting orbs

### 🎯 Gameplay
- **Smooth Physics-Based Movement**: Acceleration, deceleration, and momentum feel natural
- **8 Unique Levels**:
  1. **Awakening Grove** - Easy introduction, no threats
  2. **Whispering Woods** - Medium difficulty with obstacles
  3. **Heartwood Haven** - Peaceful, romantically themed
  4. **Fading Grove** - Black Light introduction (slow chase)
  5. **Eclipse Path** - Increased difficulty (faster chase)
  6. **Last Light Clearing** - Final dramatic challenge
  7. **Crossing Lights** - Two lights meeting in the center
  8. **Held Against the Dark** - Together against the darkness
- **Progressive Difficulty**: Peaceful start → escalating tension → dramatic climax → emotional resolution
- **Black Light Mechanic**: A dark entity chases you in levels 4-6, creating urgency
- **Second Light Mechanic**: An AI-controlled companion light appears in levels 7-8
- **Dual Control Schemes**: Use either Arrow Keys OR WASD

### ✨ Visual Polish
- **Trail Particles**: Your light leaves a glowing trail as you move
- **Multi-Layer Glow Effects**: Depth and atmosphere through layered lighting
- **Ambient Sparkles**: Magical particles throughout each scene
- **Unique Backgrounds**: Each level has custom artwork and atmosphere
- **Smooth Animations**: 60 FPS canvas-based rendering

### 💖 Characters
- **Player Light**: Customizable glowing orb with physics-based movement
- **Guide Character**: Totoro-inspired lazy egg companion offering encouragement
- **Black Light**: Menacing dark entity that pursues you (Levels 4-6)
- **Second Light**: AI-controlled companion light that mirrors your movements (Levels 7-8)
- **Shadow Entities**: Circling darkness that must be avoided (Level 8)

### 🎭 Story Arc
- **Act 1 (Levels 1-3)**: Restore the forest's magic peacefully
- **Act 2 (Levels 4-6)**: Face a growing darkness that threatens everything
- **Act 3 (Levels 7-8)**: Light finds light, love conquers darkness
- **Epilogue**: Emotional Valentine's Day reveal as a reward

## 🎯 Levels in Detail

### Level 1: Awakening Grove
- **Difficulty**: ⭐ Easy
- **Theme**: Sunny forest awakening
- **Orbs**: 5
- **Obstacles**: None
- **Special**: Introduction to core mechanics
- **Atmosphere**: Warm, welcoming, tutorial-like

### Level 2: Whispering Woods
- **Difficulty**: ⭐⭐ Medium
- **Theme**: Mystical forest with light rays
- **Orbs**: 6
- **Obstacles**: 3 barriers
- **Special**: Obstacles introduced
- **Atmosphere**: Magical, slightly more challenging

### Level 3: Heartwood Haven
- **Difficulty**: ⭐ Easy
- **Theme**: Romantic pink sky
- **Orbs**: 5 (arranged in heart pattern)
- **Obstacles**: None
- **Special**: Emotionally warm, peaceful
- **Atmosphere**: Calm before the storm

### Level 4: Fading Grove
- **Difficulty**: ⭐⭐ Medium (NEW MECHANIC)
- **Theme**: Darker tones, ominous
- **Orbs**: 4
- **Obstacles**: 1 simple barrier
- **Special**: **Black Light introduced** (Speed: 1.8)
- **Atmosphere**: Tension begins, manageable threat

### Level 5: Eclipse Path
- **Difficulty**: ⭐⭐⭐ Hard
- **Theme**: Shadowy maze
- **Orbs**: 5
- **Obstacles**: 4 barriers creating pathways
- **Special**: **Faster Black Light** (Speed: 2.3)
- **Atmosphere**: Serious danger, requires strategy

### Level 6: Last Light Clearing
- **Difficulty**: ⭐⭐⭐⭐ Very Hard
- **Theme**: Dramatic final battleground
- **Orbs**: 6 (around perimeter)
- **Obstacles**: 4 barriers (provide safe zones)
- **Special**: **Black Light spawns in center** (Speed: 2.5)
- **Atmosphere**: Intense, epic finale

### Level 7: Crossing Lights
- **Difficulty**: ⭐ Easy (Narrative Focus)
- **Theme**: Two lights meeting
- **Orbs**: 0 (no collection)
- **Obstacles**: None
- **Special**: **AI companion light** - both lights move to center
- **Mechanics**: Player and second light automatically converge
- **Atmosphere**: Gentle, romantic, peaceful
- **Message**: "Sometimes... light finds light."

### Level 8: Held Against the Dark
- **Difficulty**: ⭐⭐⭐ Medium (Survival Focus)
- **Theme**: Standing together against darkness
- **Orbs**: 0 (no collection)
- **Obstacles**: None
- **Special**: **Second light stays close** - waves of shadow entities appear
- **Mechanics**: Stay near your companion as darkness circles
- **Atmosphere**: Tense but hopeful, protective
- **Message**: "Together, nothing can touch you."

## 🕹️ Controls

### Keyboard Controls
- **Movement**: Arrow Keys OR WASD
  - ⬆️ / W - Move Up
  - ⬇️ / S - Move Down
  - ⬅️ / A - Move Left
  - ➡️ / D - Move Right
  
### UI Interactions
- **Mouse Click**: 
  - Navigate menus
  - Dismiss dialogue bubbles
  - Select light color
  - Click buttons
- **Enter Key**:
  - Advance dialogue
  - Confirm selections
  - Continue after level complete

## 🚀 How to Run

### Method 1: Direct File Open (Simple)
1. Download all files maintaining the folder structure
2. Double-click `index.html` to open in your browser

### Method 2: Local Server (Recommended)

**Using Python 3:**
```bash
python -m http.server 8000
```

**Using Python 2:**
```bash
python -m SimpleHTTPServer 8000
```

**Using Node.js:**
```bash
npx http-server
```

**Using PHP:**
```bash
php -S localhost:8000
```

Then open your browser to `http://localhost:8000`

## 📁 File Structure

```
my-little-light/
│
├── index.html              # Main HTML file with UI overlays
├── styles.css              # All styling and animations
├── README.md               # This file
├── FILE_STRUCTURE.md       # Detailed code architecture
│
└── js/
    ├── main.js            # Entry point - initializes game
    ├── game.js            # Game manager - controls screens and state
    ├── config.js          # ⭐ EDIT THIS: All settings, dialogue, levels
    ├── utils.js           # Helper functions
    ├── entities.js        # Player, Guide, Collectibles, Obstacles, BlackLight
    │
    └── screens/
        ├── titleScreen.js          # Title screen with forest scene
        ├── nameInputScreen.js      # Optional name input
        ├── tutorialScreen.js       # Tutorial with controls
        ├── colorSelectionScreen.js # Choose light color
        ├── levelScreen.js          # Main gameplay
        ├── transitionScreen.js     # Brief transition screen
        └── valentineScreen.js      # Valentine reveal
```

## 🎨 How to Customize

### 🗣️ Changing Dialogue

**File:** `js/config.js`

All dialogue is in the `CONFIG.dialogue` object. Use `{name}` as a placeholder for the player's name:

```javascript
dialogue: {
    namePrompt: "Before we begin, what should I call you?",
    
    tutorial: [
        "Welcome{name}! I'm Lumis, your forest guide.",
        "Use arrow keys or WASD to move around.",
        // ... more tutorial lines
    ],
    
    level1Start: "The forest whispers to those who listen{name}...",
    level1Complete: "You did wonderfully{name}!",
    
    // Levels 4-6 dialogue acknowledges the Black Light threat
    level4Start: "Wait{name}... something feels wrong...",
    level5Start: "The shadow grows bolder{name}...",
    level6Start: "This is the final test{name}...",
    
    // Levels 7-8 dialogue about connection and love
    level7Start: "Sometimes{name}... light finds light.",
    level8Start: "Together{name}, nothing can touch you.",
    
    valentine: "Will you be my Valentine{name}?"  // ← The big reveal!
}
```

**The `{name}` placeholder** automatically becomes:
- `, YourName` if they entered a name
- Empty string if they skipped name input

### 🎨 Adding/Modifying Light Colors

**File:** `js/config.js` → `CONFIG.lightColors` array

```javascript
lightColors: [
    {
        name: 'Your Color Name',
        color: '#hexcode',  // Main light color
        glow: '#hexcode'    // Glow/aura color
    },
    // ... add more colors (max 6 fits nicely in UI)
]
```

**Also update pulse colors in `styles.css`:**
```css
.pulse-overlay.pulse-yourcolor {
    background: radial-gradient(circle, rgba(r, g, b, 0.6), transparent);
}
```

### 🎯 Modifying Levels

**File:** `js/config.js` → `CONFIG.levels` array

Each level configuration:

```javascript
{
    name: "Level Name",              // Display name
    playerStart: { x: 100, y: 300 }, // Starting position
    guidePosition: { x: 700, y: 100 },// Guide's position
    
    collectibles: [                  // Orb positions
        { x: 200, y: 150 },
        { x: 400, y: 200 },
        // ... add more
    ],
    
    obstacles: [                     // Barrier positions
        { x: 250, y: 200, width: 100, height: 20 },
        // ... add more
    ],
    
    // For levels 4-6 only:
    blackLightStart: { x: 700, y: 500 },  // Where Black Light spawns
    blackLightSpeed: 2.0                   // Chase speed (1.8-2.5 recommended)
}
```

**Tips for Level Design:**
- **Easy levels**: No obstacles, orbs spread out, no Black Light
- **Medium**: Add 2-4 obstacles, closer orbs
- **Hard**: Many obstacles creating maze, fast Black Light
- **Black Light Speed Guide**:
  - 1.5-1.8: Gentle introduction
  - 2.0-2.3: Serious threat
  - 2.5+: Intense challenge (hard to escape)

### ⚙️ Game Settings

**File:** `js/config.js`

```javascript
// Canvas size
canvas: {
    width: 800,
    height: 600
}

// Player settings (light character)
player: {
    size: 30,           // Visual size
    speed: 3,           // Movement speed (higher = faster)
    trailLength: 12     // Number of trail particles
}

// Physics (in entities.js Player class)
this.acceleration = 0.4      // How quickly you speed up
this.deceleration = 0.92     // How quickly you slow down (0-1)
this.maxSpeed = 3            // Top speed

// Collectible settings
collectible: {
    size: 20,
    color: '#ffb3ba',
    glowColor: 'rgba(255, 179, 186, 0.6)'
}
```

### 🎨 Changing Colors

**File:** `js/config.js` → `CONFIG.colors`

```javascript
colors: {
    background: '#faf8f3',    // Canvas background
    player: '#4a7c59',        // Default player (overridden by light color)
    guide: '#ffd89b',         // Guide character base color
    collectible: '#ffb3ba',   // Orb color
    obstacle: '#2d4a3e',      // Obstacle color
    goal: '#7fb69e'           // Goal color (if used)
}
```

**Also edit CSS variables in `styles.css`:**

```css
:root {
    --forest-deep: #2d4a3e;    /* Deep forest green */
    --rose: #ffb3ba;           /* Soft pink/rose */
    --gold: #ffd89b;           /* Warm gold */
    --mint: #a8c69f;           /* Mint green */
    --cream: #faf8f3;          /* Cream background */
    --sage: #7fb69e;           /* Sage green */
}
```

## 🎮 Gameplay Tips

### General Strategy
- **Take your time** - The physics system rewards smooth, controlled movement
- **Learn the patterns** - Each level has an optimal collection route
- **Use obstacles** - In Black Light levels, obstacles can provide cover

### For Black Light Levels (4-6)
- **Keep moving** - Standing still makes you an easy target
- **Plan your route** - Collect orbs in an order that keeps you mobile
- **Use walls strategically** - Black Light has simple AI, can get stuck temporarily
- **Don't panic** - Black Light is fast but predictable
- **Corner safety** - Sometimes the safest spot is in a corner with one orb left

### Movement Tricks
- **Diagonal movement** - Press two direction keys for 1.4x speed
- **Quick turns** - Release all keys, then press new direction for sharp turn
- **Momentum management** - Let go early to coast to a stop at your target
- **Slide technique** - When against obstacle, you can slide along it

## 🛠️ Technical Details

### Technology Stack
- **Framework**: Vanilla JavaScript (no external dependencies!)
- **Graphics**: HTML5 Canvas API
- **Animation**: RequestAnimationFrame loop at ~60 FPS
- **Architecture**: Screen-based state management
- **Physics**: Custom momentum-based movement system
- **Compatibility**: Modern browsers (Chrome, Firefox, Safari, Edge)

### Performance
- **Frame Rate**: 60 FPS target
- **Canvas Size**: 800×600 pixels
- **Particle Systems**:
  - Player trail: 12 particles max
  - Fireflies (title): 15 entities
  - Sparkles: 10-20 per screen
- **Optimizations**:
  - Only active screen updates
  - Collision checks only in gameplay
  - Object pooling for particles
  - No unnecessary redraws

### Browser Support
- ✅ **Chrome** - Full support
- ✅ **Firefox** - Full support
- ✅ **Safari** - Full support
- ✅ **Edge** - Full support
- ⚠️ **Mobile** - Requires keyboard (not optimized for touch)

## 🐛 Troubleshooting

### Game doesn't start
- Check browser console (F12) for errors
- Ensure all files are in correct folders
- Try using a local server instead of `file://` protocol
- Make sure JavaScript is enabled in browser

### Blank/Black canvas
- Verify canvas size in `config.js`
- Check if JavaScript is enabled
- Clear browser cache and refresh (Ctrl+F5)
- Inspect console for error messages

### Movement feels wrong
**Too slow/sluggish:**
- Increase `speed` in `config.js` (try 4-5)
- Increase `acceleration` in `entities.js` (try 0.5-0.6)
- Decrease `deceleration` (try 0.88-0.90 for quicker stop)

**Too fast/slippery:**
- Decrease `speed` in `config.js` (try 2-2.5)
- Decrease `acceleration` (try 0.3)
- Increase `deceleration` (try 0.94-0.95 for slower stop)

### Black Light too hard/easy
**Too hard:**
- Decrease `blackLightSpeed` in level config (try -0.2 to -0.5)
- Add more obstacles for cover
- Increase player speed
- Reduce number of collectibles

**Too easy:**
- Increase `blackLightSpeed` (try +0.2 to +0.5)
- Remove some obstacles
- Decrease player speed
- Add more collectibles

### Colors look wrong
- Check both `config.js` AND `styles.css` (colors in multiple places)
- Some colors are hardcoded in entity drawing methods
- Pulse effect colors defined in CSS `.pulse-overlay` classes
- Clear browser cache after changes

### Dialogue doesn't appear
- Check browser console for errors
- Verify UI element IDs match between HTML and JavaScript
- Ensure `Utils.showUI()` is being called
- Check that dialogue text exists in `config.js`

### Black Light passes through obstacles
- This is expected behavior (simple AI)
- Black Light has basic obstacle avoidance, not perfect
- Consider it a "phase through" dark entity for gameplay
- To fix: Implement more sophisticated pathfinding in `entities.js`

## 💡 Tips for Developers

### Getting Started
1. **Start with `config.js`** - Most customization happens here
2. **Test in browser** - Use developer tools (F12) to debug
3. **Read `FILE_STRUCTURE.md`** - Detailed code architecture guide
4. **Focus on one feature** - Don't try to modify everything at once
5. **Use `console.log()`** - Debug game state and flow

### Code Organization
- **Data vs Logic**: Content in `config.js`, logic in other files
- **Screen Pattern**: All screens follow `enter()`, `update()`, `draw()` lifecycle
- **Entity Pattern**: All entities have `update()` and `draw()` methods
- **Utils First**: Check `utils.js` before writing helper functions

### Common Modifications
**Adding a collectible:**
```javascript
// In config.js, levels array
collectibles: [
    { x: 300, y: 200 },  // ← Add this line
]
```

**Changing dialogue:**
```javascript
// In config.js, dialogue object
level1Start: "Your new message{name}!",
```

**Adjusting difficulty:**
```javascript
// In config.js
blackLightSpeed: 2.2,  // Speed up/slow down
player.speed: 3.5,     // Make player faster
```

## 🎯 Game Design Notes

### Difficulty Curve
The game uses a **narrative difficulty arc**:
1. **Tutorial** - Learn controls safely
2. **Levels 1-3** - Build confidence, enjoy peaceful gameplay
3. **Level 4** - Introduce threat (manageable)
4. **Level 5** - Escalate tension (challenging)
5. **Level 6** - Climactic finale (intense but fair)
6. **Level 7** - Tender moment (narrative focus, no challenge)
7. **Level 8** - Together against darkness (moderate survival challenge)
8. **Valentine** - Emotional payoff

### Emotional Journey
- **Beginning**: Curiosity and learning
- **Middle**: Peaceful, meditative flow state
- **Turn**: Surprise and rising tension (Black Light appears)
- **Climax**: Achievement through challenge
- **Denouement**: Connection and unity (lights meeting)
- **Resolution**: Love and protection (together against darkness)
- **Finale**: Declaration of love (Valentine reveal)

### Color Psychology
Each light color evokes different feelings:
- **Warm White**: Classic, pure, timeless
- **Soft Yellow**: Happy, optimistic, cheerful
- **Sky Blue**: Calm, peaceful, trustworthy
- **Lavender**: Mystical, dreamy, creative
- **Peach**: Warm, comforting, gentle
- **Mint Green**: Fresh, natural, balanced

### Accessibility Considerations
- ✅ Clear visual feedback on all interactions
- ✅ Forgiving collision detection (not pixel-perfect)
- ✅ Optional name input (skip if preferred)
- ✅ Dual control schemes (Arrow keys OR WASD)
- ✅ No time pressure in peaceful levels
- ⚠️ No colorblind mode (future improvement)
- ⚠️ No keyboard-only menu navigation (uses mouse)
- ⚠️ No screen reader support (visual-only game)

## 📊 Game Statistics

- **Total Levels**: 8 (6 gameplay + 2 narrative)
- **Total Orbs**: 31 across all levels
- **Light Colors**: 6 options
- **Screens**: 7 unique screens
- **Code Size**: ~2500 lines of JavaScript
- **Dependencies**: 0 (100% vanilla!)
- **Estimated Playtime**: 20-25 minutes
- **Difficulty Range**: Easy to Hard
- **Replayability**: High (different colors, challenge runs)

## 🎓 Learning Resources

This game demonstrates:
- **Canvas API** - 2D graphics rendering
- **RequestAnimationFrame** - Smooth 60 FPS animation
- **Class-based OOP** - Organized entity system
- **State Management** - Screen-based architecture
- **Physics Simulation** - Momentum-based movement
- **Collision Detection** - Circle and rectangle collision
- **Input Handling** - Keyboard events
- **UI/Canvas Integration** - Hybrid HTML/Canvas approach
- **Configuration Pattern** - Separate data from logic
- **Event-Driven Design** - Button clicks trigger transitions

## 🔮 Future Enhancement Ideas

**Gameplay:**
- Mobile touch controls
- Additional levels or level packs
- Multiple Black Lights simultaneously
- Power-ups (speed boost, temporary invincibility)
- Time-based challenges
- Speed run mode with timer
- Score system based on efficiency
- Multiple endings based on performance

**Visual:**
- Sound effects and background music
- More elaborate particle systems
- Animated cutscenes between acts
- Weather effects (rain, snow)
- Day/night cycle
- Parallax scrolling backgrounds

**Features:**
- Save/load system
- Achievements
- Leaderboards
- Level editor
- Custom color creation (RGB sliders)
- Multiple Valentine themes
- Difficulty settings

## 📜 License

Feel free to customize and use this game for personal projects! If you create something cool with it, I'd love to hear about it.

## 🙏 Acknowledgments

**Inspiration:**
- Totoro/Gudetama aesthetic for the guide character
- Cozy game movement from Journey, Flower, ABZÛ
- Progressive difficulty from Portal, Celeste

**Techniques:**
- HTML5 Canvas tutorials from MDN
- Physics inspiration from nature's gentleness
- Color theory from cozy aesthetics

---

Made with 💚 for a special someone 💖

**TL;DR:** A cozy light-collecting adventure with escalating tension and emotional connection, culminating in a sweet Valentine's message. Play as a customizable glowing orb, navigate 8 levels (3 peaceful, 3 with chase mechanic, 2 narrative-focused about love and connection), and experience a heartwarming reveal. Pure vanilla JavaScript, no dependencies, runs in any modern browser.

**Quick Start:** Open `index.html` → Choose color → Collect orbs → Avoid darkness → Meet your light → Stand together → Receive Valentine! 💖