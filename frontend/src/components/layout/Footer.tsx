import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const FooterContainer = styled.footer`
  background-color: var(--dark-background);
  color: var(--light-text);
  padding: 1.5rem 2rem 1rem;
`;

const FooterContent = styled.div`
  display: flex;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 2rem;
  }
`;

const FooterSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const FooterHeading = styled.h3`
  font-size: 1.2rem;
  margin-bottom: 0.75rem;
`;

const FooterLink = styled(Link)`
  color: var(--light-text);
  opacity: 0.8;
  transition: var(--transition);
  
  &:hover {
    opacity: 1;
  }
`;

const Copyright = styled.div`
  text-align: center;
  margin-top: 1.25rem;
  padding-top: 0.75rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 0.9rem;
  opacity: 0.7;
`;

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <FooterContainer>
      <FooterContent>
        <FooterSection>
          <FooterHeading>WaveFinder</FooterHeading>
          <p>Find the perfect wave for your next surf session.</p>
        </FooterSection>
        
        <FooterSection>
          <FooterHeading>Links</FooterHeading>
          <FooterLink to="/">Home</FooterLink>
          <FooterLink to="/map">Map</FooterLink>
          <FooterLink to="/saved">Saved Spots</FooterLink>
        </FooterSection>
        
        <FooterSection>
          <FooterHeading>Resources</FooterHeading>
          <FooterLink to="/">About Us</FooterLink>
          <FooterLink to="/">FAQ</FooterLink>
          <FooterLink to="/">Contact</FooterLink>
        </FooterSection>
        
        <FooterSection>
          <FooterHeading>Legal</FooterHeading>
          <FooterLink to="/">Terms of Service</FooterLink>
          <FooterLink to="/">Privacy Policy</FooterLink>
        </FooterSection>
      </FooterContent>
      
      <Copyright>
        &copy; {currentYear} WaveFinder. All rights reserved.
      </Copyright>
    </FooterContainer>
  );
};

export default Footer;
