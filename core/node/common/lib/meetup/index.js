import { timeutils } from 'dmt/common';

const { formatFutureDistance } = timeutils;

import { dateFns } from '../dmtHelper.js';

const { parseISO, isBefore, isAfter, addMinutes, subMinutes, subDays, isToday, isTomorrow, formatDistanceToNow, localeSL } = dateFns;

export default function meetupState({ startsAtISO, meetupUrl, meetupTitle, expectedDurationMin = 60, stillAllowJoinAfterExpectedEndMin = 60, lang = 'en' }) {
  const locale = lang == 'sl' ? localeSL : undefined;

  let meetupPassword;

  const startsAt = parseISO(startsAtISO);

  let _isToday = isToday(startsAt);
  let _isTomorrow = isTomorrow(startsAt);

  let startsIn = isBefore(Date.now(), startsAt) ? formatFutureDistance(startsAt, { lang }) : null;

  let startedAgo;

  if (!startsIn) {
    startedAgo = formatDistanceToNow(startsAt, { addSuffix: true, locale });
  }

  const earlyLinkAt = subMinutes(startsAt, 5);

  meetupUrl = isAfter(Date.now(), earlyLinkAt) ? meetupUrl : null;

  if (meetupUrl) {
  }

  let startsSoon = startsIn && isAfter(Date.now(), subMinutes(startsAt, 60));
  let longTimeUntilStart = startsIn && isBefore(Date.now(), subDays(startsAt, 10));
  let aboutToStart = startsIn && isAfter(Date.now(), subMinutes(startsAt, 1));

  let startsAtUnixTimestamp = startsAt.getTime();

  const eventProbablyEndedAt = addMinutes(startsAt, expectedDurationMin);
  const eventReallyEndedAt = addMinutes(startsAt, expectedDurationMin + stillAllowJoinAfterExpectedEndMin);
  const eventProbablyEnded = isAfter(Date.now(), eventProbablyEndedAt) && isBefore(Date.now(), eventReallyEndedAt);

  let meetupScheduled = startsIn || meetupUrl;

  let meetupStatus;

  if (startsIn) {
    if (aboutToStart) {
      meetupStatus = lang != 'sl' ? 'Meetup is starting …' : 'Dogodek se začenja …';
    } else {
      meetupStatus = lang != 'sl' ? `Meetup begins in ${startsIn}.` : `Dogodek se začne čez ${startsIn}.`;
    }
  } else {
    meetupStatus = lang != 'sl' ? `Started ${startedAgo}.` : `Dogodek se je začel ${startedAgo}.`;
  }

  if (isAfter(Date.now(), eventReallyEndedAt)) {
    startsAtUnixTimestamp = null;
    startsIn = null;
    meetupUrl = null;
    startsSoon = null;
    aboutToStart = null;
    startedAgo = null;
    _isToday = null;
    _isTomorrow = null;
    meetupPassword = null;
    meetupScheduled = null;
    meetupStatus = null;
    longTimeUntilStart = null;
  }
  return {
    meetupScheduled,
    startsAtUnixTimestamp,
    startsIn,
    startsInSi: startsIn,
    startsSoon,
    aboutToStart,
    meetupStatus,
    startedAgo,
    isToday: _isToday,
    isTomorrow: _isTomorrow,
    longTimeUntilStart,
    meetupUrl,
    meetupTitle,
    meetupPassword,
    eventProbablyEnded
  };
}
