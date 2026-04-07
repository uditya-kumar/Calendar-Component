import { useCallback, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type { Note } from '../types/calendar.types';
import { toDateKey } from '../utils/dateUtils';
import { createRangeNoteKey, getNoteDateKeys, noteIntersectsMonth } from '../utils/noteUtils';

const STORAGE_KEY = 'calendar-notes';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function useNotes() {
  const [notes, setNotes] = useLocalStorage<Note[]>(STORAGE_KEY, []);

  // Add or update a note for a specific date
  const saveNote = useCallback((
    date: Date | { start: Date; end: Date } | 'general',
    content: string,
    startTime?: string,
    endTime?: string,
    noteId?: string
  ) => {
    const dateKey = date === 'general'
      ? 'general'
      : date instanceof Date
        ? toDateKey(date)
        : createRangeNoteKey(date.start, date.end);
    const now = new Date().toISOString();

    setNotes(prevNotes => {
      if (content.trim() === '') {
        return prevNotes;
      }

      if (noteId) {
        const existingIndex = prevNotes.findIndex(n => n.id === noteId);
        if (existingIndex === -1) {
          return prevNotes;
        }

        const updated = [...prevNotes];
        updated[existingIndex] = {
          ...updated[existingIndex],
          date: dateKey,
          content,
          startTime,
          endTime,
          updatedAt: now,
        };
        return updated;
      }

      // Create new note (allows multiple notes per date/range)
      return [...prevNotes, {
        id: generateId(),
        date: dateKey,
        content,
        startTime,
        endTime,
        createdAt: now,
        updatedAt: now,
      }];
    });
  }, [setNotes]);

  // Get note for a specific date
  const getNoteForDate = useCallback((date: Date | 'general'): Note | undefined => {
    const dateKey = date === 'general' ? 'general' : toDateKey(date);
    return notes.find(n => n.date === dateKey);
  }, [notes]);

  // Check if a date has a note
  const hasNoteForDate = useCallback((date: Date): boolean => {
    const dateKey = toDateKey(date);
    return notes.some(n =>
      n.content.trim() !== '' &&
      getNoteDateKeys(n.date).includes(dateKey)
    );
  }, [notes]);

  // Delete a note
  const deleteNote = useCallback((noteId: string) => {
    setNotes(prevNotes => prevNotes.filter(n => n.id !== noteId));
  }, [setNotes]);

  // Get all notes for a specific month
  const getNotesForMonth = useCallback((month: Date): Note[] => {
    return notes.filter(n => noteIntersectsMonth(n.date, month));
  }, [notes]);

  // Get general note (month-wide)
  const generalNote = useMemo(() => {
    return notes.find(n => n.date === 'general');
  }, [notes]);

  // Get dates that have notes (for showing indicators)
  const datesWithNotes = useMemo(() => {
    const dateKeys = notes
      .filter(n => n.content.trim() !== '')
      .flatMap(n => getNoteDateKeys(n.date));

    return new Set(dateKeys);
  }, [notes]);

  return {
    notes,
    saveNote,
    getNoteForDate,
    hasNoteForDate,
    deleteNote,
    getNotesForMonth,
    generalNote,
    datesWithNotes,
  };
}
