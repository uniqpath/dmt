const fs = require('fs');
const path = require('path');
const dmt = require('dmt-bridge');
const { log, def } = dmt;

const { username } = require('os').userInfo();

function determineGUIPort() {
  const isRootUser = username == 'root';

  const ports = def.listify(dmt.services('gui').port);

  const portForRootUser = ports.find(port => port.whenRootUser == 'true');

  if (isRootUser && portForRootUser) {
    return portForRootUser.id;
  }

  const normalPorts = ports.filter(port => port.whenRootUser != 'true');

  if (normalPorts.length > 0) {
    return def.id(normalPorts[0]);
  }
}

function guiServerOptions(program) {
  const name = 'dmt-gui-server';
  const description = '🌐 DMT GUI';

  const port = determineGUIPort();

  if (!port) {
    throw new Error('Gui port is not properly specified! Please specify in services.def');
  }

  const redirects = { '/': '/home' };

  const rootDir = path.join(dmt.dmtPath, 'core/node/dmt-gui/gui-frontend-core');
  const assetsSubdir = 'common_assets';
  const publicDir = path.join(rootDir, 'app/public');

  const subServings = [
    { dir: path.join(dmt.userDir, 'wallpapers'), mountpoint: '/user/wallpapers' },
    { dir: path.join(dmt.dmtPath, 'docs'), recursive: true, indexFile: 'README.html', mountpoint: '/docs' }
  ];

  for (const view of dmt.guiViews()) {
    subServings.push({ dir: publicDir, mountpoint: `/${view}` });
  }

  const servingOptions = { rootDir, publicDir, assetsSubdir, subServings };

  return { program, name, description, port, redirects, servingOptions };
}

module.exports = guiServerOptions;
