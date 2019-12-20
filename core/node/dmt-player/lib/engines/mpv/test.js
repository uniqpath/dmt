const MPVAPI = require('./node-mpv');

const mpv = new MPVAPI({ verbose: false, audio_only: true });

mpv.load();
