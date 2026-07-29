import Client from './lib/Client.js';
import Group from './lib/Group.js';
import Message from './lib/Message.js';
import User from './lib/User.js';

const PRIORITY = {
  emergency: 2,
  high: 1,
  normal: 0,
  low: -1,
  lowest: -2
};

const PUSHOVER_SOUNDS = {
  pushover: 'Pushover (default)',
  bike: 'Bike',
  bugle: 'Bugle',
  cashregister: 'Cash Register',
  classical: 'Classical',
  cosmic: 'Cosmic',
  falling: 'Falling',
  gamelan: 'Gamelan',
  incoming: 'Incoming',
  intermission: 'Intermission',
  magic: 'Magic',
  mechanical: 'Mechanical',
  pianobar: 'Piano Bar',
  siren: 'Siren',
  spacealarm: 'Space Alarm',
  tugboat: 'Tug Boat',
  alien: 'Alien Alarm (long)',
  climb: 'Climb (long)',
  persistent: 'Persistent (long)',
  echo: 'Pushover Echo (long)',
  updown: 'Up Down (long)',
  none: 'None (silent)'
};

const SOUND = {};

for (const sound of Object.keys(PUSHOVER_SOUNDS)) {
  SOUND[sound] = sound;
}

export { Client, Group, Message, User, PRIORITY, SOUND };
