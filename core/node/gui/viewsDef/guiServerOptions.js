import path from 'path';
import { dmtUserDir, dmtPath, guiViews } from 'dmt/common';

export default guiServerOptions;

function guiServerOptions() {
  const redirects = { '/': '/home' };

  const rootDir = path.join(dmtPath, 'apps/gui/frontend');
  const assetsSubdir = 'common_assets';
  const publicDir = path.join(rootDir, 'app/public');

  const subServings = [
    { dir: path.join(dmtUserDir, 'wallpapers'), mountpoint: '/user/wallpapers' },
    { dir: path.join(dmtPath, 'docs'), recursive: true, indexFile: 'README.html', mountpoint: '/docs' }
  ];

  for (const view of guiViews()) {
    subServings.push({ dir: publicDir, mountpoint: `/${view}` });
  }

  const servingOptions = { rootDir, publicDir, assetsSubdir, subServings };

  return { redirects, servingOptions };
}
