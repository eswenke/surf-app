import React, { useState } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #48cae4, #0077b6);
`;

const Form = styled.form`
  width: 100%;
  max-width: 400px;
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const Title = styled.h1`
  margin: 0;
  text-align: center;
  color: #0077b6;
  font-size: 2rem;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
`;

const Button = styled.button`
  padding: 0.75rem;
  background-color: #0077b6;
  color: white;
  font-size: 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:disabled {
    opacity: 0.6;
    cursor: default;
  }
`;

const ErrorMsg = styled.p`
  color: #e63946;
  text-align: center;
  margin: 0;
`;

const ToggleText = styled.p`
  text-align: center;
  margin: 0;
  color: #666;
`;

const ToggleLink = styled.span`
  color: #0077b6;
  font-weight: bold;
  cursor: pointer;
  margin-left: 4px;
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
`;

const AuthForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Validate username for signup
      if (!isLogin && !username.trim()) {
        setError('Username is required');
        setLoading(false);
        return;
      }

      const { error } = isLogin 
        ? await signIn(email, password)
        : await signUp(email, password, username);

      if (error) {
        setError(error.message);
      } else {
        // On successful login/signup, navigate to home
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Form onSubmit={handleSubmit}>
        <Title>{isLogin ? 'Log In' : 'Sign Up'}</Title>
        {error && <ErrorMsg>{error}</ErrorMsg>}
        {!isLogin && (
          <Input
            type="text"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />
        )}
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <Button type="submit" disabled={loading}>
          {loading ? 'Loading...' : isLogin ? 'Log In' : 'Sign Up'}
        </Button>
        <ToggleText>
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <ToggleLink onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Sign Up' : 'Log In'}
          </ToggleLink>
        </ToggleText>
      </Form>
    </Container>
  );
};

export default AuthForm;