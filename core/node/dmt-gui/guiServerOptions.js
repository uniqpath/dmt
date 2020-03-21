import path from 'path';

import dmt from 'dmt-bridge';

export default guiServerOptions;

function guiServerOptions() {
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

  return { redirects, servingOptions };
}
