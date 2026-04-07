import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import type { Note } from '../../types/calendar.types';
import {
  getPrimaryDateFromNoteKey,
  noteIntersectsMonth,
  parseRangeNoteKey,
} from '../../utils/noteUtils';
import styles from './AllNotesModal.module.css';

interface AllNotesModalProps {
  isOpen: boolean;
  currentMonth: Date;
  notes: Note[];
  onClose: () => void;
  onSelectNote: (date: Date) => void;
  onDeleteNote: (noteId: string) => void;
}

// Format time for display
function formatTime(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, '0')} ${period}`;
}

export const AllNotesModal = memo(function AllNotesModal({
  isOpen,
  currentMonth,
  notes,
  onClose,
  onSelectNote,
  onDeleteNote,
}: AllNotesModalProps) {
  // Filter notes for current month
  const monthNotes = notes.filter(n => noteIntersectsMonth(n.date, currentMonth));

  const handleNoteClick = (note: Note) => {
    const primaryDate = getPrimaryDateFromNoteKey(note.date);
    if (primaryDate) {
      onSelectNote(primaryDate);
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={styles.backdrop}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          {/* Modal */}
          <motion.div
            className={styles.modal}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={styles.header}>
              <h3 className={styles.title}>
                Notes - {format(currentMonth, 'MMMM yyyy')}
              </h3>
              <button className={styles.closeButton} onClick={onClose}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Notes List */}
            <div className={styles.notesList}>
              {monthNotes.length === 0 ? (
                <div className={styles.emptyState}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14,2 14,8 20,8" />
                  </svg>
                  <p className={styles.emptyText}>No notes this month</p>
                  <p className={styles.emptyHint}>Tap a date to add one</p>
                </div>
              ) : (
                monthNotes.map((note) => (
                  (() => {
                    const primaryDate = getPrimaryDateFromNoteKey(note.date);
                    const range = parseRangeNoteKey(note.date);

                    return (
                  <div
                    key={note.id}
                    className={styles.noteCard}
                    onClick={() => handleNoteClick(note)}
                  >
                    <div className={styles.noteContent}>
                      <p className={styles.noteTitle}>{note.content}</p>
                      <div className={styles.noteMeta}>
                        <span className={styles.noteDate}>
                          {range
                            ? `${format(range.start, 'EEE, MMM d')} - ${format(range.end, 'EEE, MMM d')}`
                            : primaryDate
                              ? format(primaryDate, 'EEE, MMM d')
                              : ''}
                        </span>
                        {note.startTime && note.endTime && (
                          <span className={styles.noteTime}>
                            {formatTime(note.startTime)} - {formatTime(note.endTime)}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      className={styles.deleteButton}
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteNote(note.id);
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                    );
                  })()
                ))
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});
