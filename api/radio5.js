export default async function handler(req, res) {
  const STREAM_URL = 'http://118.179.215.45:8000/';

  try {
    const response = await fetch(STREAM_URL, {
      headers: {
        'User-Agent': 'WinampMPEG/5.0',
        'Icy-MetaData': '1'
      }
    });

    if (!response.ok) {
      return res.status(response.status).send('Radio stream unavailable');
    }

    res.setHeader(
      'Content-Type',
      response.headers.get('content-type') || 'audio/mpeg'
    );

    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Access-Control-Allow-Origin', '*');

    // SHOUTcast ICY headers
    const icyHeaders = [
      'icy-name',
      'icy-genre',
      'icy-br',
      'icy-metaint',
      'icy-url'
    ];

    for (const header of icyHeaders) {
      const value = response.headers.get(header);
      if (value) {
        res.setHeader(header, value);
      }
    }

    if (!response.body) {
      return res.status(502).send('No stream body received');
    }

    const reader = response.body.getReader();

    res.writeHead(200);

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        res.write(Buffer.from(value));
      }
    } finally {
      reader.releaseLock();
      res.end();
    }

  } catch (error) {
    console.error('Radio proxy error:', error);
    return res.status(502).send('Unable to connect to Radio Amber');
  }
}
