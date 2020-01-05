const dmt = require('dmt-bridge');
const { log } = dmt;
const colors = require('colors');
const fs = require('fs');
const path = require('path');

const stripAnsi = require('strip-ansi');
const { push } = require('dmt-notify');

class MidLoader {
  constructor() {
    this.loadedMidsWithMidData = {};
  }

  load({ program, mids }) {
    const deviceDef = program.device;

    this.parseMidsDefinition(mids).forEach(({ mid, condition, packages }) => {
      if (condition && !condition(deviceDef)) {
        log.cyan(`${colors.magenta(mid)} middleware ${colors.white('not loaded: prevented by condition in dmt-proc.js')}`);
        return;
      }

      if (packages) {
        for (const midPkg of packages) {
          log.cyan(`Loading ${colors.magenta(mid)} middleware — ${colors.yellow(midPkg)}`);
          this.tryLoadMid(program, midPkg);
        }
      } else {
        log.cyan(`Loading ${colors.magenta(mid)} middleware`);
        this.tryLoadMid(program, mid);
      }
    });
  }

  tryLoadMid(program, midPkg) {
    try {
      this.loadMid(program, midPkg);
    } catch (e) {
      const msg = `Problem loading ${colors.cyan(midPkg)} middleware — ${colors.gray(e)}`;
      log.red(msg);

      push.notify(`${dmt.deviceGeneralIdentifier()}: ${stripAnsi(msg)}`);
    }
  }

  setup(program) {
    for (const midPkgName of Object.keys(this.loadedMidsWithMidData)) {
      let pkg = midPkgName;

      if (midPkgName.includes('/')) {
        const [aspect, _pkg] = midPkgName.split('/');
        pkg = _pkg;
      }

      const midSetupScript = path.join(__dirname, `setup/${pkg}.js`);

      if (fs.existsSync(midSetupScript)) {
        const setupMid = require(midSetupScript);
        const midData = this.loadedMidsWithMidData[midPkgName];
        setupMid(program, midData);
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

  loadMid(program, midPkgName) {
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

    const mid = require(midDirectory);
    const midData = mid.init(program) || {};

    this.loadedMidsWithMidData[midPkgName] = midData;
  }
}

module.exports = MidLoader;
