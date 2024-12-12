const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://cijene-me-api.onrender.com',
      changeOrigin: true,
      pathRewrite: {
        '^/api': '',
      },
      onProxyReq: (proxyReq, req, res) => {
        console.log('Proxy Request:', {
          path: req.path,
          method: req.method,
          headers: req.headers
        });
      },
      onProxyRes: (proxyRes, req, res) => {
        console.log('Proxy Response:', {
          path: req.path,
          method: req.method,
          status: proxyRes.statusCode
        });
      },
      onError: (err, req, res) => {
        console.error('Proxy Error:', err);
        res.writeHead(500, {
          'Content-Type': 'application/json',
        });
        res.end(JSON.stringify({ message: 'Proxy Error' }));
      }
    })
  );
};