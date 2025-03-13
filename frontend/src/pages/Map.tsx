import React from 'react';
import styled from 'styled-components';
import Layout from '../components/layout/Layout';

const MapContainer = styled.div`
  height: 80vh;
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const MapPlaceholder = styled.div`
  text-align: center;
  max-width: 600px;
  padding: 2rem;
`;

const Map: React.FC = () => {
  return (
    <Layout>
      <MapContainer>
        <MapPlaceholder>
          <h2>Interactive Surf Map</h2>
          <p>This page will contain an interactive map of surf spots with real-time conditions.</p>
          <p>Coming soon!</p>
        </MapPlaceholder>
      </MapContainer>
    </Layout>
  );
};

export default Map;
