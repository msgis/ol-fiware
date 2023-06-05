/**
 * @module ol/source/NGSI
 */

import VectorSource from 'ol/source/Vector.js';
import NGSIFormat from '../format/NGSI';
import { all } from 'ol/loadingstrategy.js';
import { Connection } from 'ngsijs';

/**
 * @typedef {Object} Options
 * @property {import("ol/source/Source.js").AttributionLike} [attributions] Attributions.
 * @property {boolean} [overlaps=true] This source may have overlapping geometries.
 * Setting this to `false` (e.g. for sources with polygons that represent administrative
 * boundaries or TopoJSON sources) allows the renderer to optimise fill and
 * stroke operations.
 * @property {boolean} [useSpatialIndex=true]
 * By default, an RTree is used as spatial index. When features are removed and
 * added frequently, and the total number of features is low, setting this to
 * `false` may improve performance.
 *
 * Note that
 * {@link module:ol/source/Vector~VectorSource#getFeaturesInExtent},
 * {@link module:ol/source/Vector~VectorSource#getClosestFeatureToCoordinate} and
 * {@link module:ol/source/Vector~VectorSource#getExtent} cannot be used when `useSpatialIndex` is
 * set to `false`, and {@link module:ol/source/Vector~VectorSource#forEachFeatureInExtent} will loop
 * through all features.
 *
 * When set to `false`, the features will be maintained in an
 * {@link module:ol/Collection~Collection}, which can be retrieved through
 * {@link module:ol/source/Vector~VectorSource#getFeaturesCollection}.
 * @property {boolean} [wrapX=true] Wrap the world horizontally. For vector editing across the
 * -180° and 180° meridians to work properly, this should be set to `false`. The
 * resulting geometry coordinates will then exceed the world bounds.
 * @property {string} url base URL to NGSI API.
 * @property {string} entityType NGSI entity type.
 * @property {import('ol/proj.js').ProjectionLike} [dataProjection='EPSG:4326'] Default data projection.
 */

/**
 * @classdesc
 * Layer source for NGSI.
 * @api
 */
class NGSISource extends VectorSource {

  /**
   * @param {Options} options Cluster options.
   */
  constructor(options) {

    super({
      attributions: options.attributions,
      overlaps: options.overlaps,
      useSpatialIndex: options.useSpatialIndex,
      wrapX: options.wrapX,
      strategy: all
    });
    this.setLoader(
      createFeatureLoader({
        url: options.url,
        dataProjection: options.dataProjection || 'EPSG:4326',
        source: this,
        entityType: options.entityType
      })
    );

    /**
     * @private
     * @type {string|undefined}
     */
    this.url_ = options.url;

    /**
     * @private
     * @type {string|undefined}
     */
    this.entityType_ = options.entityType;

    /**
     * @private
     * @type {import('ol/proj.js').ProjectionLike}
     */
    this.dataProjection_ = options.dataProjection || 'EPSG:4326';

  }

  getUrl() {
    return this.url_;
  }

  getEntityType() {
    return this.entityType_;
  }

  /**
   * Listen for feature changes
   *
   * @param {string} eventSourceUrl
   */
  addSubscription(eventSourceUrl) {
    const sse = new EventSource(eventSourceUrl);
    sse.addEventListener('notification', (e) => {
      const data = JSON.parse(e.data);
      const payload = JSON.parse(data.payload);
      const entities = payload.data;
      const format = new NGSIFormat();
      /** @type {Connection} */
      const connection = new Connection(this.getUrl());
      entities.forEach(async ({ id }) => {
        const { entity } = await connection.v2.getEntity({
          id: id
        });
        const feature = this.getFeatureById(id);
        const newFeature = format.readFeature(entity, {
          dataProjection: this.dataProjection_,
          featureProjection: this.getProjection()
        });
        if (!feature) {
          this.addFeature(newFeature);
        } else {
          const geom = feature.getGeometry();
          feature.setProperties(newFeature.getProperties(), true);
          feature.setGeometry(geom);
        }
      });
    });
  }

}

export default NGSISource;

/**
 * @typedef {Object} CreateFetureLoaderOptions
 * @property {string} url base URL to NGSI API.
 * @property {string} entityType NGSI entity type.
 * @property {VectorSource} source source to add features to.
 * @property {import('ol/proj.js').ProjectionLike} [dataProjection='EPSG:4326'] Default data projection.
 */

/**
 * @param {CreateFetureLoaderOptions} options options.
 * @returns {import("ol/featureloader.js"} - feture loader function
 */
export function createFeatureLoader(options) {
  const format = new NGSIFormat();
  const url = options.url;
  const dataProjection = options.dataProjection || 'EPSG:4326';
  const entityType = options.entityType;
  const source = options.source;
  // https://ficodes.github.io/ngsijs/stable/index.html
  /** @type {Connection} */
  const connection = new Connection(url);
  /**
   * @param {import("ol/extent.js").Extent} extent Extent.
   * @param {number} resolution Resolution.
   * @param {import("ol/proj/Projection.js").default} projection Projection.
   * @param {function(Array<import("ol/Feature.js").default>): void} [success] Success
   *      Function called when loading succeeded.
   * @param {function(): void} [failure] Failure
   *      Function called when loading failed.
   */
  return function featureLoader(extent, resolution, projection, success, failure) {
    fetchAllEntities(connection, entityType).then((entites) => {
      const features = format.readFeatures(entites, {
        dataProjection: dataProjection,
        featureProjection: projection
      });
      source.addFeatures(features);
      success(features);
    }).catch(() => {
      source.removeLoadedExtent(extent);
      failure();
    });
  };
}

async function fetchAllEntities(connection, type) {
  const entites = [];
  let response;
  let offset = 0;
  const limit = 1000;
  do {
    response = await connection.v2.listEntities({
      type: type,
      limit: limit,
      offset: offset
    });
    entites.push(...response.results);
    offset += limit;
  } while(response && response.results.length);
  return entites;
}
