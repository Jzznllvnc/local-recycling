export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ message: 'Method not allowed.' });
    return;
  }

  const lat = Array.isArray(req.query.lat) ? req.query.lat[0] : req.query.lat;
  const lon = Array.isArray(req.query.lon) ? req.query.lon[0] : req.query.lon;

  if (!lat || !lon) {
    res.status(400).json({ message: 'Missing coordinates.' });
    return;
  }

  const url = new URL('https://nominatim.openstreetmap.org/reverse');
  url.searchParams.set('format', 'json');
  url.searchParams.set('lat', lat);
  url.searchParams.set('lon', lon);
  url.searchParams.set('addressdetails', '1');

  try {
    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'ScrapNear/1.0 (https://scrapnear.vercel.app)'
      }
    });

    if (!response.ok) {
      const details = await response.text();
      res.status(response.status).json({ message: details || 'Reverse geocoding request failed.' });
      return;
    }

    const data = await response.json();
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    res.status(200).json(data);
  } catch (error) {
    res.status(502).json({ message: 'Reverse geocoding service is temporarily unavailable.' });
  }
}
