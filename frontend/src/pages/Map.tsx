import 'leaflet/dist/leaflet.css'

import React from 'react';
import styled from 'styled-components';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon, DivIcon } from 'leaflet';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import Header from '../components/layout/Header';

// Apply these styles to the body element when the Map component mounts
const applyGlobalStyles = () => {
  document.body.style.overflow = 'hidden';
  document.body.style.margin = '0';
  document.body.style.height = '100vh';
};

// Reset the styles when the component unmounts
const resetGlobalStyles = () => {
  document.body.style.overflow = '';
  document.body.style.margin = '';
  document.body.style.height = '';
};

const MapWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const HeaderContainer = styled.div`
  flex-shrink: 0;
`;

const StyledMapContainer = styled(MapContainer)`
  flex: 1;
  width: 100%;
  z-index: 0;
`;

const Map: React.FC = () => {
  // Apply global styles when component mounts and clean up when it unmounts
  React.useEffect(() => {
    applyGlobalStyles();
    return resetGlobalStyles;
  }, []);
  type MarkerType = {
    geocode: [number, number];
    popUp: string;
  };

  const markers: MarkerType[] = [
    {
      geocode: [35.2828, -120.6596],
      popUp: "San Luis Obispo, CA"
    },
    {
      geocode: [35.1428, -120.6413],
      popUp: "Pismo Beach"
    },
    {
      geocode: [35.3658, -120.8499],
      popUp: "Morro Bay"
    },
    {
      geocode: [35.1803, -120.7321],
      popUp: "Avila Beach"
    }
  ];

  const customIcon = new Icon({
    iconUrl: require("../img/location.png"),
    iconSize: [25, 41], // size of icon
  });

  const createCustomClusterIcon = (cluster: any) => {
    return new DivIcon({
      html: `<div class="cluster-icon">${cluster.getChildCount()}</div>`,
      className: "custom marker cluster"
    });
  };

  return (
    <MapWrapper>
      <Header />
      <StyledMapContainer center={[35.2828, -120.6596]} zoom={13}>
        {/* <TileLayer 
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        /> */}
        <TileLayer 
          attribution='Stamen Watercolor'
          url='https://tiles.stadiamaps.com/tiles/stamen_watercolor/{z}/{x}/{y}.jpg'
        />
        <MarkerClusterGroup
          chunkedLoading
          iconCreateFunction={createCustomClusterIcon}
        >
          {markers.map(marker => (
            <Marker position={marker.geocode} icon={customIcon}>
              <Popup>
                {marker.popUp}
              </Popup>
            </Marker>
            ))
          }
        </MarkerClusterGroup>
      </StyledMapContainer>
    </MapWrapper>
  );
};

export default Map;
