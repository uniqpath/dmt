import dmt from 'dmt/bridge';

import path from 'path';

import { fiberHandle as makeFiberHandle } from 'dmt/connectome-next';

import { detectMediaType } from 'dmt/search';

const { log } = dmt;

function enhanceNote(result, { searchOriginHost }) {
  const localhost = `localhost:${dmt.determineGUIPort()}`;
  const noteUrl = `http://${searchOriginHost || localhost}/note?id=${result.noteId}`;

  Object.assign(result, { noteUrl });
}

export default enhanceNote;
