import { useChat } from './hooks/useChat';
import { ChatHeader } from './components/ChatHeader';
import { MessageList } from './components/MessageList';
import { ChatInput } from './components/ChatInput';
import styles from './App.module.css';

function App() {
  const { messages, isLoading, isWaiting, sendMessage, stopGeneration, resetChat } = useChat();

  return (
    <main className={styles.shell}>
      <div className={styles.window}>
        <ChatHeader onNewChat={resetChat} />
        <MessageList messages={messages} isWaiting={isWaiting} />
        <ChatInput onSend={sendMessage} onStop={stopGeneration} isLoading={isLoading} />
      </div>
    </main>
  );
}

export default App;