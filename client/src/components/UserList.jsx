import React from 'react';
import styled from 'styled-components';
import { Copy } from 'lucide-react';

const UserListContainer = styled.div`
  width: 20%;
  height: 100%;
  background: #f5f5f5;
  border-left: 1px solid #ddd;
  padding: 10px;
  overflow-y: auto;
`;

const UserItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  margin: 4px 0;
  background: white;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  cursor: pointer;
  
  &:hover {
    background: #f0f0f0;
  }
`;

const UserName = styled.span`
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const CopyButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  padding: 4px;
  border-radius: 4px;
  
  &:hover {
    background: #e0e0e0;
    color: #333;
  }
`;

const UserList = ({ users, currentUser, onUserSelect }) => {
  const handleCopy = (userId, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(userId);
    // Optional: Show a toast notification
  };

  return (
    <UserListContainer>
      <h3>Online Users ({users.length})</h3>
      {users
        .filter(user => user.socketId !== currentUser.socketId)
        .map(user => (
          <UserItem 
            key={user.socketId} 
            onClick={() => onUserSelect(user.socketId)}
          >
            <UserName>{user.username}</UserName>
            <CopyButton 
              onClick={(e) => handleCopy(user.socketId, e)}
              title="Copy User ID"
            >
              <Copy size={16} />
            </CopyButton>
          </UserItem>
        ))}
    </UserListContainer>
  );
};

export default UserList;
