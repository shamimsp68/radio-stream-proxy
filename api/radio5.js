import http from 'http';

export default function handler(req, res) {
  const options = {
    hostname: '118.179.215.45',
    port: 8000,
    path: '/;',
    method: 'GET',
    headers: {
      'User-Agent': 'WinampMPEG/5.0',
      'Icy-MetaData': '1',
      'Connection': 'keep-alive'
    }
  };

  const proxyReq = http.request(options, (proxyRes) => {
    res.statusCode = proxyRes.statusCode || 200;

    res.setHeader(
      'Content-Type',
      proxyRes.headers['content-type'] || 'audio/mpeg'
    );

    res.setHeader('Cache-Control', 'no-cache, no-store');
    res.setHeader('Access-Control-Allow-Origin', '*');

    if (proxyRes.headers['icy-name']) {
      res.setHeader('icy-name', proxyRes.headers['icy-name']);
    }

    if (proxyRes.headers['icy-br']) {
      res.setHeader('icy-br', proxyRes.headers['icy-br']);
    }

    if (proxyRes.headers['icy-metaint']) {
      res.setHeader('icy-metaint', proxyRes.headers['icy-metaint']);
    }

    proxyRes.pipe(res);

    req.on('close', () => {
      proxyReq.destroy();
    });
  });

  proxyReq.on('error', (error) => {
    console.error('Radio Amber proxy error:', error);

    if (!res.headersSent) {
      res.status(502).send('Unable to connect to Radio Amber');
    } else {
      res.end();
    }
  });

  proxyReq.end();
}
