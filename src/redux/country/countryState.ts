export interface ICountryState {
  countryList: ICountry[];
}

export interface ICountry {
  altSpellings: string[];
  area: number;
  borders: string[];
  capital: string[];
  capitalInfo: { latlng: [number, number] };
  car: { signs: string[]; side: string };
  cca2: string;
  cca3: string;
  ccn3: string;
  cioc: string;
  coatOfArms: { png: string; svg: string };
  continents: string[];
  currencies: { [key: string]: { name: string; symbol: string } };
  demonyms: { eng: { f: string; m: string }; fra: { f: string; m: string } };
  fifa: string;
  flag: string;
  flags: { alt: string; png: string; svg: string };
  gini: { 2016: number };
  idd: { root: string; suffixes: string[] };
  independent: boolean;
  landlocked: boolean;
  languages: { [key: string]: string };
  latlng: [number, number];
  maps: { goolgeMaps: string; openStreetMaps: string };
  name: {
    common: string;
    nativeName: { [key: string]: { official: string; common: string } };
    official: string;
  };
  population: number;
  postalCode: { format: string; regex: string };
  region: string;
  startOfFWeek: string;
  status: string;
  subregion: string;
  timeZones: string[];
  tld: string[];
  translation: { [key: string]: string };
  unMember: boolean;
}
