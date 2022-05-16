import { dmtHereEnsure, colors, scan, device as _device } from 'dmt/common';

const { relativizePath } = scan;

import fs from 'fs';
import path from 'path';

import { linkIndexPath } from 'dmt/webindex';

const device = _device({ onlyBasicParsing: true });

import ingestLinksFromDirectory from '../lib/ingest/txtFiles/ingestLinksFromDirectory';

const args = process.argv.slice(2);

if (args.length > 1) {
  console.log(colors.yellow('Usage:'));
  console.log('cli weblinks [deviceName]');
  process.exit();
}

const deviceName = args[0] || device.id;

const linksDirectory = linkIndexPath(deviceName);

ingestLinksFromDirectory(linksDirectory).then(urls => {
  const tmpDir = dmtHereEnsure('tmp');

  const filePath = path.join(tmpDir, 'weblinks.json');

  console.log(
    `Wrote ${colors.green(urls.length)} ${colors.cyan(deviceName)} weblinks ${colors.gray('(without webscan metadata)')} to ${colors.yellow(
      relativizePath(filePath)
    )}`
  );
  fs.writeFileSync(filePath, JSON.stringify(urls, null, 2));
});
