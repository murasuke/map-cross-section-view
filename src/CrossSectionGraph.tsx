import { FC, useEffect, useState } from 'react';
import { LatLngLiteral } from 'leaflet';
import Plot from 'react-plotly.js';
import { getElevations, getDistance } from './utils/elevations';

type plotData = {
  x: number[];
  y: number[];
};

type propType = {
  points: LatLngLiteral[]; // 断面図に必要な2点を配列で渡す
  ratio: number; // x軸とy軸の縦横比(高さを強調したい場合は1より大きい数を渡す)
};

/**
 * plotly.jsを利用して、2座標間の断面図を描画する
 * ・標高タイルから2つの座標間の標高を取得(./utils/elevations参照)して、断面図を生成する
 * ・x軸とy軸の倍率は、ratioで設定する(1だと等倍、2以上は高さが強調される)
 * @param param0
 * @returns
 */
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

        // 分割した区間あたりの距離(標高を求めた区間あたりの距離)
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

  const margin = {
    // グラフ外側の空白調整
    l: 80,
    r: 10,
    b: 40,
    t: 30,
    pad: 4,
  };

  /**
   * <Plot> グラフ表示コンポーネントplotly.js
   * ・data 描画する座標の配列
   */
  return (
    <>
      {plotData && (
        <Plot
          data={[
            {
              x: plotData.x,
              y: plotData.y,
              type: 'scatter', // 散布図
              mode: 'lines', // 線でつなげる
              line: { shape: 'spline' }, // spline曲線
            },
          ]}
          layout={{
            width: 500,
            margin,
            xaxis: {
              // x軸の設定
              title: '距離',
              ticksuffix: 'm',
              exponentformat: 'none', // 指数表記しない
              rangemode: 'tozero', // 0から表示
            },
            yaxis: {
              // y軸の設定
              scaleanchor: 'x', // グラフの縦横比を等倍にする
              scaleratio: ratio, // x軸に対する倍率
              rangemode: 'tozero', // 0から表示
              title: '標高',
              ticksuffix: 'm',
              exponentformat: 'none', // 指数表記しない
            },
          }}
        />
      )}
    </>
  );
};

export default CrossSectionGraph;
