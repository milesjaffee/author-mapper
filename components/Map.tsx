'use client';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Location {
  lat: number;
  lon: number;
  authors: [string, string][]; // [name, shelf]
}

interface MapProps {
  locations: Location[];
  seeToread?: boolean;
}

delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function DynamicMap({ locations, seeToread = true }: MapProps) {
  const center: L.LatLngExpression = [20, 0];

  return (
    <MapContainer center={center} zoom={2} style={{ height: '600px', width: '100%' }} attributionControl={true}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {locations.map((loc, idx) => {
        const authorMap = new Map<string, string>();

        //deduplicate authors
        for (const [name, shelf] of loc.authors) {
          if (!authorMap.has(name) || (authorMap.get(name) === 'to-read' && shelf !== 'to-read')) {
            authorMap.set(name, shelf);
          }
        }

        //filter out to-read authors if seeToread is false
        const visibleAuthors = Array.from(authorMap.entries()).filter(
          ([, shelf]) => seeToread || shelf !== 'to-read'
        );

        if (visibleAuthors.length === 0) return null;

        return (
          <Marker key={idx} position={[loc.lat, loc.lon]}>
            <Popup>
              {visibleAuthors.map(([name, shelf], i) => (
                <div key={i} className="text-base">
                {name} <small>({shelf})</small>
                </div>
              ))}
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}