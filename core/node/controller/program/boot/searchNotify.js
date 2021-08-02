import dmt from 'dmt/common';
import { push, apn } from 'dmt/notify';

const { log } = dmt;

function notify(msg, title) {
  push
    .app('zeta')
    .title(title)
    .notify(msg);
}

function shouldNotify({ ethAddress, host }) {
  return true;
}

function userIdent({ displayName, ethAddress }) {
  let str = '';

  if (displayName) {
    str += ` ${displayName}`;
  }

  if (ethAddress) {
    str += ` ${ethAddress}`;
  }

  return str == '' ? str : ` Name:${str}`;
}

function init(program) {
  program.on('dmtapp::search::query', ({ query, page, selectedTags, totalHits, timezone, searchMetadata }) => {
    const { displayName, userIdentity, ethAddress, searchOriginHost } = searchMetadata;

    let tagInfo = '';

    if (selectedTags?.length) {
      tagInfo = ` · Tags: ${selectedTags.join(', ')}`;
    }

    const pageInfo = page == 1 ? '' : ` p/${page} `;

    const msg = `🔍 ${timezone} · ${userIdent({ ethAddress, displayName })}${query}${pageInfo} · ${totalHits} HITS${tagInfo}`;
    log.gray(`${searchOriginHost} ${msg}`);

    if (shouldNotify({ ethAddress, host: searchOriginHost })) {
      notify(msg, searchOriginHost);
    }
  });

  program.on('dmtapp::link_click', ({ url, providerTag, timezone, clickMetadata }) => {
    const { displayName, userIdentity, ethAddress, host } = clickMetadata;

    if (shouldNotify({ ethAddress, host })) {
      const msg = `👁️ ${timezone} · ${host} click: ${url} (${providerTag})`;
      notify(msg, host);
      log.write(`${host} · ${msg}`);
    }
  });

  program.on('dmtapp::file_click', ({ fileName, providerTag, timezone, clickMetadata }) => {
    const { displayName, userIdentity, ethAddress, host } = clickMetadata;

    if (shouldNotify({ ethAddress, host })) {
      const msg = `🗃️ ${timezone} · ${host} click: ${fileName} (${providerTag})`;
      notify(msg, host);
      log.write(`${host} · ${msg}`);
    }
  });

  program.on('file_request', ({ providerAddress, host, filePath }) => {
    if (shouldNotify({ host })) {
      notify(`🎯 file request ${providerAddress}::${filePath}`);
    }
  });
}

export default init;
