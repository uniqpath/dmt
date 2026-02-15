import { timeutils } from 'dmt/common';

const { ONE_HOUR } = timeutils;

import getDelayWarning from './delayWarning.js';
import getObjHash from '../../lib/pushover/getObjHash.js';

export default function prepareAndPrehashObj({ obj, msg, now, delayWarning = true } = {}) {
  const { msg: pushMsg, tagline } = obj;

  delete obj.msg;
  delete obj.tagline;

  const preHash = getObjHash({ ...obj, msg });

  return {
    ...obj,
    msg: delayWarning ? getDelayWarning(pushMsg, now, ONE_HOUR) : pushMsg,
    tagline,
    preHash
  };
}
