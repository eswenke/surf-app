import React from 'react';
import Layout from '../components/layout/Layout';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const Map: React.FC = () => {
  return (
    <Layout>
      <MapContainer center={[51.505, -0.09]} zoom={2}>
        <TileLayer
          url="some sort of url, watch the youtube video or find the free api key if that doesnt work"
        />
        <Marker position={[51.5, -0.09]}>
          <Popup>Example Marker</Popup>
        </Marker>
      </MapContainer>
    </Layout>
  );
};

export default Map;
