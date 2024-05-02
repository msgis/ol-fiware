import {Map, View} from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import OLCesium from 'olcs';

/** @type {Map} */
let map;

let map3d;

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

export function useMap3D() {
  if (!map) {
    map = createMap();
  }
  if (!map3d) {
    map3d = new OLCesium({ map });
  }
  return map3d;
}
