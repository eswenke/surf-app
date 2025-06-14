import React, { useState } from 'react';
import styled from 'styled-components';
import { ReviewCreate, ReviewUpdate } from '../../services/api';

// Styled components
const FormContainer = styled.form`
  background-color: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
  width: 100%;
`;

const FormRow = styled.div`
  display: flex;
  gap: 16px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 8px;
  }
`;

const Label = styled.label`
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: #333;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  
  &:focus {
    outline: none;
    border-color: #0077cc;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  min-height: 100px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #0077cc;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  background-color: white;
  
  &:focus {
    outline: none;
    border-color: #0077cc;
  }
`;

const StarRating = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
`;

const Star = styled.span<{ selected: boolean }>`
  font-size: 32px;
  cursor: pointer;
  color: ${props => props.selected ? '#FFD700' : '#ddd'};
  transition: color 0.2s;
  
  &:hover {
    color: #FFD700;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 24px;
`;

const Button = styled.button`
  padding: 12px 24px;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
`;

const SubmitButton = styled(Button)`
  background-color: #0077cc;
  color: white;
  border: none;
  
  &:hover {
    background-color: #005fa3;
  }
  
  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const CancelButton = styled(Button)`
  background-color: white;
  color: #333;
  border: 1px solid #ddd;
  
  &:hover {
    background-color: #f5f5f5;
  }
`;

const SectionTitle = styled.h4`
  margin-top: 24px;
  margin-bottom: 16px;
  color: #555;
  border-bottom: 1px solid #eee;
  padding-bottom: 8px;
`;

const ErrorMessage = styled.div`
  color: #d32f2f;
  background-color: #ffeaea;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 16px;
`;

interface ReviewFormProps {
  spotId: number;
  userId: string; // This will now be the username
  initialValues?: Partial<ReviewCreate>;
  onSubmit: (review: ReviewCreate | ReviewUpdate) => Promise<void>;
  onCancel?: () => void;
  isEdit?: boolean;
}

const ReviewForm: React.FC<ReviewFormProps> = ({
  spotId,
  userId, // This is now the username
  initialValues = {},
  onSubmit,
  onCancel,
  isEdit = false
}) => {
  const [formData, setFormData] = useState<Partial<ReviewCreate>>({
    spot_id: spotId,
    user_id: userId, // userId is now the username
    rating: 5,
    comment: '',
    wave_height: undefined,
    wind_condition: '',
    weather_condition: '',
    crowd_level: undefined,
    ...initialValues
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Handle number inputs
    if (type === 'number') {
      setFormData({
        ...formData,
        [name]: value ? Number(value) : undefined
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  
  const handleRatingChange = (newRating: number) => {
    setFormData({
      ...formData,
      rating: newRating
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      // For edit mode, we only include changed fields
      const reviewData = isEdit
        ? formData
        : {
            spot_id: spotId,
            user_id: userId, // userId is now the username
            rating: formData.rating || 5,
            comment: formData.comment || '',
            wave_height: formData.wave_height,
            wind_condition: formData.wind_condition,
            weather_condition: formData.weather_condition,
            crowd_level: formData.crowd_level
          };
      
      await onSubmit(reviewData as ReviewCreate);
      
      // Reset form if not editing
      if (!isEdit) {
        setFormData({
          spot_id: spotId,
          user_id: userId,
          rating: 5,
          comment: '',
          wave_height: undefined,
          wind_condition: '',
          weather_condition: '',
          crowd_level: undefined
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <FormContainer onSubmit={handleSubmit}>
      <h3>{isEdit ? 'Edit Review' : 'Leave a Review'}</h3>
      
      {error && <ErrorMessage>{error}</ErrorMessage>}
      
      <FormGroup>
        <Label>Rating</Label>
        <StarRating>
          {[1, 2, 3, 4, 5].map((star) => (
            <Star 
              key={star}
              selected={star <= (formData.rating || 0)}
              onClick={() => handleRatingChange(star)}
            >
              ★
            </Star>
          ))}
        </StarRating>
      </FormGroup>
      
      <FormGroup>
        <Label htmlFor="comment">Comment</Label>
        <TextArea
          id="comment"
          name="comment"
          value={formData.comment || ''}
          onChange={handleChange}
          placeholder="Share your experience surfing here..."
          required
        />
      </FormGroup>
      
      <SectionTitle>Surf Conditions (Optional)</SectionTitle>
      
      <FormRow>
        <FormGroup>
          <Label htmlFor="wave_height">Wave Height (ft)</Label>
          <Input
            type="number"
            id="wave_height"
            name="wave_height"
            value={formData.wave_height || ''}
            onChange={handleChange}
            min="0"
            step="0.5"
          />
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="crowd_level">Crowd Level (1-5)</Label>
          <Select
            id="crowd_level"
            name="crowd_level"
            value={formData.crowd_level || ''}
            onChange={handleChange}
          >
            <option value="">Select</option>
            <option value="1">1 - Empty</option>
            <option value="2">2 - Few people</option>
            <option value="3">3 - Moderate</option>
            <option value="4">4 - Crowded</option>
            <option value="5">5 - Packed</option>
          </Select>
        </FormGroup>
      </FormRow>
      
      <FormRow>
        <FormGroup>
          <Label htmlFor="wind_condition">Wind</Label>
          <Input
            type="text"
            id="wind_condition"
            name="wind_condition"
            value={formData.wind_condition || ''}
            onChange={handleChange}
            placeholder="e.g., Offshore, Onshore"
          />
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="weather_condition">Weather</Label>
          <Input
            type="text"
            id="weather_condition"
            name="weather_condition"
            value={formData.weather_condition || ''}
            onChange={handleChange}
            placeholder="e.g., Sunny, Cloudy"
          />
        </FormGroup>
      </FormRow>
      
      <ButtonGroup>
        <SubmitButton type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : isEdit ? 'Update Review' : 'Submit Review'}
        </SubmitButton>
        
        {onCancel && (
          <CancelButton type="button" onClick={onCancel}>
            Cancel
          </CancelButton>
        )}
      </ButtonGroup>
    </FormContainer>
  );
};


export default ReviewForm;
