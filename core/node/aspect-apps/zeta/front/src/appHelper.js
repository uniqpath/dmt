import * as dmtJS from '../../../../dmt-js';
const { Emitter } = dmtJS;

class App extends Emitter {
  constructor() {
    super();

    const corePromoters = ['david', 'stanko', 'adnan', 'iztok'];
    const isCorePromoter = corePromoters.find(name => window.location.hostname.startsWith(`${name}.`));

    this.isLocalhost = window.location.hostname == 'localhost';
    this.isLAN = window.location.hostname.startsWith('192.168.');
    this.isZetaSeek = window.location.hostname == 'zetaseek.com';
    this.isZetaSeekCorePromoter = this.isZetaSeek || isCorePromoter;
    this.isDevMachine = window.location.hostname == 'david.zetaseek.com';
    this.nodeHasBlog = window.location.hostname == 'david.zetaseek.com';
    this.blogName = window.location.hostname == 'david.zetaseek.com' ? 'Overthinking 💭' : '';

    this.isMobile = window.screen.width < 768;

    this.ssl = window.location.protocol == 'https:';
  }
}

export default new App();
