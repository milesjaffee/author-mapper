

export default function About() {
return (
    <div className="flex flex-col items-center p-4">
      <h1 className="text-6xl mb-4">Author Mapper</h1>

      <p>
          <strong>This project is not affiliated with Goodreads or Amazon.</strong> <a href="https://www.wikidata.org/wiki/Wikidata:Database_download" className="underline">Wikidata</a> is used to find authors' birthplaces, and <a href="https://leafletjs.com/" className="underline">Leaflet</a> is used to display the map. For any concerns or questions, please contact <a href="mailto:mej327@lehigh.edu" className="underline">mej327@lehigh.edu</a>.
        </p>

        <p className="mt-4"><a href="/">Return Home</a></p>

    </div>
);
}