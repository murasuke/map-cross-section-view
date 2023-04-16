import React, { FC, useEffect, useState } from 'react';
import Dialog from 'rc-dialog';
import { LatLngLiteral } from 'leaflet';
import CrossSectionGraph from './CrossSectionGraph';
import 'rc-dialog/assets/index.css';

type propType = {
  visible: boolean;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
};

const CrossSectionDialog: FC<propType> = ({ visible, setVisible }) => {
  const [points, setPoints] = useState<LatLngLiteral[]>();
  const [ratio, setRatio] = useState<number>(1);
  useEffect(() => {
    // subscribe event
    document.addEventListener('showDialog', showDialog);
    return () => {
      // unsubscribe event
      document.removeEventListener('showDialog', showDialog);
    };
  });

  async function showDialog(data: CustomEvent<LatLngLiteral[]>) {
    setRatio(1);
    setPoints(data.detail);
    setVisible(true);
  }

  const onToggleDialog = () => {
    setVisible((value) => !value);
  };

  return (
    <>
      <Dialog
        visible={visible}
        animation="zoom"
        maskAnimation="fade"
        onClose={onToggleDialog}
        forceRender
      >
        <div>
          縦横比：
          <select
            id="ratio"
            value={ratio}
            onChange={(e) => setRatio(Number.parseInt(e.target.value))}
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
        {points && <CrossSectionGraph points={points} ratio={ratio} />}
      </Dialog>
    </>
  );
};

export default CrossSectionDialog;
