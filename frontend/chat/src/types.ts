export interface Message {
  id: string;
  text: string;
  role: 'user' | 'assistant';
  createdAt: Date;
  isStreaming: boolean;
}
