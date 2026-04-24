export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ message: 'Method not allowed.' });
    return;
  }

  const query = Array.isArray(req.query.q) ? req.query.q[0] : req.query.q;

  if (!query) {
    res.status(400).json({ message: 'Missing search query.' });
    return;
  }

  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('q', query);
  url.searchParams.set('format', 'json');
  url.searchParams.set('limit', '1');
  url.searchParams.set('countrycodes', 'ph');

  try {
    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'ScrapNear/1.0 (https://scrapnear.vercel.app)'
      }
    });

    if (!response.ok) {
      const details = await response.text();
      res.status(response.status).json({ message: details || 'Geocoding service failed.' });
      return;
    }

    const data = await response.json();
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    res.status(200).json(data);
  } catch (error) {
    res.status(502).json({ message: 'Geocoding service is temporarily unavailable.' });
  }
}
