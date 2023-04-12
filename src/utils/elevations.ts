/**
 * 2座標間を線形補完して座標を求める
 * ・標高は地理院タイルの(DEM5A)を利用
 *   https://maps.gsi.go.jp/development/ichiran.html
 */

/**
 * 特定の座標の標高を求める
 * @param lat1
 * @param lng1
 * @param zoom
 * @returns
 */
export const getElevation = async (lat1: number, lng1: number, zoom = 15) => {
  let tile = calcTileInfo(lat1, lng1, zoom);

  const context = await loadTile(tile.tX, tile.tY, zoom, {
    dataType: 'dem5a_png',
  });
  // タイルから標高を取得
  const h = elevationFromTile(tile.pX, tile.pY, context);
  return h;
};

/**
 * 2点間の標高を配列で取得する
 * @param {number} lat1
 * @param {number} lng1
 * @param {number} lat2
 * @param {number} lng2
 * @returns
 */
export const getElevations = async (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
) => {
  let tile1, tile2, zoom;
  // 経度、緯度から2つのPixcelの距離が128～256になるzoomlevelを選択する
  for (zoom = 0; zoom <= 15; zoom++) {
    tile1 = calcTileInfo(lat1, lng1, zoom);
    tile2 = calcTileInfo(lat2, lng2, zoom);
    // 2つのPixcelの距離が128～256になるまでzoomを増やす
    const distance = Math.sqrt(
      (tile1.pX - tile2.pX) ** 2 + (tile1.pY - tile2.pY) ** 2
    );

    if (distance > 128) {
      break;
    }
  }

  // 2点間を線形補完した座標を計算する
  const line = lerp(tile1.pX, tile1.pY, tile2.pX, tile2.pY);

  let tiles: { [index: string]: CanvasRenderingContext2D } = {}; // タイル読み込みキャッシュ
  const elevations = []; // 標高の配列

  // 補完した座標から、標高を取得して配列にセット
  for (let i = 0; i < line.length; i += 2) {
    const x = line[i];
    const y = line[i + 1];

    // タイルのindex
    const tileCoordX = Math.floor(x / 256);
    const tileCoordY = Math.floor(y / 256);
    // タイル内の座標
    const imageCoordX = Math.floor(x - tileCoordX * 256);
    const imageCoordY = Math.floor(y - tileCoordY * 256);

    let context = null; // タイルを描画したCanvas
    if (!tiles[`${tileCoordX}_${tileCoordY}`]) {
      // 標高タイルの読み込み
      context = await loadTile(tileCoordX, tileCoordY, zoom, {
        dataType: 'dem5a_png',
      });
      // 一度読み込んだタイルはキャッシュする
      tiles[`${tileCoordX}_${tileCoordY}`] = context;
    } else {
      // キャッシュからタイルを取り出す
      context = tiles[`${tileCoordX}_${tileCoordY}`];
    }

    // タイルから標高を取得
    const h = elevationFromTile(imageCoordX, imageCoordY, context);
    elevations.push(h);
  }

  return elevations;
};

/**
 * 経度から座標(タイルとタイル内pixcel)を計算
 * @param {number} lng 経度
 * @param {number} z zoomlevel
 * @returns
 */
export const calcCoordX = (lng: number, z: number) => {
  // ラジアンに変換
  const lng_rad = (Math.PI / 180) * lng;

  // zoomレベル0の場合、256pxで360度(2PIラジアン)
  //  ⇒ ラジアンあたりpxを計算
  const R = 256 / (2 * Math.PI);

  // グリニッジ子午線を原点とした位置(x) (-128～128)
  let worldCoordX = R * lng_rad;

  // 左端を原点にするために180度分を加算する(0～256)
  worldCoordX = worldCoordX + R * (Math.PI / 180) * 180;

  // 1周256px換算で計算した値にzoomをかけて、zoomで換算した画像の位置を計算
  //  ⇒ https://maps.gsi.go.jp/development/siyou.html#siyou-zm
  const pixelCoordX = worldCoordX * Math.pow(2, z);

  // 1つの画像が256pxなので、256で割って左端からの画像の枚数(タイルの位置)を求める
  // (0オリジンなので切り捨て)
  const tileCoordX = Math.floor(pixelCoordX / 256);

  // 左側のタイル幅合計を引いて、表示タイル内のpx位置を算出する
  const imageCoordX = Math.floor(pixelCoordX - tileCoordX * 256);

  // 計算した値を返す
  return {
    worldCoordX,
    pixelCoordX,
    tileCoordX,
    imageCoordX,
  };
};

/**
 * 緯度から座標(タイルとタイル内pixcel)を計算
 * メルカトル図法で緯度から位置を算出する式 (https://qiita.com/Seo-4d696b75/items/aa6adfbfba404fcd65aa)
 *  R ln(tan(π/4 + ϕ/2))
 *    R: 半径
 *    ϕ: 緯度(ラジアン)
 * @param {number} lat 緯度
 * @param {number} z zoomlevel
 * @returns
 */
export const calcCoordY = (lat: number, z: number) => {
  // ラジアン
  const lat_rad = (Math.PI / 180) * lat;

  // zoomレベル0の場合、256pxで360度(2PIラジアン)
  //  ⇒ ラジアンあたりpxを計算
  const R = 256 / (2 * Math.PI);

  // メルカトル図法で緯度から位置を算出
  let worldCoordY = R * Math.log(Math.tan(Math.PI / 4 + lat_rad / 2));

  // 赤道からの位置(北緯)で計算しているので、左上を原点とするため軸を逆転＋北極側を原点に換算
  worldCoordY = -1 * worldCoordY + 128;

  // 256px換算で計算した値にzoomをかけて、zoomで換算した画像の位置を計算
  const pixelCoordY = worldCoordY * Math.pow(2, z);

  // 1つの画像が256pxなので、256で割って左端からの画像の枚数(位置)を求める
  // 0オリジンなので切り捨て
  const tileCoordY = Math.floor(pixelCoordY / 256);

  // 上側のタイル幅合計を引いて、表示タイル内のpx位置を算出する
  const imageCoordY = Math.floor(pixelCoordY - tileCoordY * 256);

  // 計算した値を返す
  return {
    worldCoordY,
    pixelCoordY,
    tileCoordY,
    imageCoordY,
  };
};

/**
 * 指定位置に該当するタイル位置と、該当タイル内の位置を返す
 * @param {number} lat 緯度
 * @param {number} lng 経度
 * @param {number} z zoomlevel
 * @returns
 */
export const calcTileInfo = (lat: number, lng: number, z: number) => {
  // (x, y): 指定位置に該当するタイル位置
  // (pX, pY): 該当タイル内の位置
  const coordX = calcCoordX(lng, z);
  const coordY = calcCoordY(lat, z);
  return {
    wX: coordX.worldCoordX,
    wY: coordY.worldCoordY,
    pX: coordX.pixelCoordX,
    pY: coordY.pixelCoordY,
    tX: coordX.tileCoordX,
    tY: coordY.tileCoordY,
    iX: coordX.imageCoordX,
    iY: coordY.imageCoordY,
    z,
  };
};

/**
 * 読み込んだタイルをCanvasに描画して返す
 *　・色情報を取得できるようにするため、Canvasへ描画する
 * @param {number} x タイルのx枚目
 * @param {number} y タイルのy枚目
 * @param {number} z zoomlevel
 * @param { {dataType: string, ext?: string} } option タイルの種類
 * @returns {Promise<CanvasRenderingContext2D>} CanvasのContext
 */
export const loadTile = async (
  x: number,
  y: number,
  z: number,
  option: { dataType: string; ext?: string }
): Promise<CanvasRenderingContext2D> => {
  const { dataType, ext } = option;

  const url = `https://cyberjapandata.gsi.go.jp/xyz/${dataType}/${z}/${x}/${y}.${
    ext ?? 'png'
  }`;

  // Image(HTMLImageElement)を利用して画像を取得
  const img = new Image();
  img.setAttribute('crossorigin', 'anonymous');
  img.src = url;

  // 縦横256pixcelのCanvasを生成する
  const canvas = document.createElement('canvas');
  [canvas.width, canvas.height] = [256, 256];
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  // onloadは非同期で発生するため、Promise()でラップして返す
  return new Promise((resolve, reject) => {
    img.onload = () => {
      // 読み込んだ座標をCanvasに描画して返す
      ctx.drawImage(img, 0, 0);

      resolve(ctx);
    };
  });
};

/**
 * 2点間の線形補完
 * 垂直でも計算しやすいので、中間の点を求めて再帰で分割
 * ・(2^再帰の深さ + 1)に分割する
 * @param {number} p1x
 * @param {number} p1y
 * @param {number} p2x
 * @param {number} p2y
 * @param {number} maxDepth = 7
 * @param {number} depth 現在の再帰の深さ
 * @returns
 */
const lerp = (
  p1x: number,
  p1y: number,
  p2x: number,
  p2y: number,
  maxDepth = 7,
  depth = 0
): number[] => {
  if (depth >= maxDepth) {
    return [p1x, p1y];
  }
  const x = (p1x + p2x) / 2;
  const y = (p1y + p2y) / 2;
  depth += 1;
  return [
    ...lerp(p1x, p1y, x, y, maxDepth, depth),
    ...lerp(x, y, p2x, p2y, maxDepth, depth),
    ...(depth === 1 ? [p2x, p2y] : []), // 一番右端
  ];
};

/**
 * dem5aから標高を取得
 * @param {number} lat
 * @param {number} lng
 * @param {CanvasRenderingContext2D}
 * @returns {Promise<number>}
 */
export const elevationFromTile = (
  pX: number,
  pY: number,
  ctx: CanvasRenderingContext2D
) => {
  const { data } = ctx.getImageData(0, 0, 256, 256);
  // 1pxあたり4Byte(RGBA)
  const idx = pY * 256 * 4 + pX * 4;
  const r = data[idx + 0];
  const g = data[idx + 1];
  const b = data[idx + 2];

  // 標高に換算
  let h = undefined;
  const resolution = 0.01; // 分解能

  // 定義に従い計算
  // x = 2^16R + 2^8G + B
  // x < 2^23の場合　h = xu
  // x = 2^23の場合　h = NA
  // x > 2^23の場合　h = (x-2^24)u
  // uは標高分解能（0.01m）
  const x = r * 2 ** 16 + g * 2 ** 8 + b;
  if (x < 2 ** 23) {
    h = x * resolution;
  } else if (x == 2 ** 23) {
    h = undefined;
  } else if (x > 2 ** 23) {
    h = x - 2 ** 24 * resolution;
  }

  return h;
};

/**
 * 2点間の距離を計算する(km)
 * @author @kawanet
 * @license MIT
 * @see https://gist.github.com/kawanet/15c5a260ca3b98bd080bb87cdae57230
 * @param {number} lat1 - degree of latitude of origin
 * @param {number} lng1 - degree of longitude of origin
 * @param {number} lat2 - degree of latitude of destination
 * @param {number} lng2 - degree of longitude of destination
 * @return {number} distance in kilometers between origin and destination
 */
export const getDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
) => {
  lat1 *= Math.PI / 180;
  lng1 *= Math.PI / 180;
  lat2 *= Math.PI / 180;
  lng2 *= Math.PI / 180;
  return (
    6371 *
    Math.acos(
      Math.cos(lat1) * Math.cos(lat2) * Math.cos(lng2 - lng1) +
        Math.sin(lat1) * Math.sin(lat2)
    )
  );
};
