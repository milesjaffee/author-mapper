'use client';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Location {
    lat: number;
    lon: number;
    authors: string[];
  }
  
  interface MapProps {
    locations: Location[];
  }
  
  export default function DynamicMap({ locations }: MapProps) {
    const center: LatLngExpression = [20, 0]; // Explicitly type the center
  
    return (
      <MapContainer center={center} zoom={2} style={{ height: '600px', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {locations.map((loc, idx) => (
          <Marker key={idx} position={[loc.lat, loc.lon]}>
            <Popup>{loc.authors.join(', ')}</Popup>
          </Marker>
        ))}
      </MapContainer>
    );
  }
