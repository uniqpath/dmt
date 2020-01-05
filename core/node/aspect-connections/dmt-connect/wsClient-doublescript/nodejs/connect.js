import WebSocket from 'ws';
import dmt from 'dmt-bridge';
import _establishAndMaintainConnection from '../lib/connect.js';

const { log } = dmt;

function establishAndMaintainConnection({ obj, endpoint, resumeNow }) {
  _establishAndMaintainConnection({ obj, endpoint, resumeNow }, { WebSocket, log });
}

export default establishAndMaintainConnection;
