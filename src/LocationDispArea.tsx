import { FC, useEffect, useState } from 'react';
import { LatLngLiteral } from 'leaflet';

import Control from 'react-leaflet-custom-control';
import { getElevation } from './utils/elevations';

type ElevationType = {
  h: number;
  lat: number;
  lng: number;
};

/**
 * 位置情報表示エリア
 * ・クリックした位置の「標高」「緯度」「経度」を表示するエリア
 * ・propsで位置を受け取り、位置から「標高」を求めて表示する
 * ・react-leaflet-custom-controlでラップすることで、マップ上にオーバーレイ表示する
 */
const LocationIndicator: FC<{ location: LatLngLiteral }> = ({ location }) => {
  const f = (num: number, fixed = 6) =>
    ('             ' + num.toFixed(fixed)).slice(-6 - fixed);
  const formatAlt = (alt: ElevationType) =>
    `標高:${f(alt.h ?? 0)}m\n緯度:${f(alt.lat)}\n経度:${f(alt.lng)}`;

  const [altitude, setAlt] = useState<ElevationType>();

  // 位置から標高を取得する
  useEffect(() => {
    getElevation(location.lat, location.lng).then((h) => {
      setAlt({ h, lat: location.lat, lng: location.lng });
    });
  }, [location]);

  // 地図領域右上(topright)に、標高と緯度、経度を表示する
  return (
    <Control position="topright">
      <div style={{ backgroundColor: 'Lavender' }}>
        <pre className="coords">{altitude ? formatAlt(altitude) : ''}</pre>
      </div>
    </Control>
  );
};

export default LocationIndicator;
