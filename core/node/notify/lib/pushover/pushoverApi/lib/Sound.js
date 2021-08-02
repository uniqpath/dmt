const SOUND_SET = {
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

class Sound {
  constructor(name) {
    validateSoundName(name);

    this.name = name;
    this.description = SOUND_SET[name];
  }

  static validateSound(value) {
    validateSound(value);
  }

  static validateSoundName(name) {
    validateSoundName(name);
  }
}

function validateSound(value) {
  if (!(value instanceof Sound)) {
    throw new Error('Expecting type Sound');
  }
}

function validateSoundName(name) {
  if (!SOUND_SET[name]) {
    throw new Error(`Sound name ${name} not valid`);
  }
}

export default Sound;
