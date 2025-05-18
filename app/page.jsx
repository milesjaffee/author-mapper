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
  const [numBooks, setNumBooks] = useState(0);
  const [loadedBooks, setLoadedBooks] = useState(0);

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
    }

  const interval = setInterval(() => {
    if (loading) {
      sleep(333);
      setLoadedBooks((prev) => {
        if (prev + 1 >= numBooks) {
          clearInterval(interval);
          return numBooks;
        }
        return prev + 1;
      });
    }
  }, 100);

  async function handleUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const csvData = results.data;

        setNumBooks(csvData.length);

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
      <h1 className="text-6xl mb-4">Author Mapper</h1>
      <p className="text-lg mb-4">Upload a Goodreads CSV and see a map of all your favorite authors' birthplaces.</p>
      <p className="text-lg mb-4">Note: This may take a while to process, depending on the number of authors.</p>
      <p className="text-lg mb-4">Get your CSV file here: <a className="italic underline" href="https://www.goodreads.com/review/import">My Books - Import/Export</a></p>
      <input id="csvInput" type="file" accept=".csv" onChange={handleUpload} className="mb-4 underline" />
      {loading && <p>Processing... [{loadedBooks}/{numBooks}]</p>}
      {!loading && locations.length > 0 && (
        <DynamicMap locations={locations}/>
      )}
      <div id="footer" className="mt-4">
        <p className="text-sm">

        </p>
      </div>
    </div>
  );
}