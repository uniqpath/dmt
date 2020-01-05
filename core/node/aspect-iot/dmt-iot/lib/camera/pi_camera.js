const path = require('path');
const dmt = require('dmt-bridge');
const { log } = dmt;

if (!dmt.isRPi()) {
  class Recorder {
    recordVideo() {
      log.write("Calling stub function on pi_camera.js because it's not RaspberryPi");
    }
  }

  module.exports = Recorder;
  return;
}

const { exec } = require('child_process');
const { StreamCamera, Codec } = require('pi-camera-connect');
const fs = require('fs');

const { push, email } = require('dmt-notify');

const device = dmt.device();

const streamCamera = new StreamCamera({
  codec: Codec.H264,
  width: 640,
  height: 480
});

class Recorder {
  constructor() {
    this.seconds = 5;
  }

  recordVideo() {
    if (this.recording) return;
    this.recording = true;

    const msg = 'Camera started recording ...';
    log.write(msg);
    push.notify(msg);

    const recFile = '/tmp/capture_ongoing.h264';
    const file = `${device.iot.camera.cameraCaptures}/Capture ${this.seconds}s ${new Date()
      .toLocaleString()
      .replace(/\:/g, '.')
      .replace(/\//g, '-')}.mp4`;
    log.write(`Recording video to: ${file}`);

    if (fs.existsSync(recFile)) {
      fs.unlinkSync(recFile);
    }

    const writeStream = fs.createWriteStream(recFile);
    const videoStream = streamCamera.createStream();
    videoStream.pipe(writeStream);

    streamCamera.startCapture().then(() => {
      setTimeout(() => {
        streamCamera.stopCapture();

        exec(`/usr/bin/MP4Box -add "${recFile}" "${file}"`, (err, stdout, stderr) => {
          const msg = 'Camera recording completed.';
          log.write(msg);
          push.notify(msg);

          fs.unlinkSync(recFile);

          const copyTarget = device.iot.camera.cameraCaptures2;
          if (copyTarget) {
            log.green(`COPY!! to ${path.join(copyTarget, path.basename(file))}`);
            fs.copyFile(file, path.join(copyTarget, path.basename(file)), err => {
              if (err) {
                log.red(err);
              }
            });
          }

          this.recording = false;
        });
      }, this.seconds * 1000);
    });
  }
}

module.exports = Recorder;
