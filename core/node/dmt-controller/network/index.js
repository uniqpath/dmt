const DetermineNetwork = require('./determineNetwork');

class Network {
  constructor(program) {
    this.program = program;

    program.on('lanbus:ready', lanbus => {
      this.lanbus = lanbus;
    });

    this.determineNetwork = new DetermineNetwork({ program, obj: this });
  }

  latlng() {
    return this.try('latlng');
  }

  lang() {
    return this.try('lang') || 'eng';
  }

  try(accessor) {
    if (this.def) {
      return this.def.try(accessor);
    }
  }
}

module.exports = Network;
