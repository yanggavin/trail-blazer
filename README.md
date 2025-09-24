# Trail Blazer 🏃‍♀️🏔️

A comprehensive trail running tracking app built with React Native and Expo. Track your runs, capture photos, monitor elevation, and review your performance across beautiful, intuitive screens.

## 📱 Features

### 🏃 Run Tracking
- **Real-time tracking** - Distance, duration, pace, and elevation
- **Live stats display** - 5-card stats grid with current metrics
- **Elevation monitoring** - Current elevation, elevation gain, min/max tracking
- **Pace calculation** - Real-time pace per kilometer
- **Trail visualization** - Interactive map with trail overlay

### 📸 Photo Capture
- **In-run photography** - Capture scenic moments during your trail runs
- **Photo gallery** - Browse all photos from your running history
- **Full-screen viewer** - Professional photo viewing with navigation
- **Run integration** - Photos automatically tagged with run information
- **Search functionality** - Find photos by run name or date

### 📊 Performance Analytics
- **Comprehensive stats** - Distance, duration, pace, calories, elevation gain
- **Elevation profiling** - Track elevation changes throughout your run
- **Historical data** - Complete run history with detailed statistics
- **Run summaries** - Beautiful summary screens before saving
- **Progress tracking** - Monitor your improvement over time

### 🎨 Beautiful UI/UX
- **Professional design** - Clean, modern interface optimized for trail runners
- **Consistent theming** - Cohesive color scheme and typography
- **Mobile-first** - Optimized for one-handed operation while running
- **Accessible** - Proper touch targets and readable text sizes
- **Responsive layout** - Works perfectly across different screen sizes

## 🛠️ Tech Stack

- **React Native** - Cross-platform mobile development
- **Expo SDK 51** - Development platform and tools
- **TypeScript** - Type-safe development
- **Zustand** - Lightweight state management
- **React Navigation 6** - Navigation and routing
- **Expo Vector Icons** - Consistent iconography
- **React Native SVG** - Trail path visualization

## 📱 Screens & Navigation

### 🏠 Main Tabs
- **Track** - Active run tracking with real-time stats
- **History** - Browse your complete running history
- **Photos** - Gallery of all your trail running photos

### 📄 Detail Screens
- **Run Details** - Comprehensive statistics and photos from specific runs
- **Run Summary** - Pre-save review of completed runs
- **Saved Confirmation** - Success screen after saving runs
- **Photo Gallery** - Full-screen photo viewing with navigation

## 🎯 Key Implementations

### 📊 Elevation Tracking
- Real-time elevation monitoring during runs
- Elevation gain calculation (upward movement only)
- Min/max elevation tracking
- Elevation data points for future profile visualization
- Realistic elevation simulation for demo purposes

### 🖼️ Photo Management
- Integration with device camera via expo-image-picker
- Photo aggregation from all runs (current + historical)
- Metadata tracking (timestamp, run association)
- Grid layout with responsive design
- Modal viewer with navigation controls

### 📱 Responsive Design
- Mobile-first approach for trail running scenarios
- Optimized layouts preventing button overflow
- Compact stat cards with readable information
- No horizontal scrolling on any screen
- Proper SafeArea handling for all devices

### 🎨 UI/UX Excellence
- Consistent color theming throughout app
- Professional typography hierarchy
- Touch-friendly button sizes (minimum 48px)
- Loading states and empty state handling
- Smooth transitions and animations

## 🏗️ Architecture

### State Management
```typescript
// Zustand store with comprehensive run data
interface RunState {
  // Current run status
  status: 'idle' | 'running' | 'paused' | 'finished';
  
  // Basic metrics
  distanceMeters: number;
  durationSec: number;
  paceStr: string;
  
  // Elevation tracking
  currentElevationM: number;
  totalElevationGainM: number;
  minElevationM: number;
  maxElevationM: number;
  elevationPoints: ElevationPoint[];
  
  // Media and history
  photos: Photo[];
  history: RunRecord[];
}
```

### Navigation Structure
```
RootNavigator (Stack)
├── Welcome
├── Onboarding  
├── MainTabs (TabNavigator)
│   ├── Track
│   ├── History
│   └── Photos
├── RunSummary
├── RunDetails
└── SavedConfirmation
```

### Component Organization
```
src/
├── components/          # Reusable UI components
├── navigation/         # Navigation configuration
├── screens/           # Screen components
├── store/            # Zustand state management
└── theme/           # Colors and styling constants
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS development)
- Android Emulator (for Android development)

### Installation
```bash
# Clone the repository
git clone [repository-url]
cd trail-blazer

# Install dependencies
npm install

# Start the development server
npx expo start

# Run on iOS simulator
npx expo run:ios

# Run on Android emulator  
npx expo run:android
```

### Demo Data
The app includes a "Add Demo" button in the History tab (when no runs exist) that populates sample data for testing:
- 2 demo runs with realistic elevation profiles
- 5 high-quality trail photos
- Complete statistics and timestamps

## 📊 Features Overview

### Track Screen
- **Real-time metrics**: Distance, Duration, Elevation, Elevation Gain, Pace
- **Interactive map**: Trail overlay with zoom controls
- **Photo capture**: Take photos during runs
- **Run controls**: Start, Pause, Resume, Stop buttons
- **Optimized layout**: All controls visible without scrolling

### History Screen  
- **Run cards**: Distance, duration, and elevation gain
- **Search functionality**: Find runs by name or date
- **Dynamic titles**: Generates meaningful run names
- **Tap to details**: Navigate to comprehensive run information
- **Empty state**: Encouraging message for new users

### Photos Screen
- **3-column grid**: Responsive photo layout
- **Search photos**: Find photos by run or date  
- **Full-screen viewer**: Professional photo viewing experience
- **Navigation controls**: Browse between photos with arrows
- **Run context**: Each photo shows associated run information

### Run Details Screen
- **6-stat grid**: Distance, Duration, Pace, Calories, Elevation Gain, Max Elevation
- **Hero image**: Large photo from the run
- **Back button**: Easy navigation to previous screen
- **Photo gallery**: Horizontal scroll of all run photos
- **Run metadata**: Date, time, and generated run title

### Run Summary Screen
- **Pre-save review**: All statistics before confirming save
- **5-stat layout**: Distance, Duration, Pace, Elevation Gain, Max Elevation
- **Photo preview**: Map with photo overlays
- **Action buttons**: Always-visible Discard/Save options
- **No scrolling**: All content fits without horizontal overflow

## 🎨 Design System

### Colors
- **Primary**: `#17cf17` (Trail Green)
- **Background Light**: `#f6f8f6` (Off White)  
- **Background Dark**: `#112111` (Dark Forest)
- **Text Light**: `#1A1C19` (Near Black)
- **Text Dark**: `#E2E3DE` (Off White)

### Typography
- **Headers**: Bold, 18-24px
- **Stats Values**: Bold, 24-32px
- **Labels**: Medium, 14px
- **Body Text**: Regular, 14-16px

### Spacing
- **Standard padding**: 16px
- **Card gaps**: 8-12px
- **Button heights**: 48px (touch-friendly)
- **Border radius**: 12-16px (modern, clean)

## 🔬 Testing & Quality

### Demo Features
- Realistic elevation simulation during runs
- High-quality sample photos for testing
- Multiple demo runs with varying statistics
- Search functionality testing with sample data

### Performance Optimizations  
- Efficient state updates with Zustand
- Optimized image loading and caching
- Responsive layouts preventing layout thrash
- Minimal re-renders with proper memoization

### Accessibility
- Minimum 48px touch targets
- Sufficient color contrast ratios  
- Readable font sizes (minimum 14px)
- Proper navigation flow
- Screen reader compatible structure

## 🚀 Future Enhancements

### Planned Features
- **Elevation profiles** - Visual charts of elevation over distance
- **GPS integration** - Real location tracking with maps
- **Social features** - Share runs with friends
- **Training plans** - Structured workout programs
- **Weather integration** - Current conditions during runs
- **Export functionality** - GPX/TCX file support

### Technical Improvements
- **Offline support** - Continue tracking without internet
- **Background tracking** - Run tracking when app is backgrounded
- **Push notifications** - Workout reminders and achievements
- **Data sync** - Cloud backup and multi-device sync
- **Analytics** - Advanced performance insights

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)  
5. Open a Pull Request

## 📞 Support

If you have any questions or need help with the app, please open an issue on GitHub.

---

**Trail Blazer** - Making every trail run memorable 🏃‍♀️🌲🏔️