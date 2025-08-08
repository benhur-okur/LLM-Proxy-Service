const { createProxyMiddleware } = require('http-proxy-middleware');
const BACKEND = 'https://localhost:5000';

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: BACKEND,
      changeOrigin: true,
      secure: false,
      logLevel: 'debug',
      pathRewrite: { '^/api': '' },
      cookieDomainRewrite: { '*': 'localhost' },
    })
  );
};