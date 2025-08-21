import React from 'react';
import styled from 'styled-components';

const AvatarContainer = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: ${props => props.$isAI ? 'transparent' : (props.color || '#4a90e2')};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 400;
  font-size: 16px;
  margin-right: 10px;
  flex-shrink: 0;
  overflow: hidden;
  
  img {
    width: 80%;
    height: 80%;
    object-fit: contain;
    margin: auto;
  }
`;

const Avatar = ({ name, color, className, isAI = false }) => {
  // Don't render anything for system messages
  if (name === 'system') return null;

  // Check if this is an AI avatar
  const isAIBot = isAI || (name && name.toLowerCase() === 'ai');

  if (isAIBot) {
    return (
      <AvatarContainer $isAI={true} className={className}>
        <img src="/chat.png" alt="AI Assistant" />
      </AvatarContainer>
    );
  }

  // Get initials from name for regular users
  const getInitials = (fullName) => {
    if (!fullName) return 'U';
    const names = fullName.split(' ');
    return names
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <AvatarContainer color={color} className={className}>
      {getInitials(name)}
    </AvatarContainer>
  );
};

export default Avatar;
