import { eachDayOfInterval, endOfMonth, isAfter, parseISO, startOfMonth } from 'date-fns';
import { toDateKey } from './dateUtils';

const RANGE_PREFIX = 'range:';

export function isRangeNoteKey(key: string): boolean {
  return key.startsWith(RANGE_PREFIX) && key.includes('|');
}

export function createRangeNoteKey(start: Date, end: Date): string {
  const startDate = isAfter(start, end) ? end : start;
  const endDate = isAfter(start, end) ? start : end;

  return `${RANGE_PREFIX}${toDateKey(startDate)}|${toDateKey(endDate)}`;
}

export function parseRangeNoteKey(key: string): { start: Date; end: Date } | null {
  if (!isRangeNoteKey(key)) {
    return null;
  }

  const raw = key.slice(RANGE_PREFIX.length);
  const [startStr, endStr] = raw.split('|');
  if (!startStr || !endStr) {
    return null;
  }

  const start = parseISO(startStr);
  const end = parseISO(endStr);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return null;
  }

  return { start, end };
}

export function getNoteDateKeys(noteDateKey: string): string[] {
  const range = parseRangeNoteKey(noteDateKey);
  if (!range) {
    return noteDateKey === 'general' ? [] : [noteDateKey];
  }

  return eachDayOfInterval({ start: range.start, end: range.end }).map(toDateKey);
}

export function noteIntersectsMonth(noteDateKey: string, month: Date): boolean {
  if (noteDateKey === 'general') {
    return false;
  }

  const range = parseRangeNoteKey(noteDateKey);
  if (!range) {
    const noteDate = parseISO(noteDateKey);
    return !Number.isNaN(noteDate.getTime()) &&
      noteDate.getFullYear() === month.getFullYear() &&
      noteDate.getMonth() === month.getMonth();
  }

  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);

  return !(isAfter(monthStart, range.end) || isAfter(range.start, monthEnd));
}

export function getPrimaryDateFromNoteKey(noteDateKey: string): Date | null {
  const range = parseRangeNoteKey(noteDateKey);
  if (range) {
    return range.start;
  }

  if (noteDateKey === 'general') {
    return null;
  }

  const date = parseISO(noteDateKey);
  return Number.isNaN(date.getTime()) ? null : date;
}