export interface CalendarDate {
  date: Date;
  dayOfMonth: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isWeekend: boolean;
}

export interface DateRange {
  start: Date | null;
  end: Date | null;
}

export type SelectionMode = 'idle' | 'selecting-end' | 'complete';

export interface CalendarState {
  currentMonth: Date;
  selectedRange: DateRange;
  selectionMode: SelectionMode;
  hoveredDate: Date | null;
}

export type CalendarAction =
  | { type: 'NAVIGATE_MONTH'; direction: 'prev' | 'next' }
  | { type: 'SET_MONTH'; date: Date }
  | { type: 'SELECT_DATE'; date: Date; ctrlKey?: boolean }
  | { type: 'HOVER_DATE'; date: Date | null }
  | { type: 'CLEAR_SELECTION' };

export interface Note {
  id: string;
  date: string; // YYYY-MM-DD, range:YYYY-MM-DD|YYYY-MM-DD, or 'general'
  content: string;
  startTime?: string; // HH:mm format
  endTime?: string; // HH:mm format
  createdAt: string;
  updatedAt: string;
}

export interface NotesState {
  notes: Note[];
  activeNoteId: string | null;
}

export const DAYS_OF_WEEK = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'] as const;

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
] as const;
