const fs = require('fs');

let settings = fs.readFileSync('dmt/settings.json', 'utf-8');
settings = JSON.parse(settings);

const manifestFileName = settings.manifest;
const app_base = settings.app_base; // change this to your app base name
// ie. the frontend sub-route in which the app should run.

const manifestPath = `build/${manifestFileName}`;

// if it doesn't exist nothing will happend

if (manifestFileName && fs.existsSync(manifestPath)) {
  let manifest = fs.readFileSync(manifestPath, 'utf-8');
  manifest = JSON.parse(manifest);

  manifest.icons = manifest.icons.reduce(
    (icons, icon) => [...icons, { ...icon, src: `/${app_base}` + icon.src }],
    []
  );

  manifest.start_url = `/${app_base}/`;
  manifest.scope = `/${app_base}/`;

  fs.writeFileSync(manifestPath, JSON.stringify(manifest));
  console.log(`edited manifest to also match /${app_base}/`);
}
