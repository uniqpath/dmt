import DetermineNetwork from './determineNetwork';

class Network {
  constructor(program) {
    this.program = program;

    this.determineNetwork = new DetermineNetwork({ program, obj: this });
  }

  latlng() {
    return this.try('latlng');
  }

  country() {
    return this.try('country');
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

export default Network;
