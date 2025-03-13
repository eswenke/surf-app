import React from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import Layout from '../components/layout/Layout';

const SpotContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const SpotHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
`;

const SpotTitle = styled.h1`
  color: var(--primary-color);
`;

const SpotRating = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.2rem;
`;

const SpotLocation = styled.p`
  color: #666;
  font-size: 1.2rem;
  margin-bottom: 2rem;
`;

const SpotContent = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const SpotImage = styled.div`
  height: 400px;
  background-color: var(--secondary-color);
  border-radius: var(--border-radius);
  margin-bottom: 2rem;
`;

const SpotDescription = styled.div`
  margin-bottom: 2rem;
`;

const ForecastSection = styled.div`
  background-color: white;
  border-radius: var(--border-radius);
  padding: 1.5rem;
  box-shadow: var(--box-shadow);
`;

const ForecastTitle = styled.h3`
  margin-bottom: 1rem;
  color: var(--primary-color);
`;

const ForecastGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1rem;
`;

const ForecastCard = styled.div`
  text-align: center;
  padding: 1rem;
  background-color: var(--light-background);
  border-radius: var(--border-radius);
`;

const ForecastDay = styled.div`
  font-weight: bold;
  margin-bottom: 0.5rem;
`;

const ForecastWave = styled.div`
  font-size: 1.2rem;
  color: var(--primary-color);
  margin-bottom: 0.5rem;
`;

const RatingsSection = styled.div`
  background-color: white;
  border-radius: var(--border-radius);
  padding: 1.5rem;
  box-shadow: var(--box-shadow);
`;

const RatingsTitle = styled.h3`
  margin-bottom: 1rem;
  color: var(--primary-color);
`;

const SpotDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  // In a real app, you would fetch spot details based on the ID
  const spotDetails = {
    id: id,
    name: 'Malibu Beach',
    location: 'California, USA',
    rating: 4.5,
    description: 'Malibu Beach is a world-famous surf spot known for its perfect right-hand point break. It offers consistent waves that are great for longboarding and is suitable for surfers of all levels.',
    forecast: [
      { day: 'Today', waveHeight: '3-4ft', wind: '5mph' },
      { day: 'Tomorrow', waveHeight: '2-3ft', wind: '8mph' },
      { day: 'Wed', waveHeight: '4-5ft', wind: '3mph' },
      { day: 'Thu', waveHeight: '3-4ft', wind: '6mph' },
      { day: 'Fri', waveHeight: '2-3ft', wind: '7mph' }
    ]
  };
  
  return (
    <Layout>
      <SpotContainer>
        <SpotHeader>
          <SpotTitle>{spotDetails.name}</SpotTitle>
          <SpotRating>
            <span>⭐</span>
            <span>{spotDetails.rating}/5</span>
          </SpotRating>
        </SpotHeader>
        
        <SpotLocation>{spotDetails.location}</SpotLocation>
        
        <SpotContent>
          <div>
            <SpotImage />
            
            <SpotDescription>
              <h2>About this spot</h2>
              <p>{spotDetails.description}</p>
            </SpotDescription>
            
            <ForecastSection>
              <ForecastTitle>Forecast</ForecastTitle>
              <ForecastGrid>
                {spotDetails.forecast.map((day, index) => (
                  <ForecastCard key={index}>
                    <ForecastDay>{day.day}</ForecastDay>
                    <ForecastWave>{day.waveHeight}</ForecastWave>
                    <div>Wind: {day.wind}</div>
                  </ForecastCard>
                ))}
              </ForecastGrid>
            </ForecastSection>
          </div>
          
          <div>
            <RatingsSection>
              <RatingsTitle>Ratings & Reviews</RatingsTitle>
              <p>This section will display user ratings and reviews for this surf spot.</p>
            </RatingsSection>
          </div>
        </SpotContent>
      </SpotContainer>
    </Layout>
  );
};

export default SpotDetails;
