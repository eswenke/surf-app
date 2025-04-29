import React from 'react';
import styled from 'styled-components';
import Layout from '../components/layout/Layout';
import SearchBar from '../components/common/SearchBar';

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

const Home: React.FC = () => {
  const handleSearch = (searchTerm: string) => {
    console.log('Searching for:', searchTerm);
    // In a real app, you would navigate to search results or filter spots
  };
  
  return (
    <Layout>
      <HeroSection>
        <HeroTitle>Where do you want to surf?</HeroTitle>
        <HeroSubtitle>
          Find the perfect waves for your next surf session with real-time forecasts and spot ratings.
        </HeroSubtitle>
        <SearchBar onSearch={handleSearch} />
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
