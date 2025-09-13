import { GoogleMap, MarkerF, useLoadScript, HeatmapLayer } from '@react-google-maps/api';
import { useMemo, useState, useContext, useRef } from 'react';
import Context from '../Context';

const HeatMap = () => {
  const { state_transactions } = useContext(Context);
  const mapRef = useRef(null);
  const [zoom, setZoom] = useState(4);

  const { isLoaded } = useLoadScript({ 
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ['visualization'],
  });

  const center = useMemo(() => {
    if (!state_transactions.length) {
      return { lat: 0, lng: 0 };
    }

    let sumLat = 0, sumLng = 0;

    for (const t of state_transactions) {
      sumLat += Number(t.lat);
      sumLng += Number(t.lng);
    }

    return {
      lat: sumLat / state_transactions.length,
      lng: sumLng / state_transactions.length,
    };
  }, [state_transactions]);

  const handleZoomChanged = () => {
    if (mapRef.current) setZoom(mapRef.current.getZoom());
  };

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <GoogleMap
      mapContainerStyle={{ width: '100%', height: '400px' }}
      center={center}
      zoom={5}
      onLoad={(map) => { mapRef.current = map; }}
      onZoomChanged={handleZoomChanged}
      options={{
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControl: true,
        styles: [
          { featureType: 'poi', stylers: [{ visibility: 'off' }] },
          { featureType: 'transit', stylers: [{ visibility: 'off' }] },
          { featureType: 'road', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
          { featureType: 'water', stylers: [{ color: '#a0d3d3' }] },
          { featureType: 'landscape', stylers: [{ color: '#f5f5f5' }] }
        ]
      }}
    >
      <HeatmapLayer
        data={state_transactions.map(
          (t) => new google.maps.LatLng(Number(t.lat), Number(t.lng))
        )}
        options={{
          radius: 40,
          opacity: zoom < 13 ? 0.6 : 0,
        }}
      />

      {state_transactions.map(
        (t, i) =>
          t.lat &&
          t.lng && (
            <MarkerF
              key={i}
              position={{ lat: Number(t.lat), lng: Number(t.lng) }}
              title={t.transaction_name || ''}
              opacity={zoom >= 13 ? 1 : 0}
            />
          )
      )}
    </GoogleMap>
  );
};

export default HeatMap;
