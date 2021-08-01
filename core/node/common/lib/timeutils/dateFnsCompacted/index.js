function t(t) {
  if (null === t || !0 === t || !1 === t) return NaN;
  var e = Number(t);
  return isNaN(e) ? e : e < 0 ? Math.ceil(e) : Math.floor(e);
}
function e(t, e) {
  if (e.length < t) throw new TypeError(t + ' argument' + (t > 1 ? 's' : '') + ' required, but only ' + e.length + ' present');
}
function n(t) {
  e(1, arguments);
  var n = Object.prototype.toString.call(t);
  return t instanceof Date || ('object' == typeof t && '[object Date]' === n)
    ? new Date(t.getTime())
    : 'number' == typeof t || '[object Number]' === n
    ? new Date(t)
    : (('string' != typeof t && '[object String]' !== n) ||
        'undefined' == typeof console ||
        (console.warn(
          "Starting with v2.0.0-beta.1 date-fns doesn't accept strings as arguments. Please use `parseISO` to parse strings. See: https://git.io/fjule"
        ),
        console.warn(new Error().stack)),
      new Date(NaN));
}
function r(r, a) {
  e(2, arguments);
  var o = n(r),
    i = t(a);
  return o.setDate(o.getDate() + i), o;
}
function a(r, a) {
  e(2, arguments);
  var o = n(r).getTime(),
    i = t(a);
  return new Date(o + i);
}
function o(n, r) {
  e(2, arguments);
  var o = t(r);
  return a(n, 36e5 * o);
}
function i(t) {
  return t.getTime() % 6e4;
}
function u(t) {
  var e = new Date(t.getTime()),
    n = Math.ceil(e.getTimezoneOffset());
  return e.setSeconds(0, 0), 6e4 * n + (n > 0 ? (6e4 + i(e)) % 6e4 : i(e));
}
function s(t) {
  e(1, arguments);
  var r = n(t);
  return r.setHours(0, 0, 0, 0), r;
}
function c(n, r) {
  e(2, arguments);
  var o = t(r);
  return a(n, 6e4 * o);
}
function d(n, r) {
  e(2, arguments);
  var o = t(r);
  return a(n, 1e3 * o);
}
function l(t, r) {
  e(2, arguments);
  var a = n(t),
    o = n(r),
    i = a.getTime() - o.getTime();
  return i < 0 ? -1 : i > 0 ? 1 : i;
}
function f(t) {
  e(1, arguments);
  var r = n(t);
  return !isNaN(r);
}
function m(t, n) {
  e(2, arguments);
  var r = s(t),
    a = s(n);
  return r.getTime() === a.getTime();
}
function h(t, r) {
  e(2, arguments);
  var a = n(t),
    o = n(r),
    i = a.getFullYear() - o.getFullYear(),
    u = a.getMonth() - o.getMonth();
  return 12 * i + u;
}
function w(t, r) {
  e(2, arguments);
  var a = n(t),
    o = n(r);
  return a.getTime() - o.getTime();
}
function g(t, r) {
  e(2, arguments);
  var a = n(t),
    o = n(r),
    i = l(a, o),
    u = Math.abs(h(a, o));
  a.setMonth(a.getMonth() - i * u);
  var s = l(a, o) === -i,
    c = i * (u - s);
  return 0 === c ? 0 : c;
}
function p(t, n) {
  e(2, arguments);
  var r = w(t, n) / 1e3;
  return r > 0 ? Math.floor(r) : Math.ceil(r);
}
var v = {
  lessThanXSeconds: { one: 'less than a second', other: 'less than {{count}} seconds' },
  xSeconds: { one: '1 second', other: '{{count}} seconds' },
  halfAMinute: 'half a minute',
  lessThanXMinutes: { one: 'less than a minute', other: 'less than {{count}} minutes' },
  xMinutes: { one: '1 minute', other: '{{count}} minutes' },
  aboutXHours: { one: 'about 1 hour', other: 'about {{count}} hours' },
  xHours: { one: '1 hour', other: '{{count}} hours' },
  xDays: { one: '1 day', other: '{{count}} days' },
  aboutXMonths: { one: 'about 1 month', other: 'about {{count}} months' },
  xMonths: { one: '1 month', other: '{{count}} months' },
  aboutXYears: { one: 'about 1 year', other: 'about {{count}} years' },
  xYears: { one: '1 year', other: '{{count}} years' },
  overXYears: { one: 'over 1 year', other: 'over {{count}} years' },
  almostXYears: { one: 'almost 1 year', other: 'almost {{count}} years' }
};
function b(t) {
  return function(e) {
    var n = e || {},
      r = n.width ? String(n.width) : t.defaultWidth;
    return t.formats[r] || t.formats[t.defaultWidth];
  };
}
var y = {
    date: b({ formats: { full: 'EEEE, MMMM do, y', long: 'MMMM do, y', medium: 'MMM d, y', short: 'MM/dd/yyyy' }, defaultWidth: 'full' }),
    time: b({ formats: { full: 'h:mm:ss a zzzz', long: 'h:mm:ss a z', medium: 'h:mm:ss a', short: 'h:mm a' }, defaultWidth: 'full' }),
    dateTime: b({
      formats: { full: "{{date}} 'at' {{time}}", long: "{{date}} 'at' {{time}}", medium: '{{date}}, {{time}}', short: '{{date}}, {{time}}' },
      defaultWidth: 'full'
    })
  },
  T = {
    lastWeek: "'last' eeee 'at' p",
    yesterday: "'yesterday at' p",
    today: "'today at' p",
    tomorrow: "'tomorrow at' p",
    nextWeek: "eeee 'at' p",
    other: 'P'
  };
function k(t) {
  return function(e, n) {
    var r,
      a = n || {};
    if ('formatting' === (a.context ? String(a.context) : 'standalone') && t.formattingValues) {
      var o = t.defaultFormattingWidth || t.defaultWidth,
        i = a.width ? String(a.width) : o;
      r = t.formattingValues[i] || t.formattingValues[o];
    } else {
      var u = t.defaultWidth,
        s = a.width ? String(a.width) : t.defaultWidth;
      r = t.values[s] || t.values[u];
    }
    return r[t.argumentCallback ? t.argumentCallback(e) : e];
  };
}
function x(t) {
  return function(e, n) {
    var r = String(e),
      a = n || {},
      o = r.match(t.matchPattern);
    if (!o) return null;
    var i = o[0],
      u = r.match(t.parsePattern);
    if (!u) return null;
    var s = t.valueCallback ? t.valueCallback(u[0]) : u[0];
    return { value: (s = a.valueCallback ? a.valueCallback(s) : s), rest: r.slice(i.length) };
  };
}
function M(t) {
  return function(e, n) {
    var r = String(e),
      a = n || {},
      o = a.width,
      i = (o && t.matchPatterns[o]) || t.matchPatterns[t.defaultMatchWidth],
      u = r.match(i);
    if (!u) return null;
    var s,
      c = u[0],
      d = (o && t.parsePatterns[o]) || t.parsePatterns[t.defaultParseWidth];
    return (
      (s =
        '[object Array]' === Object.prototype.toString.call(d)
          ? (function(t, e) {
              for (var n = 0; n < t.length; n++) if (e(t[n])) return n;
            })(d, function(t) {
              return t.test(c);
            })
          : (function(t, e) {
              for (var n in t) if (t.hasOwnProperty(n) && e(t[n])) return n;
            })(d, function(t) {
              return t.test(c);
            })),
      (s = t.valueCallback ? t.valueCallback(s) : s),
      { value: (s = a.valueCallback ? a.valueCallback(s) : s), rest: r.slice(c.length) }
    );
  };
}
var C = {
  code: 'en-US',
  formatDistance: function(t, e, n) {
    var r;
    return (
      (n = n || {}),
      (r = 'string' == typeof v[t] ? v[t] : 1 === e ? v[t].one : v[t].other.replace('{{count}}', e)),
      n.addSuffix ? (n.comparison > 0 ? 'in ' + r : r + ' ago') : r
    );
  },
  formatLong: y,
  formatRelative: function(t, e, n, r) {
    return T[t];
  },
  localize: {
    ordinalNumber: function(t, e) {
      var n = Number(t),
        r = n % 100;
      if (r > 20 || r < 10)
        switch (r % 10) {
          case 1:
            return n + 'st';
          case 2:
            return n + 'nd';
          case 3:
            return n + 'rd';
        }
      return n + 'th';
    },
    era: k({ values: { narrow: ['B', 'A'], abbreviated: ['BC', 'AD'], wide: ['Before Christ', 'Anno Domini'] }, defaultWidth: 'wide' }),
    quarter: k({
      values: { narrow: ['1', '2', '3', '4'], abbreviated: ['Q1', 'Q2', 'Q3', 'Q4'], wide: ['1st quarter', '2nd quarter', '3rd quarter', '4th quarter'] },
      defaultWidth: 'wide',
      argumentCallback: function(t) {
        return Number(t) - 1;
      }
    }),
    month: k({
      values: {
        narrow: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
        abbreviated: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        wide: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
      },
      defaultWidth: 'wide'
    }),
    day: k({
      values: {
        narrow: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
        short: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
        abbreviated: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        wide: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      },
      defaultWidth: 'wide'
    }),
    dayPeriod: k({
      values: {
        narrow: { am: 'a', pm: 'p', midnight: 'mi', noon: 'n', morning: 'morning', afternoon: 'afternoon', evening: 'evening', night: 'night' },
        abbreviated: { am: 'AM', pm: 'PM', midnight: 'midnight', noon: 'noon', morning: 'morning', afternoon: 'afternoon', evening: 'evening', night: 'night' },
        wide: { am: 'a.m.', pm: 'p.m.', midnight: 'midnight', noon: 'noon', morning: 'morning', afternoon: 'afternoon', evening: 'evening', night: 'night' }
      },
      defaultWidth: 'wide',
      formattingValues: {
        narrow: {
          am: 'a',
          pm: 'p',
          midnight: 'mi',
          noon: 'n',
          morning: 'in the morning',
          afternoon: 'in the afternoon',
          evening: 'in the evening',
          night: 'at night'
        },
        abbreviated: {
          am: 'AM',
          pm: 'PM',
          midnight: 'midnight',
          noon: 'noon',
          morning: 'in the morning',
          afternoon: 'in the afternoon',
          evening: 'in the evening',
          night: 'at night'
        },
        wide: {
          am: 'a.m.',
          pm: 'p.m.',
          midnight: 'midnight',
          noon: 'noon',
          morning: 'in the morning',
          afternoon: 'in the afternoon',
          evening: 'in the evening',
          night: 'at night'
        }
      },
      defaultFormattingWidth: 'wide'
    })
  },
  match: {
    ordinalNumber: x({
      matchPattern: /^(\d+)(th|st|nd|rd)?/i,
      parsePattern: /\d+/i,
      valueCallback: function(t) {
        return parseInt(t, 10);
      }
    }),
    era: M({
      matchPatterns: {
        narrow: /^(b|a)/i,
        abbreviated: /^(b\.?\s?c\.?|b\.?\s?c\.?\s?e\.?|a\.?\s?d\.?|c\.?\s?e\.?)/i,
        wide: /^(before christ|before common era|anno domini|common era)/i
      },
      defaultMatchWidth: 'wide',
      parsePatterns: { any: [/^b/i, /^(a|c)/i] },
      defaultParseWidth: 'any'
    }),
    quarter: M({
      matchPatterns: { narrow: /^[1234]/i, abbreviated: /^q[1234]/i, wide: /^[1234](th|st|nd|rd)? quarter/i },
      defaultMatchWidth: 'wide',
      parsePatterns: { any: [/1/i, /2/i, /3/i, /4/i] },
      defaultParseWidth: 'any',
      valueCallback: function(t) {
        return t + 1;
      }
    }),
    month: M({
      matchPatterns: {
        narrow: /^[jfmasond]/i,
        abbreviated: /^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i,
        wide: /^(january|february|march|april|may|june|july|august|september|october|november|december)/i
      },
      defaultMatchWidth: 'wide',
      parsePatterns: {
        narrow: [/^j/i, /^f/i, /^m/i, /^a/i, /^m/i, /^j/i, /^j/i, /^a/i, /^s/i, /^o/i, /^n/i, /^d/i],
        any: [/^ja/i, /^f/i, /^mar/i, /^ap/i, /^may/i, /^jun/i, /^jul/i, /^au/i, /^s/i, /^o/i, /^n/i, /^d/i]
      },
      defaultParseWidth: 'any'
    }),
    day: M({
      matchPatterns: {
        narrow: /^[smtwf]/i,
        short: /^(su|mo|tu|we|th|fr|sa)/i,
        abbreviated: /^(sun|mon|tue|wed|thu|fri|sat)/i,
        wide: /^(sunday|monday|tuesday|wednesday|thursday|friday|saturday)/i
      },
      defaultMatchWidth: 'wide',
      parsePatterns: { narrow: [/^s/i, /^m/i, /^t/i, /^w/i, /^t/i, /^f/i, /^s/i], any: [/^su/i, /^m/i, /^tu/i, /^w/i, /^th/i, /^f/i, /^sa/i] },
      defaultParseWidth: 'any'
    }),
    dayPeriod: M({
      matchPatterns: {
        narrow: /^(a|p|mi|n|(in the|at) (morning|afternoon|evening|night))/i,
        any: /^([ap]\.?\s?m\.?|midnight|noon|(in the|at) (morning|afternoon|evening|night))/i
      },
      defaultMatchWidth: 'any',
      parsePatterns: {
        any: { am: /^a/i, pm: /^p/i, midnight: /^mi/i, noon: /^no/i, morning: /morning/i, afternoon: /afternoon/i, evening: /evening/i, night: /night/i }
      },
      defaultParseWidth: 'any'
    })
  },
  options: { weekStartsOn: 0, firstWeekContainsDate: 1 }
};
function D(n, r) {
  e(2, arguments);
  var o = t(r);
  return a(n, -o);
}
function j(t, e) {
  for (var n = t < 0 ? '-' : '', r = Math.abs(t).toString(); r.length < e; ) r = '0' + r;
  return n + r;
}
var U = function(t, e) {
    var n = t.getUTCFullYear(),
      r = n > 0 ? n : 1 - n;
    return j('yy' === e ? r % 100 : r, e.length);
  },
  P = function(t, e) {
    var n = t.getUTCMonth();
    return 'M' === e ? String(n + 1) : j(n + 1, 2);
  },
  S = function(t, e) {
    return j(t.getUTCDate(), e.length);
  },
  Y = function(t, e) {
    return j(t.getUTCHours() % 12 || 12, e.length);
  },
  E = function(t, e) {
    return j(t.getUTCHours(), e.length);
  },
  N = function(t, e) {
    return j(t.getUTCMinutes(), e.length);
  },
  q = function(t, e) {
    return j(t.getUTCSeconds(), e.length);
  },
  H = function(t, e) {
    var n = e.length,
      r = t.getUTCMilliseconds();
    return j(Math.floor(r * Math.pow(10, n - 3)), e.length);
  };
function W(t) {
  e(1, arguments);
  var r = 1,
    a = n(t),
    o = a.getUTCDay(),
    i = (o < r ? 7 : 0) + o - r;
  return a.setUTCDate(a.getUTCDate() - i), a.setUTCHours(0, 0, 0, 0), a;
}
function X(t) {
  e(1, arguments);
  var r = n(t),
    a = r.getUTCFullYear(),
    o = new Date(0);
  o.setUTCFullYear(a + 1, 0, 4), o.setUTCHours(0, 0, 0, 0);
  var i = W(o),
    u = new Date(0);
  u.setUTCFullYear(a, 0, 4), u.setUTCHours(0, 0, 0, 0);
  var s = W(u);
  return r.getTime() >= i.getTime() ? a + 1 : r.getTime() >= s.getTime() ? a : a - 1;
}
function O(t) {
  e(1, arguments);
  var n = X(t),
    r = new Date(0);
  r.setUTCFullYear(n, 0, 4), r.setUTCHours(0, 0, 0, 0);
  var a = W(r);
  return a;
}
function z(t) {
  e(1, arguments);
  var r = n(t),
    a = W(r).getTime() - O(r).getTime();
  return Math.round(a / 6048e5) + 1;
}
function L(r, a) {
  e(1, arguments);
  var o = a || {},
    i = o.locale,
    u = i && i.options && i.options.weekStartsOn,
    s = null == u ? 0 : t(u),
    c = null == o.weekStartsOn ? s : t(o.weekStartsOn);
  if (!(c >= 0 && c <= 6)) throw new RangeError('weekStartsOn must be between 0 and 6 inclusively');
  var d = n(r),
    l = d.getUTCDay(),
    f = (l < c ? 7 : 0) + l - c;
  return d.setUTCDate(d.getUTCDate() - f), d.setUTCHours(0, 0, 0, 0), d;
}
function Q(r, a) {
  e(1, arguments);
  var o = n(r, a),
    i = o.getUTCFullYear(),
    u = a || {},
    s = u.locale,
    c = s && s.options && s.options.firstWeekContainsDate,
    d = null == c ? 1 : t(c),
    l = null == u.firstWeekContainsDate ? d : t(u.firstWeekContainsDate);
  if (!(l >= 1 && l <= 7)) throw new RangeError('firstWeekContainsDate must be between 1 and 7 inclusively');
  var f = new Date(0);
  f.setUTCFullYear(i + 1, 0, l), f.setUTCHours(0, 0, 0, 0);
  var m = L(f, a),
    h = new Date(0);
  h.setUTCFullYear(i, 0, l), h.setUTCHours(0, 0, 0, 0);
  var w = L(h, a);
  return o.getTime() >= m.getTime() ? i + 1 : o.getTime() >= w.getTime() ? i : i - 1;
}
function R(n, r) {
  e(1, arguments);
  var a = r || {},
    o = a.locale,
    i = o && o.options && o.options.firstWeekContainsDate,
    u = null == i ? 1 : t(i),
    s = null == a.firstWeekContainsDate ? u : t(a.firstWeekContainsDate),
    c = Q(n, r),
    d = new Date(0);
  d.setUTCFullYear(c, 0, s), d.setUTCHours(0, 0, 0, 0);
  var l = L(d, r);
  return l;
}
function F(t, r) {
  e(1, arguments);
  var a = n(t),
    o = L(a, r).getTime() - R(a, r).getTime();
  return Math.round(o / 6048e5) + 1;
}
var I = 'midnight',
  B = 'noon',
  G = 'morning',
  A = 'afternoon',
  Z = 'evening',
  K = 'night',
  $ = {
    G: function(t, e, n) {
      var r = t.getUTCFullYear() > 0 ? 1 : 0;
      switch (e) {
        case 'G':
        case 'GG':
        case 'GGG':
          return n.era(r, { width: 'abbreviated' });
        case 'GGGGG':
          return n.era(r, { width: 'narrow' });
        case 'GGGG':
        default:
          return n.era(r, { width: 'wide' });
      }
    },
    y: function(t, e, n) {
      if ('yo' === e) {
        var r = t.getUTCFullYear(),
          a = r > 0 ? r : 1 - r;
        return n.ordinalNumber(a, { unit: 'year' });
      }
      return U(t, e);
    },
    Y: function(t, e, n, r) {
      var a = Q(t, r),
        o = a > 0 ? a : 1 - a;
      return 'YY' === e ? j(o % 100, 2) : 'Yo' === e ? n.ordinalNumber(o, { unit: 'year' }) : j(o, e.length);
    },
    R: function(t, e) {
      return j(X(t), e.length);
    },
    u: function(t, e) {
      return j(t.getUTCFullYear(), e.length);
    },
    Q: function(t, e, n) {
      var r = Math.ceil((t.getUTCMonth() + 1) / 3);
      switch (e) {
        case 'Q':
          return String(r);
        case 'QQ':
          return j(r, 2);
        case 'Qo':
          return n.ordinalNumber(r, { unit: 'quarter' });
        case 'QQQ':
          return n.quarter(r, { width: 'abbreviated', context: 'formatting' });
        case 'QQQQQ':
          return n.quarter(r, { width: 'narrow', context: 'formatting' });
        case 'QQQQ':
        default:
          return n.quarter(r, { width: 'wide', context: 'formatting' });
      }
    },
    q: function(t, e, n) {
      var r = Math.ceil((t.getUTCMonth() + 1) / 3);
      switch (e) {
        case 'q':
          return String(r);
        case 'qq':
          return j(r, 2);
        case 'qo':
          return n.ordinalNumber(r, { unit: 'quarter' });
        case 'qqq':
          return n.quarter(r, { width: 'abbreviated', context: 'standalone' });
        case 'qqqqq':
          return n.quarter(r, { width: 'narrow', context: 'standalone' });
        case 'qqqq':
        default:
          return n.quarter(r, { width: 'wide', context: 'standalone' });
      }
    },
    M: function(t, e, n) {
      var r = t.getUTCMonth();
      switch (e) {
        case 'M':
        case 'MM':
          return P(t, e);
        case 'Mo':
          return n.ordinalNumber(r + 1, { unit: 'month' });
        case 'MMM':
          return n.month(r, { width: 'abbreviated', context: 'formatting' });
        case 'MMMMM':
          return n.month(r, { width: 'narrow', context: 'formatting' });
        case 'MMMM':
        default:
          return n.month(r, { width: 'wide', context: 'formatting' });
      }
    },
    L: function(t, e, n) {
      var r = t.getUTCMonth();
      switch (e) {
        case 'L':
          return String(r + 1);
        case 'LL':
          return j(r + 1, 2);
        case 'Lo':
          return n.ordinalNumber(r + 1, { unit: 'month' });
        case 'LLL':
          return n.month(r, { width: 'abbreviated', context: 'standalone' });
        case 'LLLLL':
          return n.month(r, { width: 'narrow', context: 'standalone' });
        case 'LLLL':
        default:
          return n.month(r, { width: 'wide', context: 'standalone' });
      }
    },
    w: function(t, e, n, r) {
      var a = F(t, r);
      return 'wo' === e ? n.ordinalNumber(a, { unit: 'week' }) : j(a, e.length);
    },
    I: function(t, e, n) {
      var r = z(t);
      return 'Io' === e ? n.ordinalNumber(r, { unit: 'week' }) : j(r, e.length);
    },
    d: function(t, e, n) {
      return 'do' === e ? n.ordinalNumber(t.getUTCDate(), { unit: 'date' }) : S(t, e);
    },
    D: function(t, r, a) {
      var o = (function(t) {
        e(1, arguments);
        var r = n(t),
          a = r.getTime();
        r.setUTCMonth(0, 1), r.setUTCHours(0, 0, 0, 0);
        var o = r.getTime(),
          i = a - o;
        return Math.floor(i / 864e5) + 1;
      })(t);
      return 'Do' === r ? a.ordinalNumber(o, { unit: 'dayOfYear' }) : j(o, r.length);
    },
    E: function(t, e, n) {
      var r = t.getUTCDay();
      switch (e) {
        case 'E':
        case 'EE':
        case 'EEE':
          return n.day(r, { width: 'abbreviated', context: 'formatting' });
        case 'EEEEE':
          return n.day(r, { width: 'narrow', context: 'formatting' });
        case 'EEEEEE':
          return n.day(r, { width: 'short', context: 'formatting' });
        case 'EEEE':
        default:
          return n.day(r, { width: 'wide', context: 'formatting' });
      }
    },
    e: function(t, e, n, r) {
      var a = t.getUTCDay(),
        o = (a - r.weekStartsOn + 8) % 7 || 7;
      switch (e) {
        case 'e':
          return String(o);
        case 'ee':
          return j(o, 2);
        case 'eo':
          return n.ordinalNumber(o, { unit: 'day' });
        case 'eee':
          return n.day(a, { width: 'abbreviated', context: 'formatting' });
        case 'eeeee':
          return n.day(a, { width: 'narrow', context: 'formatting' });
        case 'eeeeee':
          return n.day(a, { width: 'short', context: 'formatting' });
        case 'eeee':
        default:
          return n.day(a, { width: 'wide', context: 'formatting' });
      }
    },
    c: function(t, e, n, r) {
      var a = t.getUTCDay(),
        o = (a - r.weekStartsOn + 8) % 7 || 7;
      switch (e) {
        case 'c':
          return String(o);
        case 'cc':
          return j(o, e.length);
        case 'co':
          return n.ordinalNumber(o, { unit: 'day' });
        case 'ccc':
          return n.day(a, { width: 'abbreviated', context: 'standalone' });
        case 'ccccc':
          return n.day(a, { width: 'narrow', context: 'standalone' });
        case 'cccccc':
          return n.day(a, { width: 'short', context: 'standalone' });
        case 'cccc':
        default:
          return n.day(a, { width: 'wide', context: 'standalone' });
      }
    },
    i: function(t, e, n) {
      var r = t.getUTCDay(),
        a = 0 === r ? 7 : r;
      switch (e) {
        case 'i':
          return String(a);
        case 'ii':
          return j(a, e.length);
        case 'io':
          return n.ordinalNumber(a, { unit: 'day' });
        case 'iii':
          return n.day(r, { width: 'abbreviated', context: 'formatting' });
        case 'iiiii':
          return n.day(r, { width: 'narrow', context: 'formatting' });
        case 'iiiiii':
          return n.day(r, { width: 'short', context: 'formatting' });
        case 'iiii':
        default:
          return n.day(r, { width: 'wide', context: 'formatting' });
      }
    },
    a: function(t, e, n) {
      var r = t.getUTCHours() / 12 >= 1 ? 'pm' : 'am';
      switch (e) {
        case 'a':
        case 'aa':
        case 'aaa':
          return n.dayPeriod(r, { width: 'abbreviated', context: 'formatting' });
        case 'aaaaa':
          return n.dayPeriod(r, { width: 'narrow', context: 'formatting' });
        case 'aaaa':
        default:
          return n.dayPeriod(r, { width: 'wide', context: 'formatting' });
      }
    },
    b: function(t, e, n) {
      var r,
        a = t.getUTCHours();
      switch (((r = 12 === a ? B : 0 === a ? I : a / 12 >= 1 ? 'pm' : 'am'), e)) {
        case 'b':
        case 'bb':
        case 'bbb':
          return n.dayPeriod(r, { width: 'abbreviated', context: 'formatting' });
        case 'bbbbb':
          return n.dayPeriod(r, { width: 'narrow', context: 'formatting' });
        case 'bbbb':
        default:
          return n.dayPeriod(r, { width: 'wide', context: 'formatting' });
      }
    },
    B: function(t, e, n) {
      var r,
        a = t.getUTCHours();
      switch (((r = a >= 17 ? Z : a >= 12 ? A : a >= 4 ? G : K), e)) {
        case 'B':
        case 'BB':
        case 'BBB':
          return n.dayPeriod(r, { width: 'abbreviated', context: 'formatting' });
        case 'BBBBB':
          return n.dayPeriod(r, { width: 'narrow', context: 'formatting' });
        case 'BBBB':
        default:
          return n.dayPeriod(r, { width: 'wide', context: 'formatting' });
      }
    },
    h: function(t, e, n) {
      if ('ho' === e) {
        var r = t.getUTCHours() % 12;
        return 0 === r && (r = 12), n.ordinalNumber(r, { unit: 'hour' });
      }
      return Y(t, e);
    },
    H: function(t, e, n) {
      return 'Ho' === e ? n.ordinalNumber(t.getUTCHours(), { unit: 'hour' }) : E(t, e);
    },
    K: function(t, e, n) {
      var r = t.getUTCHours() % 12;
      return 'Ko' === e ? n.ordinalNumber(r, { unit: 'hour' }) : j(r, e.length);
    },
    k: function(t, e, n) {
      var r = t.getUTCHours();
      return 0 === r && (r = 24), 'ko' === e ? n.ordinalNumber(r, { unit: 'hour' }) : j(r, e.length);
    },
    m: function(t, e, n) {
      return 'mo' === e ? n.ordinalNumber(t.getUTCMinutes(), { unit: 'minute' }) : N(t, e);
    },
    s: function(t, e, n) {
      return 'so' === e ? n.ordinalNumber(t.getUTCSeconds(), { unit: 'second' }) : q(t, e);
    },
    S: function(t, e) {
      return H(t, e);
    },
    X: function(t, e, n, r) {
      var a = (r._originalDate || t).getTimezoneOffset();
      if (0 === a) return 'Z';
      switch (e) {
        case 'X':
          return _(a);
        case 'XXXX':
        case 'XX':
          return V(a);
        case 'XXXXX':
        case 'XXX':
        default:
          return V(a, ':');
      }
    },
    x: function(t, e, n, r) {
      var a = (r._originalDate || t).getTimezoneOffset();
      switch (e) {
        case 'x':
          return _(a);
        case 'xxxx':
        case 'xx':
          return V(a);
        case 'xxxxx':
        case 'xxx':
        default:
          return V(a, ':');
      }
    },
    O: function(t, e, n, r) {
      var a = (r._originalDate || t).getTimezoneOffset();
      switch (e) {
        case 'O':
        case 'OO':
        case 'OOO':
          return 'GMT' + J(a, ':');
        case 'OOOO':
        default:
          return 'GMT' + V(a, ':');
      }
    },
    z: function(t, e, n, r) {
      var a = (r._originalDate || t).getTimezoneOffset();
      switch (e) {
        case 'z':
        case 'zz':
        case 'zzz':
          return 'GMT' + J(a, ':');
        case 'zzzz':
        default:
          return 'GMT' + V(a, ':');
      }
    },
    t: function(t, e, n, r) {
      var a = r._originalDate || t;
      return j(Math.floor(a.getTime() / 1e3), e.length);
    },
    T: function(t, e, n, r) {
      return j((r._originalDate || t).getTime(), e.length);
    }
  };
function J(t, e) {
  var n = t > 0 ? '-' : '+',
    r = Math.abs(t),
    a = Math.floor(r / 60),
    o = r % 60;
  if (0 === o) return n + String(a);
  var i = e || '';
  return n + String(a) + i + j(o, 2);
}
function _(t, e) {
  return t % 60 == 0 ? (t > 0 ? '-' : '+') + j(Math.abs(t) / 60, 2) : V(t, e);
}
function V(t, e) {
  var n = e || '',
    r = t > 0 ? '-' : '+',
    a = Math.abs(t);
  return r + j(Math.floor(a / 60), 2) + n + j(a % 60, 2);
}
function tt(t, e) {
  switch (t) {
    case 'P':
      return e.date({ width: 'short' });
    case 'PP':
      return e.date({ width: 'medium' });
    case 'PPP':
      return e.date({ width: 'long' });
    case 'PPPP':
    default:
      return e.date({ width: 'full' });
  }
}
function et(t, e) {
  switch (t) {
    case 'p':
      return e.time({ width: 'short' });
    case 'pp':
      return e.time({ width: 'medium' });
    case 'ppp':
      return e.time({ width: 'long' });
    case 'pppp':
    default:
      return e.time({ width: 'full' });
  }
}
var nt = {
    p: et,
    P: function(t, e) {
      var n,
        r = t.match(/(P+)(p+)?/),
        a = r[1],
        o = r[2];
      if (!o) return tt(t, e);
      switch (a) {
        case 'P':
          n = e.dateTime({ width: 'short' });
          break;
        case 'PP':
          n = e.dateTime({ width: 'medium' });
          break;
        case 'PPP':
          n = e.dateTime({ width: 'long' });
          break;
        case 'PPPP':
        default:
          n = e.dateTime({ width: 'full' });
      }
      return n.replace('{{date}}', tt(a, e)).replace('{{time}}', et(o, e));
    }
  },
  rt = ['D', 'DD'],
  at = ['YY', 'YYYY'];
function ot(t) {
  return -1 !== rt.indexOf(t);
}
function it(t) {
  return -1 !== at.indexOf(t);
}
function ut(t) {
  if ('YYYY' === t) throw new RangeError('Use `yyyy` instead of `YYYY` for formatting years; see: https://git.io/fxCyr');
  if ('YY' === t) throw new RangeError('Use `yy` instead of `YY` for formatting years; see: https://git.io/fxCyr');
  if ('D' === t) throw new RangeError('Use `d` instead of `D` for formatting days of the month; see: https://git.io/fxCyr');
  if ('DD' === t) throw new RangeError('Use `dd` instead of `DD` for formatting days of the month; see: https://git.io/fxCyr');
}
var st = /[yYQqMLwIdDecihHKkms]o|(\w)\1*|''|'(''|[^'])+('|$)|./g,
  ct = /P+p+|P+|p+|''|'(''|[^'])+('|$)|./g,
  dt = /^'([^]*?)'?$/,
  lt = /''/g,
  ft = /[a-zA-Z]/;
function mt(r, a, o) {
  e(2, arguments);
  var i = String(a),
    s = o || {},
    c = s.locale || C,
    d = c.options && c.options.firstWeekContainsDate,
    l = null == d ? 1 : t(d),
    m = null == s.firstWeekContainsDate ? l : t(s.firstWeekContainsDate);
  if (!(m >= 1 && m <= 7)) throw new RangeError('firstWeekContainsDate must be between 1 and 7 inclusively');
  var h = c.options && c.options.weekStartsOn,
    w = null == h ? 0 : t(h),
    g = null == s.weekStartsOn ? w : t(s.weekStartsOn);
  if (!(g >= 0 && g <= 6)) throw new RangeError('weekStartsOn must be between 0 and 6 inclusively');
  if (!c.localize) throw new RangeError('locale must contain localize property');
  if (!c.formatLong) throw new RangeError('locale must contain formatLong property');
  var p = n(r);
  if (!f(p)) throw new RangeError('Invalid time value');
  var v = u(p),
    b = D(p, v),
    y = { firstWeekContainsDate: m, weekStartsOn: g, locale: c, _originalDate: p },
    T = i
      .match(ct)
      .map(function(t) {
        var e = t[0];
        return 'p' === e || 'P' === e ? (0, nt[e])(t, c.formatLong, y) : t;
      })
      .join('')
      .match(st)
      .map(function(t) {
        if ("''" === t) return "'";
        var e = t[0];
        if ("'" === e) return ht(t);
        var n = $[e];
        if (n) return !s.useAdditionalWeekYearTokens && it(t) && ut(t), !s.useAdditionalDayOfYearTokens && ot(t) && ut(t), n(b, t, c.localize, y);
        if (e.match(ft)) throw new RangeError('Format string contains an unescaped latin alphabet character `' + e + '`');
        return t;
      })
      .join('');
  return T;
}
function ht(t) {
  return t.match(dt)[1].replace(lt, "'");
}
function wt(t, e) {
  if (null == t) throw new TypeError('assign requires that input parameter not be null or undefined');
  for (var n in (e = e || {})) e.hasOwnProperty(n) && (t[n] = e[n]);
  return t;
}
function gt(t) {
  return wt({}, t);
}
function pt(t, r, a) {
  e(2, arguments);
  var o = a || {},
    i = o.locale || C;
  if (!i.formatDistance) throw new RangeError('locale must contain formatDistance property');
  var s = l(t, r);
  if (isNaN(s)) throw new RangeError('Invalid time value');
  var c,
    d,
    f = gt(o);
  (f.addSuffix = Boolean(o.addSuffix)), (f.comparison = s), s > 0 ? ((c = n(r)), (d = n(t))) : ((c = n(t)), (d = n(r)));
  var m,
    h = p(d, c),
    w = (u(d) - u(c)) / 1e3,
    v = Math.round((h - w) / 60);
  if (v < 2)
    return o.includeSeconds
      ? h < 5
        ? i.formatDistance('lessThanXSeconds', 5, f)
        : h < 10
        ? i.formatDistance('lessThanXSeconds', 10, f)
        : h < 20
        ? i.formatDistance('lessThanXSeconds', 20, f)
        : h < 40
        ? i.formatDistance('halfAMinute', null, f)
        : h < 60
        ? i.formatDistance('lessThanXMinutes', 1, f)
        : i.formatDistance('xMinutes', 1, f)
      : 0 === v
      ? i.formatDistance('lessThanXMinutes', 1, f)
      : i.formatDistance('xMinutes', v, f);
  if (v < 45) return i.formatDistance('xMinutes', v, f);
  if (v < 90) return i.formatDistance('aboutXHours', 1, f);
  if (v < 1440) {
    var b = Math.round(v / 60);
    return i.formatDistance('aboutXHours', b, f);
  }
  if (v < 2520) return i.formatDistance('xDays', 1, f);
  if (v < 43200) {
    var y = Math.round(v / 1440);
    return i.formatDistance('xDays', y, f);
  }
  if (v < 86400) return (m = Math.round(v / 43200)), i.formatDistance('aboutXMonths', m, f);
  if ((m = g(d, c)) < 12) {
    var T = Math.round(v / 43200);
    return i.formatDistance('xMonths', T, f);
  }
  var k = m % 12,
    x = Math.floor(m / 12);
  return k < 3 ? i.formatDistance('aboutXYears', x, f) : k < 9 ? i.formatDistance('overXYears', x, f) : i.formatDistance('almostXYears', x + 1, f);
}
function vt(t, r, a) {
  e(2, arguments);
  var o = a || {},
    i = o.locale || C;
  if (!i.formatDistance) throw new RangeError('locale must contain localize.formatDistance property');
  var s = l(t, r);
  if (isNaN(s)) throw new RangeError('Invalid time value');
  var c,
    d,
    f = gt(o);
  (f.addSuffix = Boolean(o.addSuffix)), (f.comparison = s), s > 0 ? ((c = n(r)), (d = n(t))) : ((c = n(t)), (d = n(r)));
  var m,
    h = null == o.roundingMethod ? 'round' : String(o.roundingMethod);
  if ('floor' === h) m = Math.floor;
  else if ('ceil' === h) m = Math.ceil;
  else {
    if ('round' !== h) throw new RangeError("roundingMethod must be 'floor', 'ceil' or 'round'");
    m = Math.round;
  }
  var w,
    g = p(d, c),
    v = (u(d) - u(c)) / 1e3,
    b = m((g - v) / 60);
  if (
    'second' ===
    (w = null == o.unit ? (b < 1 ? 'second' : b < 60 ? 'minute' : b < 1440 ? 'hour' : b < 43200 ? 'day' : b < 525600 ? 'month' : 'year') : String(o.unit))
  )
    return i.formatDistance('xSeconds', g, f);
  if ('minute' === w) return i.formatDistance('xMinutes', b, f);
  if ('hour' === w) {
    var y = m(b / 60);
    return i.formatDistance('xHours', y, f);
  }
  if ('day' === w) {
    var T = m(b / 1440);
    return i.formatDistance('xDays', T, f);
  }
  if ('month' === w) {
    var k = m(b / 43200);
    return i.formatDistance('xMonths', k, f);
  }
  if ('year' === w) {
    var x = m(b / 525600);
    return i.formatDistance('xYears', x, f);
  }
  throw new RangeError("unit must be 'second', 'minute', 'hour', 'day', 'month' or 'year'");
}
function bt(t, n) {
  return e(1, arguments), pt(t, Date.now(), n);
}
function yt(t, n) {
  return e(1, arguments), vt(t, Date.now(), n);
}
function Tt(t, e) {
  if (arguments.length < 1) throw new TypeError('1 argument required, but only '.concat(arguments.length, ' present'));
  var r = n(t);
  if (!f(r)) throw new RangeError('Invalid time value');
  var a = e || {},
    o = null == a.format ? 'extended' : String(a.format),
    i = null == a.representation ? 'complete' : String(a.representation);
  if ('extended' !== o && 'basic' !== o) throw new RangeError("format must be 'extended' or 'basic'");
  if ('date' !== i && 'time' !== i && 'complete' !== i) throw new RangeError("representation must be 'date', 'time', or 'complete'");
  var u = '',
    s = '',
    c = 'extended' === o ? '-' : '',
    d = 'extended' === o ? ':' : '';
  if ('time' !== i) {
    var l = j(r.getDate(), 2),
      m = j(r.getMonth() + 1, 2),
      h = j(r.getFullYear(), 4);
    u = ''
      .concat(h)
      .concat(c)
      .concat(m)
      .concat(c)
      .concat(l);
  }
  if ('date' !== i) {
    var w = r.getTimezoneOffset();
    if (0 !== w) {
      var g = Math.abs(w),
        p = j(Math.floor(g / 60), 2),
        v = j(g % 60, 2),
        b = w < 0 ? '+' : '-';
      s = ''
        .concat(b)
        .concat(p, ':')
        .concat(v);
    } else s = 'Z';
    var y = j(r.getHours(), 2),
      T = j(r.getMinutes(), 2),
      k = j(r.getSeconds(), 2),
      x = '' === u ? '' : 'T',
      M = [y, T, k].join(d);
    u = ''
      .concat(u)
      .concat(x)
      .concat(M)
      .concat(s);
  }
  return u;
}
function kt(t, r) {
  e(2, arguments);
  var a = n(t),
    o = n(r);
  return a.getTime() > o.getTime();
}
function xt(t, r) {
  e(2, arguments);
  var a = n(t),
    o = n(r);
  return a.getTime() < o.getTime();
}
function Mt(t) {
  return e(1, arguments), m(t, Date.now());
}
function Ct(t) {
  return e(1, arguments), m(t, r(Date.now(), 1));
}
function Dt(n, a) {
  e(2, arguments);
  var o = t(a);
  return r(n, -o);
}
function jt(r, a, o) {
  e(2, arguments);
  var i = o || {},
    u = i.locale,
    s = u && u.options && u.options.weekStartsOn,
    c = null == s ? 0 : t(s),
    d = null == i.weekStartsOn ? c : t(i.weekStartsOn);
  if (!(d >= 0 && d <= 6)) throw new RangeError('weekStartsOn must be between 0 and 6 inclusively');
  var l = n(r),
    f = t(a),
    m = l.getUTCDay(),
    h = f % 7,
    w = (h + 7) % 7,
    g = (w < d ? 7 : 0) + f - m;
  return l.setUTCDate(l.getUTCDate() + g), l;
}
var Ut = /^(1[0-2]|0?\d)/,
  Pt = /^(3[0-1]|[0-2]?\d)/,
  St = /^(36[0-6]|3[0-5]\d|[0-2]?\d?\d)/,
  Yt = /^(5[0-3]|[0-4]?\d)/,
  Et = /^(2[0-3]|[0-1]?\d)/,
  Nt = /^(2[0-4]|[0-1]?\d)/,
  qt = /^(1[0-1]|0?\d)/,
  Ht = /^(1[0-2]|0?\d)/,
  Wt = /^[0-5]?\d/,
  Xt = /^[0-5]?\d/,
  Ot = /^\d/,
  zt = /^\d{1,2}/,
  Lt = /^\d{1,3}/,
  Qt = /^\d{1,4}/,
  Rt = /^-?\d+/,
  Ft = /^-?\d/,
  It = /^-?\d{1,2}/,
  Bt = /^-?\d{1,3}/,
  Gt = /^-?\d{1,4}/,
  At = /^([+-])(\d{2})(\d{2})?|Z/,
  Zt = /^([+-])(\d{2})(\d{2})|Z/,
  Kt = /^([+-])(\d{2})(\d{2})((\d{2}))?|Z/,
  $t = /^([+-])(\d{2}):(\d{2})|Z/,
  Jt = /^([+-])(\d{2}):(\d{2})(:(\d{2}))?|Z/;
function _t(t, e, n) {
  var r = e.match(t);
  if (!r) return null;
  var a = parseInt(r[0], 10);
  return { value: n ? n(a) : a, rest: e.slice(r[0].length) };
}
function Vt(t, e) {
  var n = e.match(t);
  return n
    ? 'Z' === n[0]
      ? { value: 0, rest: e.slice(1) }
      : {
          value:
            ('+' === n[1] ? 1 : -1) * (36e5 * (n[2] ? parseInt(n[2], 10) : 0) + 6e4 * (n[3] ? parseInt(n[3], 10) : 0) + 1e3 * (n[5] ? parseInt(n[5], 10) : 0)),
          rest: e.slice(n[0].length)
        }
    : null;
}
function te(t, e) {
  return _t(Rt, t, e);
}
function ee(t, e, n) {
  switch (t) {
    case 1:
      return _t(Ot, e, n);
    case 2:
      return _t(zt, e, n);
    case 3:
      return _t(Lt, e, n);
    case 4:
      return _t(Qt, e, n);
    default:
      return _t(new RegExp('^\\d{1,' + t + '}'), e, n);
  }
}
function ne(t, e, n) {
  switch (t) {
    case 1:
      return _t(Ft, e, n);
    case 2:
      return _t(It, e, n);
    case 3:
      return _t(Bt, e, n);
    case 4:
      return _t(Gt, e, n);
    default:
      return _t(new RegExp('^-?\\d{1,' + t + '}'), e, n);
  }
}
function re(t) {
  switch (t) {
    case 'morning':
      return 4;
    case 'evening':
      return 17;
    case 'pm':
    case 'noon':
    case 'afternoon':
      return 12;
    case 'am':
    case 'midnight':
    case 'night':
    default:
      return 0;
  }
}
function ae(t, e) {
  var n,
    r = e > 0,
    a = r ? e : 1 - e;
  if (a <= 50) n = t || 100;
  else {
    var o = a + 50;
    n = t + 100 * Math.floor(o / 100) - (t >= o % 100 ? 100 : 0);
  }
  return r ? n : 1 - n;
}
var oe = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
  ie = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
function ue(t) {
  return t % 400 == 0 || (t % 4 == 0 && t % 100 != 0);
}
var se = {
    G: {
      priority: 140,
      parse: function(t, e, n, r) {
        switch (e) {
          case 'G':
          case 'GG':
          case 'GGG':
            return n.era(t, { width: 'abbreviated' }) || n.era(t, { width: 'narrow' });
          case 'GGGGG':
            return n.era(t, { width: 'narrow' });
          case 'GGGG':
          default:
            return n.era(t, { width: 'wide' }) || n.era(t, { width: 'abbreviated' }) || n.era(t, { width: 'narrow' });
        }
      },
      set: function(t, e, n, r) {
        return (e.era = n), t.setUTCFullYear(n, 0, 1), t.setUTCHours(0, 0, 0, 0), t;
      },
      incompatibleTokens: ['R', 'u', 't', 'T']
    },
    y: {
      priority: 130,
      parse: function(t, e, n, r) {
        var a = function(t) {
          return { year: t, isTwoDigitYear: 'yy' === e };
        };
        switch (e) {
          case 'y':
            return ee(4, t, a);
          case 'yo':
            return n.ordinalNumber(t, { unit: 'year', valueCallback: a });
          default:
            return ee(e.length, t, a);
        }
      },
      validate: function(t, e, n) {
        return e.isTwoDigitYear || e.year > 0;
      },
      set: function(t, e, n, r) {
        var a = t.getUTCFullYear();
        if (n.isTwoDigitYear) {
          var o = ae(n.year, a);
          return t.setUTCFullYear(o, 0, 1), t.setUTCHours(0, 0, 0, 0), t;
        }
        var i = 'era' in e && 1 !== e.era ? 1 - n.year : n.year;
        return t.setUTCFullYear(i, 0, 1), t.setUTCHours(0, 0, 0, 0), t;
      },
      incompatibleTokens: ['Y', 'R', 'u', 'w', 'I', 'i', 'e', 'c', 't', 'T']
    },
    Y: {
      priority: 130,
      parse: function(t, e, n, r) {
        var a = function(t) {
          return { year: t, isTwoDigitYear: 'YY' === e };
        };
        switch (e) {
          case 'Y':
            return ee(4, t, a);
          case 'Yo':
            return n.ordinalNumber(t, { unit: 'year', valueCallback: a });
          default:
            return ee(e.length, t, a);
        }
      },
      validate: function(t, e, n) {
        return e.isTwoDigitYear || e.year > 0;
      },
      set: function(t, e, n, r) {
        var a = Q(t, r);
        if (n.isTwoDigitYear) {
          var o = ae(n.year, a);
          return t.setUTCFullYear(o, 0, r.firstWeekContainsDate), t.setUTCHours(0, 0, 0, 0), L(t, r);
        }
        var i = 'era' in e && 1 !== e.era ? 1 - n.year : n.year;
        return t.setUTCFullYear(i, 0, r.firstWeekContainsDate), t.setUTCHours(0, 0, 0, 0), L(t, r);
      },
      incompatibleTokens: ['y', 'R', 'u', 'Q', 'q', 'M', 'L', 'I', 'd', 'D', 'i', 't', 'T']
    },
    R: {
      priority: 130,
      parse: function(t, e, n, r) {
        return ne('R' === e ? 4 : e.length, t);
      },
      set: function(t, e, n, r) {
        var a = new Date(0);
        return a.setUTCFullYear(n, 0, 4), a.setUTCHours(0, 0, 0, 0), W(a);
      },
      incompatibleTokens: ['G', 'y', 'Y', 'u', 'Q', 'q', 'M', 'L', 'w', 'd', 'D', 'e', 'c', 't', 'T']
    },
    u: {
      priority: 130,
      parse: function(t, e, n, r) {
        return ne('u' === e ? 4 : e.length, t);
      },
      set: function(t, e, n, r) {
        return t.setUTCFullYear(n, 0, 1), t.setUTCHours(0, 0, 0, 0), t;
      },
      incompatibleTokens: ['G', 'y', 'Y', 'R', 'w', 'I', 'i', 'e', 'c', 't', 'T']
    },
    Q: {
      priority: 120,
      parse: function(t, e, n, r) {
        switch (e) {
          case 'Q':
          case 'QQ':
            return ee(e.length, t);
          case 'Qo':
            return n.ordinalNumber(t, { unit: 'quarter' });
          case 'QQQ':
            return n.quarter(t, { width: 'abbreviated', context: 'formatting' }) || n.quarter(t, { width: 'narrow', context: 'formatting' });
          case 'QQQQQ':
            return n.quarter(t, { width: 'narrow', context: 'formatting' });
          case 'QQQQ':
          default:
            return (
              n.quarter(t, { width: 'wide', context: 'formatting' }) ||
              n.quarter(t, { width: 'abbreviated', context: 'formatting' }) ||
              n.quarter(t, { width: 'narrow', context: 'formatting' })
            );
        }
      },
      validate: function(t, e, n) {
        return e >= 1 && e <= 4;
      },
      set: function(t, e, n, r) {
        return t.setUTCMonth(3 * (n - 1), 1), t.setUTCHours(0, 0, 0, 0), t;
      },
      incompatibleTokens: ['Y', 'R', 'q', 'M', 'L', 'w', 'I', 'd', 'D', 'i', 'e', 'c', 't', 'T']
    },
    q: {
      priority: 120,
      parse: function(t, e, n, r) {
        switch (e) {
          case 'q':
          case 'qq':
            return ee(e.length, t);
          case 'qo':
            return n.ordinalNumber(t, { unit: 'quarter' });
          case 'qqq':
            return n.quarter(t, { width: 'abbreviated', context: 'standalone' }) || n.quarter(t, { width: 'narrow', context: 'standalone' });
          case 'qqqqq':
            return n.quarter(t, { width: 'narrow', context: 'standalone' });
          case 'qqqq':
          default:
            return (
              n.quarter(t, { width: 'wide', context: 'standalone' }) ||
              n.quarter(t, { width: 'abbreviated', context: 'standalone' }) ||
              n.quarter(t, { width: 'narrow', context: 'standalone' })
            );
        }
      },
      validate: function(t, e, n) {
        return e >= 1 && e <= 4;
      },
      set: function(t, e, n, r) {
        return t.setUTCMonth(3 * (n - 1), 1), t.setUTCHours(0, 0, 0, 0), t;
      },
      incompatibleTokens: ['Y', 'R', 'Q', 'M', 'L', 'w', 'I', 'd', 'D', 'i', 'e', 'c', 't', 'T']
    },
    M: {
      priority: 110,
      parse: function(t, e, n, r) {
        var a = function(t) {
          return t - 1;
        };
        switch (e) {
          case 'M':
            return _t(Ut, t, a);
          case 'MM':
            return ee(2, t, a);
          case 'Mo':
            return n.ordinalNumber(t, { unit: 'month', valueCallback: a });
          case 'MMM':
            return n.month(t, { width: 'abbreviated', context: 'formatting' }) || n.month(t, { width: 'narrow', context: 'formatting' });
          case 'MMMMM':
            return n.month(t, { width: 'narrow', context: 'formatting' });
          case 'MMMM':
          default:
            return (
              n.month(t, { width: 'wide', context: 'formatting' }) ||
              n.month(t, { width: 'abbreviated', context: 'formatting' }) ||
              n.month(t, { width: 'narrow', context: 'formatting' })
            );
        }
      },
      validate: function(t, e, n) {
        return e >= 0 && e <= 11;
      },
      set: function(t, e, n, r) {
        return t.setUTCMonth(n, 1), t.setUTCHours(0, 0, 0, 0), t;
      },
      incompatibleTokens: ['Y', 'R', 'q', 'Q', 'L', 'w', 'I', 'D', 'i', 'e', 'c', 't', 'T']
    },
    L: {
      priority: 110,
      parse: function(t, e, n, r) {
        var a = function(t) {
          return t - 1;
        };
        switch (e) {
          case 'L':
            return _t(Ut, t, a);
          case 'LL':
            return ee(2, t, a);
          case 'Lo':
            return n.ordinalNumber(t, { unit: 'month', valueCallback: a });
          case 'LLL':
            return n.month(t, { width: 'abbreviated', context: 'standalone' }) || n.month(t, { width: 'narrow', context: 'standalone' });
          case 'LLLLL':
            return n.month(t, { width: 'narrow', context: 'standalone' });
          case 'LLLL':
          default:
            return (
              n.month(t, { width: 'wide', context: 'standalone' }) ||
              n.month(t, { width: 'abbreviated', context: 'standalone' }) ||
              n.month(t, { width: 'narrow', context: 'standalone' })
            );
        }
      },
      validate: function(t, e, n) {
        return e >= 0 && e <= 11;
      },
      set: function(t, e, n, r) {
        return t.setUTCMonth(n, 1), t.setUTCHours(0, 0, 0, 0), t;
      },
      incompatibleTokens: ['Y', 'R', 'q', 'Q', 'M', 'w', 'I', 'D', 'i', 'e', 'c', 't', 'T']
    },
    w: {
      priority: 100,
      parse: function(t, e, n, r) {
        switch (e) {
          case 'w':
            return _t(Yt, t);
          case 'wo':
            return n.ordinalNumber(t, { unit: 'week' });
          default:
            return ee(e.length, t);
        }
      },
      validate: function(t, e, n) {
        return e >= 1 && e <= 53;
      },
      set: function(r, a, o, i) {
        return L(
          (function(r, a, o) {
            e(2, arguments);
            var i = n(r),
              u = t(a),
              s = F(i, o) - u;
            return i.setUTCDate(i.getUTCDate() - 7 * s), i;
          })(r, o, i),
          i
        );
      },
      incompatibleTokens: ['y', 'R', 'u', 'q', 'Q', 'M', 'L', 'I', 'd', 'D', 'i', 't', 'T']
    },
    I: {
      priority: 100,
      parse: function(t, e, n, r) {
        switch (e) {
          case 'I':
            return _t(Yt, t);
          case 'Io':
            return n.ordinalNumber(t, { unit: 'week' });
          default:
            return ee(e.length, t);
        }
      },
      validate: function(t, e, n) {
        return e >= 1 && e <= 53;
      },
      set: function(r, a, o, i) {
        return W(
          (function(r, a) {
            e(2, arguments);
            var o = n(r),
              i = t(a),
              u = z(o) - i;
            return o.setUTCDate(o.getUTCDate() - 7 * u), o;
          })(r, o, i),
          i
        );
      },
      incompatibleTokens: ['y', 'Y', 'u', 'q', 'Q', 'M', 'L', 'w', 'd', 'D', 'e', 'c', 't', 'T']
    },
    d: {
      priority: 90,
      parse: function(t, e, n, r) {
        switch (e) {
          case 'd':
            return _t(Pt, t);
          case 'do':
            return n.ordinalNumber(t, { unit: 'date' });
          default:
            return ee(e.length, t);
        }
      },
      validate: function(t, e, n) {
        var r = ue(t.getUTCFullYear()),
          a = t.getUTCMonth();
        return r ? e >= 1 && e <= ie[a] : e >= 1 && e <= oe[a];
      },
      set: function(t, e, n, r) {
        return t.setUTCDate(n), t.setUTCHours(0, 0, 0, 0), t;
      },
      incompatibleTokens: ['Y', 'R', 'q', 'Q', 'w', 'I', 'D', 'i', 'e', 'c', 't', 'T']
    },
    D: {
      priority: 90,
      parse: function(t, e, n, r) {
        switch (e) {
          case 'D':
          case 'DD':
            return _t(St, t);
          case 'Do':
            return n.ordinalNumber(t, { unit: 'date' });
          default:
            return ee(e.length, t);
        }
      },
      validate: function(t, e, n) {
        return ue(t.getUTCFullYear()) ? e >= 1 && e <= 366 : e >= 1 && e <= 365;
      },
      set: function(t, e, n, r) {
        return t.setUTCMonth(0, n), t.setUTCHours(0, 0, 0, 0), t;
      },
      incompatibleTokens: ['Y', 'R', 'q', 'Q', 'M', 'L', 'w', 'I', 'd', 'E', 'i', 'e', 'c', 't', 'T']
    },
    E: {
      priority: 90,
      parse: function(t, e, n, r) {
        switch (e) {
          case 'E':
          case 'EE':
          case 'EEE':
            return (
              n.day(t, { width: 'abbreviated', context: 'formatting' }) ||
              n.day(t, { width: 'short', context: 'formatting' }) ||
              n.day(t, { width: 'narrow', context: 'formatting' })
            );
          case 'EEEEE':
            return n.day(t, { width: 'narrow', context: 'formatting' });
          case 'EEEEEE':
            return n.day(t, { width: 'short', context: 'formatting' }) || n.day(t, { width: 'narrow', context: 'formatting' });
          case 'EEEE':
          default:
            return (
              n.day(t, { width: 'wide', context: 'formatting' }) ||
              n.day(t, { width: 'abbreviated', context: 'formatting' }) ||
              n.day(t, { width: 'short', context: 'formatting' }) ||
              n.day(t, { width: 'narrow', context: 'formatting' })
            );
        }
      },
      validate: function(t, e, n) {
        return e >= 0 && e <= 6;
      },
      set: function(t, e, n, r) {
        return (t = jt(t, n, r)).setUTCHours(0, 0, 0, 0), t;
      },
      incompatibleTokens: ['D', 'i', 'e', 'c', 't', 'T']
    },
    e: {
      priority: 90,
      parse: function(t, e, n, r) {
        var a = function(t) {
          var e = 7 * Math.floor((t - 1) / 7);
          return ((t + r.weekStartsOn + 6) % 7) + e;
        };
        switch (e) {
          case 'e':
          case 'ee':
            return ee(e.length, t, a);
          case 'eo':
            return n.ordinalNumber(t, { unit: 'day', valueCallback: a });
          case 'eee':
            return (
              n.day(t, { width: 'abbreviated', context: 'formatting' }) ||
              n.day(t, { width: 'short', context: 'formatting' }) ||
              n.day(t, { width: 'narrow', context: 'formatting' })
            );
          case 'eeeee':
            return n.day(t, { width: 'narrow', context: 'formatting' });
          case 'eeeeee':
            return n.day(t, { width: 'short', context: 'formatting' }) || n.day(t, { width: 'narrow', context: 'formatting' });
          case 'eeee':
          default:
            return (
              n.day(t, { width: 'wide', context: 'formatting' }) ||
              n.day(t, { width: 'abbreviated', context: 'formatting' }) ||
              n.day(t, { width: 'short', context: 'formatting' }) ||
              n.day(t, { width: 'narrow', context: 'formatting' })
            );
        }
      },
      validate: function(t, e, n) {
        return e >= 0 && e <= 6;
      },
      set: function(t, e, n, r) {
        return (t = jt(t, n, r)).setUTCHours(0, 0, 0, 0), t;
      },
      incompatibleTokens: ['y', 'R', 'u', 'q', 'Q', 'M', 'L', 'I', 'd', 'D', 'E', 'i', 'c', 't', 'T']
    },
    c: {
      priority: 90,
      parse: function(t, e, n, r) {
        var a = function(t) {
          var e = 7 * Math.floor((t - 1) / 7);
          return ((t + r.weekStartsOn + 6) % 7) + e;
        };
        switch (e) {
          case 'c':
          case 'cc':
            return ee(e.length, t, a);
          case 'co':
            return n.ordinalNumber(t, { unit: 'day', valueCallback: a });
          case 'ccc':
            return (
              n.day(t, { width: 'abbreviated', context: 'standalone' }) ||
              n.day(t, { width: 'short', context: 'standalone' }) ||
              n.day(t, { width: 'narrow', context: 'standalone' })
            );
          case 'ccccc':
            return n.day(t, { width: 'narrow', context: 'standalone' });
          case 'cccccc':
            return n.day(t, { width: 'short', context: 'standalone' }) || n.day(t, { width: 'narrow', context: 'standalone' });
          case 'cccc':
          default:
            return (
              n.day(t, { width: 'wide', context: 'standalone' }) ||
              n.day(t, { width: 'abbreviated', context: 'standalone' }) ||
              n.day(t, { width: 'short', context: 'standalone' }) ||
              n.day(t, { width: 'narrow', context: 'standalone' })
            );
        }
      },
      validate: function(t, e, n) {
        return e >= 0 && e <= 6;
      },
      set: function(t, e, n, r) {
        return (t = jt(t, n, r)).setUTCHours(0, 0, 0, 0), t;
      },
      incompatibleTokens: ['y', 'R', 'u', 'q', 'Q', 'M', 'L', 'I', 'd', 'D', 'E', 'i', 'e', 't', 'T']
    },
    i: {
      priority: 90,
      parse: function(t, e, n, r) {
        var a = function(t) {
          return 0 === t ? 7 : t;
        };
        switch (e) {
          case 'i':
          case 'ii':
            return ee(e.length, t);
          case 'io':
            return n.ordinalNumber(t, { unit: 'day' });
          case 'iii':
            return (
              n.day(t, { width: 'abbreviated', context: 'formatting', valueCallback: a }) ||
              n.day(t, { width: 'short', context: 'formatting', valueCallback: a }) ||
              n.day(t, { width: 'narrow', context: 'formatting', valueCallback: a })
            );
          case 'iiiii':
            return n.day(t, { width: 'narrow', context: 'formatting', valueCallback: a });
          case 'iiiiii':
            return (
              n.day(t, { width: 'short', context: 'formatting', valueCallback: a }) || n.day(t, { width: 'narrow', context: 'formatting', valueCallback: a })
            );
          case 'iiii':
          default:
            return (
              n.day(t, { width: 'wide', context: 'formatting', valueCallback: a }) ||
              n.day(t, { width: 'abbreviated', context: 'formatting', valueCallback: a }) ||
              n.day(t, { width: 'short', context: 'formatting', valueCallback: a }) ||
              n.day(t, { width: 'narrow', context: 'formatting', valueCallback: a })
            );
        }
      },
      validate: function(t, e, n) {
        return e >= 1 && e <= 7;
      },
      set: function(r, a, o, i) {
        return (
          (r = (function(r, a) {
            e(2, arguments);
            var o = t(a);
            o % 7 == 0 && (o -= 7);
            var i = 1,
              u = n(r),
              s = u.getUTCDay(),
              c = o % 7,
              d = (c + 7) % 7,
              l = (d < i ? 7 : 0) + o - s;
            return u.setUTCDate(u.getUTCDate() + l), u;
          })(r, o, i)).setUTCHours(0, 0, 0, 0),
          r
        );
      },
      incompatibleTokens: ['y', 'Y', 'u', 'q', 'Q', 'M', 'L', 'w', 'd', 'D', 'E', 'e', 'c', 't', 'T']
    },
    a: {
      priority: 80,
      parse: function(t, e, n, r) {
        switch (e) {
          case 'a':
          case 'aa':
          case 'aaa':
            return n.dayPeriod(t, { width: 'abbreviated', context: 'formatting' }) || n.dayPeriod(t, { width: 'narrow', context: 'formatting' });
          case 'aaaaa':
            return n.dayPeriod(t, { width: 'narrow', context: 'formatting' });
          case 'aaaa':
          default:
            return (
              n.dayPeriod(t, { width: 'wide', context: 'formatting' }) ||
              n.dayPeriod(t, { width: 'abbreviated', context: 'formatting' }) ||
              n.dayPeriod(t, { width: 'narrow', context: 'formatting' })
            );
        }
      },
      set: function(t, e, n, r) {
        return t.setUTCHours(re(n), 0, 0, 0), t;
      },
      incompatibleTokens: ['b', 'B', 'H', 'K', 'k', 't', 'T']
    },
    b: {
      priority: 80,
      parse: function(t, e, n, r) {
        switch (e) {
          case 'b':
          case 'bb':
          case 'bbb':
            return n.dayPeriod(t, { width: 'abbreviated', context: 'formatting' }) || n.dayPeriod(t, { width: 'narrow', context: 'formatting' });
          case 'bbbbb':
            return n.dayPeriod(t, { width: 'narrow', context: 'formatting' });
          case 'bbbb':
          default:
            return (
              n.dayPeriod(t, { width: 'wide', context: 'formatting' }) ||
              n.dayPeriod(t, { width: 'abbreviated', context: 'formatting' }) ||
              n.dayPeriod(t, { width: 'narrow', context: 'formatting' })
            );
        }
      },
      set: function(t, e, n, r) {
        return t.setUTCHours(re(n), 0, 0, 0), t;
      },
      incompatibleTokens: ['a', 'B', 'H', 'K', 'k', 't', 'T']
    },
    B: {
      priority: 80,
      parse: function(t, e, n, r) {
        switch (e) {
          case 'B':
          case 'BB':
          case 'BBB':
            return n.dayPeriod(t, { width: 'abbreviated', context: 'formatting' }) || n.dayPeriod(t, { width: 'narrow', context: 'formatting' });
          case 'BBBBB':
            return n.dayPeriod(t, { width: 'narrow', context: 'formatting' });
          case 'BBBB':
          default:
            return (
              n.dayPeriod(t, { width: 'wide', context: 'formatting' }) ||
              n.dayPeriod(t, { width: 'abbreviated', context: 'formatting' }) ||
              n.dayPeriod(t, { width: 'narrow', context: 'formatting' })
            );
        }
      },
      set: function(t, e, n, r) {
        return t.setUTCHours(re(n), 0, 0, 0), t;
      },
      incompatibleTokens: ['a', 'b', 't', 'T']
    },
    h: {
      priority: 70,
      parse: function(t, e, n, r) {
        switch (e) {
          case 'h':
            return _t(Ht, t);
          case 'ho':
            return n.ordinalNumber(t, { unit: 'hour' });
          default:
            return ee(e.length, t);
        }
      },
      validate: function(t, e, n) {
        return e >= 1 && e <= 12;
      },
      set: function(t, e, n, r) {
        var a = t.getUTCHours() >= 12;
        return a && n < 12 ? t.setUTCHours(n + 12, 0, 0, 0) : a || 12 !== n ? t.setUTCHours(n, 0, 0, 0) : t.setUTCHours(0, 0, 0, 0), t;
      },
      incompatibleTokens: ['H', 'K', 'k', 't', 'T']
    },
    H: {
      priority: 70,
      parse: function(t, e, n, r) {
        switch (e) {
          case 'H':
            return _t(Et, t);
          case 'Ho':
            return n.ordinalNumber(t, { unit: 'hour' });
          default:
            return ee(e.length, t);
        }
      },
      validate: function(t, e, n) {
        return e >= 0 && e <= 23;
      },
      set: function(t, e, n, r) {
        return t.setUTCHours(n, 0, 0, 0), t;
      },
      incompatibleTokens: ['a', 'b', 'h', 'K', 'k', 't', 'T']
    },
    K: {
      priority: 70,
      parse: function(t, e, n, r) {
        switch (e) {
          case 'K':
            return _t(qt, t);
          case 'Ko':
            return n.ordinalNumber(t, { unit: 'hour' });
          default:
            return ee(e.length, t);
        }
      },
      validate: function(t, e, n) {
        return e >= 0 && e <= 11;
      },
      set: function(t, e, n, r) {
        return t.getUTCHours() >= 12 && n < 12 ? t.setUTCHours(n + 12, 0, 0, 0) : t.setUTCHours(n, 0, 0, 0), t;
      },
      incompatibleTokens: ['a', 'b', 'h', 'H', 'k', 't', 'T']
    },
    k: {
      priority: 70,
      parse: function(t, e, n, r) {
        switch (e) {
          case 'k':
            return _t(Nt, t);
          case 'ko':
            return n.ordinalNumber(t, { unit: 'hour' });
          default:
            return ee(e.length, t);
        }
      },
      validate: function(t, e, n) {
        return e >= 1 && e <= 24;
      },
      set: function(t, e, n, r) {
        var a = n <= 24 ? n % 24 : n;
        return t.setUTCHours(a, 0, 0, 0), t;
      },
      incompatibleTokens: ['a', 'b', 'h', 'H', 'K', 't', 'T']
    },
    m: {
      priority: 60,
      parse: function(t, e, n, r) {
        switch (e) {
          case 'm':
            return _t(Wt, t);
          case 'mo':
            return n.ordinalNumber(t, { unit: 'minute' });
          default:
            return ee(e.length, t);
        }
      },
      validate: function(t, e, n) {
        return e >= 0 && e <= 59;
      },
      set: function(t, e, n, r) {
        return t.setUTCMinutes(n, 0, 0), t;
      },
      incompatibleTokens: ['t', 'T']
    },
    s: {
      priority: 50,
      parse: function(t, e, n, r) {
        switch (e) {
          case 's':
            return _t(Xt, t);
          case 'so':
            return n.ordinalNumber(t, { unit: 'second' });
          default:
            return ee(e.length, t);
        }
      },
      validate: function(t, e, n) {
        return e >= 0 && e <= 59;
      },
      set: function(t, e, n, r) {
        return t.setUTCSeconds(n, 0), t;
      },
      incompatibleTokens: ['t', 'T']
    },
    S: {
      priority: 30,
      parse: function(t, e, n, r) {
        return ee(e.length, t, function(t) {
          return Math.floor(t * Math.pow(10, 3 - e.length));
        });
      },
      set: function(t, e, n, r) {
        return t.setUTCMilliseconds(n), t;
      },
      incompatibleTokens: ['t', 'T']
    },
    X: {
      priority: 10,
      parse: function(t, e, n, r) {
        switch (e) {
          case 'X':
            return Vt(At, t);
          case 'XX':
            return Vt(Zt, t);
          case 'XXXX':
            return Vt(Kt, t);
          case 'XXXXX':
            return Vt(Jt, t);
          case 'XXX':
          default:
            return Vt($t, t);
        }
      },
      set: function(t, e, n, r) {
        return e.timestampIsSet ? t : new Date(t.getTime() - n);
      },
      incompatibleTokens: ['t', 'T', 'x']
    },
    x: {
      priority: 10,
      parse: function(t, e, n, r) {
        switch (e) {
          case 'x':
            return Vt(At, t);
          case 'xx':
            return Vt(Zt, t);
          case 'xxxx':
            return Vt(Kt, t);
          case 'xxxxx':
            return Vt(Jt, t);
          case 'xxx':
          default:
            return Vt($t, t);
        }
      },
      set: function(t, e, n, r) {
        return e.timestampIsSet ? t : new Date(t.getTime() - n);
      },
      incompatibleTokens: ['t', 'T', 'X']
    },
    t: {
      priority: 40,
      parse: function(t, e, n, r) {
        return te(t);
      },
      set: function(t, e, n, r) {
        return [new Date(1e3 * n), { timestampIsSet: !0 }];
      },
      incompatibleTokens: '*'
    },
    T: {
      priority: 20,
      parse: function(t, e, n, r) {
        return te(t);
      },
      set: function(t, e, n, r) {
        return [new Date(n), { timestampIsSet: !0 }];
      },
      incompatibleTokens: '*'
    }
  },
  ce = /[yYQqMLwIdDecihHKkms]o|(\w)\1*|''|'(''|[^'])+('|$)|./g,
  de = /P+p+|P+|p+|''|'(''|[^'])+('|$)|./g,
  le = /^'([^]*?)'?$/,
  fe = /''/g,
  me = /\S/,
  he = /[a-zA-Z]/;
function we(r, a, o, i) {
  e(3, arguments);
  var s = String(r),
    c = String(a),
    d = i || {},
    l = d.locale || C;
  if (!l.match) throw new RangeError('locale must contain match property');
  var f = l.options && l.options.firstWeekContainsDate,
    m = null == f ? 1 : t(f),
    h = null == d.firstWeekContainsDate ? m : t(d.firstWeekContainsDate);
  if (!(h >= 1 && h <= 7)) throw new RangeError('firstWeekContainsDate must be between 1 and 7 inclusively');
  var w = l.options && l.options.weekStartsOn,
    g = null == w ? 0 : t(w),
    p = null == d.weekStartsOn ? g : t(d.weekStartsOn);
  if (!(p >= 0 && p <= 6)) throw new RangeError('weekStartsOn must be between 0 and 6 inclusively');
  if ('' === c) return '' === s ? n(o) : new Date(NaN);
  var v,
    b = { firstWeekContainsDate: h, weekStartsOn: p, locale: l },
    y = [{ priority: 10, set: ge, index: 0 }],
    T = c
      .match(de)
      .map(function(t) {
        var e = t[0];
        return 'p' === e || 'P' === e ? (0, nt[e])(t, l.formatLong, b) : t;
      })
      .join('')
      .match(ce),
    k = [];
  for (v = 0; v < T.length; v++) {
    var x = T[v];
    !d.useAdditionalWeekYearTokens && it(x) && ut(x), !d.useAdditionalDayOfYearTokens && ot(x) && ut(x);
    var M = x[0],
      j = se[M];
    if (j) {
      var U = j.incompatibleTokens;
      if (Array.isArray(U)) {
        for (var P = void 0, S = 0; S < k.length; S++) {
          var Y = k[S].token;
          if (-1 !== U.indexOf(Y) || Y === M) {
            P = k[S];
            break;
          }
        }
        if (P) throw new RangeError("The format string mustn't contain `".concat(P.fullToken, '` and `').concat(x, '` at the same time'));
      } else if ('*' === j.incompatibleTokens && k.length)
        throw new RangeError("The format string mustn't contain `".concat(x, '` and any other token at the same time'));
      k.push({ token: M, fullToken: x });
      var E = j.parse(s, x, l.match, b);
      if (!E) return new Date(NaN);
      y.push({ priority: j.priority, set: j.set, validate: j.validate, value: E.value, index: y.length }), (s = E.rest);
    } else {
      if (M.match(he)) throw new RangeError('Format string contains an unescaped latin alphabet character `' + M + '`');
      if (("''" === x ? (x = "'") : "'" === M && (x = pe(x)), 0 !== s.indexOf(x))) return new Date(NaN);
      s = s.slice(x.length);
    }
  }
  if (s.length > 0 && me.test(s)) return new Date(NaN);
  var N = y
      .map(function(t) {
        return t.priority;
      })
      .sort(function(t, e) {
        return e - t;
      })
      .filter(function(t, e, n) {
        return n.indexOf(t) === e;
      })
      .map(function(t) {
        return y
          .filter(function(e) {
            return e.priority === t;
          })
          .reverse();
      })
      .map(function(t) {
        return t[0];
      }),
    q = n(o);
  if (isNaN(q)) return new Date(NaN);
  var H = D(q, u(q)),
    W = {};
  for (v = 0; v < N.length; v++) {
    var X = N[v];
    if (X.validate && !X.validate(H, X.value, b)) return new Date(NaN);
    var O = X.set(H, W, X.value, b);
    O[0] ? ((H = O[0]), wt(W, O[1])) : (H = O);
  }
  return H;
}
function ge(t, e) {
  if (e.timestampIsSet) return t;
  var n = new Date(0);
  return (
    n.setFullYear(t.getUTCFullYear(), t.getUTCMonth(), t.getUTCDate()),
    n.setHours(t.getUTCHours(), t.getUTCMinutes(), t.getUTCSeconds(), t.getUTCMilliseconds()),
    n
  );
}
function pe(t) {
  return t.match(le)[1].replace(fe, "'");
}
var ve = { dateTimeDelimiter: /[T ]/, timeZoneDelimiter: /[Z ]/i, timezone: /([Z+-].*)$/ },
  be = /^-?(?:(\d{3})|(\d{2})(?:-?(\d{2}))?|W(\d{2})(?:-?(\d{1}))?|)$/,
  ye = /^(\d{2}(?:[.,]\d*)?)(?::?(\d{2}(?:[.,]\d*)?))?(?::?(\d{2}(?:[.,]\d*)?))?$/,
  Te = /^([+-])(\d{2})(?::?(\d{2}))?$/;
function ke(n, r) {
  e(1, arguments);
  var a = r || {},
    o = null == a.additionalDigits ? 2 : t(a.additionalDigits);
  if (2 !== o && 1 !== o && 0 !== o) throw new RangeError('additionalDigits must be 0, 1 or 2');
  if ('string' != typeof n && '[object String]' !== Object.prototype.toString.call(n)) return new Date(NaN);
  var i,
    u = xe(n);
  if (u.date) {
    var s = Me(u.date, o);
    i = Ce(s.restDateString, s.year);
  }
  if (isNaN(i) || !i) return new Date(NaN);
  var c,
    d = i.getTime(),
    l = 0;
  if (u.time && ((l = je(u.time)), isNaN(l) || null === l)) return new Date(NaN);
  if (!u.timezone) {
    var f = new Date(d + l),
      m = new Date(f.getUTCFullYear(), f.getUTCMonth(), f.getUTCDate(), f.getUTCHours(), f.getUTCMinutes(), f.getUTCSeconds(), f.getUTCMilliseconds());
    return m.setFullYear(f.getUTCFullYear()), m;
  }
  return (c = Pe(u.timezone)), isNaN(c) ? new Date(NaN) : new Date(d + l + c);
}
function xe(t) {
  var e,
    n = {},
    r = t.split(ve.dateTimeDelimiter);
  if (
    (/:/.test(r[0])
      ? ((n.date = null), (e = r[0]))
      : ((n.date = r[0]),
        (e = r[1]),
        ve.timeZoneDelimiter.test(n.date) && ((n.date = t.split(ve.timeZoneDelimiter)[0]), (e = t.substr(n.date.length, t.length)))),
    e)
  ) {
    var a = ve.timezone.exec(e);
    a ? ((n.time = e.replace(a[1], '')), (n.timezone = a[1])) : (n.time = e);
  }
  return n;
}
function Me(t, e) {
  var n = new RegExp('^(?:(\\d{4}|[+-]\\d{' + (4 + e) + '})|(\\d{2}|[+-]\\d{' + (2 + e) + '})$)'),
    r = t.match(n);
  if (!r) return { year: null };
  var a = r[1] && parseInt(r[1]),
    o = r[2] && parseInt(r[2]);
  return { year: null == o ? a : 100 * o, restDateString: t.slice((r[1] || r[2]).length) };
}
function Ce(t, e) {
  if (null === e) return null;
  var n = t.match(be);
  if (!n) return null;
  var r = !!n[4],
    a = De(n[1]),
    o = De(n[2]) - 1,
    i = De(n[3]),
    u = De(n[4]),
    s = De(n[5]) - 1;
  if (r)
    return (function(t, e, n) {
      return e >= 1 && e <= 53 && n >= 0 && n <= 6;
    })(0, u, s)
      ? (function(t, e, n) {
          var r = new Date(0);
          r.setUTCFullYear(t, 0, 4);
          var a = r.getUTCDay() || 7,
            o = 7 * (e - 1) + n + 1 - a;
          return r.setUTCDate(r.getUTCDate() + o), r;
        })(e, u, s)
      : new Date(NaN);
  var c = new Date(0);
  return (function(t, e, n) {
    return e >= 0 && e <= 11 && n >= 1 && n <= (Se[e] || (Ye(t) ? 29 : 28));
  })(e, o, i) &&
    (function(t, e) {
      return e >= 1 && e <= (Ye(t) ? 366 : 365);
    })(e, a)
    ? (c.setUTCFullYear(e, o, Math.max(a, i)), c)
    : new Date(NaN);
}
function De(t) {
  return t ? parseInt(t) : 1;
}
function je(t) {
  var e = t.match(ye);
  if (!e) return null;
  var n = Ue(e[1]),
    r = Ue(e[2]),
    a = Ue(e[3]);
  return (function(t, e, n) {
    if (24 === t) return 0 === e && 0 === n;
    return n >= 0 && n < 60 && e >= 0 && e < 60 && t >= 0 && t < 25;
  })(n, r, a)
    ? 36e5 * n + 6e4 * r + 1e3 * a
    : NaN;
}
function Ue(t) {
  return (t && parseFloat(t.replace(',', '.'))) || 0;
}
function Pe(t) {
  if ('Z' === t) return 0;
  var e = t.match(Te);
  if (!e) return 0;
  var n = '+' === e[1] ? -1 : 1,
    r = parseInt(e[2]),
    a = (e[3] && parseInt(e[3])) || 0;
  return (function(t, e) {
    return e >= 0 && e <= 59;
  })(0, a)
    ? n * (36e5 * r + 6e4 * a)
    : NaN;
}
var Se = [31, null, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
function Ye(t) {
  return t % 400 == 0 || (t % 4 == 0 && t % 100);
}
function Ee(n, r) {
  e(2, arguments);
  var a = t(r);
  return o(n, -a);
}
function Ne(n, r) {
  e(2, arguments);
  var a = t(r);
  return c(n, -a);
}
function qe(n, r) {
  e(2, arguments);
  var a = t(r);
  return d(n, -a);
}
var He = {
    lessThanXSeconds: {
      one: 'manj kot {{count}} sekunda',
      two: 'manj kot {{count}} sekundi',
      few: 'manj kot {{count}} sekunde',
      other: 'manj kot {{count}} sekund'
    },
    xSeconds: { one: '{{count}} sekunda', two: '{{count}} sekundi', few: '{{count}} sekunde', other: '{{count}} sekund' },
    halfAMinute: 'pol minute',
    lessThanXMinutes: {
      one: 'manj kot {{count}} minuta',
      two: 'manj kot {{count}} minuti',
      few: 'manj kot {{count}} minute',
      other: 'manj kot {{count}} minut'
    },
    xMinutes: { one: '{{count}} minuta', two: '{{count}} minuti', few: '{{count}} minute', other: '{{count}} minut' },
    aboutXHours: { one: 'približno {{count}} ura', two: 'približno {{count}} uri', few: 'približno {{count}} ure', other: 'približno {{count}} ur' },
    xHours: { one: '{{count}} ura', two: '{{count}} uri', few: '{{count}} ure', other: '{{count}} ur' },
    xDays: { one: '{{count}} dan', two: '{{count}} dni', few: '{{count}} dni', other: '{{count}} dni' },
    aboutXMonths: {
      one: 'približno {{count}} mesec',
      two: 'približno {{count}} meseca',
      few: 'približno {{count}} mesece',
      other: 'približno {{count}} mesecev'
    },
    xMonths: { one: '{{count}} mesec', two: '{{count}} meseca', few: '{{count}} meseci', other: '{{count}} mesecev' },
    aboutXYears: { one: 'približno {{count}} leto', two: 'približno {{count}} leti', few: 'približno {{count}} leta', other: 'približno {{count}} let' },
    xYears: { one: '{{count}} leto', two: '{{count}} leti', few: '{{count}} leta', other: '{{count}} let' },
    overXYears: { one: 'več kot {{count}} leto', two: 'več kot {{count}} leti', few: 'več kot {{count}} leta', other: 'več kot {{count}} let' },
    almostXYears: { one: 'skoraj {{count}} leto', two: 'skoraj {{count}} leti', few: 'skoraj {{count}} leta', other: 'skoraj {{count}} let' }
  },
  We = {
    lessThanXSeconds: {
      one: 'manj kot {{count}} sekundo',
      two: 'manj kot {{count}} sekundama',
      few: 'manj kot {{count}} sekundami',
      other: 'manj kot {{count}} sekundami'
    },
    xSeconds: { one: '{{count}} sekundo', two: '{{count}} sekundama', few: '{{count}} sekundami', other: '{{count}} sekundami' },
    halfAMinute: 'pol minute',
    lessThanXMinutes: {
      one: 'manj kot {{count}} minuto',
      two: 'manj kot {{count}} minutama',
      few: 'manj kot {{count}} minutami',
      other: 'manj kot {{count}} minutami'
    },
    xMinutes: { one: '{{count}} minuto', two: '{{count}} minutama', few: '{{count}} minutami', other: '{{count}} minutami' },
    aboutXHours: { one: 'približno {{count}} uro', two: 'približno {{count}} urama', few: 'približno {{count}} urami', other: 'približno {{count}} urami' },
    xHours: { one: '{{count}} uro', two: '{{count}} urama', few: '{{count}} urami', other: '{{count}} urami' },
    xDays: { one: '{{count}} dnem', two: '{{count}} dnevoma', few: '{{count}} dnevi', other: '{{count}} dnevi' },
    aboutXMonths: {
      one: 'približno {{count}} mesecem',
      two: 'približno {{count}} mesecema',
      few: 'približno {{count}} meseci',
      other: 'približno {{count}} meseci'
    },
    xMonths: { one: '{{count}} mesecem', two: '{{count}} mesecema', few: '{{count}} meseci', other: '{{count}} meseci' },
    aboutXYears: { one: 'približno {{count}} letom', two: 'približno {{count}} letoma', few: 'približno {{count}} leti', other: 'približno {{count}} leti' },
    xYears: { one: '{{count}} letom', two: '{{count}} letoma', few: '{{count}} leti', other: '{{count}} leti' },
    overXYears: { one: 'več kot {{count}} letom', two: 'več kot {{count}} letoma', few: 'več kot {{count}} leti', other: 'več kot {{count}} leti' },
    almostXYears: { one: 'skoraj {{count}} letom', two: 'skoraj {{count}} letoma', few: 'skoraj {{count}} leti', other: 'skoraj {{count}} leti' }
  },
  Xe = {
    lessThanXSeconds: {
      one: 'manj kot {{count}} sekundo',
      two: 'manj kot {{count}} sekundi',
      few: 'manj kot {{count}} sekunde',
      other: 'manj kot {{count}} sekund'
    },
    xSeconds: { one: '{{count}} sekundo', two: '{{count}} sekundi', few: '{{count}} sekunde', other: '{{count}} sekund' },
    halfAMinute: 'pol minute',
    lessThanXMinutes: {
      one: 'manj kot {{count}} minuto',
      two: 'manj kot {{count}} minuti',
      few: 'manj kot {{count}} minute',
      other: 'manj kot {{count}} minut'
    },
    xMinutes: { one: '{{count}} minuto', two: '{{count}} minuti', few: '{{count}} minute', other: '{{count}} minut' },
    aboutXHours: { one: 'približno {{count}} uro', two: 'približno {{count}} uri', few: 'približno {{count}} ure', other: 'približno {{count}} ur' },
    xHours: { one: '{{count}} uro', two: '{{count}} uri', few: '{{count}} ure', other: '{{count}} ur' },
    xDays: { one: '{{count}} dan', two: '{{count}} dni', few: '{{count}} dni', other: '{{count}} dni' },
    aboutXMonths: {
      one: 'približno {{count}} mesec',
      two: 'približno {{count}} meseca',
      few: 'približno {{count}} mesece',
      other: 'približno {{count}} mesecev'
    },
    xMonths: { one: '{{count}} mesec', two: '{{count}} meseca', few: '{{count}} mesece', other: '{{count}} mesecev' },
    aboutXYears: { one: 'približno {{count}} leto', two: 'približno {{count}} leti', few: 'približno {{count}} leta', other: 'približno {{count}} let' },
    xYears: { one: '{{count}} leto', two: '{{count}} leti', few: '{{count}} leta', other: '{{count}} let' },
    overXYears: { one: 'več kot {{count}} leto', two: 'več kot {{count}} leti', few: 'več kot {{count}} leta', other: 'več kot {{count}} let' },
    almostXYears: { one: 'skoraj {{count}} leto', two: 'skoraj {{count}} leti', few: 'skoraj {{count}} leta', other: 'skoraj {{count}} let' }
  };
var Oe = {
    date: b({ formats: { full: 'EEEE, dd. MMMM y', long: 'dd. MMMM y', medium: 'd. MMM y', short: 'd. MM. yy' }, defaultWidth: 'full' }),
    time: b({ formats: { full: 'HH:mm:ss zzzz', long: 'HH:mm:ss z', medium: 'HH:mm:ss', short: 'HH:mm' }, defaultWidth: 'full' }),
    dateTime: b({
      formats: { full: '{{date}} {{time}}', long: '{{date}} {{time}}', medium: '{{date}} {{time}}', short: '{{date}} {{time}}' },
      defaultWidth: 'full'
    })
  },
  ze = {
    lastWeek: function(t) {
      switch (t.getUTCDay()) {
        case 0:
          return "'prejšnjo nedeljo ob' p";
        case 3:
          return "'prejšnjo sredo ob' p";
        case 6:
          return "'prejšnjo soboto ob' p";
        default:
          return "'prejšnji' EEEE 'ob' p";
      }
    },
    yesterday: "'včeraj ob' p",
    today: "'danes ob' p",
    tomorrow: "'jutri ob' p",
    nextWeek: function(t) {
      switch (t.getUTCDay()) {
        case 0:
          return "'naslednjo nedeljo ob' p";
        case 3:
          return "'naslednjo sredo ob' p";
        case 6:
          return "'naslednjo soboto ob' p";
        default:
          return "'naslednji' EEEE 'ob' p";
      }
    },
    other: 'P'
  };
var Le = {
  code: 'sl',
  formatDistance: function(t, e, n) {
    var r = He,
      a = '';
    if (((n = n || {}).addSuffix && (n.comparison > 0 ? ((r = Xe), (a += 'čez ')) : ((r = We), (a += 'pred '))), 'string' == typeof r[t])) a += r[t];
    else {
      var o = (function(t) {
        switch (t % 100) {
          case 1:
            return 'one';
          case 2:
            return 'two';
          case 3:
          case 4:
            return 'few';
          default:
            return 'other';
        }
      })(e);
      a += r[t][o].replace('{{count}}', e);
    }
    return a;
  },
  formatLong: Oe,
  formatRelative: function(t, e, n, r) {
    var a = ze[t];
    return 'function' == typeof a ? a(e) : a;
  },
  localize: {
    ordinalNumber: function(t) {
      var e = Number(t);
      return String(e).concat('.');
    },
    era: k({
      values: { narrow: ['pr. n. št.', 'po n. št.'], abbreviated: ['pr. n. št.', 'po n. št.'], wide: ['pred našim štetjem', 'po našem štetju'] },
      defaultWidth: 'wide'
    }),
    quarter: k({
      values: {
        narrow: ['1', '2', '3', '4'],
        abbreviated: ['1. čet.', '2. čet.', '3. čet.', '4. čet.'],
        wide: ['1. četrtletje', '2. četrtletje', '3. četrtletje', '4. četrtletje']
      },
      defaultWidth: 'wide',
      argumentCallback: function(t) {
        return Number(t) - 1;
      }
    }),
    month: k({
      values: {
        narrow: ['j', 'f', 'm', 'a', 'm', 'j', 'j', 'a', 's', 'o', 'n', 'd'],
        abbreviated: ['jan.', 'feb.', 'mar.', 'apr.', 'maj', 'jun.', 'jul.', 'avg.', 'sep.', 'okt.', 'nov.', 'dec.'],
        wide: ['januar', 'februar', 'marec', 'april', 'maj', 'junij', 'julij', 'avgust', 'september', 'oktober', 'november', 'december']
      },
      defaultWidth: 'wide'
    }),
    day: k({
      values: {
        narrow: ['n', 'p', 't', 's', 'č', 'p', 's'],
        short: ['ned.', 'pon.', 'tor.', 'sre.', 'čet.', 'pet.', 'sob.'],
        abbreviated: ['ned.', 'pon.', 'tor.', 'sre.', 'čet.', 'pet.', 'sob.'],
        wide: ['nedelja', 'ponedeljek', 'torek', 'sreda', 'četrtek', 'petek', 'sobota']
      },
      defaultWidth: 'wide'
    }),
    dayPeriod: k({
      values: {
        narrow: { am: 'd', pm: 'p', midnight: '24.00', noon: '12.00', morning: 'j', afternoon: 'p', evening: 'v', night: 'n' },
        abbreviated: { am: 'dop.', pm: 'pop.', midnight: 'poln.', noon: 'pold.', morning: 'jut.', afternoon: 'pop.', evening: 'več.', night: 'noč' },
        wide: { am: 'dop.', pm: 'pop.', midnight: 'polnoč', noon: 'poldne', morning: 'jutro', afternoon: 'popoldne', evening: 'večer', night: 'noč' }
      },
      defaultWidth: 'wide',
      formattingValues: {
        narrow: { am: 'd', pm: 'p', midnight: '24.00', noon: '12.00', morning: 'zj', afternoon: 'p', evening: 'zv', night: 'po' },
        abbreviated: { am: 'dop.', pm: 'pop.', midnight: 'opoln.', noon: 'opold.', morning: 'zjut.', afternoon: 'pop.', evening: 'zveč.', night: 'ponoči' },
        wide: { am: 'dop.', pm: 'pop.', midnight: 'opolnoči', noon: 'opoldne', morning: 'zjutraj', afternoon: 'popoldan', evening: 'zvečer', night: 'ponoči' }
      },
      defaultFormattingWidth: 'wide'
    })
  },
  match: {
    ordinalNumber: x({
      matchPattern: /^(\d+)\./i,
      parsePattern: /\d+/i,
      valueCallback: function(t) {
        return parseInt(t, 10);
      }
    }),
    era: M({
      matchPatterns: {
        abbreviated: /^(pr\. n\. št\.|po n\. št\.)/i,
        wide: /^(pred Kristusom|pred na[sš]im [sš]tetjem|po Kristusu|po na[sš]em [sš]tetju|na[sš]ega [sš]tetja)/i
      },
      defaultMatchWidth: 'wide',
      parsePatterns: { any: [/^pr/i, /^(po|na[sš]em)/i] },
      defaultParseWidth: 'any'
    }),
    quarter: M({
      matchPatterns: { narrow: /^[1234]/i, abbreviated: /^[1234]\.\s?[čc]et\.?/i, wide: /^[1234]\. [čc]etrtletje/i },
      defaultMatchWidth: 'wide',
      parsePatterns: { any: [/1/i, /2/i, /3/i, /4/i] },
      defaultParseWidth: 'any',
      valueCallback: function(t) {
        return t + 1;
      }
    }),
    month: M({
      matchPatterns: {
        narrow: /^[jfmasond]/i,
        abbreviated: /^(jan\.|feb\.|mar\.|apr\.|maj|jun\.|jul\.|avg\.|sep\.|okt\.|nov\.|dec\.)/i,
        wide: /^(januar|februar|marec|april|maj|junij|julij|avgust|september|oktober|november|december)/i
      },
      defaultMatchWidth: 'wide',
      parsePatterns: {
        narrow: [/^j/i, /^f/i, /^m/i, /^a/i, /^m/i, /^j/i, /^j/i, /^a/i, /^s/i, /^o/i, /^n/i, /^d/i],
        abbreviated: [/^ja/i, /^fe/i, /^mar/i, /^ap/i, /^maj/i, /^jun/i, /^jul/i, /^av/i, /^s/i, /^o/i, /^n/i, /^d/i],
        wide: [/^ja/i, /^fe/i, /^mar/i, /^ap/i, /^maj/i, /^jun/i, /^jul/i, /^av/i, /^s/i, /^o/i, /^n/i, /^d/i]
      },
      defaultParseWidth: 'wide'
    }),
    day: M({
      matchPatterns: {
        narrow: /^[nptsčc]/i,
        short: /^(ned\.|pon\.|tor\.|sre\.|[cč]et\.|pet\.|sob\.)/i,
        abbreviated: /^(ned\.|pon\.|tor\.|sre\.|[cč]et\.|pet\.|sob\.)/i,
        wide: /^(nedelja|ponedeljek|torek|sreda|[cč]etrtek|petek|sobota)/i
      },
      defaultMatchWidth: 'wide',
      parsePatterns: { narrow: [/^n/i, /^p/i, /^t/i, /^s/i, /^[cč]/i, /^p/i, /^s/i], any: [/^n/i, /^po/i, /^t/i, /^sr/i, /^[cč]/i, /^pe/i, /^so/i] },
      defaultParseWidth: 'any'
    }),
    dayPeriod: M({
      matchPatterns: {
        narrow: /^(d|po?|z?v|n|z?j|24\.00|12\.00)/i,
        any: /^(dop\.|pop\.|o?poln(\.|o[cč]i?)|o?pold(\.|ne)|z?ve[cč](\.|er)|(po)?no[cč]i?|popold(ne|an)|jut(\.|ro)|zjut(\.|raj))/i
      },
      defaultMatchWidth: 'any',
      parsePatterns: {
        narrow: { am: /^d/i, pm: /^p/i, midnight: /^24/i, noon: /^12/i, morning: /^(z?j)/i, afternoon: /^p/i, evening: /^(z?v)/i, night: /^(n|po)/i },
        any: { am: /^dop\./i, pm: /^pop\./i, midnight: /^o?poln/i, noon: /^o?pold/i, morning: /j/i, afternoon: /^pop\./i, evening: /^z?ve/i, night: /(po)?no/i }
      },
      defaultParseWidth: 'any'
    })
  },
  options: { weekStartsOn: 1, firstWeekContainsDate: 1 }
};
export {
  r as addDays,
  o as addHours,
  c as addMinutes,
  d as addSeconds,
  mt as format,
  pt as formatDistance,
  bt as formatDistanceToNow,
  yt as formatDistanceToNowStrict,
  Tt as formatISO,
  kt as isAfter,
  xt as isBefore,
  Mt as isToday,
  Ct as isTomorrow,
  we as parse,
  ke as parseISO,
  Le as sl_locale,
  Dt as subDays,
  Ee as subHours,
  Ne as subMinutes,
  qe as subSeconds
};
