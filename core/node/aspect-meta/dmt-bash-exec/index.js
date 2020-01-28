const { scriptActionHandler } = require('./scriptsThroughUserActions');

const platformTools = require('./platformTools');

function init(program) {
  program.on('action', ({ action, storeName }) => scriptActionHandler({ program, action, storeName }));
}

module.exports = {
  init,
  platformTools
};
