import React from 'react';
import { useParams } from 'react-router-dom';
import ChatInterface from '../components/chatinterface';

const ChatPage = () => {
    const { chatId, username } = useParams();
    
    if (!chatId || !username) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                flexDirection: 'column',
                gap: '1rem',
                textAlign: 'center',
                padding: '1rem'
            }}>
                <h2>Missing Information</h2>
                <p>Please make sure you're accessing this page with both a username and chat ID in the URL.</p>
                <p>Example: http://localhost:5173/room123/JohnDoe</p>
            </div>
        );
    }

    return <ChatInterface username={username} chatId={chatId} />;
};

export default ChatPage;
