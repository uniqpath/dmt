const dmt = require('dmt-bridge');
const { log } = dmt;
const si = require('systeminformation');
const { push } = require('dmt-notify');

const maxCPU = 30;
const maxCPUHigher = 50;

const keepNumHistoric = 30;

class ProcCPU {
  constructor({ pid, name }) {
    this.pid = pid;
    this.name = name;
    this.history = [];
  }

  profile() {
    return new Promise((success, reject) => {
      si.processes()
        .then(data => {
          const proc = data.list.find(proc => (this.pid ? proc.pid == this.pid : proc.name == this.name));

          if (!proc || proc.pcpu == null || isNaN(proc.pcpu) || proc.pcpu < 0) {
            success(null);
            return;
          }

          const procCPUReading = Math.round(proc.pcpu);
          this.history.push(procCPUReading);

          if (this.history.length > keepNumHistoric) {
            this.history.shift();
          }

          if (keepNumHistoric == this.history.filter(val => val > maxCPU).length) {
            const averageCPU = Math.round(this.history.reduce((acc, a) => acc + a, 0) / this.history.length);
            push.notify(
              `Device ${dmt.deviceGeneralIdentifier()} CPU high - proc: ${proc.name}! Average in last ${keepNumHistoric} readings (every ${
                dmt.globals.tickerPeriod
              }s): ${averageCPU} `
            );

            this.history.length = 0;
          }

          if (keepNumHistoric / 3 == this.history.filter(val => val > maxCPUHigher).length) {
            const averageCPU = Math.round(this.history.reduce((acc, a) => acc + a, 0) / this.history.length);
            push.notify(
              `Device ${dmt.deviceGeneralIdentifier()} CPU very high - proc: ${proc.name}! Average in last ${keepNumHistoric} readings (every ${
                dmt.globals.tickerPeriod
              }s): ${averageCPU} `
            );

            this.history.length = 0;
          }

          const obj = {};
          obj[this.name || proc.name] = { cpu: procCPUReading, mem: proc.pmem };
          success(obj);
        })
        .catch(error => log.red(error));
    });
  }
}

module.exports = ProcCPU;
