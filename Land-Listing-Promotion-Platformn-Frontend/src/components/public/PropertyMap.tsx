import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Property } from '@/types/property';

interface PropertyMapProps {
  properties: Property[];
  activeId?: string | null;
  hoveredId?: string | null;
  onHover?: (id: string | null) => void;
}

type LocatedProperty = Property & { lat: number; lng: number };

const buildIcon = (property: LocatedProperty, isActive: boolean) => {
  const ringColor = isActive ? '#0A1F44' : '#ffffff';
  return L.divIcon({
    className: '',
    html: `
      <div style="display:flex;flex-direction:column;align-items:center;transform:translate(-50%,-100%);">
        <div style="width:44px;height:44px;border-radius:50%;overflow:hidden;border:3px solid ${ringColor};box-shadow:0 2px 8px rgba(15,23,42,0.3);">
          <img src="${property.imageUrl}" style="width:100%;height:100%;object-fit:cover;display:block;" />
        </div>
        <div style="width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:8px solid ${ringColor};margin-top:-1px;filter:drop-shadow(0 1px 1px rgba(0,0,0,0.2));"></div>
      </div>`,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
};

const FitToMarkers: React.FC<{ points: [number, number][] }> = ({ points }) => {
  const map = useMap();
  const key = points.map(([lat, lng]) => `${lat},${lng}`).join(';');

  useEffect(() => {
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView(points[0], 13);
    } else {
      map.fitBounds(L.latLngBounds(points), { padding: [48, 48] });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return null;
};

const HoverController: React.FC<{ hoveredId: string | null | undefined; markers: LocatedProperty[] }> = ({ hoveredId, markers }) => {
  const map = useMap();

  useEffect(() => {
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        if (hoveredId) {
          const target = markers.find(p => p.id === hoveredId);
          if (target) {
            const latLng = layer.getLatLng();
            if (Math.abs(latLng.lat - target.lat) < 0.0001 && Math.abs(latLng.lng - target.lng) < 0.0001) {
              layer.openPopup();
            }
          }
        } else {
          layer.closePopup();
        }
      }
    });
  }, [hoveredId, markers, map]);

  return null;
};

const MapMouseLeaveController: React.FC<{ onMouseLeaveMap: () => void }> = ({ onMouseLeaveMap }) => {
  const map = useMap();
  useEffect(() => {
    const container = map.getContainer();
    const handleMouseLeave = () => onMouseLeaveMap();
    container.addEventListener('mouseleave', handleMouseLeave);
    return () => container.removeEventListener('mouseleave', handleMouseLeave);
  }, [map, onMouseLeaveMap]);
  return null;
};

export const PropertyMap: React.FC<PropertyMapProps> = ({ properties, activeId, hoveredId, onHover }) => {
  const navigate = useNavigate();
  const located = useMemo(
    () => properties.filter((p): p is LocatedProperty => typeof p.lat === 'number' && typeof p.lng === 'number'),
    [properties]
  );

  const points: [number, number][] = useMemo(() => located.map(p => [p.lat, p.lng]), [located]);
  const center: [number, number] = points[0] ?? [31.5, 74.35];

  return (
    <MapContainer center={center} zoom={11} scrollWheelZoom className="w-full h-full">
      <TileLayer
        attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
      />
      <FitToMarkers points={points} />
      <HoverController hoveredId={hoveredId} markers={located} />
      <MapMouseLeaveController onMouseLeaveMap={() => onHover?.(null)} />
      {located.map(p => {
        const isHighlighted = p.id === activeId || p.id === hoveredId;
        return (
          <Marker
            key={p.id}
            position={[p.lat, p.lng]}
            icon={buildIcon(p, isHighlighted)}
            eventHandlers={{
              mouseover: () => onHover?.(p.id),
            }}
          >
            <Popup>
              <div className="w-52 text-xs">
                <img
                  src={p.imageUrl}
                  alt={p.title}
                  loading="lazy"
                  className="mb-3 h-24 w-full rounded-lg object-cover"
                />
                <p className="font-bold text-[#0A1F44]">RWF {p.price.toLocaleString()}</p>
                <p className="mt-1 line-clamp-1 font-semibold text-gray-800">{p.title}</p>
                <p className="mt-1 line-clamp-1 text-gray-500">{p.location}</p>
                <button type="button" onClick={() => navigate(`/properties/${p.id}`)} className="mt-3 w-full rounded-lg bg-brand-primary px-3 py-2 font-semibold text-white transition hover:bg-brand-primary-hover">View Details</button>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
};