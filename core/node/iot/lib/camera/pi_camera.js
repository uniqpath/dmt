import path from 'path';

import { log, device as _device, isRPi } from 'dmt/common';

import { exec } from 'child_process';

import piCamera from 'pi-camera-connect';
const { StreamCamera, Codec } = piCamera;

import fs from 'fs';

import { push, email } from 'dmt/notify';

const device = _device();

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
    if (!isRPi()) {
      log.write("Calling stub function on pi_camera.js because it's not RaspberryPi");
      return;
    }

    if (this.recording) return;

    const converter = '/usr/bin/MP4Box';

    if (!fs.existsSync(converter)) {
      push.notify(`Error at ${device.id} when recording video -- ${converter} does not exist! Please install -- sudo apt-get install -y gpac`);
      return;
    }

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

          this.recording = false;
        });
      }, this.seconds * 1000);
    });
  }
}

export default Recorder;
