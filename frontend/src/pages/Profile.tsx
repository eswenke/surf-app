import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { useAuth } from '../context/AuthContext';
import { useUserProfile } from '../hooks/useUserProfile';
import { useReviews } from '../hooks/useReviews';

const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { username, refreshProfile } = useUserProfile();
  const navigate = useNavigate();
  
  const [isEditing, setIsEditing] = useState(false);
  const [newUsername, setNewUsername] = useState(username || '');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'reviews' | 'saved'>('profile');
  
  // Fetch user's reviews
  const { reviews, loading: reviewsLoading } = useReviews({ 
    userId: user?.id, 
    autoLoad: true 
  });

  const handleSaveUsername = async () => {
    if (!newUsername.trim()) {
      setError('Username cannot be empty');
      return;
    }
    
    if (newUsername.trim() === username) {
      setIsEditing(false);
      return;
    }
    
    setError(null);
    setSuccess(null);
    
    try {
      const { error } = await updateProfile(newUsername.trim());
      
      if (error) {
        setError(error.message);
      } else {
        setSuccess('Username updated successfully');
        await refreshProfile();
        setIsEditing(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update username');
    }
  };
  
  if (!user) {
    // Redirect to login if not authenticated
    navigate('/login');
    return null;
  }
  
  return (
    <Layout>
      <ProfileContainer>
        <ProfileHeader>
          <h1>Your Profile</h1>
        </ProfileHeader>
        
        <TabsContainer>
          <Tab 
            active={activeTab === 'profile'} 
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </Tab>
          <Tab 
            active={activeTab === 'reviews'} 
            onClick={() => setActiveTab('reviews')}
          >
            Your Reviews
          </Tab>
          <Tab 
            active={activeTab === 'saved'} 
            onClick={() => setActiveTab('saved')}
          >
            Saved Spots
          </Tab>
        </TabsContainer>
        
        {activeTab === 'profile' && (
          <ProfileSection>
            <ProfileCard>
              <ProfileField>
                <FieldLabel>Email</FieldLabel>
                <FieldValue>{user.email}</FieldValue>
              </ProfileField>
              
              <ProfileField>
                <FieldLabel>Username</FieldLabel>
                {isEditing ? (
                  <EditField>
                    <Input 
                      type="text" 
                      value={newUsername} 
                      onChange={(e) => setNewUsername(e.target.value)}
                      placeholder="Enter new username"
                    />
                    <ButtonGroup>
                      <Button primary onClick={handleSaveUsername}>Save</Button>
                      <Button onClick={() => {
                        setIsEditing(false);
                        setNewUsername(username || '');
                        setError(null);
                      }}>Cancel</Button>
                    </ButtonGroup>
                  </EditField>
                ) : (
                  <EditableField>
                    <FieldValue>{username}</FieldValue>
                    <EditButton onClick={() => setIsEditing(true)}>Edit</EditButton>
                  </EditableField>
                )}
              </ProfileField>
              
              {error && <ErrorMessage>{error}</ErrorMessage>}
              {success && <SuccessMessage>{success}</SuccessMessage>}
            </ProfileCard>
          </ProfileSection>
        )}
        
        {activeTab === 'reviews' && (
          <ProfileSection>
            <SectionTitle>Your Reviews</SectionTitle>
            {reviewsLoading ? (
              <LoadingMessage>Loading your reviews...</LoadingMessage>
            ) : reviews.length > 0 ? (
              <ReviewsList>
                {reviews.map(review => (
                  <ReviewCard key={review.id}>
                    <ReviewHeader>
                      <h3>Rating: {review.rating}/5</h3>
                      <ReviewDate>
                        {new Date(review.created_at).toLocaleDateString()}
                      </ReviewDate>
                    </ReviewHeader>
                    <ReviewComment>{review.comment}</ReviewComment>
                    <ViewSpotLink onClick={() => navigate(`/spot/${review.spot_id}`)}>
                      View Spot
                    </ViewSpotLink>
                  </ReviewCard>
                ))}
              </ReviewsList>
            ) : (
              <EmptyState>You haven't written any reviews yet.</EmptyState>
            )}
          </ProfileSection>
        )}
        
        {activeTab === 'saved' && (
          <ProfileSection>
            <SectionTitle>Saved Spots</SectionTitle>
            <EmptyState>
              Saved spots feature coming soon!
            </EmptyState>
          </ProfileSection>
        )}
      </ProfileContainer>
    </Layout>
  );
};

// Styled components
const ProfileContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
`;

const ProfileHeader = styled.div`
  margin-bottom: 2rem;
  
  h1 {
    color: var(--primary-color);
    font-size: 2rem;
  }
`;

const TabsContainer = styled.div`
  display: flex;
  border-bottom: 1px solid #eee;
  margin-bottom: 2rem;
`;

const Tab = styled.button<{ active: boolean }>`
  padding: 1rem 1.5rem;
  background: none;
  border: none;
  border-bottom: 3px solid ${props => props.active ? 'var(--primary-color)' : 'transparent'};
  color: ${props => props.active ? 'var(--primary-color)' : '#666'};
  font-weight: ${props => props.active ? 'bold' : 'normal'};
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s;
  
  &:hover {
    color: var(--primary-color);
  }
`;

const ProfileSection = styled.div`
  margin-bottom: 2rem;
`;

const ProfileCard = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const ProfileField = styled.div`
  margin-bottom: 1.5rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const FieldLabel = styled.div`
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.5rem;
`;

const FieldValue = styled.div`
  font-size: 1.1rem;
  color: #333;
`;

const EditableField = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const EditField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const EditButton = styled.button`
  background: none;
  border: none;
  color: var(--primary-color);
  cursor: pointer;
  font-size: 0.9rem;
  
  &:hover {
    text-decoration: underline;
  }
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  width: 100%;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const Button = styled.button<{ primary?: boolean }>`
  padding: 0.5rem 1rem;
  border: 1px solid ${props => props.primary ? 'var(--primary-color)' : '#ddd'};
  border-radius: 4px;
  background-color: ${props => props.primary ? 'var(--primary-color)' : 'white'};
  color: ${props => props.primary ? 'white' : '#333'};
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
  
  &:hover {
    background-color: ${props => props.primary ? 'var(--primary-color-dark)' : '#f5f5f5'};
  }
`;

const ErrorMessage = styled.div`
  color: #e74c3c;
  margin-top: 1rem;
  padding: 0.5rem;
  background-color: #fde2e2;
  border-radius: 4px;
`;

const SuccessMessage = styled.div`
  color: #27ae60;
  margin-top: 1rem;
  padding: 0.5rem;
  background-color: #e6f7ef;
  border-radius: 4px;
`;

const SectionTitle = styled.h2`
  color: var(--primary-color);
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: #666;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  color: #666;
`;

const ReviewsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ReviewCard = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const ReviewHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  
  h3 {
    margin: 0;
    color: #333;
  }
`;

const ReviewDate = styled.div`
  color: #666;
  font-size: 0.9rem;
`;

const ReviewComment = styled.p`
  margin-bottom: 1rem;
  line-height: 1.5;
`;

const ViewSpotLink = styled.button`
  background: none;
  border: none;
  color: var(--primary-color);
  cursor: pointer;
  font-size: 0.9rem;
  padding: 0;
  text-align: left;
  
  &:hover {
    text-decoration: underline;
  }
`;

export default ProfilePage;
