import fetch from 'node-fetch';

 const USER_AGENT = "milesjaffee/author-mapper mej327@lehigh.edu";

   // Simple in-memory cache (persists per serverless instance)
  const qidCache = new Map();
  let lastRequestTime = 0;

function sleep(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

async function getQID(author) {
  if (qidCache.has(author)) return qidCache.get(author);

  const url = `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(
    author
  )}&language=en&format=json&type=item&limit=4`;

  try {
    const resp = await rateLimitedFetch(url, { headers: { "User-Agent": USER_AGENT } });
    const data = await resp.json();

    if (!data.search || data.search.length === 0) return null;

    // Prefer literary descriptions
    const match =
      data.search.find((r) =>
        (r.description || "")
          .toLowerCase()
          .match(/writer|author|novelist|poet/)
      ) || data.search[0];

    qidCache.set(author, match.id);
    return match.id;
  } catch (e) {
    console.error(`[QID ERROR] ${author} `, e);
    return null;
  }
}

async function fetchBatch(qids) {
  if (qids.length === 0) return [];

  const values = qids.map((q) => `wd:${q}`).join(" ");

  const sparql = `
    SELECT ?person ?personLabel ?birthplace ?birthplaceLabel ?coords WHERE {
      VALUES ?person { ${values} }

      ?person p:P19 ?birthplaceStatement .
      ?birthplaceStatement ps:P19 ?birthplace .

      OPTIONAL { ?birthplace wdt:P625 ?coords . }

      SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
    }
  `;

  const url = `https://query.wikidata.org/sparql?format=json&query=${encodeURIComponent(
    sparql
  )}`;

  const resp = await fetch(url, {
    headers: { "User-Agent": USER_AGENT },
  });

  if (!resp.ok) {
    const text = await resp.text();
    console.error("[SPARQL ERROR]", text);
    return [];
  }

  const data = await resp.json();
  return data.results.bindings;
}

async function mapWithLimit(items, limit, asyncFn) {
  const results = [];
  let i = 0;

  async function worker() {
    while (i < items.length) {
      const current = i++;
      results[current] = await asyncFn(items[current]);
    }
  }

  const workers = Array.from({ length: limit }, worker);
  await Promise.all(workers);

  return results;
}



async function rateLimitedFetch(url, options = {}, minDelay = 300) {
  const now = Date.now();
  const wait = Math.max(0, minDelay - (now - lastRequestTime));

  if (wait > 0) {
    await new Promise((res) => setTimeout(res, wait));
  }

  lastRequestTime = Date.now();
  return fetch(url, options);
}

export default async function handler(req, res) {

  if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
  }
  const { books } = req.body;


  // Filter out to-read shelf and dedupe authors
  const authorsSet = new Set();
  const authorToShelf = {};

  for (const book of books) {
    if (book['Author']) {
      // Clean up author name (remove extra spaces)
      const cleanAuthor = book['Author'].replace(/\s+/g, ' ').trim();
      authorsSet.add(cleanAuthor);
      if (!authorToShelf[cleanAuthor] ||  authorToShelf[cleanAuthor] == 'to-read') authorToShelf[cleanAuthor] = book['Exclusive Shelf'];
    }
  }
  //console.log(authorsSet);

  const authors = Array.from(authorsSet);
  const coordToAuthors = {};

  const authorToQID = {};
  await mapWithLimit(authors, 3, async (author) => {
    const qid = await getQID(author);
    if (qid) authorToQID[author] = qid;
  });

  // Reverse lookup: QID → author
  const qidToAuthor = {};
  for (const [author, qid] of Object.entries(authorToQID)) {
    qidToAuthor[qid] = author;
  }

  const qids = Object.values(authorToQID);

  const batchSize = 20;

  for (let i = 0; i < qids.length; i += batchSize) {
    const batch = qids.slice(i, i + batchSize);

    const results = await fetchBatch(batch);

    const processedAuthors = new Set();
    for (const result of results) {
      if (!result.coords) continue;

      const wkt = result.coords.value;
      const match = wkt.match(/Point\(([^ ]+) ([^ ]+)\)/);
      if (!match) continue;

      const lon = parseFloat(match[1]);
      const lat = parseFloat(match[2]);

      const qid = result.person.value.split("/").pop();
      const author = qidToAuthor[qid];

      if (!author || processedAuthors.has(author)) continue;

      const key = `${lat.toFixed(4)},${lon.toFixed(4)}`;

      if (!coordToAuthors[key]) {
        coordToAuthors[key] = { lat, lon, authors: [] };
      }

      coordToAuthors[key].authors.push([author, authorToShelf[author]]);
      processedAuthors.add(author);
    }

    // Be nice to Wikidata
    await sleep(150);
  }

  const finalLocations = Object.values(coordToAuthors);

  res.status(200).json(finalLocations);
}