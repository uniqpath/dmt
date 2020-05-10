import util from 'util';
import fs from 'fs';
import path from 'path';
import os from 'os';
const { homedir } = os;

import { push } from 'dmt/notify';

import dmt from 'dmt/bridge';
const { log, scan } = dmt;

function reportIssue(msg) {
  log.red(`⚠️  Warning: ${msg}`);
  push.notify(`${dmt.deviceGeneralIdentifier()}: ${msg}`);
}

function readNoteIndex() {
  return new Promise((success, reject) => {
    console.log(
      'WARNING: please implement 5s cache so that json tree is not re-read on each search request... still a great tradeoff between liveness and performance'
    );

    const noteIndexDirectory = path.join(homedir(), '.dmt-notes');

    if (fs.existsSync(noteIndexDirectory)) {
      const files = scan.recursive(noteIndexDirectory, { flatten: true, extname: '.json' });
      const fileRead = util.promisify(fs.readFile);

      Promise.all(
        files.map(({ path, relpath }) => {
          return new Promise(success => {
            const hiddenContext = '';
            fileRead(path)
              .then(fileBuffer => success({ filePath: path, fileBuffer, hiddenContext }))
              .catch(e => success({ error: e.message }));
          });
        })
      )
        .then(results => {
          const notes = results.map(({ error, filePath, fileBuffer, hiddenContext }) => {
            if (error) {
              reportIssue(`note file ${filePath} could not be read: ${error}`);
              return null;
            }

            try {
              const note = JSON.parse(fileBuffer.toString());

              return { isNote: true, noteId: note.id, noteContents: note.text, noteTags: note.tags, notePreview: note.text.slice(0, 50) };
            } catch (e) {
              reportIssue(`swarm index file ${filePath} could not be parsed: ${e.message}`);
              return null;
            }
          });

          success(notes.filter(Boolean));
        })
        .catch(reject);
    } else {
      success([]);
    }
  });
}

export default readNoteIndex;
