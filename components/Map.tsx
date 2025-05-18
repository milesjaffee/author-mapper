'use client';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Location {
    lat: number;
    lon: number;
    authors: string[];
  }
  
  interface MapProps {
    locations: Location[];
  }

  delete (L.Icon.Default.prototype as any)._getIconUrl;

  L.Icon.Default.mergeOptions({
    iconRetinaUrl:
      'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl:
      'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl:
      'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
  
  export default function DynamicMap({ locations }: MapProps) {
    const center: L.LatLngExpression = [20, 0]; // Explicitly type the center
  
    return (
      <MapContainer center={center} zoom={2} style={{ height: '600px', width: '100%' }} attributionControl={true}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {locations.map((loc, idx) => (
          <Marker key={idx} position={[loc.lat, loc.lon]}>
            <Popup>{loc.authors.join(', ')}</Popup>
          </Marker>
        ))}
      </MapContainer>
    );
  }
