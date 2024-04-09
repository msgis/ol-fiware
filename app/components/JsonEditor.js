import React, { useEffect, useState } from 'react';
import Form from 'react-bootstrap/Form';

import './JsonEditor.css';

function tryParseJSON(json) {
  try {
    return JSON.parse(json);
  } catch(error) {
    return null;
  }
}

/**
 * Entity attribute input control
 *
 * @param {object} props
 * @param {object} props.defaultValue
 * @param {Function} props.onChange
 * @returns
 */
export default function JsonEditor({ defaultValue, onChange }) {

  const [value, setValue] = useState('');
  const [rows, setRows] = useState(3);

  useEffect(() => {
    if (defaultValue) {
      setValue(JSON.stringify(defaultValue, null, 2));
      setRows(Object.entries(defaultValue).length + 2);
    }
  }, [defaultValue]);

  const onChangeObject = (e) => {
    setValue(e.target.value);
    const parsedValue = tryParseJSON(e.target.value);
    if (parsedValue) {
      onChange({
        target: {
          value: parsedValue
        }
      });
    }
  };

  return (
    <Form.Control as="textarea" rows={rows} value={value} isInvalid={!tryParseJSON(value)} onChange={onChangeObject}/>
  );

}
