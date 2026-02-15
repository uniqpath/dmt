import fs from 'fs';

// convert to Uint8Array for browser consumption
// todo, explore more and find possibly a faster way if needed!
// source: https://stackoverflow.com/questions/8609289/convert-a-binary-nodejs-buffer-to-javascript-arraybuffer
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

      // readStream.on('end', () => {
      //   console.log('STREAM ENDED');
      //   readStream.destroy();
      // });

      // setTimeout(() => {
      //   readStream.destroy();
      // }, 4000);

      // readStream.on('error', () => {
      //   console.log('STREAM ERROR');
      //   readStream.destroy();
      // });

      readStream.on('readable', () => {
        const data = readStream.read();

        if (data) {
          if (count == 0) {
            // log only the first chunk.... if needed for debugging, remove this
            this.log({ data, sessionId, filePath, count });
          }

          const header = Buffer.from(sessionId); // sessionId length = 64
          const buffer = Buffer.concat([header, data]); // if we provide length ourselves it's faster
          //const buffer = Buffer.concat([header, data], data.length + 64); // if we provide length ourselves it's faster

          // TODO: use some adaptive streaming... stream 500kb or so fast, then pause a bit to catch up, meanwhile the other side can already do something with first 500kb (of music etc.)

          this.channel.send(buffer);

          // OK? Check... don't feed all the data at once !
          // TODO: verify and improve, resources:
          //
          //
          //
          //
          //
          //
          // if (count % 10 == 0) {
          //   readStream.pause();
          //   console.log('PAUSING');
          //   setTimeout(() => {
          //     readStream.resume();
          //     console.log('RESUMING');
          //   }, 30); // pause for 30ms
          // }

          count += 1;
        } else {
          success(); // done
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
