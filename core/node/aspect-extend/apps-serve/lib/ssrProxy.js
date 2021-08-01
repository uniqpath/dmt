import { log, determineGUIPort } from 'dmt/common';
import { createProxyMiddleware } from 'http-proxy-middleware';

export default (pathName = '', logger = true) => {
  const requestLogger = (proxyServer, options) => {
    proxyServer.on('proxyReq', (proxyReq, req, res) => {
      log.cyan(`${pathName}::[HPM] [${req.method}] ${req.url}`);
    });
  };
  const options = {
    target: `http://127.0.0.1:${determineGUIPort()}/`,
    plugins: logger && [requestLogger],
    pathRewrite: path => path.replace(`/${pathName}`, `/_${pathName}/${pathName}`)
  };

  return createProxyMiddleware(options);
};
