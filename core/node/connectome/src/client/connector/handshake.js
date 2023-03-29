import nacl from 'tweetnacl';
import naclutil from 'tweetnacl-util';
nacl.util = naclutil;

const wsOPEN = 1;

import { hexToBuffer } from '../../utils/index.js';

import logger from '../../utils/logger/logger.js';

export default function diffieHellman({ connector, afterFirstStep = () => {} }) {
  const { clientPrivateKey, clientPublicKey, clientPublicKeyHex, protocol, tag, endpoint, verbose } = connector;

  return new Promise((success, reject) => {
    connector
      .remoteObject('Auth')
      .call('exchangePubkeys', { pubkey: clientPublicKeyHex })
      .then(remotePubkeyHex => {
        const sharedSecret = nacl.box.before(hexToBuffer(remotePubkeyHex), clientPrivateKey);

        afterFirstStep({ sharedSecret, remotePubkeyHex });

        if (verbose) {
          logger.write(connector.log, `Connector ${endpoint} established shared secret through diffie-hellman exchange.`);
        }

        if (connector.connection.websocket.readyState == wsOPEN) {
          connector
            .remoteObject('Auth')
            .call('finalizeHandshake', { protocol })
            .then(res => {
              if (res && res.error) {
                console.log(res.error);
              } else {
                success();

                const _tag = tag ? ` (${tag})` : '';
                logger.cyan(connector.log, `☑️  ${endpoint}${_tag} ✓ Connection #${connector.connection.websocket.__id} [ ${protocol || '"no-name"'} ] ready`);
              }
            })
            .catch(reject);
        } else {
          const _tag = tag ? ` (${tag})` : '';
          logger.yellow(connector.log, `${endpoint}${_tag} ✖ Connection [ ${protocol || '"no-name"'} ] closed just before finalizeHandshake step`);
        }
      })
      .catch(reject);
  });
}
