import React, { useState } from 'react';
import styled from 'styled-components';

const SearchContainer = styled.div`
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
`;

const SearchForm = styled.form`
  display: flex;
  box-shadow: var(--box-shadow);
  border-radius: var(--border-radius);
  overflow: hidden;
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 1rem;
  border: none;
  font-size: 1rem;
  
  &:focus {
    outline: none;
  }
`;

const SearchButton = styled.button`
  padding: 1rem 1.5rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  cursor: pointer;
  transition: var(--transition);
  
  &:hover {
    background-color: var(--dark-background);
  }
`;

interface SearchBarProps {
  onSearch?: (searchTerm: string) => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  onSearch, 
  placeholder = "Search for surf spots..." 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && searchTerm.trim()) {
      onSearch(searchTerm);
    }
  };
  
  return (
    <SearchContainer>
      <SearchForm onSubmit={handleSubmit}>
        <SearchInput
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={placeholder}
        />
        <SearchButton type="submit">
          Search
        </SearchButton>
      </SearchForm>
    </SearchContainer>
  );
};

export default SearchBar;
