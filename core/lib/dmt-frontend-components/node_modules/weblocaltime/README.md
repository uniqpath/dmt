# weblocaltime
> Reliably convert time to local timezone in user browser.

![demo](img/weblocaltime_banner.png)

See here for [details](DETAILS.md).

Library exports only one function:

```js
export default weblocaltime;
```

## Function API

Function expects two arguments.

```js
function weblocaltime(date, { utc = false, showYear = true } = {}) { … }
```

1) **required** → standard _JavaScript_ `Date` object

2) _optional_ → `utc: bool`, `showYear: bool` which are explained later in this document

## Solution specification

- For times just after midnight (= 0:xx / 12:xx am) we will show time in both formats with additional `midnight` tag. Example: `0:50 (12:50 am) midnight`
- For times before `noon` (< 12:00) (excluding midnight) we will show time in 12h format - attaching `am` to time. This is always clear. Example: `10:00 am`
- For `noon` (= 12:xx) we will show this: `12:15 (noon)`. If we also show emoji, this is represented with ☀️.
- For times after `noon` (>= 13:00) we will show the time in **both formats** (24h and 12h). Example: `19:50 (7:50 pm)`
- In addition we always clarify what time of day it is (`morning`, `daytime`, `noon`, ` evening` or `night` / `midnight`). Example: `19:50 (7:50 pm) evening`
- Furthermore we can show an **emoji** as well: 🌚 → 🌙 → 🌅 → 🏙️ → ☀️ → 🏙️ → 🌆 → 🌙 → 🌚
- We also allow users to always see the date/time in `UTC` timezone besides their local timezone.

This should do the trick. [Solution](https://github.com/dmtsys/weblocaltime/blob/main/src/index.js) is around 70 LOC _(lines-of-code)_.

## API

```js
import weblocaltime from 'weblocaltime';

const datetime = new Date('2020-12-30T20:50:00+0200');

const { date, time, timeClarification, emoji, timezone, parts } = weblocaltime(datetime);

// =>

{
  date: 'Wednesday Dec 30 2020',
  time: '19:50',
  timeClarification: '(7:50 pm) evening',
  emoji: '🌆',
  daytime: 'evening',
  timezone: 'Central European Standard Time',
  parts: {
    day: '30',
    month: 'December',
    monthShort: 'Dec',
    monthNumeric: '12',
    year: '2020',
    hour24: '19',
    minute: '50',
    second: '00',
    weekday: 'Wednesday',
    weekdayShort: 'Wed',
    time24: '19:50',
    time12: '7:50 pm',
    timezone: 'Central European Standard Time'
  }
}
```

## Example use case

![demo](img/dmt_meetup_example.png)

**Source:** [dmt-system](https://dmt-system.com) · It's About Time
