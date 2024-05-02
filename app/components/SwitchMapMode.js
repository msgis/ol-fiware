import React from 'react';
import Button from 'react-bootstrap/Button';
import { useMap3D } from '../hooks/useMap';

export default function SwitchMapMode() {

  const map3d = useMap3D();

  const handleSwitchMode = function() {
    map3d.setEnabled(!map3d.getEnabled());
  };

  return (
    <>
      <Button variant="primary" onClick={handleSwitchMode}>
        3D {'<>'} 2D
      </Button>
    </>
  );

}
