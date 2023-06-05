import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Offcanvas from 'react-bootstrap/Offcanvas';
import { fetchEntityTypes, fetchEventSourceUrls } from '../lib/ngsi';
import { Connection } from 'ngsijs';
import VectorLayer from 'ol/layer/Vector';
import NGSISource from '../../ol/source/NGSI';
import { useMap } from '../hooks/useMap';

import './AddEntities.css';
import { addAlertAnimationToSource } from '../lib/ol-alert-animation';

export default function AddEntities() {

  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const [url, setUrl] = useState('http://localhost:2026');
  const handleUrlChanged = (e) => {
    e.preventDefault();
    setUrl(e.target.value);
  };

  const [eventSourceUrls, setEventSourceUrls] = useState([]);
  const [entityTypes, setEntityTypes] = useState([]);
  const handleLoadEntityTypes = async () => {
    const connection = new Connection(url);
    const types = await fetchEntityTypes(connection);
    setEntityTypes(types);
    setEntityType(types[0]);
    setEventSourceUrls(await fetchEventSourceUrls(url));
  };

  const findEventSourceUrl = function(type) {
    const shortType = type.split('/').pop();
    const urlObj = eventSourceUrls.find((u) => {
      return u.type === shortType;
    });
    return urlObj ? urlObj.url : '';
  };

  const [entityType, setEntityType] = useState('');
  const handleEntityTypeChanged = (e) => {
    e.preventDefault();
    setEntityType(e.target.value);
  };

  const [subscribeToEventSource, setSubscribeToEventSource] = useState(false);
  const handleSubscribeToEventSourceChanged = (e) => {
    setSubscribeToEventSource(e.target.checked);
    if (e.target.checked) {
      setEventSourceUrl(findEventSourceUrl(entityType));
    }
  };

  const [eventSourceUrl, setEventSourceUrl] = useState('');
  const handleEventSourceUrlChanged = (e) => {
    e.preventDefault();
    setEventSourceUrl(e.target.value);
  };

  const map = useMap();
  const handleAddToMap = async () => {
    const source = new NGSISource({
      url: url,
      entityType: entityType,
    });
    const layer = new VectorLayer({
      name: entityType.split('/').pop(),
      source: source
    });
    map.addLayer(layer);
    if (subscribeToEventSource) {
      source.addSubscription(eventSourceUrl);
    }
    setShow(false);
  };

  return (
    <>
      <Button variant="primary" onClick={handleShow}>
        Add entities
      </Button>
      <Offcanvas show={show} onHide={handleClose}>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Add entities from context broker</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Form className="add-entries-form">
            <Form.Group className="mb-3">
              <Form.Label>NGSI Url</Form.Label>
              <Form.Control type="url" placeholder="http://localhost:1026" value={url} onChange={handleUrlChanged} />
              <Form.Text className="text-muted">
                URL to Context Broker supporting NGSI.
              </Form.Text>
            </Form.Group>
            <Button variant="secondary" type="button" onClick={handleLoadEntityTypes}>
              Load entity types
            </Button>
            <Form.Group className="mb-3">
              <Form.Label>Entity type</Form.Label>
              <Form.Select
                disabled={!entityTypes.length}
                value={entityType}
                onChange={handleEntityTypeChanged}
              >
                {
                  entityTypes.map((name) => {
                    return (<option value={name} key={name}>{name.split('/').pop()}</option>);
                  })
                }
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Check
                type="switch"
                id="subscribe-to-eventsource"
                label="Subscribe to changes"
                onChange={handleSubscribeToEventSourceChanged}
                checked={subscribeToEventSource}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Event Source Url</Form.Label>
              <Form.Control type="url" placeholder="" value={eventSourceUrl} disabled={!subscribeToEventSource} onChange={handleEventSourceUrlChanged} />
              <Form.Text className="text-muted">
                URL to Event Source endpoint to listen for changes,
                usually to a NGSI Proxy Event Source.
              </Form.Text>
            </Form.Group>
            <Button variant="primary" type="button" onClick={handleAddToMap}>
              Add to map
            </Button>
          </Form>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );

}
