import { log, isDevUser, colors } from 'dmt/common';

import { apn } from 'dmt/notify';

import express from 'express';

export default function setupClaims({ app, appName, publicDir, appList, appClaims }) {
  for (const appClaim of appClaims[appName] || []) {
    const match = appList.find(entry => entry.appName == appClaim);
    if (match) {
      log.red(
        `✖ Claim ${colors.cyan('frontend')} ${colors.gray(`/${appClaim}`)} through ${colors.cyan(appName)} app denied since dmt app ${colors.yellow(
          match.publicDir
        )} already exists`
      );

      if (isDevUser()) {
        apn.notify(`⚠️ Claim /${appClaim} failed, see log.`);
      }
    } else {
      log.magenta(`↳ ${colors.gray('Claiming')} ${colors.cyan('route')} ${colors.gray(`/${appClaim}`)} through ${colors.cyan(appName)} app`);
      app.use(`/${appClaim}`, express.static(publicDir));
    }
  }
}
