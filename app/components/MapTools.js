import React, { useState } from 'react';
import Stack from 'react-bootstrap/Stack';
import AddEntities from './AddEntities';
import LayerSwitcher from './LayerSwitcher';
import SelectEntity from './SelectEntity';
import EditEntity from './EditEntity';

import './MapTools.css';

export default function MapTools() {

  const [entity, setEntity] = useState(null);
  const [layer, setLayer] = useState(null);

  const handleEntitySelected = (e) => {
    const feature = e.target.getFeatures().getArray()[0] || null;
    setEntity(feature);
    setLayer(feature ? e.target.getLayer(feature) : null);
  };

  return (
    <Stack gap={2} className="mx-auto map-tools">
      <AddEntities />
      <LayerSwitcher />
      <SelectEntity onSelect={handleEntitySelected} />
      <EditEntity entity={entity} layer={layer} />
    </Stack>
  );

}
