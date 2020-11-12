import colors from 'colors';

import dmt from 'dmt/bridge';
const { log } = dmt;

function loadProtocol({ program, setupFilePath }) {
  log.green(`Loading Connectome User Protocol: ${colors.gray(setupFilePath)}`);

  import(setupFilePath)
    .then(mod => {
      try {
        mod.default({ program });
      } catch (e) {
        log.red(e);
      }
    })
    .catch(e => {
      log.red(e);
    });
}

export default loadProtocol;
