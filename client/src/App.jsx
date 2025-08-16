import React, { useEffect } from "react";
import { io } from "socket.io-client";
import LandingPage from "./pages/landingpage";

const App = () => {
  const [messages, setMessages] = React.useState([]);

  useEffect(() => {
    const socket = io("http://localhost:3000");
    
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
         <div>
            <LandingPage/>
         </div>
 );
};

export default App;