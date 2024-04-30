import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Offcanvas from 'react-bootstrap/Offcanvas';
import { Col, Row } from 'react-bootstrap';
import { useMap } from '../hooks/useMap';
import { useLayers } from '../hooks/useLayers';

import './LayerSwitcher.css';

export default function LayerSwitcher() {

  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const map = useMap();
  const { layers, findLayer } = useLayers();

  /**
   *
   * @param {import('ol/layer/Layer.js').default} layer
   */
  const handleLayerChanged = ({ name }) => {
    const layer = findLayer(name);
    layer.setVisible(!layer.getVisible());
  };

  /**
   *
   * @param {import('ol/layer/Layer.js').default} layer
   */
  const handleRemoveLayer = ({ name }) => {
    const layer = findLayer(name);
    map.removeLayer(layer);
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
                const name = layer.name;
                return (
                  <Row key={index} className="mb-3">
                    <Form.Group as={Col} controlId={`layer-visible-${index}`} >
                      <Form.Check type="checkbox" label={name} checked={layer.visible} onChange={handleLayerChanged.bind(null, layer)} />
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
