import {Map, View} from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';

/** @type {Map} */
let map;

function createMap() {
  return new Map({
    layers: [
      new TileLayer({
        name: 'OpenStreetMap',
        source: new OSM()
      })
    ],
    view: new View({
      center: [0, 0],
      zoom: 2
    })
  });
}

export function useMap() {
  if (!map) {
    map = createMap();
  }
  return map;
}
