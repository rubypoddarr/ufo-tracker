import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet with React
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom UFO-like marker (cyan circle with glow)
const createUfoIcon = (color = '#22d3ee') => {
  return L.divIcon({
    className: 'custom-ufo-icon',
    html: `<div style="width: 12px; height: 12px; background-color: ${color}; border-radius: 50%; box-shadow: 0 0 10px ${color}, 0 0 20px ${color}; border: 1px solid white;"></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  });
};

export interface Sighting {
  id: number;
  latitude: number;
  longitude: number;
  city: string;
  state: string;
  country: string;
  shape: string;
  datetime: string;
  comments: string;
  duration_hours_min: string;
}

interface SightingsMapProps {
  sightings: Sighting[];
  selectedSightingId?: number | null;
}

// Helper to center map when selected sighting changes
function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 8);
  }, [center, map]);
  return null;
}

export const SightingsMap: React.FC<SightingsMapProps> = ({ sightings, selectedSightingId }) => {
  const selectedSighting = sightings.find(s => s.id === selectedSightingId);
  const defaultCenter: [number, number] = [37.0902, -95.7129]; // US Center

  return (
    <div className="h-full w-full rounded-lg overflow-hidden border border-border shadow-2xl relative">
      <MapContainer 
        center={defaultCenter} 
        zoom={4} 
        style={{ height: '100%', width: '100%', background: '#020617' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        {sightings.map((sighting) => {
          if (!sighting.latitude || !sighting.longitude) return null;
          
          const isSelected = sighting.id === selectedSightingId;
          
          return (
            <Marker 
              key={sighting.id} 
              position={[sighting.latitude, sighting.longitude]}
              icon={createUfoIcon(isSelected ? '#fbbf24' : '#22d3ee')}
            >
              <Popup className="ufo-popup">
                <div className="p-1 max-w-xs">
                  <h3 className="font-bold text-sm mb-1 uppercase tracking-wider text-primary">
                    {sighting.shape || 'Unknown Shape'} Detected
                  </h3>
                  <div className="text-xs space-y-1">
                    <p><span className="text-muted-foreground">Location:</span> {sighting.city}, {sighting.state} {sighting.country}</p>
                    <p><span className="text-muted-foreground">Date:</span> {sighting.datetime}</p>
                    {sighting.comments && (
                      <p className="mt-2 italic border-t pt-1 border-border/50 truncate">"{sighting.comments}"</p>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {selectedSighting && selectedSighting.latitude && selectedSighting.longitude && (
          <ChangeView center={[selectedSighting.latitude, selectedSighting.longitude]} />
        )}
      </MapContainer>
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-background/80 backdrop-blur-sm border border-border p-2 rounded text-[10px] uppercase tracking-tighter space-y-1">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_5px_#22d3ee]"></div>
          <span>Unidentified Sighting</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_5px_#fbbf24]"></div>
          <span>Selected Target</span>
        </div>
      </div>
    </div>
  );
};
