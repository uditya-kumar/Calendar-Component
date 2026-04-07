import { memo } from 'react';
import { motion } from 'framer-motion';
import type { Holiday } from '../../utils/holidays';
import styles from './Calendar.module.css';

interface HolidayBannerProps {
  holiday: Holiday;
  date: Date;
}

export const HolidayBanner = memo(function HolidayBanner({
  holiday,
}: HolidayBannerProps) {
  return (
    <motion.span
      className={styles.holidayBanner}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.15 }}
    >
      {holiday.name}
    </motion.span>
  );
});
