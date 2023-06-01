/**
 * @module ol/format/NGSI
 */

import Feature from 'ol/Feature.js';
import JSONFeature from 'ol/format/JSONFeature.js';
import {get as getProjection} from 'ol/proj.js';
import {isEmpty} from 'ol/obj.js';
import GeoJSONFormat from 'ol/format/GeoJSON';

/**
 * @typedef {Object} Options
 * @property {import('ol/proj.js').ProjectionLike} [dataProjection='EPSG:4326'] Default data projection.
 * @property {import("ol/proj.js").ProjectionLike} [featureProjection] Projection for features read or
 * written by the format.  Options passed to read or write methods will take precedence.
 * @property {string} [geometryName] Geometry name to use when creating features.
 * @property {string} [typeName] NGSI type when writing features,
 * if unset the property `type` from the feature till be taken
 * @property {string} [geoProperty=location] name of NGSI GeoProperty
 */

/**
 * @classdesc
 * Feature format for reading and writing data in the NGSI format.
 *
 * @api
 */
class NGSI extends JSONFeature {
  /**
   * @param {Options} [options] Options.
   */
  constructor(options) {
    options = options ? options : {};

    super();

    /**
     * @type {import("ol/proj/Projection.js").default}
     */
    this.dataProjection = getProjection(
      options.dataProjection ? options.dataProjection : 'EPSG:4326'
    );

    if (options.featureProjection) {
      /**
       * @type {import("ol/proj/Projection.js").default}
       */
      this.defaultFeatureProjection = getProjection(options.featureProjection);
    }

    this.geoJsonFormat_ = new GeoJSONFormat({
      dataProjection: options.dataProjection,
      featureProjection: options.featureProjection,
      geometryName: options.geometryName
    });

    /**
     * Name of the geometry attribute for features.
     * @type {string|undefined}
     * @private
     */
    this.geometryName_ = options.geometryName;

    /**
     * Name of the NGSI type for features.
     * @type {string|undefined}
     * @private
     */
    this.typeName_ = options.typeName;

    /**
     * Name of the NGSI GeoProperty.
     * @type {string|undefined}
     * @private
     */
    this.geoProperty_ = options.geoProperty || 'location';

    this.supportedMediaTypes = [
      'application/json',
      'application/ld+json',
    ];
  }

  /**
   * @param {Object} object Object.
   * @param {import("ol/format/Feature.js").ReadOptions} [options] Read options.
   * @protected
   * @return {import("ol/Feature.js").default} Feature.
   */
  readFeatureFromObject(object, options) {
    const ngsiEntity = object;
    const geometry = this.readGeometryFromObject(object, options);
    const feature = new Feature();

    if (this.geometryName_) {
      feature.setGeometryName(this.geometryName_);
    }
    feature.setGeometry(geometry);

    if ('id' in ngsiEntity) {
      feature.setId(ngsiEntity['id']);
    }

    const properties = Object.keys(ngsiEntity).reduce((props, key) => {
      if (ngsiEntity[key] && ngsiEntity[key].type === 'Property') {
        props[key] = ngsiEntity[key].value;
      }
      return props;
    }, {});
    feature.setProperties(properties, true);

    return feature;
  }

  /**
   * @param {Object} object Object.
   * @param {import("ol/format/Feature.js").ReadOptions} [options] Read options.
   * @protected
   * @return {Array<Feature>} Features.
   */
  readFeaturesFromObject(object, options) {
    /** @type {Array<import("ol/Feature.js").default>} */
    let features = null;
    if (Array.isArray(object)) {
      features = [];
      const ngsiEntities = object;
      for (let i = 0, ii = ngsiEntities.length; i < ii; ++i) {
        features.push(this.readFeatureFromObject(ngsiEntities[i], options));
      }
    } else {
      features = [this.readFeatureFromObject(object, options)];
    }
    return features;
  }

  /**
   * @param {object} object Object.
   * @param {import("ol/format/Feature.js").ReadOptions} [options] Read options.
   * @protected
   * @return {import("ol/geom/Geometry.js").default} Geometry.
   */
  readGeometryFromObject(object, options) {
    const ngsiEntity = object;
    if (!ngsiEntity[this.geoProperty_]) {
      return null;
    }
    return this.geoJsonFormat_.readGeometry(ngsiEntity[this.geoProperty_].value, options);
  }

  /**
   * @param {Object} object Object.
   * @protected
   * @return {import("ol/proj/Projection.js").default} Projection.
   */
  readProjectionFromObject(object) {
    return this.geoJsonFormat_.readProjectionFromObject(object);
  }

  /**
   * Encode a feature as a NGSI Feature object.
   *
   * @param {import("ol/Feature.js").default} feature Feature.
   * @param {import("ol/format/Feature.js").WriteOptions} [options] Write options.
   * @return {object} Object.
   * @api
   */
  writeFeatureObject(feature, options) {
    options = this.adaptOptions(options);

    /** @type {object} */
    const object = {
      type: this.typeName_ || feature.get('type')
    };

    const id = feature.getId();
    if (id !== undefined) {
      object.id = id;
    }

    if (!feature.hasProperties()) {
      return object;
    }

    const properties = feature.getProperties();
    const geometry = feature.getGeometry();
    if (geometry) {
      object[this.geoProperty_] = this.geoJsonFormat_.writeGeometryObject(geometry, options);
      delete properties[feature.getGeometryName()];
    }

    if (!isEmpty(properties)) {
      Object.keys(properties).forEach((key) => {
        object[key] = {
          type: 'Property',
          value: properties[key]
        };
      });
    }

    return object;
  }

  /**
   * Encode an array of features as a NGSI object array.
   *
   * @param {Array<import("ol/Feature.js").default>} features Features.
   * @param {import("ol/format/Feature.js").WriteOptions} [options] Write options.
   * @return {object[]} NGSI Object array.
   * @api
   */
  writeFeaturesObject(features, options) {
    options = this.adaptOptions(options);
    const objects = [];
    for (let i = 0, ii = features.length; i < ii; ++i) {
      objects.push(this.writeFeatureObject(features[i], options));
    }
    return objects;
  }

}

export default NGSI;
