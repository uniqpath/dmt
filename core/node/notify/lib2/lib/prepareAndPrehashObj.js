import getObjHash from '../../lib/pushover/getObjHash.js';

export default function prepareAndPrehashObj({ obj, msg }) {
  const { msg: pushMsg, tagline } = obj;

  delete obj.msg;
  delete obj.tagline;

  const preHash = getObjHash({ ...obj, msg });

  return {
    ...obj,
    msg: pushMsg,
    tagline,
    preHash
  };
}
