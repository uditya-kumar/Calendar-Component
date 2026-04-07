import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isWeekend,
  addMonths,
  subMonths,
  format,
  isWithinInterval,
  isBefore,
  isAfter,
  parseISO,
} from 'date-fns';
import type { CalendarDate } from '../types/calendar.types';

/**
 * Generate a 6-week calendar grid for a given month
 * Weeks start on Monday (as per the reference image)
 */
export function generateCalendarGrid(month: Date): CalendarDate[] {
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);

  // Start from Monday of the week containing the first day of the month
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  // End on Sunday of the week containing the last day of the month
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const today = new Date();

  return days.map(date => ({
    date,
    dayOfMonth: date.getDate(),
    isCurrentMonth: isSameMonth(date, month),
    isToday: isSameDay(date, today),
    isWeekend: isWeekend(date),
  }));
}

/**
 * Navigate to previous month
 */
export function getPreviousMonth(date: Date): Date {
  return subMonths(date, 1);
}

/**
 * Navigate to next month
 */
export function getNextMonth(date: Date): Date {
  return addMonths(date, 1);
}

/**
 * Format date for display
 */
export function formatMonthYear(date: Date): { month: string; year: number } {
  return {
    month: format(date, 'MMMM'),
    year: date.getFullYear(),
  };
}

/**
 * Format date to ISO string (YYYY-MM-DD) for storage
 */
export function toDateKey(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

/**
 * Parse ISO date string to Date
 */
export function fromDateKey(key: string): Date {
  return parseISO(key);
}

/**
 * Check if a date is within a range (inclusive)
 */
export function isDateInRange(date: Date, start: Date | null, end: Date | null): boolean {
  if (!start || !end) return false;

  // Ensure start is before end
  const rangeStart = isBefore(start, end) ? start : end;
  const rangeEnd = isBefore(start, end) ? end : start;

  return isWithinInterval(date, { start: rangeStart, end: rangeEnd }) ||
         isSameDay(date, rangeStart) ||
         isSameDay(date, rangeEnd);
}

/**
 * Check if date is the start of a range
 */
export function isRangeStart(date: Date, start: Date | null, end: Date | null): boolean {
  if (!start) return false;
  if (!end) return isSameDay(date, start);

  const rangeStart = isBefore(start, end) ? start : end;
  return isSameDay(date, rangeStart);
}

/**
 * Check if date is the end of a range
 */
export function isRangeEnd(date: Date, start: Date | null, end: Date | null): boolean {
  if (!end) return false;

  const rangeEnd = isBefore(start!, end) ? end : start!;
  return isSameDay(date, rangeEnd);
}

/**
 * Check if two dates are the same day
 */
export { isSameDay, isBefore, isAfter };
