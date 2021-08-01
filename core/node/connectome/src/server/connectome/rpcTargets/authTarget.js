import nacl from 'tweetnacl';
import naclutil from 'tweetnacl-util';

import initializeProtocol from '../initializeProtocol.js';

import { EventEmitter, hexToBuffer } from '../../../utils/index.js';

import logger from '../../../utils/logger/logger.js';

nacl.util = naclutil;

const DAY = 24 * 60 * 60 * 1000;

const _errorReportTimestamps = {};
const _errorReportCounters = {};

setInterval(() => {
  const now = Date.now();

  for (const [remoteIp, timestamp] of Object.entries(_errorReportTimestamps)) {
    if (now - timestamp > 2 * DAY) {
      delete _errorReportTimestamps[remoteIp];
      delete _errorReportCounters[remoteIp];
    }
  }
}, DAY);

export default class AuthTarget extends EventEmitter {
  constructor({ keypair, channel, server }) {
    super();

    this.keypair = keypair;
    this.channel = channel;
    this.server = server;
  }

  exchangePubkeys({ pubkey }) {
    const remoteClientPubkey = hexToBuffer(pubkey);

    this.channel.setRemotePubkeyHex(pubkey);

    this.sharedSecret = nacl.box.before(remoteClientPubkey, this.keypair.privateKey);

    return this.keypair.publicKeyHex;
  }

  finalizeHandshake({ protocol }) {
    const { server, channel } = this;

    channel.setSharedSecret(this.sharedSecret);
    channel.setProtocol(protocol);

    const { log } = this.channel;

    if (initializeProtocol({ server, channel })) {
      server.emit('connection', channel);
    } else {
      const error = `Error: request from ${channel.remoteIp()} (${channel.remotePubkeyHex()}) - unknown protocol ${protocol}, disconnecting in 1h`;

      _errorReportCounters[channel.remoteIp()] = (_errorReportCounters[channel.remoteIp()] || 0) + 1;

      if (!_errorReportTimestamps[channel.remoteIp()] || Date.now() - _errorReportTimestamps[channel.remoteIp()] > DAY) {
        logger.yellow(log, error);

        logger.yellow(
          log,
          'Maybe it is a stray or unwelcome dmt-proc which will keep reconnecting until terminated... we report at most once per 24h per remote ip'
        );

        logger.yellow(log, `Reconnect tries since this dmt-proc started: ${_errorReportCounters[channel.remoteIp()]}`);

        _errorReportTimestamps[channel.remoteIp()] = Date.now();
      }

      setTimeout(() => {
        channel.terminate();
      }, 60 * 60 * 1000);

      return { error };
    }
  }
}
