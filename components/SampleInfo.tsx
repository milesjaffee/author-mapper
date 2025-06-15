export interface Location {
    lat: number;
    lon: number;
    authors: [string, string][];
  }
  
  const sampleLocations: Location[] = [
    {
      lat: 48.8566,
      lon: 2.3522,
      authors: [['Victor Hugo', 'read']],
    },
    {
      lat: 40.7128,
      lon: -74.006,
      authors: [['James Baldwin', 'read'],
      ['Mark Z. Danielewski', 'read'],
        ['Jonathan Lethem', 'to-read']], 
    },
    {
      lat: 55.7558,
      lon: 37.6173,
      authors: [['Fyodor Dostoevsky', 'read']],
    },
    {
      lat: 52.5200,
      lon: 13.4050,
      authors: [['Hermann Hesse', 'to-read']],
    },
    {
      lat: 41.9028,
      lon: 12.4964,
      authors: [['Italo Calvino', 'read']],
    },
    {
      lat: 35.6895,
      lon: 139.6917,
      authors: [['Haruki Murakami', 'to-read']],
    },
    {
      lat: -23.5505,
      lon: -46.6333,
      authors: [['Clarice Lispector', 'read']],
    },
    {
      lat: 34.0522,
      lon: -118.2437,
      authors: [['Octavia E. Butler', 'read']],
    },
    {
      lat: 37.7749,
      lon: -122.4194,
      authors: [['Jack London', 'to-read']],
    },
    {
      lat: 19.4326,
      lon: -99.1332,
      authors: [['Juan Rulfo', 'read']],
    },
    {
      lat: 28.6139,
      lon: 77.2090,
      authors: [['Arundhati Roy', 'to-read']],
    },
    {
      lat: 31.2304,
      lon: 121.4737,
      authors: [['Lu Xun', 'read']],
    },
    {
      lat: -33.8688,
      lon: 151.2093,
      authors: [['Patrick White', 'read']],
    },
    {
      lat: 45.5017,
      lon: -73.5673,
      authors: [['Margaret Atwood', 'to-read']],
    },
  ];
  
  export default sampleLocations;