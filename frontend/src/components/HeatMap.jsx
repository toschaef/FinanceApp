import { GoogleMap, MarkerF, useLoadScript, HeatmapLayer, InfoWindowF } from '@react-google-maps/api';
import { useMemo, useState, useContext, useRef } from 'react';
import Context from '../Context';

const HeatMap = () => {
  const { state_transactions } = useContext(Context);
  const mapRef = useRef(null);
  const [map_zoom, setZoom] = useState(11);
  const [activeMarker, setActiveMarker] = useState(null);

  const { isLoaded } = useLoadScript({ 
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ['visualization'],
  });

  const center = useMemo(() => {
    const valid = state_transactions.filter(
      t => Number(t.lat) && Number(t.lng)
    );

    if (!valid.length) {
      return { lat: 39.8283, lng: -98.5795 };
    }

    let sumLat = 0, sumLng = 0;

    for (const t of valid) {
      sumLat += Number(t.lat);
      sumLng += Number(t.lng);
    }
    
    return {
      lat: sumLat / valid.length,
      lng: sumLng / valid.length,
    };
  }, [state_transactions]);

  const handleZoomChanged = () => {
    if (mapRef.current) setZoom(mapRef.current.getZoom());
  };

  const handleMarkerClick = (markerIndex) => {
    setActiveMarker(markerIndex);
  };

  const handleMouseOut = () => {
    setActiveMarker(null);
  };

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <GoogleMap
      mapContainerStyle={{ width: '100%', height: '100%' }}
      center={center}
      zoom={11}
      onLoad={(map) => { mapRef.current = map; }}
      onZoomChanged={handleZoomChanged}
      onClick={handleMouseOut}
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
        key='heatmap'
        data={
          state_transactions
          .filter(t => t.lat && t.lng)
          .map((t) => 
            new google.maps.LatLng(Number(t.lat), Number(t.lng))
          )}
        options={{
          radius: map_zoom < 20? 20 : 15,
          opacity: map_zoom < 13 ? 0.5 : 0 
        }}
      />

      {map_zoom >= 13 && state_transactions.map(
        (t, i) =>
          t.lat &&
          t.lng && (
            <MarkerF
              key={i}
              position={{ lat: Number(t.lat), lng: Number(t.lng) }}
              onClick={() => handleMarkerClick(i)}
            />
          )
      )}

      {activeMarker !== null && (
        <InfoWindowF
          position={{ 
            lat: Number(state_transactions[activeMarker].lat), 
            lng: Number(state_transactions[activeMarker].lng) 
          }}
          onCloseClick={handleMouseOut}
        >
          <div>
            <h4>{state_transactions[activeMarker].transaction_name || 'Transaction'}</h4>
            <p><strong>Amount:</strong> ${Number(state_transactions[activeMarker].amount).toFixed(2)}</p>
            <p><strong>Category:</strong> {state_transactions[activeMarker].finance_category}</p>
          </div>
        </InfoWindowF>
      )}
    </GoogleMap>
  );
};

export default HeatMap;