import { memo, useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import type { DateRange, Note } from '../../types/calendar.types';
import styles from './NotesPanel.module.css';

interface NotesPanelProps {
  currentMonth: Date;
  selectedRange: DateRange;
  notes: Note[];
  onSaveNote: (date: Date | 'general', content: string, startTime?: string, endTime?: string) => void;
  onDeleteNote: (noteId: string) => void;
  onSelectDate: (date: Date) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

// Format time for display (3:45 PM)
function formatTime(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, '0')} ${period}`;
}

// Generate time options in 15-minute intervals
function generateTimeOptions(): { value: string; label: string }[] {
  const options: { value: string; label: string }[] = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 15) {
      const value = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
      const period = h >= 12 ? 'PM' : 'AM';
      const hour = h % 12 || 12;
      const label = `${hour}:${m.toString().padStart(2, '0')} ${period}`;
      options.push({ value, label });
    }
  }
  return options;
}

const TIME_OPTIONS = generateTimeOptions();

export const NotesPanel = memo(function NotesPanel({
  currentMonth,
  selectedRange,
  notes,
  onSaveNote,
  onDeleteNote,
  onSelectDate,
  isCollapsed = false,
  onToggleCollapse,
}: NotesPanelProps) {
  const [newNoteContent, setNewNoteContent] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('09:30');
  const [activeDropdown, setActiveDropdown] = useState<'start' | 'end' | null>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const hasSelectedDate = selectedRange.start !== null;

  // Filter notes - show selected date note or current month's notes
  const displayedNotes = hasSelectedDate
    ? notes.filter(n => n.date === format(selectedRange.start!, 'yyyy-MM-dd'))
    : notes.filter(n => {
        if (n.date === 'general') return false;
        const noteDate = new Date(n.date);
        return noteDate.getFullYear() === currentMonth.getFullYear() &&
               noteDate.getMonth() === currentMonth.getMonth();
      });

  const selectedDateKey = selectedRange.start
    ? format(selectedRange.start, 'yyyy-MM-dd')
    : null;

  const selectedDateNote = selectedDateKey
    ? notes.find(n => n.date === selectedDateKey)
    : null;

  // Reset note content and time when selection changes
  useEffect(() => {
    if (selectedDateNote) {
      setNewNoteContent(selectedDateNote.content);
      setStartTime(selectedDateNote.startTime || '09:00');
      setEndTime(selectedDateNote.endTime || '09:30');
    } else {
      setNewNoteContent('');
      setStartTime('09:00');
      setEndTime('09:30');
    }
  }, [selectedDateKey, selectedDateNote]);

  // Auto-save with debounce
  useEffect(() => {
    const contentChanged = newNoteContent !== (selectedDateNote?.content || '');
    const timeChanged = startTime !== (selectedDateNote?.startTime || '09:00') ||
                        endTime !== (selectedDateNote?.endTime || '09:30');

    if (hasSelectedDate && (contentChanged || timeChanged)) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = setTimeout(() => {
        if (selectedRange.start && newNoteContent.trim()) {
          onSaveNote(selectedRange.start, newNoteContent, startTime, endTime);
        }
      }, 800);
    }
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [newNoteContent, startTime, endTime, hasSelectedDate, selectedDateNote, selectedRange.start, onSaveNote]);

  const handleDeleteNote = useCallback((noteId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteNote(noteId);
  }, [onDeleteNote]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };
    if (activeDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeDropdown]);

  const handleTimeSelect = useCallback((time: string) => {
    if (activeDropdown === 'start') {
      setStartTime(time);
    } else if (activeDropdown === 'end') {
      setEndTime(time);
    }
    setActiveDropdown(null);
  }, [activeDropdown]);

  return (
    <motion.div
      className={`${styles.panel} ${isCollapsed ? styles.collapsed : ''}`}
      initial={false}
      animate={{ width: isCollapsed ? 48 : 'var(--notes-width)' }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      {/* Mobile toggle button */}
      {onToggleCollapse && (
        <button
          className={styles.toggleButton}
          onClick={onToggleCollapse}
          aria-label={isCollapsed ? 'Expand notes' : 'Collapse notes'}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={styles.toggleIcon}
            style={{ transform: isCollapsed ? 'rotate(180deg)' : 'none' }}
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
          {isCollapsed && <span className={styles.notesLabel}>Notes</span>}
        </button>
      )}

      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            className={styles.content}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Header */}
            <div className={styles.header}>
              <h3 className={styles.title}>Notes</h3>
              <span className={styles.noteCount}>{displayedNotes.length}</span>
            </div>

            {/* Selected Date Editor - Event Style */}
            {hasSelectedDate && (
              <motion.div
                className={styles.selectedDateSection}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                {/* Note Title Input */}
                <input
                  type="text"
                  className={styles.titleInput}
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  placeholder="Add title"
                />

                {/* Time Row */}
                <div className={styles.timeRow} ref={dropdownRef}>
                  <svg className={styles.timeIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>

                  <div className={styles.timePickerWrapper}>
                    <button
                      className={styles.timeButton}
                      onClick={() => setActiveDropdown(activeDropdown === 'start' ? null : 'start')}
                    >
                      {formatTime(startTime)}
                    </button>
                    {activeDropdown === 'start' && (
                      <div className={styles.timeDropdown}>
                        {TIME_OPTIONS.map(opt => (
                          <button
                            key={opt.value}
                            className={`${styles.timeOption} ${opt.value === startTime ? styles.selected : ''}`}
                            onClick={() => handleTimeSelect(opt.value)}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <span className={styles.timeArrow}>→</span>

                  <div className={styles.timePickerWrapper}>
                    <button
                      className={styles.timeButton}
                      onClick={() => setActiveDropdown(activeDropdown === 'end' ? null : 'end')}
                    >
                      {formatTime(endTime)}
                    </button>
                    {activeDropdown === 'end' && (
                      <div className={styles.timeDropdown}>
                        {TIME_OPTIONS.map(opt => (
                          <button
                            key={opt.value}
                            className={`${styles.timeOption} ${opt.value === endTime ? styles.selected : ''}`}
                            onClick={() => handleTimeSelect(opt.value)}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {selectedDateNote && (
                    <button
                      className={styles.deleteEditorNote}
                      onClick={(e) => handleDeleteNote(selectedDateNote.id, e)}
                      aria-label="Delete note"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Date Display */}
                <div className={styles.dateDisplay}>
                  {format(selectedRange.start!, 'EEE MMM d')}
                </div>
              </motion.div>
            )}

            {/* Notes List */}
            {!hasSelectedDate && (
              <div className={styles.notesList}>
                {displayedNotes.length === 0 ? (
                  <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14,2 14,8 20,8" />
                      </svg>
                    </div>
                    <p className={styles.emptyText}>No notes</p>
                    <p className={styles.emptyHint}>Click a date to add one</p>
                  </div>
                ) : (
                  <AnimatePresence>
                    {displayedNotes.map((note) => (
                      <motion.div
                        key={note.id}
                        className={styles.noteCard}
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.15 }}
                        layout
                        onDoubleClick={() => onSelectDate(new Date(note.date))}
                        title="Double-click to edit"
                      >
                        <div className={styles.noteCardContent}>
                          <p className={styles.noteContent}>{note.content}</p>
                          <div className={styles.noteCardMeta}>
                            {note.startTime && note.endTime && (
                              <span className={styles.noteTime}>
                                {formatTime(note.startTime)} → {formatTime(note.endTime)}
                              </span>
                            )}
                            <span className={styles.noteDate}>
                              {format(new Date(note.date), 'EEE MMM d')}
                            </span>
                          </div>
                        </div>
                        <button
                          className={styles.deleteButton}
                          onClick={(e) => handleDeleteNote(note.id, e)}
                          aria-label="Delete note"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 6L6 18M6 6l12 12" />
                          </svg>
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});
