import React from 'react';
import styled from 'styled-components';

const Input = () => {
  return (
    <StyledWrapper>
      <div className="group">
        <input required type="text" className="input" placeholder=" " />
        <span className="highlight" />
        <span className="bar" />
        <label>Username [For Personal texting]</label>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .group {
    position: relative;
  }

  .input {
    font-size: 17px;
    padding: 10px 10px 10px 5px;
    display: block;
    width: 230px;
    border: none;
    border-bottom: 1px solid #515151;
    background: #f5f5dc;
  }

  .input:focus {
    outline: none;
  }

  label {
    color: #999;
    font-size: 15px;
    font-weight: normal;
    position: absolute;
    pointer-events: none;
    left: 0px;
    top: 10px;
    transition: 0.2s ease;
  }

  /* 🔹 Use ~ because label is not directly after input */
  .input:focus ~ label {
    opacity: 0;
    visibility: hidden;
  }

  .input:not(:placeholder-shown) ~ label {
    opacity: 0;
    visibility: hidden;
  }

  .bar {
    position: relative;
    display: block;
    width: 230px;
  }

  .highlight {
    position: absolute;
    height: 60%;
    width: 100px;
    top: 25%;
    left: 0;
    pointer-events: none;
    opacity: 0.5;
  }
`;

export default Input;
