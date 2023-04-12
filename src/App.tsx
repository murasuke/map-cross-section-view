import React, { FC, useState } from 'react';
import { LatLngLiteral } from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { LatLng } from 'leaflet';
import LocationDispArea from './LocationDispArea';
import LocationMarker from './LocationMarker';
import './utils/initLeaflet';
import 'leaflet/dist/leaflet.css';
import './App.css';

const App: FC = () => {
  const [location, setLocation] = useState<LatLngLiteral>({
    lat: 35.3607411,
    lng: 138.727262,
  });

  return (
    <MapContainer center={location} zoom={13}>
      <TileLayer
        attribution='&copy; <a href="https://maps.gsi.go.jp/development/ichiran.html">国土地理院</a>'
        url="https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png"
      />
      <LocationDispArea location={location} />
      <LocationMarker location={location} setLocation={setLocation} />
    </MapContainer>
  );
};

export default App;
