import React from 'react';
import Container from 'react-bootstrap/Container';
import { createRoot } from 'react-dom/client';
import Map from './components/Map';
import MapTools from './components/MapTools';

import 'ol/ol.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './main.css';

function App() {
  return (
    <Container fluid className='container'>
      <Map />
      <MapTools />
    </Container>
  );
}

const root = createRoot(document.getElementById('root'));
root.render(<App />);
