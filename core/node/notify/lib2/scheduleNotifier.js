import { program } from 'dmt/common';

import { timeutils } from 'dmt/common';

const { ONE_HOUR, ONE_DAY } = timeutils;

import { getTimepoint, describeNearTime } from 'dmt/notify';

const NEXT_SCHEDULE_TTL = 30 * ONE_HOUR;

function sortDateStrings(dates) {
  return dates.sort((a, b) => {
    const [dayA, monthA] = a.split('.').map(Number);
    const [dayB, monthB] = b.split('.').map(Number);
    if (monthA !== monthB) return monthA - monthB;
    return dayA - dayB;
  });
}

function compareTime(timeA, timeB) {
  const [hoursA, minutesA] = timeA.split(':').map(Number);
  const [hoursB, minutesB] = timeB.split(':').map(Number);
  return hoursA * 60 + minutesA - (hoursB * 60 + minutesB);
}

function getSloDayOfWeek(dateStr, year) {
  const [day, month] = dateStr.split('.').map(Number);
  const date = new Date(year, month - 1, day);
  const dow = date.getDay();

  const slovDays = ['Nedelja', 'Ponedeljek', 'Torek', 'Sreda', 'Četrtek', 'Petek', 'Sobota'];
  return slovDays[dow];
}

function augmentWithNext(
  list,
  {
    defaultYear = undefined,
    highPriority = false,
    alertBeforeMin = 10,
    notifyDayBeforeAt = '20:30',
    url = undefined,
    urlTitle = undefined,
    user = undefined,
    users = undefined,
    app = undefined
  } = {}
) {
  const augmented = list.map(event => ({ ...event }));

  const byDate = new Map();
  augmented.forEach((event, idx) => {
    const [date, time] = event.when.split(' at ');
    if (!byDate.has(date)) byDate.set(date, []);
    byDate.get(date).push({ event, idx, time, date, when: event.when });
  });

  const sortedDates = sortDateStrings(Array.from(byDate.keys()));

  const parseTimeToSeconds = timeStr => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 3600 + minutes * 60;
  };

  sortedDates.forEach((date, dateIdx) => {
    const events = byDate.get(date);

    events.sort((a, b) => compareTime(a.time, b.time));

    events.forEach((curr, i) => {
      let nextInfo;
      const currentMsg = augmented[curr.idx].msg;
      const isFirstEvent = i === 0;
      if (isFirstEvent) {
        augmented[curr.idx].notifyMinutesBefore = [60, alertBeforeMin];
      } else {
        augmented[curr.idx].notifyMinutesBefore = alertBeforeMin;
      }

      augmented[curr.idx].highPriority = augmented[curr.idx].highPriority || highPriority;
      augmented[curr.idx].defaultYear = augmented[curr.idx].defaultYear || defaultYear;
      augmented[curr.idx].url = augmented[curr.idx].url || url;
      augmented[curr.idx].urlTitle = augmented[curr.idx].urlTitle || urlTitle;
      augmented[curr.idx].user = augmented[curr.idx].user || user;
      augmented[curr.idx].users = augmented[curr.idx].users || users;
      augmented[curr.idx].app = augmented[curr.idx].app || app;

      if (i < events.length - 1) {
        const remainingEvents = events.slice(i + 1);

        const clocks = ['🕐', '🕑', '🕒', '🕓', '🕔', '🕕', '🕖', '🕗', '🕘'];

        const lines = remainingEvents.map((next, idx) => {
          const nextTitle = next.event.title;
          const isFirst = idx === 0;
          const isLast = idx === remainingEvents.length - 1;

          let symbol = '';
          if (isLast) symbol = '✅';
          else if (isFirst) symbol = '⏭️';
          else {
            const clockIdx = (idx - 1) % clocks.length;
            symbol = clocks[clockIdx];
          }

          const { timepoint } = getTimepoint({ t: next.when, defaultYear });
          const { datetime, isToday } = describeNearTime(timepoint);

          const prefix = symbol ? `${symbol} ` : '';
          return `${prefix}${isToday ? next.time : datetime} · ${nextTitle}`;
        });

        nextInfo = lines.join('\n');

        const currentSeconds = parseTimeToSeconds(curr.time);
        const firstNextSeconds = parseTimeToSeconds(remainingEvents[0].time);
        if (isFirstEvent) {
          augmented[curr.idx].ttl = 1000 * (firstNextSeconds - currentSeconds) + ONE_HOUR;
        } else {
          augmented[curr.idx].ttl = 1000 * (firstNextSeconds - currentSeconds);
        }
      } else {
        augmented[curr.idx].clockSymbol = '✅';
        if (isFirstEvent) {
          augmented[curr.idx].notifyDayBeforeAt = notifyDayBeforeAt;
        }

        if (dateIdx + 1 < sortedDates.length) {
          const nextDate = sortedDates[dateIdx + 1];
          const nextDayEvents = byDate.get(nextDate);
          nextDayEvents.sort((a, b) => compareTime(a.time, b.time));
          const firstNextDayEvent = nextDayEvents[0];
          const nextTitle = firstNextDayEvent.event.title;

          const { timepoint } = getTimepoint({ t: firstNextDayEvent.event.when, defaultYear });

          nextInfo = `📅 ${describeNearTime(timepoint).datetime} · ${nextTitle}`;
        }

        augmented[curr.idx].ttl = ONE_DAY;
      }

      if (nextInfo) {
        if (!currentMsg || currentMsg.trim() === '') {
          augmented[curr.idx].msg = nextInfo;
        } else {
          augmented[curr.idx].msg = `${currentMsg}\n\n${nextInfo}`;
        }
      }
    });
  });

  return augmented;
}

function createNextSchedule(
  list,
  { defaultYear = undefined, notifyDayBeforeAt = undefined, user = undefined, users = undefined, url = undefined, urlTitle = undefined, app = undefined } = {}
) {
  if (notifyDayBeforeAt == undefined) {
    notifyDayBeforeAt = '18:00';
  }

  if (!notifyDayBeforeAt) {
    return [];
  }

  const byDate = new Map();
  list.forEach(event => {
    const [date, time] = event.when.split(' at ');
    if (!byDate.has(date)) byDate.set(date, []);
    byDate.get(date).push({ ...event, time, date });
  });

  const sortedDates = sortDateStrings(Array.from(byDate.keys()));

  const scheduleList = [];

  const subtractOneDay = dateStr => {
    const [day, month] = dateStr.split('.').map(Number);
    const date = new Date(defaultYear, month - 1, day);
    date.setDate(date.getDate() - 1);
    return `${date.getDate()}.${date.getMonth() + 1}.`;
  };

  for (let i = 0; i < sortedDates.length; i++) {
    const currentDate = sortedDates[i];
    const previousDate = subtractOneDay(currentDate);
    const events = byDate.get(currentDate);

    events.sort((a, b) => compareTime(a.time, b.time));

    const msg = events
      .map(event => {
        const symbol = event.symbol || '';
        return `${symbol} ${event.time} · ${event.title}`;
      })
      .join('\n');

    scheduleList.push({
      symbol: 'ℹ️',
      title: `Jutri — ${getSloDayOfWeek(currentDate, defaultYear)}, ${currentDate}`,
      when: `${previousDate} at ${notifyDayBeforeAt}`,
      ttl: NEXT_SCHEDULE_TTL,
      msg,
      defaultYear,
      app,
      user,
      users,
      url,
      urlTitle
    });
  }

  return scheduleList;
}

import { isReloadableNotifications } from './lib/isReloadableNotifications.js';

import DynamicNotifier from './dynamicNotifier.js';

export default function scheduleNotifier(notifications, options = {}) {
  const decommissionable = isReloadableNotifications(new Error(), import.meta.url);

  program.registerNotifier(new DynamicNotifier(() => augmentWithNext(notifications, options), {}, decommissionable));
  program.registerNotifier(new DynamicNotifier(() => createNextSchedule(notifications, options), {}, decommissionable));
}
