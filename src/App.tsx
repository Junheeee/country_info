import { useEffect, useRef, useState } from 'react';
import mapboxgl, {
  GeoJSONSource,
  LngLatBoundsLike,
  Map,
  Marker
} from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import MapboxLanguage from '@mapbox/mapbox-gl-language';
import { ICountryGeo, ICountryOption } from './model/interface';
import { countryBorder } from './json';
import { handlerFeature, handlerFitBounds } from './utils/mapUtils';
import { MapboxMap } from './components/MapboxMap';
import { MAPBOX_TOKEN } from './configs/constants';

function App() {
  const mapContainer = useRef(null);
  const [mapObject, setMapObject] = useState<Map>();

  // 검색 input
  const [inputValue, setInputValue] = useState<string>('');
  // 모든 국가 geo
  const [countryGeo, setCountryGeo] = useState<ICountryGeo[]>([]);
  // 검색한 국가 geo
  const [searchGeo, setSearchGeo] = useState<ICountryGeo[]>([]);
  // 국가 마커
  const [markerList, setMarkerList] = useState<Marker[]>([]);

  // 국경선 데이터
  const borderGeoData: any = {
    type: 'FeatureCollection',
    features: []
  };

  useEffect(() => {
    handlerMapInit();
    handlerAllCountry();
  }, []);

  useEffect(() => {
    if (searchGeo.length > 0) {
      handlerMarkerSetting();
    }
  }, [searchGeo]);

  // 지도 초기화
  const handlerMapInit = () => {
    if (MAPBOX_TOKEN) {
      mapboxgl.accessToken = MAPBOX_TOKEN;

      const map = new mapboxgl.Map({
        container: 'map', // container ID
        style: 'mapbox://styles/mapbox/outdoors-v12', // style URL
        center: [126.612647, 37.519893], // starting position [lng, lat]
        zoom: 2,
        antialias: true,
        attributionControl: false
      });
      const language = new MapboxLanguage();
      map.addControl(language);

      map?.on('style.load', () => {
        if (!map.getSource('borderGeoData')) {
          map.addSource('borderGeoData', {
            type: 'geojson',
            data: borderGeoData
          });

          const borderGeoPolygon: any = {
            id: 'border-polygon',
            type: 'fill',
            source: 'borderGeoData',
            layout: {},
            paint: {
              'fill-color': '#999',
              'fill-opacity': 0.5,
              'fill-outline-color': '#000000'
            }
          };
          map.addLayer(borderGeoPolygon);
        }
      });

      setMapObject(map);
    }
  };

  // map 데이터 갱신
  const handlerSourceSetData = () => {
    mapObject
      ?.getSource<GeoJSONSource>('borderGeoData')
      ?.setData(borderGeoData);
  };

  // Marker 셋팅
  const handlerMarkerSetting = () => {
    if (mapObject) {
      if (markerList.length > 0) {
        markerList.map((marker: Marker) => {
          marker.remove();
        });
      }

      const markers = searchGeo.map((geo: ICountryGeo, idx: number) => {
        const el = document.createElement('div');
        el.className = 'marker country-marker';
        el.setAttribute('index', String(idx));

        // 마커 click 이벤트
        el.addEventListener('click', () => {
          handlerDrawBorder(geo);
        });

        const imgEl = document.createElement('img');
        imgEl.src = geo.properties.flag;
        imgEl.width = 50;

        el.appendChild(imgEl);

        const marker = new mapboxgl.Marker(el)
          .setLngLat([geo.geometry.coordinates[1], geo.geometry.coordinates[0]])
          .addTo(mapObject);

        return marker;
      });

      setMarkerList(markers);
    }
  };

  // res -> geojson 가공
  const handlerChangeGeoJson = (geoArr: any[]) => {
    const geojson: ICountryGeo[] = [];
    geoArr.map((country: any) => {
      const option: ICountryOption = {
        type: 'Point',
        coordinates: country.latlng,
        properties: {
          flag: country.flags.svg,
          official: country.name.official,
          kor: country.translations.kor.official,
          code: country.cca3
        }
      };
      const feature = handlerFeature(option);
      geojson.push(feature);
    });
    return geojson;
  };

  // 모든 나라 검색
  const handlerAllCountry = () => {
    fetch(`https://restcountries.com/v3.1/all`)
      .then(res => res.json())
      .then((json: any) => {
        const geojson = handlerChangeGeoJson(json);
        setCountryGeo(geojson);
        setSearchGeo(geojson);
      });
  };

  // 특정 나라 검색(kor -> code 변환 검색)
  const handlerCodeCountry = () => {
    // fetch(`https://restcountries.com/v3.1/alpha?codes=${searchCode}`)
    fetch(`https://restcountries.com/v3.1/translation/${inputValue}`)
      .then(res => res.json())
      .then((json: any) => {
        if (json.status === 404 || json.status === 400) {
          setInputValue('');
          setSearchGeo(countryGeo);
          borderGeoData.features = [];
          handlerSourceSetData();
          alert('검색 정보가 없습니다.');
        } else {
          const geojson: ICountryGeo[] = handlerChangeGeoJson(json);
          const bounds = new mapboxgl.LngLatBounds();

          if (geojson.length > 1) {
            setSearchGeo(geojson);
            geojson.map((geo: ICountryGeo) => {
              const coord = [
                geo.geometry.coordinates[1],
                geo.geometry.coordinates[0]
              ];
              bounds.extend(coord as LngLatBoundsLike);
            });
            mapObject?.fitBounds(bounds, { padding: 100 });
          } else {
            setSearchGeo(countryGeo);
            handlerDrawBorder(geojson[0]);
          }
        }
      });
  };

  // 국경선 생성 및 맵 fitBounds
  const handlerDrawBorder = (geo: ICountryGeo) => {
    const border: any = countryBorder.features.find(
      country => country.properties?.name === geo.properties.code
    );
    borderGeoData.features = [];

    if (border) {
      const type = border.geometry.type;
      const option: ICountryOption = {
        type: type,
        coordinates: border.geometry.coordinates,
        properties: {
          code: border.properties.description
        }
      };

      const feature = handlerFeature(option);

      // borderGeoData
      borderGeoData.features.push(feature);
      handlerSourceSetData();

      // fitBounds
      const bounds = handlerFitBounds(type, feature);
      mapObject?.fitBounds(bounds, { padding: 100 });
    }
  };

  const handlerChange = (e: any) => {
    setInputValue(e.target.value);
  };

  const handlerKeyDown = (e: any) => {
    if (e.key === 'Enter') handlerSearch();
  };

  // 검색
  const handlerSearch = () => {
    inputValue === '' ? handlerAllCountry() : handlerCodeCountry();
  };

  return (
    <>
      <div className='container'>
        <div className='search-box'>
          <i className='ri-earth-line' />
          <input
            type='text'
            list='countryList'
            placeholder='모든나라'
            value={inputValue}
            onChange={e => handlerChange(e)}
            onKeyDown={e => handlerKeyDown(e)}
          />
          <datalist id='countryList'>
            {countryGeo.map((country, idx: number) => {
              return <option key={idx} value={country.properties.kor} />;
            })}
          </datalist>
          <button className='ri-search-line' onClick={handlerSearch}></button>
        </div>

        <div className='country-box'>
          <MapboxMap map={mapContainer} />
        </div>
      </div>
    </>
  );
}

export default App;
