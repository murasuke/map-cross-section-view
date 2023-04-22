import { FC, useState } from 'react';
import { LatLngLiteral } from 'leaflet';
import { MapContainer, TileLayer } from 'react-leaflet';

import './utils/initLeaflet'; // アイコン表示位置の調整
import LocationDispArea from './LocationDispArea';
import LocationMarker from './LocationMarker';
import CrossSectionDialog from './CrossSectionDialog';

import 'leaflet/dist/leaflet.css';
import './App.css';

const App: FC = () => {
  // クリックされた位置(初期位置は富士山頂)
  const [location, setLocation] = useState<LatLngLiteral>({
    lat: 35.3607411,
    lng: 138.727262,
  });
  // ダイアログ表示切り替え
  const [visibleDialog, setVisibleDialog] = useState(false);

  /**
   * <MapContainer> ReactLeafletの地図を表示するコンテナ
   *   <TileLayer> 国土地理院タイルを表示するレイヤー(複数レイヤーを切り替えたり、オーバーレイ表示することもできる)
   *   <LocationDispArea> マップの右上に表示する情報表示領域(標高、緯度、経度)
   *   <LocationMarker> クリック位置を表すアイコン
   * <CrossSectionDialog> 標高の断面図を表示するためのダイアログ(内部でグラフを表示)
   */
  return (
    <>
      <MapContainer center={location} zoom={13}>
        <TileLayer
          attribution='&copy; <a href="https://maps.gsi.go.jp/development/ichiran.html">国土地理院</a>'
          url="https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png"
        />
        <LocationDispArea location={location} />
        <LocationMarker location={location} setLocation={setLocation} />
      </MapContainer>
      <CrossSectionDialog
        visible={visibleDialog}
        setVisible={setVisibleDialog}
      />
    </>
  );
};

export default App;
