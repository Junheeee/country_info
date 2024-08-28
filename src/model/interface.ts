export interface ICountryGeo {
  type: string;
  geometry: {
    type: string;
    coordinates: number[];
  };
  properties: {
    flag: string;
    official: string;
    kor: string;
    code: string;
  };
}

export interface ICountryOption {
  type: string;
  coordinates: any;
  properties: {
    flag?: string;
    official?: string;
    kor?: string;
    code?: string;
  };
}
