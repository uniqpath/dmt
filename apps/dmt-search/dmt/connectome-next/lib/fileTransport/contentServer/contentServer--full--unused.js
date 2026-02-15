import { decode } from '../fiberHandle/encodePath.js';

// TODO -- implement backpressure control, read about this:
// https://nodejs.org/es/docs/guides/backpressuring-in-streams/
// https://nodejs.org/api/stream.html#stream_stream

// TODO: refactor this, implement DataSource -- ?
// use this abstraction when streaming search results as well ...

function log(...args) {
  console.log(...args);
}

const sha256 = (crypto, x) => crypto.createHash('sha256').update(x, 'utf8').digest('hex');

// function getSHA256Function() {
//   return new Promise((success, reject) => {
//     import('crypto').then(crypto => {
//       const sha256 = x =>
//         crypto
//           .createHash('sha256')
//           .update(x, 'utf8')
//           .digest('hex');

//       success(sha256);
//     });
//   });
// }

function fileNotFound({ providerAddress, fileName, res, host }) {
  console.log(`File not found: ${providerAddress} -- ${fileName}`);
  // TODO!! won't work on localhost!! /home ... ?q ... is wrong!
  let pre = '';
  if (host.startsWith('localhost')) {
    pre = 'apps/search/';
  }

  res.redirect(`/${pre}?q=${fileName}&error=file_not_found`); // TODO uri encode fileName !
  //res.status(404).send(`File not found -- ${fileName}`);
}

// source: https://github.com/archiverjs/node-archiver/blob/master/examples/express.js
function contentServer({ app, connectorPool, defaultPort, emitter }) {
  log('Starting content server ...');

  if (!defaultPort) {
    throw new Error('Must provide default fiber port for content server ...');
  }

  import('crypto').then(crypto => {
    import('fs').then(fs => {
      import('path').then(path => {
        //getSHA256Function().then(sha256 => {
        app.use('/file', (req, res) => {
          // if we tried fetching the content too early, should try again ....
          // if (!connector.isConnected()) {
          //   res.end();
          //   return;
          // }

          const { place } = req.query;

          const { host } = req.headers;

          log(`Received content request ${place}`);

          if (place && place.includes('-')) {
            const [providerAddress, _directory] = place.split('-');
            const directory = decode(_directory);
            const fileName = decodeURIComponent(req.path.slice(1));
            const filePath = path.join(directory, fileName);

            if (emitter) {
              // for Swarm searches we don't have this yet....
              emitter.emit('file_request', { providerAddress, filePath, host });
            }

            //log(`FILEPATH: ${filePath}`);

            // LOCAL FILE
            if (providerAddress == 'localhost') {
              if (fs.existsSync(filePath)) {
                res.sendFile(filePath);
              } else {
                fileNotFound({ providerAddress, fileName, res, host }); // will this work? test
              }

              return;
            }

            // FILE COMING OVER ENCRYPTED FIBER

            res.status(404).send('This feature is on hold -- streaming files over encrypted fibers');
            return;

            const sessionId = sha256(crypto, Math.random().toString());

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

            connectorPool
              .getConnector({ address: ip, port })
              .then(connector => {
                //console.log(`GOT CONNECTOR, state: ${connector.isConnected()}`);

                // prepare ws data streaming handlers
                const context = { sessionId, res, connector };

                connector.on('file_not_found', ({ sessionId }) => {
                  if (context.sessionId == sessionId) {
                    // ok?
                    fileNotFound({ providerAddress, fileName, res, host });
                  }
                });

                // this will attach handlers multiple times!!
                // check if handlers already attached!!
                // we remove lingering connections but sitll, maybe it would be useful
                // TODO !!

                //if(!connector.contentServerHandlersAttached) {

                const binaryStartCallback = handleBinaryStart.bind(context);
                connector.on('binary_start', binaryStartCallback);

                const binaryDataCallback = handleBinaryData.bind(context);
                connector.on('binary_data', binaryDataCallback);

                const binaryEndCallback = handleBinaryEnd.bind(context);
                connector.on('binary_end', binaryEndCallback);

                const expandedContext = Object.assign(context, {
                  attachedCallbacks: { start: binaryStartCallback, data: binaryDataCallback, end: binaryEndCallback }
                });

                //const filePath = '/home/eclipse/.dmt/etc/sounds/soundtest/music.mp3';
                connector.send({ tag: 'request_file', filePath, sessionId });

                // const msg = { action: 'request', namespace: 'content', payload: { sessionId, filePath, requestHandle: id } };

                // connector.send(msg); // actually initiate streaming, binary data will arrive to the handleBinaryData handler

                //dropLingeringConnection.call(expandedContext);

                // TODO!! IMPLEMENT FOR TEST::: send "request_next_chunk over the wire" ... to let the server know it can send the next chunk into the connector
                //
                res.once('drain', () => {
                  log('DRAIN!!!');
                  //wait
                  // file.on('readable', write);
                  // write();
                });

                setTimeout(dropLingeringConnection.bind(expandedContext), 60 * 1000); // cancel any connection that is open for more than a minute (really extreme case but we do it to clean things up)
                // this should never be required except if our binary reader didn't return all the data in this time for some reason (error, really slow connection, really big file....)

                log(`Fiber-Content /get handler with SID=${sessionId} finished, fileName=${fileName}.`);
              })
              .catch(e => {
                res.status(503).send(e.message);
              });

            //res.send(`${providerAddress} / ${filePath}`);
          } else {
            res.status(404).send('Wrong file reference format, should be [ip]-[encodedRemoteDir]');
          }
        });
      });
    });
  });
}

function dropLingeringConnection() {
  // this == expandedContext

  if (!this.finished) {
    log(`Dropping lingering connection: ${this.sessionId}`);
    removeListeners(this);
    this.res.end();
  }
}

function handleBinaryStart({ mimeType, fileName, contentLength, sessionId }) {
  //log.yellow(`BRISI --- Growin ? Fixed... REMOVE THIS LOG LINE --- ${this.sessionId} / ${sessionId}`);

  // this == context
  if (this.sessionId == sessionId) {
    //log.write(`BINARY START ${sessionId}`);
    this.res.set({
      'Content-Dispositon': `attachment; filename="${encodeURIComponent(fileName)}"`, // not useful anymore, we pass filein url, as recommended: https://stackoverflow.com/a/216777
      'Content-Type': mimeType, // do we need that now ? probably a good ida
      //'Content-Type': 'application/octet-stream;',
      'Content-Length': contentLength
    });

    //this.res.setHeader('Content-Description', 'File Transfer');
    //this.res.setHeader();
    //this.res.setHeader('Content-Type', 'application/octet-stream');

    // this.res.setHeader('Content-Dispositon', `attachment; filename="${fileName}"`);
    // this.res.setHeader('Content-Type', mimeType);
  }
}

function handleBinaryData({ data, sessionId }) {
  // this == context
  if (this.sessionId == sessionId) {
    //console.log(`BINARY DATA ${sessionId}`);

    const flushed = this.res.write(data);

    if (!flushed) {
      // todo CHECK if we have to check the returned boolean and wait a bit until sending the next chunk!
      // log.red(
      //   `Data reported not flushed after res.write -- is everything working correctly? Consider holding off until drain event is emmited... check comments in source with links how to do it!`
      // );
      // https://stackoverflow.com/a/54901120
      // https://nodejs.org/api/http.html#http_response_write_chunk_encoding_callback
    } else {
      log('Data reported flushed!');
      log('TODO: still have to fix and optimize, see comments in code...');
    }
  }
}

function handleBinaryEnd({ sessionId }) {
  // this == expandedContext
  if (this.sessionId == sessionId) {
    //console.log(`BINARY END ${sessionId}`);
    removeListeners(this);
    //console.log(this);

    this.res.end();

    this.finished = true; // expandedContext.finished = true
  }
}

// TODO, fix:: dropLngering connections has a bug, context is not set:
// test by removing tg handlers in connector and connection will drop!
// // TODO:: fix!! -- add removeListeners back!!
//eclipse pid 632 3/23/2020, 9:16:25 PM 62914ms (+01ms) ∞ TypeError: expandedContext.connector.removeListener is not a function
// at removeListeners (file:///Users/david/.dmt/core/node/aspect-content/dmt-content/lib/contentServer.js:128:29)
// at Object.dropLingeringConnection (file:///Users/david/.dmt/core/node/aspect-content/dmt-content/lib/contentServer.js:75:5)
// at listOnTimeout (internal/timers.js:549:17)
// at processTimers (internal/timers.js:492:7)

function removeListeners(expandedContext) {
  expandedContext.connector.removeListener('binary_start', expandedContext.attachedCallbacks.start);
  expandedContext.connector.removeListener('binary_data', expandedContext.attachedCallbacks.data);
  expandedContext.connector.removeListener('binary_end', expandedContext.attachedCallbacks.end);
}

export default contentServer;
