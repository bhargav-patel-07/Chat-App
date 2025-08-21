import React from 'react';
import styled from 'styled-components';

const Button = () => {
  return (
    <StyledWrapper>
      <div className="box-button">
        <div className="button"><span>Send</span></div>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .box-button {
    cursor: pointer;
    border: 4px solid black;
    background-color: gray;
    padding-bottom: 10px;
    transition: 0.1s ease-in-out;
    user-select: none;
    transform: scale(1);
    transform-origin: center;
  }

  @media (max-width: 768px) {
    .box-button {
      transform: scale(0.9);
    }
    
    .box-button:active {
      transform: scale(0.85) translateY(5px);
    }
  }

  @media (min-width: 1024px) {
    .box-button:hover {
      transform: scale(1.05);
    }
  }

  .button {
    background-color: #f5f5dc;
    border: 4px solid #fff;
    padding: 3px 8px;
  }

  .button span {
    font-size: 1.2em;
    letter-spacing: 1px;
  }

  .box-button:active {
    padding: 0;
    margin-bottom: 10px;
    transform: scale(0.95) translateY(10px);
  }`;

export default Button;
