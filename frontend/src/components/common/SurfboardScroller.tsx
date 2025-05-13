import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

interface SurfboardScrollerProps {
  scrollToTop?: boolean;
  scrollToBottom?: boolean;
  showAtHeight?: number;
}

// Surfboard shape container
const SurfboardContainer = styled.div`
  position: fixed;
  right: 30px;
  bottom: 30px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  z-index: 100;
`;

// Surfboard button for scrolling up
const SurfboardUp = styled.button`
  width: 45px;
  height: 90px;
  background-color: var(--primary-color);
  border: none;
  cursor: pointer;
  position: relative;
  border-radius: 22px;
  transform: rotate(180deg);
  transition: transform 0.2s ease, background-color 0.2s ease;
  
  &:hover {
    background-color: #0095c8;
    transform: rotate(180deg) translateY(-5px);
  }
  
  /* Surfboard fin */
  &::after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 50%;
    transform: translateX(-50%);
    width: 12px;
    height: 18px;
    background-color: inherit;
    border-radius: 0 0 8px 8px;
  }
  
  /* Surfboard stringer */
  &::before {
    content: '';
    position: absolute;
    top: 8px;
    left: 50%;
    transform: translateX(-50%);
    width: 2px;
    height: 75px;
    background-color: rgba(255, 255, 255, 0.7);
  }
`;

// Surfboard button for scrolling down
const SurfboardDown = styled(SurfboardUp)`
  transform: rotate(0deg);
  
  &:hover {
    transform: translateY(-5px);
  }
`;

// Wave animation
const WaveIndicator = styled.div`
  width: 30px;
  height: 8px;
  position: relative;
  margin-top: 3px;
  
  &::before, &::after {
    content: '';
    position: absolute;
    height: 3px;
    width: 100%;
    background: var(--primary-color);
    border-radius: 3px;
    animation: wave 1.5s infinite ease-in-out;
  }
  
  &::after {
    top: 5px;
    animation-delay: 0.2s;
  }
  
  @keyframes wave {
    0%, 100% {
      transform: translateX(0);
    }
    50% {
      transform: translateX(5px);
    }
  }
`;

const SurfboardScroller: React.FC<SurfboardScrollerProps> = ({ 
  scrollToTop = true, 
  scrollToBottom = true,
  showAtHeight = 300 // This prop is now unused but kept for API compatibility
}) => {
  
  // Scroll to top function
  const handleScrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  
  // Scroll to bottom function
  const handleScrollToBottom = () => {
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: 'smooth'
    });
  };
  
  return (
    <SurfboardContainer>
      {scrollToTop && (
        <SurfboardUp 
          onClick={handleScrollToTop} 
          aria-label="Scroll to top"
          title="Scroll to top"
        />
      )}
      
      {scrollToBottom && (
        <>
          <WaveIndicator />
          <SurfboardDown 
            onClick={handleScrollToBottom} 
            aria-label="Scroll to bottom"
            title="Scroll to bottom"
          />
        </>
      )}
    </SurfboardContainer>
  );
};

export default SurfboardScroller;
