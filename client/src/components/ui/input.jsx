import React, { useRef } from 'react';
import styled from 'styled-components';
import { FiPaperclip } from 'react-icons/fi';

const Input = ({ value, onChange, onKeyPress, placeholder = 'Type a message...', onImageChange }) => {
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      onImageChange && onImageChange(e.target.files[0]);
    }
  };

  const handlePinClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <StyledWrapper>
      <InputContainer>
        <PinButton onClick={handlePinClick}>
          <FiPaperclip size={20} />
        </PinButton>
        <StyledInput
          type="text"
          value={value}
          onChange={onChange}
          onKeyPress={onKeyPress}
          placeholder={placeholder}
        />
        <HiddenFileInput
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageChange}
        />
      </InputContainer>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  width: 100%;
`;

const InputContainer = styled.div`
  position: relative;
  width: 100%;
`;

const StyledInput = styled.input`
  width: 100%;
  max-width: 100%;
  padding: 0.7rem 1rem 0.7rem 3rem;
  font-size: 1rem;
  border: 2px solid #000;
  box-shadow: 3px 3px 0 #000;
  outline: none;
  transition: all 0.2s ease;
  min-height: 52px;
  box-sizing: border-box;
  background-color: #f5f5dc;
  margin-bottom: 4px;
  
  
`;

const PinButton = styled.button`
  position: absolute;
  left: 0.8rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
  
  &:hover {
    color: #000;
    background-color: rgba(0, 0, 0, 0.05);
  }
  
  &:active {
    transform: translateY(-50%) scale(0.95);
  }
`;

const HiddenFileInput = styled.input`
  display: none;
`;

export default Input;
