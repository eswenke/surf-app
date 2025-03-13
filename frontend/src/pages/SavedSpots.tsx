import React from 'react';
import styled from 'styled-components';
import Layout from '../components/layout/Layout';

const SavedSpotsContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const Title = styled.h1`
  color: var(--primary-color);
  margin-bottom: 2rem;
`;

const SpotGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
`;

const SpotCard = styled.div`
  background-color: white;
  border-radius: var(--border-radius);
  overflow: hidden;
  box-shadow: var(--box-shadow);
  transition: var(--transition);
  
  &:hover {
    transform: translateY(-5px);
  }
`;

const SpotImage = styled.div`
  height: 200px;
  background-color: var(--secondary-color);
  background-size: cover;
  background-position: center;
`;

const SpotContent = styled.div`
  padding: 1.5rem;
`;

const SpotName = styled.h3`
  margin-bottom: 0.5rem;
`;

const SpotLocation = styled.p`
  color: #666;
  margin-bottom: 1rem;
`;

const SpotStats = styled.div`
  display: flex;
  justify-content: space-between;
  color: var(--primary-color);
  font-weight: bold;
`;

const SavedSpots: React.FC = () => {
  // This would be fetched from an API in a real app
  const mockSavedSpots = [
    {
      id: 1,
      name: 'Malibu Beach',
      location: 'California, USA',
      rating: 4.5,
      waveHeight: '3-4ft'
    },
    {
      id: 2,
      name: 'Pipeline',
      location: 'Oahu, Hawaii',
      rating: 5.0,
      waveHeight: '6-8ft'
    },
    {
      id: 3,
      name: 'Bells Beach',
      location: 'Victoria, Australia',
      rating: 4.2,
      waveHeight: '4-5ft'
    }
  ];
  
  return (
    <Layout>
      <SavedSpotsContainer>
        <Title>Your Saved Spots</Title>
        
        {mockSavedSpots.length === 0 ? (
          <p>You haven't saved any spots yet. Explore the map to find spots!</p>
        ) : (
          <SpotGrid>
            {mockSavedSpots.map(spot => (
              <SpotCard key={spot.id}>
                <SpotImage />
                <SpotContent>
                  <SpotName>{spot.name}</SpotName>
                  <SpotLocation>{spot.location}</SpotLocation>
                  <SpotStats>
                    <span>⭐ {spot.rating}</span>
                    <span>🌊 {spot.waveHeight}</span>
                  </SpotStats>
                </SpotContent>
              </SpotCard>
            ))}
          </SpotGrid>
        )}
      </SavedSpotsContainer>
    </Layout>
  );
};

export default SavedSpots;
