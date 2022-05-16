import express from 'express';
import fs from 'fs';
import pathModule from 'path';

import { scan } from 'dmt/common';

function setFileSystemRoutes(app, { rootDir, publicDir, assetsSubdir, subServings = [] }) {
  const components = scan
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

    app.use(`/${handle}`, express.static(staticContentPath));
  });

  for (const sub of subServings) {
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

export default setFileSystemRoutes;
