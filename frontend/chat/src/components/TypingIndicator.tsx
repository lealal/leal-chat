import styles from './TypingIndicator.module.css';

export function TypingIndicator() {
  return (
    <div className={styles.row} aria-label="AL is typing">
      <div className={styles.avatar} aria-hidden="true">AL</div>
      <div className={styles.bubble}>
        <span className={styles.dot} />
        <span className={styles.dot} />
        <span className={styles.dot} />
      </div>
    </div>
  );
}
