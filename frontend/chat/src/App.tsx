import {
  MinChatUiProvider,
  MainContainer,
  MessageInput,
  MessageContainer,
  MessageList,
  MessageHeader,
} from "@minchat/react-chat-ui";
import { useState } from "react";

function App() {
  const API_URL = import.meta.env.VITE_API_URL

  const [messages, setMessages] = useState([
    {
      text: "Hello, what would you like to ask?",
      user: { id: "llm", name: "AL - Agent" },
      createdAt: new Date(),
      direction: "incoming"
    }
  ]);

  const [isLoading, setIsLoading] = useState(false);

  const onSendMessage = (message: string) => {
    const newMessage = {
      text: message,
      user: { id: 'user', name: 'You' },
      createdAt: new Date(),
      direction: 'outgoing'
    }

    setMessages([...messages, newMessage])

    getMessage(newMessage.text)
  }

  const getMessage = async (newMessage: string) => {
    setIsLoading(true)

    try {

      const result = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: newMessage })
      })

      if (result.ok) {
        const data = await result.json()
        const cleanedResponse = cleanAgentResponse(data.response)
        const newMessage = {
          text: cleanedResponse,
          user: { id: 'agent', name: 'AL - Agent' },
          createdAt: new Date(),
          direction: 'incoming'
        }
        setMessages(prev => [...prev, newMessage])
      } else {
          const newMessage = {
          text: 'Sorry, something went wrong. Please, try again.',
          user: { id: 'agent', name: 'AL - Agent' },
          createdAt: new Date(),
          direction: 'incoming'
        }
        setMessages(prev => [...prev, newMessage])
      }
    } catch (error) {
      console.error('Error fetching message:', error)
      const newMessage = {
        text: 'Sorry, something went wrong. Please, try again.',
        user: { id: 'agent', name: 'AL - Agent' },
        createdAt: new Date(),
        direction: 'incoming'
      }
      setMessages(prev => [...prev, newMessage])
    }

    setIsLoading(false)
  }

  const cleanAgentResponse = (text: string): string => {
    return text.replace(/【[^】]*】/g, "").trim();
  }

  return (
    <div className="container">
      <h2>Ask me questions about Adrian!</h2>
      <p>Note: The agent might make mistakes</p>
      <MinChatUiProvider theme="#74b1e0ff">
        <MainContainer style={{ height: '80vh' }}>
          <MessageContainer>
            <MessageHeader />
            <MessageList 
              messages={messages} 
              enableMarkdown={true}
              currentUserId={"user"}
              typingIndicatorContent={"AL is typing..."}
              showTypingIndicator={isLoading}
            />
            <MessageInput 
              showAttachButton={false}
              showSendButton={true}
              placeholder="Type message here"
              onSendMessage={onSendMessage}
              disabled={isLoading}
            />
          </MessageContainer>
        </MainContainer>
      </MinChatUiProvider>
    </div>
  )
}

export default App;