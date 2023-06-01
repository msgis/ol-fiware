import React from 'react';
import { useCallback } from 'react';
import { useMap } from '../hooks/useMap';

import './Map.css';

export default function Map() {
  const map = useMap();
  const onMapRefChange = useCallback((node) => {
    if (node) {
      map.setTarget(node);
    }
  }, []);
  return (
    <div ref={onMapRefChange} className="map">
    </div>
  );
}
