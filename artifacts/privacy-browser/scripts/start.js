const http = require('http');
const net = require('net');
const { spawn } = require('child_process');

const PORT = parseInt(process.env.PORT || '19047', 10);
const METRO_PORT = PORT + 1;

function proxyRequest(req, res, targetPort) {
  const options = {
    hostname: '127.0.0.1',
    port: targetPort,
    path: req.url,
    method: req.method,
    headers: req.headers,
  };
  const proxy = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });
  proxy.on('error', () => {
    if (!res.headersSent) {
      res.writeHead(502);
      res.end('Metro not ready yet, please wait...');
    }
  });
  req.pipe(proxy, { end: true });
}

const server = http.createServer((req, res) => {
  proxyRequest(req, res, METRO_PORT);
});

server.on('upgrade', (req, socket, head) => {
  const targetSocket = net.connect(METRO_PORT, '127.0.0.1', () => {
    targetSocket.write(
      `${req.method} ${req.url} HTTP/1.1\r\n` +
      Object.entries(req.headers).map(([k, v]) => `${k}: ${v}`).join('\r\n') +
      '\r\n\r\n'
    );
    targetSocket.write(head);
    socket.pipe(targetSocket);
    targetSocket.pipe(socket);
  });
  targetSocket.on('error', () => socket.destroy());
  socket.on('error', () => targetSocket.destroy());
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[proxy] Listening on port ${PORT}, forwarding to Metro on ${METRO_PORT}`);

  const env = {
    ...process.env,
    PORT: String(METRO_PORT),
  };

  const expo = spawn('pnpm', ['exec', 'expo', 'start', '--localhost', `--port`, String(METRO_PORT)], {
    env,
    stdio: 'inherit',
    cwd: process.cwd(),
  });

  expo.on('exit', (code) => {
    console.log(`[expo] exited with code ${code}`);
    process.exit(code || 0);
  });
});

process.on('SIGTERM', () => process.exit(0));
process.on('SIGINT', () => process.exit(0));
