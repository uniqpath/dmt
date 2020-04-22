import fs from 'fs';
import path from 'path';
import mime from '../../mime/mime-types';

import BinaryReader from './binaryReader';

function streamFile({ channel, filePath, sessionId }) {
  const mimeType = mime.lookup(filePath);

  const contentLength = fs.statSync(filePath).size;

  channel.send(JSON.stringify({ tag: 'binary_start', fileName: path.basename(filePath), mimeType, contentLength, sessionId }));

  const binaryReader = new BinaryReader(channel);

  console.log(`fiber binary sending file: ${filePath}`);

  binaryReader.sendFile({ filePath, sessionId }).then(() => {
    channel.send(JSON.stringify({ tag: 'binary_end', mimeType, sessionId }));
  });
}

export default streamFile;
