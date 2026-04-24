export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ message: 'Method not allowed.' });
    return;
  }

  const lat = Array.isArray(req.query.lat) ? req.query.lat[0] : req.query.lat;
  const lon = Array.isArray(req.query.lon) ? req.query.lon[0] : req.query.lon;
  const radius = Array.isArray(req.query.radius) ? req.query.radius[0] : req.query.radius;

  if (!lat || !lon) {
    res.status(400).json({ message: 'Missing coordinates.' });
    return;
  }

  const safeRadius = Number.isFinite(Number(radius)) ? Math.max(100, Math.min(Number(radius), 10000)) : 5000;
  const query = `[out:json][timeout:25];(node["amenity"="recycling"](around:${safeRadius},${lat},${lon});way["amenity"="recycling"](around:${safeRadius},${lat},${lon});relation["amenity"="recycling"](around:${safeRadius},${lat},${lon}););out center;`;
  const url = new URL('https://overpass-api.de/api/interpreter');
  url.searchParams.set('data', query);

  try {
    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'ScrapNear/1.0 (https://scrapnear.vercel.app)'
      }
    });

    if (!response.ok) {
      const details = await response.text();
      res.status(response.status).json({ message: details || `Map data API error: ${response.statusText}` });
      return;
    }

    const data = await response.json();
    res.setHeader('Cache-Control', 's-maxage=120, stale-while-revalidate=300');
    res.status(200).json(data);
  } catch (error) {
    res.status(502).json({ message: 'Map data service is temporarily unavailable.' });
  }
}
