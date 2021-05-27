import colors from 'colors';
import fs from 'fs';
import path from 'path';

import { deviceLinkIndexWithoutDerivedData, linkIndexPath } from 'dmt/webindex';
import writeFileAtomic from 'write-file-atomic';

import { push } from 'dmt/notify';

import dmt from 'dmt/bridge';
const { log, util } = dmt;

import webscanJob from '../lib/jobs/webscanJob';

const args = process.argv.slice(2);

if (args.length != 1) {
  console.log(colors.yellow('Usage:'));
  console.log('cli createLinkIndex [deviceName]');
  process.exit();
}

const deviceName = args[0] || dmt.device().id;

function reportIssue(msg) {
  log.red(`⚠️  Warning: ${msg}`);
  push.notify(`${dmt.deviceGeneralIdentifier()}: ${msg}`);
}

const linksDirectory = linkIndexPath(deviceName);

const indexFile = path.join(dmt.dmtHereEnsure('webindex'), `${deviceName}.json`);
const indexFileInProgress = path.join(dmt.dmtHereEnsure('webindex'), `${deviceName}.json-in-progress`);

function writeLinkIndexAtomic(linkIndex) {
  writeFileAtomic.sync(indexFileInProgress, JSON.stringify(linkIndex, null, 2));
}

const existingLinkIndex = deviceLinkIndexWithoutDerivedData(deviceName);

const linkIndex = [];
const allErrors = [];

function displayConclusion(isLastBatch) {
  if (!isLastBatch) {
    return;
  }

  if (allErrors.length) {
    console.log();
    console.log('⚠️  ALL ERRORS:');
    console.log();
    console.log(colors.red(allErrors));
  }

  console.log(colors.cyan(`Total links: ${colors.yellow(linkIndex.length)}`));
  console.log();

  const newEntries = linkIndex.filter(({ alreadyPresentInIndex }) => !alreadyPresentInIndex);

  console.log(
    colors.green(
      `Scanned and added ${colors.yellow(newEntries.length)} new entries. ${colors.gray(`${linkIndex.length - newEntries.length} didn't need scanning.`)}`
    )
  );

  if (newEntries.length) {
    console.log();
    console.log(colors.green(newEntries));
  }

  const diff = existingLinkIndex.length - linkIndex.length;

  if (diff > 0) {
    console.log(colors.gray(`${colors.yellow(diff)} links were removed.`));
  }
}

function onBatchFinished({ successes, errors, isLastBatch }) {
  linkIndex.push(...successes);
  allErrors.push(...errors);

  if (successes.length) {
    writeLinkIndexAtomic(
      linkIndex.map(entry => {
        return { ...entry, alreadyPresentInIndex: undefined };
      })
    );
  }

  displayConclusion(isLastBatch);

  if (isLastBatch) {
    fs.rename(indexFileInProgress, indexFile, err => {
      if (err) throw err;
      process.exit();
    });
  }
}

webscanJob({ linksDirectory, onBatchFinished, existingLinkIndex });

console.log(`Written to ${indexFile}`);
