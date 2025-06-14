import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { useAuth } from '../context/AuthContext';
import { useSavedSpots } from '../hooks/useSavedSpots';

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
  cursor: pointer;
  
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
  const navigate = useNavigate();
  const { user } = useAuth();
  const { spots, loading, error, unsaveSpot } = useSavedSpots({
    userId: user?.id,
    autoLoad: true
  });
  
  // Convert wind speed from m/s to knots
  const convertToKnots = (speedInMps: number): number => {
    return Math.round(speedInMps * 1.94384);
  };
  
  const handleSpotClick = (spotId: number) => {
    navigate(`/spot/${spotId}`);
  };
  
  const handleUnsaveSpot = async (e: React.MouseEvent, spotId: number) => {
    e.stopPropagation(); // Prevent triggering the card click
    await unsaveSpot(spotId);
  };
  
  if (!user) {
    navigate('/login');
    return null;
  }
  
  return (
    <Layout>
      <SavedSpotsContainer>
        <Title>Your Saved Spots</Title>
        
        {loading ? (
          <LoadingMessage>Loading your saved spots...</LoadingMessage>
        ) : error ? (
          <ErrorMessage>{error}</ErrorMessage>
        ) : spots.length === 0 ? (
          <EmptyState>
            <p>You haven't saved any spots yet. Explore the map to find spots!</p>
            <ExploreButton onClick={() => navigate('/map')}>Explore Map</ExploreButton>
          </EmptyState>
        ) : (
          <SpotGrid>
            {spots.map(spot => (
              <SpotCard 
                key={spot.id} 
                onClick={() => handleSpotClick(spot.id)}
              >
                <SpotImage />
                <SpotContent>
                  <SpotHeader>
                    <SpotName>{spot.name}</SpotName>
                    <UnsaveButton onClick={(e) => handleUnsaveSpot(e, spot.id)}>Unsave</UnsaveButton>
                  </SpotHeader>
                  <SpotLocation>Central California Coast</SpotLocation>
                  <SpotStats>
                    <span>⭐ 0</span>
                    <span>🌊 {spot.current_forecast?.wave_height ? `${spot.current_forecast.wave_height.toFixed(1)} ft` : '0 ft'}</span>
                  </SpotStats>
                  
                  <ForecastSection>
                    <ForecastDay>
                      <ForecastDayName>Today</ForecastDayName>
                      <ForecastData>
                        <div>🌊 {spot.current_forecast?.wave_height ? `${spot.current_forecast.wave_height.toFixed(1)} ft` : '0 ft'}</div>
                        <div>💨 {spot.current_forecast?.wind_speed ? `${convertToKnots(spot.current_forecast.wind_speed)} kts` : '0 kts'}</div>
                      </ForecastData>
                    </ForecastDay>
                    <ForecastDay>
                      <ForecastDayName>Tomorrow</ForecastDayName>
                      <ForecastData>
                        <div>🌊 - ft</div>
                        <div>💨 - kts</div>
                      </ForecastData>
                    </ForecastDay>
                    <ForecastDay>
                      <ForecastDayName>Wed</ForecastDayName>
                      <ForecastData>
                        <div>🌊 - ft</div>
                        <div>💨 - kts</div>
                      </ForecastData>
                    </ForecastDay>
                  </ForecastSection>
                </SpotContent>
              </SpotCard>
            ))}
          </SpotGrid>
        )}
      </SavedSpotsContainer>
    </Layout>
  );
};

const LoadingMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: #666;
`;

const ErrorMessage = styled.div`
  color: #e74c3c;
  padding: 1rem;
  background-color: #fde2e2;
  border-radius: 4px;
  margin-bottom: 1rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  color: #666;
`;

const ExploreButton = styled.button`
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: var(--transition);
  
  &:hover {
    background-color: var(--primary-color-dark);
  }
`;

const SpotHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const UnsaveButton = styled.button`
  background: none;
  border: none;
  color: #e74c3c;
  cursor: pointer;
  font-size: 0.8rem;
  padding: 0.25rem 0.5rem;
  
  &:hover {
    text-decoration: underline;
  }
`;

const ForecastSection = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
  border-top: 1px solid #eee;
  padding-top: 1rem;
`;

const ForecastDay = styled.div`
  flex: 1;
  text-align: center;
`;

const ForecastDayName = styled.div`
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: var(--primary-color);
`;

const ForecastData = styled.div`
  font-size: 0.9rem;
  color: #333;
  
  div {
    margin-bottom: 0.25rem;
  }
`;

export default SavedSpots;
