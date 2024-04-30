import { useMap } from './useMap';
import { useSyncExternalStore } from 'react';
import deepEqual from 'deep-equal';

/** @type {import('ol/Map').default} */
let map;

let currentSnapshot = {};
let listeners = [];

function filterComplexTypes(obj) {
  return Object.entries(obj).reduce((newObj, [key, value]) => {
    if (typeof value !== 'object') {
      newObj[key] = value;
    }
    return newObj;
  }, {});
}

function createSnapshot() {
  const layers = map.getAllLayers();
  return layers.map((layer) => {
    return filterComplexTypes(layer.getProperties());
  });
}

function getSnapshot() {
  const newSnapshot = createSnapshot();
  if (!deepEqual(currentSnapshot, newSnapshot, { strict: true })) {
    currentSnapshot = newSnapshot;
  }
  return currentSnapshot;
}

function handleLayersChanged() {
  const layers = map.getLayers();
  layers.forEach((layer) => {
    layer.un('propertychange', handleLayerChanged);
    layer.on('propertychange', handleLayerChanged);
  });
  for (let listener of listeners) {
    listener();
  }
}

function handleLayerChanged() {
  for (let listener of listeners) {
    listener();
  }
}

function subscribe(listener) {
  listeners = [...listeners, listener];
  return () => {
    listeners = listeners.filter(l => l !== listener);
  };
}

/**
 * Find the layer instance
 *
 * @param {string} name
 * @returns {import('ol/layer/Layer.js').default}
 */
function findLayer(name) {
  return map.getAllLayers().find((layer) => {
    return layer.get('name') === name;
  });
}

export function useLayers() {
  if (!map) {
    map = useMap();
    const layers = map.getLayers();
    layers.on('add', handleLayersChanged);
    layers.on('remove', handleLayersChanged);
    layers.forEach((layer) => layer.on('propertychange', handleLayerChanged));
  }
  return {
    layers: useSyncExternalStore(subscribe, getSnapshot),
    findLayer: findLayer
  };
}
