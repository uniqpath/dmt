import crypto from 'crypto';

import { decode } from '../fiberHandle/encodePath.js';

function log(...args) {
  console.log(...args);
}

const sha256 = x =>
  crypto
    .createHash('sha256')
    .update(x, 'utf8')
    .digest('hex');

function fileNotFound({ providerAddress, fileName, res, host }) {
  console.log(`File not found: ${providerAddress} -- ${fileName}`);
  let pre = '';
  if (host.startsWith('localhost')) {
    pre = 'apps/zeta/';
  }

  res.redirect(`/${pre}?q=${fileName}&error=file_not_found`);
}

function contentServer({ app, fiberPool, defaultPort, emitter }) {
  log('Starting content server ...');

  if (!defaultPort) {
    throw new Error('Must provide default fiber port for content server ...');
  }

  import('fs').then(fs => {
    import('path').then(path => {
      app.use('/file', (req, res) => {
        const { place } = req.query;

        const { host } = req.headers;

        log(`Received content request ${place}`);

        if (place && place.includes('-')) {
          const [providerAddress, _directory] = place.split('-');
          const directory = decode(_directory);
          const fileName = decodeURIComponent(req.path.slice(1));
          const filePath = path.join(directory, fileName);

          if (emitter) {
            emitter.emit('file_request', { providerAddress, filePath, host });
          }

          if (providerAddress == 'localhost') {
            if (fs.existsSync(filePath)) {
              res.sendFile(filePath);
            } else {
              fileNotFound({ providerAddress, fileName, res, host });
            }

            return;
          }

          const sessionId = sha256(Math.random().toString());

          let ip;
          let port;

          if (providerAddress.includes(':')) {
            const [_ip, _port] = providerAddress.split(':');
            ip = _ip;
            port = _port;
          } else {
            ip = providerAddress;
            port = defaultPort;
          }

          fiberPool
            .getConnector(ip, port)
            .then(connector => {
              const context = { sessionId, res, connector };

              connector.on('file_not_found', ({ sessionId }) => {
                if (context.sessionId == sessionId) {
                  fileNotFound({ providerAddress, fileName, res, host });
                }
              });

              const binaryStartCallback = handleBinaryStart.bind(context);
              connector.on('binary_start', binaryStartCallback);

              const binaryDataCallback = handleBinaryData.bind(context);
              connector.on('binary_data', binaryDataCallback);

              const binaryEndCallback = handleBinaryEnd.bind(context);
              connector.on('binary_end', binaryEndCallback);

              const expandedContext = Object.assign(context, {
                attachedCallbacks: { start: binaryStartCallback, data: binaryDataCallback, end: binaryEndCallback }
              });

              connector.send({ tag: 'request_file', filePath, sessionId });

              res.once('drain', () => {
                log('DRAIN!!!');
              });

              setTimeout(dropLingeringConnection.bind(expandedContext), 60 * 1000);
              log(`Fiber-Content /get handler with SID=${sessionId} finished, fileName=${fileName}.`);
            })
            .catch(e => {
              res.status(503).send(e.message);
            });
        } else {
          res.status(404).send('Wrong file reference format, should be [ip]-[encodedRemoteDir]');
        }
      });
    });
  });
}

function dropLingeringConnection() {
  if (!this.finished) {
    log(`Dropping lingering connection: ${this.sessionId}`);
    removeListeners(this);
    this.res.end();
  }
}

function handleBinaryStart({ mimeType, fileName, contentLength, sessionId }) {
  if (this.sessionId == sessionId) {
    this.res.set({
      'Content-Dispositon': `attachment; filename="${encodeURIComponent(fileName)}"`,
      'Content-Type': mimeType,
      'Content-Length': contentLength
    });
  }
}

function handleBinaryData({ data, sessionId }) {
  if (this.sessionId == sessionId) {
    const flushed = this.res.write(data);

    if (!flushed) {
    } else {
      log('Data reported flushed!');
      log('TODO: still have to fix and optimize, see comments in code...');
    }
  }
}

function handleBinaryEnd({ sessionId }) {
  if (this.sessionId == sessionId) {
    removeListeners(this);
    this.res.end();

    this.finished = true;
  }
}

function removeListeners(expandedContext) {
  expandedContext.connector.removeListener('binary_start', expandedContext.attachedCallbacks.start);
  expandedContext.connector.removeListener('binary_data', expandedContext.attachedCallbacks.data);
  expandedContext.connector.removeListener('binary_end', expandedContext.attachedCallbacks.end);
}

export default contentServer;
