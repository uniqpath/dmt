import dmt from 'dmt-bridge';
const { log } = dmt;
import si from 'systeminformation';
import { push } from 'dmt-notify';

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
          const obj = {};
          obj[this.name || proc.name] = { cpu: procCPUReading, mem: proc.pmem };
          success(obj);
        })
        .catch(error => log.red(error));
    });
  }
}

export default ProcCPU;
