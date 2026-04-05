import styles from './ChatHeader.module.css';

interface ChatHeaderProps {
  onNewChat: () => void;
}

export function ChatHeader({ onNewChat }: ChatHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.avatar} aria-hidden="true">AL</div>
      <div className={styles.info}>
        <span className={styles.name}>AL — Adrian's Agent</span>
        <span className={styles.status}>
          <span className={styles.dot} aria-hidden="true" />
          Online
        </span>
      </div>
      <button
        className={styles.newChatBtn}
        onClick={onNewChat}
        aria-label="New conversation"
        title="New conversation"
        type="button"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 5H7a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        New chat
      </button>
    </header>
  );
}
