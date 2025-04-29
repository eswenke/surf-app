import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faGear, faSignOutAlt, faWater } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../context/AuthContext';

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
  width: 280px;
  height: auto;
  background: white;
  box-shadow: -2px 0 8px rgba(0,0,0,0.1);
  transform: translateX(${props => (props.open ? '0' : '100%')});
  transition: transform 0.3s ease;
  z-index: 1000;
  padding: 2rem 1.5rem;
  border-bottom-left-radius: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const MenuOption = styled.div`
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  color: var(--text-color);
  
  &:hover {
    background-color: rgba(0, 112, 243, 0.1);
    color: var(--primary-color);
  }
  
  svg {
    margin-right: 0.75rem;
    color: var(--primary-color);
  }
`;

const Divider = styled.div`
  height: 1px;
  background-color: #eaeaea;
  margin: 0.5rem 0;
`;

const PanelHeader = styled.div`
  font-weight: bold;
  font-size: 1.25rem;
  margin-bottom: 1rem;
  color: var(--primary-color);
`;

const Header: React.FC = () => {
  const [isSidePanelOpen, setIsSidePanelOpen] = React.useState(false);
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    // Auth state change will redirect to login
  };

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
        <PanelHeader>WaveFinder</PanelHeader>
        <MenuOption>
          <FontAwesomeIcon icon={faUser} size="lg" />
          Profile
        </MenuOption>
        <MenuOption>
          <FontAwesomeIcon icon={faWater} size="lg" />
          My Surf Spots
        </MenuOption>
        <MenuOption>
          <FontAwesomeIcon icon={faGear} size="lg" />
          Settings
        </MenuOption>
        <Divider />
        <MenuOption onClick={handleLogout}>
          <FontAwesomeIcon icon={faSignOutAlt} size="lg" />
          Logout
        </MenuOption>
      </SidePanel>

    </HeaderContainer>
  );
};

export default Header;
