const ProcCPU = require('./lib/procCPU');
const system = require('./lib/system');

function init(program) {
  program.updateState({ sysinfo: { system: system() } }, { announce: false });

  const observedProcesses = [{ name: 'dmt-proc', pid: process.pid }, { name: 'mpv' }].map(info => new ProcCPU(info));

  program.on('tick', () => {
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

module.exports = {
  init
};
