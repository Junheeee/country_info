import kor from './kor.json';
import jpn from './jpn.json';

export const countryBorder = {
  type: 'FeatureCollection',
  features: [...kor.features, ...jpn.features]
};
