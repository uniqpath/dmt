import GUISearchObject from './objects/search';
import GUIPlayerObject from './objects/player';
import GUIFrontendAcceptor from './objects/frontendAcceptor';

import { push } from 'dmt/notify';

export default function onConnect({ program, channel }) {
  channel.attachObject('GUISearchObject', new GUISearchObject({ program, channel }));
  channel.attachObject('GUIPlayerObject', new GUIPlayerObject({ program, channel }));
  channel.attachObject('GUIFrontendAcceptor', new GUIFrontendAcceptor({ program, channel }));
}
