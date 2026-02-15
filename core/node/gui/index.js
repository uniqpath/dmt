import reduceSizeOfStateForGUI from './protocol/dmtGUI/helpers/reduceSizeOfStateForGUI.js';
import setupDMTGUIProtocol from './protocol/dmtGUI/index.js';
import loadGuiViewsDef from './viewsDef/loadGuiViewsDef.js';

function init(program) {
  loadGuiViewsDef(program);

  setupDMTGUIProtocol({ program });
}

export { init, reduceSizeOfStateForGUI };
