const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    '/naver-api',
    createProxyMiddleware({
      target: 'https://naveropenapi.apigw.ntruss.com',
      changeOrigin: true,
      secure: true,
      pathRewrite: { '^/naver-api': '' },
      onProxyReq: (proxyReq) => {
        const keyId = process.env.NCP_API_KEY_ID;
        const key = process.env.NCP_API_KEY;
        if (keyId && key) {
          proxyReq.setHeader('X-NCP-APIGW-API-KEY-ID', keyId);
          proxyReq.setHeader('X-NCP-APIGW-API-KEY', key);
        }
      }
    })
  );
};

