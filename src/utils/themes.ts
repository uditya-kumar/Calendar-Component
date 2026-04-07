// Color themes for each month matching hero images
export interface MonthTheme {
  accent: string;
  accentLight: string;
  accentDark: string;
  weekendColor: string;
  rangeBg: string;
}

export const MONTH_THEMES: Record<number, MonthTheme> = {
  0: { // January - Winter/Icy Blue
    accent: '#0ea5e9',
    accentLight: '#38bdf8',
    accentDark: '#0284c7',
    weekendColor: '#0ea5e9',
    rangeBg: 'rgba(14, 165, 233, 0.12)',
  },
  1: { // February - Valentine/Rose
    accent: '#e11d48',
    accentLight: '#fb7185',
    accentDark: '#be123c',
    weekendColor: '#e11d48',
    rangeBg: 'rgba(225, 29, 72, 0.12)',
  },
  2: { // March - Spring Green
    accent: '#10b981',
    accentLight: '#34d399',
    accentDark: '#059669',
    weekendColor: '#10b981',
    rangeBg: 'rgba(16, 185, 129, 0.12)',
  },
  3: { // April - Orange Flowers
    accent: '#f97316',
    accentLight: '#fb923c',
    accentDark: '#ea580c',
    weekendColor: '#f97316',
    rangeBg: 'rgba(249, 115, 22, 0.12)',
  },
  4: { // May - Pink Blossoms
    accent: '#ec4899',
    accentLight: '#f472b6',
    accentDark: '#db2777',
    weekendColor: '#ec4899',
    rangeBg: 'rgba(236, 72, 153, 0.12)',
  },
  5: { // June - Beach/Cyan
    accent: '#06b6d4',
    accentLight: '#22d3ee',
    accentDark: '#0891b2',
    weekendColor: '#06b6d4',
    rangeBg: 'rgba(6, 182, 212, 0.12)',
  },
  6: { // July - Sunset Orange
    accent: '#f59e0b',
    accentLight: '#fbbf24',
    accentDark: '#d97706',
    weekendColor: '#f59e0b',
    rangeBg: 'rgba(245, 158, 11, 0.12)',
  },
  7: { // August - Lake Teal
    accent: '#14b8a6',
    accentLight: '#2dd4bf',
    accentDark: '#0d9488',
    weekendColor: '#14b8a6',
    rangeBg: 'rgba(20, 184, 166, 0.12)',
  },
  8: { // September - Fall Amber
    accent: '#d97706',
    accentLight: '#f59e0b',
    accentDark: '#b45309',
    weekendColor: '#d97706',
    rangeBg: 'rgba(217, 119, 6, 0.12)',
  },
  9: { // October - Mountain Purple
    accent: '#8b5cf6',
    accentLight: '#a78bfa',
    accentDark: '#7c3aed',
    weekendColor: '#8b5cf6',
    rangeBg: 'rgba(139, 92, 246, 0.12)',
  },
  10: { // November - Warm Brown
    accent: '#78716c',
    accentLight: '#a8a29e',
    accentDark: '#57534e',
    weekendColor: '#78716c',
    rangeBg: 'rgba(120, 113, 108, 0.12)',
  },
  11: { // December - Snow/Silver Blue
    accent: '#6366f1',
    accentLight: '#818cf8',
    accentDark: '#4f46e5',
    weekendColor: '#6366f1',
    rangeBg: 'rgba(99, 102, 241, 0.12)',
  },
};

export function applyMonthTheme(monthIndex: number): void {
  const theme = MONTH_THEMES[monthIndex];
  if (!theme) return;

  const root = document.documentElement;
  root.style.setProperty('--accent-blue', theme.accent);
  root.style.setProperty('--accent-blue-light', theme.accentLight);
  root.style.setProperty('--accent-blue-dark', theme.accentDark);
  root.style.setProperty('--weekend-blue', theme.weekendColor);
  root.style.setProperty('--range-bg', theme.rangeBg);
  root.style.setProperty('--range-hover-bg', theme.rangeBg.replace('0.12', '0.08'));
}
