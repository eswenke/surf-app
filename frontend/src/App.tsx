import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './styles/global.css';

// Pages
import Home from './pages/Home';
import Map from './pages/Map';
import SavedSpots from './pages/SavedSpots';
import SpotDetails from './pages/SpotDetails';
import SpotReviews from './pages/SpotReviews';
import Profile from './pages/Profile';
import AuthForm from './components/auth/AuthForm';

// Auth
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/auth" element={<AuthForm />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } />
          
          <Route path="/map" element={
            <ProtectedRoute>
              <Map />
            </ProtectedRoute>
          } />
          
          <Route path="/saved" element={
            <ProtectedRoute>
              <SavedSpots />
            </ProtectedRoute>
          } />
          
          <Route path="/spot/:id" element={
            <ProtectedRoute>
              <SpotDetails />
            </ProtectedRoute>
          } />
          
          <Route path="/spot/:id/reviews" element={
            <ProtectedRoute>
              <SpotReviews />
            </ProtectedRoute>
          } />
          
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          
          {/* Redirect any unknown routes to auth if not logged in, or home if logged in */}
          <Route path="*" element={<Navigate to="/auth" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
