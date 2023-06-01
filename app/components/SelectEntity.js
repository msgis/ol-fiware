import React, { useEffect, useState } from 'react';
import Form from 'react-bootstrap/Form';
import Select from 'ol/interaction/Select.js';
import { click as clickCondition } from 'ol/events/condition.js';
import { useMap } from '../hooks/useMap';

import './SelectEntity.css';

const interaction = new Select({
  condition: clickCondition
});
let selectHandler = null;
interaction.on('select', (e) => {
  selectHandler && selectHandler(e);
});

export default function SelectEntity({ onSelect }) {

  const [enabled, setEnabled] = useState(true);
  const handleEnabledChanged = () => {
    setEnabled(!enabled);
  };

  selectHandler = onSelect;

  const map = useMap();

  useEffect(() => {
    if (enabled) {
      map.addInteraction(interaction);
    } else {
      map.removeInteraction(interaction);
    }
  }, [enabled]);

  return (
    <>
      <Form.Group controlId="select-entity" >
        <Form.Check type="checkbox" label="Select entities" checked={enabled} onChange={handleEnabledChanged} />
      </Form.Group>
    </>
  );

}
