import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/landingpage';
import ChatPage from './pages/chatpage';

export const SOCKET_URL = "https://chat-app-server-1-d8us.onrender.com";

const App = () => {
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