import { log, timeutils } from 'dmt/common';

const { prettyTime } = timeutils;

export default function delayWarning(str, fakeNow, limitMs) {
  const _actualNow = new Date();
  const actualNow = _actualNow.setSeconds(0);
  const delay = actualNow - fakeNow.getTime();

  if (delay > 0 && (!limitMs || delay > limitMs)) {
    return `${str}\n\n⚠️ Message is ${prettyTime(fakeNow, { now: actualNow })} late`;
  }

  return str;
}
