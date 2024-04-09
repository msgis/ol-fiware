import React, { useEffect, useState } from 'react';
import StateButton from './StateButton';
import Form from 'react-bootstrap/Form';
import Offcanvas from 'react-bootstrap/Offcanvas';
import NGSI from '../../ol/format/NGSI';
import axios from 'axios';
import JsonEditor from './JsonEditor.js';

import './EditEntity.css';

/**
 * Entity attribute input control
 *
 * @param {object} props
 * @param {*} props.value
 * @param {Function} props.onChange
 * @returns
 */
function AttributeInput({ value, onChange }) {

  if (typeof(value) === 'object') {
    return (
      <JsonEditor defaultValue={value} onChange={onChange}/>
    );
  }
  return (
    <Form.Control type="text" value={value} onChange={onChange}/>
  );

}

/**
 * Edit entity feature form
 *
 * @param {object} props
 * @param {import('ol/Feature.js').default} props.entity
 * @param {import('ol/layer/Vector.js').default} props.layer
 * @returns
 */
function EditEntityForm({ entity, layer }) {

  const [properties, setProperties] = useState(entity.getProperties());
  const [formState, setFormState] = useState('');

  const keys = Object.keys(properties).filter((name) => {
    return name !== entity.getGeometryName();
  });

  const handlePropertyChanged = (key, e) => {
    entity.set(key, e.target.value);
    setProperties(entity.getProperties());
  };

  const handleSave = () => {
    setFormState('loading');
    /** @type {import('../../ol/source/NGSI.js').default} */
    const source = layer.getSource();
    const contextBrokerUrl = source.getUrl();
    const entityType = source.getEntityType();
    const format = new NGSI({
      typeName: entityType,
      dataProjection: 'EPSG:4326',
      featureProjection: 'EPSG:3857'
    });
    const entityObj = format.writeFeatureObject(entity);
    delete entityObj.id;
    delete entityObj.type;
    axios.patch(`${contextBrokerUrl}/ngsi-ld/v1/entities/${entity.getId()}/attrs`, entityObj)
      .then(() => {
        setFormState('success');
      })
      .catch(() => {
        setFormState('danger');
      });
  };

  const friendlyKey = (key) => {
    return key.split('/').pop();
  };

  return (
    <Form className="edit-entity-form">
      <Form.Group className="mb-3">
        <Form.Label>ID</Form.Label>
        <Form.Control type="text" value={entity.getId()} disabled />
        <Form.Text className="text-muted">
          Entity ID.
        </Form.Text>
      </Form.Group>
      {
        keys.map((key) => {
          const value = properties[key];
          return (
            <Form.Group key={key} className="mb-3">
              <Form.Label>{friendlyKey(key)}</Form.Label>
              <AttributeInput value={value} onChange={handlePropertyChanged.bind(this, key)}/>
            </Form.Group>
          );
        })
      }
      <StateButton variant="primary" type="button" onClick={handleSave} state={formState}>
        Save
      </StateButton>
    </Form>
  );

}

/**
 * Edit entity feature
 *
 * @param {object} props
 * @param {import('ol/Feature.js').default} props.entity
 * @param {VectorLayer} props.layer
 * @returns
 */
export default function EditEntity({ entity, layer }) {

  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);

  useEffect(() => {
    if (entity) {
      setShow(true);
    }
  }, [entity]);

  return (
    <>
      <Offcanvas show={show} onHide={handleClose}>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Edit entity</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          { entity ? <EditEntityForm entity={entity} layer={layer} /> : null }
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );

}
