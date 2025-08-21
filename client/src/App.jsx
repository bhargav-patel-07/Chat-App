import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useParams } from 'react-router-dom';
import io from 'socket.io-client';
import LandingPage from './pages/landingpage';
import ChatPage from './pages/chatpage';
import config from './config';

const App = () => {
  const [messages, setMessages] = React.useState([]);

  useEffect(() => {
    const socket = io(config.wsUrl, {
      transports: ['websocket'],
      secure: true,
      path: '/socket.io/'
    });    
    // Client-side connection event
    socket.on("connect", () => {
      console.log("Connected to server with id:", socket.id);
    });

    // Listen for welcome message from server
    socket.on('Welcome', (message) => {
      setMessages(prev => [...prev, { text: message, type: 'system' }]);
    });

    // Listen for user joined/left messages
    socket.on('userJoined', (message) => {
      setMessages(prev => [...prev, { text: message, type: 'notification' }]);
    });

    socket.on('userLeft', (message) => {
      setMessages(prev => [...prev, { text: message, type: 'notification' }]);
    });

    // Cleanup function to disconnect socket when component unmounts
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/:chatId/:username" element={<ChatPage />} />
      </Routes>
    </Router>
  );
};

export default App;