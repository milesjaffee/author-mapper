import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { books } = req.body;

  // Filter out to-read shelf and dedupe authors
  const authorsSet = new Set();
  for (const book of books) {
    if (book['Exclusive Shelf'] !== 'to-read' && book['Author']) {
      // Clean up author name (remove extra spaces)
      const cleanAuthor = book['Author'].replace(/\s+/g, ' ').trim();
      authorsSet.add(cleanAuthor);
    }
  }

  const authors = Array.from(authorsSet);
  const locations = [];
  const coordToAuthors = {};

  for (const author of authors) {
    try {
      const searchUrl = `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(
        author
      )}&language=en&format=json&type=item`;

      const searchResp = await fetch(searchUrl);
      const searchData = await searchResp.json();

      if (!searchData.search || searchData.search.length === 0) {
        console.log(`[WARN] No Wikidata entity found for ${author}`);
        continue;
      }

      const entityId = searchData.search[0].id;

      // Now get birthplace(s)
      const sparql = `
        SELECT DISTINCT ?birthplace ?birthplaceLabel ?lat ?lon WHERE {
          wd:${entityId} p:P19 ?birthplaceStatement.
          ?birthplaceStatement ps:P19 ?birthplace.
          OPTIONAL {
            ?birthplace wdt:P625 ?coords.
            BIND(geo:latitude(?coords) AS ?lat)
            BIND(geo:longitude(?coords) AS ?lon)
          }
          SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
        }
        LIMIT 5
      `;

      const queryUrl = `https://query.wikidata.org/sparql?format=json&query=${encodeURIComponent(
        sparql
      )}`;

      const sparqlResp = await fetch(queryUrl, { headers: { 'User-Agent': 'milesjaffee/author-mapper mej327@lehigh.edu' }});
      const sparqlData = await sparqlResp.json();
      const results = sparqlData.results.bindings;

      let found = false;
      for (const result of results) {
        if (result.lat && result.lon) {
          const lat = parseFloat(result.lat.value);
          const lon = parseFloat(result.lon.value);
          const key = `${lat.toFixed(4)},${lon.toFixed(4)}`;

          if (!coordToAuthors[key]) {
            coordToAuthors[key] = { lat, lon, authors: [] };
          }

          coordToAuthors[key].authors.push(author);
          found = true;
          break;
        }
      }

      if (!found) {
        console.log(`[WARN] No location with coordinates found for ${author}`);
      }

    } catch (err) {
      console.error(`[ERROR] Failed processing ${author}`, err);
    }
  }

  const finalLocations = Object.values(coordToAuthors);
  res.status(200).json(finalLocations);
}
