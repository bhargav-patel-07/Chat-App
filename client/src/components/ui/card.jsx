import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';

const Card = ({ title = 'Code', language = 'javascript', code = '', showLineNumbers = true }) => {
  const [copied, setCopied] = useState(false);
  const codeRef = useRef(null);
  const lines = code.split('\n');

  const handleCopy = () => {
    if (codeRef.current) {
      const textToCopy = codeRef.current.textContent;
      navigator.clipboard.writeText(textToCopy).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };
  return (
    <StyledWrapper>
      <div className="card-container">
        <div className="card">
          <div className="card-header">
            <div className="card-tabs">
              <div className="card-tab active" title={title}>
              {title.length > 10 ? `${title.substring(0, 10)}...` : title}
            </div>
            </div>
          </div>
          <div className="card-body">
            {showLineNumbers && (
              <div className="line-numbers">
                {lines.map((_, i) => (
                  <span key={i}>{i + 1}</span>
                ))}
              </div>
            )}
            <pre className="code-content">
              <code ref={codeRef}>
                {code}
              </code>
            </pre>
          </div>
          <div className="card-footer">
            <span className="language-name">{language}</span>
            <button className="copy-button" onClick={handleCopy}>
              <svg stroke="currentColor" fill="currentColor" strokeWidth={0} viewBox="0 0 16 16" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V2zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H6zM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1H2z" />
              </svg>
              <span className="copy-button-text">{copied ? 'Copied!' : 'Copy to clipboard'}</span>
            </button>
          </div>
        </div>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .card-container {
    width: 380px;
    height: 300px;
    resize: both;
    overflow: hidden;
    background: #c0c0c0;
    border: 2px outset #c0c0c0;
    padding: 2px;
    font-family: "MS Sans Serif", "Tahoma", sans-serif;
    font-size: 11px;
  }

  .card {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    background: #c0c0c0;
    border: 2px inset #c0c0c0;
    overflow: hidden;
    color: #000000;
  }

  .card-header {
    background: #000080;
    padding: 0;
    flex-shrink: 0;
    border-bottom: 1px solid #000000;
  }

  .card-tabs {
    display: flex;
    background: #c0c0c0;
    border-bottom: 1px solid #808080;
    height: 20px;
  }

  .card-tab {
    padding: 2px 8px;
    font-size: 11px;
    color: #000000;
    background: #c0c0c0;
    border: 2px outset #c0c0c0;
    border-bottom: none;
    cursor: pointer;
    height: 18px;
    margin-top: 1px;
  }

  .card-tab.active {
    background: #c0c0c0;
    border: 2px outset #c0c0c0;
    border-bottom: 1px solid #c0c0c0;
    margin-top: 0;
    height: 19px;
    position: relative;
    z-index: 2;
  }

  .card-body {
    display: flex;
    flex-grow: 1;
    overflow: auto;
    padding: 4px 0 4px 2px;
    font-family: "Courier New", monospace;
    font-size: 12px;
    line-height: 1.2;
    background: #ffffff;
    border: 1px inset #808080;
    margin: 2px;
  }

  .line-numbers {
    display: flex;
    flex-direction: column;
    padding: 0 6px;
    text-align: right;
    color: #808080;
    user-select: none;
    font-size: 12px;
    background: #f0f0f0;
    border-right: 1px solid #c0c0c0;
  }

  .code-content {
    margin: 0;
    padding: 0 4px;
    white-space: pre;
    overflow-x: auto;
    color: #000000;
  }

  .code-comment {
    color: #008000;
  }
  .code-keyword {
    color: #0000ff;
    font-weight: bold;
  }
  .code-variable {
    color: #800080;
  }
  .code-variable-2 {
    color: #ff0000;
  }
  .code-function {
    color: #000000;
    font-weight: bold;
  }
  .code-string {
    color: #808080;
  }
  .code-number {
    color: #000000;
  }

  .card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #c0c0c0;
    padding: 2px 4px;
    border-top: 1px solid #808080;
    flex-shrink: 0;
    height: 22px;
  }

  .language-name {
    color: #000000;
    font-weight: normal;
  }

  .copy-button {
    display: flex;
    align-items: center;
    gap: 4px;
    background: #c0c0c0;
    color: #000000;
    border: 2px outset #c0c0c0;
    padding: 0 6px;
    cursor: pointer;
    font-size: 11px;
    height: 18px;
  }

  .copy-button:active {
    border: 2px inset #c0c0c0;
    padding: 1px 5px 0 7px;
  }

  .copy-button svg {
    width: 12px;
    height: 12px;
  }

  .copy-button-text {
    display: none;
  }

  .card-body::-webkit-scrollbar {
    width: 16px;
  }

  .card-body::-webkit-scrollbar-track {
    background: #c0c0c0;
    border: 1px outset #c0c0c0;
  }

  .card-body::-webkit-scrollbar-thumb {
    background: #c0c0c0;
    border: 2px outset #c0c0c0;
  }

  .card-body::-webkit-scrollbar-button {
    display: block;
    height: 16px;
    background: #c0c0c0;
    border: 2px outset #c0c0c0;
  }`;

export default Card;
