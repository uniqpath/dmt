// ⚠️ DUPLICATE with ~/.dmt/core/node/gui/viewsDef ...
import path from 'path';
import { dmtUserDir, dmtPath, guiViews } from 'dmt/common';

export default guiServerOptions;

function guiServerOptions() {
  //const name = 'dmt-gui-server';
  //const description = '🌐 DMT GUI';

  const redirects = { '/': '/home' };

  const rootDir = path.join(dmtPath, 'apps/gui/frontend');
  const assetsSubdir = 'common_assets';
  // User frontend assets, safely held in users ~/.dmt directory
  // Careful: these should be assumed to be exposed via web-gui in case server is running
  // listing is generally not alowed, they have to be explicitely shown from the dmt-gui/gui-frontend compiled frontend code

  const publicDir = path.join(rootDir, '+app/public');

  const subServings = [
    //{ dir: publicDir, mountpoint: '/player' },
    { dir: path.join(dmtUserDir, 'wallpapers'), mountpoint: '/user/wallpapers' },
    { dir: path.join(dmtPath, 'docs'), recursive: true, indexFile: 'README.html', mountpoint: '/docs' }
  ];

  // ❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗
  // important /device , /player etc... are mounted here
  // this is important when we reload the site
  // virtual directories -- all views we have defined in gui_views.def are actually served from app/public
  //❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗
  for (const view of guiViews()) {
    // we always do this if gui is defined in gui_views.def ...
    //if (!fs.existsSync(path.join(rootDir, view))) {
    subServings.push({ dir: publicDir, mountpoint: `/${view}` });
    //}
  }

  const servingOptions = { rootDir, publicDir, assetsSubdir, subServings };

  return { redirects, servingOptions };
}
