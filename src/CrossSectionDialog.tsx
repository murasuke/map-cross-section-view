import React, { FC, useEffect, useState } from 'react';
import Dialog from 'rc-dialog';
import Draggable from 'react-draggable';
import { LatLngLiteral } from 'leaflet';
import CrossSectionGraph from './CrossSectionGraph';
import 'rc-dialog/assets/index.css';

type propType = {
  visible: boolean;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
};

/**
 * 断面図のダイアログ
 * ・位置アイコンをドラッグした際に発生する、MarkerDragEndイベントを捕捉
 * ・イベント経由で、2つの座標を受け取り断面図ダイアログを表示する
 * ・断面図(グラフ)自体の描画は、<CrossSectionGraph>側で行う
 * @param param0
 * @returns
 */
const CrossSectionDialog: FC<propType> = ({ visible, setVisible }) => {
  const [points, setPoints] = useState<LatLngLiteral[]>();
  const [ratio, setRatio] = useState<string>('1.0');
  const [disabled, setDisabled] = useState(true);
  useEffect(() => {
    // 位置アイコンを移動した際に発生する「MarkerDragEnd」イベントを講読する
    document.addEventListener('MarkerDragEnd', showDialog);
    return () => {
      // unsubscribe event
      document.removeEventListener('MarkerDragEnd', showDialog);
    };
  });

  // MarkerDragEndイベント経由で、2つの座標を受け取り断面図ダイアログを表示する
  async function showDialog(data: CustomEvent<LatLngLiteral[]>) {
    setRatio('1.0');
    setPoints(data.detail);
    setVisible(true);
  }

  const onToggleDialog = () => {
    setVisible((value) => !value);
  };

  /**
   * <Dialog> ダイアログ表示コンポーネント(rc-dialog)
   * <Draggable> ダイアログをドラッグで移動できるようにするためのコンポーネント
   * <CrossSectionGraph> 断面図
   */
  return (
    <>
      <Dialog
        visible={visible}
        animation="zoom"
        maskAnimation="fade"
        onClose={onToggleDialog}
        forceRender
        title={
          <div
            style={{
              width: '100%',
              cursor: 'pointer',
            }}
            onMouseOver={() => {
              if (disabled) {
                setDisabled(false);
              }
            }}
            onMouseOut={() => {
              setDisabled(true);
            }}
          >
            断面図
          </div>
        }
        modalRender={(modal) => (
          <Draggable disabled={disabled}>{modal}</Draggable>
        )}
      >
        <div>
          縦横比：
          <select
            id="ratio"
            value={ratio}
            onChange={(e) => setRatio(e.target.value)}
          >
            <option value="1.0">1.0</option>
            <option value="2.0">2.0</option>
            <option value="3.0">3.0</option>
            <option value="4.0">4.0</option>
            <option value="5.0">5.0</option>
            <option value="7.0">7.0</option>
            <option value="10.0">10.0</option>
            <option value="15.0">15.0</option>
            <option value="20.0">20.0</option>
            <option value="30.0">30.0</option>
            <option value="50.0">50.0</option>
          </select>
        </div>
        {points && (
          <CrossSectionGraph points={points} ratio={Number.parseInt(ratio)} />
        )}
      </Dialog>
    </>
  );
};

export default CrossSectionDialog;
