import NGSISource from '../../ol/source/NGSI';
import {Icon, Style} from 'ol/style.js';
import SchwimmbadBlau from '../assets/schwimmbad_blau.png';
import SchwimmbadOrange from '../assets/schwimmbad_orange.png';
import SchwimmbadRot from '../assets/schwimmbad_rot.png';

const SchwimmbadKategorieImage = {
  '1': SchwimmbadBlau,
  '2': SchwimmbadOrange,
  '3': SchwimmbadRot
};

const styles = {
  'Schwimmbad': function (feature) {
    const kategorie = feature.get('AUSLASTUNG_AMPEL_KATEGORIE_0')
      || feature.get('https://uri.etsi.org/ngsi-ld/default-context/AUSLASTUNG_AMPEL_KATEGORIE_0')
      || '1';
    const imageSrc = SchwimmbadKategorieImage[kategorie] || SchwimmbadBlau;
    const style = new Style({
      image: new Icon({
        src: imageSrc,
        width: 40,
        height: 40
      }),
    });
    return style;
  }
};

/**
 *
 * @param {import('ol/layer/Vector.js').default} layer
 */
export function setSpecialLayerStyle(layer) {
  /** @type {import('../../ol/source/NGSI.js').default} */
  const source = layer.getSource();
  if (source instanceof NGSISource) {
    const entityType = source.getEntityType();
    layer.setStyle(styles[entityType.split('/').pop()]);
  }
}
