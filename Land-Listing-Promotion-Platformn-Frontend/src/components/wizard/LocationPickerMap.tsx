import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Default center: Kigali, Rwanda — used when no coordinates have been picked yet.
const DEFAULT_CENTER: [number, number] = [-1.9536, 30.0605];

const pinIcon = L.divIcon({
  className: '',
  html: `
    <div style="transform:translate(-50%,-100%);">
      <svg width="34" height="44" viewBox="0 0 34 44" xmlns="http://www.w3.org/2000/svg" style="filter:drop-shadow(0 2px 4px rgba(15,23,42,0.35));">
        <path d="M17 0C7.6 0 0 7.6 0 17c0 12.75 17 27 17 27s17-14.25 17-27C34 7.6 26.4 0 17 0z" fill="#1B395F" />
        <circle cx="17" cy="17" r="7" fill="#ffffff" />
      </svg>
    </div>`,
  iconSize: [0, 0],
  iconAnchor: [0, 0],
});

interface ClickHandlerProps {
  onPick: (lat: number, lng: number) => void;
}

const ClickHandler: React.FC<ClickHandlerProps> = ({ onPick }) => {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

interface LocationPickerMapProps {
  lat: number | null;
  lng: number | null;
  onChange: (lat: number, lng: number) => void;
}

export const LocationPickerMap: React.FC<LocationPickerMapProps> = ({ lat, lng, onChange }) => {
  const position: [number, number] | null = useMemo(
    () => (lat !== null && lng !== null ? [lat, lng] : null),
    [lat, lng]
  );

  return (
    <div className="h-64 w-full overflow-hidden rounded-xl border border-[#E2E8F0]">
      <MapContainer center={position ?? DEFAULT_CENTER} zoom={position ? 14 : 8} scrollWheelZoom className="h-full w-full">
        <TileLayer
          attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        />
        <ClickHandler onPick={onChange} />
        {position && (
          <Marker
            position={position}
            icon={pinIcon}
            draggable
            eventHandlers={{
              dragend: (e) => {
                const marker = e.target as L.Marker;
                const { lat: newLat, lng: newLng } = marker.getLatLng();
                onChange(newLat, newLng);
              },
            }}
          />
        )}
      </MapContainer>
    </div>
  );
};
