import { FC } from 'react';
import { LatLngLiteral } from 'leaflet';
import { Marker, Popup, useMapEvents } from 'react-leaflet';

type propType = {
  location: LatLngLiteral;
  setLocation: React.Dispatch<React.SetStateAction<LatLngLiteral>>;
};

/**
 * 位置表示アイコン
 * ・クリックした位置にアイコン表示する
 *   ・クリックした位置を、親コンポーネント(App)へ通知する(state)し、その位置にMarkerを表示する
 */
const LocationMarker: FC<propType> = ({ location, setLocation }) => {
  useMapEvents({
    click: (e) => {
      setLocation(e.latlng);
    },
  });

  return !location ? null : (
    <Marker position={location}>
      <Popup>{String(location)}</Popup>
    </Marker>
  );
};

export default LocationMarker;
