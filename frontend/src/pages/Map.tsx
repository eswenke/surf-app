import 'leaflet/dist/leaflet.css'

import React from 'react';
import Layout from '../components/layout/Layout';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon, DivIcon } from 'leaflet';
import MarkerClusterGroup from 'react-leaflet-markercluster';

const Map: React.FC = () => {
  type MarkerType = {
    geocode: [number, number];
    popUp: string;
  };

  const markers: MarkerType[] = [
    {
      geocode: [51.51, -0.09],
      popUp: "PopUp 1"
    },
    {
      geocode: [51.50, -0.09],
      popUp: "PopUp 2"
    },
    {
      geocode: [51.505, -0.08],
      popUp: "PopUp 3"
    }
  ];

  const customIcon = new Icon({
    iconUrl: require("../img/location.png"),
    iconSize: [25, 41], // size of icon
  });



  const createCustomClusterIcon = (cluster: any) => {
    return new DivIcon({
      html: `<div class="cluster-icon">${cluster.getChildCount()})</div>`,
      className: "custom marker cluster"
    });
  };

  return (
    <Layout>
      <MapContainer center={[51.505, -0.09]} zoom={13}>
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
      </MapContainer>
    </Layout>
  );
};

export default Map;
