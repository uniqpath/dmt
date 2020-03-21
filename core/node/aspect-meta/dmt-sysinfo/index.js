import { systemOnce, systemPeriodic } from './lib/system';

function init(program) {
  program.updateState({ sysinfo: { system: { once: systemOnce() } } }, { announce: false });

  program.on('tick', () => {
    program.updateState({ sysinfo: { system: { periodic: systemPeriodic(program) } } }, { announce: false });
  });
}

export { init };
