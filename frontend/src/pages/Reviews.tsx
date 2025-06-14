import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useReviews } from '../hooks/useReviews';
import ReviewList from '../components/reviews/ReviewList';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  color: var(--primary-color);
`;

const FiltersContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const FilterButton = styled.button<{ active: boolean }>`
  padding: 0.5rem 1rem;
  border-radius: 20px;
  background-color: ${props => props.active ? 'var(--primary-color)' : 'white'};
  color: ${props => props.active ? 'white' : 'var(--text-color)'};
  border: 1px solid var(--border-color);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${props => props.active ? 'var(--primary-color)' : 'var(--light-background)'};
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  background-color: var(--light-background);
  border-radius: 8px;
`;

const EmptyStateText = styled.p`
  font-size: 1.1rem;
  color: var(--text-color);
  margin-bottom: 1rem;
`;

const Reviews: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Use our custom hook to fetch the current user's reviews
  const { 
    reviews, 
    loading, 
    error 
  } = useReviews({ 
    userId: user?.id,
    autoLoad: !!user, // Only autoload if the user is logged in
  });

  const handleSpotClick = (spotId: number) => {
    navigate(`/spot/${spotId}`);
  };

  if (!user) {
    return (
      <Layout>
        <PageContainer>
          <EmptyState>
            <EmptyStateText>Please log in to see your reviews.</EmptyStateText>
            <button onClick={() => navigate('/login')}>Login</button>
          </EmptyState>
        </PageContainer>
      </Layout>
    );
  }

  return (
    <Layout>
      <PageContainer>
        <Header>
          <Title>My Reviews</Title>
        </Header>

        {loading ? (
          <p>Loading reviews...</p>
        ) : error ? (
          <p>Error loading reviews: {error}</p>
        ) : reviews.length === 0 ? (
          <EmptyState>
            <EmptyStateText>
              You haven't written any reviews yet.
            </EmptyStateText>
            <button onClick={() => navigate('/saved')}>
              Find spots to review
            </button>
          </EmptyState>
        ) : (
          <ReviewList 
            reviews={reviews} 
            onSpotClick={handleSpotClick}
            showSpotName={true}
          />
        )}
      </PageContainer>
    </Layout>
  );
};

export default Reviews;
