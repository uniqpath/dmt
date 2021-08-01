import path from 'path';
import fs from 'fs';

import dmt from 'dmt/common';
const { def } = dmt;

function serveWallpaper(req, res) {
  const selected = {
    theme: 'dmt_default',
    view: 'clock'
  };

  const viewDefsPath = path.join(dmt.dmtPath, 'def/gui_views.def');
  const commonAssetsPath = path.join(dmt.dmtPath, 'core/node/gui/gui-frontend-core/common_assets');

  if (fs.existsSync(viewDefsPath)) {
    const viewDef = dmt.parseDef(viewDefsPath, { caching: false }).multi.find(vd => vd.id == selected.view);
    if (viewDef) {
      const wallpaper = def.listify(viewDef.wallpaper).find(wallpaper => wallpaper.theme == selected.theme);

      if (wallpaper) {
        res.sendFile(path.join(commonAssetsPath, wallpaper.id));
        return;
      }
    }
  }

  res.sendFile(path.join(commonAssetsPath, '/wallpapers/missing.jpg'));
}

export default serveWallpaper;
