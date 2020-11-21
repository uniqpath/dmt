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
  var i = n(r).getTime(),
    o = t(a);
  return new Date(i + o);
}
function a(n, a) {
  e(2, arguments);
  var i = t(a);
  return r(n, 36e5 * i);
}
function i(t) {
  return t.getTime() % 6e4;
}
function o(t) {
  var e = new Date(t.getTime()),
    n = Math.ceil(e.getTimezoneOffset());
  return e.setSeconds(0, 0), 6e4 * n + (n > 0 ? (6e4 + i(e)) % 6e4 : i(e));
}
function u(n, a) {
  e(2, arguments);
  var i = t(a);
  return r(n, 6e4 * i);
}
function s(t, r) {
  e(2, arguments);
  var a = n(t),
    i = n(r),
    o = a.getTime() - i.getTime();
  return o < 0 ? -1 : o > 0 ? 1 : o;
}
function c(t) {
  e(1, arguments);
  var r = n(t);
  return !isNaN(r);
}
function d(t, r) {
  e(2, arguments);
  var a = n(t),
    i = n(r),
    o = a.getFullYear() - i.getFullYear(),
    u = a.getMonth() - i.getMonth();
  return 12 * o + u;
}
function l(t, r) {
  e(2, arguments);
  var a = n(t),
    i = n(r);
  return a.getTime() - i.getTime();
}
function f(t, r) {
  e(2, arguments);
  var a = n(t),
    i = n(r),
    o = s(a, i),
    u = Math.abs(d(a, i));
  a.setMonth(a.getMonth() - o * u);
  var c = s(a, i) === -o,
    l = o * (u - c);
  return 0 === l ? 0 : l;
}
function h(t, n) {
  e(2, arguments);
  var r = l(t, n) / 1e3;
  return r > 0 ? Math.floor(r) : Math.ceil(r);
}
var m = {
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
function w(t) {
  return function(e) {
    var n = e || {},
      r = n.width ? String(n.width) : t.defaultWidth;
    return t.formats[r] || t.formats[t.defaultWidth];
  };
}
var g = {
    date: w({ formats: { full: 'EEEE, MMMM do, y', long: 'MMMM do, y', medium: 'MMM d, y', short: 'MM/dd/yyyy' }, defaultWidth: 'full' }),
    time: w({ formats: { full: 'h:mm:ss a zzzz', long: 'h:mm:ss a z', medium: 'h:mm:ss a', short: 'h:mm a' }, defaultWidth: 'full' }),
    dateTime: w({
      formats: { full: "{{date}} 'at' {{time}}", long: "{{date}} 'at' {{time}}", medium: '{{date}}, {{time}}', short: '{{date}}, {{time}}' },
      defaultWidth: 'full'
    })
  },
  v = {
    lastWeek: "'last' eeee 'at' p",
    yesterday: "'yesterday at' p",
    today: "'today at' p",
    tomorrow: "'tomorrow at' p",
    nextWeek: "eeee 'at' p",
    other: 'P'
  };
function b(t) {
  return function(e, n) {
    var r,
      a = n || {};
    if ('formatting' === (a.context ? String(a.context) : 'standalone') && t.formattingValues) {
      var i = t.defaultFormattingWidth || t.defaultWidth,
        o = a.width ? String(a.width) : i;
      r = t.formattingValues[o] || t.formattingValues[i];
    } else {
      var u = t.defaultWidth,
        s = a.width ? String(a.width) : t.defaultWidth;
      r = t.values[s] || t.values[u];
    }
    return r[t.argumentCallback ? t.argumentCallback(e) : e];
  };
}
function y(t) {
  return function(e, n) {
    var r = String(e),
      a = n || {},
      i = a.width,
      o = (i && t.matchPatterns[i]) || t.matchPatterns[t.defaultMatchWidth],
      u = r.match(o);
    if (!u) return null;
    var s,
      c = u[0],
      d = (i && t.parsePatterns[i]) || t.parsePatterns[t.defaultParseWidth];
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
var T,
  p = {
    code: 'en-US',
    formatDistance: function(t, e, n) {
      var r;
      return (
        (n = n || {}),
        (r = 'string' == typeof m[t] ? m[t] : 1 === e ? m[t].one : m[t].other.replace('{{count}}', e)),
        n.addSuffix ? (n.comparison > 0 ? 'in ' + r : r + ' ago') : r
      );
    },
    formatLong: g,
    formatRelative: function(t, e, n, r) {
      return v[t];
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
      era: b({ values: { narrow: ['B', 'A'], abbreviated: ['BC', 'AD'], wide: ['Before Christ', 'Anno Domini'] }, defaultWidth: 'wide' }),
      quarter: b({
        values: { narrow: ['1', '2', '3', '4'], abbreviated: ['Q1', 'Q2', 'Q3', 'Q4'], wide: ['1st quarter', '2nd quarter', '3rd quarter', '4th quarter'] },
        defaultWidth: 'wide',
        argumentCallback: function(t) {
          return Number(t) - 1;
        }
      }),
      month: b({
        values: {
          narrow: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
          abbreviated: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          wide: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
        },
        defaultWidth: 'wide'
      }),
      day: b({
        values: {
          narrow: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
          short: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
          abbreviated: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
          wide: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        },
        defaultWidth: 'wide'
      }),
      dayPeriod: b({
        values: {
          narrow: { am: 'a', pm: 'p', midnight: 'mi', noon: 'n', morning: 'morning', afternoon: 'afternoon', evening: 'evening', night: 'night' },
          abbreviated: {
            am: 'AM',
            pm: 'PM',
            midnight: 'midnight',
            noon: 'noon',
            morning: 'morning',
            afternoon: 'afternoon',
            evening: 'evening',
            night: 'night'
          },
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
      ordinalNumber:
        ((T = {
          matchPattern: /^(\d+)(th|st|nd|rd)?/i,
          parsePattern: /\d+/i,
          valueCallback: function(t) {
            return parseInt(t, 10);
          }
        }),
        function(t, e) {
          var n = String(t),
            r = e || {},
            a = n.match(T.matchPattern);
          if (!a) return null;
          var i = a[0],
            o = n.match(T.parsePattern);
          if (!o) return null;
          var u = T.valueCallback ? T.valueCallback(o[0]) : o[0];
          return { value: (u = r.valueCallback ? r.valueCallback(u) : u), rest: n.slice(i.length) };
        }),
      era: y({
        matchPatterns: {
          narrow: /^(b|a)/i,
          abbreviated: /^(b\.?\s?c\.?|b\.?\s?c\.?\s?e\.?|a\.?\s?d\.?|c\.?\s?e\.?)/i,
          wide: /^(before christ|before common era|anno domini|common era)/i
        },
        defaultMatchWidth: 'wide',
        parsePatterns: { any: [/^b/i, /^(a|c)/i] },
        defaultParseWidth: 'any'
      }),
      quarter: y({
        matchPatterns: { narrow: /^[1234]/i, abbreviated: /^q[1234]/i, wide: /^[1234](th|st|nd|rd)? quarter/i },
        defaultMatchWidth: 'wide',
        parsePatterns: { any: [/1/i, /2/i, /3/i, /4/i] },
        defaultParseWidth: 'any',
        valueCallback: function(t) {
          return t + 1;
        }
      }),
      month: y({
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
      day: y({
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
      dayPeriod: y({
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
function x(n, a) {
  e(2, arguments);
  var i = t(a);
  return r(n, -i);
}
function C(t, e) {
  for (var n = t < 0 ? '-' : '', r = Math.abs(t).toString(); r.length < e; ) r = '0' + r;
  return n + r;
}
var D = function(t, e) {
    var n = t.getUTCFullYear(),
      r = n > 0 ? n : 1 - n;
    return C('yy' === e ? r % 100 : r, e.length);
  },
  M = function(t, e) {
    var n = t.getUTCMonth();
    return 'M' === e ? String(n + 1) : C(n + 1, 2);
  },
  k = function(t, e) {
    return C(t.getUTCDate(), e.length);
  },
  U = function(t, e) {
    return C(t.getUTCHours() % 12 || 12, e.length);
  },
  N = function(t, e) {
    return C(t.getUTCHours(), e.length);
  },
  Y = function(t, e) {
    return C(t.getUTCMinutes(), e.length);
  },
  P = function(t, e) {
    return C(t.getUTCSeconds(), e.length);
  },
  S = function(t, e) {
    var n = e.length,
      r = t.getUTCMilliseconds();
    return C(Math.floor(r * Math.pow(10, n - 3)), e.length);
  };
function q(t) {
  e(1, arguments);
  var r = 1,
    a = n(t),
    i = a.getUTCDay(),
    o = (i < r ? 7 : 0) + i - r;
  return a.setUTCDate(a.getUTCDate() - o), a.setUTCHours(0, 0, 0, 0), a;
}
function E(t) {
  e(1, arguments);
  var r = n(t),
    a = r.getUTCFullYear(),
    i = new Date(0);
  i.setUTCFullYear(a + 1, 0, 4), i.setUTCHours(0, 0, 0, 0);
  var o = q(i),
    u = new Date(0);
  u.setUTCFullYear(a, 0, 4), u.setUTCHours(0, 0, 0, 0);
  var s = q(u);
  return r.getTime() >= o.getTime() ? a + 1 : r.getTime() >= s.getTime() ? a : a - 1;
}
function H(t) {
  e(1, arguments);
  var n = E(t),
    r = new Date(0);
  r.setUTCFullYear(n, 0, 4), r.setUTCHours(0, 0, 0, 0);
  var a = q(r);
  return a;
}
function O(t) {
  e(1, arguments);
  var r = n(t),
    a = q(r).getTime() - H(r).getTime();
  return Math.round(a / 6048e5) + 1;
}
function W(r, a) {
  e(1, arguments);
  var i = a || {},
    o = i.locale,
    u = o && o.options && o.options.weekStartsOn,
    s = null == u ? 0 : t(u),
    c = null == i.weekStartsOn ? s : t(i.weekStartsOn);
  if (!(c >= 0 && c <= 6)) throw new RangeError('weekStartsOn must be between 0 and 6 inclusively');
  var d = n(r),
    l = d.getUTCDay(),
    f = (l < c ? 7 : 0) + l - c;
  return d.setUTCDate(d.getUTCDate() - f), d.setUTCHours(0, 0, 0, 0), d;
}
function L(r, a) {
  e(1, arguments);
  var i = n(r, a),
    o = i.getUTCFullYear(),
    u = a || {},
    s = u.locale,
    c = s && s.options && s.options.firstWeekContainsDate,
    d = null == c ? 1 : t(c),
    l = null == u.firstWeekContainsDate ? d : t(u.firstWeekContainsDate);
  if (!(l >= 1 && l <= 7)) throw new RangeError('firstWeekContainsDate must be between 1 and 7 inclusively');
  var f = new Date(0);
  f.setUTCFullYear(o + 1, 0, l), f.setUTCHours(0, 0, 0, 0);
  var h = W(f, a),
    m = new Date(0);
  m.setUTCFullYear(o, 0, l), m.setUTCHours(0, 0, 0, 0);
  var w = W(m, a);
  return i.getTime() >= h.getTime() ? o + 1 : i.getTime() >= w.getTime() ? o : o - 1;
}
function Q(n, r) {
  e(1, arguments);
  var a = r || {},
    i = a.locale,
    o = i && i.options && i.options.firstWeekContainsDate,
    u = null == o ? 1 : t(o),
    s = null == a.firstWeekContainsDate ? u : t(a.firstWeekContainsDate),
    c = L(n, r),
    d = new Date(0);
  d.setUTCFullYear(c, 0, s), d.setUTCHours(0, 0, 0, 0);
  var l = W(d, r);
  return l;
}
function X(t, r) {
  e(1, arguments);
  var a = n(t),
    i = W(a, r).getTime() - Q(a, r).getTime();
  return Math.round(i / 6048e5) + 1;
}
var F = 'midnight',
  R = 'noon',
  B = 'morning',
  G = 'afternoon',
  I = 'evening',
  z = 'night',
  j = {
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
      return D(t, e);
    },
    Y: function(t, e, n, r) {
      var a = L(t, r),
        i = a > 0 ? a : 1 - a;
      return 'YY' === e ? C(i % 100, 2) : 'Yo' === e ? n.ordinalNumber(i, { unit: 'year' }) : C(i, e.length);
    },
    R: function(t, e) {
      return C(E(t), e.length);
    },
    u: function(t, e) {
      return C(t.getUTCFullYear(), e.length);
    },
    Q: function(t, e, n) {
      var r = Math.ceil((t.getUTCMonth() + 1) / 3);
      switch (e) {
        case 'Q':
          return String(r);
        case 'QQ':
          return C(r, 2);
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
          return C(r, 2);
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
          return M(t, e);
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
          return C(r + 1, 2);
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
      var a = X(t, r);
      return 'wo' === e ? n.ordinalNumber(a, { unit: 'week' }) : C(a, e.length);
    },
    I: function(t, e, n) {
      var r = O(t);
      return 'Io' === e ? n.ordinalNumber(r, { unit: 'week' }) : C(r, e.length);
    },
    d: function(t, e, n) {
      return 'do' === e ? n.ordinalNumber(t.getUTCDate(), { unit: 'date' }) : k(t, e);
    },
    D: function(t, r, a) {
      var i = (function(t) {
        e(1, arguments);
        var r = n(t),
          a = r.getTime();
        r.setUTCMonth(0, 1), r.setUTCHours(0, 0, 0, 0);
        var i = r.getTime(),
          o = a - i;
        return Math.floor(o / 864e5) + 1;
      })(t);
      return 'Do' === r ? a.ordinalNumber(i, { unit: 'dayOfYear' }) : C(i, r.length);
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
        i = (a - r.weekStartsOn + 8) % 7 || 7;
      switch (e) {
        case 'e':
          return String(i);
        case 'ee':
          return C(i, 2);
        case 'eo':
          return n.ordinalNumber(i, { unit: 'day' });
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
        i = (a - r.weekStartsOn + 8) % 7 || 7;
      switch (e) {
        case 'c':
          return String(i);
        case 'cc':
          return C(i, e.length);
        case 'co':
          return n.ordinalNumber(i, { unit: 'day' });
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
          return C(a, e.length);
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
      switch (((r = 12 === a ? R : 0 === a ? F : a / 12 >= 1 ? 'pm' : 'am'), e)) {
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
      switch (((r = a >= 17 ? I : a >= 12 ? G : a >= 4 ? B : z), e)) {
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
      return U(t, e);
    },
    H: function(t, e, n) {
      return 'Ho' === e ? n.ordinalNumber(t.getUTCHours(), { unit: 'hour' }) : N(t, e);
    },
    K: function(t, e, n) {
      var r = t.getUTCHours() % 12;
      return 'Ko' === e ? n.ordinalNumber(r, { unit: 'hour' }) : C(r, e.length);
    },
    k: function(t, e, n) {
      var r = t.getUTCHours();
      return 0 === r && (r = 24), 'ko' === e ? n.ordinalNumber(r, { unit: 'hour' }) : C(r, e.length);
    },
    m: function(t, e, n) {
      return 'mo' === e ? n.ordinalNumber(t.getUTCMinutes(), { unit: 'minute' }) : Y(t, e);
    },
    s: function(t, e, n) {
      return 'so' === e ? n.ordinalNumber(t.getUTCSeconds(), { unit: 'second' }) : P(t, e);
    },
    S: function(t, e) {
      return S(t, e);
    },
    X: function(t, e, n, r) {
      var a = (r._originalDate || t).getTimezoneOffset();
      if (0 === a) return 'Z';
      switch (e) {
        case 'X':
          return Z(a);
        case 'XXXX':
        case 'XX':
          return K(a);
        case 'XXXXX':
        case 'XXX':
        default:
          return K(a, ':');
      }
    },
    x: function(t, e, n, r) {
      var a = (r._originalDate || t).getTimezoneOffset();
      switch (e) {
        case 'x':
          return Z(a);
        case 'xxxx':
        case 'xx':
          return K(a);
        case 'xxxxx':
        case 'xxx':
        default:
          return K(a, ':');
      }
    },
    O: function(t, e, n, r) {
      var a = (r._originalDate || t).getTimezoneOffset();
      switch (e) {
        case 'O':
        case 'OO':
        case 'OOO':
          return 'GMT' + A(a, ':');
        case 'OOOO':
        default:
          return 'GMT' + K(a, ':');
      }
    },
    z: function(t, e, n, r) {
      var a = (r._originalDate || t).getTimezoneOffset();
      switch (e) {
        case 'z':
        case 'zz':
        case 'zzz':
          return 'GMT' + A(a, ':');
        case 'zzzz':
        default:
          return 'GMT' + K(a, ':');
      }
    },
    t: function(t, e, n, r) {
      var a = r._originalDate || t;
      return C(Math.floor(a.getTime() / 1e3), e.length);
    },
    T: function(t, e, n, r) {
      return C((r._originalDate || t).getTime(), e.length);
    }
  };
function A(t, e) {
  var n = t > 0 ? '-' : '+',
    r = Math.abs(t),
    a = Math.floor(r / 60),
    i = r % 60;
  if (0 === i) return n + String(a);
  var o = e || '';
  return n + String(a) + o + C(i, 2);
}
function Z(t, e) {
  return t % 60 == 0 ? (t > 0 ? '-' : '+') + C(Math.abs(t) / 60, 2) : K(t, e);
}
function K(t, e) {
  var n = e || '',
    r = t > 0 ? '-' : '+',
    a = Math.abs(t);
  return r + C(Math.floor(a / 60), 2) + n + C(a % 60, 2);
}
function $(t, e) {
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
function J(t, e) {
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
var _ = {
    p: J,
    P: function(t, e) {
      var n,
        r = t.match(/(P+)(p+)?/),
        a = r[1],
        i = r[2];
      if (!i) return $(t, e);
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
      return n.replace('{{date}}', $(a, e)).replace('{{time}}', J(i, e));
    }
  },
  V = ['D', 'DD'],
  tt = ['YY', 'YYYY'];
function et(t) {
  return -1 !== V.indexOf(t);
}
function nt(t) {
  return -1 !== tt.indexOf(t);
}
function rt(t) {
  if ('YYYY' === t) throw new RangeError('Use `yyyy` instead of `YYYY` for formatting years; see: https://git.io/fxCyr');
  if ('YY' === t) throw new RangeError('Use `yy` instead of `YY` for formatting years; see: https://git.io/fxCyr');
  if ('D' === t) throw new RangeError('Use `d` instead of `D` for formatting days of the month; see: https://git.io/fxCyr');
  if ('DD' === t) throw new RangeError('Use `dd` instead of `DD` for formatting days of the month; see: https://git.io/fxCyr');
}
var at = /[yYQqMLwIdDecihHKkms]o|(\w)\1*|''|'(''|[^'])+('|$)|./g,
  it = /P+p+|P+|p+|''|'(''|[^'])+('|$)|./g,
  ot = /^'([^]*?)'?$/,
  ut = /''/g,
  st = /[a-zA-Z]/;
function ct(r, a, i) {
  e(2, arguments);
  var u = String(a),
    s = i || {},
    d = s.locale || p,
    l = d.options && d.options.firstWeekContainsDate,
    f = null == l ? 1 : t(l),
    h = null == s.firstWeekContainsDate ? f : t(s.firstWeekContainsDate);
  if (!(h >= 1 && h <= 7)) throw new RangeError('firstWeekContainsDate must be between 1 and 7 inclusively');
  var m = d.options && d.options.weekStartsOn,
    w = null == m ? 0 : t(m),
    g = null == s.weekStartsOn ? w : t(s.weekStartsOn);
  if (!(g >= 0 && g <= 6)) throw new RangeError('weekStartsOn must be between 0 and 6 inclusively');
  if (!d.localize) throw new RangeError('locale must contain localize property');
  if (!d.formatLong) throw new RangeError('locale must contain formatLong property');
  var v = n(r);
  if (!c(v)) throw new RangeError('Invalid time value');
  var b = o(v),
    y = x(v, b),
    T = { firstWeekContainsDate: h, weekStartsOn: g, locale: d, _originalDate: v },
    C = u
      .match(it)
      .map(function(t) {
        var e = t[0];
        return 'p' === e || 'P' === e ? (0, _[e])(t, d.formatLong, T) : t;
      })
      .join('')
      .match(at)
      .map(function(t) {
        if ("''" === t) return "'";
        var e = t[0];
        if ("'" === e) return dt(t);
        var n = j[e];
        if (n) return !s.useAdditionalWeekYearTokens && nt(t) && rt(t), !s.useAdditionalDayOfYearTokens && et(t) && rt(t), n(y, t, d.localize, T);
        if (e.match(st)) throw new RangeError('Format string contains an unescaped latin alphabet character `' + e + '`');
        return t;
      })
      .join('');
  return C;
}
function dt(t) {
  return t.match(ot)[1].replace(ut, "'");
}
function lt(t, e) {
  if (null == t) throw new TypeError('assign requires that input parameter not be null or undefined');
  for (var n in (e = e || {})) e.hasOwnProperty(n) && (t[n] = e[n]);
  return t;
}
function ft(t) {
  return lt({}, t);
}
function ht(t, r, a) {
  e(2, arguments);
  var i = a || {},
    u = i.locale || p;
  if (!u.formatDistance) throw new RangeError('locale must contain formatDistance property');
  var c = s(t, r);
  if (isNaN(c)) throw new RangeError('Invalid time value');
  var d,
    l,
    m = ft(i);
  (m.addSuffix = Boolean(i.addSuffix)), (m.comparison = c), c > 0 ? ((d = n(r)), (l = n(t))) : ((d = n(t)), (l = n(r)));
  var w,
    g = h(l, d),
    v = (o(l) - o(d)) / 1e3,
    b = Math.round((g - v) / 60);
  if (b < 2)
    return i.includeSeconds
      ? g < 5
        ? u.formatDistance('lessThanXSeconds', 5, m)
        : g < 10
        ? u.formatDistance('lessThanXSeconds', 10, m)
        : g < 20
        ? u.formatDistance('lessThanXSeconds', 20, m)
        : g < 40
        ? u.formatDistance('halfAMinute', null, m)
        : g < 60
        ? u.formatDistance('lessThanXMinutes', 1, m)
        : u.formatDistance('xMinutes', 1, m)
      : 0 === b
      ? u.formatDistance('lessThanXMinutes', 1, m)
      : u.formatDistance('xMinutes', b, m);
  if (b < 45) return u.formatDistance('xMinutes', b, m);
  if (b < 90) return u.formatDistance('aboutXHours', 1, m);
  if (b < 1440) {
    var y = Math.round(b / 60);
    return u.formatDistance('aboutXHours', y, m);
  }
  if (b < 2520) return u.formatDistance('xDays', 1, m);
  if (b < 43200) {
    var T = Math.round(b / 1440);
    return u.formatDistance('xDays', T, m);
  }
  if (b < 86400) return (w = Math.round(b / 43200)), u.formatDistance('aboutXMonths', w, m);
  if ((w = f(l, d)) < 12) {
    var x = Math.round(b / 43200);
    return u.formatDistance('xMonths', x, m);
  }
  var C = w % 12,
    D = Math.floor(w / 12);
  return C < 3 ? u.formatDistance('aboutXYears', D, m) : C < 9 ? u.formatDistance('overXYears', D, m) : u.formatDistance('almostXYears', D + 1, m);
}
function mt(t, n) {
  return e(1, arguments), ht(t, Date.now(), n);
}
function wt(t, r) {
  e(2, arguments);
  var a = n(t),
    i = n(r);
  return a.getTime() > i.getTime();
}
function gt(t, r) {
  e(2, arguments);
  var a = n(t),
    i = n(r);
  return a.getTime() < i.getTime();
}
function vt(r, a, i) {
  e(2, arguments);
  var o = i || {},
    u = o.locale,
    s = u && u.options && u.options.weekStartsOn,
    c = null == s ? 0 : t(s),
    d = null == o.weekStartsOn ? c : t(o.weekStartsOn);
  if (!(d >= 0 && d <= 6)) throw new RangeError('weekStartsOn must be between 0 and 6 inclusively');
  var l = n(r),
    f = t(a),
    h = l.getUTCDay(),
    m = f % 7,
    w = (m + 7) % 7,
    g = (w < d ? 7 : 0) + f - h;
  return l.setUTCDate(l.getUTCDate() + g), l;
}
var bt = /^(1[0-2]|0?\d)/,
  yt = /^(3[0-1]|[0-2]?\d)/,
  Tt = /^(36[0-6]|3[0-5]\d|[0-2]?\d?\d)/,
  pt = /^(5[0-3]|[0-4]?\d)/,
  xt = /^(2[0-3]|[0-1]?\d)/,
  Ct = /^(2[0-4]|[0-1]?\d)/,
  Dt = /^(1[0-1]|0?\d)/,
  Mt = /^(1[0-2]|0?\d)/,
  kt = /^[0-5]?\d/,
  Ut = /^[0-5]?\d/,
  Nt = /^\d/,
  Yt = /^\d{1,2}/,
  Pt = /^\d{1,3}/,
  St = /^\d{1,4}/,
  qt = /^-?\d+/,
  Et = /^-?\d/,
  Ht = /^-?\d{1,2}/,
  Ot = /^-?\d{1,3}/,
  Wt = /^-?\d{1,4}/,
  Lt = /^([+-])(\d{2})(\d{2})?|Z/,
  Qt = /^([+-])(\d{2})(\d{2})|Z/,
  Xt = /^([+-])(\d{2})(\d{2})((\d{2}))?|Z/,
  Ft = /^([+-])(\d{2}):(\d{2})|Z/,
  Rt = /^([+-])(\d{2}):(\d{2})(:(\d{2}))?|Z/;
function Bt(t, e, n) {
  var r = e.match(t);
  if (!r) return null;
  var a = parseInt(r[0], 10);
  return { value: n ? n(a) : a, rest: e.slice(r[0].length) };
}
function Gt(t, e) {
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
function It(t, e) {
  return Bt(qt, t, e);
}
function zt(t, e, n) {
  switch (t) {
    case 1:
      return Bt(Nt, e, n);
    case 2:
      return Bt(Yt, e, n);
    case 3:
      return Bt(Pt, e, n);
    case 4:
      return Bt(St, e, n);
    default:
      return Bt(new RegExp('^\\d{1,' + t + '}'), e, n);
  }
}
function jt(t, e, n) {
  switch (t) {
    case 1:
      return Bt(Et, e, n);
    case 2:
      return Bt(Ht, e, n);
    case 3:
      return Bt(Ot, e, n);
    case 4:
      return Bt(Wt, e, n);
    default:
      return Bt(new RegExp('^-?\\d{1,' + t + '}'), e, n);
  }
}
function At(t) {
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
function Zt(t, e) {
  var n,
    r = e > 0,
    a = r ? e : 1 - e;
  if (a <= 50) n = t || 100;
  else {
    var i = a + 50;
    n = t + 100 * Math.floor(i / 100) - (t >= i % 100 ? 100 : 0);
  }
  return r ? n : 1 - n;
}
var Kt = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
  $t = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
function Jt(t) {
  return t % 400 == 0 || (t % 4 == 0 && t % 100 != 0);
}
var _t = {
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
            return zt(4, t, a);
          case 'yo':
            return n.ordinalNumber(t, { unit: 'year', valueCallback: a });
          default:
            return zt(e.length, t, a);
        }
      },
      validate: function(t, e, n) {
        return e.isTwoDigitYear || e.year > 0;
      },
      set: function(t, e, n, r) {
        var a = t.getUTCFullYear();
        if (n.isTwoDigitYear) {
          var i = Zt(n.year, a);
          return t.setUTCFullYear(i, 0, 1), t.setUTCHours(0, 0, 0, 0), t;
        }
        var o = 'era' in e && 1 !== e.era ? 1 - n.year : n.year;
        return t.setUTCFullYear(o, 0, 1), t.setUTCHours(0, 0, 0, 0), t;
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
            return zt(4, t, a);
          case 'Yo':
            return n.ordinalNumber(t, { unit: 'year', valueCallback: a });
          default:
            return zt(e.length, t, a);
        }
      },
      validate: function(t, e, n) {
        return e.isTwoDigitYear || e.year > 0;
      },
      set: function(t, e, n, r) {
        var a = L(t, r);
        if (n.isTwoDigitYear) {
          var i = Zt(n.year, a);
          return t.setUTCFullYear(i, 0, r.firstWeekContainsDate), t.setUTCHours(0, 0, 0, 0), W(t, r);
        }
        var o = 'era' in e && 1 !== e.era ? 1 - n.year : n.year;
        return t.setUTCFullYear(o, 0, r.firstWeekContainsDate), t.setUTCHours(0, 0, 0, 0), W(t, r);
      },
      incompatibleTokens: ['y', 'R', 'u', 'Q', 'q', 'M', 'L', 'I', 'd', 'D', 'i', 't', 'T']
    },
    R: {
      priority: 130,
      parse: function(t, e, n, r) {
        return jt('R' === e ? 4 : e.length, t);
      },
      set: function(t, e, n, r) {
        var a = new Date(0);
        return a.setUTCFullYear(n, 0, 4), a.setUTCHours(0, 0, 0, 0), q(a);
      },
      incompatibleTokens: ['G', 'y', 'Y', 'u', 'Q', 'q', 'M', 'L', 'w', 'd', 'D', 'e', 'c', 't', 'T']
    },
    u: {
      priority: 130,
      parse: function(t, e, n, r) {
        return jt('u' === e ? 4 : e.length, t);
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
            return zt(e.length, t);
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
            return zt(e.length, t);
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
            return Bt(bt, t, a);
          case 'MM':
            return zt(2, t, a);
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
            return Bt(bt, t, a);
          case 'LL':
            return zt(2, t, a);
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
            return Bt(pt, t);
          case 'wo':
            return n.ordinalNumber(t, { unit: 'week' });
          default:
            return zt(e.length, t);
        }
      },
      validate: function(t, e, n) {
        return e >= 1 && e <= 53;
      },
      set: function(r, a, i, o) {
        return W(
          (function(r, a, i) {
            e(2, arguments);
            var o = n(r),
              u = t(a),
              s = X(o, i) - u;
            return o.setUTCDate(o.getUTCDate() - 7 * s), o;
          })(r, i, o),
          o
        );
      },
      incompatibleTokens: ['y', 'R', 'u', 'q', 'Q', 'M', 'L', 'I', 'd', 'D', 'i', 't', 'T']
    },
    I: {
      priority: 100,
      parse: function(t, e, n, r) {
        switch (e) {
          case 'I':
            return Bt(pt, t);
          case 'Io':
            return n.ordinalNumber(t, { unit: 'week' });
          default:
            return zt(e.length, t);
        }
      },
      validate: function(t, e, n) {
        return e >= 1 && e <= 53;
      },
      set: function(r, a, i, o) {
        return q(
          (function(r, a) {
            e(2, arguments);
            var i = n(r),
              o = t(a),
              u = O(i) - o;
            return i.setUTCDate(i.getUTCDate() - 7 * u), i;
          })(r, i, o),
          o
        );
      },
      incompatibleTokens: ['y', 'Y', 'u', 'q', 'Q', 'M', 'L', 'w', 'd', 'D', 'e', 'c', 't', 'T']
    },
    d: {
      priority: 90,
      parse: function(t, e, n, r) {
        switch (e) {
          case 'd':
            return Bt(yt, t);
          case 'do':
            return n.ordinalNumber(t, { unit: 'date' });
          default:
            return zt(e.length, t);
        }
      },
      validate: function(t, e, n) {
        var r = Jt(t.getUTCFullYear()),
          a = t.getUTCMonth();
        return r ? e >= 1 && e <= $t[a] : e >= 1 && e <= Kt[a];
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
            return Bt(Tt, t);
          case 'Do':
            return n.ordinalNumber(t, { unit: 'date' });
          default:
            return zt(e.length, t);
        }
      },
      validate: function(t, e, n) {
        return Jt(t.getUTCFullYear()) ? e >= 1 && e <= 366 : e >= 1 && e <= 365;
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
        return (t = vt(t, n, r)).setUTCHours(0, 0, 0, 0), t;
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
            return zt(e.length, t, a);
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
        return (t = vt(t, n, r)).setUTCHours(0, 0, 0, 0), t;
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
            return zt(e.length, t, a);
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
        return (t = vt(t, n, r)).setUTCHours(0, 0, 0, 0), t;
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
            return zt(e.length, t);
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
      set: function(r, a, i, o) {
        return (
          (r = (function(r, a) {
            e(2, arguments);
            var i = t(a);
            i % 7 == 0 && (i -= 7);
            var o = 1,
              u = n(r),
              s = u.getUTCDay(),
              c = i % 7,
              d = (c + 7) % 7,
              l = (d < o ? 7 : 0) + i - s;
            return u.setUTCDate(u.getUTCDate() + l), u;
          })(r, i, o)).setUTCHours(0, 0, 0, 0),
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
        return t.setUTCHours(At(n), 0, 0, 0), t;
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
        return t.setUTCHours(At(n), 0, 0, 0), t;
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
        return t.setUTCHours(At(n), 0, 0, 0), t;
      },
      incompatibleTokens: ['a', 'b', 't', 'T']
    },
    h: {
      priority: 70,
      parse: function(t, e, n, r) {
        switch (e) {
          case 'h':
            return Bt(Mt, t);
          case 'ho':
            return n.ordinalNumber(t, { unit: 'hour' });
          default:
            return zt(e.length, t);
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
            return Bt(xt, t);
          case 'Ho':
            return n.ordinalNumber(t, { unit: 'hour' });
          default:
            return zt(e.length, t);
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
            return Bt(Dt, t);
          case 'Ko':
            return n.ordinalNumber(t, { unit: 'hour' });
          default:
            return zt(e.length, t);
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
            return Bt(Ct, t);
          case 'ko':
            return n.ordinalNumber(t, { unit: 'hour' });
          default:
            return zt(e.length, t);
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
            return Bt(kt, t);
          case 'mo':
            return n.ordinalNumber(t, { unit: 'minute' });
          default:
            return zt(e.length, t);
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
            return Bt(Ut, t);
          case 'so':
            return n.ordinalNumber(t, { unit: 'second' });
          default:
            return zt(e.length, t);
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
        return zt(e.length, t, function(t) {
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
            return Gt(Lt, t);
          case 'XX':
            return Gt(Qt, t);
          case 'XXXX':
            return Gt(Xt, t);
          case 'XXXXX':
            return Gt(Rt, t);
          case 'XXX':
          default:
            return Gt(Ft, t);
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
            return Gt(Lt, t);
          case 'xx':
            return Gt(Qt, t);
          case 'xxxx':
            return Gt(Xt, t);
          case 'xxxxx':
            return Gt(Rt, t);
          case 'xxx':
          default:
            return Gt(Ft, t);
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
        return It(t);
      },
      set: function(t, e, n, r) {
        return [new Date(1e3 * n), { timestampIsSet: !0 }];
      },
      incompatibleTokens: '*'
    },
    T: {
      priority: 20,
      parse: function(t, e, n, r) {
        return It(t);
      },
      set: function(t, e, n, r) {
        return [new Date(n), { timestampIsSet: !0 }];
      },
      incompatibleTokens: '*'
    }
  },
  Vt = /[yYQqMLwIdDecihHKkms]o|(\w)\1*|''|'(''|[^'])+('|$)|./g,
  te = /P+p+|P+|p+|''|'(''|[^'])+('|$)|./g,
  ee = /^'([^]*?)'?$/,
  ne = /''/g,
  re = /\S/,
  ae = /[a-zA-Z]/;
function ie(r, a, i, u) {
  e(3, arguments);
  var s = String(r),
    c = String(a),
    d = u || {},
    l = d.locale || p;
  if (!l.match) throw new RangeError('locale must contain match property');
  var f = l.options && l.options.firstWeekContainsDate,
    h = null == f ? 1 : t(f),
    m = null == d.firstWeekContainsDate ? h : t(d.firstWeekContainsDate);
  if (!(m >= 1 && m <= 7)) throw new RangeError('firstWeekContainsDate must be between 1 and 7 inclusively');
  var w = l.options && l.options.weekStartsOn,
    g = null == w ? 0 : t(w),
    v = null == d.weekStartsOn ? g : t(d.weekStartsOn);
  if (!(v >= 0 && v <= 6)) throw new RangeError('weekStartsOn must be between 0 and 6 inclusively');
  if ('' === c) return '' === s ? n(i) : new Date(NaN);
  var b,
    y = { firstWeekContainsDate: m, weekStartsOn: v, locale: l },
    T = [{ priority: 10, set: oe, index: 0 }],
    C = c
      .match(te)
      .map(function(t) {
        var e = t[0];
        return 'p' === e || 'P' === e ? (0, _[e])(t, l.formatLong, y) : t;
      })
      .join('')
      .match(Vt),
    D = [];
  for (b = 0; b < C.length; b++) {
    var M = C[b];
    !d.useAdditionalWeekYearTokens && nt(M) && rt(M), !d.useAdditionalDayOfYearTokens && et(M) && rt(M);
    var k = M[0],
      U = _t[k];
    if (U) {
      var N = U.incompatibleTokens;
      if (Array.isArray(N)) {
        for (var Y = void 0, P = 0; P < D.length; P++) {
          var S = D[P].token;
          if (-1 !== N.indexOf(S) || S === k) {
            Y = D[P];
            break;
          }
        }
        if (Y) throw new RangeError("The format string mustn't contain `".concat(Y.fullToken, '` and `').concat(M, '` at the same time'));
      } else if ('*' === U.incompatibleTokens && D.length)
        throw new RangeError("The format string mustn't contain `".concat(M, '` and any other token at the same time'));
      D.push({ token: k, fullToken: M });
      var q = U.parse(s, M, l.match, y);
      if (!q) return new Date(NaN);
      T.push({ priority: U.priority, set: U.set, validate: U.validate, value: q.value, index: T.length }), (s = q.rest);
    } else {
      if (k.match(ae)) throw new RangeError('Format string contains an unescaped latin alphabet character `' + k + '`');
      if (("''" === M ? (M = "'") : "'" === k && (M = ue(M)), 0 !== s.indexOf(M))) return new Date(NaN);
      s = s.slice(M.length);
    }
  }
  if (s.length > 0 && re.test(s)) return new Date(NaN);
  var E = T.map(function(t) {
      return t.priority;
    })
      .sort(function(t, e) {
        return e - t;
      })
      .filter(function(t, e, n) {
        return n.indexOf(t) === e;
      })
      .map(function(t) {
        return T.filter(function(e) {
          return e.priority === t;
        }).reverse();
      })
      .map(function(t) {
        return t[0];
      }),
    H = n(i);
  if (isNaN(H)) return new Date(NaN);
  var O = x(H, o(H)),
    W = {};
  for (b = 0; b < E.length; b++) {
    var L = E[b];
    if (L.validate && !L.validate(O, L.value, y)) return new Date(NaN);
    var Q = L.set(O, W, L.value, y);
    Q[0] ? ((O = Q[0]), lt(W, Q[1])) : (O = Q);
  }
  return O;
}
function oe(t, e) {
  if (e.timestampIsSet) return t;
  var n = new Date(0);
  return (
    n.setFullYear(t.getUTCFullYear(), t.getUTCMonth(), t.getUTCDate()),
    n.setHours(t.getUTCHours(), t.getUTCMinutes(), t.getUTCSeconds(), t.getUTCMilliseconds()),
    n
  );
}
function ue(t) {
  return t.match(ee)[1].replace(ne, "'");
}
var se = { dateTimeDelimiter: /[T ]/, timeZoneDelimiter: /[Z ]/i, timezone: /([Z+-].*)$/ },
  ce = /^-?(?:(\d{3})|(\d{2})(?:-?(\d{2}))?|W(\d{2})(?:-?(\d{1}))?|)$/,
  de = /^(\d{2}(?:[.,]\d*)?)(?::?(\d{2}(?:[.,]\d*)?))?(?::?(\d{2}(?:[.,]\d*)?))?$/,
  le = /^([+-])(\d{2})(?::?(\d{2}))?$/;
function fe(n, r) {
  e(1, arguments);
  var a = r || {},
    i = null == a.additionalDigits ? 2 : t(a.additionalDigits);
  if (2 !== i && 1 !== i && 0 !== i) throw new RangeError('additionalDigits must be 0, 1 or 2');
  if ('string' != typeof n && '[object String]' !== Object.prototype.toString.call(n)) return new Date(NaN);
  var o,
    u = he(n);
  if (u.date) {
    var s = me(u.date, i);
    o = we(s.restDateString, s.year);
  }
  if (isNaN(o) || !o) return new Date(NaN);
  var c,
    d = o.getTime(),
    l = 0;
  if (u.time && ((l = ve(u.time)), isNaN(l) || null === l)) return new Date(NaN);
  if (!u.timezone) {
    var f = new Date(d + l),
      h = new Date(f.getUTCFullYear(), f.getUTCMonth(), f.getUTCDate(), f.getUTCHours(), f.getUTCMinutes(), f.getUTCSeconds(), f.getUTCMilliseconds());
    return h.setFullYear(f.getUTCFullYear()), h;
  }
  return (c = ye(u.timezone)), isNaN(c) ? new Date(NaN) : new Date(d + l + c);
}
function he(t) {
  var e,
    n = {},
    r = t.split(se.dateTimeDelimiter);
  if (
    (/:/.test(r[0])
      ? ((n.date = null), (e = r[0]))
      : ((n.date = r[0]),
        (e = r[1]),
        se.timeZoneDelimiter.test(n.date) && ((n.date = t.split(se.timeZoneDelimiter)[0]), (e = t.substr(n.date.length, t.length)))),
    e)
  ) {
    var a = se.timezone.exec(e);
    a ? ((n.time = e.replace(a[1], '')), (n.timezone = a[1])) : (n.time = e);
  }
  return n;
}
function me(t, e) {
  var n = new RegExp('^(?:(\\d{4}|[+-]\\d{' + (4 + e) + '})|(\\d{2}|[+-]\\d{' + (2 + e) + '})$)'),
    r = t.match(n);
  if (!r) return { year: null };
  var a = r[1] && parseInt(r[1]),
    i = r[2] && parseInt(r[2]);
  return { year: null == i ? a : 100 * i, restDateString: t.slice((r[1] || r[2]).length) };
}
function we(t, e) {
  if (null === e) return null;
  var n = t.match(ce);
  if (!n) return null;
  var r = !!n[4],
    a = ge(n[1]),
    i = ge(n[2]) - 1,
    o = ge(n[3]),
    u = ge(n[4]),
    s = ge(n[5]) - 1;
  if (r)
    return (function(t, e, n) {
      return e >= 1 && e <= 53 && n >= 0 && n <= 6;
    })(0, u, s)
      ? (function(t, e, n) {
          var r = new Date(0);
          r.setUTCFullYear(t, 0, 4);
          var a = r.getUTCDay() || 7,
            i = 7 * (e - 1) + n + 1 - a;
          return r.setUTCDate(r.getUTCDate() + i), r;
        })(e, u, s)
      : new Date(NaN);
  var c = new Date(0);
  return (function(t, e, n) {
    return e >= 0 && e <= 11 && n >= 1 && n <= (Te[e] || (pe(t) ? 29 : 28));
  })(e, i, o) &&
    (function(t, e) {
      return e >= 1 && e <= (pe(t) ? 366 : 365);
    })(e, a)
    ? (c.setUTCFullYear(e, i, Math.max(a, o)), c)
    : new Date(NaN);
}
function ge(t) {
  return t ? parseInt(t) : 1;
}
function ve(t) {
  var e = t.match(de);
  if (!e) return null;
  var n = be(e[1]),
    r = be(e[2]),
    a = be(e[3]);
  return (function(t, e, n) {
    if (24 === t) return 0 === e && 0 === n;
    return n >= 0 && n < 60 && e >= 0 && e < 60 && t >= 0 && t < 25;
  })(n, r, a)
    ? 36e5 * n + 6e4 * r + 1e3 * a
    : NaN;
}
function be(t) {
  return (t && parseFloat(t.replace(',', '.'))) || 0;
}
function ye(t) {
  if ('Z' === t) return 0;
  var e = t.match(le);
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
var Te = [31, null, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
function pe(t) {
  return t % 400 == 0 || (t % 4 == 0 && t % 100);
}
function xe(n, r) {
  e(2, arguments);
  var i = t(r);
  return a(n, -i);
}
function Ce(n, r) {
  e(2, arguments);
  var a = t(r);
  return u(n, -a);
}
export {
  a as addHours,
  u as addMinutes,
  ct as format,
  ht as formatDistance,
  mt as formatDistanceToNow,
  wt as isAfter,
  gt as isBefore,
  ie as parse,
  fe as parseISO,
  xe as subHours,
  Ce as subMinutes
};
