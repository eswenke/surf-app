import React, { useState } from 'react'
import styled from 'styled-components'
import Layout from '../components/layout/Layout'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../utils/supabaseClient'

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 4rem 1rem;
`

const Form = styled.form`
  width: 100%;
  max-width: 360px;
  background: #fff;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 1rem;
`

const Title = styled.h2`
  margin: 0;
  text-align: center;
`

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
`

const Button = styled.button`
  padding: 0.75rem;
  background-color: #0070f3;
  color: #fff;
  font-size: 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:disabled {
    opacity: 0.6;
    cursor: default;
  }
`

const ErrorMsg = styled.p`
  color: #e00;
  text-align: center;
  margin: 0;
`

const Login: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
      } else {
        // Successful login - redirect to home
        navigate('/')
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <Container>
        <Form onSubmit={handleSubmit}>
          <Title>Log In</Title>
          {error && <ErrorMsg>{error}</ErrorMsg>}
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.currentTarget.value)}
            required
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.currentTarget.value)}
            required
          />
          <Button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Log In'}
          </Button>
        </Form>
      </Container>
    </Layout>
  )
}

export default Login
