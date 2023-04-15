import { FC, useState, useMemo, useRef } from 'react';
import { LatLngLiteral, Marker as MarkerRef, Popup as PopupRef } from 'leaflet';
import { Marker, Polyline, Popup, useMap, useMapEvents } from 'react-leaflet';

declare global {
  interface DocumentEventMap {
    showDialog: CustomEvent<LatLngLiteral[]>;
  }
}

type propType = {
  location: LatLngLiteral;
  setLocation: React.Dispatch<React.SetStateAction<LatLngLiteral>>;
};

const gmap = 'https://www.google.com/maps/search/?api=1&query=';

/**
 * 位置表示アイコン
 * ・クリックした位置にアイコン表示する
 *   ・クリックした位置を、親コンポーネント(App)へ通知する(state)し、その位置にMarkerを表示する
 */
const LocationMarker: FC<propType> = ({ location, setLocation }) => {
  const [polyline, setPolyline] = useState<LatLngLiteral[]>([]);
  const markerRef = useRef<MarkerRef>(null);
  const popRef = useRef<PopupRef>(null);
  const dragEndTime = useRef<number>(0);
  const map = useMap();
  useMapEvents({
    click: (e) => {
      setLocation(e.latlng);
    },
  });

  const eventHandlers = useMemo(
    () => ({
      dragstart: () => {
        const marker = markerRef.current as MarkerRef;
        marker.setOpacity(0.6);

        const { lat, lng } = marker.getLatLng();
        setPolyline((ary) => {
          // 開始位置、終了位置を開始位置で初期化
          return [marker.getLatLng(), marker.getLatLng()];
        });
      },
      dragend: () => {
        const marker = markerRef.current as MarkerRef;
        marker.setOpacity(1);
        popRef.current?.openOn(map);
        setLocation(marker.getLatLng());
        dragEndTime.current = new Date().getTime();

        // raise dragend event
        // publish('showDialog', polyline);
        const event = new CustomEvent('showDialog', { detail: polyline });
        document.dispatchEvent(event);
      },
      drag: () => {
        const marker = markerRef.current as MarkerRef;
        // popRef.current?.openOn(map);
        // 終了位置を更新
        setPolyline((ary) => [
          ...ary.slice(0, ary.length - 1),
          marker.getLatLng(),
        ]);
      },
    }),
    [map, setLocation, polyline]
  );

  return !location ? null : (
    <>
      <Marker
        draggable={true}
        eventHandlers={eventHandlers}
        position={location}
        ref={markerRef}
      >
        <Popup ref={popRef}>
          {' '}
          <a href={`${gmap}${location.lat},${location.lng}`} target="blank">
            googleマップで開く
          </a>
        </Popup>
      </Marker>
      <Polyline positions={polyline} color="green" />
    </>
  );
};

export default LocationMarker;
