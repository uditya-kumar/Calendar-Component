import { memo, useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { SpiralBinding } from '../SpiralBinding';
import { HeroSection } from '../HeroSection';
import { Calendar } from '../Calendar';
import { NotesPanel } from '../NotesPanel';
import { useCalendarState } from '../../hooks/useCalendarState';
import { useNotes } from '../../hooks/useNotes';
import styles from './WallCalendar.module.css';

interface WallCalendarProps {
  initialDate?: Date;
}

export const WallCalendar = memo(function WallCalendar({
  initialDate,
}: WallCalendarProps) {
  const {
    currentMonth,
    selectedRange,
    selectionMode,
    previewRange,
    navigateMonth,
    setMonth,
    selectDate,
    hoverDate,
    clearSelection,
  } = useCalendarState(initialDate);

  const {
    notes,
    datesWithNotes,
    saveNote,
    deleteNote,
  } = useNotes();

  const [isNotesCollapsed, setIsNotesCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Track window size for responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsNotesCollapsed(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleNavigate = useCallback((dir: 'prev' | 'next') => {
    navigateMonth(dir);
  }, [navigateMonth]);

  const handleSelectDate = useCallback((date: Date, ctrlKey?: boolean) => {
    selectDate(date, ctrlKey);
  }, [selectDate]);

  const toggleNotes = useCallback(() => {
    setIsNotesCollapsed(prev => !prev);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape to clear selection
      if (e.key === 'Escape') {
        clearSelection();
        return;
      }

      // Arrow keys for month navigation (when not focused on input)
      if (document.activeElement?.tagName !== 'TEXTAREA') {
        if (e.key === 'ArrowLeft' && e.altKey) {
          e.preventDefault();
          handleNavigate('prev');
        } else if (e.key === 'ArrowRight' && e.altKey) {
          e.preventDefault();
          handleNavigate('next');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [clearSelection, handleNavigate]);

  return (
    <motion.div
      className={styles.wallCalendar}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {/* Spiral Binding */}
      <SpiralBinding ringCount={40} />

      {/* Hero Image Section */}
      <HeroSection currentMonth={currentMonth} />

      {/* Main Content: Notes + Calendar */}
      <div className={styles.content}>
        {/* Notes Panel (left side on desktop, bottom on mobile) */}
        <NotesPanel
          currentMonth={currentMonth}
          selectedRange={selectedRange}
          notes={notes}
          onSaveNote={saveNote}
          onDeleteNote={deleteNote}
          onSelectDate={selectDate}
          isCollapsed={isMobile && isNotesCollapsed}
          onToggleCollapse={isMobile ? toggleNotes : undefined}
        />

        {/* Calendar Section */}
        <div className={styles.calendarSection}>
          <Calendar
            currentMonth={currentMonth}
            selectedRange={selectedRange}
            previewRange={previewRange}
            datesWithNotes={datesWithNotes}
            onNavigateMonth={handleNavigate}
            onSetMonth={setMonth}
            onSelectDate={handleSelectDate}
            onHoverDate={hoverDate}
            onClearSelection={clearSelection}
          />

          {/* Selection Info */}
          {selectedRange.start && selectionMode === 'complete' && selectedRange.end &&
           selectedRange.start.getTime() !== selectedRange.end.getTime() && (
            <motion.div
              className={styles.selectionInfo}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <span>
                <strong>
                  {Math.ceil(
                    (selectedRange.end.getTime() - selectedRange.start.getTime()) /
                      (1000 * 60 * 60 * 24)
                  ) + 1}
                </strong>{' '}
                days selected
              </span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Keyboard shortcuts hint */}
      <div className={styles.shortcuts} aria-hidden="true">
        <span>Alt + ← / → navigate</span>
        <span>Ctrl + click for range</span>
        <span>Esc to clear</span>
      </div>
    </motion.div>
  );
});
