import ProcCPU from './lib/procCPU';
import { systemOnce, systemPeriodic } from './lib/system';

function init(program) {
  program.updateState({ sysinfo: { system: { once: systemOnce() } } }, { announce: false });

  const observedProcesses = [{ name: 'dmt-proc', pid: process.pid }, { name: 'mpv' }].map(info => new ProcCPU(info));

  program.on('tick', () => {
    program.updateState({ sysinfo: { system: { periodic: systemPeriodic(program) } } }, { announce: false });

    const processes = program.state.sysinfo.processes || {};
    Promise.all(observedProcesses.map(proc => proc.profile())).then(procData => {
      for (const data of procData) {
        if (data) {
          const procname = Object.keys(data)[0];
          processes[procname] = Object.values(data)[0];
        }
      }
      program.updateState({ sysinfo: { processes } }, { announce: false });
    });
  });
}

export { init };
