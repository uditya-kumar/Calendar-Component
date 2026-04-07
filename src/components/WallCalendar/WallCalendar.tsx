import { memo, useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { SpiralBinding } from '../SpiralBinding';
import { HeroSection } from '../HeroSection';
import { Calendar } from '../Calendar';
import { NotesPanel } from '../NotesPanel';
import { BottomSheet } from '../BottomSheet';
import { AllNotesModal } from '../AllNotesModal';
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

  const [isMobile, setIsMobile] = useState(false);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [isAllNotesOpen, setIsAllNotesOpen] = useState(false);

  // Track window size for responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
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
    // On mobile, open bottom sheet when date is selected
    if (isMobile && !ctrlKey) {
      setIsBottomSheetOpen(true);
    }
  }, [selectDate, isMobile]);

  const handleCloseBottomSheet = useCallback(() => {
    setIsBottomSheetOpen(false);
  }, []);

  const handleOpenAllNotes = useCallback(() => {
    setIsAllNotesOpen(true);
  }, []);

  const handleCloseAllNotes = useCallback(() => {
    setIsAllNotesOpen(false);
  }, []);

  const handleSelectNoteDate = useCallback((date: Date) => {
    selectDate(date);
    setIsBottomSheetOpen(true);
  }, [selectDate]);

  // Get current note for selected date
  const selectedDateKey = selectedRange.start
    ? format(selectedRange.start, 'yyyy-MM-dd')
    : null;
  const currentNote = selectedDateKey
    ? notes.find(n => n.date === selectedDateKey) || null
    : null;


  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape to clear selection
      if (e.key === 'Escape') {
        clearSelection();
        setIsBottomSheetOpen(false);
        setIsAllNotesOpen(false);
        return;
      }

      // Arrow keys for month navigation (when not focused on input)
      if (document.activeElement?.tagName !== 'TEXTAREA' &&
          document.activeElement?.tagName !== 'INPUT') {
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
      {/* Hero Section with Spiral Binding overlay */}
      <div className={styles.heroWrapper}>
        <HeroSection currentMonth={currentMonth} />
        <SpiralBinding ringCount={40} />
      </div>

      {/* Main Content: Notes + Calendar */}
      <div className={styles.content}>
        {/* Notes Panel (desktop only) */}
        {!isMobile && (
          <NotesPanel
            currentMonth={currentMonth}
            selectedRange={selectedRange}
            notes={notes}
            onSaveNote={saveNote}
            onDeleteNote={deleteNote}
            onSelectDate={selectDate}
          />
        )}

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
            onOpenAllNotes={isMobile ? handleOpenAllNotes : undefined}
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

      {/* Keyboard shortcuts hint (desktop only) */}
      {!isMobile && (
        <div className={styles.shortcuts} aria-hidden="true">
          <span>Alt + ← / → navigate</span>
          <span>Ctrl + click for range</span>
          <span>Esc to clear</span>
        </div>
      )}

      {/* Mobile: Bottom Sheet for adding/editing notes */}
      {isMobile && (
        <BottomSheet
          isOpen={isBottomSheetOpen}
          selectedDate={selectedRange.start}
          note={currentNote}
          onClose={handleCloseBottomSheet}
          onSave={saveNote}
          onDelete={deleteNote}
        />
      )}

      {/* Mobile: All Notes Modal */}
      {isMobile && (
        <AllNotesModal
          isOpen={isAllNotesOpen}
          currentMonth={currentMonth}
          notes={notes}
          onClose={handleCloseAllNotes}
          onSelectNote={handleSelectNoteDate}
          onDeleteNote={deleteNote}
        />
      )}
    </motion.div>
  );
});
