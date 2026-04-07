import { memo, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
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

const gridVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 100 : -100,
    opacity: 0,
    rotateY: direction > 0 ? -8 : 8,
  }),
  center: {
    x: 0,
    opacity: 1,
    rotateY: 0,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 100 : -100,
    opacity: 0,
    rotateY: direction < 0 ? -8 : 8,
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

  return (
    <div className={styles.gridContainer}>
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={currentMonth.toISOString()}
          className={styles.grid}
          role="grid"
          aria-label="Calendar dates"
          custom={direction}
          variants={gridVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            duration: 0.3,
            ease: [0.4, 0, 0.2, 1],
          }}
          style={{ perspective: 1000 }}
        >
          {calendarDays.map((calendarDate, index) => {
            const { date } = calendarDate;
            const dateKey = toDateKey(date);
            const holiday = getHoliday(date);

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
                tabIndex={index === 0 ? 0 : -1}
              />
            );
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
});
