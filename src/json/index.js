import { GeoJSONFeature } from 'mapbox-gl';
import abw from './abw.json';
import afg from './afg.json';
import ago from './ago.json';
import aia from './aia.json';
import ala from './ala.json';
import alb from './alb.json';
import and from './and.json';
import arg from './arg.json';
import arm from './arm.json';
import asm from './asm.json';
import ata from './ata.json';
import atg from './atg.json';
import aus from './aus.json';
import aze from './aze.json';
import chn from './chn.json';
import dza from './dza.json';
import ind from './ind.json';
import jpn from './jpn.json';
import kor from './kor.json';
import rus from './rus.json';
import sgp from './sgp.json';
import xad from './xad.json';

export const countryBorder = {
  type: 'FeatureCollection',
  features: [
    ...abw.features,
    ...afg.features,
    ...ago.features,
    ...aia.features,
    ...ala.features,
    ...alb.features,
    ...and.features,
    ...arg.features,
    ...arm.features,
    ...asm.features,
    ...ata.features,
    ...atg.features,
    ...aus.features,
    ...aze.features,
    ...chn.features,
    ...dza.features,
    ...ind.features,
    ...jpn.features,
    ...kor.features,
    ...rus.features,
    ...sgp.features,
    ...xad.features
  ]
};
