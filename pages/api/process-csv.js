import fetch from 'node-fetch';

export default async function handler(req, res) {

    function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
    }
    
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { books } = req.body;

  // Filter out to-read shelf and dedupe authors
  const authorsSet = new Set();
  for (const book of books) {
    if (book['Author']) {
      // Clean up author name (remove extra spaces)
      const cleanAuthor = book['Author'].replace(/\s+/g, ' ').trim();
      authorsSet.add([cleanAuthor, book['Exclusive Shelf']]);
    }
  }

  const authors = Array.from(authorsSet);
  const locations = [];
  const coordToAuthors = {};

  for (const authorObject of authors) {
    const [author, shelf] = authorObject;
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
        SELECT DISTINCT ?birthplace ?birthplaceLabel ?coords WHERE {
          wd:${entityId} p:P19 ?birthplaceStatement.
          ?birthplaceStatement ps:P19 ?birthplace.
          OPTIONAL {
            ?birthplace wdt:P625 ?coords.
          }
          SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
        }
        LIMIT 5
      `;

      const queryUrl = `https://query.wikidata.org/sparql?format=json&query=${encodeURIComponent(
        sparql
      )}`;

      //sleep(20);
      const sparqlResp = await fetch(queryUrl, {
        headers: { 'User-Agent': 'milesjaffee/author-mapper mej327@lehigh.edu' }
      });
      
      if (!sparqlResp.ok) {
        const errorText = await sparqlResp.text();
        console.error(`[SPARQL ERROR] ${author} → ${sparqlResp.status}: ${errorText}`);
        continue;
      }
      
      const sparqlData = await sparqlResp.json();
      const results = sparqlData.results.bindings;
      console.log(results[0]);

      let found = false;
      for (const result of results) {
        if (result.coords) {
            const coords = result.coords.value.match(/Point\(([^ ]+) ([^ ]+)\)/);
            if (coords) {
                const lat = parseFloat(coords[2]);
                const lon = parseFloat(coords[1]);
                const key = `${lat.toFixed(4)},${lon.toFixed(4)}`;
    
                if (!coordToAuthors[key]) {
                    coordToAuthors[key] = { lat, lon, authors: [] };
                }
    
                coordToAuthors[key].authors.push([author, shelf]);
                found = true;
                break;
            }
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
