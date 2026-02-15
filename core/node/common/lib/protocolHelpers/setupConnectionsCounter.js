import { stripAnsi, colors, log, program } from 'dmt/common';

export default function setupConnectionsCounter({ channels, store, dmtID, protocol }) {
  let maxCounter = 10;
  const RISE = 30;

  channels.on('status', ({ connList }) => {
    const counter = connList.length;

    if (counter > (1 + RISE / 100) * maxCounter) {
      const msg = `🚀 ${colors.yellow(counter)} — new concurrent connections record for ${colors.cyan(dmtID)}/${colors.white(
        protocol
      )} protocol on ${colors.cyan(program.device.id)}`;

      log.write(msg);

      maxCounter = counter;
    }

    store.update({ counter });
  });
}
