import { memo } from 'react';
import { motion } from 'framer-motion';
import { format, subMonths, addMonths } from 'date-fns';
import { MonthYearPicker } from './MonthYearPicker';
import { DAYS_OF_WEEK } from '../../types/calendar.types';
import styles from './Calendar.module.css';

interface CalendarHeaderProps {
  currentMonth: Date;
  onNavigate: (direction: 'prev' | 'next') => void;
  onMonthSelect: (date: Date) => void;
  onClearSelection: () => void;
  hasSelection: boolean;
  onOpenAllNotes?: () => void;
}

export const CalendarHeader = memo(function CalendarHeader({
  currentMonth,
  onNavigate,
  onMonthSelect,
  onClearSelection,
  hasSelection,
  onOpenAllNotes,
}: CalendarHeaderProps) {
  const prevMonth = format(subMonths(currentMonth, 1), 'MMMM yyyy');
  const nextMonth = format(addMonths(currentMonth, 1), 'MMMM yyyy');

  return (
    <div className={styles.header} role="group" aria-label="Calendar navigation">
      <div className={styles.navigation}>
        <motion.button
          className={styles.navButton}
          onClick={() => onNavigate('prev')}
          aria-label={`Go to previous month, ${prevMonth}`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 15l-5-5 5-5" />
          </svg>
        </motion.button>

        <MonthYearPicker
          currentMonth={currentMonth}
          onSelect={onMonthSelect}
        />

        <motion.button
          className={styles.navButton}
          onClick={() => onNavigate('next')}
          aria-label={`Go to next month, ${nextMonth}`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M8 5l5 5-5 5" />
          </svg>
        </motion.button>

        {/* Mobile: All Notes button */}
        {onOpenAllNotes && (
          <button
            className={styles.allNotesBtn}
            onClick={onOpenAllNotes}
            aria-label="View all notes"
          >
            All Notes
          </button>
        )}

        {hasSelection && (
          <motion.button
            className={styles.clearButton}
            onClick={onClearSelection}
            aria-label="Clear date selection"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Clear
          </motion.button>
        )}
      </div>

      <div className={styles.weekDays} role="row">
        {DAYS_OF_WEEK.map((day, index) => (
          <div
            key={day}
            className={`${styles.weekDay} ${index >= 5 ? styles.weekend : ''}`}
            role="columnheader"
            aria-label={day}
          >
            {day}
          </div>
        ))}
      </div>
    </div>
  );
});
