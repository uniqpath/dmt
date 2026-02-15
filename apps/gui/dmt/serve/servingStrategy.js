import { express } from 'dmt/common';
import fs from 'fs';
import pathModule from 'path';

import { scan } from 'dmt/common';

// tricks to document:
// /public directory is served under each component if it eixts
// special "root" subdir without any further subdirs from which assets get monted to the root.. example:
// ... common_assets/root/favicon.ico => mounted at /favicon.ico

function setFileSystemRoutes(app, { rootDir, publicDir, assetsSubdir, subServings = [] }) {
  //const userFrontendComponents = pathModule.join(dmtPath, 'core/node/dmt-gui/gui-frontend');
  //const userFrontend = fs.existsSync(userFrontendComponents) ? scan.dir(userFrontendComponents, { onlyDirs: true }) : [];

  const components = scan
    .dir(rootDir, { onlyDirs: true })
    .filter(path => pathModule.basename(path) != assetsSubdir)
    .map(path => {
      const handle = pathModule.basename(path);
      return { handle, staticContentPath: publicDir };
    });

  // common assets
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
        //log.gray(`Common static frontend assets route created: /${pathModule.basename(path)} ■ serving ${path}`);
        app.use(`/${pathModule.basename(path)}`, express.static(path));
      });
    }
  }

  // WARNING--- ANSI COLOR IMPORTED FROM /DEVICE --> WE NEED SYMLINK TO NODE_MODULES !!!
  // ONLY FOR BUiLD PHASE THOUGH !!

  components.forEach(({ handle, staticContentPath }) => {
    if (assets) {
      const matchingAssetPath = assets.find(path => pathModule.basename(path) == handle);
      if (matchingAssetPath) {
        throw new Error(`Component ${staticContentPath} clashes with ${matchingAssetPath}, both have the same "handle" -- ${handle}`);
      }
    }

    //log.gray(`${colors.cyan(serverName)}: component ${colors.magenta(handle)} at /${handle}`);
    app.use(`/${handle}`, express.static(staticContentPath));
  });

  for (const sub of subServings) {
    //log.gray(`Additional static route for server ${colors.cyan(serverName)} created: ${sub.mountpoint} ■ serving ${sub.dir}`);

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

    // if (fs.existsSync(info.dir)) {
    //   const userAssets = scan.dir(info.dir, { onlyDirs: true });

    //   userAssets.forEach(path => {
    //     log.gray(`Additional static route for server ${colors.cyan(serverName)} created: ${info.mountpoint}/${pathModule.basename(path)} ■ serving ${path}`);
    //     app.use(`${info.mountpoint}/${pathModule.basename(path)}`, express.static(path));
    //   });
    // }
  }

  return app;
}

export default setFileSystemRoutes;
