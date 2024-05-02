import {Map, View} from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import OLCesium from 'olcs';
const Cesium = window.Cesium;

Cesium.Ion.defaultAccessToken = process.env.OLCS_ION_TOKEN;

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

function createMap3D() {
  const map3d = new OLCesium({ map });
  const scene = map3d.getCesiumScene();
  Cesium.Cesium3DTileset.fromIonAssetId(2275207).then((tileset) => {
    scene.primitives.add(tileset);
  });
  return map3d;
}

export function useMap3D() {
  if (!map) {
    map = createMap();
  }
  if (!map3d) {
    map3d = createMap3D();
  }
  return map3d;
}
