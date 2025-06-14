import React, { useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import styled from 'styled-components';
import Layout from '../components/layout/Layout';
import { useSpotData } from '../hooks/useSpotData';
import { useReviews } from '../hooks/useReviews';
import { useUserProfile } from '../hooks/useUserProfile';
import { useAuth } from '../context/AuthContext';
import ReviewList from '../components/reviews/ReviewList';
import ReviewForm from '../components/reviews/ReviewForm';
import { ReviewCreate, ReviewUpdate } from '../services/api';


// Styled components
const ReviewsContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const ReviewsHeader = styled.div`
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

const BackLink = styled(Link)`
  color: var(--primary-color);
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    text-decoration: underline;
  }
`;

const SpotTitle = styled.h1`
  color: var(--primary-color);
`;

const ReviewsOverview = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const AverageRating = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: var(--primary-color);
`;

const RatingCount = styled.div`
  color: #666;
`;

const FormSection = styled.div`
  margin-bottom: 2rem;
`;

const AddReviewButton = styled.button`
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: var(--primary-dark);
  }
`;

const ReviewHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const ReviewerName = styled.div`
  font-weight: bold;
`;

const ReviewDate = styled.div`
  color: #666;
  font-size: 0.9rem;
`;

const StarsDisplay = styled.div`
  color: #f1c40f;
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
`;

const ReviewComment = styled.div`
  margin-bottom: 1rem;
`;

const ConditionsTag = styled.span`
  display: inline-block;
  background-color: var(--light-background);
  color: var(--primary-color);
  padding: 0.3rem 0.6rem;
  border-radius: 1rem;
  margin-right: 0.5rem;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
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

const SpotReviews: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  // Parse the ID from the URL to get the numeric spot ID for useSpotData
  const numericId = id ? parseInt(id, 10) : undefined;
  const { spot, loading: spotLoading, error: spotError } = useSpotData(numericId);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const { user } = useAuth();
  const { username, loading: profileLoading } = useUserProfile();
  
  // Parse the ID from the URL to get the numeric spot ID
  const spotId = id ? parseInt(id, 10) : 0;
  
  // Use our custom hook to fetch reviews from the backend
  const { 
    reviews, 
    loading: reviewsLoading, 
    error: reviewsError,
    createReview,
    updateReview,
    deleteReview
  } = useReviews({ spotId, autoLoad: true });
  
  // Calculate average rating
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : '0.0';
  
  // Helper function to render stars
  const renderStars = (rating: number) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };
  
  // Handle form submission for new reviews
  const handleCreateReview = async (reviewData: ReviewCreate | ReviewUpdate) => {
    // We know this is a create operation, so we can safely cast to ReviewCreate
    // The form ensures all required fields are present
    await createReview(reviewData as ReviewCreate);
    setShowReviewForm(false);
  };
  
  const loading = spotLoading || reviewsLoading || profileLoading;
  const error = spotError || reviewsError;
  
  if (loading) {
    return (
      <Layout>
        <LoadingMessage>Loading spot reviews...</LoadingMessage>
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
  
  // Redirect to login if trying to add a review while not logged in
  if (showReviewForm && !user) {
    return <Navigate to="/login" state={{ from: `/spot/${id}/reviews` }} />;
  }
  
  // Don't show the add review button if not logged in
  const canAddReview = !!user;
  
  return (
    <Layout>
      <ReviewsContainer>
        {/* <SurfboardScroller scrollToTop={true} scrollToBottom={true} showAtHeight={200} /> */}
        <ReviewsHeader>
          <div>
            <BackLink to={`/spot/${id}`}>← Back to {spot.name}</BackLink>
            <SpotTitle>{spot.name} Reviews</SpotTitle>
          </div>
          {canAddReview && (
            <AddReviewButton onClick={() => setShowReviewForm(!showReviewForm)}>
              {showReviewForm ? 'Cancel' : '+ Add Review'}
            </AddReviewButton>
          )}
        </ReviewsHeader>
        
        {showReviewForm && user && username && (
          <FormSection>
            <ReviewForm 
              spotId={spotId}
              userId={username} // Use username instead of user.id
              onSubmit={handleCreateReview}
              onCancel={() => setShowReviewForm(false)}
            />
          </FormSection>
        )}
        
        <ReviewsOverview>
          <AverageRating>{averageRating}</AverageRating>
          <StarsDisplay>{renderStars(Math.round(parseFloat(averageRating)))}</StarsDisplay>
          <RatingCount>({reviews.length} reviews)</RatingCount>
        </ReviewsOverview>
        
        <ReviewList 
          reviews={reviews}
          onUpdateReview={updateReview}
          onDeleteReview={deleteReview}
          currentUserId={username || ''} // Use username for comparison
        />
      </ReviewsContainer>
    </Layout>
  );
};

export default SpotReviews;
