import {Circle as CircleStyle, Stroke, Style} from 'ol/style.js';
import {easeOut} from 'ol/easing.js';
import {getVectorContext} from 'ol/render.js';
import {unByKey} from 'ol/Observable.js';

const duration = 3000;

function flash(layer, feature) {
  const start = Date.now();
  const flashGeom = feature.getGeometry().clone();
  const listenerKey = layer.on('postrender', animate);

  function animate(event) {
    const frameState = event.frameState;
    const elapsed = frameState.time - start;
    if (elapsed >= duration) {
      unByKey(listenerKey);
      return;
    }
    const vectorContext = getVectorContext(event);
    const elapsedRatio = elapsed / duration;
    // radius will be 5 at start and 30 at end.
    const radius = easeOut(elapsedRatio) * 25 + 5;
    const opacity = easeOut(1 - elapsedRatio);

    const style = new Style({
      image: new CircleStyle({
        radius: radius,
        stroke: new Stroke({
          color: 'rgba(255, 0, 0, ' + opacity + ')',
          width: 8 + opacity,
        }),
      }),
    });

    vectorContext.setStyle(style);
    vectorContext.drawGeometry(flashGeom);
    // tell OpenLayers to continue postrender animation
    layer.getMapInternal().render();
  }
}

/**
 * Add alert animation to source if features has been changed
 *
 * @param {import('ol/layer/Vector').default} layer
 */
export function addAlertAnimationToSource(layer) {

  const source = layer.getSource();

  source.on('addfeature', (e) => {
    flash(layer, e.feature);
  });
  source.on('changefeature', (e) => {
    flash(layer, e.feature);
  });

}
