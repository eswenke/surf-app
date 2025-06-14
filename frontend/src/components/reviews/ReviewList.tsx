import React, { useState } from 'react';
import styled from 'styled-components';
import { Review, ReviewUpdate } from '../../services/api';
import ReviewForm from './ReviewForm';

// Styled components
const ReviewListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const ReviewItem = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const ReviewHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
`;

const SpotName = styled.div`
  font-weight: 500;
  color: var(--primary-color);
  margin-bottom: 8px;
  cursor: pointer;
  
  &:hover {
    text-decoration: underline;
  }
`;

const ReviewerInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const ReviewUser = styled.span`
  font-weight: 600;
  font-size: 18px;
  color: #333;
`;

const ReviewDate = styled.span`
  font-size: 14px;
  color: #666;
  margin-top: 4px;
`;

const RatingDisplay = styled.div`
  display: flex;
  gap: 4px;
`;

const Star = styled.span<{ filled: boolean }>`
  color: ${props => props.filled ? '#FFD700' : '#ddd'};
  font-size: 20px;
`;

const ReviewComment = styled.p`
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 20px;
  color: #333;
`;

const ConditionsSection = styled.div`
  background-color: #f9f9f9;
  border-radius: 6px;
  padding: 16px;
  margin-bottom: 16px;
`;

const ConditionsTitle = styled.h4`
  font-size: 16px;
  color: #555;
  margin-bottom: 12px;
  font-weight: 500;
`;

const ConditionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
`;

const ConditionItem = styled.div`
  display: flex;
  flex-direction: column;
`;

const ConditionLabel = styled.span`
  font-size: 14px;
  color: #666;
`;

const ConditionValue = styled.span`
  font-size: 16px;
  font-weight: 500;
  color: #333;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 16px;
  justify-content: flex-end;
`;

const Button = styled.button`
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
`;

const EditButton = styled(Button)`
  background-color: #f0f0f0;
  color: #333;
  border: 1px solid #ddd;
  
  &:hover {
    background-color: #e0e0e0;
  }
`;

const DeleteButton = styled(Button)`
  background-color: #fff0f0;
  color: #d32f2f;
  border: 1px solid #ffcccc;
  
  &:hover {
    background-color: #ffe0e0;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  color: #666;
  font-size: 16px;
`;

interface ReviewListProps {
  reviews: Review[];
  onUpdateReview?: (reviewId: number, updates: ReviewUpdate) => Promise<boolean>;
  onDeleteReview?: (reviewId: number) => Promise<boolean>;
  currentUserId?: string;
  onSpotClick?: (spotId: number) => void;
  showSpotName?: boolean;
}

const ReviewList: React.FC<ReviewListProps> = ({
  reviews,
  onUpdateReview,
  onDeleteReview,
  currentUserId,
  onSpotClick,
  showSpotName
}) => {
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
  
  const handleEdit = (review: Review) => {
    setEditingReviewId(review.id);
  };
  
  const handleCancelEdit = () => {
    setEditingReviewId(null);
  };
  
  const handleUpdate = async (reviewId: number, updates: ReviewUpdate) => {
    if (!onUpdateReview) {
      console.warn('onUpdateReview function is not provided');
      return;
    }
    
    const success = await onUpdateReview(reviewId, updates);
    if (success) {
      setEditingReviewId(null);
    }
  };
  
  const handleDelete = async (reviewId: number) => {
    if (!onDeleteReview) {
      console.warn('onDeleteReview function is not provided');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this review?')) {
      await onDeleteReview(reviewId);
    }
  };
  
  // Format date to a readable string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  if (reviews.length === 0) {
    return <EmptyState>No reviews yet. Be the first to leave a review!</EmptyState>;
  }
  
  return (
    <ReviewListContainer>
      {reviews.map(review => (
        <ReviewItem key={review.id}>
          {editingReviewId === review.id ? (
            <ReviewForm
              spotId={review.spot_id}
              userId={review.user_id}
              initialValues={review}
              onSubmit={(updates) => handleUpdate(review.id, updates as ReviewUpdate)}
              onCancel={handleCancelEdit}
              isEdit={true}
            />
          ) : (
            <>
              {showSpotName && review.spot_name && (
                <SpotName onClick={() => onSpotClick && onSpotClick(review.spot_id)}>
                  {review.spot_name}
                </SpotName>
              )}
              <ReviewHeader>
                <ReviewerInfo>
                  <ReviewUser>{review.user_id}</ReviewUser>
                  <ReviewDate>{formatDate(review.created_at)}</ReviewDate>
                </ReviewerInfo>
                
                <RatingDisplay>
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} filled={index < review.rating}>
                      ★
                    </Star>
                  ))}
                </RatingDisplay>
              </ReviewHeader>
              
              <ReviewComment>{review.comment}</ReviewComment>
              
              {(review.wave_height || review.wind_condition || 
                review.weather_condition || review.crowd_level) && (
                <ConditionsSection>
                  <ConditionsTitle>Surf Conditions</ConditionsTitle>
                  <ConditionsGrid>
                    {review.wave_height && (
                      <ConditionItem>
                        <ConditionLabel>Wave Height:</ConditionLabel>
                        <ConditionValue>{review.wave_height} ft</ConditionValue>
                      </ConditionItem>
                    )}
                    
                    {review.wind_condition && (
                      <ConditionItem>
                        <ConditionLabel>Wind:</ConditionLabel>
                        <ConditionValue>{review.wind_condition}</ConditionValue>
                      </ConditionItem>
                    )}
                    
                    {review.weather_condition && (
                      <ConditionItem>
                        <ConditionLabel>Weather:</ConditionLabel>
                        <ConditionValue>{review.weather_condition}</ConditionValue>
                      </ConditionItem>
                    )}
                    
                    {review.crowd_level && (
                      <ConditionItem>
                        <ConditionLabel>Crowd Level:</ConditionLabel>
                        <ConditionValue>{review.crowd_level}/5</ConditionValue>
                      </ConditionItem>
                    )}
                  </ConditionsGrid>
                </ConditionsSection>
              )}
              
              {currentUserId === review.user_id && (
                <ActionButtons>
                  <EditButton onClick={() => handleEdit(review)}>
                    Edit
                  </EditButton>
                  <DeleteButton onClick={() => handleDelete(review.id)}>
                    Delete
                  </DeleteButton>
                </ActionButtons>
              )}
            </>
          )}
        </ReviewItem>
      ))}
    </ReviewListContainer>
  );
};




export default ReviewList;
