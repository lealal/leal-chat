import { useState, useRef, useCallback } from 'react';
import type { Message } from '../types';

const API_URL = '/api/chat/stream';

const WELCOME_MESSAGE: Message = {
  id: 'welcome',
  text: "Hi! I'm AL. Ask me anything about Adrian!",
  role: 'assistant',
  createdAt: new Date(),
  isStreaming: false,
};

function cleanResponse(text: string): string {
  return text.replace(/【[^】]*】/g, '').trim();
}

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const threadIdRef = useRef<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (text: string) => {
      if (isLoading || !text.trim()) return;

      const userMessage: Message = {
        id: `user-${Date.now()}`,
        text: text.trim(),
        role: 'user',
        createdAt: new Date(),
        isStreaming: false,
      };

      const assistantId = `assistant-${Date.now() + 1}`;
      const assistantMessage: Message = {
        id: assistantId,
        text: '',
        role: 'assistant',
        createdAt: new Date(),
        isStreaming: true,
      };

      setMessages((prev) => [...prev, userMessage, assistantMessage]);
      setIsLoading(true);
      setIsWaiting(true);

      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text.trim(), thread_id: threadIdRef.current }),
          signal: controller.signal,
        });

        if (!response.ok || !response.body) throw new Error('Stream failed');

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let accumulated = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const payload = line.slice(6).trim();
            if (payload === '[DONE]') break;

            try {
              const parsed = JSON.parse(payload);
              if (parsed.thread_id) {
                threadIdRef.current = parsed.thread_id;
              }
              if (parsed.token) {
                // First token — hide the typing indicator
                setIsWaiting(false);
                accumulated += parsed.token;
                const cleaned = cleanResponse(accumulated);
                setMessages((prev) =>
                  prev.map((m) => (m.id === assistantId ? { ...m, text: cleaned } : m))
                );
              }
            } catch {
              // ignore parse errors on individual chunks
            }
          }
        }

        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, isStreaming: false } : m))
        );
      } catch (error) {
        setIsWaiting(false);
        if ((error as Error).name === 'AbortError') return;

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, text: 'Sorry, something went wrong. Please try again.', isStreaming: false }
              : m
          )
        );
      } finally {
        setIsWaiting(false);
        setIsLoading(false);
      }
    },
    [isLoading]
  );

  const stopGeneration = useCallback(() => {
    abortControllerRef.current?.abort();
    setMessages((prev) => prev.map((m) => (m.isStreaming ? { ...m, isStreaming: false } : m)));
    setIsWaiting(false);
    setIsLoading(false);
  }, []);

  const resetChat = useCallback(() => {
    abortControllerRef.current?.abort();
    threadIdRef.current = null;
    setMessages([{ ...WELCOME_MESSAGE, createdAt: new Date() }]);
    setIsLoading(false);
    setIsWaiting(false);
  }, []);

  return { messages, isLoading, isWaiting, sendMessage, stopGeneration, resetChat };
}
