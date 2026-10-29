import http from 'http';

const PORT = 3001;
const TARGET_PORT = 3000;

const server = http.createServer((req, res) => {
  // If health check, return demo mode payload directly
  if (req.url.startsWith('/api/health')) {
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(JSON.stringify({
      status: 'ok',
      demoMode: true,
      aiStatus: 'demo_no_key',
      label: 'Demo mode: no API key',
      tooltip: 'Running deterministic templates. Set GEMINI_API_KEY in .env.local and restart the server to activate live AI.',
      model: null,
      timestamp: new Date().toISOString()
    }));
    return;
  }

  // Proxy everything else to target port 3000
  const proxyReq = http.request(
    {
      hostname: '127.0.0.1',
      port: TARGET_PORT,
      path: req.url,
      method: req.method,
      headers: req.headers,
    },
    (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res, { end: true });
    }
  );

  proxyReq.on('error', (err) => {
    res.writeHead(502, { 'Content-Type': 'text/plain' });
    res.end('Proxy Error: ' + err.message);
  });

  req.pipe(proxyReq, { end: true });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Demo secondary server listening on http://localhost:${PORT} (proxying to :${TARGET_PORT})`);
});

