import { Emitter } from 'dmt-js';

class App extends Emitter {
  constructor() {
    super();

    this.isLocalhost = window.location.hostname == 'localhost';
    this.isLAN = window.location.hostname.startsWith('192.168.');
    this.isZetaSeek = window.location.hostname == 'zetaseek.com';

    this.isMobile = window.screen.width < 768;

    this.ssl = window.location.protocol == 'https:';
  }
}

export default new App();
