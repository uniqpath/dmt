const express = require('express');
const colors = require('colors');
const fs = require('fs');
const pathModule = require('path');
const dmt = require('dmt-bridge');
const { scan, log } = dmt;

function setFileSystemRoutes(app, serverName, { rootDir, publicDir, assetsSubdir, subServings = [] }) {
  const components = dmt.scan
    .dir(rootDir, { onlyDirs: true })
    .filter(path => pathModule.basename(path) != assetsSubdir)
    .map(path => {
      const handle = pathModule.basename(path);
      return { handle, staticContentPath: publicDir };
    });

  let assets;

  if (assetsSubdir) {
    const assetsPath = pathModule.join(rootDir, assetsSubdir);
    assets = scan.dir(assetsPath, { onlyDirs: true }).filter(asset => pathModule.basename(asset) != 'root');

    assets.forEach(path => {
      app.use(`/${pathModule.basename(path)}`, express.static(path));
    });

    const rootAssetsPath = pathModule.join(assetsPath, 'root');

    if (fs.existsSync(rootAssetsPath)) {
      const rootAssets = scan.dir(rootAssetsPath, { onlyFiles: true });

      rootAssets.forEach(path => {
        app.use(`/${pathModule.basename(path)}`, express.static(path));
      });
    }
  }

  components.forEach(({ handle, staticContentPath }) => {
    if (assets) {
      const matchingAssetPath = assets.find(path => pathModule.basename(path) == handle);
      if (matchingAssetPath) {
        throw new Error(`Component ${staticContentPath} clashes with ${matchingAssetPath}, both have the same "handle" -- ${handle}`);
      }
    }

    log.gray(`${colors.cyan(serverName)}: component ${colors.magenta(handle)} at /${handle}`);
    app.use(`/${handle}`, express.static(staticContentPath));
  });

  for (const sub of subServings) {
    log.gray(`Additional static route for server ${colors.cyan(serverName)} created: ${sub.mountpoint} ■ serving ${sub.dir}`);

    if (sub.recursive) {
      const docsApp = express();

      docsApp.get('*', (req, res) => {
        const requestPath = req.path;

        const filePath = pathModule.join(sub.dir, requestPath);
        const indexFilePath = pathModule.join(filePath, sub.indexFile || 'index.html');

        if (fs.existsSync(indexFilePath)) {
          res.sendFile(indexFilePath);
          return;
        }

        if (fs.existsSync(filePath)) {
          res.sendFile(filePath);
          return;
        }

        res.status(400).send({
          message: 'This is an error!'
        });
      });

      app.use(`${sub.mountpoint}`, docsApp);
    } else {
      app.use(`${sub.mountpoint}`, express.static(sub.dir));
    }
  }

  return app;
}

module.exports = setFileSystemRoutes;