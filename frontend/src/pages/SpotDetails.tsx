import React from 'react';
import { useParams, Link } from 'react-router-dom';
import styled from 'styled-components';
import Layout from '../components/layout/Layout';
import { useSpotData } from '../hooks/useSpotData';
import { useSpotReviews } from '../hooks/useSpotReviews';

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

interface Review {
  id: number;
  user_id: string;
  created_at: string;
  rating: number;
  comment: string;
  wave_height: string;
  wind_condition: string;
  weather_condition: string;
  crowd_level: string;
}

const SpotDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  // Parse the ID from the URL to get the numeric spot ID for useSpotData
  const numericId = id ? parseInt(id, 10) : undefined;
  const { spot, loading: spotLoading, error: spotError } = useSpotData(numericId);
  
  // Get the numeric spot ID
  const spotId = id ? parseInt(id, 10) : undefined;
  
  // Fetch reviews for this spot (limited to 2 for the preview)
  const { 
    reviews, 
    loading: reviewsLoading, 
    error: reviewsError 
  } = useSpotReviews({ 
    spotId, 
    limit: 2, 
    autoLoad: true 
  });
  
  const loading = spotLoading || reviewsLoading;
  const error = spotError || reviewsError;
  
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
            <span>{spot.difficulty ? `${spot.difficulty}/5` : 'Not rated'}</span>
          </SpotRating>
        </SpotHeader>
        
        <SpotContent>
          <div>
            <SpotImage />
            
            <SpotDescription>
              <h2>About this spot</h2>
              <p>{spot.description}</p>
            </SpotDescription>
            
            <ForecastSection>
              <ForecastTitle>Current Conditions</ForecastTitle>
              <div>
                {spot.waveHeight ? (
                  <ForecastCard>
                    <ForecastDay>Today</ForecastDay>
                    <ForecastWave>Wave Height: {spot.waveHeight}</ForecastWave>
                  </ForecastCard>
                ) : (
                  <p>No current wave data available</p>
                )}
              </div>
            </ForecastSection>
          </div>
          
          <div>
            <RatingsSection>
              <RatingsTitle>
                Ratings & Reviews
                <ViewAllLink to={`/spot/${id}/reviews`}>View all →</ViewAllLink>
              </RatingsTitle>
              
              {reviews && reviews.length > 0 ? (
                <div>
                  {reviews.map(review => (
                    <ReviewPreview key={review.id}>
                      <ReviewerInfo>
                        <ReviewerName>{review.user_id}</ReviewerName>
                        <ReviewDate>{new Date(review.created_at).toLocaleDateString()}</ReviewDate>
                      </ReviewerInfo>
                      <StarsDisplay>{renderStars(review.rating)}</StarsDisplay>
                      <p>{review.comment}</p>
                      {(review.wave_height || review.wind_condition || 
                        review.weather_condition || review.crowd_level) && (
                        <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '8px' }}>
                          {review.wave_height && <span>Waves: {review.wave_height}ft </span>}
                          {review.wind_condition && <span>• Wind: {review.wind_condition} </span>}
                          {review.weather_condition && <span>• Weather: {review.weather_condition} </span>}
                          {review.crowd_level && <span>• Crowd: {review.crowd_level}/5</span>}
                        </div>
                      )}
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
