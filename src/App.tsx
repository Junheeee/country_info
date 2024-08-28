import { useEffect, useRef, useState } from 'react';
import mapboxgl, {
  GeoJSONSource,
  LngLatBoundsLike,
  Map,
  Marker
} from 'mapbox-gl';
import * as turf from '@turf/turf';
import 'mapbox-gl/dist/mapbox-gl.css';
import MapboxLanguage from '@mapbox/mapbox-gl-language';
import { ICountryGeo, ICountryOption } from './model/interface';
import { countryBorder } from './json';

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
    mapboxgl.accessToken =
      'pk.eyJ1IjoianVuaGVlZSIsImEiOiJjbGxnNWVhc3IweDJsM2dvYmI1ZXg2MGljIn0.EmSS1ocpPJv2ZaduQHmz_Q';

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
          countryBorder.features.map(country => {
            if (country.properties?.description == geo.properties.code) {
              borderGeoData.features = [];

              const option: ICountryOption = {
                type: 'MultiPolygon',
                coordinates: country.geometry.coordinates,
                properties: {
                  code: country.properties.description
                }
              };
              const feature = handlerFeature(option);

              // borderGeoData
              borderGeoData.features.push(feature);
              mapObject
                ?.getSource<GeoJSONSource>('borderGeoData')
                ?.setData(borderGeoData);

              // fitBounds
              const bounds = new mapboxgl.LngLatBounds();
              feature.geometry.coordinates.map(
                (coord: [[[number, number]]], idx: number) => {
                  if (idx % 10 === 0) {
                    coord[0].map((co: [number, number]) => {
                      bounds.extend(co);
                    });
                  }
                }
              );
              mapObject?.fitBounds(bounds, { padding: 40 });
            }
          });
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

  // res -> geojson 가공
  const handlerFeature = (item: any) => {
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
  const handlerCodeCountry = (searchCode: string) => {
    // fetch(`https://restcountries.com/v3.1/alpha?codes=${searchCode}`)
    fetch(`https://restcountries.com/v3.1/translation/${inputValue}`)
      .then(res => res.json())
      .then((json: any) => {
        if (json.status === 404 || json.status === 400) {
          setSearchGeo([]);
        } else {
          const geojson: ICountryGeo[] = handlerChangeGeoJson(json);
          setSearchGeo(geojson);

          const coordinates = geojson[0].geometry.coordinates;
          const lngLat = new mapboxgl.LngLat(coordinates[1], coordinates[0]);

          if (geojson.length !== 1) {
            const bounds = new mapboxgl.LngLatBounds();
            geojson.map((geo: ICountryGeo) => {
              const coord = [
                geo.geometry.coordinates[1],
                geo.geometry.coordinates[0]
              ];
              bounds.extend(coord as LngLatBoundsLike);
            });

            mapObject?.fitBounds(bounds, { padding: 100 });
          } else {
            mapObject?.flyTo({ center: lngLat });
          }
        }
      });
  };

  const handlerChange = (e: any) => {
    setInputValue(e.target.value);
  };

  const handlerKeyDown = (e: any) => {
    if (e.key === 'Enter') {
      // handlerSearch();
    }
  };

  // 검색
  const handlerSearch = () => {
    if (inputValue === '') {
      handlerAllCountry();
    } else {
      const searchCodeArr: string[] = [];

      countryGeo.map((country: ICountryGeo) => {
        if (country.properties.kor.includes(inputValue)) {
          searchCodeArr.push(country.properties.code);
        }
      });

      let searchCode = '';
      searchCodeArr?.forEach(code => {
        searchCode += `${code},`;
      });

      handlerCodeCountry(searchCode);
    }
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
          <div className='mapbox'>
            <div id='map' ref={mapContainer} className='map'></div>
          </div>
        </div>

        {/* <div className='country-box' style={{ display: 'none' }}>
          <div className='country-list'>
            {searchList?.length > 0 ? (
              searchList?.map(search => {
                return (
                  <div className='country'>
                    <div
                      className='country-img'
                      onClick={() => handlerClick(search)}
                    >
                      <img src={search.flags.svg} alt='' />
                    </div>
                    <p className='name'>{search.translations.kor.official}</p>
                  </div>
                );
              })
            ) : (
              <div className='country'>
                <p className='not-found'>검색결과가 없습니다.</p>
              </div>
            )}
          </div>

          <div className='country-details' style={{ display: 'none' }}>
            <div className='map-container'>
              <div id='map' ref={mapContainer} className='map'></div>
            </div>
          </div>
        </div> */}

        {/* <div className='country-detail' style={{ display: 'none' }}>
          <div className='map-container'>
            <div id='map' ref={mapContainer} className='map'></div>
          </div>
          <img src={selectCountry?.flags.svg} alt='' />
          <div className='weather-info'>(수도)날씨</div>
          <p>국가명: {selectCountry?.translations.kor.official}</p>
          <p>수도: {selectCountry?.capital[0]}</p>
          <p>
            국경(맞닿아 있는 국가):
            {selectCountry?.borders.map((border: string) => {
              return <>{border}</>;
            })}
          </p>
          <p>화폐단위: </p>
          <p>위치</p>
          <p>타임존</p>
        </div> */}
      </div>
    </>
  );
}

export default App;
