# Galactic Siege - A Battleship Game

> A modern, space-themed implementation of the classic Battleship board game with immersive gameplay and polished UI.

**[Play Live Demo](https://ayoroq.github.io/battleship/)**

![Galactic Siege Gameplay Screenshot](assets/Battleship.jpeg)

## Features

### Game Modes
- **Single Player**: Battle against an intelligent AI opponent
- **Local Multiplayer**: Hot-seat gameplay with device passing for hidden ship placement

### Interactive Ship Placement
- **Drag & Drop**: Intuitive ship positioning system
- **Rotation**: Double-click ships or use rotate buttons
- **Auto-placement**: Random fleet deployment for quick starts
- **Visual Feedback**: Real-time placement validation

### Polished Experience
- **Space Theme**: Immersive galactic warfare aesthetic
- **Victory Celebrations**: Confetti animations for winners
- **Loading Screens**: Smooth transitions between game states

### Technical Excellence
- **Modern JavaScript**: ES6+ modules and clean architecture
- **Test-Driven Development**: Comprehensive Jest test suite
- **Webpack Bundling**: Optimized build process
- **Modular Design**: Separation of concerns with dedicated controllers

## Built With

- HTML5
- CSS3
- JavaScript
- [Webpack](https://webpack.js.org/)
- [Jest](https://jestjs.io/)
- [tsparticles-confetti](https://github.com/tsparticles/confetti) for the victory celebration!

## Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Build Tool**: Webpack 5
- **Testing**: Jest
- **Animations**: tsparticles-confetti

## Project Structure

```
battleship/
├── src/
│   ├── game-controller.js      # Main game orchestration
│   ├── single-player-controller.js
│   ├── multiplayer-controller.js
│   ├── ship-movement.js        # Drag & drop logic
│   ├── gameboard.js           # Game state management
│   └── styles/                # CSS modules
├── assets/                    # Images and audio
├── tests/                     # Jest test files
└── dist/                      # Built files
```

## Quick Start

### Prerequisites
- Node.js (v14+)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/ayoroq/battleship.git
cd battleship

# Install dependencies
npm install

# Start development server
npm start

# Run tests
npm test

# Build for production
npm run build
```

## How to Play

### Objective
Destroy all enemy ships before they destroy yours!

### Your Fleet
| Ship | Size | Quantity |
|------|------|----------|
| Dreadnought | 5 cells | 1 |
| Battlecruiser | 4 cells | 1 |
| Heavy Cruiser | 3 cells | 1 |
| Stealth Frigate | 3 cells | 1 |
| Interceptor | 2 cells | 1 |

### Setup Phase
1. **Drag & Drop**: Move ships from the dock to your grid
2. **Rotate**: Double-click ships or use rotate buttons
3. **Auto-Deploy**: Use "Random Placement" for instant setup
4. **Validate**: Ensure no ships overlap or go off-grid

### Combat Phase
- **Turn-based**: Players alternate firing shots
- **Target**: Click enemy grid coordinates to attack
- **Feedback**: 
  - **Red** = Direct hit
  - **Blue** = Miss
- **Victory**: First to sink all enemy ships wins!

## Development Notes

### Key Features Implemented
- **Modular Architecture**: Separate controllers for single/multiplayer modes
- **Event-Driven Design**: Clean separation between UI and game logic
- **Responsive Grid System**: CSS Grid for perfect board alignment
- **Accessibility**: ARIA labels and keyboard navigation support
- **Performance**: Efficient DOM manipulation and event delegation

### Testing Strategy
- Unit tests for game logic (gameboard, ship placement)
- Integration tests for player interactions
- Edge case handling (invalid moves, boundary conditions)

## Future Enhancements
- Online multiplayer with WebSockets
- Responsiveness across all device types
- AI difficulty levels
- Audio feedback for shots and ship sunk
- Custom fleet configurations
- Tournament mode
- Mobile app version

## Acknowledgements

- [The Odin Project](https://www.theodinproject.com/) - Curriculum and guidance
- [tsparticles](https://github.com/tsparticles/confetti) - Victory animations
- [Webpack](https://webpack.js.org/) - Module bundling
- [Jest](https://jestjs.io/) - Testing framework

## License

MIT License - see [LICENSE](/LICENSE) file for details.

---

**Built by [Ayo](https://github.com/ayoroq) as part of The Odin Project journey**
