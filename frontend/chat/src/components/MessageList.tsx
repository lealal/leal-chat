import { useEffect, useRef, memo } from 'react';
import type { Message as MessageType } from '../types';
import { Message } from './Message';
import { TypingIndicator } from './TypingIndicator';
import styles from './MessageList.module.css';

interface MessageListProps {
  messages: MessageType[];
  isWaiting: boolean;
}

export const MessageList = memo(function MessageList({ messages, isWaiting }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isWaiting]);

  return (
    <div
      className={styles.list}
      role="log"
      aria-live="polite"
      aria-label="Chat messages"
    >
      <div className={styles.spacer} />
      {messages.map((message) => (
        <Message key={message.id} message={message} />
      ))}
      {isWaiting && <TypingIndicator />}
      <div className={styles.spacer} />
      <div ref={bottomRef} aria-hidden="true" />
    </div>
  );
});
