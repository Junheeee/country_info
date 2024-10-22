import mapboxgl from 'mapbox-gl';

/**
 * geojson 형태로 반환
 * @param item
 * @returns
 */
export const handlerFeature = (item: any) => {
  return {
    type: 'Feature',
    geometry: {
      type: item.type,
      coordinates: item.coordinates
    },
    properties: {
      ...item.properties
    }
  };
};

/**
 * 국경선 feature 기반으로 fitBounds
 * @param type 'MultiPolygon' | 'Polygon'
 * @param feature
 * @returns
 */
export const handlerFitBounds = (
  type: 'MultiPolygon' | 'Polygon',
  feature: any
) => {
  const bounds = new mapboxgl.LngLatBounds();
  if (type === 'MultiPolygon') {
    feature.geometry.coordinates.map(
      (coord: [[[number, number]]], idx: number) => {
        if (idx % 5 === 0) {
          coord[0].map((co: [number, number]) => {
            bounds.extend(co);
          });
        }
      }
    );
  } else {
    feature.geometry.coordinates.map((coord: [[number, number]]) => {
      coord.map((co: [number, number]) => {
        bounds.extend(co);
      });
    });
  }

  return bounds;
};
