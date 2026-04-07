<div align="center">

# Interactive Wall Calendar

A polished React calendar component inspired by physical wall calendars.

![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=flat&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=flat&logo=vite&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-11.15-FF0080?style=flat&logo=framer&logoColor=white)
![date-fns](https://img.shields.io/badge/date--fns-4.1-770C56?style=flat&logo=javascript&logoColor=white)

</div>

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

## Tech Stack

| Technology | Purpose |
|:-----------|:--------|
| React 19 | UI framework with React Compiler |
| TypeScript | Type safety |
| Vite | Development and builds |
| date-fns | Date manipulation |
| Framer Motion | Animations |
| CSS Modules | Scoped styling |

## Quick Start

```bash
npm install
npm run dev
```

## Scripts

| Command | Description |
|:--------|:------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview build |
| `npm run lint` | Run ESLint |

## Usage

```tsx
import { WallCalendar } from './components/WallCalendar';

function App() {
  return <WallCalendar initialDate={new Date()} />;
}
```

## Keyboard Shortcuts

| Key | Action |
|:----|:-------|
| `Alt + Arrow` | Navigate months |
| `Ctrl + Click` | Range selection |
| `Escape` | Clear selection |
| `Enter` | Select date |

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

## License

MIT
