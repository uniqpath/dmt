import fs from 'fs';

function toArrayBuffer(buf) {
  const ab = new ArrayBuffer(buf.length);
  const view = new Uint8Array(ab);
  for (let i = 0; i < buf.length; ++i) {
    view[i] = buf[i];
  }
  return ab;
}

class BinaryReader {
  constructor(channel) {
    this.channel = channel;
  }

  sendFile({ sessionId, filePath }) {
    let count = 0;

    return new Promise((success, reject) => {
      const readStream = fs.createReadStream(filePath);

      readStream.on('readable', () => {
        const data = readStream.read();

        if (data) {
          if (count == 0) {
            this.log({ data, sessionId, filePath, count });
          }

          const header = Buffer.from(sessionId);
          const buffer = Buffer.concat([header, data]);
          this.channel.send(buffer);

          count += 1;
        } else {
          success();
        }
      });

      readStream.on('error', err => reject(new Error(`Problem serving file ${filePath} over ws: ${err.toString()}`)));
    });
  }

  log({ data, sessionId, filePath, count }) {
    console.log(`SID ${sessionId}: binary sending sequential data chunk n. ${count} - buffer length: ${data.length}, filePath: ${filePath}`);
  }
}

export default BinaryReader;
