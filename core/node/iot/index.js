import path from 'path';

import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));

const modulesPath = path.join(__dirname, 'modules');

import mqttClient from './createMqttClient.js';

import * as powerline from './lib/powerline/index.js';

import removeStaleNearbySensorsData from './removeStaleNearbySensorsData.js';

import loadIotModules from './loadIotModules.js';

let program;

function init(_program) {
  program = _program;

  loadIotModules({ program, modulesPath });

  removeStaleNearbySensorsData(program);
  program.on('tick', () => removeStaleNearbySensorsData(program));
}

export { init, loadIotModules, mqttClient, powerline };
