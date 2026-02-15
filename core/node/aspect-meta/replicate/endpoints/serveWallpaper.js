import path from 'path';
import fs from 'fs';

import { def, parseDef, dmtPath } from 'dmt/common';

function serveWallpaper(req, res) {
  const selected = {
    theme: 'dmt_default',
    view: 'clock'
  };

  const viewDefsPath = path.join(dmtPath, 'def/gui_views.def');
  const commonAssetsPath = path.join(dmtPath, 'apps/gui/frontend/common_assets');

  if (fs.existsSync(viewDefsPath)) {
    const viewDef = parseDef(viewDefsPath, { caching: false }).multi.find(vd => vd.id == selected.view);
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
