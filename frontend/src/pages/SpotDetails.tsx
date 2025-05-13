import React from 'react';
import { useParams, Link } from 'react-router-dom';
import styled from 'styled-components';
import Layout from '../components/layout/Layout';
import { useSpotData } from '../hooks/useSpotData';

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
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ReviewPreview = styled.div`
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
  
  &:last-child {
    margin-bottom: 0;
    padding-bottom: 0;
    border-bottom: none;
  }
`;

const ReviewerInfo = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
`;

const ReviewerName = styled.span`
  font-weight: bold;
`;

const ReviewDate = styled.span`
  color: #666;
`;

const StarsDisplay = styled.div`
  color: #f1c40f;
  margin-bottom: 0.5rem;
`;

const ViewAllLink = styled(Link)`
  font-size: 0.9rem;
  color: var(--primary-color);
  text-decoration: none;
  display: flex;
  align-items: center;
  
  &:hover {
    text-decoration: underline;
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 3rem;
  font-size: 1.2rem;
  color: var(--primary-color);
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: 3rem;
  font-size: 1.2rem;
  color: #e74c3c;
`;

// Mock reviews data - in a real app, this would come from an API
interface SurfConditions {
  waveHeight: string;
  wind: string;
  weather: string;
  crowdLevel: string;
}

interface Review {
  id: number;
  reviewerName: string;
  date: string;
  rating: number;
  comment: string;
  conditions: SurfConditions;
}

const mockReviews: Record<number, Review[]> = {
  1: [ // Malibu Beach reviews
    {
      id: 101,
      reviewerName: 'Sarah J.',
      date: '2025-04-28',
      rating: 5,
      comment: 'Perfect day at Malibu! The waves were clean and consistent, great for longboarding.',
      conditions: {
        waveHeight: '3-4ft',
        wind: 'Light offshore',
        weather: 'Sunny',
        crowdLevel: 'Moderate'
      }
    },
    {
      id: 102,
      reviewerName: 'Mike T.',
      date: '2025-04-15',
      rating: 4,
      comment: 'Good session today. Waves were a bit smaller than forecast but still fun.',
      conditions: {
        waveHeight: '2-3ft',
        wind: 'Calm',
        weather: 'Partly cloudy',
        crowdLevel: 'Light'
      }
    }
  ],
  2: [ // Pipeline reviews
    {
      id: 201,
      reviewerName: 'Jason K.',
      date: '2025-05-01',
      rating: 5,
      comment: 'Epic day at Pipe! Solid 8ft barrels and only a few locals out.',
      conditions: {
        waveHeight: '6-8ft',
        wind: 'Light offshore',
        weather: 'Sunny',
        crowdLevel: 'Light'
      }
    },
    {
      id: 202,
      reviewerName: 'Kai L.',
      date: '2025-04-22',
      rating: 4,
      comment: 'Pipe was firing today but super sketchy on the inside.',
      conditions: {
        waveHeight: '7-9ft',
        wind: 'Offshore',
        weather: 'Clear',
        crowdLevel: 'Moderate'
      }
    }
  ],
  3: [ // Bells Beach reviews
    {
      id: 301,
      reviewerName: 'Tom B.',
      date: '2025-05-03',
      rating: 5,
      comment: 'Classic Bells today! Perfect right-handers with plenty of wall to work with.',
      conditions: {
        waveHeight: '4-5ft',
        wind: 'Offshore',
        weather: 'Clear',
        crowdLevel: 'Moderate'
      }
    },
    {
      id: 302,
      reviewerName: 'Mick F.',
      date: '2025-04-25',
      rating: 4,
      comment: 'Good day at Bells but the wind picked up mid-session.',
      conditions: {
        waveHeight: '5-6ft',
        wind: 'Light to moderate cross-shore',
        weather: 'Partly cloudy',
        crowdLevel: 'Moderate'
      }
    }
  ]
};

const SpotDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { spot, loading, error } = useSpotData(id);
  
  // helper function to render stars
  const renderStars = (rating: number) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };
  
  if (loading) {
    return (
      <Layout>
        <LoadingMessage>Loading spot details...</LoadingMessage>
      </Layout>
    );
  }
  
  if (error || !spot) {
    return (
      <Layout>
        <ErrorMessage>
          {error || 'Spot not found. Please try another spot.'}
        </ErrorMessage>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <SpotContainer>
        <SpotHeader>
          <SpotTitle>{spot.name}</SpotTitle>
          <SpotRating>
            <span>⭐</span>
            <span>{spot.rating}/5</span>
          </SpotRating>
        </SpotHeader>
        
        <SpotLocation>{spot.location}</SpotLocation>
        
        <SpotContent>
          <div>
            <SpotImage />
            
            <SpotDescription>
              <h2>About this spot</h2>
              <p>{spot.description}</p>
            </SpotDescription>
            
            <ForecastSection>
              <ForecastTitle>Forecast</ForecastTitle>
              <ForecastGrid>
                {spot.forecast.map((day, index) => (
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
              <RatingsTitle>
                Ratings & Reviews
                <ViewAllLink to={`/spot/${id}/reviews`}>View all →</ViewAllLink>
              </RatingsTitle>
              
              {mockReviews[Number(id)] && mockReviews[Number(id)].length > 0 ? (
                <div>
                  {mockReviews[Number(id)].slice(0, 2).map(review => (
                    <ReviewPreview key={review.id}>
                      <ReviewerInfo>
                        <ReviewerName>{review.reviewerName}</ReviewerName>
                        <ReviewDate>{review.date}</ReviewDate>
                      </ReviewerInfo>
                      <StarsDisplay>{renderStars(review.rating)}</StarsDisplay>
                      <p>{review.comment}</p>
                    </ReviewPreview>
                  ))}
                </div>
              ) : (
                <p>No reviews yet for this spot. Be the first to leave a review!</p>
              )}
            </RatingsSection>
          </div>
        </SpotContent>
      </SpotContainer>
    </Layout>
  );
};

export default SpotDetails;
