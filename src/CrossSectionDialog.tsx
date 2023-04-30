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
  const [ratio, setRatio] = useState<string>('1');
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

  const ratios = ['1', '2', '3', '4', '5', '7', '10', '15', '20', '30', '50'];
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
            {ratios.map((value) => (
              <option value={value}>{value}</option>
            ))}
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
