# ドラッグした区間の断面図を表示する地図(React)

https://murasuke.github.io/map-cross-section-view/

![img10](./img/img10.png)

## はじめに

前に、2つの地点を指定して、その間の断面図を表示する機能を作りました

[2つの地点間の断面図(標高)をグラフで表示する](https://qiita.com/murasuke/items/03d7c4bf9e816a34b7f1)

経度、緯度の手入力は面倒なので、**地図上をドラッグしてその区間の断面図を表示**できるようにします

## 概要

### [Leaflet](https://leafletjs.com/)
地図を表示するためのJavaScriptライブラリ。表示する地図は持たないので[OpenStreetMap](https://www.openstreetmap.org/about)や、[国土地理院タイル](https://maps.gsi.go.jp/development/siyou.html)と組み合わせて利用する


### [React Leaflet](https://react-leaflet.js.org/)

LeafletをReact コンポーネントとして使うためのライブラリ(ラッパー)

下記のように直感的でわかりやすくコンポーネント化される

* 富士山を表示するだけの最低限のサンプル
```jsx
import { MapContainer, TileLayer } from 'react-leaflet';

const App = () => (
  <MapContainer center={[35.3607411, 138.727262]} zoom={13}>
    <TileLayer
      attribution='&copy; <a href="https://maps.gsi.go.jp/development/ichiran.html">国土地理院</a>'
      url="https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png"
    />
  </MapContainer>
);
```

###  [国土地理院タイル](https://maps.gsi.go.jp/development/siyou.html)

国土地理院が配信するタイル状の地図データ

[標準地図](https://maps.gsi.go.jp/development/ichiran.html#std)をLearletで表示し、2つの地点間を[標高タイル](https://maps.gsi.go.jp/development/demtile.html)を使って断面図にします


詳細は下記を参照
* [国土地理院-地理院タイルについて](https://maps.gsi.go.jp/development/siyou.html)
* [緯度、経度をもとに国土地理院タイルを表示する方法](https://qiita.com/murasuke/items/ad81b7b726a3463fa3fe)

### 断面図

[標高タイル](https://maps.gsi.go.jp/development/demtile.html)で求めた2点間の標高を元に、[Plotly.js](https://plotly.com/javascript/)でグラフ化します

※[Chart.js](https://www.chartjs.org/)は、X軸とY軸を同じ比率にできない(距離と標高を正確に合わせられない)ため、[Plotly.js](https://plotly.com/javascript/)を利用している



## プログラムの概要

* 地図を表示する (App.tsx)
  * [React Leaflet](https://react-leaflet.js.org/)で、国土地理院タイルを表示する
  * マーカーの表示にちょっと癖があるので、正しく表示するための初期化を行う
  * 右上に「位置表示エリア」を表示

* 位置表示エリア (LocationDispArea.tsx)
  * クリックした位置の「標高」「緯度、経度」を表示

* 地図上にマーカーを表示 (LocationMarker.tsx)
  * クリックでマーカーを移動
  * マーカーをドラッグして地図上に線を引く
  * ドラッグが終わったタイミングで断面図を表示する

* 断面図 (CrossSectionDialog.tsx, CrossSectionGraph.tsx)
  * 断面図の作成方法は[2つの地点間の断面図(標高)をグラフで表示する](https://qiita.com/murasuke/items/03d7c4bf9e816a34b7f1)を参照
  * [rc-dialog](https://www.npmjs.com/package/rc-dialog) (React用のダイアログ表示ライブラリ)を使い、生成した断面図を表示する

https://qiita.com/murasuke/items/03d7c4bf9e816a34b7f1


### 利用ライブラリ
```
npm i leaflet plotly.js rc-dialog react-draggable react-leaflet react-plotly.js react-leaflet-custom-control
npm i -D @types/leaflet @types/react-plotly.js
```

* [react-draggable](https://www.npmjs.com/package/react-draggable) は、ダイアログの移動のために利用
 * [react-leaflet-custom-control](https://www.npmjs.com/package/react-leaflet-custom-control) は、地図(React Leaflet)上に、コントロールを配置するためのライブラリ

## プログラムソース説明

### App.tsx

```tsx

```
