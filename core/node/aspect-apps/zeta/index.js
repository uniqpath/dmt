import BackendStore from './dmtHook/backendStore';

import setupZetaGUIProtocol from './dmtHook/protocol/zetaGUI/setup';

function init({ program }) {
  const backendStore = new BackendStore({ program });
  setupZetaGUIProtocol({ program, backendStore });
}

export { init };
