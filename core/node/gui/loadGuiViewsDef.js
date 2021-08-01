import path from 'path';
import fs from 'fs';

import { log, def, colors, dmtPath, device as __device, parseDef } from 'dmt/common';

import mapUrlpathToFilepath from './mapUrlpathToFilepath';

import serverOptions from './guiServerOptions';

export default program => {
  const guiServerOptions = serverOptions();

  const _global = path.join(dmtPath, 'def/gui_views.def');
  const _user = path.join(dmtPath, 'user/def/gui_views.def');
  const _device = path.join(dmtPath, 'user/devices/this/def/gui_views.def');

  const views = {};

  const device = __device({ onlyBasicParsing: true, caching: false });

  const themes = def.values(device.try('service[gui].theme')).reverse();
  const theme = themes.length > 0 ? themes[0].toLowerCase() : undefined;

  if (theme) {
    log.magenta(`Gui theme → ${colors.green(theme)}`);
  }

  for (const defFile of [_global, _user, _device]) {
    if (fs.existsSync(defFile)) {
      for (const view of parseDef(defFile, { caching: false }).multi) {
        const { id } = view;
        delete view.id;
        views[id] = views[id] || {};

        const wallpapers = def.listify(view.wallpaper).reverse();

        const lastWallpaper = wallpapers.length == 0 ? null : wallpapers[0];

        let matchWallpaper;

        if (_global == defFile) {
          matchWallpaper = wallpapers.find(wallpaper =>
            def
              .values(wallpaper.theme)
              .map(theme => theme.toLowerCase())
              .includes(theme || 'dmt_default')
          );

          if (!matchWallpaper) {
            matchWallpaper = wallpapers.find(wallpaper =>
              def
                .values(wallpaper.theme)
                .map(theme => theme.toLowerCase())
                .includes('dmt_default')
            );
          }
        }

        if (_user == defFile) {
          matchWallpaper = wallpapers.find(
            wallpaper =>
              wallpaper.theme &&
              def
                .values(wallpaper.theme)
                .map(theme => theme.toLowerCase())
                .includes(theme)
          );
        }

        if (_device == defFile) {
          matchWallpaper = lastWallpaper;
        }

        if (matchWallpaper) {
          const urlPath = matchWallpaper.id ? matchWallpaper.id : matchWallpaper;

          const filePath = mapUrlpathToFilepath({ urlPath, staticServerOptions: guiServerOptions });

          if (!fs.existsSync(filePath)) {
            log.red(`Missing wallpaper: ${urlPath}`);
            log.red(`filePath: ${filePath}`);
            view.wallpaper = '/wallpapers/missing.jpg';
          } else {
            view.wallpaper = urlPath;
          }
        } else {
          delete view.wallpaper;
        }

        let { protectVisibility } = view;

        if (matchWallpaper && matchWallpaper.protectVisibility) {
          protectVisibility = matchWallpaper.protectVisibility;
        }

        if (protectVisibility) {
          if (protectVisibility == 'false') {
            delete view.protectVisibility;
            delete views[id].protectVisibility;
          } else {
            view.protectVisibility = protectVisibility;
          }
        }

        for (const [key, value] of Object.entries(view)) {
          views[id][key] = value;
        }
      }
    }
  }

  if (Object.keys(views).length > 0) {
    program.store('gui').update({ views }, { announce: false });
  }
};
