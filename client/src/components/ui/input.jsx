import React from 'react';
import styled from 'styled-components';

const Input = ({ value, onChange, onKeyPress, placeholder = 'Type a message...' }) => {
  return (
    <StyledWrapper>
      <input 
        type="text"
        className="input"
        value={value}
        onChange={onChange}
        onKeyPress={onKeyPress}
        placeholder={placeholder}
      />
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .input {
    width: 100%;
    max-width: 100%;
    padding: 0.7rem 1rem;
    font-size: 1rem;
    border: 2px solid #000;
    border-radius: 0.6rem;
    box-shadow: 3px 3px 0 #000;
    outline: none;
    transition: all 0.2s ease;
    min-height: 42px;
    box-sizing: border-box;
    background-color: #f5f5dc;
  }

  .input:focus {
    box-shadow: 6px 8px 0 #000;
    transform: translateY(-2px);
  }
  
  .input:hover {
    transform: translateY(-1px);
    box-shadow: 5px 5px 0 #000;
  }`;

export default Input;
