import dmt from 'dmt/common';

import helper from '../dmtHelper';

const { dateFns } = helper;

const { parseISO, formatISO, isBefore, isAfter, addHours, subMinutes, addDays, formatDistanceToNow } = dateFns;

export default function meetupState({ startsAtISO, meetupUrl, lang = 'en' }) {
  if (dmt.isDevMachine()) {
  }

  let meetupPassword;

  const startsAt = parseISO(startsAtISO);

  let startsIn = isBefore(Date.now(), startsAt) ? formatDistanceToNow(startsAt) : null;

  let startsInSi;
  if (startsIn) {
    startsInSi = startsIn.replace('days', 'dni').replace('day', 'dan');
  }

  let startedAgo;

  if (!startsIn) {
    startedAgo = formatDistanceToNow(startsAt, { addSuffix: true });
  }

  const earlyLinkAt = subMinutes(startsAt, 2);

  meetupUrl = isAfter(Date.now(), earlyLinkAt) ? meetupUrl : null;

  if (meetupUrl) {
  }

  let startsSoon = startsIn && isAfter(Date.now(), subMinutes(startsAt, 60));
  let aboutToStart = startsIn && isAfter(Date.now(), subMinutes(startsAt, 1));

  let startsAtUnixTimestamp = startsAt.getTime();

  const eventProbablyEndedAt = addHours(startsAt, 1);
  const eventReallyEndedAt = addHours(startsAt, 2);

  const eventProbablyEnded = isAfter(Date.now(), eventProbablyEndedAt) && isBefore(Date.now(), eventReallyEndedAt);

  let meetupScheduled = startsIn || meetupUrl;

  let meetupStatus;

  if (startsIn) {
    if (aboutToStart) {
      meetupStatus = 'Meetup is starting …';
    } else {
      meetupStatus = `Meetup begins in ${startsIn}.`;

      if (lang == 'si') {
        meetupStatus = `Začetek srečanja čez ${startsInSi}.`;
      }
    }
  } else if (!eventProbablyEnded) {
    meetupStatus = `Started ${startedAgo}.`;
  }

  if (isAfter(Date.now(), eventReallyEndedAt)) {
    startsAtUnixTimestamp = null;
    startsIn = null;
    meetupUrl = null;
    startsSoon = null;
    aboutToStart = null;
    startedAgo = null;
    meetupPassword = null;
    meetupScheduled = null;
    meetupStatus = null;
  }
  return {
    meetupScheduled,
    startsAtUnixTimestamp,
    startsIn,
    startsSoon,
    aboutToStart,
    meetupStatus,
    startedAgo,
    meetupUrl,
    meetupPassword,
    eventProbablyEnded,
    startsInSi
  };
}
