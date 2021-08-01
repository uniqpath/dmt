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
function c(t, n) {
  e(2, arguments);
  var r = s(t),
    a = s(n),
    o = r.getTime() - u(r),
    i = a.getTime() - u(a);
  return Math.round((o - i) / 864e5);
}
function d(n, r) {
  e(2, arguments);
  var o = t(r);
  return a(n, 6e4 * o);
}
function l(n, r) {
  e(2, arguments);
  var o = t(r);
  return a(n, 1e3 * o);
}
function f(t, r) {
  e(2, arguments);
  var a = n(t),
    o = n(r),
    i = a.getTime() - o.getTime();
  return i < 0 ? -1 : i > 0 ? 1 : i;
}
function m(t) {
  e(1, arguments);
  var r = n(t);
  return !isNaN(r);
}
function h(t, n) {
  e(2, arguments);
  var r = s(t),
    a = s(n);
  return r.getTime() === a.getTime();
}
function w(t, r) {
  e(2, arguments);
  var a = n(t),
    o = n(r),
    i = a.getFullYear() - o.getFullYear(),
    u = a.getMonth() - o.getMonth();
  return 12 * i + u;
}
function g(t, r) {
  e(2, arguments);
  var a = n(t),
    o = n(r);
  return a.getTime() - o.getTime();
}
function p(t, n) {
  e(2, arguments);
  var r = g(t, n) / 6e4;
  return r > 0 ? Math.floor(r) : Math.ceil(r);
}
function v(t, r) {
  e(2, arguments);
  var a = n(t),
    o = n(r),
    i = f(a, o),
    u = Math.abs(w(a, o));
  a.setMonth(a.getMonth() - i * u);
  var s = f(a, o) === -i,
    c = i * (u - s);
  return 0 === c ? 0 : c;
}
function b(t, n) {
  e(2, arguments);
  var r = g(t, n) / 1e3;
  return r > 0 ? Math.floor(r) : Math.ceil(r);
}
var y = {
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
function T(t) {
  return function(e) {
    var n = e || {},
      r = n.width ? String(n.width) : t.defaultWidth;
    return t.formats[r] || t.formats[t.defaultWidth];
  };
}
var k = {
    date: T({ formats: { full: 'EEEE, MMMM do, y', long: 'MMMM do, y', medium: 'MMM d, y', short: 'MM/dd/yyyy' }, defaultWidth: 'full' }),
    time: T({ formats: { full: 'h:mm:ss a zzzz', long: 'h:mm:ss a z', medium: 'h:mm:ss a', short: 'h:mm a' }, defaultWidth: 'full' }),
    dateTime: T({
      formats: { full: "{{date}} 'at' {{time}}", long: "{{date}} 'at' {{time}}", medium: '{{date}}, {{time}}', short: '{{date}}, {{time}}' },
      defaultWidth: 'full'
    })
  },
  x = {
    lastWeek: "'last' eeee 'at' p",
    yesterday: "'yesterday at' p",
    today: "'today at' p",
    tomorrow: "'tomorrow at' p",
    nextWeek: "eeee 'at' p",
    other: 'P'
  };
function M(t) {
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
function C(t) {
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
function D(t) {
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
var j = {
  code: 'en-US',
  formatDistance: function(t, e, n) {
    var r;
    return (
      (n = n || {}),
      (r = 'string' == typeof y[t] ? y[t] : 1 === e ? y[t].one : y[t].other.replace('{{count}}', e)),
      n.addSuffix ? (n.comparison > 0 ? 'in ' + r : r + ' ago') : r
    );
  },
  formatLong: k,
  formatRelative: function(t, e, n, r) {
    return x[t];
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
    era: M({ values: { narrow: ['B', 'A'], abbreviated: ['BC', 'AD'], wide: ['Before Christ', 'Anno Domini'] }, defaultWidth: 'wide' }),
    quarter: M({
      values: { narrow: ['1', '2', '3', '4'], abbreviated: ['Q1', 'Q2', 'Q3', 'Q4'], wide: ['1st quarter', '2nd quarter', '3rd quarter', '4th quarter'] },
      defaultWidth: 'wide',
      argumentCallback: function(t) {
        return Number(t) - 1;
      }
    }),
    month: M({
      values: {
        narrow: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
        abbreviated: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        wide: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
      },
      defaultWidth: 'wide'
    }),
    day: M({
      values: {
        narrow: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
        short: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
        abbreviated: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        wide: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      },
      defaultWidth: 'wide'
    }),
    dayPeriod: M({
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
    ordinalNumber: C({
      matchPattern: /^(\d+)(th|st|nd|rd)?/i,
      parsePattern: /\d+/i,
      valueCallback: function(t) {
        return parseInt(t, 10);
      }
    }),
    era: D({
      matchPatterns: {
        narrow: /^(b|a)/i,
        abbreviated: /^(b\.?\s?c\.?|b\.?\s?c\.?\s?e\.?|a\.?\s?d\.?|c\.?\s?e\.?)/i,
        wide: /^(before christ|before common era|anno domini|common era)/i
      },
      defaultMatchWidth: 'wide',
      parsePatterns: { any: [/^b/i, /^(a|c)/i] },
      defaultParseWidth: 'any'
    }),
    quarter: D({
      matchPatterns: { narrow: /^[1234]/i, abbreviated: /^q[1234]/i, wide: /^[1234](th|st|nd|rd)? quarter/i },
      defaultMatchWidth: 'wide',
      parsePatterns: { any: [/1/i, /2/i, /3/i, /4/i] },
      defaultParseWidth: 'any',
      valueCallback: function(t) {
        return t + 1;
      }
    }),
    month: D({
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
    day: D({
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
    dayPeriod: D({
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
function U(n, r) {
  e(2, arguments);
  var o = t(r);
  return a(n, -o);
}
function P(t, e) {
  for (var n = t < 0 ? '-' : '', r = Math.abs(t).toString(); r.length < e; ) r = '0' + r;
  return n + r;
}
var S = function(t, e) {
    var n = t.getUTCFullYear(),
      r = n > 0 ? n : 1 - n;
    return P('yy' === e ? r % 100 : r, e.length);
  },
  Y = function(t, e) {
    var n = t.getUTCMonth();
    return 'M' === e ? String(n + 1) : P(n + 1, 2);
  },
  E = function(t, e) {
    return P(t.getUTCDate(), e.length);
  },
  N = function(t, e) {
    return P(t.getUTCHours() % 12 || 12, e.length);
  },
  q = function(t, e) {
    return P(t.getUTCHours(), e.length);
  },
  H = function(t, e) {
    return P(t.getUTCMinutes(), e.length);
  },
  W = function(t, e) {
    return P(t.getUTCSeconds(), e.length);
  },
  X = function(t, e) {
    var n = e.length,
      r = t.getUTCMilliseconds();
    return P(Math.floor(r * Math.pow(10, n - 3)), e.length);
  };
function O(t) {
  e(1, arguments);
  var r = 1,
    a = n(t),
    o = a.getUTCDay(),
    i = (o < r ? 7 : 0) + o - r;
  return a.setUTCDate(a.getUTCDate() - i), a.setUTCHours(0, 0, 0, 0), a;
}
function z(t) {
  e(1, arguments);
  var r = n(t),
    a = r.getUTCFullYear(),
    o = new Date(0);
  o.setUTCFullYear(a + 1, 0, 4), o.setUTCHours(0, 0, 0, 0);
  var i = O(o),
    u = new Date(0);
  u.setUTCFullYear(a, 0, 4), u.setUTCHours(0, 0, 0, 0);
  var s = O(u);
  return r.getTime() >= i.getTime() ? a + 1 : r.getTime() >= s.getTime() ? a : a - 1;
}
function L(t) {
  e(1, arguments);
  var n = z(t),
    r = new Date(0);
  r.setUTCFullYear(n, 0, 4), r.setUTCHours(0, 0, 0, 0);
  var a = O(r);
  return a;
}
function Q(t) {
  e(1, arguments);
  var r = n(t),
    a = O(r).getTime() - L(r).getTime();
  return Math.round(a / 6048e5) + 1;
}
function R(r, a) {
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
function F(r, a) {
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
  var m = R(f, a),
    h = new Date(0);
  h.setUTCFullYear(i, 0, l), h.setUTCHours(0, 0, 0, 0);
  var w = R(h, a);
  return o.getTime() >= m.getTime() ? i + 1 : o.getTime() >= w.getTime() ? i : i - 1;
}
function I(n, r) {
  e(1, arguments);
  var a = r || {},
    o = a.locale,
    i = o && o.options && o.options.firstWeekContainsDate,
    u = null == i ? 1 : t(i),
    s = null == a.firstWeekContainsDate ? u : t(a.firstWeekContainsDate),
    c = F(n, r),
    d = new Date(0);
  d.setUTCFullYear(c, 0, s), d.setUTCHours(0, 0, 0, 0);
  var l = R(d, r);
  return l;
}
function B(t, r) {
  e(1, arguments);
  var a = n(t),
    o = R(a, r).getTime() - I(a, r).getTime();
  return Math.round(o / 6048e5) + 1;
}
var G = 'midnight',
  A = 'noon',
  Z = 'morning',
  K = 'afternoon',
  $ = 'evening',
  J = 'night',
  _ = {
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
      return S(t, e);
    },
    Y: function(t, e, n, r) {
      var a = F(t, r),
        o = a > 0 ? a : 1 - a;
      return 'YY' === e ? P(o % 100, 2) : 'Yo' === e ? n.ordinalNumber(o, { unit: 'year' }) : P(o, e.length);
    },
    R: function(t, e) {
      return P(z(t), e.length);
    },
    u: function(t, e) {
      return P(t.getUTCFullYear(), e.length);
    },
    Q: function(t, e, n) {
      var r = Math.ceil((t.getUTCMonth() + 1) / 3);
      switch (e) {
        case 'Q':
          return String(r);
        case 'QQ':
          return P(r, 2);
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
          return P(r, 2);
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
          return Y(t, e);
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
          return P(r + 1, 2);
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
      var a = B(t, r);
      return 'wo' === e ? n.ordinalNumber(a, { unit: 'week' }) : P(a, e.length);
    },
    I: function(t, e, n) {
      var r = Q(t);
      return 'Io' === e ? n.ordinalNumber(r, { unit: 'week' }) : P(r, e.length);
    },
    d: function(t, e, n) {
      return 'do' === e ? n.ordinalNumber(t.getUTCDate(), { unit: 'date' }) : E(t, e);
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
      return 'Do' === r ? a.ordinalNumber(o, { unit: 'dayOfYear' }) : P(o, r.length);
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
          return P(o, 2);
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
          return P(o, e.length);
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
          return P(a, e.length);
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
      switch (((r = 12 === a ? A : 0 === a ? G : a / 12 >= 1 ? 'pm' : 'am'), e)) {
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
      switch (((r = a >= 17 ? $ : a >= 12 ? K : a >= 4 ? Z : J), e)) {
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
      return N(t, e);
    },
    H: function(t, e, n) {
      return 'Ho' === e ? n.ordinalNumber(t.getUTCHours(), { unit: 'hour' }) : q(t, e);
    },
    K: function(t, e, n) {
      var r = t.getUTCHours() % 12;
      return 'Ko' === e ? n.ordinalNumber(r, { unit: 'hour' }) : P(r, e.length);
    },
    k: function(t, e, n) {
      var r = t.getUTCHours();
      return 0 === r && (r = 24), 'ko' === e ? n.ordinalNumber(r, { unit: 'hour' }) : P(r, e.length);
    },
    m: function(t, e, n) {
      return 'mo' === e ? n.ordinalNumber(t.getUTCMinutes(), { unit: 'minute' }) : H(t, e);
    },
    s: function(t, e, n) {
      return 'so' === e ? n.ordinalNumber(t.getUTCSeconds(), { unit: 'second' }) : W(t, e);
    },
    S: function(t, e) {
      return X(t, e);
    },
    X: function(t, e, n, r) {
      var a = (r._originalDate || t).getTimezoneOffset();
      if (0 === a) return 'Z';
      switch (e) {
        case 'X':
          return tt(a);
        case 'XXXX':
        case 'XX':
          return et(a);
        case 'XXXXX':
        case 'XXX':
        default:
          return et(a, ':');
      }
    },
    x: function(t, e, n, r) {
      var a = (r._originalDate || t).getTimezoneOffset();
      switch (e) {
        case 'x':
          return tt(a);
        case 'xxxx':
        case 'xx':
          return et(a);
        case 'xxxxx':
        case 'xxx':
        default:
          return et(a, ':');
      }
    },
    O: function(t, e, n, r) {
      var a = (r._originalDate || t).getTimezoneOffset();
      switch (e) {
        case 'O':
        case 'OO':
        case 'OOO':
          return 'GMT' + V(a, ':');
        case 'OOOO':
        default:
          return 'GMT' + et(a, ':');
      }
    },
    z: function(t, e, n, r) {
      var a = (r._originalDate || t).getTimezoneOffset();
      switch (e) {
        case 'z':
        case 'zz':
        case 'zzz':
          return 'GMT' + V(a, ':');
        case 'zzzz':
        default:
          return 'GMT' + et(a, ':');
      }
    },
    t: function(t, e, n, r) {
      var a = r._originalDate || t;
      return P(Math.floor(a.getTime() / 1e3), e.length);
    },
    T: function(t, e, n, r) {
      return P((r._originalDate || t).getTime(), e.length);
    }
  };
function V(t, e) {
  var n = t > 0 ? '-' : '+',
    r = Math.abs(t),
    a = Math.floor(r / 60),
    o = r % 60;
  if (0 === o) return n + String(a);
  var i = e || '';
  return n + String(a) + i + P(o, 2);
}
function tt(t, e) {
  return t % 60 == 0 ? (t > 0 ? '-' : '+') + P(Math.abs(t) / 60, 2) : et(t, e);
}
function et(t, e) {
  var n = e || '',
    r = t > 0 ? '-' : '+',
    a = Math.abs(t);
  return r + P(Math.floor(a / 60), 2) + n + P(a % 60, 2);
}
function nt(t, e) {
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
function rt(t, e) {
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
var at = {
    p: rt,
    P: function(t, e) {
      var n,
        r = t.match(/(P+)(p+)?/),
        a = r[1],
        o = r[2];
      if (!o) return nt(t, e);
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
      return n.replace('{{date}}', nt(a, e)).replace('{{time}}', rt(o, e));
    }
  },
  ot = ['D', 'DD'],
  it = ['YY', 'YYYY'];
function ut(t) {
  return -1 !== ot.indexOf(t);
}
function st(t) {
  return -1 !== it.indexOf(t);
}
function ct(t) {
  if ('YYYY' === t) throw new RangeError('Use `yyyy` instead of `YYYY` for formatting years; see: https://git.io/fxCyr');
  if ('YY' === t) throw new RangeError('Use `yy` instead of `YY` for formatting years; see: https://git.io/fxCyr');
  if ('D' === t) throw new RangeError('Use `d` instead of `D` for formatting days of the month; see: https://git.io/fxCyr');
  if ('DD' === t) throw new RangeError('Use `dd` instead of `DD` for formatting days of the month; see: https://git.io/fxCyr');
}
var dt = /[yYQqMLwIdDecihHKkms]o|(\w)\1*|''|'(''|[^'])+('|$)|./g,
  lt = /P+p+|P+|p+|''|'(''|[^'])+('|$)|./g,
  ft = /^'([^]*?)'?$/,
  mt = /''/g,
  ht = /[a-zA-Z]/;
function wt(r, a, o) {
  e(2, arguments);
  var i = String(a),
    s = o || {},
    c = s.locale || j,
    d = c.options && c.options.firstWeekContainsDate,
    l = null == d ? 1 : t(d),
    f = null == s.firstWeekContainsDate ? l : t(s.firstWeekContainsDate);
  if (!(f >= 1 && f <= 7)) throw new RangeError('firstWeekContainsDate must be between 1 and 7 inclusively');
  var h = c.options && c.options.weekStartsOn,
    w = null == h ? 0 : t(h),
    g = null == s.weekStartsOn ? w : t(s.weekStartsOn);
  if (!(g >= 0 && g <= 6)) throw new RangeError('weekStartsOn must be between 0 and 6 inclusively');
  if (!c.localize) throw new RangeError('locale must contain localize property');
  if (!c.formatLong) throw new RangeError('locale must contain formatLong property');
  var p = n(r);
  if (!m(p)) throw new RangeError('Invalid time value');
  var v = u(p),
    b = U(p, v),
    y = { firstWeekContainsDate: f, weekStartsOn: g, locale: c, _originalDate: p },
    T = i
      .match(lt)
      .map(function(t) {
        var e = t[0];
        return 'p' === e || 'P' === e ? (0, at[e])(t, c.formatLong, y) : t;
      })
      .join('')
      .match(dt)
      .map(function(t) {
        if ("''" === t) return "'";
        var e = t[0];
        if ("'" === e) return gt(t);
        var n = _[e];
        if (n) return !s.useAdditionalWeekYearTokens && st(t) && ct(t), !s.useAdditionalDayOfYearTokens && ut(t) && ct(t), n(b, t, c.localize, y);
        if (e.match(ht)) throw new RangeError('Format string contains an unescaped latin alphabet character `' + e + '`');
        return t;
      })
      .join('');
  return T;
}
function gt(t) {
  return t.match(ft)[1].replace(mt, "'");
}
function pt(t, e) {
  if (null == t) throw new TypeError('assign requires that input parameter not be null or undefined');
  for (var n in (e = e || {})) e.hasOwnProperty(n) && (t[n] = e[n]);
  return t;
}
function vt(t) {
  return pt({}, t);
}
function bt(t, r, a) {
  e(2, arguments);
  var o = a || {},
    i = o.locale || j;
  if (!i.formatDistance) throw new RangeError('locale must contain formatDistance property');
  var s = f(t, r);
  if (isNaN(s)) throw new RangeError('Invalid time value');
  var c,
    d,
    l = vt(o);
  (l.addSuffix = Boolean(o.addSuffix)), (l.comparison = s), s > 0 ? ((c = n(r)), (d = n(t))) : ((c = n(t)), (d = n(r)));
  var m,
    h = b(d, c),
    w = (u(d) - u(c)) / 1e3,
    g = Math.round((h - w) / 60);
  if (g < 2)
    return o.includeSeconds
      ? h < 5
        ? i.formatDistance('lessThanXSeconds', 5, l)
        : h < 10
        ? i.formatDistance('lessThanXSeconds', 10, l)
        : h < 20
        ? i.formatDistance('lessThanXSeconds', 20, l)
        : h < 40
        ? i.formatDistance('halfAMinute', null, l)
        : h < 60
        ? i.formatDistance('lessThanXMinutes', 1, l)
        : i.formatDistance('xMinutes', 1, l)
      : 0 === g
      ? i.formatDistance('lessThanXMinutes', 1, l)
      : i.formatDistance('xMinutes', g, l);
  if (g < 45) return i.formatDistance('xMinutes', g, l);
  if (g < 90) return i.formatDistance('aboutXHours', 1, l);
  if (g < 1440) {
    var p = Math.round(g / 60);
    return i.formatDistance('aboutXHours', p, l);
  }
  if (g < 2520) return i.formatDistance('xDays', 1, l);
  if (g < 43200) {
    var y = Math.round(g / 1440);
    return i.formatDistance('xDays', y, l);
  }
  if (g < 86400) return (m = Math.round(g / 43200)), i.formatDistance('aboutXMonths', m, l);
  if ((m = v(d, c)) < 12) {
    var T = Math.round(g / 43200);
    return i.formatDistance('xMonths', T, l);
  }
  var k = m % 12,
    x = Math.floor(m / 12);
  return k < 3 ? i.formatDistance('aboutXYears', x, l) : k < 9 ? i.formatDistance('overXYears', x, l) : i.formatDistance('almostXYears', x + 1, l);
}
function yt(t, r, a) {
  e(2, arguments);
  var o = a || {},
    i = o.locale || j;
  if (!i.formatDistance) throw new RangeError('locale must contain localize.formatDistance property');
  var s = f(t, r);
  if (isNaN(s)) throw new RangeError('Invalid time value');
  var c,
    d,
    l = vt(o);
  (l.addSuffix = Boolean(o.addSuffix)), (l.comparison = s), s > 0 ? ((c = n(r)), (d = n(t))) : ((c = n(t)), (d = n(r)));
  var m,
    h = null == o.roundingMethod ? 'round' : String(o.roundingMethod);
  if ('floor' === h) m = Math.floor;
  else if ('ceil' === h) m = Math.ceil;
  else {
    if ('round' !== h) throw new RangeError("roundingMethod must be 'floor', 'ceil' or 'round'");
    m = Math.round;
  }
  var w,
    g = b(d, c),
    p = (u(d) - u(c)) / 1e3,
    v = m((g - p) / 60);
  if (
    'second' ===
    (w = null == o.unit ? (v < 1 ? 'second' : v < 60 ? 'minute' : v < 1440 ? 'hour' : v < 43200 ? 'day' : v < 525600 ? 'month' : 'year') : String(o.unit))
  )
    return i.formatDistance('xSeconds', g, l);
  if ('minute' === w) return i.formatDistance('xMinutes', v, l);
  if ('hour' === w) {
    var y = m(v / 60);
    return i.formatDistance('xHours', y, l);
  }
  if ('day' === w) {
    var T = m(v / 1440);
    return i.formatDistance('xDays', T, l);
  }
  if ('month' === w) {
    var k = m(v / 43200);
    return i.formatDistance('xMonths', k, l);
  }
  if ('year' === w) {
    var x = m(v / 525600);
    return i.formatDistance('xYears', x, l);
  }
  throw new RangeError("unit must be 'second', 'minute', 'hour', 'day', 'month' or 'year'");
}
function Tt(t, n) {
  return e(1, arguments), bt(t, Date.now(), n);
}
function kt(t, n) {
  return e(1, arguments), yt(t, Date.now(), n);
}
function xt(t, e) {
  if (arguments.length < 1) throw new TypeError('1 argument required, but only '.concat(arguments.length, ' present'));
  var r = n(t);
  if (!m(r)) throw new RangeError('Invalid time value');
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
    var l = P(r.getDate(), 2),
      f = P(r.getMonth() + 1, 2),
      h = P(r.getFullYear(), 4);
    u = ''
      .concat(h)
      .concat(c)
      .concat(f)
      .concat(c)
      .concat(l);
  }
  if ('date' !== i) {
    var w = r.getTimezoneOffset();
    if (0 !== w) {
      var g = Math.abs(w),
        p = P(Math.floor(g / 60), 2),
        v = P(g % 60, 2),
        b = w < 0 ? '+' : '-';
      s = ''
        .concat(b)
        .concat(p, ':')
        .concat(v);
    } else s = 'Z';
    var y = P(r.getHours(), 2),
      T = P(r.getMinutes(), 2),
      k = P(r.getSeconds(), 2),
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
function Mt(t, r) {
  e(2, arguments);
  var a = n(t),
    o = n(r);
  return a.getTime() > o.getTime();
}
function Ct(t, r) {
  e(2, arguments);
  var a = n(t),
    o = n(r);
  return a.getTime() < o.getTime();
}
function Dt(t, r) {
  e(2, arguments);
  var a = n(t),
    o = n(r);
  return a.getTime() === o.getTime();
}
function jt(t) {
  e(1, arguments);
  var r = n(t);
  return r.setMinutes(0, 0, 0), r;
}
function Ut(t, n) {
  e(2, arguments);
  var r = jt(t),
    a = jt(n);
  return r.getTime() === a.getTime();
}
function Pt(t) {
  e(1, arguments);
  var r = n(t);
  return r.setSeconds(0, 0), r;
}
function St(t, n) {
  e(2, arguments);
  var r = Pt(t),
    a = Pt(n);
  return r.getTime() === a.getTime();
}
function Yt(t) {
  e(1, arguments);
  var r = n(t);
  return r.setMilliseconds(0), r;
}
function Et(t, n) {
  e(2, arguments);
  var r = Yt(t),
    a = Yt(n);
  return r.getTime() === a.getTime();
}
function Nt(t) {
  return e(1, arguments), h(t, Date.now());
}
function qt(t) {
  return e(1, arguments), h(t, r(Date.now(), 1));
}
function Ht(n, a) {
  e(2, arguments);
  var o = t(a);
  return r(n, -o);
}
function Wt(r, a, o) {
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
var Xt = /^(1[0-2]|0?\d)/,
  Ot = /^(3[0-1]|[0-2]?\d)/,
  zt = /^(36[0-6]|3[0-5]\d|[0-2]?\d?\d)/,
  Lt = /^(5[0-3]|[0-4]?\d)/,
  Qt = /^(2[0-3]|[0-1]?\d)/,
  Rt = /^(2[0-4]|[0-1]?\d)/,
  Ft = /^(1[0-1]|0?\d)/,
  It = /^(1[0-2]|0?\d)/,
  Bt = /^[0-5]?\d/,
  Gt = /^[0-5]?\d/,
  At = /^\d/,
  Zt = /^\d{1,2}/,
  Kt = /^\d{1,3}/,
  $t = /^\d{1,4}/,
  Jt = /^-?\d+/,
  _t = /^-?\d/,
  Vt = /^-?\d{1,2}/,
  te = /^-?\d{1,3}/,
  ee = /^-?\d{1,4}/,
  ne = /^([+-])(\d{2})(\d{2})?|Z/,
  re = /^([+-])(\d{2})(\d{2})|Z/,
  ae = /^([+-])(\d{2})(\d{2})((\d{2}))?|Z/,
  oe = /^([+-])(\d{2}):(\d{2})|Z/,
  ie = /^([+-])(\d{2}):(\d{2})(:(\d{2}))?|Z/;
function ue(t, e, n) {
  var r = e.match(t);
  if (!r) return null;
  var a = parseInt(r[0], 10);
  return { value: n ? n(a) : a, rest: e.slice(r[0].length) };
}
function se(t, e) {
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
function ce(t, e) {
  return ue(Jt, t, e);
}
function de(t, e, n) {
  switch (t) {
    case 1:
      return ue(At, e, n);
    case 2:
      return ue(Zt, e, n);
    case 3:
      return ue(Kt, e, n);
    case 4:
      return ue($t, e, n);
    default:
      return ue(new RegExp('^\\d{1,' + t + '}'), e, n);
  }
}
function le(t, e, n) {
  switch (t) {
    case 1:
      return ue(_t, e, n);
    case 2:
      return ue(Vt, e, n);
    case 3:
      return ue(te, e, n);
    case 4:
      return ue(ee, e, n);
    default:
      return ue(new RegExp('^-?\\d{1,' + t + '}'), e, n);
  }
}
function fe(t) {
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
function me(t, e) {
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
var he = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
  we = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
function ge(t) {
  return t % 400 == 0 || (t % 4 == 0 && t % 100 != 0);
}
var pe = {
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
            return de(4, t, a);
          case 'yo':
            return n.ordinalNumber(t, { unit: 'year', valueCallback: a });
          default:
            return de(e.length, t, a);
        }
      },
      validate: function(t, e, n) {
        return e.isTwoDigitYear || e.year > 0;
      },
      set: function(t, e, n, r) {
        var a = t.getUTCFullYear();
        if (n.isTwoDigitYear) {
          var o = me(n.year, a);
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
            return de(4, t, a);
          case 'Yo':
            return n.ordinalNumber(t, { unit: 'year', valueCallback: a });
          default:
            return de(e.length, t, a);
        }
      },
      validate: function(t, e, n) {
        return e.isTwoDigitYear || e.year > 0;
      },
      set: function(t, e, n, r) {
        var a = F(t, r);
        if (n.isTwoDigitYear) {
          var o = me(n.year, a);
          return t.setUTCFullYear(o, 0, r.firstWeekContainsDate), t.setUTCHours(0, 0, 0, 0), R(t, r);
        }
        var i = 'era' in e && 1 !== e.era ? 1 - n.year : n.year;
        return t.setUTCFullYear(i, 0, r.firstWeekContainsDate), t.setUTCHours(0, 0, 0, 0), R(t, r);
      },
      incompatibleTokens: ['y', 'R', 'u', 'Q', 'q', 'M', 'L', 'I', 'd', 'D', 'i', 't', 'T']
    },
    R: {
      priority: 130,
      parse: function(t, e, n, r) {
        return le('R' === e ? 4 : e.length, t);
      },
      set: function(t, e, n, r) {
        var a = new Date(0);
        return a.setUTCFullYear(n, 0, 4), a.setUTCHours(0, 0, 0, 0), O(a);
      },
      incompatibleTokens: ['G', 'y', 'Y', 'u', 'Q', 'q', 'M', 'L', 'w', 'd', 'D', 'e', 'c', 't', 'T']
    },
    u: {
      priority: 130,
      parse: function(t, e, n, r) {
        return le('u' === e ? 4 : e.length, t);
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
            return de(e.length, t);
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
            return de(e.length, t);
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
            return ue(Xt, t, a);
          case 'MM':
            return de(2, t, a);
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
            return ue(Xt, t, a);
          case 'LL':
            return de(2, t, a);
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
            return ue(Lt, t);
          case 'wo':
            return n.ordinalNumber(t, { unit: 'week' });
          default:
            return de(e.length, t);
        }
      },
      validate: function(t, e, n) {
        return e >= 1 && e <= 53;
      },
      set: function(r, a, o, i) {
        return R(
          (function(r, a, o) {
            e(2, arguments);
            var i = n(r),
              u = t(a),
              s = B(i, o) - u;
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
            return ue(Lt, t);
          case 'Io':
            return n.ordinalNumber(t, { unit: 'week' });
          default:
            return de(e.length, t);
        }
      },
      validate: function(t, e, n) {
        return e >= 1 && e <= 53;
      },
      set: function(r, a, o, i) {
        return O(
          (function(r, a) {
            e(2, arguments);
            var o = n(r),
              i = t(a),
              u = Q(o) - i;
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
            return ue(Ot, t);
          case 'do':
            return n.ordinalNumber(t, { unit: 'date' });
          default:
            return de(e.length, t);
        }
      },
      validate: function(t, e, n) {
        var r = ge(t.getUTCFullYear()),
          a = t.getUTCMonth();
        return r ? e >= 1 && e <= we[a] : e >= 1 && e <= he[a];
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
            return ue(zt, t);
          case 'Do':
            return n.ordinalNumber(t, { unit: 'date' });
          default:
            return de(e.length, t);
        }
      },
      validate: function(t, e, n) {
        return ge(t.getUTCFullYear()) ? e >= 1 && e <= 366 : e >= 1 && e <= 365;
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
        return (t = Wt(t, n, r)).setUTCHours(0, 0, 0, 0), t;
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
            return de(e.length, t, a);
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
        return (t = Wt(t, n, r)).setUTCHours(0, 0, 0, 0), t;
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
            return de(e.length, t, a);
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
        return (t = Wt(t, n, r)).setUTCHours(0, 0, 0, 0), t;
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
            return de(e.length, t);
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
        return t.setUTCHours(fe(n), 0, 0, 0), t;
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
        return t.setUTCHours(fe(n), 0, 0, 0), t;
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
        return t.setUTCHours(fe(n), 0, 0, 0), t;
      },
      incompatibleTokens: ['a', 'b', 't', 'T']
    },
    h: {
      priority: 70,
      parse: function(t, e, n, r) {
        switch (e) {
          case 'h':
            return ue(It, t);
          case 'ho':
            return n.ordinalNumber(t, { unit: 'hour' });
          default:
            return de(e.length, t);
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
            return ue(Qt, t);
          case 'Ho':
            return n.ordinalNumber(t, { unit: 'hour' });
          default:
            return de(e.length, t);
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
            return ue(Ft, t);
          case 'Ko':
            return n.ordinalNumber(t, { unit: 'hour' });
          default:
            return de(e.length, t);
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
            return ue(Rt, t);
          case 'ko':
            return n.ordinalNumber(t, { unit: 'hour' });
          default:
            return de(e.length, t);
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
            return ue(Bt, t);
          case 'mo':
            return n.ordinalNumber(t, { unit: 'minute' });
          default:
            return de(e.length, t);
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
            return ue(Gt, t);
          case 'so':
            return n.ordinalNumber(t, { unit: 'second' });
          default:
            return de(e.length, t);
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
        return de(e.length, t, function(t) {
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
            return se(ne, t);
          case 'XX':
            return se(re, t);
          case 'XXXX':
            return se(ae, t);
          case 'XXXXX':
            return se(ie, t);
          case 'XXX':
          default:
            return se(oe, t);
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
            return se(ne, t);
          case 'xx':
            return se(re, t);
          case 'xxxx':
            return se(ae, t);
          case 'xxxxx':
            return se(ie, t);
          case 'xxx':
          default:
            return se(oe, t);
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
        return ce(t);
      },
      set: function(t, e, n, r) {
        return [new Date(1e3 * n), { timestampIsSet: !0 }];
      },
      incompatibleTokens: '*'
    },
    T: {
      priority: 20,
      parse: function(t, e, n, r) {
        return ce(t);
      },
      set: function(t, e, n, r) {
        return [new Date(n), { timestampIsSet: !0 }];
      },
      incompatibleTokens: '*'
    }
  },
  ve = /[yYQqMLwIdDecihHKkms]o|(\w)\1*|''|'(''|[^'])+('|$)|./g,
  be = /P+p+|P+|p+|''|'(''|[^'])+('|$)|./g,
  ye = /^'([^]*?)'?$/,
  Te = /''/g,
  ke = /\S/,
  xe = /[a-zA-Z]/;
function Me(r, a, o, i) {
  e(3, arguments);
  var s = String(r),
    c = String(a),
    d = i || {},
    l = d.locale || j;
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
    y = [{ priority: 10, set: Ce, index: 0 }],
    T = c
      .match(be)
      .map(function(t) {
        var e = t[0];
        return 'p' === e || 'P' === e ? (0, at[e])(t, l.formatLong, b) : t;
      })
      .join('')
      .match(ve),
    k = [];
  for (v = 0; v < T.length; v++) {
    var x = T[v];
    !d.useAdditionalWeekYearTokens && st(x) && ct(x), !d.useAdditionalDayOfYearTokens && ut(x) && ct(x);
    var M = x[0],
      C = pe[M];
    if (C) {
      var D = C.incompatibleTokens;
      if (Array.isArray(D)) {
        for (var P = void 0, S = 0; S < k.length; S++) {
          var Y = k[S].token;
          if (-1 !== D.indexOf(Y) || Y === M) {
            P = k[S];
            break;
          }
        }
        if (P) throw new RangeError("The format string mustn't contain `".concat(P.fullToken, '` and `').concat(x, '` at the same time'));
      } else if ('*' === C.incompatibleTokens && k.length)
        throw new RangeError("The format string mustn't contain `".concat(x, '` and any other token at the same time'));
      k.push({ token: M, fullToken: x });
      var E = C.parse(s, x, l.match, b);
      if (!E) return new Date(NaN);
      y.push({ priority: C.priority, set: C.set, validate: C.validate, value: E.value, index: y.length }), (s = E.rest);
    } else {
      if (M.match(xe)) throw new RangeError('Format string contains an unescaped latin alphabet character `' + M + '`');
      if (("''" === x ? (x = "'") : "'" === M && (x = De(x)), 0 !== s.indexOf(x))) return new Date(NaN);
      s = s.slice(x.length);
    }
  }
  if (s.length > 0 && ke.test(s)) return new Date(NaN);
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
  var H = U(q, u(q)),
    W = {};
  for (v = 0; v < N.length; v++) {
    var X = N[v];
    if (X.validate && !X.validate(H, X.value, b)) return new Date(NaN);
    var O = X.set(H, W, X.value, b);
    O[0] ? ((H = O[0]), pt(W, O[1])) : (H = O);
  }
  return H;
}
function Ce(t, e) {
  if (e.timestampIsSet) return t;
  var n = new Date(0);
  return (
    n.setFullYear(t.getUTCFullYear(), t.getUTCMonth(), t.getUTCDate()),
    n.setHours(t.getUTCHours(), t.getUTCMinutes(), t.getUTCSeconds(), t.getUTCMilliseconds()),
    n
  );
}
function De(t) {
  return t.match(ye)[1].replace(Te, "'");
}
var je = { dateTimeDelimiter: /[T ]/, timeZoneDelimiter: /[Z ]/i, timezone: /([Z+-].*)$/ },
  Ue = /^-?(?:(\d{3})|(\d{2})(?:-?(\d{2}))?|W(\d{2})(?:-?(\d{1}))?|)$/,
  Pe = /^(\d{2}(?:[.,]\d*)?)(?::?(\d{2}(?:[.,]\d*)?))?(?::?(\d{2}(?:[.,]\d*)?))?$/,
  Se = /^([+-])(\d{2})(?::?(\d{2}))?$/;
function Ye(n, r) {
  e(1, arguments);
  var a = r || {},
    o = null == a.additionalDigits ? 2 : t(a.additionalDigits);
  if (2 !== o && 1 !== o && 0 !== o) throw new RangeError('additionalDigits must be 0, 1 or 2');
  if ('string' != typeof n && '[object String]' !== Object.prototype.toString.call(n)) return new Date(NaN);
  var i,
    u = Ee(n);
  if (u.date) {
    var s = Ne(u.date, o);
    i = qe(s.restDateString, s.year);
  }
  if (isNaN(i) || !i) return new Date(NaN);
  var c,
    d = i.getTime(),
    l = 0;
  if (u.time && ((l = We(u.time)), isNaN(l) || null === l)) return new Date(NaN);
  if (!u.timezone) {
    var f = new Date(d + l),
      m = new Date(f.getUTCFullYear(), f.getUTCMonth(), f.getUTCDate(), f.getUTCHours(), f.getUTCMinutes(), f.getUTCSeconds(), f.getUTCMilliseconds());
    return m.setFullYear(f.getUTCFullYear()), m;
  }
  return (c = Oe(u.timezone)), isNaN(c) ? new Date(NaN) : new Date(d + l + c);
}
function Ee(t) {
  var e,
    n = {},
    r = t.split(je.dateTimeDelimiter);
  if (
    (/:/.test(r[0])
      ? ((n.date = null), (e = r[0]))
      : ((n.date = r[0]),
        (e = r[1]),
        je.timeZoneDelimiter.test(n.date) && ((n.date = t.split(je.timeZoneDelimiter)[0]), (e = t.substr(n.date.length, t.length)))),
    e)
  ) {
    var a = je.timezone.exec(e);
    a ? ((n.time = e.replace(a[1], '')), (n.timezone = a[1])) : (n.time = e);
  }
  return n;
}
function Ne(t, e) {
  var n = new RegExp('^(?:(\\d{4}|[+-]\\d{' + (4 + e) + '})|(\\d{2}|[+-]\\d{' + (2 + e) + '})$)'),
    r = t.match(n);
  if (!r) return { year: null };
  var a = r[1] && parseInt(r[1]),
    o = r[2] && parseInt(r[2]);
  return { year: null == o ? a : 100 * o, restDateString: t.slice((r[1] || r[2]).length) };
}
function qe(t, e) {
  if (null === e) return null;
  var n = t.match(Ue);
  if (!n) return null;
  var r = !!n[4],
    a = He(n[1]),
    o = He(n[2]) - 1,
    i = He(n[3]),
    u = He(n[4]),
    s = He(n[5]) - 1;
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
    return e >= 0 && e <= 11 && n >= 1 && n <= (ze[e] || (Le(t) ? 29 : 28));
  })(e, o, i) &&
    (function(t, e) {
      return e >= 1 && e <= (Le(t) ? 366 : 365);
    })(e, a)
    ? (c.setUTCFullYear(e, o, Math.max(a, i)), c)
    : new Date(NaN);
}
function He(t) {
  return t ? parseInt(t) : 1;
}
function We(t) {
  var e = t.match(Pe);
  if (!e) return null;
  var n = Xe(e[1]),
    r = Xe(e[2]),
    a = Xe(e[3]);
  return (function(t, e, n) {
    if (24 === t) return 0 === e && 0 === n;
    return n >= 0 && n < 60 && e >= 0 && e < 60 && t >= 0 && t < 25;
  })(n, r, a)
    ? 36e5 * n + 6e4 * r + 1e3 * a
    : NaN;
}
function Xe(t) {
  return (t && parseFloat(t.replace(',', '.'))) || 0;
}
function Oe(t) {
  if ('Z' === t) return 0;
  var e = t.match(Se);
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
var ze = [31, null, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
function Le(t) {
  return t % 400 == 0 || (t % 4 == 0 && t % 100);
}
function Qe(n, r) {
  e(2, arguments);
  var a = t(r);
  return o(n, -a);
}
function Re(n, r) {
  e(2, arguments);
  var a = t(r);
  return d(n, -a);
}
function Fe(n, r) {
  e(2, arguments);
  var a = t(r);
  return l(n, -a);
}
var Ie = {
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
  Be = {
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
  Ge = {
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
var Ae = {
    date: T({ formats: { full: 'EEEE, dd. MMMM y', long: 'dd. MMMM y', medium: 'd. MMM y', short: 'd. MM. yy' }, defaultWidth: 'full' }),
    time: T({ formats: { full: 'HH:mm:ss zzzz', long: 'HH:mm:ss z', medium: 'HH:mm:ss', short: 'HH:mm' }, defaultWidth: 'full' }),
    dateTime: T({
      formats: { full: '{{date}} {{time}}', long: '{{date}} {{time}}', medium: '{{date}} {{time}}', short: '{{date}} {{time}}' },
      defaultWidth: 'full'
    })
  },
  Ze = {
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
var Ke = {
  code: 'sl',
  formatDistance: function(t, e, n) {
    var r = Ie,
      a = '';
    if (((n = n || {}).addSuffix && (n.comparison > 0 ? ((r = Ge), (a += 'čez ')) : ((r = Be), (a += 'pred '))), 'string' == typeof r[t])) a += r[t];
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
  formatLong: Ae,
  formatRelative: function(t, e, n, r) {
    var a = Ze[t];
    return 'function' == typeof a ? a(e) : a;
  },
  localize: {
    ordinalNumber: function(t) {
      var e = Number(t);
      return String(e).concat('.');
    },
    era: M({
      values: { narrow: ['pr. n. št.', 'po n. št.'], abbreviated: ['pr. n. št.', 'po n. št.'], wide: ['pred našim štetjem', 'po našem štetju'] },
      defaultWidth: 'wide'
    }),
    quarter: M({
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
    month: M({
      values: {
        narrow: ['j', 'f', 'm', 'a', 'm', 'j', 'j', 'a', 's', 'o', 'n', 'd'],
        abbreviated: ['jan.', 'feb.', 'mar.', 'apr.', 'maj', 'jun.', 'jul.', 'avg.', 'sep.', 'okt.', 'nov.', 'dec.'],
        wide: ['januar', 'februar', 'marec', 'april', 'maj', 'junij', 'julij', 'avgust', 'september', 'oktober', 'november', 'december']
      },
      defaultWidth: 'wide'
    }),
    day: M({
      values: {
        narrow: ['n', 'p', 't', 's', 'č', 'p', 's'],
        short: ['ned.', 'pon.', 'tor.', 'sre.', 'čet.', 'pet.', 'sob.'],
        abbreviated: ['ned.', 'pon.', 'tor.', 'sre.', 'čet.', 'pet.', 'sob.'],
        wide: ['nedelja', 'ponedeljek', 'torek', 'sreda', 'četrtek', 'petek', 'sobota']
      },
      defaultWidth: 'wide'
    }),
    dayPeriod: M({
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
    ordinalNumber: C({
      matchPattern: /^(\d+)\./i,
      parsePattern: /\d+/i,
      valueCallback: function(t) {
        return parseInt(t, 10);
      }
    }),
    era: D({
      matchPatterns: {
        abbreviated: /^(pr\. n\. št\.|po n\. št\.)/i,
        wide: /^(pred Kristusom|pred na[sš]im [sš]tetjem|po Kristusu|po na[sš]em [sš]tetju|na[sš]ega [sš]tetja)/i
      },
      defaultMatchWidth: 'wide',
      parsePatterns: { any: [/^pr/i, /^(po|na[sš]em)/i] },
      defaultParseWidth: 'any'
    }),
    quarter: D({
      matchPatterns: { narrow: /^[1234]/i, abbreviated: /^[1234]\.\s?[čc]et\.?/i, wide: /^[1234]\. [čc]etrtletje/i },
      defaultMatchWidth: 'wide',
      parsePatterns: { any: [/1/i, /2/i, /3/i, /4/i] },
      defaultParseWidth: 'any',
      valueCallback: function(t) {
        return t + 1;
      }
    }),
    month: D({
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
    day: D({
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
    dayPeriod: D({
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
  a as addMilliseconds,
  d as addMinutes,
  l as addSeconds,
  c as differenceInCalendarDays,
  g as differenceInMilliseconds,
  p as differenceInMinutes,
  b as differenceInSeconds,
  wt as format,
  bt as formatDistance,
  Tt as formatDistanceToNow,
  kt as formatDistanceToNowStrict,
  xt as formatISO,
  Mt as isAfter,
  Ct as isBefore,
  Dt as isEqual,
  h as isSameDay,
  Ut as isSameHour,
  St as isSameMinute,
  Et as isSameSecond,
  Nt as isToday,
  qt as isTomorrow,
  Ke as localeSL,
  Me as parse,
  Ye as parseISO,
  Ht as subDays,
  Qe as subHours,
  U as subMilliseconds,
  Re as subMinutes,
  Fe as subSeconds
};
