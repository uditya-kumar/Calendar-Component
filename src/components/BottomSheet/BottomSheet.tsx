import { memo, useState, useEffect, useRef, useCallback, CSSProperties } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import type { Note } from '../../types/calendar.types';
import styles from './BottomSheet.module.css';

interface BottomSheetProps {
  isOpen: boolean;
  selectedDate: Date | null;
  note: Note | null;
  onClose: () => void;
  onSave: (date: Date, content: string, startTime?: string, endTime?: string) => void;
  onDelete: (noteId: string) => void;
}

// Format time for display
function formatTime(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, '0')} ${period}`;
}

// Generate time options
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

export const BottomSheet = memo(function BottomSheet({
  isOpen,
  selectedDate,
  note,
  onClose,
  onSave,
  onDelete,
}: BottomSheetProps) {
  const [content, setContent] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('09:30');
  const [activeDropdown, setActiveDropdown] = useState<'start' | 'end' | null>(null);
  const [keyboardOffset, setKeyboardOffset] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Reset form when opening with new date/note
  useEffect(() => {
    if (isOpen && selectedDate) {
      if (note) {
        setContent(note.content);
        setStartTime(note.startTime || '09:00');
        setEndTime(note.endTime || '09:30');
      } else {
        setContent('');
        setStartTime('09:00');
        setEndTime('09:30');
      }
    }
  }, [isOpen, selectedDate, note]);

  // Handle keyboard visibility - keep input above keyboard
  useEffect(() => {
    if (!isOpen) {
      setKeyboardOffset(0);
      return;
    }

    const viewport = window.visualViewport;
    if (!viewport) return;

    const handleResize = () => {
      // Calculate keyboard height from viewport difference
      const keyboardHeight = window.innerHeight - viewport.height;
      setKeyboardOffset(keyboardHeight > 0 ? keyboardHeight : 0);
    };

    viewport.addEventListener('resize', handleResize);
    viewport.addEventListener('scroll', handleResize);

    return () => {
      viewport.removeEventListener('resize', handleResize);
      viewport.removeEventListener('scroll', handleResize);
    };
  }, [isOpen]);

  // Close dropdown on outside click
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

  const handleSave = useCallback(() => {
    if (selectedDate && content.trim()) {
      onSave(selectedDate, content, startTime, endTime);
      onClose();
    }
  }, [selectedDate, content, startTime, endTime, onSave, onClose]);

  const handleDelete = useCallback(() => {
    if (note) {
      onDelete(note.id);
      onClose();
    }
  }, [note, onDelete, onClose]);

  const handleTimeSelect = useCallback((time: string) => {
    if (activeDropdown === 'start') {
      setStartTime(time);
    } else if (activeDropdown === 'end') {
      setEndTime(time);
    }
    setActiveDropdown(null);
  }, [activeDropdown]);

  return (
    <AnimatePresence>
      {isOpen && selectedDate && (
        <>
          {/* Backdrop */}
          <motion.div
            className={styles.backdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Bottom Sheet */}
          <motion.div
            className={styles.sheet}
            style={{ bottom: keyboardOffset } as CSSProperties}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Handle */}
            <div className={styles.handle} />

            {/* Header */}
            <div className={styles.header}>
              <button className={styles.closeButton} onClick={onClose}>
                Cancel
              </button>
              <h3 className={styles.title}>
                {format(selectedDate, 'EEE, MMM d')}
              </h3>
              <button
                className={styles.saveButton}
                onClick={handleSave}
                disabled={!content.trim()}
              >
                Save
              </button>
            </div>

            {/* Content */}
            <div className={styles.content}>
              {/* Title Input */}
              <input
                type="text"
                className={styles.titleInput}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Add title"
                autoFocus
              />

              {/* Time Row */}
              <div className={styles.timeRow} ref={dropdownRef}>
                <svg className={styles.timeIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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

              {/* Delete Button */}
              {note && (
                <button className={styles.deleteButton} onClick={handleDelete}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                  </svg>
                  Delete Note
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
});
