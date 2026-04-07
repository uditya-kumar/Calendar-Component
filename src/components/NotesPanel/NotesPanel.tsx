import { memo, useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, isSameDay } from 'date-fns';
import type { DateRange, Note } from '../../types/calendar.types';
import {
  createRangeNoteKey,
  getNoteDateKeys,
  getPrimaryDateFromNoteKey,
  noteIntersectsMonth,
  parseRangeNoteKey,
} from '../../utils/noteUtils';
import styles from './NotesPanel.module.css';

interface NotesPanelProps {
  currentMonth: Date;
  selectedRange: DateRange;
  notes: Note[];
  onSaveNote: (
    date: Date | { start: Date; end: Date } | 'general',
    content: string,
    startTime?: string,
    endTime?: string,
    noteId?: string
  ) => void;
  onDeleteNote: (noteId: string) => void;
  onSelectDate: (date: Date) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

function formatTime(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, '0')} ${period}`;
}

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

function getNoteDateLabel(note: Note): string {
  const range = parseRangeNoteKey(note.date);
  if (range) {
    return `${format(range.start, 'EEE MMM d')} - ${format(range.end, 'EEE MMM d')}`;
  }

  const primaryDate = getPrimaryDateFromNoteKey(note.date);
  return primaryDate ? format(primaryDate, 'EEE MMM d') : '';
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
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<'start' | 'end' | null>(null);
  const [inlineEditId, setInlineEditId] = useState<string | null>(null);
  const [inlineContent, setInlineContent] = useState('');
  const [inlineStartTime, setInlineStartTime] = useState('09:00');
  const [inlineEndTime, setInlineEndTime] = useState('09:30');
  const [inlineDropdown, setInlineDropdown] = useState<'start' | 'end' | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inlineDropdownRef = useRef<HTMLDivElement>(null);

  const hasSelectedDate = selectedRange.start !== null;
  const isRangeSelection =
    selectedRange.start !== null &&
    selectedRange.end !== null &&
    !isSameDay(selectedRange.start, selectedRange.end);

  const selectedDateKey = selectedRange.start
    ? format(selectedRange.start, 'yyyy-MM-dd')
    : null;

  const selectedRangeKey = selectedRange.start && selectedRange.end
    ? createRangeNoteKey(selectedRange.start, selectedRange.end)
    : null;

  const selectedDateNotes = selectedDateKey
    ? isRangeSelection && selectedRangeKey
      ? notes.filter(n => n.date === selectedRangeKey)
      : notes.filter(n => getNoteDateKeys(n.date).includes(selectedDateKey))
    : [];

  const displayedNotes = hasSelectedDate
    ? selectedDateNotes
    : notes.filter(n => noteIntersectsMonth(n.date, currentMonth));

  useEffect(() => {
    setNewNoteContent('');
    setStartTime('09:00');
    setEndTime('09:30');
    setEditingNoteId(null);
    setActiveDropdown(null);
    setInlineEditId(null);
  }, [selectedDateKey, selectedRangeKey]);

  // Close inline dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (inlineDropdownRef.current && !inlineDropdownRef.current.contains(e.target as Node)) {
        setInlineDropdown(null);
      }
    };
    if (inlineDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [inlineDropdown]);

  const handleStartInlineEdit = useCallback((note: Note) => {
    setInlineEditId(note.id);
    setInlineContent(note.content);
    setInlineStartTime(note.startTime || '09:00');
    setInlineEndTime(note.endTime || '09:30');
  }, []);

  const handleCancelInlineEdit = useCallback(() => {
    setInlineEditId(null);
    setInlineContent('');
    setInlineStartTime('09:00');
    setInlineEndTime('09:30');
    setInlineDropdown(null);
  }, []);

  const handleSaveInlineEdit = useCallback((note: Note) => {
    if (!inlineContent.trim()) return;

    const range = parseRangeNoteKey(note.date);
    const target = range
      ? { start: range.start, end: range.end }
      : getPrimaryDateFromNoteKey(note.date) || note.date;

    onSaveNote(target as Date | { start: Date; end: Date } | 'general', inlineContent.trim(), inlineStartTime, inlineEndTime, note.id);
    handleCancelInlineEdit();
  }, [inlineContent, inlineStartTime, inlineEndTime, onSaveNote, handleCancelInlineEdit]);

  const handleInlineTimeSelect = useCallback((time: string) => {
    if (inlineDropdown === 'start') {
      setInlineStartTime(time);
    } else if (inlineDropdown === 'end') {
      setInlineEndTime(time);
    }
    setInlineDropdown(null);
  }, [inlineDropdown]);

  const handleDeleteNote = useCallback((noteId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteNote(noteId);
    if (editingNoteId === noteId) {
      setNewNoteContent('');
      setStartTime('09:00');
      setEndTime('09:30');
      setEditingNoteId(null);
    }
  }, [onDeleteNote, editingNoteId]);

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


  const handleSaveCurrentNote = useCallback(() => {
    if (!selectedRange.start || !newNoteContent.trim()) {
      return;
    }

    const target = isRangeSelection && selectedRange.end
      ? { start: selectedRange.start, end: selectedRange.end }
      : selectedRange.start;

    onSaveNote(target, newNoteContent.trim(), startTime, endTime, editingNoteId || undefined);

    setNewNoteContent('');
    setStartTime('09:00');
    setEndTime('09:30');
    setEditingNoteId(null);
  }, [
    selectedRange.start,
    selectedRange.end,
    isRangeSelection,
    newNoteContent,
    startTime,
    endTime,
    editingNoteId,
    onSaveNote,
  ]);

  return (
    <motion.div
      className={`${styles.panel} ${isCollapsed ? styles.collapsed : ''}`}
      initial={false}
      animate={{ width: isCollapsed ? 48 : 'var(--notes-width)' }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      <div
        className={styles.header}
        onClick={onToggleCollapse}
        role={onToggleCollapse ? 'button' : undefined}
        tabIndex={onToggleCollapse ? 0 : undefined}
      >
        <h3 className={styles.title}>Notes</h3>
        <div className={styles.headerRight}>
          <span className={styles.noteCount}>{displayedNotes.length}</span>
          {onToggleCollapse && (
            <span className={styles.headerToggle}>
              <svg
                width="18"
                height="18"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{ transform: isCollapsed ? 'rotate(0deg)' : 'rotate(180deg)' }}
              >
                <path d="M6 8l6 6 6-6" />
              </svg>
            </span>
          )}
        </div>
      </div>

      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            className={styles.content}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {hasSelectedDate && (
              <motion.div
                className={styles.selectedDateSection}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <input
                  type="text"
                  className={styles.titleInput}
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  placeholder="Add title"
                />

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
                </div>

                <div className={styles.dateDisplay}>
                  {isRangeSelection && selectedRange.end
                    ? `${format(selectedRange.start!, 'EEE MMM d')} - ${format(selectedRange.end, 'EEE MMM d')}`
                    : format(selectedRange.start!, 'EEE MMM d')}
                </div>

                <div className={styles.editorActions}>
                  <button
                    className={styles.primaryAction}
                    onClick={handleSaveCurrentNote}
                    disabled={!newNoteContent.trim()}
                  >
                    {editingNoteId ? 'Update note' : 'Add note'}
                  </button>
                  {editingNoteId && (
                    <button
                      className={styles.secondaryAction}
                      onClick={() => {
                        setEditingNoteId(null);
                        setNewNoteContent('');
                        setStartTime('09:00');
                        setEndTime('09:30');
                      }}
                    >
                      Cancel
                    </button>
                  )}
                </div>

                {selectedDateNotes.length > 0 && (
                  <div className={styles.selectedNotesList}>
                    {selectedDateNotes.map(note => (
                      <div key={note.id} className={`${styles.noteCard} ${inlineEditId === note.id ? styles.noteCardEditing : ''}`}>
                        {inlineEditId === note.id ? (
                          <div className={styles.inlineEditor}>
                            <input
                              type="text"
                              className={styles.inlineInput}
                              value={inlineContent}
                              onChange={(e) => setInlineContent(e.target.value)}
                              placeholder="Note title"
                              autoFocus
                            />
                            <div className={styles.inlineTimeRow} ref={inlineDropdownRef}>
                              <div className={styles.timePickerWrapper}>
                                <button
                                  className={styles.timeButton}
                                  onClick={() => setInlineDropdown(inlineDropdown === 'start' ? null : 'start')}
                                >
                                  {formatTime(inlineStartTime)}
                                </button>
                                {inlineDropdown === 'start' && (
                                  <div className={styles.timeDropdown}>
                                    {TIME_OPTIONS.map(opt => (
                                      <button
                                        key={opt.value}
                                        className={`${styles.timeOption} ${opt.value === inlineStartTime ? styles.selected : ''}`}
                                        onClick={() => handleInlineTimeSelect(opt.value)}
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
                                  onClick={() => setInlineDropdown(inlineDropdown === 'end' ? null : 'end')}
                                >
                                  {formatTime(inlineEndTime)}
                                </button>
                                {inlineDropdown === 'end' && (
                                  <div className={styles.timeDropdown}>
                                    {TIME_OPTIONS.map(opt => (
                                      <button
                                        key={opt.value}
                                        className={`${styles.timeOption} ${opt.value === inlineEndTime ? styles.selected : ''}`}
                                        onClick={() => handleInlineTimeSelect(opt.value)}
                                      >
                                        {opt.label}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className={styles.inlineActions}>
                              <button
                                className={styles.inlineSaveBtn}
                                onClick={() => handleSaveInlineEdit(note)}
                                disabled={!inlineContent.trim()}
                              >
                                Save
                              </button>
                              <button
                                className={styles.inlineCancelBtn}
                                onClick={handleCancelInlineEdit}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className={styles.noteCardContent}>
                              <p className={styles.noteContent}>{note.content}</p>
                              <div className={styles.noteCardMeta}>
                                {note.startTime && note.endTime && (
                                  <span className={styles.noteTime}>
                                    {formatTime(note.startTime)} → {formatTime(note.endTime)}
                                  </span>
                                )}
                                <span className={styles.noteDate}>{getNoteDateLabel(note)}</span>
                              </div>
                            </div>
                            <button
                              className={styles.inlineActionButton}
                              onClick={() => handleStartInlineEdit(note)}
                              aria-label="Edit note"
                            >
                              Edit
                            </button>
                            <button
                              className={styles.deleteButton}
                              onClick={(e) => handleDeleteNote(note.id, e)}
                              aria-label="Delete note"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M18 6L6 18M6 6l12 12" />
                              </svg>
                            </button>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

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
                    {displayedNotes.map((note) => {
                      const primaryDate = getPrimaryDateFromNoteKey(note.date);

                      return (
                        <motion.div
                          key={note.id}
                          className={styles.noteCard}
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8 }}
                          transition={{ duration: 0.15 }}
                          layout
                          onDoubleClick={() => primaryDate && onSelectDate(primaryDate)}
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
                              <span className={styles.noteDate}>{getNoteDateLabel(note)}</span>
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
                      );
                    })}
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
