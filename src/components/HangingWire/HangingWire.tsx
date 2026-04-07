import { memo } from 'react';
import styles from './HangingWire.module.css';

export const HangingWire = memo(function HangingWire() {
  return (
    <div className={styles.container}>
      {/* Left wire */}
      <div className={styles.wireLeft} />

      {/* Right wire */}
      <div className={styles.wireRight} />

      {/* Nail */}
      <div className={styles.nail}>
        <div className={styles.nailHead} />
        <div className={styles.nailShadow} />
      </div>
    </div>
  );
});
