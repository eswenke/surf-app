import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';

const HeaderContainer = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Logo = styled(Link)`
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--primary-color);
`;

const NavLinks = styled.div`
  display: flex;
  gap: 2rem;
  margin-left: auto;
  margin-right: 2rem;
`;

const NavLink = styled(Link)`
  color: var(--text-color);
  font-weight: 500;
  transition: var(--transition);
  
  &:hover {
    color: var(--primary-color);
  }
`;

const ProfileIcon = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: var(--primary-color);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  
  &:hover {
    background-color: var(--dark-background);
  }
`;

const SidePanel = styled.div<{ open: boolean }>`
  position: fixed;
  top: 0;
  right: 0;
  width: 300px;
  height: 50vh;
  background: white;
  box-shadow: -2px 0 8px rgba(0,0,0,0.1);
  transform: translateX(${props => (props.open ? '0' : '100%')});
  transition: transform 0.3s ease;
  z-index: 1000;
  padding: 2rem 1rem;
  border-bottom-left-radius: 2rem;
`;

const Header: React.FC = () => {
  const [isSidePanelOpen, setIsSidePanelOpen] = React.useState(false);

  return (
    <HeaderContainer>
      <Logo to="/">WaveFinder</Logo>
      
      <NavLinks>
        <NavLink to="/saved">Saved Spots</NavLink>
        <NavLink to="/map">Map</NavLink>
      </NavLinks>

      <ProfileIcon as="button" onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}>
        <FontAwesomeIcon icon={faUser} size="lg" />
      </ProfileIcon>

      {/* Overlay for closing the panel when clicking outside */}
      {isSidePanelOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.2)',
            zIndex: 999,
          }}
          onClick={() => setIsSidePanelOpen(false)}
        />
      )}

      {/* The side panel itself */}
      <SidePanel open={isSidePanelOpen}>
        {/* Add your side panel content here */}
        <div>User Profile Panel</div>
        <div>Settings</div>
        <div>Logout</div>
      </SidePanel>

    </HeaderContainer>
  );
};

export default Header;
