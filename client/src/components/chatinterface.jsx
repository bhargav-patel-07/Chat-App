import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { io } from 'socket.io-client';
import ReactMarkdown from 'react-markdown';
import Switch from './ui/switch';
import Input from './ui/input';
import Button from './ui/button';
import PersonalInput from './ui/personalinput';
import Card from './ui/card';
import Avatar from './ui/Avatar';
import UserList from './UserList';

const SOCKET_URL = import.meta.env.VITE_APP_SERVER_URL || 'https://chat-app-server-1-d8us.onrender.com';

const socketOptions = {
  withCredentials: true,
  transports: ['websocket', 'polling'],
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  path: '/socket.io/',
  timeout: 10000,
  secure: true,
  rejectUnauthorized: false,
  forceNew: true
};

const ChatInterface = ({ username, chatId }) => {
  const socketRef = useRef(null);
  const [message, setMessage] = useState('');
  const [personalMessage, setPersonalMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [joinError, setJoinError] = useState('');
  const [joined, setJoined] = useState(false);
  const [aiMode, setAiMode] = useState(false);
  const [usersInRoom, setUsersInRoom] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [isPersonalMode, setIsPersonalMode] = useState(false);

  // Validate required props
  if (!username || !chatId) {
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        Error: Missing required information. Please ensure you have both a username and chat ID.
      </div>
    );
  }

  // Boot socket, attach listeners, join room
  useEffect(() => {
    // This should never happen because of the early return above, but just in case
    if (!username || !chatId) {
      setJoinError('Missing username or chat ID');
      return;
    }

    // Initialize socket connection
    const socket = io(SOCKET_URL, socketOptions);
    socketRef.current = socket;

    const onConnect = () => {
      setConnectionStatus('connected');
      // Server expects { room, username }
      socket.emit('joinRoom', { room: chatId, username }, (res) => {
        if (res && res.status === 'ok') {
          setJoined(true);
          setJoinError('');
        } else if (res && res.error) {
          setJoinError(res.error);
        }
      });
    };

    const onConnectError = (error) => {
      console.error('Connection error:', error);
      setConnectionStatus('error');
      setJoinError('Failed to connect to the chat server');
    };

    const onDisconnect = (reason) => {
      setConnectionStatus('disconnected');
      if (reason === 'io server disconnect') {
        // Server initiated disconnect
      }
    };

    const onRoomJoined = (roomId) => {
      // Server sends just the room ID as a string
      if (!roomId) {
        console.error('Room joined event received invalid room ID:', roomId);
        return;
      }
      
      console.log(`Successfully joined room: ${roomId} as ${username}`);
      setJoined(true);
      setConnectionStatus('connected');
      setJoinError('');
      
      // Send a welcome message to the room
      if (socketRef.current) {
        socketRef.current.emit('chatMessage', {
          room: roomId,
          message: `Hello! I'm ${username} and I've joined the chat.`
        });
      }
    };

    const onMessage = (incoming) => {
      if (!incoming || (!incoming.text && !incoming.image)) return;

      setMessages((prev) => {
        const idx = prev.findIndex(
          (m) =>
            (m.tempId && incoming.tempId && m.tempId === incoming.tempId) ||
            (m.user === incoming.user &&
              m.text === incoming.text &&
              (!m.timestamp ||
                !incoming.timestamp ||
                Math.abs(new Date(m.timestamp).getTime() - new Date(incoming.timestamp).getTime()) < 5000))
        );
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = { ...incoming, isSending: false, isError: false };
          return updated;
        }
        return [...prev, incoming];
      });
    };

    const onUsersInRoom = (users) => {
      setUsersInRoom(users);
    };

    const onPrivateMessage = (message) => {
      setMessages((prev) => [...prev, { ...message, isPrivate: true, isFromMe: message.isFromMe }]);
    };

    socket.on('connect', onConnect);
    socket.on('connect_error', onConnectError);
    socket.on('disconnect', onDisconnect);
    socket.on('roomJoined', onRoomJoined);
    socket.on('message', onMessage);
    socket.on('usersInRoom', onUsersInRoom);
    socket.on('privateMessage', onPrivateMessage);

    // kick off connection (since autoConnect: false)
    socket.connect();

    return () => {
      socket.off('connect', onConnect);
      socket.off('connect_error', onConnectError);
      socket.off('disconnect', onDisconnect);
      socket.off('roomJoined', onRoomJoined);
      socket.off('message', onMessage);
      socket.off('usersInRoom', onUsersInRoom);
      socket.off('privateMessage', onPrivateMessage);
      socket.disconnect();
    };
  }, [chatId, username]);

  const renderMessageContent = (text) => {
    if (!text) return [{ type: 'text', content: '' }];

    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ type: 'text', content: text.substring(lastIndex, match.index).trim() });
      }

      const language = match[1] || 'text';
      const code = match[2].trim();
      const messageStart = text.substring(0, match.index).trim();
      const lastNewLine = messageStart.lastIndexOf('\n');
      const userQuery = lastNewLine >= 0 ? messageStart.substring(lastNewLine).trim() : messageStart || 'Code Snippet';

      parts.push({
        type: 'component',
        component: (
          <Card
            key={`code-${lastIndex}`}
            title={userQuery}
            language={language}
            code={code}
            showLineNumbers={code.split('\n').length > 1}
          />
        )
      });

      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      const remainingText = text.substring(lastIndex).trim();
      if (remainingText) parts.push({ type: 'text', content: remainingText });
    }

    return parts.length > 0 ? parts : [{ type: 'text', content: text }];
  };

  const handleImageSend = async (file) => {
    if (!file || !username || !chatId) return;
    const tempId = `temp-img-${Date.now()}`;
    const reader = new FileReader();
    reader.onload = async (e) => {
      const imageData = e.target.result;
      const messageData = {
        roomId: chatId,
        user: username,
        image: imageData,
        tempId,
        timestamp: new Date().toISOString()
      };
      setMessages((prev) => [...prev, { ...messageData, isSending: true }]);
      socketRef.current.emit('sendMessage', messageData, (response) => {
        if (!(response && response.status === 'ok')) {
          setMessages((prev) =>
            prev.map((m) =>
              m.tempId === tempId ? { ...m, isSending: false, isError: true, error: response?.error || 'Failed to send image' } : m
            )
          );
        }
      });
    };
    reader.readAsDataURL(file);
  };

  const sendPersonalMessage = async () => {
    const trimmedMessage = personalMessage.trim();
    if (!trimmedMessage || !username || !chatId) {
      return;
    }

    const tempId = `temp-${Date.now()}`;
    const messageData = {
      roomId: chatId,
      user: username,
      text: trimmedMessage,
      tempId,
      timestamp: new Date().toISOString(),
      targetUserId: selectedUserId
    };

    setMessages((prev) => [...prev, { ...messageData, isSending: true }]);
    setPersonalMessage('');

    // emit with ack
    socketRef.current.emit('sendMessage', messageData, (response) => {
      setMessages((prev) =>
        prev.map((m) => {
          if (m.tempId === tempId) {
            if (response && response.status === 'ok') {
              // Message sent successfully, remove sending state
              const { isSending, ...rest } = m;
              return rest;
            } else {
              // Error sending message
              return { 
                ...m, 
                isSending: false, 
                isError: true, 
                error: response?.error || 'Failed to send' 
              };
            }
          }
          return m;
        })
      );
    });
  };

  const sendMessage = async (personalMessage = false, targetUserId = null) => {
    const messageToSend = personalMessage ? personalMessage : message.trim();
    if (!messageToSend || !username || !chatId) {
      return;
    }

    const tempId = `temp-${Date.now()}`;
    const messageData = {
      roomId: chatId,
      user: username,
      text: messageToSend,
      tempId,
      timestamp: new Date().toISOString(),
      targetUserId: isPersonalMode ? selectedUserId : null
    };

    setMessages((prev) => [...prev, { ...messageData, isSending: true }]);
    setMessage('');

    // emit with ack
    socketRef.current.emit('sendMessage', messageData, (response) => {
      setMessages((prev) =>
        prev.map((m) => {
          if (m.tempId === tempId) {
            if (response && response.status === 'ok') {
              // Message sent successfully, remove sending state
              const { isSending, ...rest } = m;
              return rest;
            } else {
              // Error sending message
              return { 
                ...m, 
                isSending: false, 
                isError: true, 
                error: response?.error || 'Failed to send' 
              };
            }
          }
          return m;
        })
      );
    });

    // Optional AI reply
    if (aiMode) {
      try {
        const aiRes = await fetch(`${SOCKET_URL}/api/ai/text`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: messageToSend })
        });
        const aiData = await aiRes.json();
        if (aiData && aiData.response) {
          const aiMessage = {
            roomId: chatId,
            user: 'AI',
            text: aiData.response,
            timestamp: new Date().toISOString()
          };
          socketRef.current.emit('sendMessage', aiMessage);
        }        
      } catch (err) {
        console.error('AI API error:', err);
      }
    }

    // scroll down
    setTimeout(() => {
      const container = document.getElementById('messages-container');
      if (container) container.scrollTop = container.scrollHeight;
    }, 0);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (isPersonalMode && personalMessage.trim()) {
        sendPersonalMessage();
      } else {
        sendMessage();
      }
    }
  };
  
  const handleUserSelect = (userId) => {
    setSelectedUserId(userId);
    setIsPersonalMode(true);
  };
  
  const exitPersonalMode = () => {
    setIsPersonalMode(false);
    setSelectedUserId(null);
    setPersonalMessage('');
  };

  if (joinError) {
    return (
      <ErrorContainer>
        <ErrorMessageBox>
          <h3>Could Not Join Chat</h3>
          <p>{joinError}</p>
          <BackButton onClick={() => (window.location.href = '/')}>Go Back</BackButton>
        </ErrorMessageBox>
      </ErrorContainer>
    );
  }

  if (!joined) {
    return (
      <LoadingContainer>
        <p>Connecting to chat...</p>
      </LoadingContainer>
    );
  }

  const selectedUser = usersInRoom.find(u => u.socketId === selectedUserId);

  return (
    <Container>
      <UserList 
        users={usersInRoom} 
        currentUser={{ socketId: socketRef.current?.id, username }} 
        onUserSelect={handleUserSelect}
      />
      <ChatContainer>
        <ConnectionStatus $status={connectionStatus}>
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
                  $isUser={isCurrentUser}
                  $isSystem={isSystem}
                  $isSending={msg.isSending}
                  $isError={msg.isError}
                  data-testid={isSystem ? 'system-message' : isCurrentUser ? 'user-message' : 'other-message'}
                >
                  {!isSystem && (
                    <MessageHeader $isCurrentUser={isCurrentUser}>
                      {!isCurrentUser && (
                        <Avatar
                          name={msg.user}
                          color={isCurrentUser ? '#4a90e2' : '#6c757d'}
                          isAI={String(msg.user).toLowerCase() === 'ai'}
                        />
                      )}
                      <UserName $isCurrentUser={isCurrentUser}>{isCurrentUser ? 'You' : msg.user}</UserName>
                    </MessageHeader>
                  )}

                  <MessageContent $isCurrentUser={isCurrentUser} $isSystem={isSystem}>
                    <MessageText>
                      {msg.text &&
                        renderMessageContent(msg.text).map((part, idx) =>
                          part.type === 'component' ? (
                            <div key={`part-${idx}`} style={{ margin: '10px 0', width: '100%' }}>
                              {part.component}
                            </div>
                          ) : (
                            <div key={`part-${idx}`} className="markdown-content">
                              <ReactMarkdown
                                components={{
                                  code({ node, inline, className, children, ...props }) {
                                    const match = /language-(\w+)/.exec(className || '');
                                    return !inline ? (
                                      <Card
                                        title="Code Snippet"
                                        language={match ? match[1] : 'text'}
                                        code={String(children).replace(/\n$/, '')}
                                      />
                                    ) : (
                                      <code className={className} {...props}>
                                        {children}
                                      </code>
                                    );
                                  },
                                  p: ({ node, ...props }) => (
                                    <p style={{ margin: '0.5em 0', lineHeight: '1.6', textAlign: 'left' }} {...props} />
                                  ),
                                  ul: ({ node, ...props }) => (
                                    <ul style={{ margin: '0.5em 0', paddingLeft: '1.5em', textAlign: 'left' }} {...props} />
                                  ),
                                  ol: ({ node, ...props }) => (
                                    <ol style={{ margin: '0.5em 0', paddingLeft: '1.5em', textAlign: 'left' }} {...props} />
                                  ),
                                  h1: ({ node, ...props }) => <h3 style={{ margin: '1em 0 0.5em 0' }} {...props} />,
                                  h2: ({ node, ...props }) => <h4 style={{ margin: '0.9em 0 0.5em 0' }} {...props} />,
                                  h3: ({ node, ...props }) => <h5 style={{ margin: '0.8em 0 0.5em 0' }} {...props} />,
                                  blockquote: ({ node, ...props }) => (
                                    <blockquote
                                      style={{
                                        borderLeft: '3px solid #ddd',
                                        margin: '0.5em 0',
                                        padding: '0.1em 1em',
                                        color: '#666',
                                        fontStyle: 'italic'
                                      }}
                                      {...props}
                                    />
                                  ),
                                  a: ({ node, ...props }) => (
                                    <a style={{ color: '#0066cc', textDecoration: 'none' }} target="_blank" rel="noopener noreferrer" {...props} />
                                  )
                                }}
                              >
                                {part.content}
                              </ReactMarkdown>
                            </div>
                          )
                        )}
                    </MessageText>

                    {msg.image && (
                      <div style={{ marginTop: 8 }}>
                        <img
                          src={msg.image}
                          alt="sent"
                          style={{ maxWidth: '220px', maxHeight: '180px', borderRadius: '8px', border: '1px solid #ccc' }}
                        />
                      </div>
                    )}

                    {msg.isError && <ErrorMessage>Failed to send. {msg.error || 'Please try again.'}</ErrorMessage>}

                    {msg.timestamp && (
                      <MessageTime>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {msg.isSending && ' (sending...)'}
                      </MessageTime>
                    )}

                    {msg.isSending && <SendingIndicator>Sending...</SendingIndicator>}
                  </MessageContent>
                </Message>
              );
            })
          )}
        </MessagesContainer>

        <InputContainer>
          {isPersonalMode && selectedUser && (
            <PersonalChatHeader>
              <span>Chat with {selectedUser.username}</span>
              <CloseButton onClick={exitPersonalMode}>×</CloseButton>
            </PersonalChatHeader>
          )}
          <TopRow>
            <SwitchContainer>
              <Switch checked={aiMode} onChange={setAiMode} />
            </SwitchContainer>
            <PersonalInputContainer>
              <PersonalInput 
                value={isPersonalMode ? personalMessage : ''}
                onInputChange={isPersonalMode ? setPersonalMessage : () => {}}
                placeholder={isPersonalMode ? `Message ${selectedUser?.username || 'user'}...` : 'Select a user to message privately'}
                disabled={!isPersonalMode}
              />
            </PersonalInputContainer>
          </TopRow>

          <BottomRow>
            <InputWrapper>
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                onImageChange={handleImageSend}
              />
            </InputWrapper>
            <ButtonContainer onClick={sendMessage}>
              <Button>Send</Button>
            </ButtonContainer>
          </BottomRow>
        </InputContainer>
      </ChatContainer>
    </Container>
  );
};

/* ===== Styles ===== */

const MessageHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 2px;
  flex-direction: ${(props) => (props.$isCurrentUser ? 'row-reverse' : 'row')};
`;

const UserName = styled.span`
  margin: 0 6px;
  font-weight: 600;
  font-size: 0.9em;
  color: ${(props) => (props.$isCurrentUser ? '#4a90e2' : '#333')};
`;

const MessageContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: ${(props) => (props.$isCurrentUser ? 'flex-end' : 'flex-start')};
  width: 100%;
  margin-top: ${(props) => (props.$isSystem ? '4px' : '0')};
`;

const MessageText = styled.div`
  white-space: pre-wrap;
  word-wrap: break-word;
  overflow-wrap: break-word;
  text-align: left;
  line-height: 1.4;
  margin: 0.25em 0;
  padding: 0;
  width: 100%;

  .markdown-content {
    width: 100%;
    text-align: left;

    > * {
      margin: 0.3em 0;
      &:first-child {
        margin-top: 0;
      }
      &:last-child {
        margin-bottom: 0;
      }
    }

    code {
      background: #f0f0f0;
      padding: 0.2em 0.4em;
      border-radius: 3px;
      font-family: 'Courier New', monospace;
      font-size: 0.9em;
    }
  }
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
  background-color: ${(props) => (props.$status === 'connected' ? '#4caf50' : '#f44336')};
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
  min-width: 0;
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

const Container = styled.div`
  display: flex;
  height: 100vh;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: relative;
`;

const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  height: 100%;
`;

const PersonalChatHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  background: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
  font-weight: 500;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 0 8px;
  color: #666;
  
  &:hover {
    color: #333;
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
  background-color: #ffffff;
  gap: 10px;
`;

const Message = styled.div`
  background: ${({ $isUser, $isSystem, $isError }) =>
    $isSystem ? '#e3f2fd' : $isError ? '#ffebee' : $isUser ? '#f5f5dc' : '#f1f1f1'};
  color: ${({ $isUser, $isSystem, $isError }) => ($isError ? '#d32f2f' : $isSystem ? '#1565c0' : 'Black')};
  border: ${({ $isError }) => ($isError ? '1px solid #ffcdd2' : 'none')};
  border-radius: 15px;
  padding: 10px 15px;
  margin: 5px 0;
  max-width: 70%;
  align-self: ${({ $isUser, $isSystem }) => ($isUser || $isSystem) ? 'flex-end' : 'flex-start'};
  position: relative;
  word-break: break-word;
  opacity: ${({ $isSending }) => ($isSending ? 0.7 : 1)};
  transition: opacity 0.3s ease;
`;

export default ChatInterface;
