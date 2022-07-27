const fs = require('fs');

let settings = fs.readFileSync('dmt/settings.json', 'utf-8');
settings = JSON.parse(settings);

const appHtmlPath = settings.app_html;
const app_base = settings.app_base; // change this to your app base name in settings.json
// ie. the frontend sub-route in which the app should run.

// const reString = `href ?= ?[\\"\\']{1}\\/(?!${app_base}\\/)[\\w\\.0-9\\-]+[\\"\\']{1}`;

// we don't know if it is using single or double qoutes
const reString = `href ?= ?[\\"]{1}\\/${app_base}`;
const reString2 = `href ?= ?[\\']{1}\\/${app_base}`;

if (fs.existsSync(appHtmlPath)) {
  let appHtml = fs.readFileSync(appHtmlPath, 'utf8');
  appHtml = appHtml.replace(RegExp(reString, 'g'), `href="`);
  appHtml = appHtml.replace(RegExp(reString2, 'g'), `href='`);

  fs.writeFileSync(appHtmlPath, appHtml);

  console.log(`reset ${appHtmlPath}`);
}
