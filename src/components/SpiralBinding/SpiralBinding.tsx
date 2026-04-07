import { memo } from 'react';
import styles from './SpiralBinding.module.css';

interface SpiralBindingProps {
  ringCount?: number;
}

export const SpiralBinding = memo(function SpiralBinding({
  ringCount = 40,
}: SpiralBindingProps) {
  const halfCount = Math.floor(ringCount / 2);

  return (
    <div className={styles.bindingContainer} aria-hidden="true">
      <div className={styles.wallArea}>
        {/* The main horizontal wire with center hook */}
        <div className={styles.mainWire}>
          <div className={styles.wireLeft} />
          <div className={styles.hookContainer}>
            <div className={styles.hook} />
          </div>
          <div className={styles.wireRight} />
        </div>

        {/* Spiral coils */}
        <div className={styles.coilsContainer}>
          <div className={styles.coilsLeft}>
            {Array.from({ length: halfCount }).map((_, index) => (
              <div key={`left-${index}`} className={styles.coil} />
            ))}
          </div>
          <div className={styles.hookGap} />
          <div className={styles.coilsRight}>
            {Array.from({ length: halfCount }).map((_, index) => (
              <div key={`right-${index}`} className={styles.coil} />
            ))}
          </div>
        </div>
      </div>

      <div className={styles.paperEdge} />
    </div>
  );
});
