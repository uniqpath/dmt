import path from 'path';
import dmt from 'dmt/bridge';
const { log } = dmt;

import { exec } from 'child_process';

import piCamera from 'pi-camera-connect';
const { StreamCamera, Codec } = piCamera;

import fs from 'fs';

import { push, email } from 'dmt/notify';

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
    if (!this.nonrpi()) {
      return;
    }

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

  nonrpi() {
    if (!dmt.isRPi()) {
      log.write("Calling stub function on pi_camera.js because it's not RaspberryPi");
      return true;
    }
  }
}

export default Recorder;
