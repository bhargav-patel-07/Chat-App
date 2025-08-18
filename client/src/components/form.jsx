import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaGithub, FaLinkedin, FaTwitter, FaUser, FaEnvelope } from 'react-icons/fa';

const Form = () => {
  const [username, setUsername] = useState('');
  const [chatId, setChatId] = useState('');
  const navigate = useNavigate();
  

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim() && chatId.trim()) {
      navigate(`/${chatId.trim()}/${username.trim()}`);
    }
  };

  return (
    <PageContainer>
      <Header>
        <LogoContainer>
          <LogoImage src="/chat.png" alt="Chat Logo" />
          <LogoText>ChatApp</LogoText>
        </LogoContainer>
      </Header>

      <FormContainer>
        <StyledForm onSubmit={handleSubmit}>
          <div className="title">Welcome,<br /><span>Create or join a Room</span></div>
          <input 
            type="text" 
            placeholder="Username" 
            name="username" 
            className="input" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input 
            type="text" 
            placeholder="Chat ID" 
            name="chatid" 
            className="input" 
            value={chatId}
            onChange={(e) => setChatId(e.target.value)}
            required
          />
          <button type="submit" className="button-confirm">Let's go →</button>
        </StyledForm>
      </FormContainer>

      <Footer>
      <div className='developer-text'>Developer's Profiles</div>
        <SocialIcons>
          <a href="https://github.com/yourusername" target="_blank" rel="noopener noreferrer"><FaGithub /></a>
          <a href="https://linkedin.com/in/yourusername" target="_blank" rel="noopener noreferrer"><FaLinkedin /></a>
          <a href="https://github.com/yourusername" target="_blank" rel="noopener noreferrer"><FaUser /></a>
          <a href="mailto:bhargavpatel07100@gmail.com" target="_blank" rel="noopener noreferrer"><FaEnvelope/></a>
          <a href="https://twitter.com/yourusername" target="_blank" rel="noopener noreferrer"><FaTwitter /></a>
        </SocialIcons>
      </Footer>
    </PageContainer>
  );
};

const PageContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #e8e8e8;
  padding: 0;
  margin: 0;
  width: 100%;
  box-sizing: border-box;
  position: relative;
  overflow-x: hidden;
`;

const Header = styled.header`
  background-color: #e8e8e8;
  padding: 1rem 0;
  text-align: center;
  border-bottom: 1px solid #e0e0e0;
  width: 100%;
  box-sizing: border-box;
`;

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
`;

const LogoImage = styled.img`
  width: 40px;
  height: 40px;
`;

const LogoText = styled.h1`
  font-size: clamp(1.5rem, 5vw, 2rem);
  color: #333;
  margin: 0;
  white-space: nowrap;
`;

const FormContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
  padding: 1rem;
  width: 100%;
  min-height: calc(100vh - 200px); /* Adjust based on header/footer height */
  box-sizing: border-box;
`;

const StyledForm = styled.form`
    --input-focus: #2d8cf0;
    --font-color: #323232;
    --font-color-sub: #666;
    --bg-color: #fff;
    --main-color: #323232;
    padding: 1.5rem;
    background: lightgrey;
    width: 100%;
    max-width: 420px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    gap: 20px;
    border-radius: 5px;
    border: 2px solid var(--main-color);
    box-shadow: 4px 4px var(--main-color);

  .title {
    color: var(--font-color);
    font-weight: 900;
    font-size: clamp(1.25rem, 5vw, 1.5rem);
    margin-bottom: 1.5rem;
    text-align: center;
    
    span {
      display: block;
      margin-top: 0.5rem;
      font-size: 0.9em;
    }
  }

  .title span {
    color: var(--font-color-sub);
    font-weight: 600;
    font-size: 17px;
  }

  .input {
    width: 100%;
    max-width: 100%;
    height: 50px;
    padding: 0.5rem 1rem;
    border-radius: 5px;
    border: 2px solid var(--main-color);
    background-color: #f5f5dc;
    box-shadow: 4px 4px var(--main-color);
    font-size: 15px;
    font-weight: 600;
    color: var(--font-color);
    padding: 5px 15px;
    outline: none;
    margin: 10px 0;
  }

  .input::placeholder {
    color: var(--font-color-sub);
    opacity: 0.8;
  }

  .input:focus {
    border: 2px solid var(--input-focus);
  }

  .login-with {
    display: flex;
    gap: 20px;
  }

  .button-log {
    cursor: pointer;
    width: 40px;
    height: 40px;
    border-radius: 100%;
    border: 2px solid var(--main-color);
    background-color: #f5f5dc;
    box-shadow: 4px 4px var(--main-color);
    color: var(--font-color);
    font-size: 25px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .icon {
    width: 24px;
    height: 24px;
    fill: var(--main-color);
  }

  .button-log:active, .button-confirm:active {
    box-shadow: 0px 0px var(--main-color);
    transform: translate(3px, 3px);
  }

  .button-confirm {
    margin: 1.5rem auto 0;
    width: 100%;
    max-width: 200px;
    height: 50px;
    border-radius: 5px;
    border: 2px solid var(--main-color);
    background-color: #f5f5dc;
    box-shadow: 4px 4px var(--main-color);
    font-size: 17px;
    font-weight: 600;
    color: var(--font-color);
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover {
      background-color: #f0f0f0;
      transform: translateY(-2px);
    }
  }
  
  @media (max-width: 480px) {
    padding: 15px;
    width: 100%;
    max-width: 320px;
  }
`;

const Footer = styled.footer`
  background-color: #e8e8e8;
  padding: 1.5rem 0;
  text-align: center;
  border-top: 1px solid #e0e0e0;
  
  .developer-text {
    margin-bottom: 1.5rem;
    font-weight: 500;
    color: #555;
    font-size: clamp(0.9rem, 3vw, 1rem);
  }
`;

const SocialIcons = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 1rem;
  margin: 0 auto 1rem;
  max-width: 400px;
  
  a {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background: #f5f5dc;
    border-radius: 50%;
    color: #555;
    font-size: 1.2rem;
    transition: all 0.3s ease;
    text-decoration: none;
    border: 2px solid #323232;
    box-shadow: 4px 4px 0 #323232;
    
    &:hover {
      background: #323232;
      color: #f5f5dc;
      transform: translate(2px, 2px);
      box-shadow: 2px 2px 0 #323232;
    }
    
    svg {
      width: 20px;
      height: 20px;
    }
  }
`;

const Copyright = styled.p`
  color: #777;
  font-size: 0.9rem;
  margin: 0;
`;

export default Form;
