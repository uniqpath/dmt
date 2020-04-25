import { push } from 'dmt/notify';

import CameraRecorder from '../lib/camera/pi_camera';
let camera;

function setup(program) {
  camera = new CameraRecorder();
}

function handleIotEvent({ program, topic, msg }) {
  const { device } = program;

  if (topic == 'alarm' && msg == 'triggered') {
    program.showNotification({ id: 'alarm', msg: 'Recording video and calling police ...', ttl: 30, bgColor: '#9A4EF1' });

    if (device.try('iot.camera')) {
      push.notify(`Motion detected, recording video on ${device.id} ...`);
      camera.recordVideo();
    }
  }
}

export { setup, handleIotEvent };
