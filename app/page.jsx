'use client';

import { useState } from 'react';
import 'leaflet/dist/leaflet.css';
import Papa from 'papaparse';
import dynamic from 'next/dynamic';

const DynamicMap = dynamic(() => import('../components/Map'), {
  ssr: false, // Disable server-side rendering for this component
});

export default function Home() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);

  async function handleUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);

    Papa.parse(file, {
      header: true,
      complete: async (results) => {
        const csvData = results.data;

        const response = await fetch('/api/process-csv', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ books: csvData }),
        });

        const data = await response.json();
        setLocations(data);
        setLoading(false);
      },
    });
  }

  return (
    <div className="flex flex-col items-center p-4">
      <h1 className="text-2xl mb-4">Upload your Goodreads CSV</h1>
      <input type="file" accept=".csv" onChange={handleUpload} className="mb-4" />
      {loading && <p>Processing...</p>}
      {!loading && locations.length > 0 && (
        <DynamicMap locations={locations}/>
      )}
    </div>
  );
}