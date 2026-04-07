import { memo, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { format } from 'date-fns';
import { CalendarDay } from './CalendarDay';
import { generateCalendarGrid, isDateInRange, isRangeStart, isRangeEnd, toDateKey } from '../../utils/dateUtils';
import { getHoliday } from '../../utils/holidays';
import type { DateRange } from '../../types/calendar.types';
import styles from './Calendar.module.css';

interface CalendarGridProps {
  currentMonth: Date;
  selectedRange: DateRange;
  previewRange: DateRange;
  datesWithNotes: Set<string>;
  onSelectDate: (date: Date, ctrlKey?: boolean) => void;
  onHoverDate: (date: Date | null) => void;
  direction: number;
}

// Page flip animation - calendar page turns like a real wall calendar
const gridVariants = {
  enter: (direction: number) => ({
    rotateX: direction > 0 ? 45 : -45,
    y: direction > 0 ? -30 : 30,
    opacity: 0,
    filter: 'brightness(0.8)',
  }),
  center: {
    rotateX: 0,
    y: 0,
    opacity: 1,
    filter: 'brightness(1)',
  },
  exit: (direction: number) => ({
    rotateX: direction > 0 ? -45 : 45,
    y: direction > 0 ? 30 : -30,
    opacity: 0,
    filter: 'brightness(0.8)',
  }),
};

export const CalendarGrid = memo(function CalendarGrid({
  currentMonth,
  selectedRange,
  previewRange,
  datesWithNotes,
  onSelectDate,
  onHoverDate,
  direction,
}: CalendarGridProps) {
  const calendarDays = useMemo(
    () => generateCalendarGrid(currentMonth),
    [currentMonth]
  );

  // Use preview range for visual display (includes hover state)
  const displayRange = previewRange.start ? previewRange : selectedRange;

  // Group days into weeks for proper row structure
  const weeks = useMemo(() => {
    const result: typeof calendarDays[] = [];
    for (let i = 0; i < calendarDays.length; i += 7) {
      result.push(calendarDays.slice(i, i + 7));
    }
    return result;
  }, [calendarDays]);

  const monthLabel = format(currentMonth, 'MMMM yyyy');

  return (
    <div className={styles.gridContainer}>
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={currentMonth.toISOString()}
          className={styles.grid}
          role="grid"
          aria-label={`Calendar for ${monthLabel}`}
          custom={direction}
          variants={gridVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            duration: 0.25,
            ease: [0.4, 0, 0.2, 1],
          }}
        >
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} role="row" className={styles.gridRow}>
              {week.map((calendarDate, dayIndex) => {
                const { date } = calendarDate;
                const dateKey = toDateKey(date);
                const holiday = getHoliday(date);
                const globalIndex = weekIndex * 7 + dayIndex;

                return (
                  <CalendarDay
                    key={dateKey}
                    calendarDate={calendarDate}
                    isInRange={isDateInRange(date, displayRange.start, displayRange.end)}
                    isRangeStart={isRangeStart(date, displayRange.start, displayRange.end)}
                    isRangeEnd={isRangeEnd(date, displayRange.start, displayRange.end)}
                    isHovered={false}
                    hasNote={datesWithNotes.has(dateKey)}
                    holiday={holiday}
                    onSelect={onSelectDate}
                    onHover={onHoverDate}
                    tabIndex={globalIndex === 0 ? 0 : -1}
                  />
                );
              })}
            </div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
});
