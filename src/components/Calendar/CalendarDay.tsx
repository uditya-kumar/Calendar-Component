import { memo } from 'react';
import type { CalendarDate } from '../../types/calendar.types';
import type { Holiday } from '../../utils/holidays';
import styles from './CalendarDay.module.css';

interface CalendarDayProps {
  calendarDate: CalendarDate;
  isInRange: boolean;
  isRangeStart: boolean;
  isRangeEnd: boolean;
  isHovered: boolean;
  hasNote: boolean;
  holiday?: Holiday;
  onSelect: (date: Date, ctrlKey?: boolean) => void;
  onHover: (date: Date | null) => void;
  tabIndex?: number;
}

export const CalendarDay = memo(function CalendarDay({
  calendarDate,
  isInRange,
  isRangeStart,
  isRangeEnd,
  isHovered,
  hasNote,
  holiday,
  onSelect,
  onHover,
  tabIndex = 0,
}: CalendarDayProps) {
  const { date, dayOfMonth, isCurrentMonth, isToday, isWeekend } = calendarDate;

  const classNames = [
    styles.day,
    !isCurrentMonth && styles.outsideMonth,
    isWeekend && styles.weekend,
    isToday && styles.today,
    isInRange && styles.inRange,
    isRangeStart && styles.rangeStart,
    isRangeEnd && styles.rangeEnd,
    isRangeStart && isRangeEnd && styles.singleDay,
    isHovered && styles.hovered,
  ]
    .filter(Boolean)
    .join(' ');

  const handleClick = (e: React.MouseEvent) => {
    if (isCurrentMonth) {
      onSelect(date, e.ctrlKey || e.metaKey);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (isCurrentMonth) {
        onSelect(date, e.ctrlKey || e.metaKey);
      }
    }
  };

  return (
    <button
      className={classNames}
      onClick={handleClick}
      onMouseEnter={() => isCurrentMonth && onHover(date)}
      onMouseLeave={() => onHover(null)}
      onKeyDown={handleKeyDown}
      tabIndex={isCurrentMonth ? tabIndex : -1}
      disabled={!isCurrentMonth}
      aria-label={`${dayOfMonth}${isToday ? ', today' : ''}${hasNote ? ', has note' : ''}${holiday ? `, ${holiday.name}` : ''}`}
      aria-selected={isRangeStart || isRangeEnd}
      title={holiday?.name}
    >
      <span className={styles.dayNumber}>{dayOfMonth}</span>
      {/* Note dot takes precedence over holiday dot */}
      {hasNote ? (
        <span className={styles.noteIndicator} aria-hidden="true" />
      ) : holiday ? (
        <span className={styles.holidayIndicator} aria-hidden="true" />
      ) : null}
      {isToday && <span className={styles.todayRing} aria-hidden="true" />}
    </button>
  );
});
