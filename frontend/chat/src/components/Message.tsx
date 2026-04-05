import { memo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import clsx from 'clsx';
import type { Message as MessageType } from '../types';
import { CodeBlock } from './CodeBlock';
import styles from './Message.module.css';

interface MessageProps {
  message: MessageType;
}

export const Message = memo(function Message({ message }: MessageProps) {
  const [copied, setCopied] = useState(false);
  const isAssistant = message.role === 'assistant';

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={clsx(styles.row, isAssistant ? styles.assistantRow : styles.userRow)}>
      {isAssistant && (
        <div className={styles.avatar} aria-hidden="true">AL</div>
      )}

      <div className={clsx(styles.bubble, isAssistant ? styles.assistantBubble : styles.userBubble)}>
        {isAssistant ? (
          <div className={styles.markdownBody}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  const isBlock = !props.ref && String(children).includes('\n');
                  return isBlock || match ? (
                    <CodeBlock language={match?.[1] ?? ''}>
                      {String(children).replace(/\n$/, '')}
                    </CodeBlock>
                  ) : (
                    <code className={styles.inlineCode} {...props}>
                      {children}
                    </code>
                  );
                },
              }}
            >
              {message.text}
            </ReactMarkdown>
            {message.isStreaming && message.text && <span className={styles.cursor} aria-hidden="true">▌</span>}
          </div>
        ) : (
          <p className={styles.userText}>{message.text}</p>
        )}

        <div className={styles.meta}>
          <span className={styles.time} title={message.createdAt.toLocaleString()}>
            {message.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          {!message.isStreaming && message.text && (
            <button
              className={styles.copyBtn}
              onClick={handleCopy}
              aria-label={copied ? 'Copied' : 'Copy message'}
            >
              {copied ? '✓' : '⎘'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
});
