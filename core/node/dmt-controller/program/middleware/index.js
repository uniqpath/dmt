import colors from 'colors';
import fs from 'fs';
import path from 'path';
import stripAnsi from 'strip-ansi';

import dmt from 'dmt-bridge';
const { log } = dmt;

import { push } from 'dmt-notify';

import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

class MidLoader {
  constructor() {
    this.loadedMidsWithMidData = {};
  }

  async load({ program, mids }) {
    const deviceDef = program.device;

    const promises = [];

    this.parseMidsDefinition(mids).forEach(({ mid, condition, packages }) => {
      if (condition && !condition(deviceDef)) {
        log.cyan(`${colors.magenta(mid)} middleware ${colors.white('not loaded: prevented by condition in dmt-proc.js')}`);
        return;
      }

      if (packages) {
        for (const midPkg of packages) {
          log.cyan(`Loading ${colors.magenta(mid)} middleware — ${colors.yellow(midPkg)}`);
          promises.push(this.tryLoadMid(program, midPkg));
        }
      } else {
        log.cyan(`Loading ${colors.magenta(mid)} middleware`);
        promises.push(this.tryLoadMid(program, mid));
      }
    });

    return Promise.all(promises);
  }

  async tryLoadMid(program, midPkg) {
    return new Promise((success, reject) => {
      this.loadMid(program, midPkg)
        .then(success)
        .catch(e => {
          const msg = `Problem loading ${colors.cyan(midPkg)} middleware — ${colors.gray(e)}`;
          log.red(msg);

          push.notify(`${dmt.deviceGeneralIdentifier()}: ${stripAnsi(msg)}`);
        });
    });
  }

  async loadMid(program, midPkgName) {
    return new Promise((success, reject) => {
      let dir = `dmt-${midPkgName}`;

      if (midPkgName.includes('/')) {
        const [aspect, pkg] = midPkgName.split('/');
        dir = `aspect-${aspect}/dmt-${pkg}`;
      }

      const midDirectory = path.join(dmt.dmtPath, `core/node/${dir}`);
      if (!fs.existsSync(midDirectory)) {
        log.cyan(`${colors.red('✖')} ${colors.magenta(midPkgName)} middleware ${colors.white('is not present')}`);
        return;
      }

      import(midDirectory).then(mid => {
        try {
          const midData = mid.init(program) || {};
          this.loadedMidsWithMidData[midPkgName] = midData;
        } catch (e) {
          reject(e);
          return;
        }

        success();
      });
    });
  }

  async setup(program) {
    for (const midPkgName of Object.keys(this.loadedMidsWithMidData)) {
      let pkg = midPkgName;

      if (midPkgName.includes('/')) {
        const [aspect, _pkg] = midPkgName.split('/');
        pkg = _pkg;
      }

      const midSetupScript = path.join(__dirname, `setup/${pkg}.js`);

      if (fs.existsSync(midSetupScript)) {
        import(midSetupScript).then(setupMid => {
          const midData = this.loadedMidsWithMidData[midPkgName];
          setupMid.default(program, midData);
        });
      }
    }
  }

  parseMidsDefinition(mids) {
    return mids
      .map(mid => {
        let midOptions = {};
        let midName = mid;
        if (typeof mid !== 'string') {
          midName = Object.keys(mid)[0];
          midOptions = mid[midName];
        }
        midOptions.mid = midName;
        return midOptions;
      })
      .filter(mid => mid != null);
  }
}

export default MidLoader;
