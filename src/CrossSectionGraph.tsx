import React, { FC, useEffect, useState } from 'react';
import { LatLngLiteral } from 'leaflet';
import Plot from 'react-plotly.js';
import { getElevations, getDistance } from './utils/elevations';

type plotData = {
  x: number[];
  y: number[];
};

type propType = {
  points: LatLngLiteral[];
  ratio: number;
};

const CrossSectionGraph: FC<propType> = ({ points, ratio }) => {
  const [plotData, setPlotData] = useState<plotData>();

  useEffect(() => {
    if (points) {
      const [lat1, lng1] = [points[0].lat, points[0].lng];
      const [lat2, lng2] = [points[1].lat, points[1].lng];

      // 2点間の標高、距離を計算する
      (async () => {
        const elevations = await getElevations(lat1, lng1, lat2, lng2);
        const distance = getDistance(lat1, lng1, lat2, lng2) * 1000;

        // 分割した区間あたりの距離
        const distancePerUnit = distance / elevations.length;
        const xy: plotData = { x: [], y: [] };

        // 標高の配列を(x:距離、y:標高)の配列に変換
        elevations.forEach((v, i) => {
          xy.x.push(i * distancePerUnit);
          xy.y.push(v);
        });

        setPlotData(xy);
      })();
    }
  }, [points]);

  return (
    <>
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
              scaleratio: ratio, // x軸に対する倍率
              rangemode: 'tozero',
              title: '標高',
              ticksuffix: 'm',
              exponentformat: 'none',
            },
          }}
        />
      )}
    </>
  );
};

export default CrossSectionGraph;
