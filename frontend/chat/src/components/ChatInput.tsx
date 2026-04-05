import { useRef, useState, useCallback, type KeyboardEvent } from 'react';
import clsx from 'clsx';
import styles from './ChatInput.module.css';

interface ChatInputProps {
  onSend: (text: string) => void;
  onStop: () => void;
  isLoading: boolean;
}

export function ChatInput({ onSend, onStop, isLoading }: ChatInputProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const resizeTextarea = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 180)}px`;
  }, []);

  const handleSend = () => {
    const text = value.trim();
    if (!text || isLoading) return;
    onSend(text);
    setValue('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <textarea
          ref={textareaRef}
          className={styles.textarea}
          value={value}
          onChange={(e) => { setValue(e.target.value); resizeTextarea(); }}
          onKeyDown={handleKeyDown}
          placeholder="Message AL… (Enter to send, Shift+Enter for newline)"
          rows={1}
          aria-label="Message input"
          aria-multiline="true"
        />
        {isLoading ? (
          <button
            className={clsx(styles.btn, styles.stopBtn)}
            onClick={onStop}
            aria-label="Stop generation"
            title="Stop generation"
            type="button"
          >
            <span className={styles.stopIcon} aria-hidden="true">■</span>
          </button>
        ) : (
          <button
            className={clsx(styles.btn, styles.sendBtn, !value.trim() && styles.disabled)}
            onClick={handleSend}
            disabled={!value.trim()}
            aria-label="Send message"
            title="Send (Enter)"
            type="button"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M2 8L14 2L10 8L14 14L2 8Z" fill="currentColor" />
            </svg>
          </button>
        )}
      </div>
      <p className={styles.hint}>AL can make mistakes. Verify important information.</p>
    </div>
  );
}

