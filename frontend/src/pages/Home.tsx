import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import SearchBar from '../components/common/SearchBar';
import { useSpotSearch } from '../hooks/useSpotSearch';
import { SpotData } from '../hooks/useSpotData';

const HeroSection = styled.section`
  background: var(--background-gradient);
  padding: 6rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: white;
  min-height: 85vh;
`;

const HeroTitle = styled.h1`
  font-size: 3rem;
  margin-bottom: 1.5rem;
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const HeroSubtitle = styled.p`
  font-size: 1.5rem;
  margin-bottom: 3rem;
  max-width: 800px;
  
  @media (max-width: 768px) {
    font-size: 1.2rem;
  }
`;

const FeaturesSection = styled.section`
  padding: 4rem 2rem;
  background-color: var(--light-background);
`;

const FeaturesContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const FeaturesTitle = styled.h2`
  text-align: center;
  margin-bottom: 3rem;
  font-size: 2rem;
  color: var(--primary-color);
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
`;

const FeatureCard = styled.div`
  background-color: white;
  border-radius: var(--border-radius);
  padding: 2rem;
  box-shadow: var(--box-shadow);
  transition: var(--transition);
`;

const FeatureIcon = styled.div`
  font-size: 2.5rem;
  color: var(--primary-color);
  margin-bottom: 1rem;
`;

const FeatureTitle = styled.h3`
  margin-bottom: 1rem;
  font-size: 1.5rem;
`;

const FeatureDescription = styled.p`
  color: #666;
`;

const SearchResultsContainer = styled.div`
  width: 100%;
  max-width: 600px;
  margin: 2rem auto 0;
  background-color: white;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  overflow: hidden;
  max-height: 400px;
  overflow-y: auto;
`;

const SearchResultsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const SearchResultItem = styled.li`
  padding: 1rem;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: var(--light-background);
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const SpotName = styled.div`
  font-weight: bold;
  color: var(--primary-color);
  margin-bottom: 0.25rem;
`;

const SpotLocation = styled.div`
  font-size: 0.9rem;
  color: #666;
`;

const SpotInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.5rem;
  font-size: 0.9rem;
`;

const SpotRating = styled.div`
  display: flex;
  align-items: center;
`;

const SpotWaveHeight = styled.div`
  color: var(--primary-color);
`;

const NoResults = styled.div`
  padding: 1.5rem;
  text-align: center;
  color: #666;
`;

const LoadingResults = styled.div`
  padding: 1.5rem;
  text-align: center;
  color: var(--primary-color);
`;

const Home: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { results, loading } = useSpotSearch(searchTerm);
  const navigate = useNavigate();
  
  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };
  
  const handleSelectSpot = (spot: SpotData) => {
    navigate(`/spot/${spot.id}`);
  };
  
  // Helper function to render stars
  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    return '★'.repeat(fullStars) + (hasHalfStar ? '½' : '') + '☆'.repeat(5 - fullStars - (hasHalfStar ? 1 : 0));
  };
  
  return (
    <Layout>
      <HeroSection>
        <HeroTitle>Where do you want to surf?</HeroTitle>
        <HeroSubtitle>
          Find the perfect waves for your next surf session with real-time forecasts and spot ratings.
        </HeroSubtitle>
        <SearchBar onSearch={handleSearch} />
        
        {searchTerm && (
          <SearchResultsContainer>
            {loading ? (
              <LoadingResults>Searching for spots...</LoadingResults>
            ) : results.length > 0 ? (
              <SearchResultsList>
                {results.map(spot => (
                  <SearchResultItem key={spot.id} onClick={() => handleSelectSpot(spot)}>
                    <SpotName>{spot.name}</SpotName>
                    <SpotLocation>{spot.location}</SpotLocation>
                    <SpotInfo>
                      <SpotRating>
                        {renderStars(spot.rating)} ({spot.rating})
                      </SpotRating>
                      <SpotWaveHeight>Waves: {spot.waveHeight}</SpotWaveHeight>
                    </SpotInfo>
                  </SearchResultItem>
                ))}
              </SearchResultsList>
            ) : (
              <NoResults>No spots found matching "{searchTerm}"</NoResults>
            )}
          </SearchResultsContainer>
        )}
      </HeroSection>
      
      <FeaturesSection>
        <FeaturesContainer>
          <FeaturesTitle>Why WaveFinder?</FeaturesTitle>
          
          <FeatureGrid>
            <FeatureCard>
              <FeatureIcon>🌊</FeatureIcon>
              <FeatureTitle>Real-time Forecasts</FeatureTitle>
              <FeatureDescription>
                Get accurate, up-to-date surf forecasts for spots around the world.
              </FeatureDescription>
            </FeatureCard>
            
            <FeatureCard>
              <FeatureIcon>⭐</FeatureIcon>
              <FeatureTitle>Spot Ratings</FeatureTitle>
              <FeatureDescription>
                See ratings and reviews from other surfers to find the best spots.
              </FeatureDescription>
            </FeatureCard>
            
            <FeatureCard>
              <FeatureIcon>🗺️</FeatureIcon>
              <FeatureTitle>Interactive Map</FeatureTitle>
              <FeatureDescription>
                Explore surf spots with our interactive map and save your favorites.
              </FeatureDescription>
            </FeatureCard>
          </FeatureGrid>
        </FeaturesContainer>
      </FeaturesSection>
    </Layout>
  );
};

export default Home;
