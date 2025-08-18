import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { io } from 'socket.io-client';
import Switch from './ui/switch';
import Input from './ui/input';
import Button from './ui/button';
import PersonalInput from './ui/personalinput';

const socket = io('http://localhost:5000', {
  withCredentials: true,
  transports: ['websocket', 'polling'],
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});
const ChatInterface = ({ username, chatId }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');

  const [joinError, setJoinError] = useState('');
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    console.log('Setting up socket listeners...');
    
    // Clear messages and state when chatId or username changes
    setMessages([]);
    setJoinError('');
    setJoined(false);
    
    if (!username || !chatId) {
      setJoinError('Missing username or chat ID');
      return;
    }
    
    console.log(`Joining room: ${chatId} as ${username}`);
    
    // Try to join the room
    console.log('Attempting to join room:', { chatId, username });
    socket.emit('joinRoom', { 
      roomId: chatId, 
      username 
    }, (response) => {
      console.log('Join room response:', response);
      
      if (response && response.status === 'ok') {
        console.log('Successfully joined room:', chatId);
        setJoined(true);
        setJoinError('');
      } else {
        const errorMsg = response?.error || 'Failed to join room. Please try again.';
        console.error('Failed to join room:', errorMsg, 'Response:', response);
        setJoinError(errorMsg);
        setJoined(false);
        
        // If it's a duplicate username error, redirect back to home after a delay
        if (errorMsg.includes('already taken')) {
          setTimeout(() => {
            window.location.href = '/';
          }, 3000);
        }
      }
    });
    
    // Set a timeout in case the server doesn't respond
    const timeout = setTimeout(() => {
      if (!joined && !joinError) {
        console.error('Join room request timed out');
        setJoinError('Connection timeout. Please try again.');
        setJoined(false);
      }
    }, 10000); // 10 second timeout
    
    // Cleanup function
    return () => clearTimeout(timeout);

    const handleMessage = (msg) => {
      console.log('Received message:', msg);
      if (!msg || !msg.user || !msg.text) {
        console.error('Invalid message format:', msg);
        return;
      }
      
      setMessages(prev => {
        // Check if this is an update to an existing message (matches by tempId or content)
        const existingMessageIndex = prev.findIndex(m => 
          (m.tempId && msg.tempId && m.tempId === msg.tempId) ||
          (m.user === msg.user && m.text === msg.text && 
           (!m.timestamp || !msg.timestamp || 
            Math.abs(new Date(m.timestamp).getTime() - new Date(msg.timestamp).getTime()) < 5000))
        );
        
        if (existingMessageIndex >= 0) {
          // Update existing message (this will clear the sending state)
          const updated = [...prev];
          updated[existingMessageIndex] = {
            ...msg,
            isSending: false,  // Clear sending state
            isError: false     // Clear any error state
          };
          console.log('Updated existing message:', updated[existingMessageIndex]);
          return updated;
        }
        
        // For new messages from other users
        return [...prev, msg];
      });
    };

    const handleConnect = () => {
      console.log('Connected to server with ID:', socket.id);
      console.log('Socket connected:', socket.connected);
      console.log('Socket ID:', socket.id);
      setConnectionStatus('connected');
      
      // Rejoin room if we were in one
      if (username && chatId) {
        console.log('Rejoining room after reconnect...');
        socket.emit('joinRoom', { roomId: chatId, username }, (response) => {
          if (response && response.status === 'ok') {
            console.log('Successfully rejoined room:', chatId);
          }
        });
      }
    };

    const handleConnectError = (error) => {
      console.error('Connection error:', error);
      console.error('Error details:', {
        message: error.message,
        description: error.description,
        context: error.context
      });
    };

    socket.on('connect', handleConnect);
    socket.on('connect_error', handleConnectError);
    socket.on('disconnect', (reason) => {
      console.log('Disconnected:', reason);
      if (reason === 'io server disconnect') {
        console.log('Server has disconnected the socket');
      }
    });
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    socket.on("message", handleMessage);

    return () => {
      console.log('Cleaning up socket listeners...');
      socket.off("message", handleMessage);
      if (username && chatId) {
        console.log(`Leaving room: ${chatId}`);
        socket.emit('leaveRoom', { roomId: chatId, username });
      }
    };
  }, [username, chatId]);

  const sendMessage = () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || !username || !chatId) {
      console.error('Cannot send message: missing required fields', { 
        hasMessage: !!trimmedMessage, 
        username, 
        chatId 
      });
      return;
    }

    const tempId = `temp-${Date.now()}`;
    const messageData = { 
      roomId: chatId, 
      user: username, 
      text: trimmedMessage,
      tempId,  // Include tempId in the message data
      timestamp: new Date().toISOString()  // Include client timestamp for initial sorting
    };
    
    console.log('Sending message:', messageData);
    
    // Add message optimistically to UI immediately
    const optimisticMessage = {
      ...messageData,
      isSending: true
    };
    
    setMessages(prev => [...prev, optimisticMessage]);
    setMessage("");
    
    // Scroll to bottom when new message is added
    setTimeout(() => {
      const container = document.getElementById('messages-container');
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }, 0);
    
    // Emit with acknowledgment
    socket.emit("sendMessage", messageData, (response) => {
      console.log('Server response:', response);
      
      if (response && response.status === 'ok') {
        // The message will be updated via the 'message' event from the server
        console.log('Message sent successfully');
      } else {
        // Mark the message as failed
        setMessages(prev => prev.map(msg => 
          msg.tempId === tempId 
            ? { ...msg, isSending: false, isError: true, error: response?.error || 'Failed to send' }
            : msg
        ));
      }
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Show error message if failed to join
  if (joinError) {
    return (
      <ErrorContainer>
        <ErrorMessageBox>
          <h3>Could Not Join Chat</h3>
          <p>{joinError}</p>
          <BackButton onClick={() => window.location.href = '/'}>Go Back</BackButton>
        </ErrorMessageBox>
      </ErrorContainer>
    );
  }

  // Show loading state while connecting
  if (!joined) {
    return (
      <LoadingContainer>
        <p>Connecting to chat...</p>
      </LoadingContainer>
    );
  }

  return (
    <ChatContainer>
      <ConnectionStatus status={connectionStatus}>
        {connectionStatus === 'connected' ? 'Connected' : 'Disconnected'}
      </ConnectionStatus>
      <MessagesContainer id="messages-container">
        {messages.length === 0 ? (
          <NoMessages>No messages yet. Send a message to start chatting!</NoMessages>
        ) : (
          messages.map((msg, i) => {
            const isCurrentUser = msg.user === username;
            const isSystem = msg.user === 'system';
            
            return (
              <Message 
                key={msg.tempId || `${msg.timestamp || Date.now()}-${i}`}
                isUser={isCurrentUser}
                isSystem={isSystem}
                isSending={msg.isSending}
                isError={msg.isError}
                data-testid={
                  isSystem ? 'system-message' : 
                  isCurrentUser ? 'user-message' : 'other-message'
                }
              >
                {!isSystem && <strong>{msg.user}: </strong>}
                <MessageText>{msg.text}</MessageText>
                
                {msg.isError && (
                  <ErrorMessage>Failed to send. {msg.error || 'Please try again.'}</ErrorMessage>
                )}
                
                {msg.timestamp && !msg.isSending && (
                  <MessageTime>
                    {new Date(msg.timestamp).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                    {msg.isSending && ' (sending...)'}
                  </MessageTime>
                )}
                
                {msg.isSending && (
                  <SendingIndicator>Sending...</SendingIndicator>
                )}
              </Message>
            );
          })
        )}
      </MessagesContainer>
      
      <InputContainer>
        <TopRow>
          <SwitchContainer>
            <Switch />
          </SwitchContainer>
          <PersonalInputContainer>
            <PersonalInput />
          </PersonalInputContainer>
        </TopRow>
        <BottomRow>
          <InputWrapper>
            <Input 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
            />
          </InputWrapper>
          <ButtonContainer onClick={sendMessage}>
            <Button>Send</Button>
          </ButtonContainer>
        </BottomRow>
      </InputContainer>
    </ChatContainer>
  );
};



const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  max-height: 100vh;
  border: 4px solid #eee;
  overflow: hidden;
  padding: 0;
  margin: 0 auto;
  max-width: 100%;
  
  @media (min-width: 1024px) {
    max-width: 80%;
    margin: 0 10%;
  }
  
  @media (min-width: 1440px) {
    max-width: 1200px;
    margin: 0 auto;
  }
`;

const MessagesContainer = styled.div`
  flex: 1;
  padding: 15px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  background-color: #f8f8f8;
  gap: 10px;
`;

const Message = styled.div`
  background: ${({ isUser, isSystem, isError }) => 
    isSystem ? '#e3f2fd' : 
    isError ? '#ffebee' :
    isUser ? '#f5f5dc' : '#f1f1f1' 
  };
  color: ${({ isUser, isSystem, isError }) => 
    isError ? '#d32f2f' :
    isSystem ? '#1565c0' :
    isUser ? 'Black' : 'Black' 
  };
  border: ${({ isError }) => isError ? '1px solid #ffcdd2' : 'none'};
  border-radius: 15px;
  padding: 10px 15px;
  margin: 5px 0;
  max-width: 70%;
  align-self: ${({ isUser, isSystem }) => (isUser || isSystem) ? 'flex-end' : 'flex-start'};
  position: relative;
  word-break: break-word;
  opacity: ${({ isSending }) => isSending ? 0.7 : 1};
  transition: opacity 0.3s ease;
`;

const MessageText = styled.span`
  display: inline-block;
  margin-right: 5px;
`;

const ErrorMessage = styled.div`
  color: #d32f2f;
  font-size: 0.8em;
  margin-top: 5px;
  font-style: italic;
`;

const SendingIndicator = styled.div`
  font-size: 0.8em;
  color: #666;
  font-style: italic;
  margin-top: 5px;
`;

const MessageTime = styled.span`
  display: block;
  font-size: 0.7rem;
  opacity: 0.8;
  text-align: right;
  margin-top: 4px;
  color: ${props => props.theme.messageTimeColor || 'inherit'};
`;

const NoMessages = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #666;
  font-style: italic;
`;

const ErrorContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  padding: 1rem;
  background-color: #f8f9fa;
`;

const ErrorMessageBox = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 400px;
  width: 100%;

  h3 {
    color: #dc3545;
    margin-top: 0;
  }

  p {
    margin: 1rem 0;
    color: #6c757d;
  }
`;

const BackButton = styled.button`
  background-color: #007bff;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s;

  &:hover {
    background-color: #0056b3;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  font-size: 1.2rem;
  color: #6c757d;
`;

const ConnectionStatus = styled.div`
  position: fixed;
  top: 10px;
  right: 10px;
  padding: 5px 10px;
  border-radius: 15px;
  background-color: ${props => props.status === 'connected' ? '#4caf50' : '#f44336'};
  color: white;
  font-size: 0.8rem;
  z-index: 1000;
`;

const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 12px 10px;
  gap: 10px;
  border-top: 1px solid #eee;
  
  @media (max-width: 480px) {
    padding: 8px 5px;
    gap: 8px;
  }
`;

const TopRow = styled.div`
  display: flex;
  gap: 12px;
  width: 100%;
  align-items: center;
  margin: 2px 0;
`;

const BottomRow = styled.div`
  display: flex;
  gap: 12px;
  width: 100%;
  align-items: center;
  margin: 2px 0;
`;

const SwitchContainer = styled.div`
  flex: 0 0 90px;
  margin-left: 7px;
`;

const InputWrapper = styled.div`
  flex: 1;
  min-width: 0; /* Prevents flex item from overflowing */
`;

const ButtonContainer = styled.div`
  flex: 0 0 80px;
  display: flex;
  margin-left: 1px;
  
  @media (max-width: 480px) {
    flex: 0 0 70px;
    margin-left: 0;
  }
`;

const PersonalInputContainer = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
`;

export default ChatInterface;