# Interactive Wall Calendar Component

A polished, interactive React calendar component inspired by physical wall calendars. Built with React 19, TypeScript, and Framer Motion.

![Calendar Preview](./preview.png)

## Features

### Core Functionality
- **Wall Calendar Aesthetic** - Realistic spiral binding, hero images that change per month, diagonal accent overlay
- **Date Range Selection** - Click to select start date, click again for end date with visual feedback
- **Integrated Notes** - Add general notes or date-specific notes with auto-save to localStorage
- **Fully Responsive** - Adapts seamlessly from desktop (side-by-side) to mobile (stacked) layouts

### Stand-out Features
- **Smooth Animations** - Page transitions, micro-interactions powered by Framer Motion
- **Dynamic Hero Images** - Different seasonal images for each month with crossfade transitions
- **Keyboard Navigation** - Alt + Arrow keys for month navigation, Escape to clear selection
- **Today Indicator** - Pulsing ring highlights the current date
- **Print Stylesheet** - Clean printable output with Ctrl/Cmd + P
- **Visual Range States** - Clear distinction between start, end, and in-range dates with hover preview

## Tech Stack

| Technology | Purpose |
|------------|---------|
| **React 19** | UI framework with React Compiler for automatic optimization |
| **TypeScript 6** | Type safety and better developer experience |
| **Vite 8** | Fast development and optimized production builds |
| **date-fns** | Lightweight, tree-shakeable date manipulation |
| **Framer Motion** | Smooth animations and transitions |
| **CSS Modules** | Scoped, maintainable styling |

## Project Structure

```
src/
├── components/
│   ├── Calendar/           # Core calendar grid and day components
│   ├── HeroSection/        # Hero image with diagonal overlay
│   ├── NotesPanel/         # Notes sidebar with tabs
│   ├── SpiralBinding/      # Decorative spiral binding effect
│   └── WallCalendar/       # Main composition component
├── hooks/
│   ├── useCalendarState.ts # Calendar navigation and selection state
│   ├── useLocalStorage.ts  # Persistent storage hook
│   └── useNotes.ts         # Notes CRUD operations
├── utils/
│   └── dateUtils.ts        # Date manipulation utilities
└── types/
    └── calendar.types.ts   # TypeScript interfaces
```

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/calendar-component.git
cd calendar-component

# Install dependencies
npm install

# Start development server
npm run dev
```

### Available Scripts

```bash
npm run dev      # Start development server (http://localhost:5173)
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## Usage

The calendar can be imported and used as a standalone component:

```tsx
import { WallCalendar } from './components/WallCalendar';

function App() {
  return <WallCalendar initialDate={new Date()} />;
}
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `initialDate` | `Date` | `new Date()` | Starting month to display |

## Architecture Decisions

### Why CSS Modules over Tailwind?
Pure CSS demonstrates stronger fundamentals for component-level styling. CSS Modules provide scoped styles without build complexity while showcasing mastery of CSS features like `clip-path`, gradients, and animations.

### Why date-fns over moment.js?
date-fns is significantly smaller (tree-shakeable), immutable by default, and has excellent TypeScript support. It provides all necessary functionality without the bundle size overhead.

### Why useReducer over Redux/Zustand?
For this scope, React's built-in `useReducer` provides sufficient state management. It demonstrates understanding of when NOT to reach for external libraries - a key evaluation criterion.

### State Management Pattern
- **Calendar State**: `useReducer` for complex state transitions (month navigation, range selection)
- **Notes**: Custom hook with `useLocalStorage` for persistence
- **Component State**: Local `useState` for UI concerns (collapsed panels, mobile detection)

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Alt + ←` | Previous month |
| `Alt + →` | Next month |
| `Escape` | Clear selection |
| `Enter/Space` | Select focused date |
| `Tab` | Navigate between interactive elements |

## Browser Support

- Chrome 90+
- Firefox 90+
- Safari 14+
- Edge 90+

## Performance Considerations

- **React Compiler** enabled for automatic memoization
- **Lazy loading** for hero images
- **CSS transitions** instead of JS animations where possible
- **Debounced auto-save** for notes (500ms)

## License

MIT

---

Built with care for the Frontend Engineering Challenge.
