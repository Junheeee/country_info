import React, { useEffect, useRef, useState } from 'react';
import mapboxgl, { Map } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface CountryList {
  name: string;
  kor: string;
  code: string;
}

function App() {
  const mapContainer = useRef(null);
  const [mapObject, setMapObject] = useState<Map>();

  const [inputValue, setInputValue] = useState('');
  const [countryList, setCountryList] = useState<CountryList[]>([]);
  const [searchList, setSearchList] = useState<any[]>([]);

  const [selectCountry, setSelectCountry] = useState<any>(null);

  useEffect(() => {
    handlerMapInit();
  }, []);

  useEffect(() => {
    if (selectCountry) {
      const detail = document.querySelector('.country-detail') as HTMLElement;
      const details = document.querySelector('.country-details') as HTMLElement;

      // detail.style.display = '';
      details.style.display = '';
      mapObject?.resize();
    }
  }, [selectCountry]);

  useEffect(() => {
    if (searchList.length > 0) {
      console.log(searchList, '---searchList');
    }
  }, [searchList]);

  useEffect(() => {
    if (countryList.length === 0) {
      fetch(`https://restcountries.com/v3.1/all`)
        .then(res => res.json())
        .then(json => {
          const arr: any[] = [];
          json.map((country: any) => {
            const option = {
              official: country.name.official,
              kor: country.translations.kor.official,
              code: country.cca3
            };
            arr.push(option);
          });
          setCountryList(arr);
        });
    }
  }, [countryList]);

  const handlerMapInit = () => {
    mapboxgl.accessToken =
      'pk.eyJ1IjoianVuaGVlZSIsImEiOiJjbGxnNWVhc3IweDJsM2dvYmI1ZXg2MGljIn0.EmSS1ocpPJv2ZaduQHmz_Q';

    const map = new mapboxgl.Map({
      container: 'map', // container ID
      style: 'mapbox://styles/mapbox/streets-v12', // style URL
      center: [126.612647, 37.519893], // starting position [lng, lat]
      zoom: 15,
      antialias: true,
      attributionControl: false
    });

    const preview: any = {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: []
      }
    };

    // map.on('style.load', () => {
    //   map.addSource('preview', preview);

    //   map.addLayer({
    //     id: 'polyline',
    //     type: 'line',
    //     source: 'preview',
    //     layout: {
    //       'line-cap': 'round',
    //       'line-join': 'round'
    //     },
    //     paint: {
    //       'line-color': '#283046',
    //       'line-width': 2
    //     },
    //     filter: ['==', ['get', 'id'], 'LINE']
    //   });
    // });

    setMapObject(map);
  };

  const handlerClick = (country: any) => {
    setSelectCountry(country);
  };

  const handlerChange = (e: any) => {
    setInputValue(e.target.value);
  };

  const handlerKeyDown = (e: any) => {
    if (e.key === 'Enter') {
      handlerSearch();
    }
  };

  const handlerSearch = () => {
    const container = document.querySelector('.container') as HTMLElement;
    const countryBox = document.querySelector('.country-box') as HTMLElement;

    const searchCodeArr: string[] = [];

    countryList.map((country: CountryList) => {
      if (country.kor.includes(inputValue)) {
        searchCodeArr.push(country.code);
      }
    });

    let searchCode = '';
    searchCodeArr?.forEach(code => {
      searchCode += `${code},`;
    });

    if (inputValue !== '') {
      fetch(`https://restcountries.com/v3.1/alpha?codes=${searchCode}`)
        .then(res => res.json())
        .then(json => {
          if (json.status === 404 || json.status === 400) {
            setSearchList([]);
            countryBox.style.display = 'flex';
          } else {
            countryBox.style.display = 'flex';
            // container.style.width = '700px';

            countryBox.scrollTop = 0;

            const arr: any[] = [];
            json?.forEach((item: any) => {
              arr.push(item);
            });
            setSearchList(arr);
          }
        });
    } else {
      fetch(`https://restcountries.com/v3.1/all`)
        .then(res => res.json())
        .then(json => {
          countryBox.style.display = 'flex';
          // container.style.width = '700px';

          const arr: any[] = [];
          json.forEach((item: any) => {
            arr.push(item);
          });
          setSearchList(arr);
        });
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
          {/* <datalist id='countryList'>
            {countryList.map(country => {
              return <option value={country.kor} />;
            })}
          </datalist> */}
          <button className='ri-search-line' onClick={handlerSearch}></button>
        </div>

        <div className='country-box' style={{ display: 'none' }}>
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
        </div>

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
