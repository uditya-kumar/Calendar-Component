import { memo, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MONTHS } from '../../types/calendar.types';
import styles from './MonthYearPicker.module.css';

interface MonthYearPickerProps {
  currentMonth: Date;
  onSelect: (date: Date) => void;
}

export const MonthYearPicker = memo(function MonthYearPicker({
  currentMonth,
  onSelect,
}: MonthYearPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<'months' | 'years'>('months');
  const [selectedYear, setSelectedYear] = useState(currentMonth.getFullYear());
  const [yearRangeStart, setYearRangeStart] = useState(Math.floor(currentMonth.getFullYear() / 12) * 12);
  const [isMobile, setIsMobile] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Track mobile state
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Generate 12 years for the grid
  const yearsInRange = Array.from({ length: 12 }, (_, i) => yearRangeStart + i);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setView('months');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Update selected year when currentMonth changes
  useEffect(() => {
    setSelectedYear(currentMonth.getFullYear());
    setYearRangeStart(Math.floor(currentMonth.getFullYear() / 12) * 12);
  }, [currentMonth]);

  const handleMonthSelect = (monthIndex: number) => {
    onSelect(new Date(selectedYear, monthIndex, 1));
    setIsOpen(false);
    setView('months');
  };

  const handleYearSelect = (year: number) => {
    setSelectedYear(year);
    setView('months');
  };

  const handleToggle = () => {
    if (!isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + 8,
        left: rect.left + rect.width / 2,
      });
    }
    setIsOpen(prev => !prev);
    setSelectedYear(currentMonth.getFullYear());
    setView('months');
  };

  return (
    <div className={styles.container} ref={containerRef}>
      <button
        ref={triggerRef}
        className={styles.trigger}
        onClick={handleToggle}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
      >
        <span className={styles.monthYear}>
          {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </span>
        <svg
          className={`${styles.chevron} ${isOpen ? styles.open : ''}`}
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M4 6l4 4 4-4" />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && isMobile && (
          <motion.div
            className={styles.backdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setIsOpen(false);
              setView('months');
            }}
          />
        )}
        {isOpen && (
          <motion.div
            className={`${styles.dropdown} ${isMobile ? styles.mobileModal : ''}`}
            style={!isMobile ? { top: dropdownPos.top, left: dropdownPos.left } : undefined}
            initial={isMobile ? { opacity: 0, scale: 0.9 } : { opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={isMobile ? { opacity: 0, scale: 0.9 } : { opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            role="dialog"
            aria-label="Select month and year"
          >
            {/* Year selector header */}
            <div className={styles.yearSelector}>
              <button
                className={styles.yearNav}
                onClick={() => view === 'years'
                  ? setYearRangeStart(y => y - 12)
                  : setSelectedYear(y => y - 1)
                }
                aria-label={view === 'years' ? "Previous years" : "Previous year"}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 11L5 7l4-4" />
                </svg>
              </button>
              <button
                className={styles.yearButton}
                onClick={() => setView(view === 'years' ? 'months' : 'years')}
              >
                {view === 'years'
                  ? `${yearRangeStart} - ${yearRangeStart + 11}`
                  : selectedYear
                }
              </button>
              <button
                className={styles.yearNav}
                onClick={() => view === 'years'
                  ? setYearRangeStart(y => y + 12)
                  : setSelectedYear(y => y + 1)
                }
                aria-label={view === 'years' ? "Next years" : "Next year"}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 3l4 4-4 4" />
                </svg>
              </button>
            </div>

            {/* Month grid */}
            {view === 'months' && (
              <div className={styles.monthGrid}>
                {MONTHS.map((month, index) => {
                  const isCurrentSelection =
                    index === currentMonth.getMonth() &&
                    selectedYear === currentMonth.getFullYear();
                  const isThisMonth =
                    index === new Date().getMonth() &&
                    selectedYear === new Date().getFullYear();

                  return (
                    <button
                      key={month}
                      className={`${styles.monthButton} ${isCurrentSelection ? styles.selected : ''} ${isThisMonth ? styles.current : ''}`}
                      onClick={() => handleMonthSelect(index)}
                    >
                      {month.slice(0, 3)}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Year grid */}
            {view === 'years' && (
              <div className={styles.monthGrid}>
                {yearsInRange.map((year) => {
                  const isCurrentSelection = year === currentMonth.getFullYear();
                  const isThisYear = year === new Date().getFullYear();

                  return (
                    <button
                      key={year}
                      className={`${styles.monthButton} ${isCurrentSelection ? styles.selected : ''} ${isThisYear ? styles.current : ''}`}
                      onClick={() => handleYearSelect(year)}
                    >
                      {year}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Quick actions */}
            <div className={styles.quickActions}>
              <button
                className={styles.todayButton}
                onClick={() => {
                  const today = new Date();
                  onSelect(new Date(today.getFullYear(), today.getMonth(), 1));
                  setIsOpen(false);
                  setView('months');
                }}
              >
                Today
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});
