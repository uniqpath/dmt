let lastDetectedMinute;

const helpers = require('./helpers');

function updateTime(program, { announce = false } = {}) {
  const latlng = program.latlng();
  const lang = program.lang();

  const update = helpers.determineTimeAndDate({ latlng, lang });

  program.updateState({ controller: update }, { announce });
}

function rolloverSecondDetect(program) {
  const today = new Date();
  const second = today.getSeconds();
  const minute = today.getMinutes();

  if (second == 0 && (lastDetectedMinute == null || lastDetectedMinute != minute)) {
    updateTime(program, { announce: true });
    lastDetectedMinute = today.getMinutes();
  }

  let interval;

  if (second == 59) {
    interval = 50;
  } else if (second < 50) {
    interval = 9000;
  } else {
    interval = 900;
  }

  setTimeout(() => rolloverSecondDetect(program), interval);
}

function setupRolloverSecondDetectLoop(program) {
  rolloverSecondDetect(program);
}

function setupTimeUpdater(program) {
  setupRolloverSecondDetectLoop(program);

  const updater = () => {
    updateTime(program, { announce: false });
    setTimeout(updater, 30000);
  };

  updater();
}

module.exports = { setupTimeUpdater };
