import React, { FC, useEffect, useState } from 'react';
import { LatLngLiteral } from 'leaflet';
import Dialog from 'rc-dialog';
import Plot from 'react-plotly.js';
import { getElevations, getDistance } from './utils/elevations';
import 'rc-dialog/assets/index.css';

type propType = {
  visible: boolean;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
};

type plotData = {
  x: number[];
  y: number[];
};

const CrossSectionDialog: FC<propType> = ({ visible, setVisible }) => {
  const [plotData, setPlotData] = useState<plotData>();
  useEffect(() => {
    // subscribe('showDialog', showDialog);
    document.addEventListener('showDialog', showDialog);
    return () => {
      // unsubscribe('showDialog', showDialog);
      document.removeEventListener('showDialog', showDialog);
    };
  });

  async function showDialog(data: CustomEvent<LatLngLiteral[]>) {
    const points = data.detail;
    const [lat1, lng1] = [points[0].lat, points[0].lng];
    const [lat2, lng2] = [points[1].lat, points[1].lng];

    // 2点間の標高、距離を計算する
    const elevations = await getElevations(lat1, lng1, lat2, lng2);
    const distance = getDistance(lat1, lng1, lat2, lng2) * 1000;
    const ratio = 1;

    // 分割した区間あたりの距離
    const distancePerUnit = distance / elevations.length;
    const xy: plotData = { x: [], y: [] };

    // 標高の配列を(x:距離、y:標高)の配列に変換
    elevations.forEach((v, i) => {
      xy.x.push(i * distancePerUnit);
      xy.y.push(v);
    });

    setPlotData(xy);
    setVisible(true);
  }

  const onToggleDialog = () => {
    setVisible((value) => !value);
  };

  return (
    <Dialog
      visible={visible}
      animation="zoom"
      maskAnimation="fade"
      onClose={onToggleDialog}
      forceRender
    >
      {plotData && (
        <Plot
          data={[
            {
              x: plotData.x,
              y: plotData.y,
              type: 'scatter',
              mode: 'lines',
              line: { shape: 'spline' },
            },
          ]}
          layout={{
            width: 500,
            margin: {
              l: 80,
              r: 10,
              b: 40,
              t: 30,
              pad: 4,
            },
            title: '断面図',
            xaxis: {
              title: '距離',
              ticksuffix: 'm',
              exponentformat: 'none',
              rangemode: 'tozero',
            },
            yaxis: {
              scaleanchor: 'x', // グラフの縦横比を等倍にする
              scaleratio: 1 /*ratio*/, // x軸に対する倍率
              rangemode: 'tozero',
              title: '標高',
              ticksuffix: 'm',
              exponentformat: 'none',
            },
          }}
        />
      )}
    </Dialog>
  );
};

export default CrossSectionDialog;
