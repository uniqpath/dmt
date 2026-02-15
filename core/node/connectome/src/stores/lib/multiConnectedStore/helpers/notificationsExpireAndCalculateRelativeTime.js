function msIntoTimeSpan(timeInMs, index = 0, result = {}) {
  const times = ['day', 'h', 'min', 's'];
  const arr = [24, 60, 60, 1000];

  if (index == times.length) {
    result.ms = timeInMs;
    return result;
  }

  if (index == 0) {
    result.totalSeconds = timeInMs / 1000.0;
  }

  const n = arr.slice(index).reduce((total, num) => total * num, 1);
  result[times[index]] = Math.floor(timeInMs / n);

  return msIntoTimeSpan(timeInMs % n, index + 1, result);
}

function humanTime(ts) {
  const times = ['day', 'h', 'min', 's'];
  let str = '';

  for (const t of times) {
    if (ts[t] > 0) {
      if (t != 's' || (t == 's' && ts.totalSeconds < 60)) {
        str = `${str} ${ts[t]} ${t}`;
      }
    }
  }

  return str.trim();
}

export default function notificationsExpireAndCalculateRelativeTime(notifications) {
  if (notifications) {
    const now = Date.now();

    const NOWNESS = 3000;

    return notifications
      .filter(n => now < n.expireAt)
      .map(n => {
        return {
          ...n,
          relativeTimeAdded: now - n.addedAt < NOWNESS ? 'now' : `${humanTime(msIntoTimeSpan(now - n.addedAt))} ago`
        };
      });
  }

  return [];
}
