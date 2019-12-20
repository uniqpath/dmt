import util from '../../../../dmt-gui/lib/util';
import _establishAndMaintainConnection from '../lib/connect';

const { log } = util;

function establishAndMaintainConnection({ obj, endpoint, resumeNow }) {
  _establishAndMaintainConnection({ obj, endpoint, resumeNow }, { WebSocket, log });
}

export default establishAndMaintainConnection;
