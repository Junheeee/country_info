interface Props {
  map: any;
}

export const MapboxMap = ({ map }: Props) => {
  return (
    <div className='mapbox'>
      <div id='map' ref={map} className='map'></div>
    </div>
  );
};
