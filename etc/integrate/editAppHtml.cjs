const fs = require('fs');

let settings = fs.readFileSync('dmt/settings.json', 'utf-8');
settings = JSON.parse(settings);

const appHtmlPath = settings.app_html;
const app_base = settings.app_base; // change this to your app base name
// ie. the frontend sub-route in which the app should run.

// const reString = `href ?= ?[\\"\\']{1}\\/(?!${app_base}\\/)[\\w\\.0-9\\-]+[\\"\\']{1}`;

// we don't know if they are using single or double qoutes
const reString = `href ?= ?[\\"]{1}\\/(?!${app_base})`;
const reString2 = `href ?= ?[\\']{1}\\/(?!${app_base})`;
const reString3 = `src ?= ?[\\"]{1}\\/(?!${app_base})`;
const reString4 = `src ?= ?[\\']{1}\\/(?!${app_base})`;

if (fs.existsSync(appHtmlPath)) {
  let appHtml = fs.readFileSync(appHtmlPath, 'utf8');
  appHtml = appHtml.replace(RegExp(reString, 'g'), `href="/${app_base}/`);
  appHtml = appHtml.replace(RegExp(reString2, 'g'), `href='/${app_base}/`);
  appHtml = appHtml.replace(RegExp(reString3, 'g'), `src="/${app_base}/`);
  appHtml = appHtml.replace(RegExp(reString4, 'g'), `src='/${app_base}/`);

  fs.writeFileSync(appHtmlPath, appHtml);
  // console.log(appHtml);

  console.log(`edited ${appHtmlPath}`);
}
