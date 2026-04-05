import SyntaxHighlighter from 'react-syntax-highlighter/dist/esm/prism-light';
import jsx from 'react-syntax-highlighter/dist/esm/languages/prism/jsx';
import tsx from 'react-syntax-highlighter/dist/esm/languages/prism/tsx';
import typescript from 'react-syntax-highlighter/dist/esm/languages/prism/typescript';
import javascript from 'react-syntax-highlighter/dist/esm/languages/prism/javascript';
import python from 'react-syntax-highlighter/dist/esm/languages/prism/python';
import bash from 'react-syntax-highlighter/dist/esm/languages/prism/bash';
import json from 'react-syntax-highlighter/dist/esm/languages/prism/json';
import { useState } from 'react';
import styles from './CodeBlock.module.css';

SyntaxHighlighter.registerLanguage('jsx', jsx);
SyntaxHighlighter.registerLanguage('tsx', tsx);
SyntaxHighlighter.registerLanguage('typescript', typescript);
SyntaxHighlighter.registerLanguage('javascript', javascript);
SyntaxHighlighter.registerLanguage('python', python);
SyntaxHighlighter.registerLanguage('bash', bash);
SyntaxHighlighter.registerLanguage('json', json);

const theme = {
  'code[class*="language-"]': {
    color: '#e2e8f0',
    background: 'none',
    fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
    fontSize: '13px',
    lineHeight: '1.6',
  },
  'pre[class*="language-"]': {
    color: '#e2e8f0',
    background: 'none',
    margin: '0',
    padding: '0',
  },
  comment: { color: '#6b7280', fontStyle: 'italic' },
  keyword: { color: '#a78bfa' },
  string: { color: '#86efac' },
  number: { color: '#fbbf24' },
  function: { color: '#60a5fa' },
  operator: { color: '#94a3b8' },
  punctuation: { color: '#94a3b8' },
  'class-name': { color: '#f0abfc' },
  builtin: { color: '#f0abfc' },
  boolean: { color: '#fb923c' },
};

interface CodeBlockProps {
  language: string;
  children: string;
}

export function CodeBlock({ language, children }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.toolbar}>
        <span className={styles.lang}>{language || 'code'}</span>
        <button
          className={styles.copyBtn}
          onClick={handleCopy}
          aria-label={copied ? 'Copied' : 'Copy code'}
        >
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>
      <SyntaxHighlighter
        language={language || 'text'}
        style={theme as never}
        customStyle={{ margin: 0, padding: '16px', background: 'transparent', overflowX: 'auto' }}
        wrapLines={false}
      >
        {children}
      </SyntaxHighlighter>
    </div>
  );
}
