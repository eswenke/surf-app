import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

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
`;

const NavLink = styled(Link)`
  color: var(--text-color);
  font-weight: 500;
  transition: var(--transition);
  
  &:hover {
    color: var(--primary-color);
  }
`;

const ProfileIcon = styled(Link)`
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

const Header: React.FC = () => {
  return (
    <HeaderContainer>
      <Logo to="/">WaveFinder</Logo>
      
      <NavLinks>
        <NavLink to="/saved">Saved Spots</NavLink>
        <NavLink to="/map">Map</NavLink>
      </NavLinks>
      
      <ProfileIcon to="/profile">
        <i className="fa fa-user"></i>
      </ProfileIcon>
    </HeaderContainer>
  );
};

export default Header;
