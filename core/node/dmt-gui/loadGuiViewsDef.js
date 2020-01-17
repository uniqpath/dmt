const path = require('path');
const fs = require('fs');
const dmt = require('dmt-bridge');

const colors = require('colors');
const { log, def } = dmt;

const mapUrlpathToFilepath = require('./mapUrlpathToFilepath');

const serverOptions = require('./guiServerOptions');

module.exports = program => {
  const guiServerOptions = serverOptions();

  const _global = path.join(dmt.dmtPath, 'def/gui_views.def');
  const _user = path.join(dmt.dmtPath, 'user/def/gui_views.def');
  const _device = path.join(dmt.dmtPath, 'user/devices/this/def/gui_views.def');

  const views = {};

  const device = dmt.device({ onlyBasicParsing: true, caching: false });

  const themes = def.values(device.try('service[gui].theme')).reverse();
  const theme = themes.length > 0 ? themes[0].toLowerCase() : undefined;

  if (theme) {
    log.magenta(`Gui theme → ${colors.green(theme)}`);
  }

  for (const defFile of [_global, _user, _device]) {
    if (fs.existsSync(defFile)) {
      for (const view of dmt.parseDef(defFile, { caching: false }).multi) {
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
    program.replaceStoreElement({ storeName: 'gui', key: 'views', value: views }, { announce: false });
  }
};
