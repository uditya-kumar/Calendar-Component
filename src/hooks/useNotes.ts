import { useCallback, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type { Note } from '../types/calendar.types';
import { toDateKey } from '../utils/dateUtils';

const STORAGE_KEY = 'calendar-notes';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function useNotes() {
  const [notes, setNotes] = useLocalStorage<Note[]>(STORAGE_KEY, []);

  // Add or update a note for a specific date
  const saveNote = useCallback((date: Date | 'general', content: string, startTime?: string, endTime?: string) => {
    const dateKey = date === 'general' ? 'general' : toDateKey(date);
    const now = new Date().toISOString();

    setNotes(prevNotes => {
      const existingIndex = prevNotes.findIndex(n => n.date === dateKey);

      if (content.trim() === '') {
        // Remove note if content is empty
        if (existingIndex >= 0) {
          return prevNotes.filter((_, i) => i !== existingIndex);
        }
        return prevNotes;
      }

      if (existingIndex >= 0) {
        // Update existing note
        const updated = [...prevNotes];
        updated[existingIndex] = {
          ...updated[existingIndex],
          content,
          startTime,
          endTime,
          updatedAt: now,
        };
        return updated;
      }

      // Create new note
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
    return notes.some(n => n.date === dateKey && n.content.trim() !== '');
  }, [notes]);

  // Delete a note
  const deleteNote = useCallback((noteId: string) => {
    setNotes(prevNotes => prevNotes.filter(n => n.id !== noteId));
  }, [setNotes]);

  // Get all notes for a specific month
  const getNotesForMonth = useCallback((month: Date): Note[] => {
    const year = month.getFullYear();
    const monthNum = month.getMonth();

    return notes.filter(n => {
      if (n.date === 'general') return false;
      const noteDate = new Date(n.date);
      return noteDate.getFullYear() === year && noteDate.getMonth() === monthNum;
    });
  }, [notes]);

  // Get general note (month-wide)
  const generalNote = useMemo(() => {
    return notes.find(n => n.date === 'general');
  }, [notes]);

  // Get dates that have notes (for showing indicators)
  const datesWithNotes = useMemo(() => {
    return new Set(
      notes
        .filter(n => n.date !== 'general' && n.content.trim() !== '')
        .map(n => n.date)
    );
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
