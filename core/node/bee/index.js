import SwarmApi from './api/swarmApi';
import SwarmDebugApi from './api/swarmDebugApi';

const swarmPort = 8888;
const swarmDebugPort = 6060;

function reportSwarmClientRunning(swarmBeeRunning, program) {
  program.updateState({ controller: { swarmBeeRunning } }, { announce: false });
}

function periodicCheck({ program, swarmDebugApi }) {
  swarmDebugApi
    .get('health')
    .then(() => {
      reportSwarmClientRunning(true, program);
      swarmDebugApi.get('topology').then(json => program.updateState({ swarm: { topology: json } }, { announce: false }));
    })
    .catch(() => {
      reportSwarmClientRunning(false, program);
    });
}

function init(program) {
  const swarmApi = new SwarmApi(swarmPort);
  const swarmDebugApi = new SwarmDebugApi(swarmDebugPort);

  program.on('tick', () => {
    periodicCheck({ program, swarmDebugApi });
  });
}

export { init };
