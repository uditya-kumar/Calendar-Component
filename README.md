<div align="center">

# Interactive Wall Calendar

A polished React calendar component inspired by physical wall calendars.

<br />

**React 19** | **TypeScript** | **Framer Motion** | **CSS Modules**

</div>

<br />

## Features

<table>
<tr>
<td width="50%">

**Core**
- Date range selection with visual feedback
- Integrated notes with localStorage persistence
- Responsive design (desktop and mobile)
- Keyboard navigation support

</td>
<td width="50%">

**Visual**
- Realistic spiral binding effect
- Dynamic hero images per month
- Smooth page transitions
- Today indicator with pulsing ring

</td>
</tr>
</table>

<br />

## Tech Stack

| Technology | Purpose |
|:-----------|:--------|
| React 19 | UI framework with React Compiler |
| TypeScript | Type safety |
| Vite | Development and builds |
| date-fns | Date manipulation |
| Framer Motion | Animations |
| CSS Modules | Scoped styling |

<br />

## Quick Start

```bash
npm install
npm run dev
```

<br />

## Scripts

| Command | Description |
|:--------|:------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview build |
| `npm run lint` | Run ESLint |

<br />

## Usage

```tsx
import { WallCalendar } from './components/WallCalendar';

function App() {
  return <WallCalendar initialDate={new Date()} />;
}
```

<br />

## Keyboard Shortcuts

| Key | Action |
|:----|:-------|
| `Alt + Arrow` | Navigate months |
| `Escape` | Clear selection |
| `Enter` | Select date |

<br />

## Project Structure

```
src/
├── components/
│   ├── Calendar/        # Grid and day components
│   ├── HeroSection/     # Hero with diagonal overlay
│   ├── NotesPanel/      # Notes sidebar
│   ├── SpiralBinding/   # Spiral binding effect
│   └── WallCalendar/    # Main component
├── hooks/               # State management hooks
├── utils/               # Date utilities
└── types/               # TypeScript interfaces
```

<br />

## License

MIT
