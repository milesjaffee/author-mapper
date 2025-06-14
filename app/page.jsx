'use client';

import { useState, useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import Papa from 'papaparse';
import dynamic from 'next/dynamic';
import sampleLocations from '@/components/SampleInfo';

const DynamicMap = dynamic(() => import('../components/Map'), {
  ssr: false, // Disable server-side rendering for this component
});

export default function Home() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [numBooks, setNumBooks] = useState(0);
  const [loadedBooks, setLoadedBooks] = useState(0);
  const [toReads, setToReads] = useState(false);

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
    }

  async function incrementLoadedBooks() {
    while (loading && loadedBooks < numBooks) {
      setLoadedBooks((prev) => Math.min(prev + 1, numBooks));
      await sleep(150);
    }
  }

  useEffect(() => {
    if (loading) {
      incrementLoadedBooks();
    }
  }, [loading, numBooks]);

  async function handleUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const csvData = results.data;

        setNumBooks(csvData.length);
        setLoadedBooks(0);
        setLoading(true);

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
      <div className="mb-4 border-1">
        <input id="csvInput" type="file" accept=".csv" onChange={handleUpload} className="underline" />
        <input type="button" value="(Use Sample Data)" className="italic underline" onClick={() => {
          setLocations(sampleLocations);
          setNumBooks(sampleLocations.length);
          setLoadedBooks(sampleLocations.length);
        }} />
      </div>
      <label>
          <input type="checkbox" id="toReads" checked={toReads} label="Include authors of the books on your 'to-read' list?" onChange={() => setToReads(!toReads)} className="mr-2" />
          Include authors of the books on your 'to-read' list?
      </label>
      {loading && <p>Processing... [{loadedBooks}/{numBooks}]</p>}
      {!loading && locations.length > 0 && (
        <DynamicMap locations={locations} seeToread={toReads}/>
      )}
      <div id="footer" className="mt-4">
        <p className="text-sm mt-5">
          Created by Miles Jaffee using Vercel. See the source on <a href="https://github.com/milesjaffee/author-mapper" className="underline">GitHub</a>. 
        </p>
        
      </div>
    </div>
  );
}