import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Offcanvas from 'react-bootstrap/Offcanvas';
import { Col, Row } from 'react-bootstrap';
import { useMap } from '../hooks/useMap';

import './LayerSwitcher.css';

export default function LayerSwitcher() {

  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const map = useMap();
  const [layers, setLayers] = useState(map.getAllLayers());

  /**
   *
   * @param {import('ol/layer/Layer.js').default} layer
   */
  const handleLayerChanged = (layer) => {
    layer.setVisible(!layer.getVisible());
    // TODO: use useEffect instead of state to rerender?
    setLayers(map.getAllLayers());
  };

  /**
   *
   * @param {import('ol/layer/Layer.js').default} layer
   */
  const handleRemoveLayer = (layer) => {
    map.removeLayer(layer);
    // TODO: use useEffect instead of state to rerender?
    setLayers(map.getAllLayers());
  };

  return (
    <>
      <Button variant="primary" onClick={handleShow}>
        Layers
      </Button>
      <Offcanvas show={show} onHide={handleClose}>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Layers</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Form className="layer-switcher-form">
            {
              layers.map((layer, index) => {
                const name = layer.get('name');
                return (
                  <Row key={index} className="mb-3">
                    <Form.Group as={Col} controlId={`layer-visible-${index}`} >
                      <Form.Check type="checkbox" label={name} checked={layer.getVisible()} onChange={handleLayerChanged.bind(null, layer)} />
                    </Form.Group>
                    <Form.Group as={Col} >
                      <Button variant="danger" size="sm" onClick={handleRemoveLayer.bind(null, layer)}>
                        Remove
                      </Button>
                    </Form.Group>
                  </Row>
                );
              })
            }
          </Form>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );

}
