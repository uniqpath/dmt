import { loadModule } from '../../utils/index.js';

import BinaryReader from './binaryReader.js';

function streamFile({ channel, filePath, sessionId }) {
  import('fs').then(fs => {
    import('path').then(path => {
      loadModule('mime').then(mimeModule => {
        const mimeType = mimeModule.default.lookup(filePath);

        const contentLength = fs.statSync(filePath).size;

        channel.send(JSON.stringify({ tag: 'binary_start', fileName: path.basename(filePath), mimeType, contentLength, sessionId }));

        const binaryReader = new BinaryReader(channel);

        console.log(`fiber binary sending file: ${filePath}`);

        binaryReader.sendFile({ filePath, sessionId }).then(() => {
          channel.send(JSON.stringify({ tag: 'binary_end', mimeType, sessionId }));
        });
      });
    });
  });
}

export default streamFile;
