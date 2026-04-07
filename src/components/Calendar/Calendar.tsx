import { memo, useState, useCallback, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { CalendarHeader } from './CalendarHeader';
import { CalendarGrid } from './CalendarGrid';
import { HolidayBanner } from './HolidayBanner';
import { getHoliday } from '../../utils/holidays';
import type { DateRange } from '../../types/calendar.types';
import styles from './Calendar.module.css';

interface CalendarProps {
  currentMonth: Date;
  selectedRange: DateRange;
  previewRange: DateRange;
  datesWithNotes: Set<string>;
  onNavigateMonth: (direction: 'prev' | 'next') => void;
  onSetMonth: (date: Date) => void;
  onSelectDate: (date: Date, ctrlKey?: boolean) => void;
  onHoverDate: (date: Date | null) => void;
  onClearSelection: () => void;
}

export const Calendar = memo(function Calendar({
  currentMonth,
  selectedRange,
  previewRange,
  datesWithNotes,
  onNavigateMonth,
  onSetMonth,
  onSelectDate,
  onHoverDate,
  onClearSelection,
}: CalendarProps) {
  // Track navigation direction for animation
  const [direction, setDirection] = useState(0);

  const handleNavigate = useCallback((dir: 'prev' | 'next') => {
    setDirection(dir === 'next' ? 1 : -1);
    onNavigateMonth(dir);
  }, [onNavigateMonth]);

  const handleMonthSelect = useCallback((date: Date) => {
    setDirection(0);
    onSetMonth(date);
  }, [onSetMonth]);

  const hasSelection = selectedRange.start !== null;

  // Get holiday for selected date (if any)
  const selectedHoliday = useMemo(() => {
    if (selectedRange.start) {
      return getHoliday(selectedRange.start);
    }
    return undefined;
  }, [selectedRange.start]);

  return (
    <div className={styles.calendar} role="application" aria-label="Calendar">
      <CalendarHeader
        currentMonth={currentMonth}
        onNavigate={handleNavigate}
        onMonthSelect={handleMonthSelect}
        onClearSelection={onClearSelection}
        hasSelection={hasSelection}
      />

      <CalendarGrid
        currentMonth={currentMonth}
        selectedRange={selectedRange}
        previewRange={previewRange}
        datesWithNotes={datesWithNotes}
        onSelectDate={onSelectDate}
        onHoverDate={onHoverDate}
        direction={direction}
      />

      {/* Holiday Banner - shows when a holiday is selected */}
      <AnimatePresence>
        {selectedHoliday && selectedRange.start && (
          <HolidayBanner
            holiday={selectedHoliday}
            date={selectedRange.start}
          />
        )}
      </AnimatePresence>
    </div>
  );
});
