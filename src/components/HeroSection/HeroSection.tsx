import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatMonthYear } from '../../utils/dateUtils';
import styles from './HeroSection.module.css';

// Hero images for each month (using placeholder images - replace with actual images)
const MONTH_IMAGES: Record<number, string> = {
  0: 'https://images.unsplash.com/photo-1418985991508-e47386d96a71?w=800&q=80', // January - Winter
  1: 'https://images.unsplash.com/photo-1775395942058-30ccce5a78d2?w=800&q=80', // February - Valentine/Love
  2: 'https://images.unsplash.com/photo-1544568100-847a948585b9?w=800&q=80', // March - Spring
  3: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=800&q=80', // April - Flowers
  4: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=800&q=80', // May
  5: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80', // June - Summer
  6: 'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=800&q=80', // July
  7: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&q=80', // August
  8: 'https://images.unsplash.com/photo-1505765050516-f72dcac9c60e?w=800&q=80', // September - Fall
  9: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80', // October - Mountains
  10: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800&q=80', // November
  11: 'https://images.unsplash.com/photo-1482192505345-5655af888cc4?w=800&q=80', // December - Snow
};

interface HeroSectionProps {
  currentMonth: Date;
}

const imageVariants = {
  enter: {
    opacity: 0,
    scale: 1.1,
  },
  center: {
    opacity: 1,
    scale: 1,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
  },
};

export const HeroSection = memo(function HeroSection({
  currentMonth,
}: HeroSectionProps) {
  const { month, year } = formatMonthYear(currentMonth);
  const monthIndex = currentMonth.getMonth();
  const imageUrl = MONTH_IMAGES[monthIndex];

  return (
    <div className={styles.hero}>
      <div className={styles.imageContainer}>
        <AnimatePresence mode="wait">
          <motion.img
            key={monthIndex}
            src={imageUrl}
            alt={`${month} scene`}
            className={styles.image}
            loading="lazy"
            variants={imageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease: 'easeInOut' }}
          />
        </AnimatePresence>
      </div>

      <div className={styles.overlay}>
        <AnimatePresence mode="wait">
          <motion.div
            key={`${month}-${year}`}
            className={styles.monthYear}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <span className={styles.year}>{year}</span>
            <span className={styles.month}>{month.toUpperCase()}</span>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
});
