import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './styles/global.css';

// Pages
import Home from './pages/Home';
import Map from './pages/Map';
import SavedSpots from './pages/SavedSpots';
import SpotDetails from './pages/SpotDetails';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/map" element={<Map />} />
        <Route path="/saved" element={<SavedSpots />} />
        <Route path="/spot/:id" element={<SpotDetails />} />
      </Routes>
    </Router>
  );
}

export default App;
