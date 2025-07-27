# Goon Clicker 🎮

A React Native idle clicker game inspired by Cookie Clicker! Tap the goon button to earn goons, buy upgrades, and watch your goon empire grow.

## Features

- **Tap to Earn**: Click the goon button to earn goons
- **Upgrades System**: Purchase various upgrades to increase your goon production
- **Auto-Clickers**: Buy upgrades that automatically generate goons per second
- **Statistics Tracking**: Monitor your progress with detailed statistics
- **Offline Progress**: Earn goons even when the app is closed
- **Beautiful UI**: Modern gradient design with smooth animations
- **Haptic Feedback**: Tactile feedback for satisfying interactions

## Upgrades Available

1. **Click Power** - Increase goons earned per click
2. **Auto Clicker** - Automatically generates goons per second
3. **Goon Factory** - Mass produce goons automatically
4. **Goon Mine** - Extract goons from deep underground
5. **Goon Bank** - Invest goons for massive returns

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (for iOS) or Android Emulator (for Android)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Goon-Clicker-React
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Run on your preferred platform:
   - Press `i` for iOS Simulator
   - Press `a` for Android Emulator
   - Press `w` for web browser
   - Scan QR code with Expo Go app on your phone

## Game Mechanics

### Earning Goons
- **Manual Clicking**: Tap the goon button to earn goons
- **Auto-Generation**: Upgrades provide passive goon income per second
- **Offline Progress**: Continue earning goons even when the app is closed

### Upgrades
- Each upgrade has an increasing cost (15% increase per level)
- Upgrades provide different benefits:
  - Click Power: Increases goons per click
  - Auto-generators: Provide goons per second

### Statistics
Track your progress with detailed statistics including:
- Total goons earned
- Current goons
- Total clicks
- Goons per second
- Goons per click
- Play time
- Click rate and efficiency

## Project Structure

```
src/
├── context/
│   └── GameContext.tsx      # Game state management
├── screens/
│   ├── GameScreen.tsx       # Main game screen
│   ├── ShopScreen.tsx       # Upgrades shop
│   └── StatsScreen.tsx      # Statistics screen
└── types/
    └── GameTypes.ts         # TypeScript type definitions
```

## Technologies Used

- **React Native** - Cross-platform mobile development
- **Expo** - Development platform and tools
- **TypeScript** - Type-safe JavaScript
- **React Navigation** - Screen navigation
- **Expo Linear Gradient** - Beautiful gradient backgrounds
- **Expo Haptics** - Tactile feedback
- **AsyncStorage** - Local data persistence

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Future Enhancements

- [ ] Achievements system
- [ ] Sound effects and background music
- [ ] More upgrade types
- [ ] Prestige system
- [ ] Cloud save functionality
- [ ] Social features
- [ ] Daily challenges
- [ ] Custom themes

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by Cookie Clicker by Orteil
- Built with React Native and Expo
- Icons provided by Ionicons

---

Happy clicking! 🎯 