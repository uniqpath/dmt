var app = (function () {
    'use strict';

    /*  ------------------------------------------------------------------------ */

    var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

    var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    var O = Object;

    /*  See https://misc.flogisoft.com/bash/tip_colors_and_formatting
        ------------------------------------------------------------------------ */

    var colorCodes = ['black', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'lightGray', '', 'default'],
        colorCodesLight = ['darkGray', 'lightRed', 'lightGreen', 'lightYellow', 'lightBlue', 'lightMagenta', 'lightCyan', 'white', ''],
        styleCodes = ['', 'bright', 'dim', 'italic', 'underline', '', '', 'inverse'],
        asBright = { 'red': 'lightRed',
        'green': 'lightGreen',
        'yellow': 'lightYellow',
        'blue': 'lightBlue',
        'magenta': 'lightMagenta',
        'cyan': 'lightCyan',
        'black': 'darkGray',
        'lightGray': 'white' },
        types = { 0: 'style',
        2: 'unstyle',
        3: 'color',
        9: 'colorLight',
        4: 'bgColor',
        10: 'bgColorLight' },
        subtypes = { color: colorCodes,
        colorLight: colorCodesLight,
        bgColor: colorCodes,
        bgColorLight: colorCodesLight,
        style: styleCodes,
        unstyle: styleCodes

        /*  ------------------------------------------------------------------------ */

    };var clean = function clean(obj) {
        for (var k in obj) {
            if (!obj[k]) {
                delete obj[k];
            }
        }
        return O.keys(obj).length === 0 ? undefined : obj;
    };

    /*  ------------------------------------------------------------------------ */

    var Color = function () {
        function Color(background, name, brightness) {
            _classCallCheck(this, Color);

            this.background = background;
            this.name = name;
            this.brightness = brightness;
        }

        _createClass(Color, [{
            key: 'defaultBrightness',
            value: function defaultBrightness(value) {

                return new Color(this.background, this.name, this.brightness || value);
            }
        }, {
            key: 'css',
            value: function css(inverted) {

                var color = inverted ? this.inverse : this;

                var rgbName = color.brightness === Code.bright && asBright[color.name] || color.name;

                var prop = color.background ? 'background:' : 'color:',
                    rgb = Colors.rgb[rgbName],
                    alpha = this.brightness === Code.dim ? 0.5 : 1;

                return rgb ? prop + 'rgba(' + [].concat(_toConsumableArray(rgb), [alpha]).join(',') + ');' : !color.background && alpha < 1 ? 'color:rgba(0,0,0,0.5);' : ''; // Chrome does not support 'opacity' property...
            }
        }, {
            key: 'inverse',
            get: function get() {
                return new Color(!this.background, this.name || (this.background ? 'black' : 'white'), this.brightness);
            }
        }, {
            key: 'clean',
            get: function get() {
                return clean({ name: this.name === 'default' ? '' : this.name,
                    bright: this.brightness === Code.bright,
                    dim: this.brightness === Code.dim });
            }
        }]);

        return Color;
    }();

    /*  ------------------------------------------------------------------------ */

    var Code = function () {
        function Code(n) {
            _classCallCheck(this, Code);

            if (n !== undefined) {
                this.value = Number(n);
            }
        }

        _createClass(Code, [{
            key: 'type',
            get: function get() {
                return types[Math.floor(this.value / 10)];
            }
        }, {
            key: 'subtype',
            get: function get() {
                return subtypes[this.type][this.value % 10];
            }
        }, {
            key: 'str',
            get: function get() {
                return this.value ? '\x1B[' + this.value + 'm' : '';
            }
        }, {
            key: 'isBrightness',
            get: function get() {
                return this.value === Code.noBrightness || this.value === Code.bright || this.value === Code.dim;
            }
        }], [{
            key: 'str',
            value: function str(x) {
                return new Code(x).str;
            }
        }]);

        return Code;
    }();

    /*  ------------------------------------------------------------------------ */

    O.assign(Code, {

        reset: 0,
        bright: 1,
        dim: 2,
        inverse: 7,
        noBrightness: 22,
        noItalic: 23,
        noUnderline: 24,
        noInverse: 27,
        noColor: 39,
        noBgColor: 49
    });

    /*  ------------------------------------------------------------------------ */

    var replaceAll = function replaceAll(str, a, b) {
        return str.split(a).join(b);
    };

    /*  ANSI brightness codes do not overlap, e.g. "{bright}{dim}foo" will be rendered bright (not dim).
        So we fix it by adding brightness canceling before each brightness code, so the former example gets
        converted to "{noBrightness}{bright}{noBrightness}{dim}foo" – this way it gets rendered as expected.
     */

    var denormalizeBrightness = function denormalizeBrightness(s) {
        return s.replace(/(\u001b\[(1|2)m)/g, '\x1B[22m$1');
    };
    var normalizeBrightness = function normalizeBrightness(s) {
        return s.replace(/\u001b\[22m(\u001b\[(1|2)m)/g, '$1');
    };

    var wrap = function wrap(x, openCode, closeCode) {

        var open = Code.str(openCode),
            close = Code.str(closeCode);

        return String(x).split('\n').map(function (line) {
            return denormalizeBrightness(open + replaceAll(normalizeBrightness(line), close, open) + close);
        }).join('\n');
    };

    /*  ------------------------------------------------------------------------ */

    var camel = function camel(a, b) {
        return a + b.charAt(0).toUpperCase() + b.slice(1);
    };

    var stringWrappingMethods = function () {
        return [].concat(_toConsumableArray(colorCodes.map(function (k, i) {
            return !k ? [] : [// color methods

            [k, 30 + i, Code.noColor], [camel('bg', k), 40 + i, Code.noBgColor]];
        })), _toConsumableArray(colorCodesLight.map(function (k, i) {
            return !k ? [] : [// light color methods

            [k, 90 + i, Code.noColor], [camel('bg', k), 100 + i, Code.noBgColor]];
        })), _toConsumableArray(['', 'BrightRed', 'BrightGreen', 'BrightYellow', 'BrightBlue', 'BrightMagenta', 'BrightCyan'].map(function (k, i) {
            return !k ? [] : [['bg' + k, 100 + i, Code.noBgColor]];
        })), _toConsumableArray(styleCodes.map(function (k, i) {
            return !k ? [] : [// style methods

            [k, i, k === 'bright' || k === 'dim' ? Code.noBrightness : 20 + i]];
        }))).reduce(function (a, b) {
            return a.concat(b);
        });
    }();

    /*  ------------------------------------------------------------------------ */

    var assignStringWrappingAPI = function assignStringWrappingAPI(target) {
        var wrapBefore = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : target;
        return stringWrappingMethods.reduce(function (memo, _ref) {
            var _ref2 = _slicedToArray(_ref, 3),
                k = _ref2[0],
                open = _ref2[1],
                close = _ref2[2];

            return O.defineProperty(memo, k, {
                get: function get() {
                    return assignStringWrappingAPI(function (str) {
                        return wrapBefore(wrap(str, open, close));
                    });
                }
            });
        }, target);
    };

    /*  ------------------------------------------------------------------------ */

    var TEXT = 0,
        BRACKET = 1,
        CODE = 2;

    function rawParse(s) {

        var state = TEXT,
            buffer = '',
            text = '',
            code = '',
            codes = [];
        var spans = [];

        for (var i = 0, n = s.length; i < n; i++) {

            var c = s[i];

            buffer += c;

            switch (state) {

                case TEXT:
                    if (c === '\x1B') {
                        state = BRACKET;buffer = c;
                    } else {
                        text += c;
                    }
                    break;

                case BRACKET:
                    if (c === '[') {
                        state = CODE;code = '';codes = [];
                    } else {
                        state = TEXT;text += buffer;
                    }
                    break;

                case CODE:

                    if (c >= '0' && c <= '9') {
                        code += c;
                    } else if (c === ';') {
                        codes.push(new Code(code));code = '';
                    } else if (c === 'm' && code.length) {
                        codes.push(new Code(code));
                        var _iteratorNormalCompletion = true;
                        var _didIteratorError = false;
                        var _iteratorError = undefined;

                        try {
                            for (var _iterator = codes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                                var _code = _step.value;
                                spans.push({ text: text, code: _code });text = '';
                            }
                        } catch (err) {
                            _didIteratorError = true;
                            _iteratorError = err;
                        } finally {
                            try {
                                if (!_iteratorNormalCompletion && _iterator.return) {
                                    _iterator.return();
                                }
                            } finally {
                                if (_didIteratorError) {
                                    throw _iteratorError;
                                }
                            }
                        }

                        state = TEXT;
                    } else {
                        state = TEXT;text += buffer;
                    }
            }
        }

        if (state !== TEXT) text += buffer;

        if (text) spans.push({ text: text, code: new Code() });

        return spans;
    }

    /*  ------------------------------------------------------------------------ */

    /**
     * Represents an ANSI-escaped string.
     */

    var Colors = function () {

        /**
         * @param {string} s a string containing ANSI escape codes.
         */
        function Colors(s) {
            _classCallCheck(this, Colors);

            this.spans = s ? rawParse(s) : [];
        }

        _createClass(Colors, [{
            key: Symbol.iterator,


            /**
             * @example
             * const spans = [...ansi.parse ('\u001b[7m\u001b[7mfoo\u001b[7mbar\u001b[27m')]
             */
            value: function value() {
                return this.spans[Symbol.iterator]();
            }

            /**
             * @desc This allows an alternative import style, see https://github.com/xpl/ansicolor/issues/7#issuecomment-578923578
             * @example
             * import { ansicolor, ParsedSpan } from 'ansicolor'
             */

        }, {
            key: 'str',
            get: function get() {
                return this.spans.reduce(function (str, p) {
                    return str + p.text + p.code.str;
                }, '');
            }
        }, {
            key: 'parsed',
            get: function get() {

                var color = void 0,
                    bgColor = void 0,
                    brightness = void 0,
                    styles = void 0;

                function reset() {

                    color = new Color(), bgColor = new Color(true /* background */), brightness = undefined, styles = new Set();
                }

                reset();

                return O.assign(new Colors(), {

                    spans: this.spans.map(function (span) {

                        var c = span.code;

                        var inverted = styles.has('inverse'),
                            underline = styles.has('underline') ? 'text-decoration: underline;' : '',
                            italic = styles.has('italic') ? 'font-style: italic;' : '',
                            bold = brightness === Code.bright ? 'font-weight: bold;' : '';

                        var foreColor = color.defaultBrightness(brightness);

                        var styledSpan = O.assign({ css: bold + italic + underline + foreColor.css(inverted) + bgColor.css(inverted) }, clean({ bold: !!bold, color: foreColor.clean, bgColor: bgColor.clean }), span);

                        var _iteratorNormalCompletion2 = true;
                        var _didIteratorError2 = false;
                        var _iteratorError2 = undefined;

                        try {
                            for (var _iterator2 = styles[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                                var k = _step2.value;
                                styledSpan[k] = true;
                            }
                        } catch (err) {
                            _didIteratorError2 = true;
                            _iteratorError2 = err;
                        } finally {
                            try {
                                if (!_iteratorNormalCompletion2 && _iterator2.return) {
                                    _iterator2.return();
                                }
                            } finally {
                                if (_didIteratorError2) {
                                    throw _iteratorError2;
                                }
                            }
                        }

                        if (c.isBrightness) {

                            brightness = c.value;
                        } else if (span.code.value !== undefined) {

                            if (span.code.value === Code.reset) {
                                reset();
                            } else {

                                switch (span.code.type) {

                                    case 'color':
                                    case 'colorLight':
                                        color = new Color(false, c.subtype);break;

                                    case 'bgColor':
                                    case 'bgColorLight':
                                        bgColor = new Color(true, c.subtype);break;

                                    case 'style':
                                        styles.add(c.subtype);break;
                                    case 'unstyle':
                                        styles.delete(c.subtype);break;
                                }
                            }
                        }

                        return styledSpan;
                    }).filter(function (s) {
                        return s.text.length > 0;
                    })
                });
            }

            /*  Outputs with Chrome DevTools-compatible format     */

        }, {
            key: 'asChromeConsoleLogArguments',
            get: function get() {

                var spans = this.parsed.spans;

                return [spans.map(function (s) {
                    return '%c' + s.text;
                }).join('')].concat(_toConsumableArray(spans.map(function (s) {
                    return s.css;
                })));
            }
        }, {
            key: 'browserConsoleArguments',
            get: function get() /* LEGACY, DEPRECATED */{
                return this.asChromeConsoleLogArguments;
            }

            /**
             * @desc installs String prototype extensions
             * @example
             * require ('ansicolor').nice
             * console.log ('foo'.bright.red)
             */

        }], [{
            key: 'parse',


            /**
             * @desc parses a string containing ANSI escape codes
             * @return {Colors} parsed representation.
             */
            value: function parse(s) {
                return new Colors(s).parsed;
            }

            /**
             * @desc strips ANSI codes from a string
             * @param {string} s a string containing ANSI escape codes.
             * @return {string} clean string.
             */

        }, {
            key: 'strip',
            value: function strip(s) {
                return s.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-PRZcf-nqry=><]/g, ''); // hope V8 caches the regexp
            }
        }, {
            key: 'nice',
            get: function get() {

                Colors.names.forEach(function (k) {
                    if (!(k in String.prototype)) {
                        O.defineProperty(String.prototype, k, { get: function get() {
                                return Colors[k](this);
                            } });
                    }
                });

                return Colors;
            }
        }, {
            key: 'ansicolor',
            get: function get() {
                return Colors;
            }
        }]);

        return Colors;
    }();

    /*  ------------------------------------------------------------------------ */

    assignStringWrappingAPI(Colors, function (str) {
        return str;
    });

    /*  ------------------------------------------------------------------------ */

    Colors.names = stringWrappingMethods.map(function (_ref3) {
        var _ref4 = _slicedToArray(_ref3, 1),
            k = _ref4[0];

        return k;
    });

    /*  ------------------------------------------------------------------------ */

    Colors.rgb = {

        black: [0, 0, 0],
        darkGray: [100, 100, 100],
        lightGray: [200, 200, 200],
        white: [255, 255, 255],

        red: [204, 0, 0],
        lightRed: [255, 51, 0],

        green: [0, 204, 0],
        lightGreen: [51, 204, 51],

        yellow: [204, 102, 0],
        lightYellow: [255, 153, 51],

        blue: [0, 0, 255],
        lightBlue: [26, 140, 255],

        magenta: [204, 0, 204],
        lightMagenta: [255, 0, 255],

        cyan: [0, 153, 255],
        lightCyan: [0, 204, 255]

        /*  ------------------------------------------------------------------------ */

    };var ansicolor = Colors;

    // --- DMT DEF DUPLICATED --- start

    function constructTryer(obj) {
      return accessor => {
        let current = obj;

        for (const nextKey of accessor.split('.')) {
          // support square barcket syntax for matching by id inside lists, like:
          // dmt.userDefaults().try('service["search"].clientResultsPerPage')
          const re = new RegExp(/(\S*)\[['"]?(\S*?)['"]?\]/);
          const matches = nextKey.match(re);
          if (matches) {
            const nextDict = matches[1];
            const _nextKey = matches[2];
            current = listify(current[nextDict]).find(el => id(el) == _nextKey);
          } else {
            current = current[nextKey];
          }

          if (typeof current == 'undefined') {
            return undefined;
          }
        }

        return current;
      };
    }

    function tryOnTheFly(obj, accessor) {
      return constructTryer(obj)(accessor);
    }

    function makeTryable(obj) {
      if (!obj) {
        obj = {};
      }

      obj.try = constructTryer(obj);

      return obj;
    }

    function id(obj) {
      return values(obj)[0];
    }

    function values(obj) {
      return listify(obj).map(el => el.id);
    }

    function listify(obj) {
      if (typeof obj == 'undefined' || obj == null) {
        return [];
      }
      if (Array.isArray(obj)) {
        return obj;
      }
      if (typeof obj == 'string') {
        return [{ id: obj }];
      }
      return [obj];
    }

    // --- DMT DEF DUPLICATED --- end

    var def = { makeTryable, tryOnTheFly, id, values, listify };

    class CssBridge {
      // cities/Monaco1.jpg
      setWallpaper(wallpaperSubPath) {
        if (!wallpaperSubPath) {
          document.body.style.backgroundImage = '';
        } else if (wallpaperSubPath.startsWith('/')) {
          document.body.style.backgroundImage = `url('${wallpaperSubPath}')`;
        }
      }

      setBodyClass(className) {
        const body = document.getElementsByTagName('body')[0];
        body.className = className;
      }
    }

    var css = new CssBridge();

    function log(msg) {
      console.log(`${new Date().toLocaleString()} → ${msg}`);
    }

    function isInputElementActive() {
      const { activeElement } = document;
      const inputs = ['input', 'select', 'textarea']; //'button'

      if (activeElement && inputs.indexOf(activeElement.tagName.toLowerCase()) !== -1) {
        return true;
      }
    }

    log.write = log; // nodejs compatibility in connect.js

    function dir(msg) {
      console.log(`${new Date().toLocaleString()} → ${JSON.stringify(msg, null, 2)}`);
    }

    function pad(number, digits = 2) {
      return Array(Math.max(digits - String(number).length + 1, 0)).join(0) + number;
    }

    function getDisplayTime(date) {
      return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
    }

    function unique(items) {
      return [...new Set(items)];
    }

    function setWallpaper(wallpaper) {
      if (wallpaper) {
        css.setWallpaper(wallpaper);
      } else {
        css.setWallpaper('');
      }
    }

    // source: https://www.sitepoint.com/sort-an-array-of-objects-in-javascript/
    // usage:
    // array is sorted by band, in ascending order by default
    // singers.sort(compareValues('band'));
    // array is sorted by band in descending order
    // singers.sort(compareValues('band', 'desc'));
    // array is sorted by name in ascending order
    // singers.sort(compareValues('name'));
    function compareValues(key, order = 'asc') {
      return function innerSort(a, b) {
        if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
          // property doesn't exist on either object
          return 0;
        }

        const varA = typeof a[key] === 'string' ? a[key].toUpperCase() : a[key];
        const varB = typeof b[key] === 'string' ? b[key].toUpperCase() : b[key];

        let comparison = 0;
        if (varA > varB) {
          comparison = 1;
        } else if (varA < varB) {
          comparison = -1;
        }
        return order === 'desc' ? comparison * -1 : comparison;
      };
    }

    function mapTempToHUE(temp) {
      const percent = 50 - temp;
      //console.log(Math.round((360 * percent) / 100.0)); // original formula, too simple, adjusted is much better (nicer colors for each temperature)
      return Math.round((270 * percent) / 100.0 + (temp < -10 ? 65 : temp > 20 ? 35 : 60)); // 100 + X is a rotation of the wheel, we could do it 50 fixed for example but it was determined to be even better if this varies for certain temperature ranges...
    }

    function accessProperty(obj, acc) {
      return def.tryOnTheFly(obj, acc);
    }

    function msIntoTimeSpan(timeInMs, index = 0, result = {}) {
      const times = ['day', 'h', 'min', 's'];
      const arr = [24, 60, 60, 1000];

      if (index == times.length) {
        result['ms'] = timeInMs;
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
            // show seconds only if time is under a minute
            str = `${str} ${ts[t]} ${t}`;
          }
        }
      }

      return str.trim();
    }

    function songTime(s) {
      s = Math.round(s);
      const hours = Math.floor(s / 3600);
      const rem = s % 3600;
      const min = Math.floor(rem / 60);
      s = rem % 60;

      return hours ? `${hours}h ${pad(min)}min ${pad(s)}s` : `${min}:${pad(s)}`;
    }

    function colorJSON(json) {
      if (typeof json != 'string') {
        json = JSON.stringify(json, undefined, 2);
      }
      json = json
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function(match) {
        var cls = 'number';
        var color = 'yellow';
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = 'key';
            color = 'cyan';
          } else {
            cls = 'string';
            color = '#66F62A';
          }
        } else if (/true|false/.test(match)) {
          cls = 'boolean';
          color = 'orange';
        } else if (/null/.test(match)) {
          cls = 'null';
          color = 'red';
        }
        //return {cls, text: match};
        return `<span style="color: ${color}" class="${cls}">${match}</span>`;
      });
    }

    // Uint8Array to string in Javascript
    // https://stackoverflow.com/a/22373197
    function Utf8ArrayToStr(array) {
      let out;
      let i;
      let c;
      let char2;
      let char3;

      out = '';

      const len = array.length;

      i = 0;

      while (i < len) {
        c = array[i++];

        switch (c >> 4) {
          case 0:
          case 1:
          case 2:
          case 3:
          case 4:
          case 5:
          case 6:
          case 7:
            // 0xxxxxxx
            out += String.fromCharCode(c);
            break;
          case 12:
          case 13:
            // 110x xxxx   10xx xxxx
            char2 = array[i++];
            out += String.fromCharCode(((c & 0x1f) << 6) | (char2 & 0x3f));
            break;
          case 14:
            // 1110 xxxx  10xx xxxx  10xx xxxx
            char2 = array[i++];
            char3 = array[i++];
            out += String.fromCharCode(((c & 0x0f) << 12) | ((char2 & 0x3f) << 6) | ((char3 & 0x3f) << 0));
            break;
        }
      }

      return out;
    }

    function listify$1(obj) {
      if (typeof obj == 'undefined' || obj == null) {
        return [];
      }
      return Array.isArray(obj) ? obj : [obj];
    }

    function bufferToHex(buffer) {
      return Array.from(new Uint8Array(buffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
    }

    function hexToBuffer(hex) {
      const tokens = hex.match(/.{1,2}(?=(.{2})+(?!.))|.{1,2}$/g); // split by two, https://blog.abelotech.com/posts/split-string-tokens-defined-length-javascript/
      return new Uint8Array(tokens.map(token => parseInt(token, 16)));
    }

    function getAllFuncs(obj) {
      return Object.getOwnPropertyNames(obj.prototype).filter(prop => prop != 'constructor' && typeof obj.prototype[prop] == 'function');
    }

    // like this: https://stackoverflow.com/a/62142995/458177 -- but iterating over functions didn't work
    function includeModule(obj, Module) {
      const module = new Module();

      for (const func of getAllFuncs(Module)) {
        obj[func] = module[func]; //.bind(obj);
      }
    }

    var util = {
      log,
      dir,
      pad,
      getDisplayTime,
      unique,
      setWallpaper,
      compareValues,
      accessProperty,
      mapTempToHUE,
      msIntoTimeSpan,
      humanTime,
      songTime,
      colorJSON,
      Utf8ArrayToStr,
      isInputElementActive,
      listify: listify$1,
      bufferToHex,
      hexToBuffer,
      includeModule
    };

    function noop() {}

    class RunnableLink {
      constructor(prev, next, fn) {
        this.prev = prev;
        this.next = next;
        this.fn = fn || noop;
      }

      run(data) {
        this.fn(data);
        this.next && this.next.run(data);
      }
    }

    // A relatively generic LinkedList impl
    class LinkedList {
      constructor(linkConstructor) {
        this.head = new RunnableLink();
        this.tail = new RunnableLink(this.head);
        this.head.next = this.tail;
        this.linkConstructor = linkConstructor;
        this.reg = {};
      }

      insert(data) {
        const link = new RunnableLink(this.tail.prev, this.tail, data);
        link.next.prev = link;
        link.prev.next = link;
        return link;
      }

      remove(link) {
        link.prev.next = link.next;
        link.next.prev = link.prev;
      }
    }

    let id$1 = 0;
    const splitter = /[\s,]+/g;

    // A link in the linked list which allows
    // for efficient execution of the callbacks

    class Eev {
      constructor() {
        this.events = {};
      }

      on(names, fn) {
        const me = this;

        names.split(splitter).forEach(name => {
          const list = me.events[name] || (me.events[name] = new LinkedList());
          const eev = fn._eev || (fn._eev = ++id$1);

          list.reg[eev] || (list.reg[eev] = list.insert(fn));
        });
      }

      off(names, fn) {
        const me = this;
        fn &&
          names.split(splitter).forEach(function(name) {
            const list = me.events[name];

            if (!list) {
              return;
            }

            const link = list.reg[fn._eev];

            list.reg[fn._eev] = undefined;

            list && link && list.remove(link);
          });
      }

      removeListener(...args) {
        this.off(...args);
      }

      emit(name, data) {
        const evt = this.events[name];
        evt && evt.head.run(data);
      }
    }

    function wrap$1(text, color) {
      return `<span style="color: ${color};">${text}</span>`;
    }

    function white(text) {
      return wrap$1(text, 'white');
    }

    function red(text) {
      return wrap$1(text, '#E34042');
    }

    function green(text) {
      return wrap$1(text, '#5FE02A');
    }

    function gray(text) {
      return wrap$1(text, '#C3C6C6');
    }

    function yellow(text) {
      return wrap$1(text, '#E5AE34');
    }

    function cyan(text) {
      return wrap$1(text, '#29B3BF');
    }

    function magenta(text) {
      return wrap$1(text, '#A144E9');
    }

    var colorsHTML = { white, red, green, gray, yellow, cyan, magenta };

    // Running on the page, in the browser
    // This API will go live in early 2020
    // It will be the only API available after a 6-week deprecation period

    function metaMaskInstalled() {
      return typeof ethereum != 'undefined' && ethereum.isMetaMask;
    }

    function getFirstAccount(accounts) {
      if (accounts.length > 0) {
        // console.log(`Accounts:`);
        // console.log(accounts);
        return accounts[0];
      }
    }

    /***********************************/
    /* Handle connecting, per EIP 1102 */
    /***********************************/

    // You should only attempt to connect in response to user interaction,
    // such as a button click. Otherwise, you're popup-spamming the user
    // like it's 1999.
    // If you can't retrieve the user's account(s), you should encourage the user
    // to initiate a connection attempt.
    //document.getElementById('connectButton', connect)

    function metamaskConnectWrapper(accountChangedCallback) {
      const connect = () => {
        return new Promise((success, reject) => {
          metamaskConnect()
            .then(accounts => {
              const acc = getFirstAccount(accounts);
              // not sure why does this happen and we ged undefined acc but it seems to happen ...
              // not sure what will we see in the interface now (logins still successful ?)
              if (acc) {
                accountChangedCallback(acc);
              } else {
                console.log('WARNING: received this from eth_requestAccounts, could not parse out a single account:');
                console.log(accounts);
                console.log('--------------------');
              }
            })
            .catch(reject);
        });
      };

      return connect;
    }

    function metamaskConnect() {
      return new Promise((success, reject) => {
        if (metaMaskInstalled()) {
          // This is equivalent to ethereum.enable()
          ethereum
            .send('eth_requestAccounts')
            .then(rpcResult => {
              success(rpcResult.result);
            })
            .catch(err => {
              if (err.code === 4001) {
                // EIP 1193 userRejectedRequest error
                reject(new Error('Please connect to MetaMask.'));
              } else {
                reject(err);
              }
            });
        } else {
          reject(new Error('Metamask not installed! Why was the connect button shown ?'));
        }
      });
    }

    // HACK --> REMOVE SOON, NOT ALWAYS WORKING
    const MAX_RETRIES = 20;

    function metamaskInit(accountChangedCallback = () => {}, { retryCount = MAX_RETRIES } = {}) {
      const retryInterval = 100; // 10 x 100ms = 1s ! more than enough for metamask to do it's magic!

      const first = retryCount == MAX_RETRIES;

      if (metaMaskInstalled()) {
        // 1) initial account detection on page load
        // recurse every 100ms max 10 times to see if ethereum address is known to us
        // UPS: We strongly discourage the use of this property, which may be removed in the future.
        // Ask developers: how to make sure ethereum.on('accountsChanged', handleAccountsChanged);
        // is cought early ... where to attach listener?? then we don't have to use this polling trick
        if (ethereum.selectedAddress) {
          console.log(`Success at ${MAX_RETRIES - retryCount}`);
          accountChangedCallback(ethereum.selectedAddress);
        } else if (retryCount > 0) {
          setTimeout(() => metamaskInit(accountChangedCallback, { retryCount: retryCount - 1 }), retryInterval);
        }

        if (first) {
          // initial function run
          // 2) attach handler for all future changes which are not related to manual user action (connect)
          // SPECIAL COMMENT:
          // // Note that this event is emitted on page load.
          // If the array of accounts is non-empty, you're already
          // connected.
          //
          // BUT we decide not to try catch initial event
          //   ethereum.on('accountsChanged', handleAccountsChanged);
          // because it's not reliable, we sometimes fail to attach this before it's fired..
          // we could do it in index.html but it would be ugly! We just use initial and effective "polling" (recurse this function)
          ethereum.on('accountsChanged', accounts => {
            // it seems that if not connected we still get this event but with empty value... we don't pass empty value on, dont have to call our handler because empty account is assumed initially outside of this script anyway
            const acc = getFirstAccount(accounts);
            if (acc) {
              accountChangedCallback(acc);
            }
          });
        }

        //console.log('METAMASK INSTALLED');

        // For now, 'eth_accounts' will continue to always return an array
        //ethereum.on('accountsChanged', handleAccountsChanged);
      } else {
        console.log('METAMASK INIT FAILED: not installed');
        return false;
      }

      // 3) handle user action (first account connect)
      return metamaskConnectWrapper(accountChangedCallback);
    }

    var metamask = /*#__PURE__*/Object.freeze({
        __proto__: null,
        metamaskInit: metamaskInit
    });

    function queryDifferentEnough({ searchQuery, prevQuery, searchMode, prevSearchMode }) {
      return normalizeQuery(searchQuery) != normalizeQuery(prevQuery) || searchMode != prevSearchMode;
    }

    function normalizeQuery(query) {
      return query ? query.trim().replace(/\s+/g, ' ') : query;
    }

    let prevQuery = '';
    let prevSearchMode;
    let executeQueryTimeout;
    const timeTags = []; // we can keep this growing (for now ?)  probably forever, todo: OPTIMIZE LATER and be careful when reassigning this array, learn more about event loops!

    const SEARCH_LAG_MS = 300; // 300 -- best value ->> if user presses the next key within this much from the last one, previous search query is cancelled

    function executeSearch({
      searchQuery,
      searchMode,
      remoteObject,
      remoteMethod,
      searchStatusCallback = () => {},
      searchDelay = SEARCH_LAG_MS,
      force,
      searchMetadata
    }) {
      return new Promise((success, reject) => {
        if (searchQuery.trim() == '') {
          timeTags.push(Date.now());

          if (prevQuery != '' || force) {
            clearTimeout(executeQueryTimeout);
            searchStatusCallback({ searching: false });

            if (force) {
              success(null); // don't ask :) okk... we need to have a way to initially show something based on if there were ever results... force is only
            } else {
              success([]); // empty result set
            }
          }

          prevQuery = searchQuery;
          prevSearchMode = searchMode;

          return;
        }

        try {
          // console.log('prevQuery:');
          // console.log(prevQuery);
          // console.log(`force: ${force}`);

          if (force || queryDifferentEnough({ searchQuery, prevQuery, searchMode, prevSearchMode })) {
            clearTimeout(executeQueryTimeout);

            searchStatusCallback({ searching: true });
            // if we called this from inside a timeout, there would be a gui lag. Now we report that we are searching even before we fire off search (while we wait for possible next user input)

            prevQuery = searchQuery;
            prevSearchMode = searchMode;

            executeQueryTimeout = setTimeout(() => {
              const timeTag = Date.now();
              timeTags.push(timeTag);

              console.log(`Search executed on remote object: ${searchQuery}`);

              // const searchOriginHost = window.location.host;
              // Object.assign(searchMetadata, { searchOriginHost });

              remoteObject
                .call(remoteMethod, { query: normalizeQuery(searchQuery), searchMode, searchMetadata })
                .then(searchResults => {
                  // console.log(`Search with timeTag ${timeTag} just returned ...`);

                  const lastTimeTag = timeTags[timeTags.length - 1];

                  if (timeTag == lastTimeTag) {
                    const noHits = searchResults.filter(response => response.error || response.results.length == 0).length == searchResults.length;

                    searchStatusCallback({ searching: false, noHits }); // searchResults && searchResults.length == 0 -- todo: fix this since we now return aggregate results
                    success(searchResults);
                  } else {
                    console.log('Discarding search result which came out of order because a more recent result is due ...');
                    // keep the promise pending --> does not matter in frontend ... nodejs would keep a reference count ..
                    // we only use this lib on GUI!
                  }
                  // timeTags.reduce((prevTimeTag, timeTag) => {
                  //   if (prevTimeTag != null) {
                  //     if (prevTimeTag > timeTag) {
                  //       console.log(`Problem!! Results for ${normalizeQuery(searchQuery)} came back out of order ${prevTimeTag} > ${timeTag}`);
                  //     }
                  //   }
                  //   return timeTag;
                  // }, null);
                })
                .catch(e => {
                  searchStatusCallback({ searching: false });

                  console.log('executeSearch ERROR:');
                  console.log(e);

                  reject(e);
                });
            }, searchDelay);
          }
        } catch (e) {
          console.log('This error should not happen: bug in dmt-js');
          searchStatusCallback({ searching: false });
          reject(e);
        }
      });
    }

    function noop$1() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop$1;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop$1,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop$1;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.29.0' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev("SvelteDOMSetProperty", { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* Users/david/.dmt/core/node/dmt-js/gui_components/Escape.svelte generated by Svelte v3.29.0 */

    const file = "Users/david/.dmt/core/node/dmt-js/gui_components/Escape.svelte";

    function create_fragment(ctx) {
    	let div;
    	let a;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			a = element("a");
    			img = element("img");
    			if (img.src !== (img_src_value = "/img/icons/home.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "svelte-1imf61r");
    			add_location(img, file, 7, 4, 113);
    			attr_dev(a, "href", "/apps");
    			add_location(a, file, 5, 2, 44);
    			attr_dev(div, "class", "escape svelte-1imf61r");
    			add_location(div, file, 4, 0, 21);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, a);
    			append_dev(a, img);
    		},
    		p: noop$1,
    		i: noop$1,
    		o: noop$1,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Escape", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Escape> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Escape extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Escape",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    // EXPERIMENTAL

    var dmtJS = /*#__PURE__*/Object.freeze({
        __proto__: null,
        executeSearch: executeSearch,
        Emitter: Eev,
        ansicolor: ansicolor,
        util: util,
        metamask: metamask,
        cssBridge: css,
        colorsHTML: colorsHTML,
        Escape: Escape
    });

    function noop$2() {}

    class RunnableLink$1 {
      constructor(prev, next, fn) {
        this.prev = prev;
        this.next = next;
        this.fn = fn || noop$2;
      }

      run(data) {
        this.fn(data);
        this.next && this.next.run(data);
      }
    }

    // A relatively generic LinkedList impl
    class LinkedList$1 {
      constructor(linkConstructor) {
        this.head = new RunnableLink$1();
        this.tail = new RunnableLink$1(this.head);
        this.head.next = this.tail;
        this.linkConstructor = linkConstructor;
        this.reg = {};
      }

      insert(data) {
        const link = new RunnableLink$1(this.tail.prev, this.tail, data);
        link.next.prev = link;
        link.prev.next = link;
        return link;
      }

      remove(link) {
        link.prev.next = link.next;
        link.next.prev = link.prev;
      }
    }

    let id$2 = 0;
    const splitter$1 = /[\s,]+/g;

    // A link in the linked list which allows
    // for efficient execution of the callbacks

    class Eev$1 {
      constructor() {
        this.__events_list = {};
      }

      on(names, fn) {
        names.split(splitter$1).forEach(name => {
          const list = this.__events_list[name] || (this.__events_list[name] = new LinkedList$1());
          const eev = fn._eev || (fn._eev = ++id$2);

          list.reg[eev] || (list.reg[eev] = list.insert(fn));
        });
      }

      off(names, fn) {
        fn &&
          names.split(splitter$1).forEach(name => {
            const list = this.__events_list[name];

            if (!list) {
              return;
            }

            const link = list.reg[fn._eev];

            list.reg[fn._eev] = undefined;

            list && link && list.remove(link);
          });
      }

      removeListener(...args) {
        this.off(...args);
      }

      emit(name, data) {
        const evt = this.__events_list[name];
        evt && evt.head.run(data);
      }
    }

    function log$1(msg) {
      console.log(`${new Date().toLocaleString()} → ${msg}`);
    }

    function listify$2(obj) {
      if (typeof obj == 'undefined' || obj == null) {
        return [];
      }
      return Array.isArray(obj) ? obj : [obj];
    }

    function bufferToHex$1(buffer) {
      return Array.from(new Uint8Array(buffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
    }

    function hexToBuffer$1(hex) {
      const tokens = hex.match(/.{1,2}(?=(.{2})+(?!.))|.{1,2}$/g); // split by two, https://blog.abelotech.com/posts/split-string-tokens-defined-length-javascript/
      return new Uint8Array(tokens.map(token => parseInt(token, 16)));
    }

    // source: https://stackoverflow.com/a/12965194/458177
    // good only up to 2**53 (JavaScript Integer range) -- usually this is plenty ...
    function integerToByteArray(/*long*/ long, arrayLen = 8) {
      // we want to represent the input as a 8-bytes array
      const byteArray = new Array(arrayLen).fill(0);

      for (let index = 0; index < byteArray.length; index++) {
        const byte = long & 0xff;
        byteArray[index] = byte;
        long = (long - byte) / 256;
      }

      return byteArray;
    }

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function getDefaultExportFromCjs (x) {
    	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
    }

    function createCommonjsModule(fn, basedir, module) {
    	return module = {
    		path: basedir,
    		exports: {},
    		require: function (path, base) {
    			return commonjsRequire(path, (base === undefined || base === null) ? module.path : base);
    		}
    	}, fn(module, module.exports), module.exports;
    }

    function getAugmentedNamespace(n) {
    	if (n.__esModule) return n;
    	var a = Object.defineProperty({}, '__esModule', {value: true});
    	Object.keys(n).forEach(function (k) {
    		var d = Object.getOwnPropertyDescriptor(n, k);
    		Object.defineProperty(a, k, d.get ? d : {
    			enumerable: true,
    			get: function () {
    				return n[k];
    			}
    		});
    	});
    	return a;
    }

    function commonjsRequire () {
    	throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
    }

    var _nodeResolve_empty = {};

    var _nodeResolve_empty$1 = /*#__PURE__*/Object.freeze({
        __proto__: null,
        'default': _nodeResolve_empty
    });

    var require$$0 = /*@__PURE__*/getAugmentedNamespace(_nodeResolve_empty$1);

    var naclFast = createCommonjsModule(function (module) {
    (function(nacl) {

    // Ported in 2014 by Dmitry Chestnykh and Devi Mandiri.
    // Public domain.
    //
    // Implementation derived from TweetNaCl version 20140427.
    // See for details: http://tweetnacl.cr.yp.to/

    var gf = function(init) {
      var i, r = new Float64Array(16);
      if (init) for (i = 0; i < init.length; i++) r[i] = init[i];
      return r;
    };

    //  Pluggable, initialized in high-level API below.
    var randombytes = function(/* x, n */) { throw new Error('no PRNG'); };

    var _0 = new Uint8Array(16);
    var _9 = new Uint8Array(32); _9[0] = 9;

    var gf0 = gf(),
        gf1 = gf([1]),
        _121665 = gf([0xdb41, 1]),
        D = gf([0x78a3, 0x1359, 0x4dca, 0x75eb, 0xd8ab, 0x4141, 0x0a4d, 0x0070, 0xe898, 0x7779, 0x4079, 0x8cc7, 0xfe73, 0x2b6f, 0x6cee, 0x5203]),
        D2 = gf([0xf159, 0x26b2, 0x9b94, 0xebd6, 0xb156, 0x8283, 0x149a, 0x00e0, 0xd130, 0xeef3, 0x80f2, 0x198e, 0xfce7, 0x56df, 0xd9dc, 0x2406]),
        X = gf([0xd51a, 0x8f25, 0x2d60, 0xc956, 0xa7b2, 0x9525, 0xc760, 0x692c, 0xdc5c, 0xfdd6, 0xe231, 0xc0a4, 0x53fe, 0xcd6e, 0x36d3, 0x2169]),
        Y = gf([0x6658, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666]),
        I = gf([0xa0b0, 0x4a0e, 0x1b27, 0xc4ee, 0xe478, 0xad2f, 0x1806, 0x2f43, 0xd7a7, 0x3dfb, 0x0099, 0x2b4d, 0xdf0b, 0x4fc1, 0x2480, 0x2b83]);

    function ts64(x, i, h, l) {
      x[i]   = (h >> 24) & 0xff;
      x[i+1] = (h >> 16) & 0xff;
      x[i+2] = (h >>  8) & 0xff;
      x[i+3] = h & 0xff;
      x[i+4] = (l >> 24)  & 0xff;
      x[i+5] = (l >> 16)  & 0xff;
      x[i+6] = (l >>  8)  & 0xff;
      x[i+7] = l & 0xff;
    }

    function vn(x, xi, y, yi, n) {
      var i,d = 0;
      for (i = 0; i < n; i++) d |= x[xi+i]^y[yi+i];
      return (1 & ((d - 1) >>> 8)) - 1;
    }

    function crypto_verify_16(x, xi, y, yi) {
      return vn(x,xi,y,yi,16);
    }

    function crypto_verify_32(x, xi, y, yi) {
      return vn(x,xi,y,yi,32);
    }

    function core_salsa20(o, p, k, c) {
      var j0  = c[ 0] & 0xff | (c[ 1] & 0xff)<<8 | (c[ 2] & 0xff)<<16 | (c[ 3] & 0xff)<<24,
          j1  = k[ 0] & 0xff | (k[ 1] & 0xff)<<8 | (k[ 2] & 0xff)<<16 | (k[ 3] & 0xff)<<24,
          j2  = k[ 4] & 0xff | (k[ 5] & 0xff)<<8 | (k[ 6] & 0xff)<<16 | (k[ 7] & 0xff)<<24,
          j3  = k[ 8] & 0xff | (k[ 9] & 0xff)<<8 | (k[10] & 0xff)<<16 | (k[11] & 0xff)<<24,
          j4  = k[12] & 0xff | (k[13] & 0xff)<<8 | (k[14] & 0xff)<<16 | (k[15] & 0xff)<<24,
          j5  = c[ 4] & 0xff | (c[ 5] & 0xff)<<8 | (c[ 6] & 0xff)<<16 | (c[ 7] & 0xff)<<24,
          j6  = p[ 0] & 0xff | (p[ 1] & 0xff)<<8 | (p[ 2] & 0xff)<<16 | (p[ 3] & 0xff)<<24,
          j7  = p[ 4] & 0xff | (p[ 5] & 0xff)<<8 | (p[ 6] & 0xff)<<16 | (p[ 7] & 0xff)<<24,
          j8  = p[ 8] & 0xff | (p[ 9] & 0xff)<<8 | (p[10] & 0xff)<<16 | (p[11] & 0xff)<<24,
          j9  = p[12] & 0xff | (p[13] & 0xff)<<8 | (p[14] & 0xff)<<16 | (p[15] & 0xff)<<24,
          j10 = c[ 8] & 0xff | (c[ 9] & 0xff)<<8 | (c[10] & 0xff)<<16 | (c[11] & 0xff)<<24,
          j11 = k[16] & 0xff | (k[17] & 0xff)<<8 | (k[18] & 0xff)<<16 | (k[19] & 0xff)<<24,
          j12 = k[20] & 0xff | (k[21] & 0xff)<<8 | (k[22] & 0xff)<<16 | (k[23] & 0xff)<<24,
          j13 = k[24] & 0xff | (k[25] & 0xff)<<8 | (k[26] & 0xff)<<16 | (k[27] & 0xff)<<24,
          j14 = k[28] & 0xff | (k[29] & 0xff)<<8 | (k[30] & 0xff)<<16 | (k[31] & 0xff)<<24,
          j15 = c[12] & 0xff | (c[13] & 0xff)<<8 | (c[14] & 0xff)<<16 | (c[15] & 0xff)<<24;

      var x0 = j0, x1 = j1, x2 = j2, x3 = j3, x4 = j4, x5 = j5, x6 = j6, x7 = j7,
          x8 = j8, x9 = j9, x10 = j10, x11 = j11, x12 = j12, x13 = j13, x14 = j14,
          x15 = j15, u;

      for (var i = 0; i < 20; i += 2) {
        u = x0 + x12 | 0;
        x4 ^= u<<7 | u>>>(32-7);
        u = x4 + x0 | 0;
        x8 ^= u<<9 | u>>>(32-9);
        u = x8 + x4 | 0;
        x12 ^= u<<13 | u>>>(32-13);
        u = x12 + x8 | 0;
        x0 ^= u<<18 | u>>>(32-18);

        u = x5 + x1 | 0;
        x9 ^= u<<7 | u>>>(32-7);
        u = x9 + x5 | 0;
        x13 ^= u<<9 | u>>>(32-9);
        u = x13 + x9 | 0;
        x1 ^= u<<13 | u>>>(32-13);
        u = x1 + x13 | 0;
        x5 ^= u<<18 | u>>>(32-18);

        u = x10 + x6 | 0;
        x14 ^= u<<7 | u>>>(32-7);
        u = x14 + x10 | 0;
        x2 ^= u<<9 | u>>>(32-9);
        u = x2 + x14 | 0;
        x6 ^= u<<13 | u>>>(32-13);
        u = x6 + x2 | 0;
        x10 ^= u<<18 | u>>>(32-18);

        u = x15 + x11 | 0;
        x3 ^= u<<7 | u>>>(32-7);
        u = x3 + x15 | 0;
        x7 ^= u<<9 | u>>>(32-9);
        u = x7 + x3 | 0;
        x11 ^= u<<13 | u>>>(32-13);
        u = x11 + x7 | 0;
        x15 ^= u<<18 | u>>>(32-18);

        u = x0 + x3 | 0;
        x1 ^= u<<7 | u>>>(32-7);
        u = x1 + x0 | 0;
        x2 ^= u<<9 | u>>>(32-9);
        u = x2 + x1 | 0;
        x3 ^= u<<13 | u>>>(32-13);
        u = x3 + x2 | 0;
        x0 ^= u<<18 | u>>>(32-18);

        u = x5 + x4 | 0;
        x6 ^= u<<7 | u>>>(32-7);
        u = x6 + x5 | 0;
        x7 ^= u<<9 | u>>>(32-9);
        u = x7 + x6 | 0;
        x4 ^= u<<13 | u>>>(32-13);
        u = x4 + x7 | 0;
        x5 ^= u<<18 | u>>>(32-18);

        u = x10 + x9 | 0;
        x11 ^= u<<7 | u>>>(32-7);
        u = x11 + x10 | 0;
        x8 ^= u<<9 | u>>>(32-9);
        u = x8 + x11 | 0;
        x9 ^= u<<13 | u>>>(32-13);
        u = x9 + x8 | 0;
        x10 ^= u<<18 | u>>>(32-18);

        u = x15 + x14 | 0;
        x12 ^= u<<7 | u>>>(32-7);
        u = x12 + x15 | 0;
        x13 ^= u<<9 | u>>>(32-9);
        u = x13 + x12 | 0;
        x14 ^= u<<13 | u>>>(32-13);
        u = x14 + x13 | 0;
        x15 ^= u<<18 | u>>>(32-18);
      }
       x0 =  x0 +  j0 | 0;
       x1 =  x1 +  j1 | 0;
       x2 =  x2 +  j2 | 0;
       x3 =  x3 +  j3 | 0;
       x4 =  x4 +  j4 | 0;
       x5 =  x5 +  j5 | 0;
       x6 =  x6 +  j6 | 0;
       x7 =  x7 +  j7 | 0;
       x8 =  x8 +  j8 | 0;
       x9 =  x9 +  j9 | 0;
      x10 = x10 + j10 | 0;
      x11 = x11 + j11 | 0;
      x12 = x12 + j12 | 0;
      x13 = x13 + j13 | 0;
      x14 = x14 + j14 | 0;
      x15 = x15 + j15 | 0;

      o[ 0] = x0 >>>  0 & 0xff;
      o[ 1] = x0 >>>  8 & 0xff;
      o[ 2] = x0 >>> 16 & 0xff;
      o[ 3] = x0 >>> 24 & 0xff;

      o[ 4] = x1 >>>  0 & 0xff;
      o[ 5] = x1 >>>  8 & 0xff;
      o[ 6] = x1 >>> 16 & 0xff;
      o[ 7] = x1 >>> 24 & 0xff;

      o[ 8] = x2 >>>  0 & 0xff;
      o[ 9] = x2 >>>  8 & 0xff;
      o[10] = x2 >>> 16 & 0xff;
      o[11] = x2 >>> 24 & 0xff;

      o[12] = x3 >>>  0 & 0xff;
      o[13] = x3 >>>  8 & 0xff;
      o[14] = x3 >>> 16 & 0xff;
      o[15] = x3 >>> 24 & 0xff;

      o[16] = x4 >>>  0 & 0xff;
      o[17] = x4 >>>  8 & 0xff;
      o[18] = x4 >>> 16 & 0xff;
      o[19] = x4 >>> 24 & 0xff;

      o[20] = x5 >>>  0 & 0xff;
      o[21] = x5 >>>  8 & 0xff;
      o[22] = x5 >>> 16 & 0xff;
      o[23] = x5 >>> 24 & 0xff;

      o[24] = x6 >>>  0 & 0xff;
      o[25] = x6 >>>  8 & 0xff;
      o[26] = x6 >>> 16 & 0xff;
      o[27] = x6 >>> 24 & 0xff;

      o[28] = x7 >>>  0 & 0xff;
      o[29] = x7 >>>  8 & 0xff;
      o[30] = x7 >>> 16 & 0xff;
      o[31] = x7 >>> 24 & 0xff;

      o[32] = x8 >>>  0 & 0xff;
      o[33] = x8 >>>  8 & 0xff;
      o[34] = x8 >>> 16 & 0xff;
      o[35] = x8 >>> 24 & 0xff;

      o[36] = x9 >>>  0 & 0xff;
      o[37] = x9 >>>  8 & 0xff;
      o[38] = x9 >>> 16 & 0xff;
      o[39] = x9 >>> 24 & 0xff;

      o[40] = x10 >>>  0 & 0xff;
      o[41] = x10 >>>  8 & 0xff;
      o[42] = x10 >>> 16 & 0xff;
      o[43] = x10 >>> 24 & 0xff;

      o[44] = x11 >>>  0 & 0xff;
      o[45] = x11 >>>  8 & 0xff;
      o[46] = x11 >>> 16 & 0xff;
      o[47] = x11 >>> 24 & 0xff;

      o[48] = x12 >>>  0 & 0xff;
      o[49] = x12 >>>  8 & 0xff;
      o[50] = x12 >>> 16 & 0xff;
      o[51] = x12 >>> 24 & 0xff;

      o[52] = x13 >>>  0 & 0xff;
      o[53] = x13 >>>  8 & 0xff;
      o[54] = x13 >>> 16 & 0xff;
      o[55] = x13 >>> 24 & 0xff;

      o[56] = x14 >>>  0 & 0xff;
      o[57] = x14 >>>  8 & 0xff;
      o[58] = x14 >>> 16 & 0xff;
      o[59] = x14 >>> 24 & 0xff;

      o[60] = x15 >>>  0 & 0xff;
      o[61] = x15 >>>  8 & 0xff;
      o[62] = x15 >>> 16 & 0xff;
      o[63] = x15 >>> 24 & 0xff;
    }

    function core_hsalsa20(o,p,k,c) {
      var j0  = c[ 0] & 0xff | (c[ 1] & 0xff)<<8 | (c[ 2] & 0xff)<<16 | (c[ 3] & 0xff)<<24,
          j1  = k[ 0] & 0xff | (k[ 1] & 0xff)<<8 | (k[ 2] & 0xff)<<16 | (k[ 3] & 0xff)<<24,
          j2  = k[ 4] & 0xff | (k[ 5] & 0xff)<<8 | (k[ 6] & 0xff)<<16 | (k[ 7] & 0xff)<<24,
          j3  = k[ 8] & 0xff | (k[ 9] & 0xff)<<8 | (k[10] & 0xff)<<16 | (k[11] & 0xff)<<24,
          j4  = k[12] & 0xff | (k[13] & 0xff)<<8 | (k[14] & 0xff)<<16 | (k[15] & 0xff)<<24,
          j5  = c[ 4] & 0xff | (c[ 5] & 0xff)<<8 | (c[ 6] & 0xff)<<16 | (c[ 7] & 0xff)<<24,
          j6  = p[ 0] & 0xff | (p[ 1] & 0xff)<<8 | (p[ 2] & 0xff)<<16 | (p[ 3] & 0xff)<<24,
          j7  = p[ 4] & 0xff | (p[ 5] & 0xff)<<8 | (p[ 6] & 0xff)<<16 | (p[ 7] & 0xff)<<24,
          j8  = p[ 8] & 0xff | (p[ 9] & 0xff)<<8 | (p[10] & 0xff)<<16 | (p[11] & 0xff)<<24,
          j9  = p[12] & 0xff | (p[13] & 0xff)<<8 | (p[14] & 0xff)<<16 | (p[15] & 0xff)<<24,
          j10 = c[ 8] & 0xff | (c[ 9] & 0xff)<<8 | (c[10] & 0xff)<<16 | (c[11] & 0xff)<<24,
          j11 = k[16] & 0xff | (k[17] & 0xff)<<8 | (k[18] & 0xff)<<16 | (k[19] & 0xff)<<24,
          j12 = k[20] & 0xff | (k[21] & 0xff)<<8 | (k[22] & 0xff)<<16 | (k[23] & 0xff)<<24,
          j13 = k[24] & 0xff | (k[25] & 0xff)<<8 | (k[26] & 0xff)<<16 | (k[27] & 0xff)<<24,
          j14 = k[28] & 0xff | (k[29] & 0xff)<<8 | (k[30] & 0xff)<<16 | (k[31] & 0xff)<<24,
          j15 = c[12] & 0xff | (c[13] & 0xff)<<8 | (c[14] & 0xff)<<16 | (c[15] & 0xff)<<24;

      var x0 = j0, x1 = j1, x2 = j2, x3 = j3, x4 = j4, x5 = j5, x6 = j6, x7 = j7,
          x8 = j8, x9 = j9, x10 = j10, x11 = j11, x12 = j12, x13 = j13, x14 = j14,
          x15 = j15, u;

      for (var i = 0; i < 20; i += 2) {
        u = x0 + x12 | 0;
        x4 ^= u<<7 | u>>>(32-7);
        u = x4 + x0 | 0;
        x8 ^= u<<9 | u>>>(32-9);
        u = x8 + x4 | 0;
        x12 ^= u<<13 | u>>>(32-13);
        u = x12 + x8 | 0;
        x0 ^= u<<18 | u>>>(32-18);

        u = x5 + x1 | 0;
        x9 ^= u<<7 | u>>>(32-7);
        u = x9 + x5 | 0;
        x13 ^= u<<9 | u>>>(32-9);
        u = x13 + x9 | 0;
        x1 ^= u<<13 | u>>>(32-13);
        u = x1 + x13 | 0;
        x5 ^= u<<18 | u>>>(32-18);

        u = x10 + x6 | 0;
        x14 ^= u<<7 | u>>>(32-7);
        u = x14 + x10 | 0;
        x2 ^= u<<9 | u>>>(32-9);
        u = x2 + x14 | 0;
        x6 ^= u<<13 | u>>>(32-13);
        u = x6 + x2 | 0;
        x10 ^= u<<18 | u>>>(32-18);

        u = x15 + x11 | 0;
        x3 ^= u<<7 | u>>>(32-7);
        u = x3 + x15 | 0;
        x7 ^= u<<9 | u>>>(32-9);
        u = x7 + x3 | 0;
        x11 ^= u<<13 | u>>>(32-13);
        u = x11 + x7 | 0;
        x15 ^= u<<18 | u>>>(32-18);

        u = x0 + x3 | 0;
        x1 ^= u<<7 | u>>>(32-7);
        u = x1 + x0 | 0;
        x2 ^= u<<9 | u>>>(32-9);
        u = x2 + x1 | 0;
        x3 ^= u<<13 | u>>>(32-13);
        u = x3 + x2 | 0;
        x0 ^= u<<18 | u>>>(32-18);

        u = x5 + x4 | 0;
        x6 ^= u<<7 | u>>>(32-7);
        u = x6 + x5 | 0;
        x7 ^= u<<9 | u>>>(32-9);
        u = x7 + x6 | 0;
        x4 ^= u<<13 | u>>>(32-13);
        u = x4 + x7 | 0;
        x5 ^= u<<18 | u>>>(32-18);

        u = x10 + x9 | 0;
        x11 ^= u<<7 | u>>>(32-7);
        u = x11 + x10 | 0;
        x8 ^= u<<9 | u>>>(32-9);
        u = x8 + x11 | 0;
        x9 ^= u<<13 | u>>>(32-13);
        u = x9 + x8 | 0;
        x10 ^= u<<18 | u>>>(32-18);

        u = x15 + x14 | 0;
        x12 ^= u<<7 | u>>>(32-7);
        u = x12 + x15 | 0;
        x13 ^= u<<9 | u>>>(32-9);
        u = x13 + x12 | 0;
        x14 ^= u<<13 | u>>>(32-13);
        u = x14 + x13 | 0;
        x15 ^= u<<18 | u>>>(32-18);
      }

      o[ 0] = x0 >>>  0 & 0xff;
      o[ 1] = x0 >>>  8 & 0xff;
      o[ 2] = x0 >>> 16 & 0xff;
      o[ 3] = x0 >>> 24 & 0xff;

      o[ 4] = x5 >>>  0 & 0xff;
      o[ 5] = x5 >>>  8 & 0xff;
      o[ 6] = x5 >>> 16 & 0xff;
      o[ 7] = x5 >>> 24 & 0xff;

      o[ 8] = x10 >>>  0 & 0xff;
      o[ 9] = x10 >>>  8 & 0xff;
      o[10] = x10 >>> 16 & 0xff;
      o[11] = x10 >>> 24 & 0xff;

      o[12] = x15 >>>  0 & 0xff;
      o[13] = x15 >>>  8 & 0xff;
      o[14] = x15 >>> 16 & 0xff;
      o[15] = x15 >>> 24 & 0xff;

      o[16] = x6 >>>  0 & 0xff;
      o[17] = x6 >>>  8 & 0xff;
      o[18] = x6 >>> 16 & 0xff;
      o[19] = x6 >>> 24 & 0xff;

      o[20] = x7 >>>  0 & 0xff;
      o[21] = x7 >>>  8 & 0xff;
      o[22] = x7 >>> 16 & 0xff;
      o[23] = x7 >>> 24 & 0xff;

      o[24] = x8 >>>  0 & 0xff;
      o[25] = x8 >>>  8 & 0xff;
      o[26] = x8 >>> 16 & 0xff;
      o[27] = x8 >>> 24 & 0xff;

      o[28] = x9 >>>  0 & 0xff;
      o[29] = x9 >>>  8 & 0xff;
      o[30] = x9 >>> 16 & 0xff;
      o[31] = x9 >>> 24 & 0xff;
    }

    function crypto_core_salsa20(out,inp,k,c) {
      core_salsa20(out,inp,k,c);
    }

    function crypto_core_hsalsa20(out,inp,k,c) {
      core_hsalsa20(out,inp,k,c);
    }

    var sigma = new Uint8Array([101, 120, 112, 97, 110, 100, 32, 51, 50, 45, 98, 121, 116, 101, 32, 107]);
                // "expand 32-byte k"

    function crypto_stream_salsa20_xor(c,cpos,m,mpos,b,n,k) {
      var z = new Uint8Array(16), x = new Uint8Array(64);
      var u, i;
      for (i = 0; i < 16; i++) z[i] = 0;
      for (i = 0; i < 8; i++) z[i] = n[i];
      while (b >= 64) {
        crypto_core_salsa20(x,z,k,sigma);
        for (i = 0; i < 64; i++) c[cpos+i] = m[mpos+i] ^ x[i];
        u = 1;
        for (i = 8; i < 16; i++) {
          u = u + (z[i] & 0xff) | 0;
          z[i] = u & 0xff;
          u >>>= 8;
        }
        b -= 64;
        cpos += 64;
        mpos += 64;
      }
      if (b > 0) {
        crypto_core_salsa20(x,z,k,sigma);
        for (i = 0; i < b; i++) c[cpos+i] = m[mpos+i] ^ x[i];
      }
      return 0;
    }

    function crypto_stream_salsa20(c,cpos,b,n,k) {
      var z = new Uint8Array(16), x = new Uint8Array(64);
      var u, i;
      for (i = 0; i < 16; i++) z[i] = 0;
      for (i = 0; i < 8; i++) z[i] = n[i];
      while (b >= 64) {
        crypto_core_salsa20(x,z,k,sigma);
        for (i = 0; i < 64; i++) c[cpos+i] = x[i];
        u = 1;
        for (i = 8; i < 16; i++) {
          u = u + (z[i] & 0xff) | 0;
          z[i] = u & 0xff;
          u >>>= 8;
        }
        b -= 64;
        cpos += 64;
      }
      if (b > 0) {
        crypto_core_salsa20(x,z,k,sigma);
        for (i = 0; i < b; i++) c[cpos+i] = x[i];
      }
      return 0;
    }

    function crypto_stream(c,cpos,d,n,k) {
      var s = new Uint8Array(32);
      crypto_core_hsalsa20(s,n,k,sigma);
      var sn = new Uint8Array(8);
      for (var i = 0; i < 8; i++) sn[i] = n[i+16];
      return crypto_stream_salsa20(c,cpos,d,sn,s);
    }

    function crypto_stream_xor(c,cpos,m,mpos,d,n,k) {
      var s = new Uint8Array(32);
      crypto_core_hsalsa20(s,n,k,sigma);
      var sn = new Uint8Array(8);
      for (var i = 0; i < 8; i++) sn[i] = n[i+16];
      return crypto_stream_salsa20_xor(c,cpos,m,mpos,d,sn,s);
    }

    /*
    * Port of Andrew Moon's Poly1305-donna-16. Public domain.
    * https://github.com/floodyberry/poly1305-donna
    */

    var poly1305 = function(key) {
      this.buffer = new Uint8Array(16);
      this.r = new Uint16Array(10);
      this.h = new Uint16Array(10);
      this.pad = new Uint16Array(8);
      this.leftover = 0;
      this.fin = 0;

      var t0, t1, t2, t3, t4, t5, t6, t7;

      t0 = key[ 0] & 0xff | (key[ 1] & 0xff) << 8; this.r[0] = ( t0                     ) & 0x1fff;
      t1 = key[ 2] & 0xff | (key[ 3] & 0xff) << 8; this.r[1] = ((t0 >>> 13) | (t1 <<  3)) & 0x1fff;
      t2 = key[ 4] & 0xff | (key[ 5] & 0xff) << 8; this.r[2] = ((t1 >>> 10) | (t2 <<  6)) & 0x1f03;
      t3 = key[ 6] & 0xff | (key[ 7] & 0xff) << 8; this.r[3] = ((t2 >>>  7) | (t3 <<  9)) & 0x1fff;
      t4 = key[ 8] & 0xff | (key[ 9] & 0xff) << 8; this.r[4] = ((t3 >>>  4) | (t4 << 12)) & 0x00ff;
      this.r[5] = ((t4 >>>  1)) & 0x1ffe;
      t5 = key[10] & 0xff | (key[11] & 0xff) << 8; this.r[6] = ((t4 >>> 14) | (t5 <<  2)) & 0x1fff;
      t6 = key[12] & 0xff | (key[13] & 0xff) << 8; this.r[7] = ((t5 >>> 11) | (t6 <<  5)) & 0x1f81;
      t7 = key[14] & 0xff | (key[15] & 0xff) << 8; this.r[8] = ((t6 >>>  8) | (t7 <<  8)) & 0x1fff;
      this.r[9] = ((t7 >>>  5)) & 0x007f;

      this.pad[0] = key[16] & 0xff | (key[17] & 0xff) << 8;
      this.pad[1] = key[18] & 0xff | (key[19] & 0xff) << 8;
      this.pad[2] = key[20] & 0xff | (key[21] & 0xff) << 8;
      this.pad[3] = key[22] & 0xff | (key[23] & 0xff) << 8;
      this.pad[4] = key[24] & 0xff | (key[25] & 0xff) << 8;
      this.pad[5] = key[26] & 0xff | (key[27] & 0xff) << 8;
      this.pad[6] = key[28] & 0xff | (key[29] & 0xff) << 8;
      this.pad[7] = key[30] & 0xff | (key[31] & 0xff) << 8;
    };

    poly1305.prototype.blocks = function(m, mpos, bytes) {
      var hibit = this.fin ? 0 : (1 << 11);
      var t0, t1, t2, t3, t4, t5, t6, t7, c;
      var d0, d1, d2, d3, d4, d5, d6, d7, d8, d9;

      var h0 = this.h[0],
          h1 = this.h[1],
          h2 = this.h[2],
          h3 = this.h[3],
          h4 = this.h[4],
          h5 = this.h[5],
          h6 = this.h[6],
          h7 = this.h[7],
          h8 = this.h[8],
          h9 = this.h[9];

      var r0 = this.r[0],
          r1 = this.r[1],
          r2 = this.r[2],
          r3 = this.r[3],
          r4 = this.r[4],
          r5 = this.r[5],
          r6 = this.r[6],
          r7 = this.r[7],
          r8 = this.r[8],
          r9 = this.r[9];

      while (bytes >= 16) {
        t0 = m[mpos+ 0] & 0xff | (m[mpos+ 1] & 0xff) << 8; h0 += ( t0                     ) & 0x1fff;
        t1 = m[mpos+ 2] & 0xff | (m[mpos+ 3] & 0xff) << 8; h1 += ((t0 >>> 13) | (t1 <<  3)) & 0x1fff;
        t2 = m[mpos+ 4] & 0xff | (m[mpos+ 5] & 0xff) << 8; h2 += ((t1 >>> 10) | (t2 <<  6)) & 0x1fff;
        t3 = m[mpos+ 6] & 0xff | (m[mpos+ 7] & 0xff) << 8; h3 += ((t2 >>>  7) | (t3 <<  9)) & 0x1fff;
        t4 = m[mpos+ 8] & 0xff | (m[mpos+ 9] & 0xff) << 8; h4 += ((t3 >>>  4) | (t4 << 12)) & 0x1fff;
        h5 += ((t4 >>>  1)) & 0x1fff;
        t5 = m[mpos+10] & 0xff | (m[mpos+11] & 0xff) << 8; h6 += ((t4 >>> 14) | (t5 <<  2)) & 0x1fff;
        t6 = m[mpos+12] & 0xff | (m[mpos+13] & 0xff) << 8; h7 += ((t5 >>> 11) | (t6 <<  5)) & 0x1fff;
        t7 = m[mpos+14] & 0xff | (m[mpos+15] & 0xff) << 8; h8 += ((t6 >>>  8) | (t7 <<  8)) & 0x1fff;
        h9 += ((t7 >>> 5)) | hibit;

        c = 0;

        d0 = c;
        d0 += h0 * r0;
        d0 += h1 * (5 * r9);
        d0 += h2 * (5 * r8);
        d0 += h3 * (5 * r7);
        d0 += h4 * (5 * r6);
        c = (d0 >>> 13); d0 &= 0x1fff;
        d0 += h5 * (5 * r5);
        d0 += h6 * (5 * r4);
        d0 += h7 * (5 * r3);
        d0 += h8 * (5 * r2);
        d0 += h9 * (5 * r1);
        c += (d0 >>> 13); d0 &= 0x1fff;

        d1 = c;
        d1 += h0 * r1;
        d1 += h1 * r0;
        d1 += h2 * (5 * r9);
        d1 += h3 * (5 * r8);
        d1 += h4 * (5 * r7);
        c = (d1 >>> 13); d1 &= 0x1fff;
        d1 += h5 * (5 * r6);
        d1 += h6 * (5 * r5);
        d1 += h7 * (5 * r4);
        d1 += h8 * (5 * r3);
        d1 += h9 * (5 * r2);
        c += (d1 >>> 13); d1 &= 0x1fff;

        d2 = c;
        d2 += h0 * r2;
        d2 += h1 * r1;
        d2 += h2 * r0;
        d2 += h3 * (5 * r9);
        d2 += h4 * (5 * r8);
        c = (d2 >>> 13); d2 &= 0x1fff;
        d2 += h5 * (5 * r7);
        d2 += h6 * (5 * r6);
        d2 += h7 * (5 * r5);
        d2 += h8 * (5 * r4);
        d2 += h9 * (5 * r3);
        c += (d2 >>> 13); d2 &= 0x1fff;

        d3 = c;
        d3 += h0 * r3;
        d3 += h1 * r2;
        d3 += h2 * r1;
        d3 += h3 * r0;
        d3 += h4 * (5 * r9);
        c = (d3 >>> 13); d3 &= 0x1fff;
        d3 += h5 * (5 * r8);
        d3 += h6 * (5 * r7);
        d3 += h7 * (5 * r6);
        d3 += h8 * (5 * r5);
        d3 += h9 * (5 * r4);
        c += (d3 >>> 13); d3 &= 0x1fff;

        d4 = c;
        d4 += h0 * r4;
        d4 += h1 * r3;
        d4 += h2 * r2;
        d4 += h3 * r1;
        d4 += h4 * r0;
        c = (d4 >>> 13); d4 &= 0x1fff;
        d4 += h5 * (5 * r9);
        d4 += h6 * (5 * r8);
        d4 += h7 * (5 * r7);
        d4 += h8 * (5 * r6);
        d4 += h9 * (5 * r5);
        c += (d4 >>> 13); d4 &= 0x1fff;

        d5 = c;
        d5 += h0 * r5;
        d5 += h1 * r4;
        d5 += h2 * r3;
        d5 += h3 * r2;
        d5 += h4 * r1;
        c = (d5 >>> 13); d5 &= 0x1fff;
        d5 += h5 * r0;
        d5 += h6 * (5 * r9);
        d5 += h7 * (5 * r8);
        d5 += h8 * (5 * r7);
        d5 += h9 * (5 * r6);
        c += (d5 >>> 13); d5 &= 0x1fff;

        d6 = c;
        d6 += h0 * r6;
        d6 += h1 * r5;
        d6 += h2 * r4;
        d6 += h3 * r3;
        d6 += h4 * r2;
        c = (d6 >>> 13); d6 &= 0x1fff;
        d6 += h5 * r1;
        d6 += h6 * r0;
        d6 += h7 * (5 * r9);
        d6 += h8 * (5 * r8);
        d6 += h9 * (5 * r7);
        c += (d6 >>> 13); d6 &= 0x1fff;

        d7 = c;
        d7 += h0 * r7;
        d7 += h1 * r6;
        d7 += h2 * r5;
        d7 += h3 * r4;
        d7 += h4 * r3;
        c = (d7 >>> 13); d7 &= 0x1fff;
        d7 += h5 * r2;
        d7 += h6 * r1;
        d7 += h7 * r0;
        d7 += h8 * (5 * r9);
        d7 += h9 * (5 * r8);
        c += (d7 >>> 13); d7 &= 0x1fff;

        d8 = c;
        d8 += h0 * r8;
        d8 += h1 * r7;
        d8 += h2 * r6;
        d8 += h3 * r5;
        d8 += h4 * r4;
        c = (d8 >>> 13); d8 &= 0x1fff;
        d8 += h5 * r3;
        d8 += h6 * r2;
        d8 += h7 * r1;
        d8 += h8 * r0;
        d8 += h9 * (5 * r9);
        c += (d8 >>> 13); d8 &= 0x1fff;

        d9 = c;
        d9 += h0 * r9;
        d9 += h1 * r8;
        d9 += h2 * r7;
        d9 += h3 * r6;
        d9 += h4 * r5;
        c = (d9 >>> 13); d9 &= 0x1fff;
        d9 += h5 * r4;
        d9 += h6 * r3;
        d9 += h7 * r2;
        d9 += h8 * r1;
        d9 += h9 * r0;
        c += (d9 >>> 13); d9 &= 0x1fff;

        c = (((c << 2) + c)) | 0;
        c = (c + d0) | 0;
        d0 = c & 0x1fff;
        c = (c >>> 13);
        d1 += c;

        h0 = d0;
        h1 = d1;
        h2 = d2;
        h3 = d3;
        h4 = d4;
        h5 = d5;
        h6 = d6;
        h7 = d7;
        h8 = d8;
        h9 = d9;

        mpos += 16;
        bytes -= 16;
      }
      this.h[0] = h0;
      this.h[1] = h1;
      this.h[2] = h2;
      this.h[3] = h3;
      this.h[4] = h4;
      this.h[5] = h5;
      this.h[6] = h6;
      this.h[7] = h7;
      this.h[8] = h8;
      this.h[9] = h9;
    };

    poly1305.prototype.finish = function(mac, macpos) {
      var g = new Uint16Array(10);
      var c, mask, f, i;

      if (this.leftover) {
        i = this.leftover;
        this.buffer[i++] = 1;
        for (; i < 16; i++) this.buffer[i] = 0;
        this.fin = 1;
        this.blocks(this.buffer, 0, 16);
      }

      c = this.h[1] >>> 13;
      this.h[1] &= 0x1fff;
      for (i = 2; i < 10; i++) {
        this.h[i] += c;
        c = this.h[i] >>> 13;
        this.h[i] &= 0x1fff;
      }
      this.h[0] += (c * 5);
      c = this.h[0] >>> 13;
      this.h[0] &= 0x1fff;
      this.h[1] += c;
      c = this.h[1] >>> 13;
      this.h[1] &= 0x1fff;
      this.h[2] += c;

      g[0] = this.h[0] + 5;
      c = g[0] >>> 13;
      g[0] &= 0x1fff;
      for (i = 1; i < 10; i++) {
        g[i] = this.h[i] + c;
        c = g[i] >>> 13;
        g[i] &= 0x1fff;
      }
      g[9] -= (1 << 13);

      mask = (c ^ 1) - 1;
      for (i = 0; i < 10; i++) g[i] &= mask;
      mask = ~mask;
      for (i = 0; i < 10; i++) this.h[i] = (this.h[i] & mask) | g[i];

      this.h[0] = ((this.h[0]       ) | (this.h[1] << 13)                    ) & 0xffff;
      this.h[1] = ((this.h[1] >>>  3) | (this.h[2] << 10)                    ) & 0xffff;
      this.h[2] = ((this.h[2] >>>  6) | (this.h[3] <<  7)                    ) & 0xffff;
      this.h[3] = ((this.h[3] >>>  9) | (this.h[4] <<  4)                    ) & 0xffff;
      this.h[4] = ((this.h[4] >>> 12) | (this.h[5] <<  1) | (this.h[6] << 14)) & 0xffff;
      this.h[5] = ((this.h[6] >>>  2) | (this.h[7] << 11)                    ) & 0xffff;
      this.h[6] = ((this.h[7] >>>  5) | (this.h[8] <<  8)                    ) & 0xffff;
      this.h[7] = ((this.h[8] >>>  8) | (this.h[9] <<  5)                    ) & 0xffff;

      f = this.h[0] + this.pad[0];
      this.h[0] = f & 0xffff;
      for (i = 1; i < 8; i++) {
        f = (((this.h[i] + this.pad[i]) | 0) + (f >>> 16)) | 0;
        this.h[i] = f & 0xffff;
      }

      mac[macpos+ 0] = (this.h[0] >>> 0) & 0xff;
      mac[macpos+ 1] = (this.h[0] >>> 8) & 0xff;
      mac[macpos+ 2] = (this.h[1] >>> 0) & 0xff;
      mac[macpos+ 3] = (this.h[1] >>> 8) & 0xff;
      mac[macpos+ 4] = (this.h[2] >>> 0) & 0xff;
      mac[macpos+ 5] = (this.h[2] >>> 8) & 0xff;
      mac[macpos+ 6] = (this.h[3] >>> 0) & 0xff;
      mac[macpos+ 7] = (this.h[3] >>> 8) & 0xff;
      mac[macpos+ 8] = (this.h[4] >>> 0) & 0xff;
      mac[macpos+ 9] = (this.h[4] >>> 8) & 0xff;
      mac[macpos+10] = (this.h[5] >>> 0) & 0xff;
      mac[macpos+11] = (this.h[5] >>> 8) & 0xff;
      mac[macpos+12] = (this.h[6] >>> 0) & 0xff;
      mac[macpos+13] = (this.h[6] >>> 8) & 0xff;
      mac[macpos+14] = (this.h[7] >>> 0) & 0xff;
      mac[macpos+15] = (this.h[7] >>> 8) & 0xff;
    };

    poly1305.prototype.update = function(m, mpos, bytes) {
      var i, want;

      if (this.leftover) {
        want = (16 - this.leftover);
        if (want > bytes)
          want = bytes;
        for (i = 0; i < want; i++)
          this.buffer[this.leftover + i] = m[mpos+i];
        bytes -= want;
        mpos += want;
        this.leftover += want;
        if (this.leftover < 16)
          return;
        this.blocks(this.buffer, 0, 16);
        this.leftover = 0;
      }

      if (bytes >= 16) {
        want = bytes - (bytes % 16);
        this.blocks(m, mpos, want);
        mpos += want;
        bytes -= want;
      }

      if (bytes) {
        for (i = 0; i < bytes; i++)
          this.buffer[this.leftover + i] = m[mpos+i];
        this.leftover += bytes;
      }
    };

    function crypto_onetimeauth(out, outpos, m, mpos, n, k) {
      var s = new poly1305(k);
      s.update(m, mpos, n);
      s.finish(out, outpos);
      return 0;
    }

    function crypto_onetimeauth_verify(h, hpos, m, mpos, n, k) {
      var x = new Uint8Array(16);
      crypto_onetimeauth(x,0,m,mpos,n,k);
      return crypto_verify_16(h,hpos,x,0);
    }

    function crypto_secretbox(c,m,d,n,k) {
      var i;
      if (d < 32) return -1;
      crypto_stream_xor(c,0,m,0,d,n,k);
      crypto_onetimeauth(c, 16, c, 32, d - 32, c);
      for (i = 0; i < 16; i++) c[i] = 0;
      return 0;
    }

    function crypto_secretbox_open(m,c,d,n,k) {
      var i;
      var x = new Uint8Array(32);
      if (d < 32) return -1;
      crypto_stream(x,0,32,n,k);
      if (crypto_onetimeauth_verify(c, 16,c, 32,d - 32,x) !== 0) return -1;
      crypto_stream_xor(m,0,c,0,d,n,k);
      for (i = 0; i < 32; i++) m[i] = 0;
      return 0;
    }

    function set25519(r, a) {
      var i;
      for (i = 0; i < 16; i++) r[i] = a[i]|0;
    }

    function car25519(o) {
      var i, v, c = 1;
      for (i = 0; i < 16; i++) {
        v = o[i] + c + 65535;
        c = Math.floor(v / 65536);
        o[i] = v - c * 65536;
      }
      o[0] += c-1 + 37 * (c-1);
    }

    function sel25519(p, q, b) {
      var t, c = ~(b-1);
      for (var i = 0; i < 16; i++) {
        t = c & (p[i] ^ q[i]);
        p[i] ^= t;
        q[i] ^= t;
      }
    }

    function pack25519(o, n) {
      var i, j, b;
      var m = gf(), t = gf();
      for (i = 0; i < 16; i++) t[i] = n[i];
      car25519(t);
      car25519(t);
      car25519(t);
      for (j = 0; j < 2; j++) {
        m[0] = t[0] - 0xffed;
        for (i = 1; i < 15; i++) {
          m[i] = t[i] - 0xffff - ((m[i-1]>>16) & 1);
          m[i-1] &= 0xffff;
        }
        m[15] = t[15] - 0x7fff - ((m[14]>>16) & 1);
        b = (m[15]>>16) & 1;
        m[14] &= 0xffff;
        sel25519(t, m, 1-b);
      }
      for (i = 0; i < 16; i++) {
        o[2*i] = t[i] & 0xff;
        o[2*i+1] = t[i]>>8;
      }
    }

    function neq25519(a, b) {
      var c = new Uint8Array(32), d = new Uint8Array(32);
      pack25519(c, a);
      pack25519(d, b);
      return crypto_verify_32(c, 0, d, 0);
    }

    function par25519(a) {
      var d = new Uint8Array(32);
      pack25519(d, a);
      return d[0] & 1;
    }

    function unpack25519(o, n) {
      var i;
      for (i = 0; i < 16; i++) o[i] = n[2*i] + (n[2*i+1] << 8);
      o[15] &= 0x7fff;
    }

    function A(o, a, b) {
      for (var i = 0; i < 16; i++) o[i] = a[i] + b[i];
    }

    function Z(o, a, b) {
      for (var i = 0; i < 16; i++) o[i] = a[i] - b[i];
    }

    function M(o, a, b) {
      var v, c,
         t0 = 0,  t1 = 0,  t2 = 0,  t3 = 0,  t4 = 0,  t5 = 0,  t6 = 0,  t7 = 0,
         t8 = 0,  t9 = 0, t10 = 0, t11 = 0, t12 = 0, t13 = 0, t14 = 0, t15 = 0,
        t16 = 0, t17 = 0, t18 = 0, t19 = 0, t20 = 0, t21 = 0, t22 = 0, t23 = 0,
        t24 = 0, t25 = 0, t26 = 0, t27 = 0, t28 = 0, t29 = 0, t30 = 0,
        b0 = b[0],
        b1 = b[1],
        b2 = b[2],
        b3 = b[3],
        b4 = b[4],
        b5 = b[5],
        b6 = b[6],
        b7 = b[7],
        b8 = b[8],
        b9 = b[9],
        b10 = b[10],
        b11 = b[11],
        b12 = b[12],
        b13 = b[13],
        b14 = b[14],
        b15 = b[15];

      v = a[0];
      t0 += v * b0;
      t1 += v * b1;
      t2 += v * b2;
      t3 += v * b3;
      t4 += v * b4;
      t5 += v * b5;
      t6 += v * b6;
      t7 += v * b7;
      t8 += v * b8;
      t9 += v * b9;
      t10 += v * b10;
      t11 += v * b11;
      t12 += v * b12;
      t13 += v * b13;
      t14 += v * b14;
      t15 += v * b15;
      v = a[1];
      t1 += v * b0;
      t2 += v * b1;
      t3 += v * b2;
      t4 += v * b3;
      t5 += v * b4;
      t6 += v * b5;
      t7 += v * b6;
      t8 += v * b7;
      t9 += v * b8;
      t10 += v * b9;
      t11 += v * b10;
      t12 += v * b11;
      t13 += v * b12;
      t14 += v * b13;
      t15 += v * b14;
      t16 += v * b15;
      v = a[2];
      t2 += v * b0;
      t3 += v * b1;
      t4 += v * b2;
      t5 += v * b3;
      t6 += v * b4;
      t7 += v * b5;
      t8 += v * b6;
      t9 += v * b7;
      t10 += v * b8;
      t11 += v * b9;
      t12 += v * b10;
      t13 += v * b11;
      t14 += v * b12;
      t15 += v * b13;
      t16 += v * b14;
      t17 += v * b15;
      v = a[3];
      t3 += v * b0;
      t4 += v * b1;
      t5 += v * b2;
      t6 += v * b3;
      t7 += v * b4;
      t8 += v * b5;
      t9 += v * b6;
      t10 += v * b7;
      t11 += v * b8;
      t12 += v * b9;
      t13 += v * b10;
      t14 += v * b11;
      t15 += v * b12;
      t16 += v * b13;
      t17 += v * b14;
      t18 += v * b15;
      v = a[4];
      t4 += v * b0;
      t5 += v * b1;
      t6 += v * b2;
      t7 += v * b3;
      t8 += v * b4;
      t9 += v * b5;
      t10 += v * b6;
      t11 += v * b7;
      t12 += v * b8;
      t13 += v * b9;
      t14 += v * b10;
      t15 += v * b11;
      t16 += v * b12;
      t17 += v * b13;
      t18 += v * b14;
      t19 += v * b15;
      v = a[5];
      t5 += v * b0;
      t6 += v * b1;
      t7 += v * b2;
      t8 += v * b3;
      t9 += v * b4;
      t10 += v * b5;
      t11 += v * b6;
      t12 += v * b7;
      t13 += v * b8;
      t14 += v * b9;
      t15 += v * b10;
      t16 += v * b11;
      t17 += v * b12;
      t18 += v * b13;
      t19 += v * b14;
      t20 += v * b15;
      v = a[6];
      t6 += v * b0;
      t7 += v * b1;
      t8 += v * b2;
      t9 += v * b3;
      t10 += v * b4;
      t11 += v * b5;
      t12 += v * b6;
      t13 += v * b7;
      t14 += v * b8;
      t15 += v * b9;
      t16 += v * b10;
      t17 += v * b11;
      t18 += v * b12;
      t19 += v * b13;
      t20 += v * b14;
      t21 += v * b15;
      v = a[7];
      t7 += v * b0;
      t8 += v * b1;
      t9 += v * b2;
      t10 += v * b3;
      t11 += v * b4;
      t12 += v * b5;
      t13 += v * b6;
      t14 += v * b7;
      t15 += v * b8;
      t16 += v * b9;
      t17 += v * b10;
      t18 += v * b11;
      t19 += v * b12;
      t20 += v * b13;
      t21 += v * b14;
      t22 += v * b15;
      v = a[8];
      t8 += v * b0;
      t9 += v * b1;
      t10 += v * b2;
      t11 += v * b3;
      t12 += v * b4;
      t13 += v * b5;
      t14 += v * b6;
      t15 += v * b7;
      t16 += v * b8;
      t17 += v * b9;
      t18 += v * b10;
      t19 += v * b11;
      t20 += v * b12;
      t21 += v * b13;
      t22 += v * b14;
      t23 += v * b15;
      v = a[9];
      t9 += v * b0;
      t10 += v * b1;
      t11 += v * b2;
      t12 += v * b3;
      t13 += v * b4;
      t14 += v * b5;
      t15 += v * b6;
      t16 += v * b7;
      t17 += v * b8;
      t18 += v * b9;
      t19 += v * b10;
      t20 += v * b11;
      t21 += v * b12;
      t22 += v * b13;
      t23 += v * b14;
      t24 += v * b15;
      v = a[10];
      t10 += v * b0;
      t11 += v * b1;
      t12 += v * b2;
      t13 += v * b3;
      t14 += v * b4;
      t15 += v * b5;
      t16 += v * b6;
      t17 += v * b7;
      t18 += v * b8;
      t19 += v * b9;
      t20 += v * b10;
      t21 += v * b11;
      t22 += v * b12;
      t23 += v * b13;
      t24 += v * b14;
      t25 += v * b15;
      v = a[11];
      t11 += v * b0;
      t12 += v * b1;
      t13 += v * b2;
      t14 += v * b3;
      t15 += v * b4;
      t16 += v * b5;
      t17 += v * b6;
      t18 += v * b7;
      t19 += v * b8;
      t20 += v * b9;
      t21 += v * b10;
      t22 += v * b11;
      t23 += v * b12;
      t24 += v * b13;
      t25 += v * b14;
      t26 += v * b15;
      v = a[12];
      t12 += v * b0;
      t13 += v * b1;
      t14 += v * b2;
      t15 += v * b3;
      t16 += v * b4;
      t17 += v * b5;
      t18 += v * b6;
      t19 += v * b7;
      t20 += v * b8;
      t21 += v * b9;
      t22 += v * b10;
      t23 += v * b11;
      t24 += v * b12;
      t25 += v * b13;
      t26 += v * b14;
      t27 += v * b15;
      v = a[13];
      t13 += v * b0;
      t14 += v * b1;
      t15 += v * b2;
      t16 += v * b3;
      t17 += v * b4;
      t18 += v * b5;
      t19 += v * b6;
      t20 += v * b7;
      t21 += v * b8;
      t22 += v * b9;
      t23 += v * b10;
      t24 += v * b11;
      t25 += v * b12;
      t26 += v * b13;
      t27 += v * b14;
      t28 += v * b15;
      v = a[14];
      t14 += v * b0;
      t15 += v * b1;
      t16 += v * b2;
      t17 += v * b3;
      t18 += v * b4;
      t19 += v * b5;
      t20 += v * b6;
      t21 += v * b7;
      t22 += v * b8;
      t23 += v * b9;
      t24 += v * b10;
      t25 += v * b11;
      t26 += v * b12;
      t27 += v * b13;
      t28 += v * b14;
      t29 += v * b15;
      v = a[15];
      t15 += v * b0;
      t16 += v * b1;
      t17 += v * b2;
      t18 += v * b3;
      t19 += v * b4;
      t20 += v * b5;
      t21 += v * b6;
      t22 += v * b7;
      t23 += v * b8;
      t24 += v * b9;
      t25 += v * b10;
      t26 += v * b11;
      t27 += v * b12;
      t28 += v * b13;
      t29 += v * b14;
      t30 += v * b15;

      t0  += 38 * t16;
      t1  += 38 * t17;
      t2  += 38 * t18;
      t3  += 38 * t19;
      t4  += 38 * t20;
      t5  += 38 * t21;
      t6  += 38 * t22;
      t7  += 38 * t23;
      t8  += 38 * t24;
      t9  += 38 * t25;
      t10 += 38 * t26;
      t11 += 38 * t27;
      t12 += 38 * t28;
      t13 += 38 * t29;
      t14 += 38 * t30;
      // t15 left as is

      // first car
      c = 1;
      v =  t0 + c + 65535; c = Math.floor(v / 65536);  t0 = v - c * 65536;
      v =  t1 + c + 65535; c = Math.floor(v / 65536);  t1 = v - c * 65536;
      v =  t2 + c + 65535; c = Math.floor(v / 65536);  t2 = v - c * 65536;
      v =  t3 + c + 65535; c = Math.floor(v / 65536);  t3 = v - c * 65536;
      v =  t4 + c + 65535; c = Math.floor(v / 65536);  t4 = v - c * 65536;
      v =  t5 + c + 65535; c = Math.floor(v / 65536);  t5 = v - c * 65536;
      v =  t6 + c + 65535; c = Math.floor(v / 65536);  t6 = v - c * 65536;
      v =  t7 + c + 65535; c = Math.floor(v / 65536);  t7 = v - c * 65536;
      v =  t8 + c + 65535; c = Math.floor(v / 65536);  t8 = v - c * 65536;
      v =  t9 + c + 65535; c = Math.floor(v / 65536);  t9 = v - c * 65536;
      v = t10 + c + 65535; c = Math.floor(v / 65536); t10 = v - c * 65536;
      v = t11 + c + 65535; c = Math.floor(v / 65536); t11 = v - c * 65536;
      v = t12 + c + 65535; c = Math.floor(v / 65536); t12 = v - c * 65536;
      v = t13 + c + 65535; c = Math.floor(v / 65536); t13 = v - c * 65536;
      v = t14 + c + 65535; c = Math.floor(v / 65536); t14 = v - c * 65536;
      v = t15 + c + 65535; c = Math.floor(v / 65536); t15 = v - c * 65536;
      t0 += c-1 + 37 * (c-1);

      // second car
      c = 1;
      v =  t0 + c + 65535; c = Math.floor(v / 65536);  t0 = v - c * 65536;
      v =  t1 + c + 65535; c = Math.floor(v / 65536);  t1 = v - c * 65536;
      v =  t2 + c + 65535; c = Math.floor(v / 65536);  t2 = v - c * 65536;
      v =  t3 + c + 65535; c = Math.floor(v / 65536);  t3 = v - c * 65536;
      v =  t4 + c + 65535; c = Math.floor(v / 65536);  t4 = v - c * 65536;
      v =  t5 + c + 65535; c = Math.floor(v / 65536);  t5 = v - c * 65536;
      v =  t6 + c + 65535; c = Math.floor(v / 65536);  t6 = v - c * 65536;
      v =  t7 + c + 65535; c = Math.floor(v / 65536);  t7 = v - c * 65536;
      v =  t8 + c + 65535; c = Math.floor(v / 65536);  t8 = v - c * 65536;
      v =  t9 + c + 65535; c = Math.floor(v / 65536);  t9 = v - c * 65536;
      v = t10 + c + 65535; c = Math.floor(v / 65536); t10 = v - c * 65536;
      v = t11 + c + 65535; c = Math.floor(v / 65536); t11 = v - c * 65536;
      v = t12 + c + 65535; c = Math.floor(v / 65536); t12 = v - c * 65536;
      v = t13 + c + 65535; c = Math.floor(v / 65536); t13 = v - c * 65536;
      v = t14 + c + 65535; c = Math.floor(v / 65536); t14 = v - c * 65536;
      v = t15 + c + 65535; c = Math.floor(v / 65536); t15 = v - c * 65536;
      t0 += c-1 + 37 * (c-1);

      o[ 0] = t0;
      o[ 1] = t1;
      o[ 2] = t2;
      o[ 3] = t3;
      o[ 4] = t4;
      o[ 5] = t5;
      o[ 6] = t6;
      o[ 7] = t7;
      o[ 8] = t8;
      o[ 9] = t9;
      o[10] = t10;
      o[11] = t11;
      o[12] = t12;
      o[13] = t13;
      o[14] = t14;
      o[15] = t15;
    }

    function S(o, a) {
      M(o, a, a);
    }

    function inv25519(o, i) {
      var c = gf();
      var a;
      for (a = 0; a < 16; a++) c[a] = i[a];
      for (a = 253; a >= 0; a--) {
        S(c, c);
        if(a !== 2 && a !== 4) M(c, c, i);
      }
      for (a = 0; a < 16; a++) o[a] = c[a];
    }

    function pow2523(o, i) {
      var c = gf();
      var a;
      for (a = 0; a < 16; a++) c[a] = i[a];
      for (a = 250; a >= 0; a--) {
          S(c, c);
          if(a !== 1) M(c, c, i);
      }
      for (a = 0; a < 16; a++) o[a] = c[a];
    }

    function crypto_scalarmult(q, n, p) {
      var z = new Uint8Array(32);
      var x = new Float64Array(80), r, i;
      var a = gf(), b = gf(), c = gf(),
          d = gf(), e = gf(), f = gf();
      for (i = 0; i < 31; i++) z[i] = n[i];
      z[31]=(n[31]&127)|64;
      z[0]&=248;
      unpack25519(x,p);
      for (i = 0; i < 16; i++) {
        b[i]=x[i];
        d[i]=a[i]=c[i]=0;
      }
      a[0]=d[0]=1;
      for (i=254; i>=0; --i) {
        r=(z[i>>>3]>>>(i&7))&1;
        sel25519(a,b,r);
        sel25519(c,d,r);
        A(e,a,c);
        Z(a,a,c);
        A(c,b,d);
        Z(b,b,d);
        S(d,e);
        S(f,a);
        M(a,c,a);
        M(c,b,e);
        A(e,a,c);
        Z(a,a,c);
        S(b,a);
        Z(c,d,f);
        M(a,c,_121665);
        A(a,a,d);
        M(c,c,a);
        M(a,d,f);
        M(d,b,x);
        S(b,e);
        sel25519(a,b,r);
        sel25519(c,d,r);
      }
      for (i = 0; i < 16; i++) {
        x[i+16]=a[i];
        x[i+32]=c[i];
        x[i+48]=b[i];
        x[i+64]=d[i];
      }
      var x32 = x.subarray(32);
      var x16 = x.subarray(16);
      inv25519(x32,x32);
      M(x16,x16,x32);
      pack25519(q,x16);
      return 0;
    }

    function crypto_scalarmult_base(q, n) {
      return crypto_scalarmult(q, n, _9);
    }

    function crypto_box_keypair(y, x) {
      randombytes(x, 32);
      return crypto_scalarmult_base(y, x);
    }

    function crypto_box_beforenm(k, y, x) {
      var s = new Uint8Array(32);
      crypto_scalarmult(s, x, y);
      return crypto_core_hsalsa20(k, _0, s, sigma);
    }

    var crypto_box_afternm = crypto_secretbox;
    var crypto_box_open_afternm = crypto_secretbox_open;

    function crypto_box(c, m, d, n, y, x) {
      var k = new Uint8Array(32);
      crypto_box_beforenm(k, y, x);
      return crypto_box_afternm(c, m, d, n, k);
    }

    function crypto_box_open(m, c, d, n, y, x) {
      var k = new Uint8Array(32);
      crypto_box_beforenm(k, y, x);
      return crypto_box_open_afternm(m, c, d, n, k);
    }

    var K = [
      0x428a2f98, 0xd728ae22, 0x71374491, 0x23ef65cd,
      0xb5c0fbcf, 0xec4d3b2f, 0xe9b5dba5, 0x8189dbbc,
      0x3956c25b, 0xf348b538, 0x59f111f1, 0xb605d019,
      0x923f82a4, 0xaf194f9b, 0xab1c5ed5, 0xda6d8118,
      0xd807aa98, 0xa3030242, 0x12835b01, 0x45706fbe,
      0x243185be, 0x4ee4b28c, 0x550c7dc3, 0xd5ffb4e2,
      0x72be5d74, 0xf27b896f, 0x80deb1fe, 0x3b1696b1,
      0x9bdc06a7, 0x25c71235, 0xc19bf174, 0xcf692694,
      0xe49b69c1, 0x9ef14ad2, 0xefbe4786, 0x384f25e3,
      0x0fc19dc6, 0x8b8cd5b5, 0x240ca1cc, 0x77ac9c65,
      0x2de92c6f, 0x592b0275, 0x4a7484aa, 0x6ea6e483,
      0x5cb0a9dc, 0xbd41fbd4, 0x76f988da, 0x831153b5,
      0x983e5152, 0xee66dfab, 0xa831c66d, 0x2db43210,
      0xb00327c8, 0x98fb213f, 0xbf597fc7, 0xbeef0ee4,
      0xc6e00bf3, 0x3da88fc2, 0xd5a79147, 0x930aa725,
      0x06ca6351, 0xe003826f, 0x14292967, 0x0a0e6e70,
      0x27b70a85, 0x46d22ffc, 0x2e1b2138, 0x5c26c926,
      0x4d2c6dfc, 0x5ac42aed, 0x53380d13, 0x9d95b3df,
      0x650a7354, 0x8baf63de, 0x766a0abb, 0x3c77b2a8,
      0x81c2c92e, 0x47edaee6, 0x92722c85, 0x1482353b,
      0xa2bfe8a1, 0x4cf10364, 0xa81a664b, 0xbc423001,
      0xc24b8b70, 0xd0f89791, 0xc76c51a3, 0x0654be30,
      0xd192e819, 0xd6ef5218, 0xd6990624, 0x5565a910,
      0xf40e3585, 0x5771202a, 0x106aa070, 0x32bbd1b8,
      0x19a4c116, 0xb8d2d0c8, 0x1e376c08, 0x5141ab53,
      0x2748774c, 0xdf8eeb99, 0x34b0bcb5, 0xe19b48a8,
      0x391c0cb3, 0xc5c95a63, 0x4ed8aa4a, 0xe3418acb,
      0x5b9cca4f, 0x7763e373, 0x682e6ff3, 0xd6b2b8a3,
      0x748f82ee, 0x5defb2fc, 0x78a5636f, 0x43172f60,
      0x84c87814, 0xa1f0ab72, 0x8cc70208, 0x1a6439ec,
      0x90befffa, 0x23631e28, 0xa4506ceb, 0xde82bde9,
      0xbef9a3f7, 0xb2c67915, 0xc67178f2, 0xe372532b,
      0xca273ece, 0xea26619c, 0xd186b8c7, 0x21c0c207,
      0xeada7dd6, 0xcde0eb1e, 0xf57d4f7f, 0xee6ed178,
      0x06f067aa, 0x72176fba, 0x0a637dc5, 0xa2c898a6,
      0x113f9804, 0xbef90dae, 0x1b710b35, 0x131c471b,
      0x28db77f5, 0x23047d84, 0x32caab7b, 0x40c72493,
      0x3c9ebe0a, 0x15c9bebc, 0x431d67c4, 0x9c100d4c,
      0x4cc5d4be, 0xcb3e42b6, 0x597f299c, 0xfc657e2a,
      0x5fcb6fab, 0x3ad6faec, 0x6c44198c, 0x4a475817
    ];

    function crypto_hashblocks_hl(hh, hl, m, n) {
      var wh = new Int32Array(16), wl = new Int32Array(16),
          bh0, bh1, bh2, bh3, bh4, bh5, bh6, bh7,
          bl0, bl1, bl2, bl3, bl4, bl5, bl6, bl7,
          th, tl, i, j, h, l, a, b, c, d;

      var ah0 = hh[0],
          ah1 = hh[1],
          ah2 = hh[2],
          ah3 = hh[3],
          ah4 = hh[4],
          ah5 = hh[5],
          ah6 = hh[6],
          ah7 = hh[7],

          al0 = hl[0],
          al1 = hl[1],
          al2 = hl[2],
          al3 = hl[3],
          al4 = hl[4],
          al5 = hl[5],
          al6 = hl[6],
          al7 = hl[7];

      var pos = 0;
      while (n >= 128) {
        for (i = 0; i < 16; i++) {
          j = 8 * i + pos;
          wh[i] = (m[j+0] << 24) | (m[j+1] << 16) | (m[j+2] << 8) | m[j+3];
          wl[i] = (m[j+4] << 24) | (m[j+5] << 16) | (m[j+6] << 8) | m[j+7];
        }
        for (i = 0; i < 80; i++) {
          bh0 = ah0;
          bh1 = ah1;
          bh2 = ah2;
          bh3 = ah3;
          bh4 = ah4;
          bh5 = ah5;
          bh6 = ah6;
          bh7 = ah7;

          bl0 = al0;
          bl1 = al1;
          bl2 = al2;
          bl3 = al3;
          bl4 = al4;
          bl5 = al5;
          bl6 = al6;
          bl7 = al7;

          // add
          h = ah7;
          l = al7;

          a = l & 0xffff; b = l >>> 16;
          c = h & 0xffff; d = h >>> 16;

          // Sigma1
          h = ((ah4 >>> 14) | (al4 << (32-14))) ^ ((ah4 >>> 18) | (al4 << (32-18))) ^ ((al4 >>> (41-32)) | (ah4 << (32-(41-32))));
          l = ((al4 >>> 14) | (ah4 << (32-14))) ^ ((al4 >>> 18) | (ah4 << (32-18))) ^ ((ah4 >>> (41-32)) | (al4 << (32-(41-32))));

          a += l & 0xffff; b += l >>> 16;
          c += h & 0xffff; d += h >>> 16;

          // Ch
          h = (ah4 & ah5) ^ (~ah4 & ah6);
          l = (al4 & al5) ^ (~al4 & al6);

          a += l & 0xffff; b += l >>> 16;
          c += h & 0xffff; d += h >>> 16;

          // K
          h = K[i*2];
          l = K[i*2+1];

          a += l & 0xffff; b += l >>> 16;
          c += h & 0xffff; d += h >>> 16;

          // w
          h = wh[i%16];
          l = wl[i%16];

          a += l & 0xffff; b += l >>> 16;
          c += h & 0xffff; d += h >>> 16;

          b += a >>> 16;
          c += b >>> 16;
          d += c >>> 16;

          th = c & 0xffff | d << 16;
          tl = a & 0xffff | b << 16;

          // add
          h = th;
          l = tl;

          a = l & 0xffff; b = l >>> 16;
          c = h & 0xffff; d = h >>> 16;

          // Sigma0
          h = ((ah0 >>> 28) | (al0 << (32-28))) ^ ((al0 >>> (34-32)) | (ah0 << (32-(34-32)))) ^ ((al0 >>> (39-32)) | (ah0 << (32-(39-32))));
          l = ((al0 >>> 28) | (ah0 << (32-28))) ^ ((ah0 >>> (34-32)) | (al0 << (32-(34-32)))) ^ ((ah0 >>> (39-32)) | (al0 << (32-(39-32))));

          a += l & 0xffff; b += l >>> 16;
          c += h & 0xffff; d += h >>> 16;

          // Maj
          h = (ah0 & ah1) ^ (ah0 & ah2) ^ (ah1 & ah2);
          l = (al0 & al1) ^ (al0 & al2) ^ (al1 & al2);

          a += l & 0xffff; b += l >>> 16;
          c += h & 0xffff; d += h >>> 16;

          b += a >>> 16;
          c += b >>> 16;
          d += c >>> 16;

          bh7 = (c & 0xffff) | (d << 16);
          bl7 = (a & 0xffff) | (b << 16);

          // add
          h = bh3;
          l = bl3;

          a = l & 0xffff; b = l >>> 16;
          c = h & 0xffff; d = h >>> 16;

          h = th;
          l = tl;

          a += l & 0xffff; b += l >>> 16;
          c += h & 0xffff; d += h >>> 16;

          b += a >>> 16;
          c += b >>> 16;
          d += c >>> 16;

          bh3 = (c & 0xffff) | (d << 16);
          bl3 = (a & 0xffff) | (b << 16);

          ah1 = bh0;
          ah2 = bh1;
          ah3 = bh2;
          ah4 = bh3;
          ah5 = bh4;
          ah6 = bh5;
          ah7 = bh6;
          ah0 = bh7;

          al1 = bl0;
          al2 = bl1;
          al3 = bl2;
          al4 = bl3;
          al5 = bl4;
          al6 = bl5;
          al7 = bl6;
          al0 = bl7;

          if (i%16 === 15) {
            for (j = 0; j < 16; j++) {
              // add
              h = wh[j];
              l = wl[j];

              a = l & 0xffff; b = l >>> 16;
              c = h & 0xffff; d = h >>> 16;

              h = wh[(j+9)%16];
              l = wl[(j+9)%16];

              a += l & 0xffff; b += l >>> 16;
              c += h & 0xffff; d += h >>> 16;

              // sigma0
              th = wh[(j+1)%16];
              tl = wl[(j+1)%16];
              h = ((th >>> 1) | (tl << (32-1))) ^ ((th >>> 8) | (tl << (32-8))) ^ (th >>> 7);
              l = ((tl >>> 1) | (th << (32-1))) ^ ((tl >>> 8) | (th << (32-8))) ^ ((tl >>> 7) | (th << (32-7)));

              a += l & 0xffff; b += l >>> 16;
              c += h & 0xffff; d += h >>> 16;

              // sigma1
              th = wh[(j+14)%16];
              tl = wl[(j+14)%16];
              h = ((th >>> 19) | (tl << (32-19))) ^ ((tl >>> (61-32)) | (th << (32-(61-32)))) ^ (th >>> 6);
              l = ((tl >>> 19) | (th << (32-19))) ^ ((th >>> (61-32)) | (tl << (32-(61-32)))) ^ ((tl >>> 6) | (th << (32-6)));

              a += l & 0xffff; b += l >>> 16;
              c += h & 0xffff; d += h >>> 16;

              b += a >>> 16;
              c += b >>> 16;
              d += c >>> 16;

              wh[j] = (c & 0xffff) | (d << 16);
              wl[j] = (a & 0xffff) | (b << 16);
            }
          }
        }

        // add
        h = ah0;
        l = al0;

        a = l & 0xffff; b = l >>> 16;
        c = h & 0xffff; d = h >>> 16;

        h = hh[0];
        l = hl[0];

        a += l & 0xffff; b += l >>> 16;
        c += h & 0xffff; d += h >>> 16;

        b += a >>> 16;
        c += b >>> 16;
        d += c >>> 16;

        hh[0] = ah0 = (c & 0xffff) | (d << 16);
        hl[0] = al0 = (a & 0xffff) | (b << 16);

        h = ah1;
        l = al1;

        a = l & 0xffff; b = l >>> 16;
        c = h & 0xffff; d = h >>> 16;

        h = hh[1];
        l = hl[1];

        a += l & 0xffff; b += l >>> 16;
        c += h & 0xffff; d += h >>> 16;

        b += a >>> 16;
        c += b >>> 16;
        d += c >>> 16;

        hh[1] = ah1 = (c & 0xffff) | (d << 16);
        hl[1] = al1 = (a & 0xffff) | (b << 16);

        h = ah2;
        l = al2;

        a = l & 0xffff; b = l >>> 16;
        c = h & 0xffff; d = h >>> 16;

        h = hh[2];
        l = hl[2];

        a += l & 0xffff; b += l >>> 16;
        c += h & 0xffff; d += h >>> 16;

        b += a >>> 16;
        c += b >>> 16;
        d += c >>> 16;

        hh[2] = ah2 = (c & 0xffff) | (d << 16);
        hl[2] = al2 = (a & 0xffff) | (b << 16);

        h = ah3;
        l = al3;

        a = l & 0xffff; b = l >>> 16;
        c = h & 0xffff; d = h >>> 16;

        h = hh[3];
        l = hl[3];

        a += l & 0xffff; b += l >>> 16;
        c += h & 0xffff; d += h >>> 16;

        b += a >>> 16;
        c += b >>> 16;
        d += c >>> 16;

        hh[3] = ah3 = (c & 0xffff) | (d << 16);
        hl[3] = al3 = (a & 0xffff) | (b << 16);

        h = ah4;
        l = al4;

        a = l & 0xffff; b = l >>> 16;
        c = h & 0xffff; d = h >>> 16;

        h = hh[4];
        l = hl[4];

        a += l & 0xffff; b += l >>> 16;
        c += h & 0xffff; d += h >>> 16;

        b += a >>> 16;
        c += b >>> 16;
        d += c >>> 16;

        hh[4] = ah4 = (c & 0xffff) | (d << 16);
        hl[4] = al4 = (a & 0xffff) | (b << 16);

        h = ah5;
        l = al5;

        a = l & 0xffff; b = l >>> 16;
        c = h & 0xffff; d = h >>> 16;

        h = hh[5];
        l = hl[5];

        a += l & 0xffff; b += l >>> 16;
        c += h & 0xffff; d += h >>> 16;

        b += a >>> 16;
        c += b >>> 16;
        d += c >>> 16;

        hh[5] = ah5 = (c & 0xffff) | (d << 16);
        hl[5] = al5 = (a & 0xffff) | (b << 16);

        h = ah6;
        l = al6;

        a = l & 0xffff; b = l >>> 16;
        c = h & 0xffff; d = h >>> 16;

        h = hh[6];
        l = hl[6];

        a += l & 0xffff; b += l >>> 16;
        c += h & 0xffff; d += h >>> 16;

        b += a >>> 16;
        c += b >>> 16;
        d += c >>> 16;

        hh[6] = ah6 = (c & 0xffff) | (d << 16);
        hl[6] = al6 = (a & 0xffff) | (b << 16);

        h = ah7;
        l = al7;

        a = l & 0xffff; b = l >>> 16;
        c = h & 0xffff; d = h >>> 16;

        h = hh[7];
        l = hl[7];

        a += l & 0xffff; b += l >>> 16;
        c += h & 0xffff; d += h >>> 16;

        b += a >>> 16;
        c += b >>> 16;
        d += c >>> 16;

        hh[7] = ah7 = (c & 0xffff) | (d << 16);
        hl[7] = al7 = (a & 0xffff) | (b << 16);

        pos += 128;
        n -= 128;
      }

      return n;
    }

    function crypto_hash(out, m, n) {
      var hh = new Int32Array(8),
          hl = new Int32Array(8),
          x = new Uint8Array(256),
          i, b = n;

      hh[0] = 0x6a09e667;
      hh[1] = 0xbb67ae85;
      hh[2] = 0x3c6ef372;
      hh[3] = 0xa54ff53a;
      hh[4] = 0x510e527f;
      hh[5] = 0x9b05688c;
      hh[6] = 0x1f83d9ab;
      hh[7] = 0x5be0cd19;

      hl[0] = 0xf3bcc908;
      hl[1] = 0x84caa73b;
      hl[2] = 0xfe94f82b;
      hl[3] = 0x5f1d36f1;
      hl[4] = 0xade682d1;
      hl[5] = 0x2b3e6c1f;
      hl[6] = 0xfb41bd6b;
      hl[7] = 0x137e2179;

      crypto_hashblocks_hl(hh, hl, m, n);
      n %= 128;

      for (i = 0; i < n; i++) x[i] = m[b-n+i];
      x[n] = 128;

      n = 256-128*(n<112?1:0);
      x[n-9] = 0;
      ts64(x, n-8,  (b / 0x20000000) | 0, b << 3);
      crypto_hashblocks_hl(hh, hl, x, n);

      for (i = 0; i < 8; i++) ts64(out, 8*i, hh[i], hl[i]);

      return 0;
    }

    function add(p, q) {
      var a = gf(), b = gf(), c = gf(),
          d = gf(), e = gf(), f = gf(),
          g = gf(), h = gf(), t = gf();

      Z(a, p[1], p[0]);
      Z(t, q[1], q[0]);
      M(a, a, t);
      A(b, p[0], p[1]);
      A(t, q[0], q[1]);
      M(b, b, t);
      M(c, p[3], q[3]);
      M(c, c, D2);
      M(d, p[2], q[2]);
      A(d, d, d);
      Z(e, b, a);
      Z(f, d, c);
      A(g, d, c);
      A(h, b, a);

      M(p[0], e, f);
      M(p[1], h, g);
      M(p[2], g, f);
      M(p[3], e, h);
    }

    function cswap(p, q, b) {
      var i;
      for (i = 0; i < 4; i++) {
        sel25519(p[i], q[i], b);
      }
    }

    function pack(r, p) {
      var tx = gf(), ty = gf(), zi = gf();
      inv25519(zi, p[2]);
      M(tx, p[0], zi);
      M(ty, p[1], zi);
      pack25519(r, ty);
      r[31] ^= par25519(tx) << 7;
    }

    function scalarmult(p, q, s) {
      var b, i;
      set25519(p[0], gf0);
      set25519(p[1], gf1);
      set25519(p[2], gf1);
      set25519(p[3], gf0);
      for (i = 255; i >= 0; --i) {
        b = (s[(i/8)|0] >> (i&7)) & 1;
        cswap(p, q, b);
        add(q, p);
        add(p, p);
        cswap(p, q, b);
      }
    }

    function scalarbase(p, s) {
      var q = [gf(), gf(), gf(), gf()];
      set25519(q[0], X);
      set25519(q[1], Y);
      set25519(q[2], gf1);
      M(q[3], X, Y);
      scalarmult(p, q, s);
    }

    function crypto_sign_keypair(pk, sk, seeded) {
      var d = new Uint8Array(64);
      var p = [gf(), gf(), gf(), gf()];
      var i;

      if (!seeded) randombytes(sk, 32);
      crypto_hash(d, sk, 32);
      d[0] &= 248;
      d[31] &= 127;
      d[31] |= 64;

      scalarbase(p, d);
      pack(pk, p);

      for (i = 0; i < 32; i++) sk[i+32] = pk[i];
      return 0;
    }

    var L = new Float64Array([0xed, 0xd3, 0xf5, 0x5c, 0x1a, 0x63, 0x12, 0x58, 0xd6, 0x9c, 0xf7, 0xa2, 0xde, 0xf9, 0xde, 0x14, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0x10]);

    function modL(r, x) {
      var carry, i, j, k;
      for (i = 63; i >= 32; --i) {
        carry = 0;
        for (j = i - 32, k = i - 12; j < k; ++j) {
          x[j] += carry - 16 * x[i] * L[j - (i - 32)];
          carry = Math.floor((x[j] + 128) / 256);
          x[j] -= carry * 256;
        }
        x[j] += carry;
        x[i] = 0;
      }
      carry = 0;
      for (j = 0; j < 32; j++) {
        x[j] += carry - (x[31] >> 4) * L[j];
        carry = x[j] >> 8;
        x[j] &= 255;
      }
      for (j = 0; j < 32; j++) x[j] -= carry * L[j];
      for (i = 0; i < 32; i++) {
        x[i+1] += x[i] >> 8;
        r[i] = x[i] & 255;
      }
    }

    function reduce(r) {
      var x = new Float64Array(64), i;
      for (i = 0; i < 64; i++) x[i] = r[i];
      for (i = 0; i < 64; i++) r[i] = 0;
      modL(r, x);
    }

    // Note: difference from C - smlen returned, not passed as argument.
    function crypto_sign(sm, m, n, sk) {
      var d = new Uint8Array(64), h = new Uint8Array(64), r = new Uint8Array(64);
      var i, j, x = new Float64Array(64);
      var p = [gf(), gf(), gf(), gf()];

      crypto_hash(d, sk, 32);
      d[0] &= 248;
      d[31] &= 127;
      d[31] |= 64;

      var smlen = n + 64;
      for (i = 0; i < n; i++) sm[64 + i] = m[i];
      for (i = 0; i < 32; i++) sm[32 + i] = d[32 + i];

      crypto_hash(r, sm.subarray(32), n+32);
      reduce(r);
      scalarbase(p, r);
      pack(sm, p);

      for (i = 32; i < 64; i++) sm[i] = sk[i];
      crypto_hash(h, sm, n + 64);
      reduce(h);

      for (i = 0; i < 64; i++) x[i] = 0;
      for (i = 0; i < 32; i++) x[i] = r[i];
      for (i = 0; i < 32; i++) {
        for (j = 0; j < 32; j++) {
          x[i+j] += h[i] * d[j];
        }
      }

      modL(sm.subarray(32), x);
      return smlen;
    }

    function unpackneg(r, p) {
      var t = gf(), chk = gf(), num = gf(),
          den = gf(), den2 = gf(), den4 = gf(),
          den6 = gf();

      set25519(r[2], gf1);
      unpack25519(r[1], p);
      S(num, r[1]);
      M(den, num, D);
      Z(num, num, r[2]);
      A(den, r[2], den);

      S(den2, den);
      S(den4, den2);
      M(den6, den4, den2);
      M(t, den6, num);
      M(t, t, den);

      pow2523(t, t);
      M(t, t, num);
      M(t, t, den);
      M(t, t, den);
      M(r[0], t, den);

      S(chk, r[0]);
      M(chk, chk, den);
      if (neq25519(chk, num)) M(r[0], r[0], I);

      S(chk, r[0]);
      M(chk, chk, den);
      if (neq25519(chk, num)) return -1;

      if (par25519(r[0]) === (p[31]>>7)) Z(r[0], gf0, r[0]);

      M(r[3], r[0], r[1]);
      return 0;
    }

    function crypto_sign_open(m, sm, n, pk) {
      var i;
      var t = new Uint8Array(32), h = new Uint8Array(64);
      var p = [gf(), gf(), gf(), gf()],
          q = [gf(), gf(), gf(), gf()];

      if (n < 64) return -1;

      if (unpackneg(q, pk)) return -1;

      for (i = 0; i < n; i++) m[i] = sm[i];
      for (i = 0; i < 32; i++) m[i+32] = pk[i];
      crypto_hash(h, m, n);
      reduce(h);
      scalarmult(p, q, h);

      scalarbase(q, sm.subarray(32));
      add(p, q);
      pack(t, p);

      n -= 64;
      if (crypto_verify_32(sm, 0, t, 0)) {
        for (i = 0; i < n; i++) m[i] = 0;
        return -1;
      }

      for (i = 0; i < n; i++) m[i] = sm[i + 64];
      return n;
    }

    var crypto_secretbox_KEYBYTES = 32,
        crypto_secretbox_NONCEBYTES = 24,
        crypto_secretbox_ZEROBYTES = 32,
        crypto_secretbox_BOXZEROBYTES = 16,
        crypto_scalarmult_BYTES = 32,
        crypto_scalarmult_SCALARBYTES = 32,
        crypto_box_PUBLICKEYBYTES = 32,
        crypto_box_SECRETKEYBYTES = 32,
        crypto_box_BEFORENMBYTES = 32,
        crypto_box_NONCEBYTES = crypto_secretbox_NONCEBYTES,
        crypto_box_ZEROBYTES = crypto_secretbox_ZEROBYTES,
        crypto_box_BOXZEROBYTES = crypto_secretbox_BOXZEROBYTES,
        crypto_sign_BYTES = 64,
        crypto_sign_PUBLICKEYBYTES = 32,
        crypto_sign_SECRETKEYBYTES = 64,
        crypto_sign_SEEDBYTES = 32,
        crypto_hash_BYTES = 64;

    nacl.lowlevel = {
      crypto_core_hsalsa20: crypto_core_hsalsa20,
      crypto_stream_xor: crypto_stream_xor,
      crypto_stream: crypto_stream,
      crypto_stream_salsa20_xor: crypto_stream_salsa20_xor,
      crypto_stream_salsa20: crypto_stream_salsa20,
      crypto_onetimeauth: crypto_onetimeauth,
      crypto_onetimeauth_verify: crypto_onetimeauth_verify,
      crypto_verify_16: crypto_verify_16,
      crypto_verify_32: crypto_verify_32,
      crypto_secretbox: crypto_secretbox,
      crypto_secretbox_open: crypto_secretbox_open,
      crypto_scalarmult: crypto_scalarmult,
      crypto_scalarmult_base: crypto_scalarmult_base,
      crypto_box_beforenm: crypto_box_beforenm,
      crypto_box_afternm: crypto_box_afternm,
      crypto_box: crypto_box,
      crypto_box_open: crypto_box_open,
      crypto_box_keypair: crypto_box_keypair,
      crypto_hash: crypto_hash,
      crypto_sign: crypto_sign,
      crypto_sign_keypair: crypto_sign_keypair,
      crypto_sign_open: crypto_sign_open,

      crypto_secretbox_KEYBYTES: crypto_secretbox_KEYBYTES,
      crypto_secretbox_NONCEBYTES: crypto_secretbox_NONCEBYTES,
      crypto_secretbox_ZEROBYTES: crypto_secretbox_ZEROBYTES,
      crypto_secretbox_BOXZEROBYTES: crypto_secretbox_BOXZEROBYTES,
      crypto_scalarmult_BYTES: crypto_scalarmult_BYTES,
      crypto_scalarmult_SCALARBYTES: crypto_scalarmult_SCALARBYTES,
      crypto_box_PUBLICKEYBYTES: crypto_box_PUBLICKEYBYTES,
      crypto_box_SECRETKEYBYTES: crypto_box_SECRETKEYBYTES,
      crypto_box_BEFORENMBYTES: crypto_box_BEFORENMBYTES,
      crypto_box_NONCEBYTES: crypto_box_NONCEBYTES,
      crypto_box_ZEROBYTES: crypto_box_ZEROBYTES,
      crypto_box_BOXZEROBYTES: crypto_box_BOXZEROBYTES,
      crypto_sign_BYTES: crypto_sign_BYTES,
      crypto_sign_PUBLICKEYBYTES: crypto_sign_PUBLICKEYBYTES,
      crypto_sign_SECRETKEYBYTES: crypto_sign_SECRETKEYBYTES,
      crypto_sign_SEEDBYTES: crypto_sign_SEEDBYTES,
      crypto_hash_BYTES: crypto_hash_BYTES,

      gf: gf,
      D: D,
      L: L,
      pack25519: pack25519,
      unpack25519: unpack25519,
      M: M,
      A: A,
      S: S,
      Z: Z,
      pow2523: pow2523,
      add: add,
      set25519: set25519,
      modL: modL,
      scalarmult: scalarmult,
      scalarbase: scalarbase,
    };

    /* High-level API */

    function checkLengths(k, n) {
      if (k.length !== crypto_secretbox_KEYBYTES) throw new Error('bad key size');
      if (n.length !== crypto_secretbox_NONCEBYTES) throw new Error('bad nonce size');
    }

    function checkBoxLengths(pk, sk) {
      if (pk.length !== crypto_box_PUBLICKEYBYTES) throw new Error('bad public key size');
      if (sk.length !== crypto_box_SECRETKEYBYTES) throw new Error('bad secret key size');
    }

    function checkArrayTypes() {
      for (var i = 0; i < arguments.length; i++) {
        if (!(arguments[i] instanceof Uint8Array))
          throw new TypeError('unexpected type, use Uint8Array');
      }
    }

    function cleanup(arr) {
      for (var i = 0; i < arr.length; i++) arr[i] = 0;
    }

    nacl.randomBytes = function(n) {
      var b = new Uint8Array(n);
      randombytes(b, n);
      return b;
    };

    nacl.secretbox = function(msg, nonce, key) {
      checkArrayTypes(msg, nonce, key);
      checkLengths(key, nonce);
      var m = new Uint8Array(crypto_secretbox_ZEROBYTES + msg.length);
      var c = new Uint8Array(m.length);
      for (var i = 0; i < msg.length; i++) m[i+crypto_secretbox_ZEROBYTES] = msg[i];
      crypto_secretbox(c, m, m.length, nonce, key);
      return c.subarray(crypto_secretbox_BOXZEROBYTES);
    };

    nacl.secretbox.open = function(box, nonce, key) {
      checkArrayTypes(box, nonce, key);
      checkLengths(key, nonce);
      var c = new Uint8Array(crypto_secretbox_BOXZEROBYTES + box.length);
      var m = new Uint8Array(c.length);
      for (var i = 0; i < box.length; i++) c[i+crypto_secretbox_BOXZEROBYTES] = box[i];
      if (c.length < 32) return null;
      if (crypto_secretbox_open(m, c, c.length, nonce, key) !== 0) return null;
      return m.subarray(crypto_secretbox_ZEROBYTES);
    };

    nacl.secretbox.keyLength = crypto_secretbox_KEYBYTES;
    nacl.secretbox.nonceLength = crypto_secretbox_NONCEBYTES;
    nacl.secretbox.overheadLength = crypto_secretbox_BOXZEROBYTES;

    nacl.scalarMult = function(n, p) {
      checkArrayTypes(n, p);
      if (n.length !== crypto_scalarmult_SCALARBYTES) throw new Error('bad n size');
      if (p.length !== crypto_scalarmult_BYTES) throw new Error('bad p size');
      var q = new Uint8Array(crypto_scalarmult_BYTES);
      crypto_scalarmult(q, n, p);
      return q;
    };

    nacl.scalarMult.base = function(n) {
      checkArrayTypes(n);
      if (n.length !== crypto_scalarmult_SCALARBYTES) throw new Error('bad n size');
      var q = new Uint8Array(crypto_scalarmult_BYTES);
      crypto_scalarmult_base(q, n);
      return q;
    };

    nacl.scalarMult.scalarLength = crypto_scalarmult_SCALARBYTES;
    nacl.scalarMult.groupElementLength = crypto_scalarmult_BYTES;

    nacl.box = function(msg, nonce, publicKey, secretKey) {
      var k = nacl.box.before(publicKey, secretKey);
      return nacl.secretbox(msg, nonce, k);
    };

    nacl.box.before = function(publicKey, secretKey) {
      checkArrayTypes(publicKey, secretKey);
      checkBoxLengths(publicKey, secretKey);
      var k = new Uint8Array(crypto_box_BEFORENMBYTES);
      crypto_box_beforenm(k, publicKey, secretKey);
      return k;
    };

    nacl.box.after = nacl.secretbox;

    nacl.box.open = function(msg, nonce, publicKey, secretKey) {
      var k = nacl.box.before(publicKey, secretKey);
      return nacl.secretbox.open(msg, nonce, k);
    };

    nacl.box.open.after = nacl.secretbox.open;

    nacl.box.keyPair = function() {
      var pk = new Uint8Array(crypto_box_PUBLICKEYBYTES);
      var sk = new Uint8Array(crypto_box_SECRETKEYBYTES);
      crypto_box_keypair(pk, sk);
      return {publicKey: pk, secretKey: sk};
    };

    nacl.box.keyPair.fromSecretKey = function(secretKey) {
      checkArrayTypes(secretKey);
      if (secretKey.length !== crypto_box_SECRETKEYBYTES)
        throw new Error('bad secret key size');
      var pk = new Uint8Array(crypto_box_PUBLICKEYBYTES);
      crypto_scalarmult_base(pk, secretKey);
      return {publicKey: pk, secretKey: new Uint8Array(secretKey)};
    };

    nacl.box.publicKeyLength = crypto_box_PUBLICKEYBYTES;
    nacl.box.secretKeyLength = crypto_box_SECRETKEYBYTES;
    nacl.box.sharedKeyLength = crypto_box_BEFORENMBYTES;
    nacl.box.nonceLength = crypto_box_NONCEBYTES;
    nacl.box.overheadLength = nacl.secretbox.overheadLength;

    nacl.sign = function(msg, secretKey) {
      checkArrayTypes(msg, secretKey);
      if (secretKey.length !== crypto_sign_SECRETKEYBYTES)
        throw new Error('bad secret key size');
      var signedMsg = new Uint8Array(crypto_sign_BYTES+msg.length);
      crypto_sign(signedMsg, msg, msg.length, secretKey);
      return signedMsg;
    };

    nacl.sign.open = function(signedMsg, publicKey) {
      checkArrayTypes(signedMsg, publicKey);
      if (publicKey.length !== crypto_sign_PUBLICKEYBYTES)
        throw new Error('bad public key size');
      var tmp = new Uint8Array(signedMsg.length);
      var mlen = crypto_sign_open(tmp, signedMsg, signedMsg.length, publicKey);
      if (mlen < 0) return null;
      var m = new Uint8Array(mlen);
      for (var i = 0; i < m.length; i++) m[i] = tmp[i];
      return m;
    };

    nacl.sign.detached = function(msg, secretKey) {
      var signedMsg = nacl.sign(msg, secretKey);
      var sig = new Uint8Array(crypto_sign_BYTES);
      for (var i = 0; i < sig.length; i++) sig[i] = signedMsg[i];
      return sig;
    };

    nacl.sign.detached.verify = function(msg, sig, publicKey) {
      checkArrayTypes(msg, sig, publicKey);
      if (sig.length !== crypto_sign_BYTES)
        throw new Error('bad signature size');
      if (publicKey.length !== crypto_sign_PUBLICKEYBYTES)
        throw new Error('bad public key size');
      var sm = new Uint8Array(crypto_sign_BYTES + msg.length);
      var m = new Uint8Array(crypto_sign_BYTES + msg.length);
      var i;
      for (i = 0; i < crypto_sign_BYTES; i++) sm[i] = sig[i];
      for (i = 0; i < msg.length; i++) sm[i+crypto_sign_BYTES] = msg[i];
      return (crypto_sign_open(m, sm, sm.length, publicKey) >= 0);
    };

    nacl.sign.keyPair = function() {
      var pk = new Uint8Array(crypto_sign_PUBLICKEYBYTES);
      var sk = new Uint8Array(crypto_sign_SECRETKEYBYTES);
      crypto_sign_keypair(pk, sk);
      return {publicKey: pk, secretKey: sk};
    };

    nacl.sign.keyPair.fromSecretKey = function(secretKey) {
      checkArrayTypes(secretKey);
      if (secretKey.length !== crypto_sign_SECRETKEYBYTES)
        throw new Error('bad secret key size');
      var pk = new Uint8Array(crypto_sign_PUBLICKEYBYTES);
      for (var i = 0; i < pk.length; i++) pk[i] = secretKey[32+i];
      return {publicKey: pk, secretKey: new Uint8Array(secretKey)};
    };

    nacl.sign.keyPair.fromSeed = function(seed) {
      checkArrayTypes(seed);
      if (seed.length !== crypto_sign_SEEDBYTES)
        throw new Error('bad seed size');
      var pk = new Uint8Array(crypto_sign_PUBLICKEYBYTES);
      var sk = new Uint8Array(crypto_sign_SECRETKEYBYTES);
      for (var i = 0; i < 32; i++) sk[i] = seed[i];
      crypto_sign_keypair(pk, sk, true);
      return {publicKey: pk, secretKey: sk};
    };

    nacl.sign.publicKeyLength = crypto_sign_PUBLICKEYBYTES;
    nacl.sign.secretKeyLength = crypto_sign_SECRETKEYBYTES;
    nacl.sign.seedLength = crypto_sign_SEEDBYTES;
    nacl.sign.signatureLength = crypto_sign_BYTES;

    nacl.hash = function(msg) {
      checkArrayTypes(msg);
      var h = new Uint8Array(crypto_hash_BYTES);
      crypto_hash(h, msg, msg.length);
      return h;
    };

    nacl.hash.hashLength = crypto_hash_BYTES;

    nacl.verify = function(x, y) {
      checkArrayTypes(x, y);
      // Zero length arguments are considered not equal.
      if (x.length === 0 || y.length === 0) return false;
      if (x.length !== y.length) return false;
      return (vn(x, 0, y, 0, x.length) === 0) ? true : false;
    };

    nacl.setPRNG = function(fn) {
      randombytes = fn;
    };

    (function() {
      // Initialize PRNG if environment provides CSPRNG.
      // If not, methods calling randombytes will throw.
      var crypto = typeof self !== 'undefined' ? (self.crypto || self.msCrypto) : null;
      if (crypto && crypto.getRandomValues) {
        // Browsers.
        var QUOTA = 65536;
        nacl.setPRNG(function(x, n) {
          var i, v = new Uint8Array(n);
          for (i = 0; i < n; i += QUOTA) {
            crypto.getRandomValues(v.subarray(i, i + Math.min(n - i, QUOTA)));
          }
          for (i = 0; i < n; i++) x[i] = v[i];
          cleanup(v);
        });
      } else if (typeof commonjsRequire !== 'undefined') {
        // Node.js.
        crypto = require$$0;
        if (crypto && crypto.randomBytes) {
          nacl.setPRNG(function(x, n) {
            var i, v = crypto.randomBytes(n);
            for (i = 0; i < n; i++) x[i] = v[i];
            cleanup(v);
          });
        }
      }
    })();

    })( module.exports ? module.exports : (self.nacl = self.nacl || {}));
    });

    var naclUtil = createCommonjsModule(function (module) {
    // Written in 2014-2016 by Dmitry Chestnykh and Devi Mandiri.
    // Public domain.
    (function(root, f) {
      if ( module.exports) module.exports = f();
      else if (root.nacl) root.nacl.util = f();
      else {
        root.nacl = {};
        root.nacl.util = f();
      }
    }(commonjsGlobal, function() {

      var util = {};

      function validateBase64(s) {
        if (!(/^(?:[A-Za-z0-9+\/]{2}[A-Za-z0-9+\/]{2})*(?:[A-Za-z0-9+\/]{2}==|[A-Za-z0-9+\/]{3}=)?$/.test(s))) {
          throw new TypeError('invalid encoding');
        }
      }

      util.decodeUTF8 = function(s) {
        if (typeof s !== 'string') throw new TypeError('expected string');
        var i, d = unescape(encodeURIComponent(s)), b = new Uint8Array(d.length);
        for (i = 0; i < d.length; i++) b[i] = d.charCodeAt(i);
        return b;
      };

      util.encodeUTF8 = function(arr) {
        var i, s = [];
        for (i = 0; i < arr.length; i++) s.push(String.fromCharCode(arr[i]));
        return decodeURIComponent(escape(s.join('')));
      };

      if (typeof atob === 'undefined') {
        // Node.js

        if (typeof Buffer.from !== 'undefined') {
           // Node v6 and later
          util.encodeBase64 = function (arr) { // v6 and later
              return Buffer.from(arr).toString('base64');
          };

          util.decodeBase64 = function (s) {
            validateBase64(s);
            return new Uint8Array(Array.prototype.slice.call(Buffer.from(s, 'base64'), 0));
          };

        } else {
          // Node earlier than v6
          util.encodeBase64 = function (arr) { // v6 and later
            return (new Buffer(arr)).toString('base64');
          };

          util.decodeBase64 = function(s) {
            validateBase64(s);
            return new Uint8Array(Array.prototype.slice.call(new Buffer(s, 'base64'), 0));
          };
        }

      } else {
        // Browsers

        util.encodeBase64 = function(arr) {
          var i, s = [], len = arr.length;
          for (i = 0; i < len; i++) s.push(String.fromCharCode(arr[i]));
          return btoa(s.join(''));
        };

        util.decodeBase64 = function(s) {
          validateBase64(s);
          var i, d = atob(s), b = new Uint8Array(d.length);
          for (i = 0; i < d.length; i++) b[i] = d.charCodeAt(i);
          return b;
        };

      }

      return util;

    }));
    });

    function isObject(obj) {
      return obj !== undefined && obj !== null && obj.constructor == Object;
    }

    function addHeader(_msg, flag) {
      const msg = new Uint8Array(_msg.length + 1);

      const header = new Uint8Array(1);
      header[0] = flag;

      // concat!
      msg.set(header);
      msg.set(_msg, header.length);

      return msg;
    }

    naclFast.util = naclUtil;

    function send({ data, connector }) {
      if (isObject(data)) {
        data = JSON.stringify(data);
      }

      const nonce = new Uint8Array(integerToByteArray(2 * connector.sentCount, 24));

      if (!connector.closed()) {
        if (connector.sentCount > 1) {
          // we don't encrypt first two messags (RPC: exchangePubkeys and exchangePubkeys::ACK)

          let flag = 0; // binary

          if (typeof data == 'string') {
            flag = 1; // string
          }

          const _encodedMessage = flag == 1 ? naclFast.util.decodeUTF8(data) : data; // binary data (file stream...)
          const encodedMessage = addHeader(_encodedMessage, flag);

          const encryptedMessage = naclFast.secretbox(encodedMessage, nonce, connector.sharedSecret);

          if (connector.verbose) {
            console.log();
            console.log(`Connector → Sending encrypted message #${connector.sentCount} @ ${connector.address}:`);
            console.log(data);
          }

          connector.connection.websocket.send(encryptedMessage);
        } else {
          if (connector.verbose) {
            console.log();
            console.log(`Connector → Sending message #${connector.sentCount} @ ${connector.address}:`);
            console.log(data);
          }

          connector.connection.websocket.send(data);
        }
      } else {
        console.log(`⚠️ Warning: "${data}" was not sent because connector is not ready`);
        // TODO: check if it's better to pass on the "log" function from establishAndMaintainConnection
      }
    }

    naclFast.util = naclUtil;

    function isRpcCallResult(jsonData) {
      return Object.keys(jsonData).includes('result') || Object.keys(jsonData).includes('error');
    }

    function wireReceive({ jsonData, encryptedData, rawMessage, wasEncrypted, connector }) {
      connector.lastMessageAt = Date.now();

      const nonce = new Uint8Array(integerToByteArray(2 * connector.receivedCount + 1, 24));

      if (connector.verbose && !wasEncrypted) {
        console.log();
        console.log(`Connector → Received message #${connector.receivedCount} @ ${connector.address}:`);
      }

      // 💡 unencrypted jsonData !
      // authentication !
      if (jsonData) {
        if (jsonData.jsonrpc) {
          // normal result from RPC call, result is coming back from server and we receive it at client
          if (isRpcCallResult(jsonData)) {
            if (connector.verbose && !wasEncrypted) {
              //we already logged it if it was encrypted
              console.log('Received plain-text rpc result');
              console.log(jsonData);
            }

            connector.rpcClient.jsonrpcMsgReceive(rawMessage);
          } else {
            // if we receive json rpc message on the client without the result or error property, this means that it is
            // actually a reverse RPC call from server to client
            connector.emit('json_rpc', rawMessage);
          }
        } else {
          connector.emit('receive', { jsonData, rawMessage });
        }
      } else if (encryptedData) {
        // 💡 encryptedJson data!!
        if (connector.verbose == 'extra') {
          console.log('Received bytes:');
          console.log(encryptedData);
          console.log(`Decrypting with shared secret ${connector.sharedSecret}...`);
        }

        // we assume connector.sharedSecret exists and was successful
        // OPEN QUESTION :: binaryData can be both: encryptedData or actual binaryData.. if we always encrypt we can solve the dilemma
        const _decryptedMessage = naclFast.secretbox.open(encryptedData, nonce, connector.sharedSecret);

        const flag = _decryptedMessage[0];
        const decryptedMessage = _decryptedMessage.subarray(1);

        //let decodedMessage;

        // BE CAREFUL --> cannot use this in browser!!
        //const start = stopwatch.start();

        // try {
        //   decodedMessage = nacl.util.encodeUTF8(decryptedMessage);
        // } catch (e) {
        //   // console.log('CANNOT DECODE');
        //   // console.log(stopwatch.stop(start));
        //   // to detect we cannot decode it takes around 5ms on MBP
        //   // and even ~50-60ms on RPi
        // }

        //⚠️ ⚠️ text strings are not allowed... we can only distinguish between binary data and json
        //
        // this book has both "cannot decode" and "cannot parse json" instances:
        // http://localhost:7777/file/Schaum's%20Mathematical%20Handbook%20of%20Formulas%20and%20Tables%20-%20Murray%20R%20Spiegel.pdf?id=192.168.0.10-2f686f6d652f65636c697073652f53746f726167652f436f6c6c656374696f6e732f4d6174682f426f6f6b73322f75736566756c2f53636861756d2773204d617468656d61746963616c2048616e64626f6f6b206f6620466f726d756c617320616e64205461626c6573202d204d75727261792052205370696567656c2e706466
        // 27 MB, around 100 such decistion instances
        if (flag == 1) {
          // wrap this in try// catch and report issue in coding if it happens
          const decodedMessage = naclFast.util.encodeUTF8(decryptedMessage);

          // string
          try {
            const jsonData = JSON.parse(decodedMessage);

            // 💡 rpc
            if (jsonData.jsonrpc) {
              if (connector.verbose) {
                console.log('Received and decrypted rpc result:');
                console.log(jsonData);
              }

              wireReceive({ jsonData, rawMessage: decodedMessage, wasEncrypted: true, connector }); // recursive: will call rpcClient as before
            } else if (jsonData.tag) {
              // 💡 tag
              const msg = jsonData;

              if (msg.tag == 'file_not_found') {
                //console.log(`received binary_start from (remote) content server, sessionId: ${msg.sessionId}`);
                connector.emit(msg.tag, { ...msg, ...{ tag: undefined } });
              } else if (msg.tag == 'binary_start') {
                //console.log(`received binary_start from (remote) content server, sessionId: ${msg.sessionId}`);
                connector.emit(msg.tag, { ...msg, ...{ tag: undefined } });
              } else if (msg.tag == 'binary_end') {
                //console.log(`fiberConnection: received binary_end from (remote) content server, sessionId: ${msg.sessionId}`);
                connector.emit(msg.tag, { sessionId: msg.sessionId });
              } else {
                connector.emit('receive', { jsonData, rawMessage: decodedMessage });
              }
            } else if (jsonData.state) {
              // 💡 Initial state sending ... part of Connectome protocol
              connector.emit('receive_state', jsonData.state);
            } else if (jsonData.diff) {
              // 💡 Subsequent JSON patch diffs (rfc6902)* ... part of Connectome protocol
              // * rfc6902 ≡ JavaScript Object Notation (JSON) Patch ==> https://tools.ietf.org/html/rfc6902
              connector.emit('receive_diff', jsonData.diff);
            } else {
              connector.emit('receive', { jsonData, rawMessage: decodedMessage });
            }
          } catch (e) {
            console.log("Couldn't parse json message although the flag was for string ...");
            //log.red();
            throw e;
            // console.log('CANNOT PARSE JSON');
            // this only takes microseconds and is not problematic
          }
        } else {
          // binary data
          //if (!jsonData) {
          const binaryData = decryptedMessage;

          // ?? --> ⚠️ room for process crash if a regular string (not stringified json) is sent
          // because if it's not actually json, it will land here, and it *has* to be binary data...

          // console.log(decryptedMessage);
          // console.log(connector.address);

          // TODO: check if someone is sending some other binary data... now we assume everything binary is filestream!!
          //
          //if (Buffer.isBuffer(binaryData)) {
          const sessionId = Buffer.from(binaryData.buffer, binaryData.byteOffset, 64).toString();
          const binaryPayload = Buffer.from(binaryData.buffer, binaryData.byteOffset + 64);

          //console.log(binaryPayload.length);

          //console.log(`fiberConnection: received binary_data from (remote) content server, sessionId: ${sessionId}`);

          connector.emit('binary_data', { sessionId, data: binaryPayload });
          // } else {
          //   console.log(binaryData);
          //   console.log('NOT BUFFER!!!');
          //   // for now this will never happen because we don't send encoded binary data yet
          //   connector.wireReceive({ binaryData });
          // }
        }

        //connector.emit('receive', { jsonData, binaryData, rawMessage });
      }
    }

    class Channel extends Eev$1 {
      // connector or channel actually, todo: change variable name
      constructor(connector) {
        super();

        this.connector = connector;
      }

      send(...args) {
        this.connector.send(...args);
      }
    }

    var errorCodes = {
      PARSE_ERROR: -32700,
      INVALID_REQUEST: -32600,
      METHOD_NOT_FOUND: -32601,
      INVALID_PARAMS: -32602,
      REMOTE_INTERNAL_ERROR: -32603
    };

    class MoleServer {
      constructor({ transports }) {
        if (!transports) throw new Error('TRANSPORT_REQUIRED');

        this.transportsToRegister = transports;
        this.methods = {};
      }

      setMethodPrefix(methodPrefix) {
        this.methodPrefix = methodPrefix;
      }

      expose(methods) {
        this.methods = methods;
      }

      registerTransport(transport) {
        transport.onData(this._processRequest.bind(this, transport));
      }

      // async removeTransport(transport) {
      //   await transport.shutdown(); // TODO
      // }

      async _processRequest(transport, data) {
        const requestData = JSON.parse(data);
        let responseData;

        if (Array.isArray(requestData)) {
          // TODO Batch error handling?
          responseData = await Promise.all(requestData.map(request => this._callMethod(request, transport)));
        } else {
          responseData = await this._callMethod(requestData, transport);
        }

        return JSON.stringify(responseData);
      }

      async _callMethod(request, transport) {
        const isRequest = request.hasOwnProperty('method');
        if (!isRequest) return; // send nothing in response

        const { method, params = [], id } = request;

        let methodName = method;

        if (methodName.includes('::')) {
          const [prefix, name] = methodName.split('::');
          methodName = name;
          if (this.methodPrefix && prefix != this.methodPrefix) {
            // not meant for us ...
            return;
          }
        }

        const methodNotFound =
          !this.methods[methodName] ||
          typeof this.methods[methodName] !== 'function' ||
          methodName === 'constructor' ||
          methodName.startsWith('_') ||
          this.methods[methodName] === Object.prototype[methodName];

        let response = {};

        if (methodNotFound) {
          response = {
            jsonrpc: '2.0',
            id,
            error: {
              code: errorCodes.METHOD_NOT_FOUND,
              message: `Method [${methodName}] not found on remote target object`
            }
          };
        } else {
          this.currentTransport = transport;

          try {
            const result = await this.methods[methodName].apply(this.methods, params);

            if (!id) return; // For notifications do not respond. "" means send nothing

            response = {
              jsonrpc: '2.0',
              result: typeof result === 'undefined' ? null : result,
              id
            };
          } catch (e) {
            console.log(`Exposed RPC method ${method} internal error:`);
            console.log(e);
            console.log('Sending this error as a result to calling client ...');
            response = {
              jsonrpc: '2.0',
              error: {
                code: errorCodes.REMOTE_INTERNAL_ERROR,
                message: `Method [${method}] internal error: ${e.stack}` // todo -- perhaps obscure the exact paths ... for privacy
              },
              id
            };
          }
        }

        return response;
      }

      run() {
        for (const transport of this.transportsToRegister) {
          this.registerTransport(transport);
        }

        this.transportsToRegister = [];
      }
    }

    class Base extends Error {
      constructor(data = {}) {
        super();

        if (!data.code) throw new Error('Code required');
        if (!data.message) throw new Error('Message required');

        this.code = data.code;
        this.message = data.message;
      }
    }

    class MethodNotFound extends Base {
      constructor(message) {
        super({
          code: errorCodes.METHOD_NOT_FOUND,
          message: message || 'Method not found'
        });
      }
    }

    class InvalidParams extends Base {
      constructor() {
        super({
          code: errorCodes.INVALID_PARAMS,
          message: 'Invalid params'
        });
      }
    }

    class RemoteInternalError extends Base {
      constructor(message) {
        super({
          code: errorCodes.REMOTE_INTERNAL_ERROR,
          message: `Error originating at remote endpoint: ${message}` || 'Remote Internal error'
        });
      }
    }

    class ParseError extends Base {
      constructor() {
        super({
          code: errorCodes.PARSE_ERROR,
          message: 'Parse error'
        });
      }
    }

    class InvalidRequest extends Base {
      constructor() {
        super({
          code: errorCodes.INVALID_REQUEST,
          message: 'Invalid request'
        });
      }
    }

    class ServerError extends Base {}

    class RequestTimeout extends ServerError {
      constructor(message, timeout) {
        super({
          code: -32001,
          message: `Request exceeded maximum execution time (${timeout}ms): ${message}`
        });
      }
    }

    var X = {
      Base,
      MethodNotFound,
      InvalidRequest,
      InvalidParams,
      RemoteInternalError,
      ServerError,
      ParseError,
      RequestTimeout
    };

    class MoleClient {
      constructor({ transport, requestTimeout = 20000 }) {
        if (!transport) throw new Error('TRANSPORT_REQUIRED');
        this.transport = transport;

        this.requestTimeout = requestTimeout;

        this.pendingRequest = {};
        this.initialized = false;
      }

      // prefix::methodName --> when multiple rpc objects are active
      setMethodPrefix(methodPrefix) {
        this.methodPrefix = methodPrefix;
      }

      async callMethod(methodName, params) {
        this._init();

        const method = this.methodPrefix ? `${this.methodPrefix}::${methodName}` : methodName;

        const request = this._makeRequestObject({ method, params });

        return this._sendRequest({ object: request, id: request.id });
      }

      notify(method, params) {
        this._init();

        const request = this._makeRequestObject({ method, params, mode: 'notify' });
        this.transport.sendData(JSON.stringify(request));
        return true;
      }

      async runBatch(calls) {
        const batchId = this._generateId();
        let onlyNotifications = true;

        const batchRequest = [];

        for (const [method, params, mode] of calls) {
          const request = this._makeRequestObject({ method, params, mode, batchId });

          if (request.id) {
            onlyNotifications = false;
          }

          batchRequest.push(request);
        }

        if (onlyNotifications) {
          return this.transport.sendData(JSON.stringify(batchRequest));
        }

        return this._sendRequest({ object: batchRequest, id: batchId });
      }

      _init() {
        if (this.initialized) return;

        this.transport.onData(this._processResponse.bind(this));

        this.initialized = true;
      }

      _sendRequest({ object, id }) {
        const data = JSON.stringify(object);

        // DMT DEBUGGING:
        // console.log(data);

        return new Promise((resolve, reject) => {
          this.pendingRequest[id] = { resolve, reject, sentObject: object };

          setTimeout(() => {
            if (this.pendingRequest[id]) {
              delete this.pendingRequest[id];

              reject(new X.RequestTimeout(data, this.requestTimeout));
            }
          }, this.requestTimeout);

          try {
            this.transport.sendData(data);
          } catch (e) {
            delete this.pendingRequest[id];
            reject(e);
          }

          // todo -- check -- this was the old code... TransportClientChannel had a lot of async methods...
          // return this.transport.sendData(data).catch(error => {
          //   delete this.pendingRequest[id];
          //   reject(error); // TODO new X.InternalError() <--- ??
          //   //reject(new X.InternalError());
          // });
        });
      }

      _processResponse(data) {
        const response = JSON.parse(data);

        if (Array.isArray(response)) {
          this._processBatchResponse(response);
        } else {
          this._processSingleCallResponse(response);
        }
      }

      _processSingleCallResponse(response) {
        const isSuccessfulResponse = response.hasOwnProperty('result') || false;
        const isErrorResponse = response.hasOwnProperty('error');

        if (!isSuccessfulResponse && !isErrorResponse) return;

        const resolvers = this.pendingRequest[response.id];
        delete this.pendingRequest[response.id];

        if (!resolvers) return;

        if (isSuccessfulResponse) {
          resolvers.resolve(response.result);
        } else if (isErrorResponse) {
          const errorObject = this._makeErrorObject(response.error);
          // console.log(response.error);
          // console.log('-----------');
          // console.log(errorObject);
          resolvers.reject(errorObject);
        }
      }

      _processBatchResponse(responses) {
        let batchId;
        const responseById = {};
        const errorsWithoutId = [];

        for (const response of responses) {
          if (response.id) {
            if (!batchId) {
              batchId = response.id.split('|')[0];
            }

            responseById[response.id] = response;
          } else if (response.error) {
            errorsWithoutId.push(response.error);
          }
        }

        if (!this.pendingRequest[batchId]) return;

        const { sentObject, resolve } = this.pendingRequest[batchId];
        delete this.pendingRequest[batchId];

        const batchResults = [];
        let errorIdx = 0;
        for (const request of sentObject) {
          if (!request.id) {
            // Skip notifications
            batchResults.push(null);
            continue;
          }

          const response = responseById[request.id];

          if (response) {
            const isSuccessfulResponse = response.hasOwnProperty('result') || false;

            if (isSuccessfulResponse) {
              batchResults.push({
                success: true,
                result: response.result
              });
            } else {
              batchResults.push({
                success: false,
                result: this._makeErrorObject(response.error)
              });
            }
          } else {
            batchResults.push({
              success: false,
              error: this._makeErrorObject(errorsWithoutId[errorIdx])
            });
            errorIdx++;
          }
        }

        resolve(batchResults);
      }

      _makeRequestObject({ method, params, mode, batchId }) {
        const request = {
          jsonrpc: '2.0',
          method
        };

        if (params && params.length) {
          request.params = params;
        }

        if (mode !== 'notify') {
          request.id = batchId ? `${batchId}|${this._generateId()}` : this._generateId();
        }

        return request;
      }

      _makeErrorObject(errorData) {
        const errorBuilder = {
          [errorCodes.METHOD_NOT_FOUND]: () => {
            return new X.MethodNotFound(errorData.message);
          },
          [errorCodes.REMOTE_INTERNAL_ERROR]: () => {
            return new X.RemoteInternalError(errorData.message);
          }
        }[errorData.code];

        return errorBuilder();
      }

      _generateId() {
        // from "nanoid" package
        const alphabet = 'bjectSymhasOwnProp-0123456789ABCDEFGHIJKLMNQRTUVWXYZ_dfgiklquvxz';
        let size = 10;
        let id = '';

        while (0 < size--) {
          id += alphabet[(Math.random() * 64) | 0];
        }

        return id;
      }
    }

    function proxify(moleClient) {
      const callMethodProxy = proxifyOwnMethod(moleClient.callMethod.bind(moleClient));
      const notifyProxy = proxifyOwnMethod(moleClient.notify.bind(moleClient));

      return new Proxy(moleClient, {
        get(target, methodName) {
          if (methodName === 'notify') {
            return notifyProxy;
          }

          if (methodName === 'callMethod') {
            return callMethodProxy;
          }

          if (methodName === 'then') {
            // without this you will not be able to return client from an async function.
            // V8 will see then method and will decide that client is a promise
            return;
          }

          if (methodName === 'setMethodPrefix') {
            return (...params) => moleClient.setMethodPrefix(params);
          }

          return (...params) => target.callMethod.call(target, methodName, params);
        }
      });
    }

    function proxifyOwnMethod(ownMethod) {
      return new Proxy(ownMethod, {
        get(target, methodName) {
          return (...params) => target.call(null, methodName, params);
        },
        apply(target, _, args) {
          return target.apply(null, args);
        }
      });
    }

    class MoleClientProxified extends MoleClient {
      constructor(...args) {
        super(...args);
        return proxify(this);
      }
    }

    class TransportClientChannel {
      constructor(channel) {
        this.channel = channel;
      }

      onData(callback) {
        this.channel.on('json_rpc', callback);
      }

      sendData(data) {
        this.channel.send(data);
      }
    }

    class TransportServerChannel {
      constructor(channel) {
        this.channel = channel;
      }

      onData(callback) {
        this.channel.on('json_rpc', async reqData => {
          const resData = await callback(reqData);
          if (!resData) return;

          this.channel.send(resData);
        });

        // this.ws.on('message', async reqData => {
        //   const resData = await callback(reqData);
        //   if (!resData) return;

        //   this.ws.send(resData);
        // });
      }
    }

    var mole = /*#__PURE__*/Object.freeze({
        __proto__: null,
        MoleServer: MoleServer,
        MoleClient: MoleClient,
        MoleClientProxified: MoleClientProxified,
        ClientTransport: TransportClientChannel,
        ServerTransport: TransportServerChannel
    });

    class ConnectomeError extends Error {
      constructor(message, errorCode) {
        super(message);

        this.name = this.constructor.name;

        this.errorCode = errorCode;
      }

      errorCode() {
        return this.errorCode;
      }
    }

    const { MoleClient: MoleClient$1, ClientTransport } = mole;

    class SpecificRpcClient {
      constructor(connectorOrServersideChannel, methodPrefix, requestTimeout) {
        this.moleChannel = new Channel(connectorOrServersideChannel);
        this.methodPrefix = methodPrefix;

        this.connectorOrServersideChannel = connectorOrServersideChannel;

        this.client = new MoleClient$1({
          requestTimeout,
          transport: new ClientTransport(this.moleChannel)
        });
      }

      jsonrpcMsgReceive(stringMessage) {
        // todo: remove
        //console.log(`Received RPC result from server:`);
        //console.log(stringMessage);

        this.moleChannel.emit('json_rpc', stringMessage);
      }

      call(methodName, params) {
        if (this.connectorOrServersideChannel.closed()) {
          return new Promise((success, reject) => {
            reject(
              new ConnectomeError(
                `Method call [${this.methodPrefix}::${methodName}] on closed channel or connector ignored. Please add a check for closed channel in your code.`,
                'CLOSED_CHANNEL'
              )
            );
          });
        }

        return this.client.callMethod(`${this.methodPrefix}::${methodName}`, params);
      }
    }

    const DEFAULT_REQUEST_TIMEOUT = 5000;

    class RpcClient {
      constructor(connectorOrServersideChannel, requestTimeout) {
        // connectorOrServersideChannel or channel actually, todo: change variable name
        this.connectorOrServersideChannel = connectorOrServersideChannel;
        this.remoteObjects = {};
        this.requestTimeout = requestTimeout || DEFAULT_REQUEST_TIMEOUT;
      }

      remoteObject(methodPrefix) {
        const remoteObject = this.remoteObjects[methodPrefix];
        if (!remoteObject) {
          this.remoteObjects[methodPrefix] = new SpecificRpcClient(this.connectorOrServersideChannel, methodPrefix, this.requestTimeout);
        }
        return this.remoteObjects[methodPrefix];
      }

      jsonrpcMsgReceive(stringMessage) {
        for (const remoteObject of Object.values(this.remoteObjects)) {
          remoteObject.jsonrpcMsgReceive(stringMessage);
        }
      }
    }

    class RPCTarget {
      constructor({ serversideChannel, serverMethods, methodPrefix }) {
        const transports = [new TransportServerChannel(serversideChannel)];
        this.server = new MoleServer({ transports });
        this.server.expose(serverMethods);
        this.server.setMethodPrefix(methodPrefix);
        this.server.run();
      }
    }

    naclFast.util = naclUtil;

    function newKeypair() {
      const keys = naclFast.box.keyPair();
      const publicKeyHex = bufferToHex$1(keys.publicKey);
      const privateKeyHex = bufferToHex$1(keys.secretKey);

      return { privateKey: keys.secretKey, publicKey: keys.publicKey, privateKeyHex, publicKeyHex };
    }

    naclFast.util = naclUtil;

    // EventEmitter for browser (and nodejs as well)
    class Connector extends Eev$1 {
      constructor({ address, protocol, lane, keypair = newKeypair(), rpcRequestTimeout, verbose = false } = {}) {
        super();

        this.protocol = protocol; // not used actually except for stats (debugging) when we read protocol from the connector object -- for example when listing connectors in connectorPool
        this.lane = lane;

        const { privateKey: clientPrivateKey, publicKey: clientPublicKey } = keypair;

        this.clientPrivateKey = clientPrivateKey;
        this.clientPublicKey = clientPublicKey;
        this.clientPublicKeyHex = bufferToHex$1(clientPublicKey);

        this.rpcClient = new RpcClient(this, rpcRequestTimeout);

        this.address = address;
        this.verbose = verbose;

        this.sentCount = 0;
        this.receivedCount = 0;

        this.successfulConnectsCount = 0;

        // this.connection = .... // this gets set externally in connect() method (establishAndMaintainConnection)
      }

      send(data) {
        send({ data, connector: this }); // todo: was send successful (?) -- or did we send into closed channel? what happens then? sent counters will be out of sync
        this.sentCount += 1;
      }

      wireReceive({ jsonData, encryptedData, rawMessage }) {
        wireReceive({ jsonData, encryptedData, rawMessage, connector: this });
        this.receivedCount += 1;
      }

      isReady() {
        return this.ready;
      }

      // channel has this method and connector also has to have it so that rpc client can detect and warn us
      closed() {
        return !this.connected;
      }

      decommission() {
        this.decommissioned = true;
      }

      connectStatus(connected) {
        // setTimeout(() => {
        //   this.connection.terminate();
        // }, 1000);

        if (connected) {
          this.sentCount = 0;
          this.receivedCount = 0;

          this.connected = true;

          //console.log(`Connector ${this.address} CONNECTED`);

          // todo: CHECK WHAT IS HAPPENING HERE
          // if this fails (rejects), we can get stuck in limbo because connector is connected
          // but it is not "ready" ... it becomes ready after the key exchange which hasn't happened
          // so is it possible that on a supposedly good connection some rpc method fails ?

          this.successfulConnectsCount += 1;

          // this is not yet well tested...
          // we want to force reconnect if there is a failure in key-negotiation step
          // but we cannot just terminate connection on all previous rejects because they can cancel valid connection by mistake
          // solution: if key negotiation fails, terminate the connection but only from the most recent reject handler
          const num = this.successfulConnectsCount;

          this.diffieHellman({ clientPrivateKey: this.clientPrivateKey, clientPublicKey: this.clientPublicKey, lane: this.lane })
            .then(({ sharedSecret, sharedSecretHex }) => {
              //console.log(colors.magenta(`Shared secret: ${colors.gray(sharedSecretHex)}`));
              this.ready = true;
              this.connectedAt = Date.now();

              this.emit('ready', { sharedSecret, sharedSecretHex });

              console.log(`✓ Ready: DMT Protocol Connector [ ${this.address} · ${this.protocol}/${this.lane} ]`);
            })
            .catch(e => {
              // Auth::exchangePubkeys request exceeded maximum allowed time... can sometimes happen on RPi ... maybe increase this time
              // we only drop when our latest try comes back as failed
              if (num == this.successfulConnectsCount) {
                console.log(e);
                console.log('dropping connection and retrying again');
                this.connection.terminate();
              }
              // probably not a good idea to do it in this way because
              // this can the drop a new connection that is currently being retried and this reject comes after 10 or more seconds after failure
              // we hope that websocket will drop in due time and then we can try auth sequence again
              //this.connection.terminate();
            });
        } else {
          if (this.connected) {
            this.emit('disconnect');
          }

          if (this.connected == undefined) {
            console.log(`Connector ${this.address} was not able to connect at first try, setting READY to false`);
          }

          this.connected = false;
          this.ready = false;
          delete this.connectedAt;
        }
      }

      remoteObject(handle) {
        return {
          call: (methodName, params = []) => {
            return this.rpcClient.remoteObject(handle).call(methodName, listify$2(params)); // rpcClient always expects a list of arguments, never a single argument
          }
        };
      }

      attachObject(handle, obj) {
        // todo: servesideChannel is actually connector in this (reverse) case
        new RPCTarget({ serversideChannel: this, serverMethods: obj, methodPrefix: handle });
      }

      diffieHellman({ clientPrivateKey, clientPublicKey, lane }) {
        // TODO: to be improved
        return new Promise((success, reject) => {
          this.remoteObject('Auth')
            .call('exchangePubkeys', { pubkey: this.clientPublicKeyHex })
            .then(remotePubkeyHex => {
              const sharedSecret = naclFast.box.before(hexToBuffer$1(remotePubkeyHex), clientPrivateKey);
              const sharedSecretHex = bufferToHex$1(sharedSecret);
              this.sharedSecret = sharedSecret;

              this._remotePubkeyHex = remotePubkeyHex;

              success({ sharedSecret, sharedSecretHex });

              if (this.verbose) {
                console.log('Established shared secret through diffie-hellman exchange:');
                console.log(sharedSecretHex);
              }

              // let server know we're ready
              this.remoteObject('Auth')
                .call('finalizeHandshake', { lane })
                .then(() => {
                  // if (this.clientInitData) {
                  //   this.remoteObject('Hello')
                  //     .call('hello', this.clientInitData)
                  //     .catch(reject);
                  // }
                })
                .catch(reject);
            })
            .catch(reject);
        });
      }

      clientPubkey() {
        return this.clientPublicKeyHex;
      }

      remotePubkeyHex() {
        return this._remotePubkeyHex;
      }

      // we cannot get remoteIp from websocket on client side (security reasons (?))
      // remote address is whatever we passed into connector from the outside
      // host or ip, without port
      remoteAddress() {
        return this.address;
      }

      // RECENTLY DONE:
      // no manual connection flag is set... we close connection here after unsuccessful diffie hellman/
      // we do want it to reopen... not sure if manual close is used somewhere??
      // TODO: if not needed, remove closedManually checks in establishAndMaintainConnection
      // closeAndDontReopenUNUSED() {
      //   this.connection.closedManually = true;
      //   this.connection.websocket.onclose = () => {}; // disable onclose handler first

      //   // the reason is to avoid this issue:
      //   //// there could be problems here -- ?
      //   // 1. we close the connection by calling connection.close on the connection store
      //   // 2. we create a new connection which sets connected=true on our store
      //   // 3. after that the previous connection actually closes and sets connected=false on our store (next line!)
      //   // todo: solve if proven problematic... maybe it won't cause trouble because closeCallback will trigger immediatelly

      //   this.connectStatus(false);
      //   this.connection.websocket.close();
      // }

      // connection => obj
      // freshConnection
      // reconnectPaused
      //
      // this.connection = {
      //   websocket :: WS,
      //   endpoint, :: string,
      //   closedManually :: bool,
      //   checkTicker :: int,
      // }
    }

    // DMT.JS
    // CONNECTION "PLUMBING"

    // THIS IS USED IN TWO SEPARATE CASES - always on the client side (a):
    // Connection always from a to b

    // DMT-GUI
    // (1a) - client is a browser WebSocket and it connects to:    (browser == true)  <--- FLAG, look in this file's code
    // (1b) - ws gui state endpoint (inside node.js dmt-process)

    // DMT-FIBER:
    // (2a) - client is a fiber client (inside node.js dmt-process) and connects to:       (browser == false)
    // (2b) - fiber ws server (inside node.js dmt-process)

    const browser = typeof window !== 'undefined';

    const wsCONNECTING = 0;
    const wsOPEN = 1;

    function establishAndMaintainConnection({ address, ssl = false, port, protocol, lane, keypair, remotePubkey, rpcRequestTimeout, verbose }, { WebSocket, log }) {
      const wsProtocol = ssl ? 'wss' : 'ws';
      // hack for now!
      // testing reverse proxy forwarding for websockets on https://uri.com/ws
      const endpoint = port.toString().startsWith('/') ? `${wsProtocol}://${address}${port}` : `${wsProtocol}://${address}:${port}`;

      //log(`Trying to connect to ws endpoint ${endpoint} ...`);

      // address goes into connector only for informative purposes
      const connector = new Connector({ address, protocol, lane, rpcRequestTimeout, keypair, verbose });

      if (connector.connection) {
        return connector;
      }

      connector.connection = {
        terminate() {
          this.websocket._removeAllCallbacks();
          this.websocket.close(); // we don't want callbacks executed! and besides they can be executed really late after close is called under certain networking conditions!
          connector.connectStatus(false);
        },
        endpoint, // only for logging purposes, not needed for functionality
        checkTicker: 0 // gets reset to zero everytime anything comes out of the socket
      };

      // so that event handlers on "connector" have time to get attached
      // we would use process.nextTick here usually but it doesn't work in browser!
      setTimeout(() => tryReconnect({ connector, endpoint, protocol }, { WebSocket, log }), 10);

      // if process on the other side closed connection, we will detect immediately (websocket closes)
      // if device drops from network, we won't detect this, but will know by missed pings
      // 6 * 1500ms = 9s
      //
      // Technical explanation:
      //
      // Sometimes the link between the server and the client can be interrupted in a way that keeps both the server and
      // the client unaware of the broken state of the connection (e.g. when pulling the cord).
      // In these cases ping messages can be used as a means to verify that the remote endpoint is still responsive.
      //
      const connectionCheckInterval = 1500;
      const callback = () => {
        if (!connector.decommissioned) {
          // ⚠️ not ok because we won't ever terminate the connection!.. IMPLEMENT to terminate the connection after two check Intervals (?) .. don't temrinate immediately because sending works async.. I believe... so it's good to wait a bit until destroying the connection
          checkConnection({ connector, endpoint, protocol }, { WebSocket, log });
          setTimeout(callback, connectionCheckInterval);
        }
      };

      setTimeout(callback, connectionCheckInterval); // we already tried to connect in the first call in this function, we continue after the set interval

      return connector; // connector (state) object
    }

    // HELPER METHODS:

    // reconnectPaused =>
    // we still send pings, observe connected state and do everything,
    // the only thing we don't do is that we don't try to reconnect (create new WebSocket -> because this is resource intensive and it shows in browser log in red in console)
    function checkConnection({ connector, endpoint, protocol }, { WebSocket, log }) {
      const conn = connector.connection;

      //const prevConnected = connector.connected;

      if (connectionIdle(conn) || connector.decommissioned) {
        if (connectionIdle(conn)) ; else {
          log(`Connection ${connector.connection.endpoint} decommisioned, closing websocket ${conn.websocket.rand}, will not retry again `);
        }

        conn.terminate(); // ⚠️ this will never happen when connector is decommisioned -- FIX
        return;
      }

      const connected = socketConnected(conn);
      // via ticker

      // TODO: check ticker, if more than 9s, terminate socket ... then close handler should fire...
      // then it's closed for good.. otherwise we may have issues with sharedSecret sync...

      if (connected) {
        // we cannot send lower-level ping frames from browser: https://stackoverflow.com/a/10586583/458177
        //log(`WebSocket ${conn.websocket.rand} to ${endpoint} is connected!`);
        conn.websocket.send('ping');
        // this 3s had an 15s effect above when we check currentlyTryingWS 3s (5 times 3s)
        //} else if (!connector.reconnectPaused && (resumeNow || conn.checkTicker <= 30 || conn.checkTicker % 3 == 0)) {
        //} else if (!connector.reconnectPaused && resumeNow) {
      } else {
        //if (!connector.reconnectPaused) {
        if (connector.connected == undefined) {
          log(`Setting connector status to FALSE because connector.connected is undefined`);
          connector.connectStatus(false); // initial status report when not able to connect at beginning
        }

        //log(`There is no WebSocket to ${endpoint} currently!`); // plural because there could temporarily be multiple connected although only one relevant (active).. others fall off soon

        // first 30s we try to reconnect every second, after that every 3s
        tryReconnect({ connector, endpoint, protocol }, { WebSocket, log });
      }

      conn.checkTicker += 1;
    }

    function tryReconnect({ connector, endpoint, protocol }, { WebSocket, log }) {
      const conn = connector.connection;

      // this logic is for when the (wifi) netowork changes ...
      // if there is good netowork but the process is down on the other side, we will immediately get a failure and a closed connection
      // when trying to connect.. and currentlyTryingWS will be wsCLOSED immediately so we will proceed to try with another new one

      if (conn.currentlyTryingWS && conn.currentlyTryingWS.readyState == wsCONNECTING) {
        if (conn.currentlyTryingWS._waitForConnectCounter == 3) {
          // 4 cycles .. 4x 1500ms == 6s
          conn.currentlyTryingWS._removeAllCallbacks();
          conn.currentlyTryingWS.close();
        } else {
          conn.currentlyTryingWS._waitForConnectCounter += 1; // we wait for next tryReconnect up to 7.5s, then discard the websocket and create a new one
          return;
        }
      }

      const ws = new WebSocket(endpoint, protocol);

      conn.currentlyTryingWS = ws;
      conn.currentlyTryingWS._waitForConnectCounter = 0;

      ws.rand = Math.random();

      //log(`Created new WebSocket ${ws.rand} for endpoint ${endpoint}`);

      if (browser) {
        ws.binaryType = 'arraybuffer';
      }

      if (!browser) {
        // nodejs
        ws.on('error', error => {
          // do nothing, but we still need to catch this to not throw global exception (in nodejs)
        });
      }

      const openCallback = m => {
        //log(`ws open callback executed.. Ticker: ${conn.checkTicker}`);
        //log(`websocket ${ws.rand} conn to ${endpoint} open`);
        conn.currentlyTryingWS = null;
        conn.checkTicker = 0; // ADDED HERE LATER --- usually we don't need this in frontend because we keep sending state! but we better do the same there as well !! TODO±!!!!!
        addSocketListeners({ ws, connector, openCallback }, { log });
        conn.websocket = ws;
        connector.connectStatus(true);
      };

      // this method gets overwritten by another one that removes all the other listeners
      // in case ws gets opened and other sockets attached
      ws._removeAllCallbacks = () => {
        ws.removeEventListener('open', openCallback);
      };

      if (browser) {
        ws.addEventListener('open', openCallback);
      } else {
        ws.on('open', openCallback);
      }
    }

    // ***************** PLUMBING *****************

    function addSocketListeners({ ws, connector, openCallback }, { log }) {
      const conn = connector.connection;

      const errorCallback = m => {
        //log(`websocket ${ws.rand} conn ${connector.connection.endpoint} error`);
        //log(JSON.stringify(m, null, 2));
        //log(JSON.stringify(m, ['message', 'arguments', 'type', 'name']));
      };

      const closeCallback = m => {
        //log(`websocket ${ws.rand} conn ${connector.connection.endpoint} closed`);
        connector.connectStatus(false);
      };

      const messageCallback = _msg => {
        conn.checkTicker = 0;

        const msg = browser ? _msg.data : _msg;

        // only instance of data that is not either binary or json  (it is simply a string)
        if (msg == 'pong') {
          // we don't do anything here, it was enough that we have set the checkTicker to zero
          return;
        }

        let jsonData;

        try {
          jsonData = JSON.parse(msg);
        } catch (e) {}

        // unencrypted -- only messages for key exchange
        if (jsonData) {
          connector.wireReceive({ jsonData, rawMessage: msg });
        } else {
          // this is either encrypted json or binary data
          // we have to convert from ArrayBuffer in browser
          const encryptedData = browser ? new Uint8Array(msg) : msg;
          connector.wireReceive({ encryptedData });
        }
      };

      ws._removeAllCallbacks = () => {
        // same for browser and ws library
        ws.removeEventListener('error', errorCallback);
        ws.removeEventListener('close', closeCallback);
        ws.removeEventListener('message', messageCallback);

        ws.removeEventListener('open', openCallback);
      };

      if (browser) {
        ws.addEventListener('error', errorCallback);
        ws.addEventListener('close', closeCallback);
        ws.addEventListener('message', messageCallback);
      } else {
        // not sure why "addEventListener" on "ws" nodejs package does not work, we just use standard "on" for this library, otherwise we get:
        // Caught global exception: TypeError: unexpected type, use Uint8Array
        // removeEventListener however works the same in browser and ws npm package
        ws.on('error', errorCallback);
        ws.on('close', closeCallback);
        ws.on('message', messageCallback);
      }
    }

    function socketConnected(conn) {
      return conn.websocket && conn.websocket.readyState == wsOPEN;
    }

    function connectionIdle(conn) {
      // we allow 9 seconds without message receive from the server side until we determine connection is broken
      return socketConnected(conn) && conn.checkTicker > 5; // 5 * 1500ms == 7.5s
    }

    function establishAndMaintainConnection$1(opts) {
      return establishAndMaintainConnection(opts, { WebSocket, log: log$1 });
      // return new Promise(success => {
      //   success(_establishAndMaintainConnection(opts, { WebSocket, log }));
      // });
    }

    function promiseTimeout(ms, promise) {
      // Create a promise that rejects in <ms> milliseconds
      const timeout = new Promise((resolve, reject) => {
        const id = setTimeout(() => {
          clearTimeout(id);
          reject(new Error(`Timed out in ${ms} ms.`));
        }, ms);
      });

      return Promise.race([promise, timeout]);
    }

    class ConditionsChecker {
      constructor(num, callback) {
        this.num = num;
        this.callback = callback;

        this.counter = 0;
      }

      oneConditionFulfilled() {
        this.counter += 1;

        if (this.counter == this.num) {
          this.callback();
        }
      }
    }

    function requireConditions(num, callback) {
      return new ConditionsChecker(num, callback);
    }

    // EXAMPLE USE CASE:
    //
    // const firstMountAndConnect = concurrency.requireConditions(2, () => {
    //   console.log('✓ FIRST STORE CONNECT after MOUNTING the APP ...');
    //   triggerSearch({ force: true });
    // });

    // store.on('connected', () => {
    //   firstMountAndConnect.oneConditionFulfilled();
    // });

    // onMount(() => {
    //   firstMountAndConnect.oneConditionFulfilled();
    // });

    var concurrency = /*#__PURE__*/Object.freeze({
        __proto__: null,
        promiseTimeout: promiseTimeout,
        requireConditions: requireConditions
    });

    naclFast.util = naclUtil;

    naclFast.util = naclUtil;

    naclFast.util = naclUtil;

    /*!
     * https://github.com/Starcounter-Jack/JSON-Patch
     * (c) 2017 Joachim Wester
     * MIT license
     */
    var __extends = (undefined && undefined.__extends) || (function () {
        var extendStatics = function (d, b) {
            extendStatics = Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
                function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
            return extendStatics(d, b);
        };
        return function (d, b) {
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    var _hasOwnProperty = Object.prototype.hasOwnProperty;
    function hasOwnProperty(obj, key) {
        return _hasOwnProperty.call(obj, key);
    }
    function _objectKeys(obj) {
        if (Array.isArray(obj)) {
            var keys = new Array(obj.length);
            for (var k = 0; k < keys.length; k++) {
                keys[k] = "" + k;
            }
            return keys;
        }
        if (Object.keys) {
            return Object.keys(obj);
        }
        var keys = [];
        for (var i in obj) {
            if (hasOwnProperty(obj, i)) {
                keys.push(i);
            }
        }
        return keys;
    }
    /**
    * Deeply clone the object.
    * https://jsperf.com/deep-copy-vs-json-stringify-json-parse/25 (recursiveDeepCopy)
    * @param  {any} obj value to clone
    * @return {any} cloned obj
    */
    function _deepClone(obj) {
        switch (typeof obj) {
            case "object":
                return JSON.parse(JSON.stringify(obj)); //Faster than ES5 clone - http://jsperf.com/deep-cloning-of-objects/5
            case "undefined":
                return null; //this is how JSON.stringify behaves for array items
            default:
                return obj; //no need to clone primitives
        }
    }
    //3x faster than cached /^\d+$/.test(str)
    function isInteger(str) {
        var i = 0;
        var len = str.length;
        var charCode;
        while (i < len) {
            charCode = str.charCodeAt(i);
            if (charCode >= 48 && charCode <= 57) {
                i++;
                continue;
            }
            return false;
        }
        return true;
    }
    /**
    * Escapes a json pointer path
    * @param path The raw pointer
    * @return the Escaped path
    */
    function escapePathComponent(path) {
        if (path.indexOf('/') === -1 && path.indexOf('~') === -1)
            return path;
        return path.replace(/~/g, '~0').replace(/\//g, '~1');
    }
    /**
     * Unescapes a json pointer path
     * @param path The escaped pointer
     * @return The unescaped path
     */
    function unescapePathComponent(path) {
        return path.replace(/~1/g, '/').replace(/~0/g, '~');
    }
    /**
    * Recursively checks whether an object has any undefined values inside.
    */
    function hasUndefined(obj) {
        if (obj === undefined) {
            return true;
        }
        if (obj) {
            if (Array.isArray(obj)) {
                for (var i = 0, len = obj.length; i < len; i++) {
                    if (hasUndefined(obj[i])) {
                        return true;
                    }
                }
            }
            else if (typeof obj === "object") {
                var objKeys = _objectKeys(obj);
                var objKeysLength = objKeys.length;
                for (var i = 0; i < objKeysLength; i++) {
                    if (hasUndefined(obj[objKeys[i]])) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    function patchErrorMessageFormatter(message, args) {
        var messageParts = [message];
        for (var key in args) {
            var value = typeof args[key] === 'object' ? JSON.stringify(args[key], null, 2) : args[key]; // pretty print
            if (typeof value !== 'undefined') {
                messageParts.push(key + ": " + value);
            }
        }
        return messageParts.join('\n');
    }
    var PatchError = /** @class */ (function (_super) {
        __extends(PatchError, _super);
        function PatchError(message, name, index, operation, tree) {
            var _newTarget = this.constructor;
            var _this = _super.call(this, patchErrorMessageFormatter(message, { name: name, index: index, operation: operation, tree: tree })) || this;
            _this.name = name;
            _this.index = index;
            _this.operation = operation;
            _this.tree = tree;
            Object.setPrototypeOf(_this, _newTarget.prototype); // restore prototype chain, see https://stackoverflow.com/a/48342359
            _this.message = patchErrorMessageFormatter(message, { name: name, index: index, operation: operation, tree: tree });
            return _this;
        }
        return PatchError;
    }(Error));

    var JsonPatchError = PatchError;
    var deepClone = _deepClone;
    /* We use a Javascript hash to store each
     function. Each hash entry (property) uses
     the operation identifiers specified in rfc6902.
     In this way, we can map each patch operation
     to its dedicated function in efficient way.
     */
    /* The operations applicable to an object */
    var objOps = {
        add: function (obj, key, document) {
            obj[key] = this.value;
            return { newDocument: document };
        },
        remove: function (obj, key, document) {
            var removed = obj[key];
            delete obj[key];
            return { newDocument: document, removed: removed };
        },
        replace: function (obj, key, document) {
            var removed = obj[key];
            obj[key] = this.value;
            return { newDocument: document, removed: removed };
        },
        move: function (obj, key, document) {
            /* in case move target overwrites an existing value,
            return the removed value, this can be taxing performance-wise,
            and is potentially unneeded */
            var removed = getValueByPointer(document, this.path);
            if (removed) {
                removed = _deepClone(removed);
            }
            var originalValue = applyOperation(document, { op: "remove", path: this.from }).removed;
            applyOperation(document, { op: "add", path: this.path, value: originalValue });
            return { newDocument: document, removed: removed };
        },
        copy: function (obj, key, document) {
            var valueToCopy = getValueByPointer(document, this.from);
            // enforce copy by value so further operations don't affect source (see issue #177)
            applyOperation(document, { op: "add", path: this.path, value: _deepClone(valueToCopy) });
            return { newDocument: document };
        },
        test: function (obj, key, document) {
            return { newDocument: document, test: _areEquals(obj[key], this.value) };
        },
        _get: function (obj, key, document) {
            this.value = obj[key];
            return { newDocument: document };
        }
    };
    /* The operations applicable to an array. Many are the same as for the object */
    var arrOps = {
        add: function (arr, i, document) {
            if (isInteger(i)) {
                arr.splice(i, 0, this.value);
            }
            else { // array props
                arr[i] = this.value;
            }
            // this may be needed when using '-' in an array
            return { newDocument: document, index: i };
        },
        remove: function (arr, i, document) {
            var removedList = arr.splice(i, 1);
            return { newDocument: document, removed: removedList[0] };
        },
        replace: function (arr, i, document) {
            var removed = arr[i];
            arr[i] = this.value;
            return { newDocument: document, removed: removed };
        },
        move: objOps.move,
        copy: objOps.copy,
        test: objOps.test,
        _get: objOps._get
    };
    /**
     * Retrieves a value from a JSON document by a JSON pointer.
     * Returns the value.
     *
     * @param document The document to get the value from
     * @param pointer an escaped JSON pointer
     * @return The retrieved value
     */
    function getValueByPointer(document, pointer) {
        if (pointer == '') {
            return document;
        }
        var getOriginalDestination = { op: "_get", path: pointer };
        applyOperation(document, getOriginalDestination);
        return getOriginalDestination.value;
    }
    /**
     * Apply a single JSON Patch Operation on a JSON document.
     * Returns the {newDocument, result} of the operation.
     * It modifies the `document` and `operation` objects - it gets the values by reference.
     * If you would like to avoid touching your values, clone them:
     * `jsonpatch.applyOperation(document, jsonpatch._deepClone(operation))`.
     *
     * @param document The document to patch
     * @param operation The operation to apply
     * @param validateOperation `false` is without validation, `true` to use default jsonpatch's validation, or you can pass a `validateOperation` callback to be used for validation.
     * @param mutateDocument Whether to mutate the original document or clone it before applying
     * @param banPrototypeModifications Whether to ban modifications to `__proto__`, defaults to `true`.
     * @return `{newDocument, result}` after the operation
     */
    function applyOperation(document, operation, validateOperation, mutateDocument, banPrototypeModifications, index) {
        if (validateOperation === void 0) { validateOperation = false; }
        if (mutateDocument === void 0) { mutateDocument = true; }
        if (banPrototypeModifications === void 0) { banPrototypeModifications = true; }
        if (index === void 0) { index = 0; }
        if (validateOperation) {
            if (typeof validateOperation == 'function') {
                validateOperation(operation, 0, document, operation.path);
            }
            else {
                validator(operation, 0);
            }
        }
        /* ROOT OPERATIONS */
        if (operation.path === "") {
            var returnValue = { newDocument: document };
            if (operation.op === 'add') {
                returnValue.newDocument = operation.value;
                return returnValue;
            }
            else if (operation.op === 'replace') {
                returnValue.newDocument = operation.value;
                returnValue.removed = document; //document we removed
                return returnValue;
            }
            else if (operation.op === 'move' || operation.op === 'copy') { // it's a move or copy to root
                returnValue.newDocument = getValueByPointer(document, operation.from); // get the value by json-pointer in `from` field
                if (operation.op === 'move') { // report removed item
                    returnValue.removed = document;
                }
                return returnValue;
            }
            else if (operation.op === 'test') {
                returnValue.test = _areEquals(document, operation.value);
                if (returnValue.test === false) {
                    throw new JsonPatchError("Test operation failed", 'TEST_OPERATION_FAILED', index, operation, document);
                }
                returnValue.newDocument = document;
                return returnValue;
            }
            else if (operation.op === 'remove') { // a remove on root
                returnValue.removed = document;
                returnValue.newDocument = null;
                return returnValue;
            }
            else if (operation.op === '_get') {
                operation.value = document;
                return returnValue;
            }
            else { /* bad operation */
                if (validateOperation) {
                    throw new JsonPatchError('Operation `op` property is not one of operations defined in RFC-6902', 'OPERATION_OP_INVALID', index, operation, document);
                }
                else {
                    return returnValue;
                }
            }
        } /* END ROOT OPERATIONS */
        else {
            if (!mutateDocument) {
                document = _deepClone(document);
            }
            var path = operation.path || "";
            var keys = path.split('/');
            var obj = document;
            var t = 1; //skip empty element - http://jsperf.com/to-shift-or-not-to-shift
            var len = keys.length;
            var existingPathFragment = undefined;
            var key = void 0;
            var validateFunction = void 0;
            if (typeof validateOperation == 'function') {
                validateFunction = validateOperation;
            }
            else {
                validateFunction = validator;
            }
            while (true) {
                key = keys[t];
                if (banPrototypeModifications && key == '__proto__') {
                    throw new TypeError('JSON-Patch: modifying `__proto__` prop is banned for security reasons, if this was on purpose, please set `banPrototypeModifications` flag false and pass it to this function. More info in fast-json-patch README');
                }
                if (validateOperation) {
                    if (existingPathFragment === undefined) {
                        if (obj[key] === undefined) {
                            existingPathFragment = keys.slice(0, t).join('/');
                        }
                        else if (t == len - 1) {
                            existingPathFragment = operation.path;
                        }
                        if (existingPathFragment !== undefined) {
                            validateFunction(operation, 0, document, existingPathFragment);
                        }
                    }
                }
                t++;
                if (Array.isArray(obj)) {
                    if (key === '-') {
                        key = obj.length;
                    }
                    else {
                        if (validateOperation && !isInteger(key)) {
                            throw new JsonPatchError("Expected an unsigned base-10 integer value, making the new referenced value the array element with the zero-based index", "OPERATION_PATH_ILLEGAL_ARRAY_INDEX", index, operation, document);
                        } // only parse key when it's an integer for `arr.prop` to work
                        else if (isInteger(key)) {
                            key = ~~key;
                        }
                    }
                    if (t >= len) {
                        if (validateOperation && operation.op === "add" && key > obj.length) {
                            throw new JsonPatchError("The specified index MUST NOT be greater than the number of elements in the array", "OPERATION_VALUE_OUT_OF_BOUNDS", index, operation, document);
                        }
                        var returnValue = arrOps[operation.op].call(operation, obj, key, document); // Apply patch
                        if (returnValue.test === false) {
                            throw new JsonPatchError("Test operation failed", 'TEST_OPERATION_FAILED', index, operation, document);
                        }
                        return returnValue;
                    }
                }
                else {
                    if (key && key.indexOf('~') != -1) {
                        key = unescapePathComponent(key);
                    }
                    if (t >= len) {
                        var returnValue = objOps[operation.op].call(operation, obj, key, document); // Apply patch
                        if (returnValue.test === false) {
                            throw new JsonPatchError("Test operation failed", 'TEST_OPERATION_FAILED', index, operation, document);
                        }
                        return returnValue;
                    }
                }
                obj = obj[key];
            }
        }
    }
    /**
     * Apply a full JSON Patch array on a JSON document.
     * Returns the {newDocument, result} of the patch.
     * It modifies the `document` object and `patch` - it gets the values by reference.
     * If you would like to avoid touching your values, clone them:
     * `jsonpatch.applyPatch(document, jsonpatch._deepClone(patch))`.
     *
     * @param document The document to patch
     * @param patch The patch to apply
     * @param validateOperation `false` is without validation, `true` to use default jsonpatch's validation, or you can pass a `validateOperation` callback to be used for validation.
     * @param mutateDocument Whether to mutate the original document or clone it before applying
     * @param banPrototypeModifications Whether to ban modifications to `__proto__`, defaults to `true`.
     * @return An array of `{newDocument, result}` after the patch
     */
    function applyPatch(document, patch, validateOperation, mutateDocument, banPrototypeModifications) {
        if (mutateDocument === void 0) { mutateDocument = true; }
        if (banPrototypeModifications === void 0) { banPrototypeModifications = true; }
        if (validateOperation) {
            if (!Array.isArray(patch)) {
                throw new JsonPatchError('Patch sequence must be an array', 'SEQUENCE_NOT_AN_ARRAY');
            }
        }
        if (!mutateDocument) {
            document = _deepClone(document);
        }
        var results = new Array(patch.length);
        for (var i = 0, length_1 = patch.length; i < length_1; i++) {
            // we don't need to pass mutateDocument argument because if it was true, we already deep cloned the object, we'll just pass `true`
            results[i] = applyOperation(document, patch[i], validateOperation, true, banPrototypeModifications, i);
            document = results[i].newDocument; // in case root was replaced
        }
        results.newDocument = document;
        return results;
    }
    /**
     * Apply a single JSON Patch Operation on a JSON document.
     * Returns the updated document.
     * Suitable as a reducer.
     *
     * @param document The document to patch
     * @param operation The operation to apply
     * @return The updated document
     */
    function applyReducer(document, operation, index) {
        var operationResult = applyOperation(document, operation);
        if (operationResult.test === false) { // failed test
            throw new JsonPatchError("Test operation failed", 'TEST_OPERATION_FAILED', index, operation, document);
        }
        return operationResult.newDocument;
    }
    /**
     * Validates a single operation. Called from `jsonpatch.validate`. Throws `JsonPatchError` in case of an error.
     * @param {object} operation - operation object (patch)
     * @param {number} index - index of operation in the sequence
     * @param {object} [document] - object where the operation is supposed to be applied
     * @param {string} [existingPathFragment] - comes along with `document`
     */
    function validator(operation, index, document, existingPathFragment) {
        if (typeof operation !== 'object' || operation === null || Array.isArray(operation)) {
            throw new JsonPatchError('Operation is not an object', 'OPERATION_NOT_AN_OBJECT', index, operation, document);
        }
        else if (!objOps[operation.op]) {
            throw new JsonPatchError('Operation `op` property is not one of operations defined in RFC-6902', 'OPERATION_OP_INVALID', index, operation, document);
        }
        else if (typeof operation.path !== 'string') {
            throw new JsonPatchError('Operation `path` property is not a string', 'OPERATION_PATH_INVALID', index, operation, document);
        }
        else if (operation.path.indexOf('/') !== 0 && operation.path.length > 0) {
            // paths that aren't empty string should start with "/"
            throw new JsonPatchError('Operation `path` property must start with "/"', 'OPERATION_PATH_INVALID', index, operation, document);
        }
        else if ((operation.op === 'move' || operation.op === 'copy') && typeof operation.from !== 'string') {
            throw new JsonPatchError('Operation `from` property is not present (applicable in `move` and `copy` operations)', 'OPERATION_FROM_REQUIRED', index, operation, document);
        }
        else if ((operation.op === 'add' || operation.op === 'replace' || operation.op === 'test') && operation.value === undefined) {
            throw new JsonPatchError('Operation `value` property is not present (applicable in `add`, `replace` and `test` operations)', 'OPERATION_VALUE_REQUIRED', index, operation, document);
        }
        else if ((operation.op === 'add' || operation.op === 'replace' || operation.op === 'test') && hasUndefined(operation.value)) {
            throw new JsonPatchError('Operation `value` property is not present (applicable in `add`, `replace` and `test` operations)', 'OPERATION_VALUE_CANNOT_CONTAIN_UNDEFINED', index, operation, document);
        }
        else if (document) {
            if (operation.op == "add") {
                var pathLen = operation.path.split("/").length;
                var existingPathLen = existingPathFragment.split("/").length;
                if (pathLen !== existingPathLen + 1 && pathLen !== existingPathLen) {
                    throw new JsonPatchError('Cannot perform an `add` operation at the desired path', 'OPERATION_PATH_CANNOT_ADD', index, operation, document);
                }
            }
            else if (operation.op === 'replace' || operation.op === 'remove' || operation.op === '_get') {
                if (operation.path !== existingPathFragment) {
                    throw new JsonPatchError('Cannot perform the operation at a path that does not exist', 'OPERATION_PATH_UNRESOLVABLE', index, operation, document);
                }
            }
            else if (operation.op === 'move' || operation.op === 'copy') {
                var existingValue = { op: "_get", path: operation.from, value: undefined };
                var error = validate([existingValue], document);
                if (error && error.name === 'OPERATION_PATH_UNRESOLVABLE') {
                    throw new JsonPatchError('Cannot perform the operation from a path that does not exist', 'OPERATION_FROM_UNRESOLVABLE', index, operation, document);
                }
            }
        }
    }
    /**
     * Validates a sequence of operations. If `document` parameter is provided, the sequence is additionally validated against the object document.
     * If error is encountered, returns a JsonPatchError object
     * @param sequence
     * @param document
     * @returns {JsonPatchError|undefined}
     */
    function validate(sequence, document, externalValidator) {
        try {
            if (!Array.isArray(sequence)) {
                throw new JsonPatchError('Patch sequence must be an array', 'SEQUENCE_NOT_AN_ARRAY');
            }
            if (document) {
                //clone document and sequence so that we can safely try applying operations
                applyPatch(_deepClone(document), _deepClone(sequence), externalValidator || true);
            }
            else {
                externalValidator = externalValidator || validator;
                for (var i = 0; i < sequence.length; i++) {
                    externalValidator(sequence[i], i, document, undefined);
                }
            }
        }
        catch (e) {
            if (e instanceof JsonPatchError) {
                return e;
            }
            else {
                throw e;
            }
        }
    }
    // based on https://github.com/epoberezkin/fast-deep-equal
    // MIT License
    // Copyright (c) 2017 Evgeny Poberezkin
    // Permission is hereby granted, free of charge, to any person obtaining a copy
    // of this software and associated documentation files (the "Software"), to deal
    // in the Software without restriction, including without limitation the rights
    // to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    // copies of the Software, and to permit persons to whom the Software is
    // furnished to do so, subject to the following conditions:
    // The above copyright notice and this permission notice shall be included in all
    // copies or substantial portions of the Software.
    // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    // IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    // FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    // AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    // LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    // OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    // SOFTWARE.
    function _areEquals(a, b) {
        if (a === b)
            return true;
        if (a && b && typeof a == 'object' && typeof b == 'object') {
            var arrA = Array.isArray(a), arrB = Array.isArray(b), i, length, key;
            if (arrA && arrB) {
                length = a.length;
                if (length != b.length)
                    return false;
                for (i = length; i-- !== 0;)
                    if (!_areEquals(a[i], b[i]))
                        return false;
                return true;
            }
            if (arrA != arrB)
                return false;
            var keys = Object.keys(a);
            length = keys.length;
            if (length !== Object.keys(b).length)
                return false;
            for (i = length; i-- !== 0;)
                if (!b.hasOwnProperty(keys[i]))
                    return false;
            for (i = length; i-- !== 0;) {
                key = keys[i];
                if (!_areEquals(a[key], b[key]))
                    return false;
            }
            return true;
        }
        return a !== a && b !== b;
    }

    var core = /*#__PURE__*/Object.freeze({
        __proto__: null,
        JsonPatchError: JsonPatchError,
        deepClone: deepClone,
        getValueByPointer: getValueByPointer,
        applyOperation: applyOperation,
        applyPatch: applyPatch,
        applyReducer: applyReducer,
        validator: validator,
        validate: validate,
        _areEquals: _areEquals
    });

    /*!
     * https://github.com/Starcounter-Jack/JSON-Patch
     * (c) 2017 Joachim Wester
     * MIT license
     */
    var beforeDict = new WeakMap();
    var Mirror = /** @class */ (function () {
        function Mirror(obj) {
            this.observers = new Map();
            this.obj = obj;
        }
        return Mirror;
    }());
    var ObserverInfo = /** @class */ (function () {
        function ObserverInfo(callback, observer) {
            this.callback = callback;
            this.observer = observer;
        }
        return ObserverInfo;
    }());
    function getMirror(obj) {
        return beforeDict.get(obj);
    }
    function getObserverFromMirror(mirror, callback) {
        return mirror.observers.get(callback);
    }
    function removeObserverFromMirror(mirror, observer) {
        mirror.observers.delete(observer.callback);
    }
    /**
     * Detach an observer from an object
     */
    function unobserve(root, observer) {
        observer.unobserve();
    }
    /**
     * Observes changes made to an object, which can then be retrieved using generate
     */
    function observe(obj, callback) {
        var patches = [];
        var observer;
        var mirror = getMirror(obj);
        if (!mirror) {
            mirror = new Mirror(obj);
            beforeDict.set(obj, mirror);
        }
        else {
            var observerInfo = getObserverFromMirror(mirror, callback);
            observer = observerInfo && observerInfo.observer;
        }
        if (observer) {
            return observer;
        }
        observer = {};
        mirror.value = _deepClone(obj);
        if (callback) {
            observer.callback = callback;
            observer.next = null;
            var dirtyCheck = function () {
                generate(observer);
            };
            var fastCheck = function () {
                clearTimeout(observer.next);
                observer.next = setTimeout(dirtyCheck);
            };
            if (typeof window !== 'undefined') { //not Node
                window.addEventListener('mouseup', fastCheck);
                window.addEventListener('keyup', fastCheck);
                window.addEventListener('mousedown', fastCheck);
                window.addEventListener('keydown', fastCheck);
                window.addEventListener('change', fastCheck);
            }
        }
        observer.patches = patches;
        observer.object = obj;
        observer.unobserve = function () {
            generate(observer);
            clearTimeout(observer.next);
            removeObserverFromMirror(mirror, observer);
            if (typeof window !== 'undefined') {
                window.removeEventListener('mouseup', fastCheck);
                window.removeEventListener('keyup', fastCheck);
                window.removeEventListener('mousedown', fastCheck);
                window.removeEventListener('keydown', fastCheck);
                window.removeEventListener('change', fastCheck);
            }
        };
        mirror.observers.set(callback, new ObserverInfo(callback, observer));
        return observer;
    }
    /**
     * Generate an array of patches from an observer
     */
    function generate(observer, invertible) {
        if (invertible === void 0) { invertible = false; }
        var mirror = beforeDict.get(observer.object);
        _generate(mirror.value, observer.object, observer.patches, "", invertible);
        if (observer.patches.length) {
            applyPatch(mirror.value, observer.patches);
        }
        var temp = observer.patches;
        if (temp.length > 0) {
            observer.patches = [];
            if (observer.callback) {
                observer.callback(temp);
            }
        }
        return temp;
    }
    // Dirty check if obj is different from mirror, generate patches and update mirror
    function _generate(mirror, obj, patches, path, invertible) {
        if (obj === mirror) {
            return;
        }
        if (typeof obj.toJSON === "function") {
            obj = obj.toJSON();
        }
        var newKeys = _objectKeys(obj);
        var oldKeys = _objectKeys(mirror);
        var deleted = false;
        //if ever "move" operation is implemented here, make sure this test runs OK: "should not generate the same patch twice (move)"
        for (var t = oldKeys.length - 1; t >= 0; t--) {
            var key = oldKeys[t];
            var oldVal = mirror[key];
            if (hasOwnProperty(obj, key) && !(obj[key] === undefined && oldVal !== undefined && Array.isArray(obj) === false)) {
                var newVal = obj[key];
                if (typeof oldVal == "object" && oldVal != null && typeof newVal == "object" && newVal != null) {
                    _generate(oldVal, newVal, patches, path + "/" + escapePathComponent(key), invertible);
                }
                else {
                    if (oldVal !== newVal) {
                        if (invertible) {
                            patches.push({ op: "test", path: path + "/" + escapePathComponent(key), value: _deepClone(oldVal) });
                        }
                        patches.push({ op: "replace", path: path + "/" + escapePathComponent(key), value: _deepClone(newVal) });
                    }
                }
            }
            else if (Array.isArray(mirror) === Array.isArray(obj)) {
                if (invertible) {
                    patches.push({ op: "test", path: path + "/" + escapePathComponent(key), value: _deepClone(oldVal) });
                }
                patches.push({ op: "remove", path: path + "/" + escapePathComponent(key) });
                deleted = true; // property has been deleted
            }
            else {
                if (invertible) {
                    patches.push({ op: "test", path: path, value: mirror });
                }
                patches.push({ op: "replace", path: path, value: obj });
            }
        }
        if (!deleted && newKeys.length == oldKeys.length) {
            return;
        }
        for (var t = 0; t < newKeys.length; t++) {
            var key = newKeys[t];
            if (!hasOwnProperty(mirror, key) && obj[key] !== undefined) {
                patches.push({ op: "add", path: path + "/" + escapePathComponent(key), value: _deepClone(obj[key]) });
            }
        }
    }
    /**
     * Create an array of patches from the differences in two objects
     */
    function compare(tree1, tree2, invertible) {
        if (invertible === void 0) { invertible = false; }
        var patches = [];
        _generate(tree1, tree2, patches, '', invertible);
        return patches;
    }

    var duplex = /*#__PURE__*/Object.freeze({
        __proto__: null,
        unobserve: unobserve,
        observe: observe,
        generate: generate,
        compare: compare
    });

    var fastJsonPatch = Object.assign({}, core, duplex, {
        JsonPatchError: PatchError,
        deepClone: _deepClone,
        escapePathComponent,
        unescapePathComponent
    });

    // 💡 Extending Emitter - used rarely or not at all...
    // 💡 we do use it inside ConnectedStore so that it can emit 'ready' event
    class SimpleStore extends Eev$1 {
      constructor(initialState = {}) {
        super();

        this.state = initialState;

        this.subscriptions = [];
      }

      set(state) {
        Object.assign(this.state, state);

        // attach state variables directly to store for easier reference from templates
        Object.assign(this, this.state);

        this.pushStateToSubscribers();
      }

      get() {
        return this.state;
      }

      clearState({ except }) {
        for (const key of Object.keys(this.state)) {
          if (!except.includes(key)) {
            delete this[key];
            delete this.state[key];
          }
        }
      }

      subscribe(handler) {
        this.subscriptions.push(handler);
        handler(this.state);
        // return unsubscribe function
        return () => {
          this.subscriptions = this.subscriptions.filter(sub => sub !== handler);
        };
      }

      pushStateToSubscribers() {
        this.subscriptions.forEach(handler => handler(this.state));
      }
    }

    // const store = new SimpleStore();
    // store.set({ a: { b: 1, c: 2 } });
    // console.log(store.state); // { a: { b: 1, c: 2 } }

    // store.set({ a: { d: 1 } });
    // console.log(store.state); // { a: { d: 1 } }

    // store.set({ e: { f: 1 } });
    // console.log(store.state); // { a: { d: 1 }, e: { f: 1 } }

    const { applyPatch: applyJSONPatch } = fastJsonPatch;

    class ConnectedStore extends SimpleStore {
      constructor({ address, ssl = false, port, protocol, lane, keypair = newKeypair(), logStore, rpcRequestTimeout, verbose } = {}) {
        super();

        if (!address) {
          throw new Error('ConnectedStore: missing address');
        }

        this.ssl = ssl;
        this.protocol = protocol;
        this.lane = lane;

        this.logStore = logStore;
        this.verbose = verbose;

        this.rpcRequestTimeout = rpcRequestTimeout;

        this.connect(address, port, keypair);
      }

      action({ action, namespace, payload }) {
        // Special outgoing message: { action: ... }
        // front end to backend ... actions go only this way
        // TODO: check what happens if connector not connected ? ⚠️⚠️⚠️⚠️
        // remove this IF clause and test
        if (this.connector.connected) {
          console.log(`Sending action ${action} over connector ${this.connector.address}`);
          this.connector.send({ action, namespace, payload });
        } else {
          console.log(
            'Warning: trying to send action over disconnected connector, this should be prevented by GUI (to disable any state-changing element when not connected)'
          );
        }
      }

      remoteObject(handle) {
        return this.connector.remoteObject(handle);
      }

      connect(address, port, keypair) {
        this.connector = establishAndMaintainConnection$1({
          address,
          ssl: this.ssl,
          port,
          protocol: this.protocol,
          lane: this.lane,
          keypair,
          rpcRequestTimeout: this.rpcRequestTimeout,
          verbose: this.verbose
        });

        this.connector.on('ready', ({ sharedSecret, sharedSecretHex }) => {
          this.set({ connected: true });

          this.emit('ready'); // store ready event! -- so far used only in ZetaSeek frontend -- multiconnected store does not need this
        });

        // 💡 connected == undefined ==> while trying to connect
        // 💡 connected == false => while disconnected
        // 💡 connected == true => while connected
        setTimeout(() => {
          if (this.connected == undefined) {
            this.set({ connected: false });
          }
        }, 300);

        this.connector.on('disconnect', () => {
          this.set({ connected: false });
        });

        // 💡 Special incoming JSON message: { state: ... } ... parsed as part of 'Connectome State Syncing Protocol'
        this.connector.on('receive_state', state => {
          this.wireStateReceived = true;

          if (this.verbose) {
            console.log(`New store ${address} / ${this.protocol} / ${this.lane} state:`);
            console.log(state);
          }

          this.set(state);
        });

        // 💡 Special incoming JSON message: { diff: ... } ... parsed as part of 'Connectome State Syncing Protocol'
        this.connector.on('receive_diff', diff => {
          if (this.wireStateReceived) {
            applyJSONPatch(this.state, diff);
            this.pushStateToSubscribers();
          }
        });
      }
    }

    class ConnectDevice {
      constructor({ mcs, foreground, connectToDeviceKey }) {
        this.mcs = mcs;
        this.foreground = foreground;
        this.connectToDeviceKey = connectToDeviceKey;
      }

      // create new connected store which is connected to some address
      createStore({ address }) {
        const { port, protocol, lane, logStore, rpcRequestTimeout, verbose, privateKey: clientPrivateKey, publicKey: clientPublicKey } = this.mcs;

        return new ConnectedStore({
          address,
          port,
          protocol,
          lane,
          clientPrivateKey,
          clientPublicKey,
          logStore,
          rpcRequestTimeout,
          verbose
        });
      }

      getDeviceKey(state) {
        const { device } = state;

        if (device && device.deviceKey) {
          const { deviceKey } = device;
          return deviceKey;
        }
      }

      connectThisDevice({ address }) {
        const thisStore = this.createStore({ address });

        // ********************************
        // STORE STATE CHANGE EVENT HANDLER
        // ********************************
        thisStore.subscribe(state => {
          if (!state.nearbyDevices) {
            // ⚠️  magic assignment -- extract ? / improve
            state.nearbyDevices = [];
          }

          const deviceKey = this.getDeviceKey(state);

          if (deviceKey) {
            if (!this.thisDeviceAlreadySetup) {
              this.mcs.stores[deviceKey] = thisStore;
              this.mcs.set({ activeDeviceKey: deviceKey });
            }

            const needToConnectAnotherDevice = this.connectToDeviceKey && this.connectToDeviceKey != deviceKey;

            if (this.mcs.activeDeviceKey == deviceKey && !needToConnectAnotherDevice) {
              const optimisticDeviceName = state.device.deviceName;
              this.foreground.set(state, { optimisticDeviceName });
            }

            // even if this device is not selected, we always copy over keys of interest which only come from this device
            this.foreground.setSpecial(state);

            if (!this.thisDeviceAlreadySetup) {
              if (needToConnectAnotherDevice) {
                this.mcs.switch({ deviceKey: this.connectToDeviceKey });
                delete this.connectToDeviceKey;
              }

              this.thisDeviceAlreadySetup = true;
            }
          }
        });

        return thisStore;
      }

      connectOtherDevice({ address, deviceKey }) {
        const newStore = this.createStore({ address });

        this.mcs.stores[deviceKey] = newStore;

        // ********************************
        // STORE STATE CHANGE EVENT HANDLER
        // ********************************
        newStore.subscribe(state => {
          if (this.mcs.activeDeviceKey == deviceKey) {
            const optimisticDeviceName = state.device ? state.device.deviceName : null;
            this.foreground.set(state, { optimisticDeviceName });
          }
        });
      }
    }

    class Foreground {
      constructor({ mcs, thisDeviceStateKeys }) {
        this.mcs = mcs;
        this.thisDeviceStateKeys = thisDeviceStateKeys;
      }

      specialStoreKeys() {
        return this.thisDeviceStateKeys.concat(['activeDeviceKey', 'optimisticDeviceName']);
      }

      clear() {
        this.mcs.clearState({ except: this.specialStoreKeys() });
      }

      set(state, { optimisticDeviceName = undefined } = {}) {
        this.clear();

        const setState = {};

        for (const key of Object.keys(state)) {
          if (!this.specialStoreKeys().includes(key)) {
            setState[key] = state[key];
          }
        }

        if (optimisticDeviceName) {
          setState.optimisticDeviceName = optimisticDeviceName;
        }

        this.mcs.set(setState);
      }

      // nearbyDevices, time, notifications -> these appear in foreground state always taken
      // from localDeviceState instead of actively selected device
      setSpecial(localDeviceState) {
        const setState = {};

        for (const key of this.thisDeviceStateKeys) {
          setState[key] = localDeviceState[key];
        }

        this.mcs.set(setState);
      }
    }

    class SwitchDevice extends Eev$1 {
      constructor({ mcs, connectDevice, foreground }) {
        super();

        this.mcs = mcs;
        this.connectDevice = connectDevice;
        this.foreground = foreground;
      }

      switchState({ deviceKey, deviceName }) {
        this.mcs.set({ activeDeviceKey: deviceKey });
        const { state } = this.mcs.stores[deviceKey];
        this.foreground.set(state, { optimisticDeviceName: deviceName });
      }

      switch({ address, deviceKey, deviceName }) {
        if (this.mcs.stores[deviceKey]) {
          this.switchState({ deviceKey, deviceName });
        } else if (address) {
          // first connect to this address === each device goes through this on first connect

          // ⚠️⚠️⚠️ NEEDED TO BE REALISTIC (but experiment further!):
          this.foreground.clear(); // PROBLEMATIC !! :) partially .. GLITCHES... how to make less flickering and still be realistic
          // OR WE JUST LIVE WITH THIS AND IT'S OK ?
          // REMOVE THIS 👆 and see how it works then... it's not completely ok.. esp. if device is not online anymore but still in nearbyList!

          // we don't set through foreground because it doesn't allow us to set activeDeviceKey
          this.mcs.set({ activeDeviceKey: deviceKey, optimisticDeviceName: deviceName });

          this.connectDevice.connectOtherDevice({ address, deviceKey });
        } else {
          // we land here via connectToDeviceKey initial option (for now)

          // if first time switching to this address, create store and setup state transfer to multiConnectedStore
          // get address from nearbyDevices... if thisDevice, don't do anything...
          const matchingDevice = this.mcs.nearbyDevices.find(device => device.deviceKey == deviceKey && !device.thisDevice);

          // we expect 'address' in our methods and nearbyDevices only have 'ip'
          matchingDevice.address = matchingDevice.ip;

          if (matchingDevice) {
            this.switch(matchingDevice); // matchingDevice contains { deviceKey, address }
          } else {
            // ⚠️ TODO remove localstorage when we fail to connect to somedevice at first
            this.emit('connect_to_device_key_failed');

            // this is convenient... we need deviceName by out current logic so that it appears immediately without waiting for connect
            // optimisticDeviceName is only set in foreground and on each this device state change
            const thisDevice = this.mcs.nearbyDevices.find(device => device.thisDevice);
            this.switchState(thisDevice);
          }
        }
      }
    }

    class MultiConnectedStore extends SimpleStore {
      // todo: add ssl argument
      constructor({ address, port, protocol, lane, keypair = newKeypair(), connectToDeviceKey, logStore, rpcRequestTimeout, verbose }) {
        super();

        if (!address) {
          throw new Error('MultiConnectedStore: missing address');
        }

        const thisDeviceStateKeys = ['time', 'environment', 'nearbyDevices', 'notifications'];

        this.publicKey = keypair.publicKey;
        this.privateKey = keypair.privateKey;

        this.port = port;
        this.protocol = protocol;
        this.lane = lane;

        this.logStore = logStore;
        this.rpcRequestTimeout = rpcRequestTimeout;
        this.verbose = verbose;

        this.stores = {};

        const foreground = new Foreground({ mcs: this, thisDeviceStateKeys });
        const connectDevice = new ConnectDevice({ mcs: this, foreground, connectToDeviceKey });

        this.switchDevice = new SwitchDevice({ mcs: this, connectDevice, foreground });
        this.switchDevice.on('connect_to_device_key_failed', () => {
          this.emit('connect_to_device_key_failed');
        });

        this.localDeviceStore = connectDevice.connectThisDevice({ address });
      }

      // send user actions from frontend (clicks, options etc...) to the appropriate backend (on local or currently tunneled device) via websocket
      action({ action, namespace, payload }) {
        // this is not really needed but we have it just in case if "pointer-events: none;" is not added exactly at te right time
        // it will be added through componentBridge::aspectGui which also check videoOverlay() property
        // if (this.videoOverlay()) {
        //   return;
        // }

        //this.guiEngaged();
        //this.currentStore();
        if (this.activeStore()) {
          this.activeStore().action({ action, namespace, payload });
        } else {
          console.log(`Error emitting remote action ${action} / ${namespace}. Debug info: activeDeviceKey=${this.activeDeviceKey}`);
        }
      }

      actionAtLocalDevice({ action, namespace, payload }) {
        this.localDeviceStore.action({ action, namespace, payload });
      }

      remoteObject(objectName) {
        if (this.activeStore()) {
          return this.activeStore().remoteObject(objectName);
        }

        console.log(`Error obtaining remote object ${objectName}. Debug info: activeDeviceKey=${this.activeDeviceKey}`);
      }

      switch({ address, deviceKey, deviceName }) {
        this.switchDevice.switch({ address, deviceKey, deviceName });
      }

      // "INTERNAL API"
      activeStore() {
        if (this.activeDeviceKey) {
          return this.stores[this.activeDeviceKey];
        }
      }
    }

    class LogStore extends SimpleStore {
      constructor() {
        super();

        this.set({ log: [] });
      }

      // todo: maybe move to MultiConnected store... and use only that store in place of connectedstore,,, but fix it to just one connection
      // when used as single-connected store
      // cannot use console.log from here!!, use "origLog" -- for debugging
      addToLog({ origConsoleLog, limit }, ...args) {
        // arguments are collected and single argument passed in actually became an array with one element
        if (args.length == 1) {
          args = args[0];
        }

        let { log } = this.get();

        if (typeof args == 'string') {
          log.push(args);
        } else {
          try {
            log.push(`${JSON.stringify(args)}`);
          } catch (e) {
            log.push(args);
          }
        }

        log = log.slice(-limit);

        this.set({ log });
      }
    }

    /*
      Deep clones all properties except functions

      var arr = [1, 2, 3];
      var subObj = {aa: 1};
      var obj = {a: 3, b: 5, c: arr, d: subObj};
      var objClone = clone(obj);
      arr.push(4);
      subObj.bb = 2;
      obj; // {a: 3, b: 5, c: [1, 2, 3, 4], d: {aa: 1}}
      objClone; // {a: 3, b: 5, c: [1, 2, 3], d: {aa: 1, bb: 2}}
    */

    function clone(obj) {
      if (typeof obj == 'function') {
        return obj;
      }
      var result = Array.isArray(obj) ? [] : {};
      for (var key in obj) {
        // include prototype properties
        var value = obj[key];
        var type = {}.toString.call(value).slice(8, -1);
        if (type == 'Array' || type == 'Object') {
          result[key] = clone(value);
        } else if (type == 'Date') {
          result[key] = new Date(value.getTime());
        } else if (type == 'RegExp') {
          result[key] = RegExp(value.source, getRegExpFlags(value));
        } else {
          result[key] = value;
        }
      }
      return result;
    }

    function getRegExpFlags(regExp) {
      if (typeof regExp.source.flags == 'string') {
        return regExp.source.flags;
      } else {
        var flags = [];
        regExp.global && flags.push('g');
        regExp.ignoreCase && flags.push('i');
        regExp.multiline && flags.push('m');
        regExp.sticky && flags.push('y');
        regExp.unicode && flags.push('u');
        return flags.join('');
      }
    }

    function isObject$1(val) {
      return val != null && typeof val === 'object' && Array.isArray(val) === false;
    }

    function isObjectObject(o) {
      return isObject$1(o) === true && Object.prototype.toString.call(o) === '[object Object]';
    }

    function isPlainObject(o) {
      var ctor, prot;

      if (isObjectObject(o) === false) return false;

      // If has modified constructor
      ctor = o.constructor;
      if (typeof ctor !== 'function') return false;

      // If has modified prototype
      prot = ctor.prototype;
      if (isObjectObject(prot) === false) return false;

      // If constructor does not have an Object-specific method
      if (prot.hasOwnProperty('isPrototypeOf') === false) {
        return false;
      }

      // Most likely a plain Object
      return true;
    }

    //The MIT License (MIT)

    function emptyTarget(val) {
      return Array.isArray(val) ? [] : {};
    }

    function cloneUnlessOtherwiseSpecified(value, options) {
      return options.clone !== false && options.isMergeableObject(value) ? deepmerge(emptyTarget(value), value, options) : value;
    }

    function defaultArrayMerge(target, source, options) {
      return target.concat(source).map(function(element) {
        return cloneUnlessOtherwiseSpecified(element, options);
      });
    }

    function getMergeFunction(key, options) {
      if (!options.customMerge) {
        return deepmerge;
      }
      var customMerge = options.customMerge(key);
      return typeof customMerge === 'function' ? customMerge : deepmerge;
    }

    function mergeObject(target, source, options) {
      var destination = {};
      if (options.isMergeableObject(target)) {
        Object.keys(target).forEach(function(key) {
          destination[key] = cloneUnlessOtherwiseSpecified(target[key], options);
        });
      }
      Object.keys(source).forEach(function(key) {
        if (!options.isMergeableObject(source[key]) || !target[key]) {
          destination[key] = cloneUnlessOtherwiseSpecified(source[key], options);
        } else {
          destination[key] = getMergeFunction(key, options)(target[key], source[key], options);
        }
      });
      return destination;
    }

    function deepmerge(target, source, options) {
      options = options || {};
      options.arrayMerge = options.arrayMerge || defaultArrayMerge;
      options.isMergeableObject = options.isMergeableObject || isPlainObject;

      var sourceIsArray = Array.isArray(source);
      var targetIsArray = Array.isArray(target);
      var sourceAndTargetTypesMatch = sourceIsArray === targetIsArray;

      if (!sourceAndTargetTypesMatch) {
        return cloneUnlessOtherwiseSpecified(source, options);
      } else if (sourceIsArray) {
        return options.arrayMerge(target, source, options);
      } else {
        return mergeObject(target, source, options);
      }
    }

    deepmerge.all = function deepmergeAll(array, options) {
      if (!Array.isArray(array)) {
        throw new Error('first argument should be an array');
      }

      return array.reduce(function(prev, next) {
        return deepmerge(prev, next, options);
      }, {});
    };

    var pointer = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Pointer = void 0;
    /**
    Unescape token part of a JSON Pointer string

    `token` should *not* contain any '/' characters.

    > Evaluation of each reference token begins by decoding any escaped
    > character sequence.  This is performed by first transforming any
    > occurrence of the sequence '~1' to '/', and then transforming any
    > occurrence of the sequence '~0' to '~'.  By performing the
    > substitutions in this order, an implementation avoids the error of
    > turning '~01' first into '~1' and then into '/', which would be
    > incorrect (the string '~01' correctly becomes '~1' after
    > transformation).

    Here's my take:

    ~1 is unescaped with higher priority than ~0 because it is a lower-order escape character.
    I say "lower order" because '/' needs escaping due to the JSON Pointer serialization technique.
    Whereas, '~' is escaped because escaping '/' uses the '~' character.
    */
    function unescape(token) {
        return token.replace(/~1/g, '/').replace(/~0/g, '~');
    }
    /** Escape token part of a JSON Pointer string

    > '~' needs to be encoded as '~0' and '/'
    > needs to be encoded as '~1' when these characters appear in a
    > reference token.

    This is the exact inverse of `unescape()`, so the reverse replacements must take place in reverse order.
    */
    function escape(token) {
        return token.replace(/~/g, '~0').replace(/\//g, '~1');
    }
    /**
    JSON Pointer representation
    */
    var Pointer = /** @class */ (function () {
        function Pointer(tokens) {
            if (tokens === void 0) { tokens = ['']; }
            this.tokens = tokens;
        }
        /**
        `path` *must* be a properly escaped string.
        */
        Pointer.fromJSON = function (path) {
            var tokens = path.split('/').map(unescape);
            if (tokens[0] !== '')
                throw new Error("Invalid JSON Pointer: " + path);
            return new Pointer(tokens);
        };
        Pointer.prototype.toString = function () {
            return this.tokens.map(escape).join('/');
        };
        /**
        Returns an object with 'parent', 'key', and 'value' properties.
        In the special case that this Pointer's path == "",
        this object will be {parent: null, key: '', value: object}.
        Otherwise, parent and key will have the property such that parent[key] == value.
        */
        Pointer.prototype.evaluate = function (object) {
            var parent = null;
            var key = '';
            var value = object;
            for (var i = 1, l = this.tokens.length; i < l; i++) {
                parent = value;
                key = this.tokens[i];
                // not sure if this the best way to handle non-existant paths...
                value = (parent || {})[key];
            }
            return { parent: parent, key: key, value: value };
        };
        Pointer.prototype.get = function (object) {
            return this.evaluate(object).value;
        };
        Pointer.prototype.set = function (object, value) {
            var cursor = object;
            for (var i = 1, l = this.tokens.length - 1, token = this.tokens[i]; i < l; i++) {
                // not sure if this the best way to handle non-existant paths...
                cursor = (cursor || {})[token];
            }
            if (cursor) {
                cursor[this.tokens[this.tokens.length - 1]] = value;
            }
        };
        Pointer.prototype.push = function (token) {
            // mutable
            this.tokens.push(token);
        };
        /**
        `token` should be a String. It'll be coerced to one anyway.
      
        immutable (shallowly)
        */
        Pointer.prototype.add = function (token) {
            var tokens = this.tokens.concat(String(token));
            return new Pointer(tokens);
        };
        return Pointer;
    }());
    exports.Pointer = Pointer;
    });

    var util$1 = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.clone = exports.objectType = exports.hasOwnProperty = void 0;
    exports.hasOwnProperty = Object.prototype.hasOwnProperty;
    function objectType(object) {
        if (object === undefined) {
            return 'undefined';
        }
        if (object === null) {
            return 'null';
        }
        if (Array.isArray(object)) {
            return 'array';
        }
        return typeof object;
    }
    exports.objectType = objectType;
    function isNonPrimitive(value) {
        // loose-equality checking for null is faster than strict checking for each of null/undefined/true/false
        // checking null first, then calling typeof, is faster than vice-versa
        return value != null && typeof value == 'object';
    }
    /**
    Recursively copy a value.

    @param source - should be a JavaScript primitive, Array, or (plain old) Object.
    @returns copy of source where every Array and Object have been recursively
             reconstructed from their constituent elements
    */
    function clone(source) {
        if (!isNonPrimitive(source)) {
            // short-circuiting is faster than a single return
            return source;
        }
        // x.constructor == Array is the fastest way to check if x is an Array
        if (source.constructor == Array) {
            // construction via imperative for-loop is faster than source.map(arrayVsObject)
            var length_1 = source.length;
            // setting the Array length during construction is faster than just `[]` or `new Array()`
            var arrayTarget = new Array(length_1);
            for (var i = 0; i < length_1; i++) {
                arrayTarget[i] = clone(source[i]);
            }
            return arrayTarget;
        }
        // Object
        var objectTarget = {};
        // declaring the variable (with const) inside the loop is faster
        for (var key in source) {
            // hasOwnProperty costs a bit of performance, but it's semantically necessary
            // using a global helper is MUCH faster than calling source.hasOwnProperty(key)
            if (exports.hasOwnProperty.call(source, key)) {
                objectTarget[key] = clone(source[key]);
            }
        }
        return objectTarget;
    }
    exports.clone = clone;
    });

    var diff = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.diffAny = exports.diffObjects = exports.diffArrays = exports.intersection = exports.subtract = exports.isDestructive = void 0;
     // we only need this for type inference

    function isDestructive(_a) {
        var op = _a.op;
        return op === 'remove' || op === 'replace' || op === 'copy' || op === 'move';
    }
    exports.isDestructive = isDestructive;
    /**
    List the keys in `minuend` that are not in `subtrahend`.

    A key is only considered if it is both 1) an own-property (o.hasOwnProperty(k))
    of the object, and 2) has a value that is not undefined. This is to match JSON
    semantics, where JSON object serialization drops keys with undefined values.

    @param minuend Object of interest
    @param subtrahend Object of comparison
    @returns Array of keys that are in `minuend` but not in `subtrahend`.
    */
    function subtract(minuend, subtrahend) {
        // initialize empty object; we only care about the keys, the values can be anything
        var obj = {};
        // build up obj with all the properties of minuend
        for (var add_key in minuend) {
            if (util$1.hasOwnProperty.call(minuend, add_key) && minuend[add_key] !== undefined) {
                obj[add_key] = 1;
            }
        }
        // now delete all the properties of subtrahend from obj
        // (deleting a missing key has no effect)
        for (var del_key in subtrahend) {
            if (util$1.hasOwnProperty.call(subtrahend, del_key) && subtrahend[del_key] !== undefined) {
                delete obj[del_key];
            }
        }
        // finally, extract whatever keys remain in obj
        return Object.keys(obj);
    }
    exports.subtract = subtract;
    /**
    List the keys that shared by all `objects`.

    The semantics of what constitutes a "key" is described in {@link subtract}.

    @param objects Array of objects to compare
    @returns Array of keys that are in ("own-properties" of) every object in `objects`.
    */
    function intersection(objects) {
        var length = objects.length;
        // prepare empty counter to keep track of how many objects each key occurred in
        var counter = {};
        // go through each object and increment the counter for each key in that object
        for (var i = 0; i < length; i++) {
            var object = objects[i];
            for (var key in object) {
                if (util$1.hasOwnProperty.call(object, key) && object[key] !== undefined) {
                    counter[key] = (counter[key] || 0) + 1;
                }
            }
        }
        // now delete all keys from the counter that were not seen in every object
        for (var key in counter) {
            if (counter[key] < length) {
                delete counter[key];
            }
        }
        // finally, extract whatever keys remain in the counter
        return Object.keys(counter);
    }
    exports.intersection = intersection;
    function isArrayAdd(array_operation) {
        return array_operation.op === 'add';
    }
    function isArrayRemove(array_operation) {
        return array_operation.op === 'remove';
    }
    function appendArrayOperation(base, operation) {
        return {
            // the new operation must be pushed on the end
            operations: base.operations.concat(operation),
            cost: base.cost + 1,
        };
    }
    /**
    Calculate the shortest sequence of operations to get from `input` to `output`,
    using a dynamic programming implementation of the Levenshtein distance algorithm.

    To get from the input ABC to the output AZ we could just delete all the input
    and say "insert A, insert Z" and be done with it. That's what we do if the
    input is empty. But we can be smarter.

              output
                   A   Z
                   -   -
              [0]  1   2
    input A |  1  [0]  1
          B |  2  [1]  1
          C |  3   2  [2]

    1) start at 0,0 (+0)
    2) keep A (+0)
    3) remove B (+1)
    4) replace C with Z (+1)

    If the `input` (source) is empty, they'll all be in the top row, resulting in an
    array of 'add' operations.
    If the `output` (target) is empty, everything will be in the left column,
    resulting in an array of 'remove' operations.

    @returns A list of add/remove/replace operations.
    */
    function diffArrays(input, output, ptr, diff) {
        if (diff === void 0) { diff = diffAny; }
        // set up cost matrix (very simple initialization: just a map)
        var memo = {
            '0,0': { operations: [], cost: 0 },
        };
        /**
        Calculate the cheapest sequence of operations required to get from
        input.slice(0, i) to output.slice(0, j).
        There may be other valid sequences with the same cost, but none cheaper.
      
        @param i The row in the layout above
        @param j The column in the layout above
        @returns An object containing a list of operations, along with the total cost
                 of applying them (+1 for each add/remove/replace operation)
        */
        function dist(i, j) {
            // memoized
            var memo_key = i + "," + j;
            var memoized = memo[memo_key];
            if (memoized === undefined) {
                // TODO: this !diff(...).length usage could/should be lazy
                if (i > 0 && j > 0 && !diff(input[i - 1], output[j - 1], new pointer.Pointer()).length) {
                    // equal (no operations => no cost)
                    memoized = dist(i - 1, j - 1);
                }
                else {
                    var alternatives = [];
                    if (i > 0) {
                        // NOT topmost row
                        var remove_base = dist(i - 1, j);
                        var remove_operation = {
                            op: 'remove',
                            index: i - 1,
                        };
                        alternatives.push(appendArrayOperation(remove_base, remove_operation));
                    }
                    if (j > 0) {
                        // NOT leftmost column
                        var add_base = dist(i, j - 1);
                        var add_operation = {
                            op: 'add',
                            index: i - 1,
                            value: output[j - 1],
                        };
                        alternatives.push(appendArrayOperation(add_base, add_operation));
                    }
                    if (i > 0 && j > 0) {
                        // TABLE MIDDLE
                        // supposing we replaced it, compute the rest of the costs:
                        var replace_base = dist(i - 1, j - 1);
                        // okay, the general plan is to replace it, but we can be smarter,
                        // recursing into the structure and replacing only part of it if
                        // possible, but to do so we'll need the original value
                        var replace_operation = {
                            op: 'replace',
                            index: i - 1,
                            original: input[i - 1],
                            value: output[j - 1],
                        };
                        alternatives.push(appendArrayOperation(replace_base, replace_operation));
                    }
                    // the only other case, i === 0 && j === 0, has already been memoized
                    // the meat of the algorithm:
                    // sort by cost to find the lowest one (might be several ties for lowest)
                    // [4, 6, 7, 1, 2].sort((a, b) => a - b) -> [ 1, 2, 4, 6, 7 ]
                    var best = alternatives.sort(function (a, b) { return a.cost - b.cost; })[0];
                    memoized = best;
                }
                memo[memo_key] = memoized;
            }
            return memoized;
        }
        // handle weird objects masquerading as Arrays that don't have proper length
        // properties by using 0 for everything but positive numbers
        var input_length = (isNaN(input.length) || input.length <= 0) ? 0 : input.length;
        var output_length = (isNaN(output.length) || output.length <= 0) ? 0 : output.length;
        var array_operations = dist(input_length, output_length).operations;
        var padded_operations = array_operations.reduce(function (_a, array_operation) {
            var operations = _a[0], padding = _a[1];
            if (isArrayAdd(array_operation)) {
                var padded_index = array_operation.index + 1 + padding;
                var index_token = padded_index < (input_length + padding) ? String(padded_index) : '-';
                var operation = {
                    op: array_operation.op,
                    path: ptr.add(index_token).toString(),
                    value: array_operation.value,
                };
                // padding++ // maybe only if array_operation.index > -1 ?
                return [operations.concat(operation), padding + 1];
            }
            else if (isArrayRemove(array_operation)) {
                var operation = {
                    op: array_operation.op,
                    path: ptr.add(String(array_operation.index + padding)).toString(),
                };
                // padding--
                return [operations.concat(operation), padding - 1];
            }
            else { // replace
                var replace_ptr = ptr.add(String(array_operation.index + padding));
                var replace_operations = diff(array_operation.original, array_operation.value, replace_ptr);
                return [operations.concat.apply(operations, replace_operations), padding];
            }
        }, [[], 0])[0];
        return padded_operations;
    }
    exports.diffArrays = diffArrays;
    function diffObjects(input, output, ptr, diff) {
        if (diff === void 0) { diff = diffAny; }
        // if a key is in input but not output -> remove it
        var operations = [];
        subtract(input, output).forEach(function (key) {
            operations.push({ op: 'remove', path: ptr.add(key).toString() });
        });
        // if a key is in output but not input -> add it
        subtract(output, input).forEach(function (key) {
            operations.push({ op: 'add', path: ptr.add(key).toString(), value: output[key] });
        });
        // if a key is in both, diff it recursively
        intersection([input, output]).forEach(function (key) {
            operations.push.apply(operations, diff(input[key], output[key], ptr.add(key)));
        });
        return operations;
    }
    exports.diffObjects = diffObjects;
    /**
    `diffAny()` returns an empty array if `input` and `output` are materially equal
    (i.e., would produce equivalent JSON); otherwise it produces an array of patches
    that would transform `input` into `output`.

    > Here, "equal" means that the value at the target location and the
    > value conveyed by "value" are of the same JSON type, and that they
    > are considered equal by the following rules for that type:
    > o  strings: are considered equal if they contain the same number of
    >    Unicode characters and their code points are byte-by-byte equal.
    > o  numbers: are considered equal if their values are numerically
    >    equal.
    > o  arrays: are considered equal if they contain the same number of
    >    values, and if each value can be considered equal to the value at
    >    the corresponding position in the other array, using this list of
    >    type-specific rules.
    > o  objects: are considered equal if they contain the same number of
    >    members, and if each member can be considered equal to a member in
    >    the other object, by comparing their keys (as strings) and their
    >    values (using this list of type-specific rules).
    > o  literals (false, true, and null): are considered equal if they are
    >    the same.
    */
    function diffAny(input, output, ptr, diff) {
        if (diff === void 0) { diff = diffAny; }
        // strict equality handles literals, numbers, and strings (a sufficient but not necessary cause)
        if (input === output) {
            return [];
        }
        var input_type = util$1.objectType(input);
        var output_type = util$1.objectType(output);
        if (input_type == 'array' && output_type == 'array') {
            return diffArrays(input, output, ptr, diff);
        }
        if (input_type == 'object' && output_type == 'object') {
            return diffObjects(input, output, ptr, diff);
        }
        // at this point we know that input and output are materially different;
        // could be array -> object, object -> array, boolean -> undefined,
        // number -> string, or some other combination, but nothing that can be split
        // up into multiple patches: so `output` must replace `input` wholesale.
        return [{ op: 'replace', path: ptr.toString(), value: output }];
    }
    exports.diffAny = diffAny;
    });

    var patch = createCommonjsModule(function (module, exports) {
    var __extends = (commonjsGlobal && commonjsGlobal.__extends) || (function () {
        var extendStatics = function (d, b) {
            extendStatics = Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
                function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
            return extendStatics(d, b);
        };
        return function (d, b) {
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.apply = exports.InvalidOperationError = exports.test = exports.copy = exports.move = exports.replace = exports.remove = exports.add = exports.TestError = exports.MissingError = void 0;



    var MissingError = /** @class */ (function (_super) {
        __extends(MissingError, _super);
        function MissingError(path) {
            var _this = _super.call(this, "Value required at path: " + path) || this;
            _this.path = path;
            _this.name = 'MissingError';
            return _this;
        }
        return MissingError;
    }(Error));
    exports.MissingError = MissingError;
    var TestError = /** @class */ (function (_super) {
        __extends(TestError, _super);
        function TestError(actual, expected) {
            var _this = _super.call(this, "Test failed: " + actual + " != " + expected) || this;
            _this.actual = actual;
            _this.expected = expected;
            _this.name = 'TestError';
            return _this;
        }
        return TestError;
    }(Error));
    exports.TestError = TestError;
    function _add(object, key, value) {
        if (Array.isArray(object)) {
            // `key` must be an index
            if (key == '-') {
                object.push(value);
            }
            else {
                var index = parseInt(key, 10);
                object.splice(index, 0, value);
            }
        }
        else {
            object[key] = value;
        }
    }
    function _remove(object, key) {
        if (Array.isArray(object)) {
            // '-' syntax doesn't make sense when removing
            var index = parseInt(key, 10);
            object.splice(index, 1);
        }
        else {
            // not sure what the proper behavior is when path = ''
            delete object[key];
        }
    }
    /**
    >  o  If the target location specifies an array index, a new value is
    >     inserted into the array at the specified index.
    >  o  If the target location specifies an object member that does not
    >     already exist, a new member is added to the object.
    >  o  If the target location specifies an object member that does exist,
    >     that member's value is replaced.
    */
    function add(object, operation) {
        var endpoint = pointer.Pointer.fromJSON(operation.path).evaluate(object);
        // it's not exactly a "MissingError" in the same way that `remove` is -- more like a MissingParent, or something
        if (endpoint.parent === undefined) {
            return new MissingError(operation.path);
        }
        _add(endpoint.parent, endpoint.key, util$1.clone(operation.value));
        return null;
    }
    exports.add = add;
    /**
    > The "remove" operation removes the value at the target location.
    > The target location MUST exist for the operation to be successful.
    */
    function remove(object, operation) {
        // endpoint has parent, key, and value properties
        var endpoint = pointer.Pointer.fromJSON(operation.path).evaluate(object);
        if (endpoint.value === undefined) {
            return new MissingError(operation.path);
        }
        // not sure what the proper behavior is when path = ''
        _remove(endpoint.parent, endpoint.key);
        return null;
    }
    exports.remove = remove;
    /**
    > The "replace" operation replaces the value at the target location
    > with a new value.  The operation object MUST contain a "value" member
    > whose content specifies the replacement value.
    > The target location MUST exist for the operation to be successful.

    > This operation is functionally identical to a "remove" operation for
    > a value, followed immediately by an "add" operation at the same
    > location with the replacement value.

    Even more simply, it's like the add operation with an existence check.
    */
    function replace(object, operation) {
        var endpoint = pointer.Pointer.fromJSON(operation.path).evaluate(object);
        if (endpoint.parent === null) {
            return new MissingError(operation.path);
        }
        // this existence check treats arrays as a special case
        if (Array.isArray(endpoint.parent)) {
            if (parseInt(endpoint.key, 10) >= endpoint.parent.length) {
                return new MissingError(operation.path);
            }
        }
        else if (endpoint.value === undefined) {
            return new MissingError(operation.path);
        }
        endpoint.parent[endpoint.key] = operation.value;
        return null;
    }
    exports.replace = replace;
    /**
    > The "move" operation removes the value at a specified location and
    > adds it to the target location.
    > The operation object MUST contain a "from" member, which is a string
    > containing a JSON Pointer value that references the location in the
    > target document to move the value from.
    > This operation is functionally identical to a "remove" operation on
    > the "from" location, followed immediately by an "add" operation at
    > the target location with the value that was just removed.

    > The "from" location MUST NOT be a proper prefix of the "path"
    > location; i.e., a location cannot be moved into one of its children.

    TODO: throw if the check described in the previous paragraph fails.
    */
    function move(object, operation) {
        var from_endpoint = pointer.Pointer.fromJSON(operation.from).evaluate(object);
        if (from_endpoint.value === undefined) {
            return new MissingError(operation.from);
        }
        var endpoint = pointer.Pointer.fromJSON(operation.path).evaluate(object);
        if (endpoint.parent === undefined) {
            return new MissingError(operation.path);
        }
        _remove(from_endpoint.parent, from_endpoint.key);
        _add(endpoint.parent, endpoint.key, from_endpoint.value);
        return null;
    }
    exports.move = move;
    /**
    > The "copy" operation copies the value at a specified location to the
    > target location.
    > The operation object MUST contain a "from" member, which is a string
    > containing a JSON Pointer value that references the location in the
    > target document to copy the value from.
    > The "from" location MUST exist for the operation to be successful.

    > This operation is functionally identical to an "add" operation at the
    > target location using the value specified in the "from" member.

    Alternatively, it's like 'move' without the 'remove'.
    */
    function copy(object, operation) {
        var from_endpoint = pointer.Pointer.fromJSON(operation.from).evaluate(object);
        if (from_endpoint.value === undefined) {
            return new MissingError(operation.from);
        }
        var endpoint = pointer.Pointer.fromJSON(operation.path).evaluate(object);
        if (endpoint.parent === undefined) {
            return new MissingError(operation.path);
        }
        _add(endpoint.parent, endpoint.key, util$1.clone(from_endpoint.value));
        return null;
    }
    exports.copy = copy;
    /**
    > The "test" operation tests that a value at the target location is
    > equal to a specified value.
    > The operation object MUST contain a "value" member that conveys the
    > value to be compared to the target location's value.
    > The target location MUST be equal to the "value" value for the
    > operation to be considered successful.
    */
    function test(object, operation) {
        var endpoint = pointer.Pointer.fromJSON(operation.path).evaluate(object);
        // TODO: this diffAny(...).length usage could/should be lazy
        if (diff.diffAny(endpoint.value, operation.value, new pointer.Pointer()).length) {
            return new TestError(endpoint.value, operation.value);
        }
        return null;
    }
    exports.test = test;
    var InvalidOperationError = /** @class */ (function (_super) {
        __extends(InvalidOperationError, _super);
        function InvalidOperationError(operation) {
            var _this = _super.call(this, "Invalid operation: " + operation.op) || this;
            _this.operation = operation;
            _this.name = 'InvalidOperationError';
            return _this;
        }
        return InvalidOperationError;
    }(Error));
    exports.InvalidOperationError = InvalidOperationError;
    /**
    Switch on `operation.op`, applying the corresponding patch function for each
    case to `object`.
    */
    function apply(object, operation) {
        // not sure why TypeScript can't infer typesafety of:
        //   {add, remove, replace, move, copy, test}[operation.op](object, operation)
        // (seems like a bug)
        switch (operation.op) {
            case 'add': return add(object, operation);
            case 'remove': return remove(object, operation);
            case 'replace': return replace(object, operation);
            case 'move': return move(object, operation);
            case 'copy': return copy(object, operation);
            case 'test': return test(object, operation);
        }
        return new InvalidOperationError(operation);
    }
    exports.apply = apply;
    });

    var rfc6902 = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createTests = exports.createPatch = exports.applyPatch = void 0;



    /**
    Apply a 'application/json-patch+json'-type patch to an object.

    `patch` *must* be an array of operations.

    > Operation objects MUST have exactly one "op" member, whose value
    > indicates the operation to perform.  Its value MUST be one of "add",
    > "remove", "replace", "move", "copy", or "test"; other values are
    > errors.

    This method mutates the target object in-place.

    @returns list of results, one for each operation: `null` indicated success,
             otherwise, the result will be an instance of one of the Error classes:
             MissingError, InvalidOperationError, or TestError.
    */
    function applyPatch(object, patch$1) {
        return patch$1.map(function (operation) { return patch.apply(object, operation); });
    }
    exports.applyPatch = applyPatch;
    function wrapVoidableDiff(diff$1) {
        function wrappedDiff(input, output, ptr) {
            var custom_patch = diff$1(input, output, ptr);
            // ensure an array is always returned
            return Array.isArray(custom_patch) ? custom_patch : diff.diffAny(input, output, ptr, wrappedDiff);
        }
        return wrappedDiff;
    }
    /**
    Produce a 'application/json-patch+json'-type patch to get from one object to
    another.

    This does not alter `input` or `output` unless they have a property getter with
    side-effects (which is not a good idea anyway).

    `diff` is called on each pair of comparable non-primitive nodes in the
    `input`/`output` object trees, producing nested patches. Return `undefined`
    to fall back to default behaviour.

    Returns list of operations to perform on `input` to produce `output`.
    */
    function createPatch(input, output, diff$1) {
        var ptr = new pointer.Pointer();
        // a new Pointer gets a default path of [''] if not specified
        return (diff$1 ? wrapVoidableDiff(diff$1) : diff.diffAny)(input, output, ptr);
    }
    exports.createPatch = createPatch;
    /**
    Create a test operation based on `input`'s current evaluation of the JSON
    Pointer `path`; if such a pointer cannot be resolved, returns undefined.
    */
    function createTest(input, path) {
        var endpoint = pointer.Pointer.fromJSON(path).evaluate(input);
        if (endpoint !== undefined) {
            return { op: 'test', path: path, value: endpoint.value };
        }
    }
    /**
    Produce an 'application/json-patch+json'-type list of tests, to verify that
    existing values in an object are identical to the those captured at some
    checkpoint (whenever this function is called).

    This does not alter `input` or `output` unless they have a property getter with
    side-effects (which is not a good idea anyway).

    Returns list of test operations.
    */
    function createTests(input, patch) {
        var tests = new Array();
        patch.filter(diff.isDestructive).forEach(function (operation) {
            var pathTest = createTest(input, operation.path);
            if (pathTest)
                tests.push(pathTest);
            if ('from' in operation) {
                var fromTest = createTest(input, operation.from);
                if (fromTest)
                    tests.push(fromTest);
            }
        });
        return tests;
    }
    exports.createTests = createTests;
    });

    var rfc6902$1 = /*@__PURE__*/getDefaultExportFromCjs(rfc6902);

    const generateJsonPatch = rfc6902$1.createPatch;

    function getDiff(prevAnnouncedState, currentState) {
      const diff = generateJsonPatch(prevAnnouncedState, currentState);

      if (diff.length > 0) {
        return diff;
      }
      // else {
      //   log.red('No need to send patch');
      // }
    }

    class MirroringStore extends Eev$1 {
      constructor(initialState = {}) {
        super();

        this.state = initialState;
        this.prevAnnouncedState = {};
      }

      // automatically create synced store
      mirror(channelList) {
        channelList.on('new_channel', channel => {
          const { state } = this;
          channel.send({ state }); // Sending initial state to each new ws connection !!
        });

        this.on('diff', diff => {
          channelList.sendToAll({ diff });
        });
      }

      set(patch, { announce = true } = {}) {
        Object.assign(this.state, patch);
        this.announceStateChange(announce);
      }

      announceStateChange(announce = true) {
        if (!announce) {
          return;
        }

        const { state } = this;

        const diff = getDiff(this.prevAnnouncedState, state);

        if (diff) {
          this.emit('diff', diff);

          this.prevAnnouncedState = clone(state);
        }
      }
    }

    function mergeState(state, patch) {
      const overwriteMerge = (destinationArray, sourceArray, options) => sourceArray;
      return deepmerge(state, patch, { arrayMerge: overwriteMerge }); // => [3, 2, 1]
    }

    class KeyValueStore {
      constructor() {
        this.state = {};
      }

      update(patch) {
        this.state = mergeState(this.state, patch);
      }

      // rarely used ...
      replaceBaseKey(baseKey, value) {
        this.state[baseKey] = value;
      }

      // set store to {}}
      // cannot remove the baseKey once set!
      // this is not to break the code... baseKey once defined has to always be an object, if empty then it is '{}'
      // never undefined !
      clearBaseKey(baseKey) {
        delete this.state[baseKey];
        //this.replaceBaseKey(baseKey, {}, { announce });
      }

      replaceSubKey({ baseKey, key, value }) {
        this.state[baseKey] = this.state[baseKey] || {};
        this.state[baseKey][key] = value;
      }

      removeSubKey({ baseKey, key }) {
        this.state[baseKey] = this.state[baseKey] || {};
        delete this.state[baseKey][key];
      }

      // RARELY USED -- PERHAPS TO BE REMOVED ??? CHECK:

      // this is probaby not the cleanest way of doing it... this is very similar to updateState but our current
      // implementation there cannot merge arrays, so we need a different way to achieve adding to array (for example for notifications...)
      pushToArray(baseKey, el) {
        this.state[baseKey].push(el);
      }

      removeFromArray(baseKey, removePredicate) {
        this.state[baseKey] = this.state[baseKey].filter(el => !removePredicate(el));
      }
    }

    // this store is not aware of any connectivity
    // kvStore neither... other places can manipulate this store via actions received via connectivity
    // as well as send out updates to this store when 'announcement' is needed
    //
    // CanonicStore also "CannonStore" also ReactiveDiffingStore
    class ProgramStateStore extends Eev$1 {
      constructor(initialState = {}, { loadState = null, saveState = null, omitStateFn = x => x, removeStateChangeFalseTriggers = x => x } = {}) {
        super();

        // what part of state to omit sending over to frontend (for performance reasons)
        // for example long playlists are truncated
        this.omitStateFn = omitStateFn;
        this.saveState = saveState;
        this.removeStateChangeFalseTriggers = removeStateChangeFalseTriggers;

        this.kvStore = new KeyValueStore();

        this.prevAnnouncedState = {};

        if (loadState) {
          const persistedState = loadState();

          // load saved state from disk first
          if (persistedState) {
            this.kvStore.update(persistedState, { announce: false }); // no reactive announcement
          }
        }
        // now merge (and overwrite when needed) our passed in initial state
        // initial state pased into this store has priority over any persisted state
        this.kvStore.update(initialState, { announce: false }); // no reactive announcement

        this.stateChangesCount = 0; // only for informative purposes

        this.subscriptions = [];
      }

      // new feature, if we wanted to automatically create synced store
      mirror(channelList) {
        channelList.on('new_channel', channel => {
          const state = this.omitStateFn(clone(this.state()));
          channel.send({ state }); // Sending initial state to each new ws connection !!

          //console.log(`----------- Sent state:`);
          ///console.log(state);
        });

        this.on('diff', diff => {
          // if (channelList.channels.length > 0) {
          //   console.log(`----------- Sent diff:`);
          // }
          channelList.sendToAll({ diff });
        });
      }

      update(patch, { announce = true } = {}) {
        this.kvStore.update(patch);
        this.announceStateChange(announce);
      }

      // User rarely and is needed when we don't do any merging on new updates but can just replace the whole state
      // for example:
      // program.store.replaceSlot('nearbyDevices', nearbyDevicesNew, { announce: false });
      // program.store.replaceSlot('environment', environment);
      //
      // not used for other things for now
      replaceSlot(slotName, value, { announce = true } = {}) {
        this.kvStore.replaceBaseKey(slotName, value);
        this.announceStateChange(announce);
      }

      clearSlot(slotName, { announce = true } = {}) {
        this.kvStore.clearBaseKey(slotName, { announce });
        this.announceStateChange(announce);
      }

      // ⚠️ perhaps replace 'key' with 'element' ?
      // will be another tricky semi-manual replace! do it soon
      replaceSlotElement({ slotName, key, value }, { announce = true } = {}) {
        this.kvStore.replaceSubKey({ baseKey: slotName, key, value }, { announce });
        this.announceStateChange(announce);
      }

      removeSlotElement({ slotName, key }, { announce = true } = {}) {
        this.kvStore.removeSubKey({ baseKey: slotName, key }, { announce });
        this.announceStateChange(announce);
      }

      pushToSlotArrayElement(slotName, el, { announce = true } = {}) {
        this.kvStore.pushToArray(slotName, el, { announce });
        this.announceStateChange(announce);
      }

      removeFromSlotArrayElement(slotName, removePredicate, { announce = true } = {}) {
        this.kvStore.removeFromArray(slotName, removePredicate, { announce });
        this.announceStateChange(announce);
      }

      save(state) {
        if (this.saveState) {
          this.lastSavedState = this.saveState({ state: clone(state), lastSavedState: this.lastSavedState }) || this.lastSavedState;
        }
      }

      // useful for custom protocols
      state() {
        return this.kvStore.state;
      }

      announceStateChange(announce = true) {
        // GREAT FOR PROFILING / DEBUGGING:
        // show who requested announcing state change ...
        //  console.log(Error().stack);

        if (!announce) {
          return;
        }

        const { state } = this.kvStore;

        const prunedState = this.removeStateChangeFalseTriggers(this.omitStateFn(clone(state)));

        const diff = getDiff(this.prevAnnouncedState, prunedState);

        if (diff) {
          // --- dmt-release-exclude-begin ---
          // const debug = false && dmt.isDevMachine();

          // if (debug) {
          //   console.log();
          //   console.log('----  PATCH ----');
          //   console.log(JSON.stringify(diff, null, 2));
          //   console.log('------------');
          // }
          // --- dmt-release-exclude-end ---

          // SOME PROBLEM!! TODO!!
          // we moved this persisting here... because it has to check somehow other... reduced size will cause problems here!!
          // TODO: has to be a bit optimized, check comments in statePersist.js
          this.save(state); // we clone again

          this.emit('diff', diff);

          this.stateChangesCount += 1;

          this.prevAnnouncedState = prunedState;

          this.pushStateToSubscribers(); // added recently
        }
      }

      subscribe(handler) {
        this.subscriptions.push(handler);
        handler(this.state());
        // return unsubscribe function
        return () => {
          this.subscriptions = this.subscriptions.filter(sub => sub !== handler);
        };
      }

      pushStateToSubscribers() {
        this.subscriptions.forEach(handler => handler(this.state()));
      }
    }

    var stores = /*#__PURE__*/Object.freeze({
        __proto__: null,
        ConnectedStore: ConnectedStore,
        MultiConnectedStore: MultiConnectedStore,
        LogStore: LogStore,
        MirroringStore: MirroringStore,
        ProgramStateStore: ProgramStateStore
    });

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop$1) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop$1) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop$1;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const { Emitter } = dmtJS;

    class App extends Emitter {
      constructor() {
        super();

        const corePromoters = ['david', 'stanko', 'adnan', 'iztok'];
        const isCorePromoter = corePromoters.find((name) => window.location.hostname.startsWith(`${name}.`));

        this.isLocalhost = window.location.hostname == 'localhost';
        this.isLAN = window.location.hostname.startsWith('192.168.');
        this.isZetaSeek = window.location.hostname == 'zetaseek.com';
        this.isZetaSeekCorePromoter = this.isZetaSeek || isCorePromoter;
        // || window.location.hostname == 'localhost';
        this.isDevMachine = window.location.hostname == 'david.zetaseek.com';
        this.nodeHasBlog = window.location.hostname == 'david.zetaseek.com';
        this.blogName = window.location.hostname == 'david.zetaseek.com' ? 'Overthinking 💭' : '';

        this.isMobile = window.screen.width < 768;

        this.ssl = window.location.protocol == 'https:';
      }
    }

    var appHelper = new App();

    var lib = createCommonjsModule(function (module) {

    var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

    window.addEventListener("popstate", function (e) {
        Url.triggerPopStateCb(e);
    });

    var Url = module.exports = {

        _onPopStateCbs: [],
        _isHash: false

        /**
         * queryString
         * Finds the value of parameter passed in first argument.
         *
         * @name queryString
         * @function
         * @param {String} name The parameter name.
         * @param {Boolean} notDecoded If `true`, the result will be encoded.
         * @return {String|Boolean|Undefined} The parameter value (as string),
         * `true` if the parameter is there, but doesn't have a value, or
         * `undefined` if it is missing.
         */
        , queryString: function queryString(name, notDecoded) {
            name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");

            var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
                results = regex.exec(location.search),
                encoded = null;

            if (results === null) {
                regex = new RegExp("[\\?&]" + name + "(\\&([^&#]*)|$)");
                if (regex.test(location.search)) {
                    return true;
                }
                return undefined;
            } else {
                encoded = results[1].replace(/\+/g, " ");
                if (notDecoded) {
                    return encoded;
                }
                return decodeURIComponent(encoded);
            }
        }

        /**
         * parseQuery
         * Parses a string as querystring. Like the `queryString` method does, if
         * the parameter is there, but it doesn't have a value, the value will
         * be `true`.
         *
         * @name parseQuery
         * @function
         * @param {String} search An optional string that should be parsed
         * (default: `window.location.search`).
         * @return {Object} The parsed querystring. Note this will contain empty
         * strings for
         */
        ,
        parseQuery: function parseQuery(search) {
            var query = {};

            if (typeof search !== "string") {
                search = window.location.search;
            }

            search = search.replace(/^\?/g, "");

            if (!search) {
                return {};
            }

            var a = search.split("&"),
                i = 0,
                iequ,
                value = null;

            for (; i < a.length; ++i) {
                iequ = a[i].indexOf("=");

                if (iequ < 0) {
                    iequ = a[i].length;
                    value = true;
                } else {
                    value = decodeURIComponent(a[i].slice(iequ + 1));
                }

                query[decodeURIComponent(a[i].slice(0, iequ))] = value;
            }

            return query;
        }

        /**
         * stringify
         * Stringifies a query object.
         *
         * @name stringify
         * @function
         * @param {Object} queryObj The object that should be stringified.
         * @return {String} The stringified value of `queryObj` object.
         */
        ,
        stringify: function stringify(queryObj) {

            if (!queryObj || queryObj.constructor !== Object) {
                throw new Error("Query object should be an object.");
            }

            var stringified = "";
            Object.keys(queryObj).forEach(function (c) {
                var value = queryObj[c];
                stringified += c;
                if (value !== true) {
                    stringified += "=" + encodeURIComponent(queryObj[c]);
                }
                stringified += "&";
            });

            stringified = stringified.replace(/\&$/g, "");
            return stringified;
        }

        /**
         * updateSearchParam
         * Adds, updates or deletes a parameter (without page refresh).
         *
         * @name updateSearchParam
         * @function
         * @param {String|Object} param The parameter name or name-value pairs as object.
         * @param {String|undefined} value The parameter value. If `undefined`, the parameter will be removed.
         * @param {Boolean} push If `true`, the page will be kept in the history,
         * otherwise the location will be changed but by pressing the back button
         * will not bring you to the old location.
         * @param {Boolean} triggerPopState Triggers the popstate handlers (by default falsly).
         * @return {Url} The `Url` object.
         */
        ,
        updateSearchParam: function updateSearchParam(param, value, push, triggerPopState) {

            if ((typeof param === "undefined" ? "undefined" : _typeof(param)) === "object") {
                for (var key in param) {
                    if (param.hasOwnProperty(key)) {
                        this.updateSearchParam(key, param[key], push, triggerPopState);
                    }
                }
                return;
            }

            var searchParsed = this.parseQuery();

            // Delete the parameter
            if (value === undefined) {
                delete searchParsed[param];
            } else {
                // Update or add
                if (searchParsed[param] === value) {
                    return Url;
                }
                searchParsed[param] = value;
            }

            var newSearch = this.stringify(searchParsed);
            if (newSearch) {
                newSearch = "?" + newSearch;
            }
            this._updateAll(window.location.pathname + newSearch + location.hash, push, triggerPopState);

            return Url;
        }

        /**
         * getLocation
         * Returns the page url, but not including the domain name.
         *
         * @name getLocation
         * @function
         * @return {String} The page url (without domain).
         */
        ,
        getLocation: function getLocation() {
            return window.location.pathname + window.location.search + window.location.hash;
        }

        /**
         * hash
         * Sets/gets the hash value.
         *
         * @name hash
         * @function
         * @param {String} newHash The hash to set.
         * @param {Boolean} triggerPopState Triggers the popstate handlers (by default falsly).
         * @return {String} The location hash.
         */
        ,
        hash: function hash(newHash, triggerPopState) {
            if (newHash === undefined) {
                return location.hash.substring(1);
            }
            if (!triggerPopState) {
                setTimeout(function () {
                    Url._isHash = false;
                }, 0);
                Url._isHash = true;
            }
            return location.hash = newHash;
        }

        /**
         * _updateAll
         * Update the full url (pathname, search, hash).
         *
         * @name _updateAll
         * @function
         * @param {String} s The new url to set.
         * @param {Boolean} push If `true`, the page will be kept in the history,
         * otherwise the location will be changed but by pressing the back button
         * will not bring you to the old location.
         * @param {Boolean} triggerPopState Triggers the popstate handlers (by default falsly).
         * @return {String} The set url.
         */
        ,
        _updateAll: function _updateAll(s, push, triggerPopState) {
            window.history[push ? "pushState" : "replaceState"](null, "", s);
            if (triggerPopState) {
                Url.triggerPopStateCb({});
            }
            return s;
        }

        /**
         * pathname
         * Sets/gets the pathname.
         *
         * @name getLocation
         * @function
         * @param {String} pathname The pathname to set.
         * @param {Boolean} push If `true`, the page will be kept in the history,
         * otherwise the location will be changed but by pressing the back button
         * will not bring you to the old location.
         * @param {Boolean} triggerPopState Triggers the popstate handlers (by default falsly).
         * @return {String} The set url.
         */
        ,
        pathname: function pathname(_pathname, push, triggerPopState) {
            if (_pathname === undefined) {
                return location.pathname;
            }
            return this._updateAll(_pathname + window.location.search + window.location.hash, push, triggerPopState);
        }

        /**
         * triggerPopStateCb
         * Calls the popstate handlers.
         *
         * @name triggerPopStateCb
         * @function
         */
        ,
        triggerPopStateCb: function triggerPopStateCb(e) {
            if (this._isHash) {
                return;
            }
            this._onPopStateCbs.forEach(function (c) {
                c(e);
            });
        }

        /**
         * onPopState
         * Adds a popstate handler.
         *
         * @name onPopState
         * @function
         * @param {Function} cb The callback function.
         */
        ,
        onPopState: function onPopState(cb) {
            this._onPopStateCbs.push(cb);
        }

        /**
         * removeHash
         * Removes the hash from the url.
         *
         * @name removeHash
         * @param {Boolean} push If `true`, the page will be kept in the history,
         * otherwise the location will be changed but by pressing the back button
         * will not bring you to the old location.
         * @param {Boolean} trigger Triggers the popstate handlers (by default falsly).
         * @function
         */
        ,
        removeHash: function removeHash(push, trigger) {
            this._updateAll(window.location.pathname + window.location.search, push || false, trigger || false);
        }

        /**
         * removeQuery
         * Removes the querystring parameters from the url.
         *
         * @name removeQuery
         * @param {Boolean} push If `true`, the page will be kept in the history,
         * otherwise the location will be changed but by pressing the back button
         * will not bring you to the old location.
         * @param {Boolean} trigger Triggers the popstate handlers (by default falsly).
         * @function
         */
        ,
        removeQuery: function removeQuery(push, trigger) {
            this._updateAll(window.location.pathname + window.location.hash, push || false, trigger || false);
        },
        version: "2.5.0"
    };
    });

    /* src/components/About.svelte generated by Svelte v3.29.0 */
    const file$1 = "src/components/About.svelte";

    // (44:8) {#if app.isZetaSeekCorePromoter}
    function create_if_block(ctx) {
    	let a;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			a = element("a");
    			img = element("img");
    			attr_dev(img, "class", "icon_symbol svelte-13wviz1");
    			if (img.src !== (img_src_value = "/apps/zeta/img/twitter.svg")) attr_dev(img, "src", img_src_value);
    			add_location(img, file$1, 44, 49, 1342);
    			attr_dev(a, "href", "https://twitter.com/zetaseek");
    			attr_dev(a, "class", "svelte-13wviz1");
    			add_location(a, file$1, 44, 10, 1303);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, img);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(44:8) {#if app.isZetaSeekCorePromoter}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div;
    	let p;
    	let t0;
    	let span;
    	let a;
    	let t1;
    	let if_block = /*app*/ ctx[3].isZetaSeekCorePromoter && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			p = element("p");
    			if (if_block) if_block.c();
    			t0 = space();
    			span = element("span");
    			a = element("a");
    			t1 = text(/*displayVersion*/ ctx[2]);
    			attr_dev(a, "href", "https://dmt-system.com");
    			attr_dev(a, "class", "svelte-13wviz1");
    			add_location(a, file$1, 47, 30, 1452);
    			attr_dev(span, "class", "version svelte-13wviz1");
    			add_location(span, file$1, 47, 8, 1430);
    			attr_dev(p, "class", "svelte-13wviz1");
    			add_location(p, file$1, 29, 6, 688);
    			attr_dev(div, "class", "about svelte-13wviz1");
    			toggle_class(div, "visible", !/*minimized*/ ctx[1] && !/*searchQuery*/ ctx[0]);
    			add_location(div, file$1, 24, 2, 507);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p);
    			if (if_block) if_block.m(p, null);
    			append_dev(p, t0);
    			append_dev(p, span);
    			append_dev(span, a);
    			append_dev(a, t1);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*displayVersion*/ 4) set_data_dev(t1, /*displayVersion*/ ctx[2]);

    			if (dirty & /*minimized, searchQuery*/ 3) {
    				toggle_class(div, "visible", !/*minimized*/ ctx[1] && !/*searchQuery*/ ctx[0]);
    			}
    		},
    		i: noop$1,
    		o: noop$1,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("About", slots, []);
    	const app = getContext("app");
    	let { isMobile } = $$props;
    	let { searchQuery } = $$props;
    	let { dmtVersion } = $$props;
    	let minimized;

    	function minimize() {
    		$$invalidate(1, minimized = true);
    	}

    	const writable_props = ["isMobile", "searchQuery", "dmtVersion"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<About> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("isMobile" in $$props) $$invalidate(4, isMobile = $$props.isMobile);
    		if ("searchQuery" in $$props) $$invalidate(0, searchQuery = $$props.searchQuery);
    		if ("dmtVersion" in $$props) $$invalidate(5, dmtVersion = $$props.dmtVersion);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		app,
    		isMobile,
    		searchQuery,
    		dmtVersion,
    		minimized,
    		minimize,
    		displayVersion
    	});

    	$$self.$inject_state = $$props => {
    		if ("isMobile" in $$props) $$invalidate(4, isMobile = $$props.isMobile);
    		if ("searchQuery" in $$props) $$invalidate(0, searchQuery = $$props.searchQuery);
    		if ("dmtVersion" in $$props) $$invalidate(5, dmtVersion = $$props.dmtVersion);
    		if ("minimized" in $$props) $$invalidate(1, minimized = $$props.minimized);
    		if ("displayVersion" in $$props) $$invalidate(2, displayVersion = $$props.displayVersion);
    	};

    	let displayVersion;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*dmtVersion*/ 32) {
    			// const d = new Date();
    			// const datestring = `${d.getFullYear()}-${(d.getMonth() + 1)}-${d.getDate()}`;
    			 $$invalidate(2, displayVersion = dmtVersion ? `v${dmtVersion}` : "");
    		}
    	};

    	return [searchQuery, minimized, displayVersion, app, isMobile, dmtVersion];
    }

    class About extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {
    			isMobile: 4,
    			searchQuery: 0,
    			dmtVersion: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "About",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*isMobile*/ ctx[4] === undefined && !("isMobile" in props)) {
    			console.warn("<About> was created without expected prop 'isMobile'");
    		}

    		if (/*searchQuery*/ ctx[0] === undefined && !("searchQuery" in props)) {
    			console.warn("<About> was created without expected prop 'searchQuery'");
    		}

    		if (/*dmtVersion*/ ctx[5] === undefined && !("dmtVersion" in props)) {
    			console.warn("<About> was created without expected prop 'dmtVersion'");
    		}
    	}

    	get isMobile() {
    		throw new Error("<About>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isMobile(value) {
    		throw new Error("<About>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get searchQuery() {
    		throw new Error("<About>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set searchQuery(value) {
    		throw new Error("<About>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dmtVersion() {
    		throw new Error("<About>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dmtVersion(value) {
    		throw new Error("<About>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Login/DisplayLoggedInInfo.svelte generated by Svelte v3.29.0 */
    const file$2 = "src/components/Login/DisplayLoggedInInfo.svelte";

    // (23:2) {:else}
    function create_else_block(ctx) {
    	let t0;
    	let span;
    	let t1;
    	let t2;
    	let if_block_anchor;
    	let if_block = /*app*/ ctx[3].isZetaSeek && create_if_block_2(ctx);

    	const block = {
    		c: function create() {
    			t0 = text("MetaMask ");
    			span = element("span");
    			t1 = text(/*ethAddress*/ ctx[0]);
    			t2 = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			attr_dev(span, "class", "svelte-1ymkiyd");
    			add_location(span, file$2, 26, 13, 555);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, span, anchor);
    			append_dev(span, t1);
    			insert_dev(target, t2, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*ethAddress*/ 1) set_data_dev(t1, /*ethAddress*/ ctx[0]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(span);
    			if (detaching) detach_dev(t2);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(23:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (14:2) {#if displayName}
    function create_if_block$1(ctx) {
    	let t0;
    	let t1;
    	let t2;
    	let span;
    	let t3;
    	let if_block = /*isAdmin*/ ctx[2] && create_if_block_1(ctx);

    	const block = {
    		c: function create() {
    			t0 = text(/*displayName*/ ctx[1]);
    			t1 = space();
    			if (if_block) if_block.c();
    			t2 = text("\n    ←\n    ");
    			span = element("span");
    			t3 = text(/*ethAddress*/ ctx[0]);
    			attr_dev(span, "class", "svelte-1ymkiyd");
    			add_location(span, file$2, 21, 4, 368);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, span, anchor);
    			append_dev(span, t3);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*displayName*/ 2) set_data_dev(t0, /*displayName*/ ctx[1]);

    			if (/*isAdmin*/ ctx[2]) {
    				if (if_block) ; else {
    					if_block = create_if_block_1(ctx);
    					if_block.c();
    					if_block.m(t2.parentNode, t2);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*ethAddress*/ 1) set_data_dev(t3, /*ethAddress*/ ctx[0]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(14:2) {#if displayName}",
    		ctx
    	});

    	return block;
    }

    // (29:4) {#if app.isZetaSeek}
    function create_if_block_2(ctx) {
    	let br;
    	let t0;
    	let span;

    	const block = {
    		c: function create() {
    			br = element("br");
    			t0 = space();
    			span = element("span");
    			span.textContent = "[ Zeta Balance: 0 ]";
    			add_location(br, file$2, 29, 6, 613);
    			attr_dev(span, "class", "deemph svelte-1ymkiyd");
    			add_location(span, file$2, 29, 11, 618);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, br, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, span, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(br);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(29:4) {#if app.isZetaSeek}",
    		ctx
    	});

    	return block;
    }

    // (18:4) {#if isAdmin}
    function create_if_block_1(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "(+)";
    			attr_dev(span, "class", "admin svelte-1ymkiyd");
    			add_location(span, file$2, 18, 6, 317);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(18:4) {#if isAdmin}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div;

    	function select_block_type(ctx, dirty) {
    		if (/*displayName*/ ctx[1]) return create_if_block$1;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if_block.c();
    			attr_dev(div, "id", "eth_identity");
    			attr_dev(div, "class", "svelte-1ymkiyd");
    			add_location(div, file$2, 12, 0, 229);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if_block.m(div, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div, null);
    				}
    			}
    		},
    		i: noop$1,
    		o: noop$1,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("DisplayLoggedInInfo", slots, []);
    	const app = getContext("app");
    	let { connected } = $$props;
    	let { ethAddress } = $$props;
    	let { displayName } = $$props;
    	let { isAdmin } = $$props;
    	const writable_props = ["connected", "ethAddress", "displayName", "isAdmin"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<DisplayLoggedInInfo> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("connected" in $$props) $$invalidate(4, connected = $$props.connected);
    		if ("ethAddress" in $$props) $$invalidate(0, ethAddress = $$props.ethAddress);
    		if ("displayName" in $$props) $$invalidate(1, displayName = $$props.displayName);
    		if ("isAdmin" in $$props) $$invalidate(2, isAdmin = $$props.isAdmin);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		app,
    		connected,
    		ethAddress,
    		displayName,
    		isAdmin
    	});

    	$$self.$inject_state = $$props => {
    		if ("connected" in $$props) $$invalidate(4, connected = $$props.connected);
    		if ("ethAddress" in $$props) $$invalidate(0, ethAddress = $$props.ethAddress);
    		if ("displayName" in $$props) $$invalidate(1, displayName = $$props.displayName);
    		if ("isAdmin" in $$props) $$invalidate(2, isAdmin = $$props.isAdmin);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [ethAddress, displayName, isAdmin, app, connected];
    }

    class DisplayLoggedInInfo extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {
    			connected: 4,
    			ethAddress: 0,
    			displayName: 1,
    			isAdmin: 2
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "DisplayLoggedInInfo",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*connected*/ ctx[4] === undefined && !("connected" in props)) {
    			console.warn("<DisplayLoggedInInfo> was created without expected prop 'connected'");
    		}

    		if (/*ethAddress*/ ctx[0] === undefined && !("ethAddress" in props)) {
    			console.warn("<DisplayLoggedInInfo> was created without expected prop 'ethAddress'");
    		}

    		if (/*displayName*/ ctx[1] === undefined && !("displayName" in props)) {
    			console.warn("<DisplayLoggedInInfo> was created without expected prop 'displayName'");
    		}

    		if (/*isAdmin*/ ctx[2] === undefined && !("isAdmin" in props)) {
    			console.warn("<DisplayLoggedInInfo> was created without expected prop 'isAdmin'");
    		}
    	}

    	get connected() {
    		throw new Error("<DisplayLoggedInInfo>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set connected(value) {
    		throw new Error("<DisplayLoggedInInfo>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get ethAddress() {
    		throw new Error("<DisplayLoggedInInfo>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ethAddress(value) {
    		throw new Error("<DisplayLoggedInInfo>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get displayName() {
    		throw new Error("<DisplayLoggedInInfo>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set displayName(value) {
    		throw new Error("<DisplayLoggedInInfo>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isAdmin() {
    		throw new Error("<DisplayLoggedInInfo>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isAdmin(value) {
    		throw new Error("<DisplayLoggedInInfo>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Login/DisplayMetamaskInvite.svelte generated by Svelte v3.29.0 */
    const file$3 = "src/components/Login/DisplayMetamaskInvite.svelte";

    // (21:2) {#if app.isZetaSeek}
    function create_if_block$2(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "explain svelte-5qmkma");
    			add_location(div, file$3, 21, 4, 694);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(21:2) {#if app.isZetaSeek}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div2;
    	let t0;
    	let a0;
    	let t2;
    	let div0;
    	let t4;
    	let div1;
    	let span;
    	let t5;
    	let a1;
    	let t7;
    	let t8;
    	let a2;
    	let img;
    	let img_src_value;
    	let t9;
    	let if_block = /*app*/ ctx[0].isZetaSeek && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			t0 = text("Install ");
    			a0 = element("a");
    			a0.textContent = "MetaMask";
    			t2 = text(" extension to login.\n  ");
    			div0 = element("div");
    			div0.textContent = "MetaMask provides the simplest yet most secure way to connect to decentralized applications. You are always in control when interacting on the new decentralized web.";
    			t4 = space();
    			div1 = element("div");
    			span = element("span");
    			t5 = text("[ ");
    			a1 = element("a");
    			a1.textContent = "Watch MetaMask explainer video";
    			t7 = text(" ]");
    			t8 = space();
    			a2 = element("a");
    			img = element("img");
    			t9 = space();
    			if (if_block) if_block.c();
    			attr_dev(a0, "href", "https://metamask.io");
    			attr_dev(a0, "class", "svelte-5qmkma");
    			add_location(a0, file$3, 7, 10, 134);
    			attr_dev(div0, "class", "explain svelte-5qmkma");
    			add_location(div0, file$3, 8, 2, 199);
    			attr_dev(a1, "href", "https://www.youtube.com/watch?v=YVgfHZMFFFQ");
    			attr_dev(a1, "class", "svelte-5qmkma");
    			add_location(a1, file$3, 14, 8, 458);
    			attr_dev(span, "class", "green svelte-5qmkma");
    			add_location(span, file$3, 13, 4, 429);
    			attr_dev(div1, "class", "explain svelte-5qmkma");
    			add_location(div1, file$3, 12, 2, 403);
    			if (img.src !== (img_src_value = "/apps/zeta/img/metamask.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "metamask");
    			attr_dev(img, "class", "svelte-5qmkma");
    			add_location(img, file$3, 18, 33, 604);
    			attr_dev(a2, "href", "https://metamask.io");
    			attr_dev(a2, "class", "svelte-5qmkma");
    			add_location(a2, file$3, 18, 2, 573);
    			attr_dev(div2, "class", "metamask_missing svelte-5qmkma");
    			add_location(div2, file$3, 6, 0, 93);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, t0);
    			append_dev(div2, a0);
    			append_dev(div2, t2);
    			append_dev(div2, div0);
    			append_dev(div2, t4);
    			append_dev(div2, div1);
    			append_dev(div1, span);
    			append_dev(span, t5);
    			append_dev(span, a1);
    			append_dev(span, t7);
    			append_dev(div2, t8);
    			append_dev(div2, a2);
    			append_dev(a2, img);
    			append_dev(div2, t9);
    			if (if_block) if_block.m(div2, null);
    		},
    		p: noop$1,
    		i: noop$1,
    		o: noop$1,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("DisplayMetamaskInvite", slots, []);
    	const app = getContext("app");
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<DisplayMetamaskInvite> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ getContext, app });
    	return [app];
    }

    class DisplayMetamaskInvite extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "DisplayMetamaskInvite",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/components/Login/Login.svelte generated by Svelte v3.29.0 */

    const { console: console_1 } = globals;
    const file$4 = "src/components/Login/Login.svelte";

    // (43:2) {:else}
    function create_else_block$1(ctx) {
    	let displaymetamaskinvite;
    	let current;
    	displaymetamaskinvite = new DisplayMetamaskInvite({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(displaymetamaskinvite.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(displaymetamaskinvite, target, anchor);
    			current = true;
    		},
    		p: noop$1,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(displaymetamaskinvite.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(displaymetamaskinvite.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(displaymetamaskinvite, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(43:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (27:2) {#if metamaskConnect}
    function create_if_block_1$1(ctx) {
    	let div;
    	let a;
    	let img;
    	let img_src_value;
    	let t0;
    	let br;
    	let t1;
    	let b;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			a = element("a");
    			img = element("img");
    			t0 = space();
    			br = element("br");
    			t1 = space();
    			b = element("b");
    			b.textContent = "CONNECT";
    			if (img.src !== (img_src_value = "/apps/zeta/img/metamask.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "metamask ");
    			attr_dev(img, "class", "svelte-1a9vlu6");
    			add_location(img, file$4, 29, 8, 779);
    			attr_dev(a, "href", "#");
    			add_location(a, file$4, 28, 6, 758);
    			add_location(br, file$4, 31, 6, 899);
    			add_location(b, file$4, 33, 6, 948);
    			attr_dev(div, "class", "login svelte-1a9vlu6");
    			add_location(div, file$4, 27, 4, 687);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, a);
    			append_dev(a, img);
    			append_dev(div, t0);
    			append_dev(div, br);
    			append_dev(div, t1);
    			append_dev(div, b);

    			if (!mounted) {
    				dispose = [
    					listen_dev(img, "click", prevent_default(/*click_handler*/ ctx[6]), false, true, false),
    					listen_dev(div, "click", prevent_default(/*click_handler_1*/ ctx[7]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: noop$1,
    		i: noop$1,
    		o: noop$1,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(27:2) {#if metamaskConnect}",
    		ctx
    	});

    	return block;
    }

    // (23:0) {#if ethAddress}
    function create_if_block$3(ctx) {
    	let displayloggedininfo;
    	let current;

    	displayloggedininfo = new DisplayLoggedInInfo({
    			props: {
    				connected: /*connected*/ ctx[0],
    				ethAddress: /*ethAddress*/ ctx[2],
    				displayName: /*displayName*/ ctx[3],
    				isAdmin: /*isAdmin*/ ctx[4],
    				metamaskConnect: /*metamaskConnect*/ ctx[1]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(displayloggedininfo.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(displayloggedininfo, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const displayloggedininfo_changes = {};
    			if (dirty & /*connected*/ 1) displayloggedininfo_changes.connected = /*connected*/ ctx[0];
    			if (dirty & /*ethAddress*/ 4) displayloggedininfo_changes.ethAddress = /*ethAddress*/ ctx[2];
    			if (dirty & /*displayName*/ 8) displayloggedininfo_changes.displayName = /*displayName*/ ctx[3];
    			if (dirty & /*isAdmin*/ 16) displayloggedininfo_changes.isAdmin = /*isAdmin*/ ctx[4];
    			if (dirty & /*metamaskConnect*/ 2) displayloggedininfo_changes.metamaskConnect = /*metamaskConnect*/ ctx[1];
    			displayloggedininfo.$set(displayloggedininfo_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(displayloggedininfo.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(displayloggedininfo.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(displayloggedininfo, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(23:0) {#if ethAddress}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$3, create_if_block_1$1, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*ethAddress*/ ctx[2]) return 0;
    		if (/*metamaskConnect*/ ctx[1]) return 1;
    		return 2;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Login", slots, []);
    	const app = getContext("app");
    	let { connected } = $$props;
    	let { metamaskConnect } = $$props;
    	let { ethAddress } = $$props;
    	let { displayName } = $$props;
    	let { isAdmin } = $$props;

    	function login() {
    		metamaskConnect().catch(e => {
    			console.log("Metamask not connected (yet):");
    			console.log(e);
    		});
    	}

    	const writable_props = ["connected", "metamaskConnect", "ethAddress", "displayName", "isAdmin"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<Login> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => {
    		login();
    	};

    	const click_handler_1 = () => {
    		login();
    	};

    	$$self.$$set = $$props => {
    		if ("connected" in $$props) $$invalidate(0, connected = $$props.connected);
    		if ("metamaskConnect" in $$props) $$invalidate(1, metamaskConnect = $$props.metamaskConnect);
    		if ("ethAddress" in $$props) $$invalidate(2, ethAddress = $$props.ethAddress);
    		if ("displayName" in $$props) $$invalidate(3, displayName = $$props.displayName);
    		if ("isAdmin" in $$props) $$invalidate(4, isAdmin = $$props.isAdmin);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		app,
    		DisplayLoggedInInfo,
    		DisplayMetamaskInvite,
    		connected,
    		metamaskConnect,
    		ethAddress,
    		displayName,
    		isAdmin,
    		login
    	});

    	$$self.$inject_state = $$props => {
    		if ("connected" in $$props) $$invalidate(0, connected = $$props.connected);
    		if ("metamaskConnect" in $$props) $$invalidate(1, metamaskConnect = $$props.metamaskConnect);
    		if ("ethAddress" in $$props) $$invalidate(2, ethAddress = $$props.ethAddress);
    		if ("displayName" in $$props) $$invalidate(3, displayName = $$props.displayName);
    		if ("isAdmin" in $$props) $$invalidate(4, isAdmin = $$props.isAdmin);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		connected,
    		metamaskConnect,
    		ethAddress,
    		displayName,
    		isAdmin,
    		login,
    		click_handler,
    		click_handler_1
    	];
    }

    class Login extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {
    			connected: 0,
    			metamaskConnect: 1,
    			ethAddress: 2,
    			displayName: 3,
    			isAdmin: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Login",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*connected*/ ctx[0] === undefined && !("connected" in props)) {
    			console_1.warn("<Login> was created without expected prop 'connected'");
    		}

    		if (/*metamaskConnect*/ ctx[1] === undefined && !("metamaskConnect" in props)) {
    			console_1.warn("<Login> was created without expected prop 'metamaskConnect'");
    		}

    		if (/*ethAddress*/ ctx[2] === undefined && !("ethAddress" in props)) {
    			console_1.warn("<Login> was created without expected prop 'ethAddress'");
    		}

    		if (/*displayName*/ ctx[3] === undefined && !("displayName" in props)) {
    			console_1.warn("<Login> was created without expected prop 'displayName'");
    		}

    		if (/*isAdmin*/ ctx[4] === undefined && !("isAdmin" in props)) {
    			console_1.warn("<Login> was created without expected prop 'isAdmin'");
    		}
    	}

    	get connected() {
    		throw new Error("<Login>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set connected(value) {
    		throw new Error("<Login>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get metamaskConnect() {
    		throw new Error("<Login>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set metamaskConnect(value) {
    		throw new Error("<Login>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get ethAddress() {
    		throw new Error("<Login>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ethAddress(value) {
    		throw new Error("<Login>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get displayName() {
    		throw new Error("<Login>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set displayName(value) {
    		throw new Error("<Login>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isAdmin() {
    		throw new Error("<Login>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isAdmin(value) {
    		throw new Error("<Login>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/MenuBar/MenuBar.svelte generated by Svelte v3.29.0 */
    const file$5 = "src/components/MenuBar/MenuBar.svelte";

    // (36:6) {#if app.isLocalhost || loggedIn}
    function create_if_block$4(ctx) {
    	let li;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			li = element("li");
    			li.textContent = "👀 Profile";
    			attr_dev(li, "class", "svelte-2pdnex");
    			toggle_class(li, "enabled", /*panels*/ ctx[1]["Profile"]);
    			add_location(li, file$5, 36, 8, 742);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);

    			if (!mounted) {
    				dispose = listen_dev(li, "click", /*click_handler*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*panels*/ 2) {
    				toggle_class(li, "enabled", /*panels*/ ctx[1]["Profile"]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(36:6) {#if app.isLocalhost || loggedIn}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let div1;
    	let span;
    	let t1;
    	let div0;
    	let ul;
    	let if_block = (/*app*/ ctx[2].isLocalhost || loggedIn) && create_if_block$4(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			span = element("span");
    			span.textContent = "FRAMES";
    			t1 = space();
    			div0 = element("div");
    			ul = element("ul");
    			if (if_block) if_block.c();
    			attr_dev(span, "class", "title svelte-2pdnex");
    			add_location(span, file$5, 31, 2, 628);
    			attr_dev(ul, "class", "svelte-2pdnex");
    			add_location(ul, file$5, 34, 4, 689);
    			attr_dev(div0, "class", "inner svelte-2pdnex");
    			add_location(div0, file$5, 33, 2, 665);
    			attr_dev(div1, "class", "menu svelte-2pdnex");
    			add_location(div1, file$5, 30, 0, 607);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, span);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			append_dev(div0, ul);
    			if (if_block) if_block.m(ul, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*app*/ ctx[2].isLocalhost || loggedIn) if_block.p(ctx, dirty);
    		},
    		i: noop$1,
    		o: noop$1,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let $store,
    		$$unsubscribe_store = noop$1,
    		$$subscribe_store = () => ($$unsubscribe_store(), $$unsubscribe_store = subscribe(store, $$value => $$invalidate(6, $store = $$value)), store);

    	$$self.$$.on_destroy.push(() => $$unsubscribe_store());
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("MenuBar", slots, []);
    	let { store } = $$props;
    	validate_store(store, "store");
    	$$subscribe_store();
    	let { loginStore } = $$props;
    	const app = getContext("app");

    	function toggle(panel) {
    		const newPanels = panels;
    		newPanels[panel] = !newPanels[panel];
    		store.set({ panels: newPanels });
    	}

    	onMount(() => {
    		// show whitepaper promo on page load if not logged in
    		setTimeout(
    			() => {
    				if (loggedIn) {
    					toggle("Profile");
    				}
    			},
    			700
    		); // wait for MetaMask to execute login... or not.
    	});

    	function isEnabled(panel) {
    		return panels[panel];
    	}

    	const writable_props = ["store", "loginStore"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<MenuBar> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => toggle("Profile");

    	$$self.$$set = $$props => {
    		if ("store" in $$props) $$subscribe_store($$invalidate(0, store = $$props.store));
    		if ("loginStore" in $$props) $$invalidate(4, loginStore = $$props.loginStore);
    	};

    	$$self.$capture_state = () => ({
    		store,
    		loginStore,
    		onMount,
    		getContext,
    		app,
    		toggle,
    		isEnabled,
    		panels,
    		$store
    	});

    	$$self.$inject_state = $$props => {
    		if ("store" in $$props) $$subscribe_store($$invalidate(0, store = $$props.store));
    		if ("loginStore" in $$props) $$invalidate(4, loginStore = $$props.loginStore);
    		if ("panels" in $$props) $$invalidate(1, panels = $$props.panels);
    	};

    	let panels;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$store*/ 64) {
    			 $$invalidate(1, panels = $store.panels);
    		}
    	};

    	return [store, panels, app, toggle, loginStore, click_handler];
    }

    class MenuBar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { store: 0, loginStore: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MenuBar",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*store*/ ctx[0] === undefined && !("store" in props)) {
    			console.warn("<MenuBar> was created without expected prop 'store'");
    		}

    		if (/*loginStore*/ ctx[4] === undefined && !("loginStore" in props)) {
    			console.warn("<MenuBar> was created without expected prop 'loginStore'");
    		}
    	}

    	get store() {
    		throw new Error("<MenuBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set store(value) {
    		throw new Error("<MenuBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get loginStore() {
    		throw new Error("<MenuBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set loginStore(value) {
    		throw new Error("<MenuBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/LeftBar/Links.svelte generated by Svelte v3.29.0 */
    const file$6 = "src/components/LeftBar/Links.svelte";

    function create_fragment$6(ctx) {
    	let div1;
    	let div0;
    	let p;
    	let t1;
    	let a;
    	let span;
    	let t2;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			p = element("p");
    			p.textContent = "Personal blog:";
    			t1 = space();
    			a = element("a");
    			span = element("span");
    			t2 = text(/*blogName*/ ctx[0]);
    			add_location(p, file$6, 14, 4, 319);
    			attr_dev(span, "class", "svelte-e3zels");
    			add_location(span, file$6, 15, 36, 377);
    			attr_dev(a, "class", "outside svelte-e3zels");
    			attr_dev(a, "href", "/blog");
    			add_location(a, file$6, 15, 4, 345);
    			attr_dev(div0, "class", "link svelte-e3zels");
    			add_location(div0, file$6, 13, 2, 296);
    			attr_dev(div1, "class", "links svelte-e3zels");
    			add_location(div1, file$6, 7, 0, 81);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, p);
    			append_dev(div0, t1);
    			append_dev(div0, a);
    			append_dev(a, span);
    			append_dev(span, t2);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*blogName*/ 1) set_data_dev(t2, /*blogName*/ ctx[0]);
    		},
    		i: noop$1,
    		o: noop$1,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Links", slots, []);
    	let { blogName } = $$props;
    	const writable_props = ["blogName"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Links> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("blogName" in $$props) $$invalidate(0, blogName = $$props.blogName);
    	};

    	$$self.$capture_state = () => ({ onMount, blogName });

    	$$self.$inject_state = $$props => {
    		if ("blogName" in $$props) $$invalidate(0, blogName = $$props.blogName);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [blogName];
    }

    class Links extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { blogName: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Links",
    			options,
    			id: create_fragment$6.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*blogName*/ ctx[0] === undefined && !("blogName" in props)) {
    			console.warn("<Links> was created without expected prop 'blogName'");
    		}
    	}

    	get blogName() {
    		throw new Error("<Links>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set blogName(value) {
    		throw new Error("<Links>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/LeftBar/Profile.svelte generated by Svelte v3.29.0 */
    const file$7 = "src/components/LeftBar/Profile.svelte";

    // (70:6) {#if editMode}
    function create_if_block_1$2(ctx) {
    	let t0;
    	let a;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			t0 = text("· ");
    			a = element("a");
    			a.textContent = "Save";
    			attr_dev(a, "class", "save svelte-kicv9q");
    			attr_dev(a, "href", "#");
    			add_location(a, file$7, 70, 10, 1464);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, a, anchor);

    			if (!mounted) {
    				dispose = listen_dev(a, "click", prevent_default(/*click_handler*/ ctx[9]), false, true, false);
    				mounted = true;
    			}
    		},
    		p: noop$1,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(a);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(70:6) {#if editMode}",
    		ctx
    	});

    	return block;
    }

    // (78:6) {:else}
    function create_else_block$2(ctx) {
    	let a;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			a = element("a");
    			a.textContent = "EDIT";
    			attr_dev(a, "href", "#");
    			attr_dev(a, "class", "svelte-kicv9q");
    			add_location(a, file$7, 78, 8, 1702);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);

    			if (!mounted) {
    				dispose = listen_dev(a, "click", prevent_default(/*click_handler_2*/ ctx[11]), false, true, false);
    				mounted = true;
    			}
    		},
    		p: noop$1,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(78:6) {:else}",
    		ctx
    	});

    	return block;
    }

    // (76:6) {#if editMode}
    function create_if_block$5(ctx) {
    	let a;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			a = element("a");
    			a.textContent = "Cancel";
    			attr_dev(a, "class", "cancel svelte-kicv9q");
    			attr_dev(a, "href", "#");
    			add_location(a, file$7, 76, 8, 1593);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);

    			if (!mounted) {
    				dispose = listen_dev(a, "click", prevent_default(/*click_handler_1*/ ctx[10]), false, true, false);
    				mounted = true;
    			}
    		},
    		p: noop$1,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(76:6) {#if editMode}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let div2;
    	let h3;
    	let t0;
    	let t1;
    	let t2;
    	let div0;
    	let label;
    	let t4;
    	let input;
    	let input_disabled_value;
    	let t5;
    	let div1;
    	let p;
    	let span;
    	let t7;
    	let t8_value = (/*savedName*/ ctx[4] || missing) + "";
    	let t8;
    	let if_block0 = /*editMode*/ ctx[2] && create_if_block_1$2(ctx);

    	function select_block_type(ctx, dirty) {
    		if (/*editMode*/ ctx[2]) return create_if_block$5;
    		return create_else_block$2;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block1 = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			h3 = element("h3");
    			t0 = text("Myself\n      ");
    			if (if_block0) if_block0.c();
    			t1 = text("\n\n      ·\n\n      ");
    			if_block1.c();
    			t2 = space();
    			div0 = element("div");
    			label = element("label");
    			label.textContent = "First name";
    			t4 = space();
    			input = element("input");
    			t5 = space();
    			div1 = element("div");
    			p = element("p");
    			span = element("span");
    			span.textContent = "First name:";
    			t7 = space();
    			t8 = text(t8_value);
    			attr_dev(h3, "class", "svelte-kicv9q");
    			add_location(h3, file$7, 68, 4, 1422);
    			attr_dev(label, "for", "name");
    			attr_dev(label, "class", "svelte-kicv9q");
    			add_location(label, file$7, 85, 6, 1851);
    			attr_dev(input, "id", "name");
    			attr_dev(input, "placeholder", "");
    			input.disabled = input_disabled_value = !/*connected*/ ctx[0];
    			attr_dev(input, "class", "svelte-kicv9q");
    			add_location(input, file$7, 86, 6, 1894);
    			attr_dev(div0, "class", "edit_form svelte-kicv9q");
    			toggle_class(div0, "visible", /*editMode*/ ctx[2]);
    			add_location(div0, file$7, 83, 4, 1795);
    			attr_dev(span, "class", "svelte-kicv9q");
    			add_location(span, file$7, 108, 8, 2539);
    			add_location(p, file$7, 107, 6, 2527);
    			attr_dev(div1, "class", "display_profile svelte-kicv9q");
    			toggle_class(div1, "visible", !/*editMode*/ ctx[2]);
    			add_location(div1, file$7, 105, 4, 2464);
    			attr_dev(div2, "class", "profile svelte-kicv9q");
    			toggle_class(div2, "visible", !/*minimized*/ ctx[3]);
    			add_location(div2, file$7, 55, 0, 1107);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, h3);
    			append_dev(h3, t0);
    			if (if_block0) if_block0.m(h3, null);
    			append_dev(h3, t1);
    			if_block1.m(h3, null);
    			append_dev(div2, t2);
    			append_dev(div2, div0);
    			append_dev(div0, label);
    			append_dev(div0, t4);
    			append_dev(div0, input);
    			append_dev(div2, t5);
    			append_dev(div2, div1);
    			append_dev(div1, p);
    			append_dev(p, span);
    			append_dev(p, t7);
    			append_dev(p, t8);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*editMode*/ ctx[2]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_1$2(ctx);
    					if_block0.c();
    					if_block0.m(h3, t1);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block1) {
    				if_block1.p(ctx, dirty);
    			} else {
    				if_block1.d(1);
    				if_block1 = current_block_type(ctx);

    				if (if_block1) {
    					if_block1.c();
    					if_block1.m(h3, null);
    				}
    			}

    			if (dirty & /*connected*/ 1 && input_disabled_value !== (input_disabled_value = !/*connected*/ ctx[0])) {
    				prop_dev(input, "disabled", input_disabled_value);
    			}

    			if (dirty & /*editMode*/ 4) {
    				toggle_class(div0, "visible", /*editMode*/ ctx[2]);
    			}

    			if (dirty & /*savedName*/ 16 && t8_value !== (t8_value = (/*savedName*/ ctx[4] || missing) + "")) set_data_dev(t8, t8_value);

    			if (dirty & /*editMode*/ 4) {
    				toggle_class(div1, "visible", !/*editMode*/ ctx[2]);
    			}

    			if (dirty & /*minimized*/ 8) {
    				toggle_class(div2, "visible", !/*minimized*/ ctx[3]);
    			}
    		},
    		i: noop$1,
    		o: noop$1,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (if_block0) if_block0.d();
    			if_block1.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const missing = "?";

    function instance$7($$self, $$props, $$invalidate) {
    	let $loginStore,
    		$$unsubscribe_loginStore = noop$1,
    		$$subscribe_loginStore = () => ($$unsubscribe_loginStore(), $$unsubscribe_loginStore = subscribe(loginStore, $$value => $$invalidate(13, $loginStore = $$value)), loginStore);

    	$$self.$$.on_destroy.push(() => $$unsubscribe_loginStore());
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Profile", slots, []);
    	let { connected } = $$props;
    	let { loginStore } = $$props;
    	validate_store(loginStore, "loginStore");
    	$$subscribe_loginStore();
    	let { store } = $$props;
    	let { isAdmin } = $$props;
    	let editMode;

    	function edit(_editMode = true) {
    		$$invalidate(2, editMode = _editMode);
    		document.getElementById("name").value = savedName || "";
    	} // document.getElementById('email').value = savedEmail || '';
    	// if (editMode) {

    	//   setTimeout(() => {
    	//   }, 10);
    	// }
    	function save() {
    		const name = document.getElementById("name").value;

    		// const email = document.getElementById('email').value;
    		//store.saveUserProfile({ ethAddress, userName: name, userEmail: email });
    		store.saveUserProfile({ ethAddress, userName: name });

    		$$invalidate(2, editMode = false);
    	}

    	let minimized;

    	function minimize() {
    		$$invalidate(3, minimized = true);
    	}

    	const writable_props = ["connected", "loginStore", "store", "isAdmin"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Profile> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => {
    		save();
    	};

    	const click_handler_1 = () => {
    		edit(false);
    	};

    	const click_handler_2 = () => {
    		edit();
    	};

    	$$self.$$set = $$props => {
    		if ("connected" in $$props) $$invalidate(0, connected = $$props.connected);
    		if ("loginStore" in $$props) $$subscribe_loginStore($$invalidate(1, loginStore = $$props.loginStore));
    		if ("store" in $$props) $$invalidate(7, store = $$props.store);
    		if ("isAdmin" in $$props) $$invalidate(8, isAdmin = $$props.isAdmin);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		connected,
    		loginStore,
    		store,
    		isAdmin,
    		missing,
    		editMode,
    		edit,
    		save,
    		minimized,
    		minimize,
    		ethAddress,
    		$loginStore,
    		savedName,
    		savedTagline
    	});

    	$$self.$inject_state = $$props => {
    		if ("connected" in $$props) $$invalidate(0, connected = $$props.connected);
    		if ("loginStore" in $$props) $$subscribe_loginStore($$invalidate(1, loginStore = $$props.loginStore));
    		if ("store" in $$props) $$invalidate(7, store = $$props.store);
    		if ("isAdmin" in $$props) $$invalidate(8, isAdmin = $$props.isAdmin);
    		if ("editMode" in $$props) $$invalidate(2, editMode = $$props.editMode);
    		if ("minimized" in $$props) $$invalidate(3, minimized = $$props.minimized);
    		if ("ethAddress" in $$props) ethAddress = $$props.ethAddress;
    		if ("savedName" in $$props) $$invalidate(4, savedName = $$props.savedName);
    		if ("savedTagline" in $$props) savedTagline = $$props.savedTagline;
    	};

    	let ethAddress;
    	let savedName;
    	let savedTagline;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$loginStore*/ 8192) {
    			// load at start
    			 ethAddress = $loginStore.ethAddress;
    		}

    		if ($$self.$$.dirty & /*$loginStore*/ 8192) {
    			 $$invalidate(4, savedName = $loginStore.userName || $loginStore.userIdentity);
    		}

    		if ($$self.$$.dirty & /*$loginStore*/ 8192) {
    			//$: savedEmail = $loginStore.userEmail;
    			 savedTagline = $loginStore.userTagline;
    		}
    	};

    	return [
    		connected,
    		loginStore,
    		editMode,
    		minimized,
    		savedName,
    		edit,
    		save,
    		store,
    		isAdmin,
    		click_handler,
    		click_handler_1,
    		click_handler_2
    	];
    }

    class Profile extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {
    			connected: 0,
    			loginStore: 1,
    			store: 7,
    			isAdmin: 8
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Profile",
    			options,
    			id: create_fragment$7.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*connected*/ ctx[0] === undefined && !("connected" in props)) {
    			console.warn("<Profile> was created without expected prop 'connected'");
    		}

    		if (/*loginStore*/ ctx[1] === undefined && !("loginStore" in props)) {
    			console.warn("<Profile> was created without expected prop 'loginStore'");
    		}

    		if (/*store*/ ctx[7] === undefined && !("store" in props)) {
    			console.warn("<Profile> was created without expected prop 'store'");
    		}

    		if (/*isAdmin*/ ctx[8] === undefined && !("isAdmin" in props)) {
    			console.warn("<Profile> was created without expected prop 'isAdmin'");
    		}
    	}

    	get connected() {
    		throw new Error("<Profile>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set connected(value) {
    		throw new Error("<Profile>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get loginStore() {
    		throw new Error("<Profile>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set loginStore(value) {
    		throw new Error("<Profile>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get store() {
    		throw new Error("<Profile>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set store(value) {
    		throw new Error("<Profile>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isAdmin() {
    		throw new Error("<Profile>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isAdmin(value) {
    		throw new Error("<Profile>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/LeftBar/LeftBar.svelte generated by Svelte v3.29.0 */
    const file$8 = "src/components/LeftBar/LeftBar.svelte";

    // (33:2) {#if app.nodeHasBlog}
    function create_if_block$6(ctx) {
    	let links;
    	let current;

    	links = new Links({
    			props: { blogName: /*app*/ ctx[1].blogName },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(links.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(links, target, anchor);
    			current = true;
    		},
    		p: noop$1,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(links.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(links.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(links, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$6.name,
    		type: "if",
    		source: "(33:2) {#if app.nodeHasBlog}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let div;
    	let current;
    	let if_block = /*app*/ ctx[1].nodeHasBlog && create_if_block$6(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block) if_block.c();
    			attr_dev(div, "class", "leftbar svelte-5oz2zs");
    			add_location(div, file$8, 31, 0, 694);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block) if_block.m(div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*app*/ ctx[1].nodeHasBlog) if_block.p(ctx, dirty);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let $store,
    		$$unsubscribe_store = noop$1,
    		$$subscribe_store = () => ($$unsubscribe_store(), $$unsubscribe_store = subscribe(store, $$value => $$invalidate(11, $store = $$value)), store);

    	$$self.$$.on_destroy.push(() => $$unsubscribe_store());
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("LeftBar", slots, []);
    	const app = getContext("app");
    	let { connected } = $$props;
    	let { loggedIn } = $$props;
    	let { isAdmin } = $$props;
    	let { deviceName } = $$props; // temp
    	let { metamaskConnect } = $$props;
    	let { searchQuery } = $$props;
    	let { displayName } = $$props;
    	let { store } = $$props;
    	validate_store(store, "store");
    	$$subscribe_store();
    	let { loginStore } = $$props;

    	const writable_props = [
    		"connected",
    		"loggedIn",
    		"isAdmin",
    		"deviceName",
    		"metamaskConnect",
    		"searchQuery",
    		"displayName",
    		"store",
    		"loginStore"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<LeftBar> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("connected" in $$props) $$invalidate(2, connected = $$props.connected);
    		if ("loggedIn" in $$props) $$invalidate(3, loggedIn = $$props.loggedIn);
    		if ("isAdmin" in $$props) $$invalidate(4, isAdmin = $$props.isAdmin);
    		if ("deviceName" in $$props) $$invalidate(5, deviceName = $$props.deviceName);
    		if ("metamaskConnect" in $$props) $$invalidate(6, metamaskConnect = $$props.metamaskConnect);
    		if ("searchQuery" in $$props) $$invalidate(7, searchQuery = $$props.searchQuery);
    		if ("displayName" in $$props) $$invalidate(8, displayName = $$props.displayName);
    		if ("store" in $$props) $$subscribe_store($$invalidate(0, store = $$props.store));
    		if ("loginStore" in $$props) $$invalidate(9, loginStore = $$props.loginStore);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		app,
    		connected,
    		loggedIn,
    		isAdmin,
    		deviceName,
    		metamaskConnect,
    		searchQuery,
    		displayName,
    		store,
    		loginStore,
    		MenuBar,
    		Links,
    		Profile,
    		panels,
    		$store
    	});

    	$$self.$inject_state = $$props => {
    		if ("connected" in $$props) $$invalidate(2, connected = $$props.connected);
    		if ("loggedIn" in $$props) $$invalidate(3, loggedIn = $$props.loggedIn);
    		if ("isAdmin" in $$props) $$invalidate(4, isAdmin = $$props.isAdmin);
    		if ("deviceName" in $$props) $$invalidate(5, deviceName = $$props.deviceName);
    		if ("metamaskConnect" in $$props) $$invalidate(6, metamaskConnect = $$props.metamaskConnect);
    		if ("searchQuery" in $$props) $$invalidate(7, searchQuery = $$props.searchQuery);
    		if ("displayName" in $$props) $$invalidate(8, displayName = $$props.displayName);
    		if ("store" in $$props) $$subscribe_store($$invalidate(0, store = $$props.store));
    		if ("loginStore" in $$props) $$invalidate(9, loginStore = $$props.loginStore);
    		if ("panels" in $$props) panels = $$props.panels;
    	};

    	let panels;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$store*/ 2048) {
    			 panels = $store.panels;
    		}
    	};

    	return [
    		store,
    		app,
    		connected,
    		loggedIn,
    		isAdmin,
    		deviceName,
    		metamaskConnect,
    		searchQuery,
    		displayName,
    		loginStore
    	];
    }

    class LeftBar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {
    			connected: 2,
    			loggedIn: 3,
    			isAdmin: 4,
    			deviceName: 5,
    			metamaskConnect: 6,
    			searchQuery: 7,
    			displayName: 8,
    			store: 0,
    			loginStore: 9
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "LeftBar",
    			options,
    			id: create_fragment$8.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*connected*/ ctx[2] === undefined && !("connected" in props)) {
    			console.warn("<LeftBar> was created without expected prop 'connected'");
    		}

    		if (/*loggedIn*/ ctx[3] === undefined && !("loggedIn" in props)) {
    			console.warn("<LeftBar> was created without expected prop 'loggedIn'");
    		}

    		if (/*isAdmin*/ ctx[4] === undefined && !("isAdmin" in props)) {
    			console.warn("<LeftBar> was created without expected prop 'isAdmin'");
    		}

    		if (/*deviceName*/ ctx[5] === undefined && !("deviceName" in props)) {
    			console.warn("<LeftBar> was created without expected prop 'deviceName'");
    		}

    		if (/*metamaskConnect*/ ctx[6] === undefined && !("metamaskConnect" in props)) {
    			console.warn("<LeftBar> was created without expected prop 'metamaskConnect'");
    		}

    		if (/*searchQuery*/ ctx[7] === undefined && !("searchQuery" in props)) {
    			console.warn("<LeftBar> was created without expected prop 'searchQuery'");
    		}

    		if (/*displayName*/ ctx[8] === undefined && !("displayName" in props)) {
    			console.warn("<LeftBar> was created without expected prop 'displayName'");
    		}

    		if (/*store*/ ctx[0] === undefined && !("store" in props)) {
    			console.warn("<LeftBar> was created without expected prop 'store'");
    		}

    		if (/*loginStore*/ ctx[9] === undefined && !("loginStore" in props)) {
    			console.warn("<LeftBar> was created without expected prop 'loginStore'");
    		}
    	}

    	get connected() {
    		throw new Error("<LeftBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set connected(value) {
    		throw new Error("<LeftBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get loggedIn() {
    		throw new Error("<LeftBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set loggedIn(value) {
    		throw new Error("<LeftBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isAdmin() {
    		throw new Error("<LeftBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isAdmin(value) {
    		throw new Error("<LeftBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get deviceName() {
    		throw new Error("<LeftBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set deviceName(value) {
    		throw new Error("<LeftBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get metamaskConnect() {
    		throw new Error("<LeftBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set metamaskConnect(value) {
    		throw new Error("<LeftBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get searchQuery() {
    		throw new Error("<LeftBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set searchQuery(value) {
    		throw new Error("<LeftBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get displayName() {
    		throw new Error("<LeftBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set displayName(value) {
    		throw new Error("<LeftBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get store() {
    		throw new Error("<LeftBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set store(value) {
    		throw new Error("<LeftBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get loginStore() {
    		throw new Error("<LeftBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set loginStore(value) {
    		throw new Error("<LeftBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    //export const searchMode = writable(localStorage.getItem('searchMode') ? parseInt(localStorage.getItem('searchMode')) : 0);
    const searchMode = writable(0);

    /* node_modules/svelte-spinner/src/index.svelte generated by Svelte v3.29.0 */

    const file$9 = "node_modules/svelte-spinner/src/index.svelte";

    function create_fragment$9(ctx) {
    	let svg;
    	let circle;
    	let circle_stroke_dasharray_value;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			circle = svg_element("circle");
    			attr_dev(circle, "role", "presentation");
    			attr_dev(circle, "cx", "16");
    			attr_dev(circle, "cy", "16");
    			attr_dev(circle, "r", /*radius*/ ctx[4]);
    			attr_dev(circle, "stroke", /*color*/ ctx[2]);
    			attr_dev(circle, "fill", "none");
    			attr_dev(circle, "stroke-width", /*thickness*/ ctx[3]);
    			attr_dev(circle, "stroke-dasharray", circle_stroke_dasharray_value = "" + (/*dash*/ ctx[5] + ",100"));
    			attr_dev(circle, "stroke-linecap", "round");
    			add_location(circle, file$9, 19, 2, 384);
    			attr_dev(svg, "height", /*size*/ ctx[0]);
    			attr_dev(svg, "width", /*size*/ ctx[0]);
    			set_style(svg, "animation-duration", /*speed*/ ctx[1] + "ms");
    			attr_dev(svg, "class", "svelte-spinner svelte-1bbsd2f");
    			attr_dev(svg, "viewBox", "0 0 32 32");
    			add_location(svg, file$9, 12, 0, 253);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, circle);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*radius*/ 16) {
    				attr_dev(circle, "r", /*radius*/ ctx[4]);
    			}

    			if (dirty & /*color*/ 4) {
    				attr_dev(circle, "stroke", /*color*/ ctx[2]);
    			}

    			if (dirty & /*thickness*/ 8) {
    				attr_dev(circle, "stroke-width", /*thickness*/ ctx[3]);
    			}

    			if (dirty & /*dash*/ 32 && circle_stroke_dasharray_value !== (circle_stroke_dasharray_value = "" + (/*dash*/ ctx[5] + ",100"))) {
    				attr_dev(circle, "stroke-dasharray", circle_stroke_dasharray_value);
    			}

    			if (dirty & /*size*/ 1) {
    				attr_dev(svg, "height", /*size*/ ctx[0]);
    			}

    			if (dirty & /*size*/ 1) {
    				attr_dev(svg, "width", /*size*/ ctx[0]);
    			}

    			if (dirty & /*speed*/ 2) {
    				set_style(svg, "animation-duration", /*speed*/ ctx[1] + "ms");
    			}
    		},
    		i: noop$1,
    		o: noop$1,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Src", slots, []);
    	let { size = 25 } = $$props;
    	let { speed = 750 } = $$props;
    	let { color = "rgba(0,0,0,0.4)" } = $$props;
    	let { thickness = 2 } = $$props;
    	let { gap = 40 } = $$props;
    	let { radius = 10 } = $$props;
    	let dash;
    	const writable_props = ["size", "speed", "color", "thickness", "gap", "radius"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Src> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("size" in $$props) $$invalidate(0, size = $$props.size);
    		if ("speed" in $$props) $$invalidate(1, speed = $$props.speed);
    		if ("color" in $$props) $$invalidate(2, color = $$props.color);
    		if ("thickness" in $$props) $$invalidate(3, thickness = $$props.thickness);
    		if ("gap" in $$props) $$invalidate(6, gap = $$props.gap);
    		if ("radius" in $$props) $$invalidate(4, radius = $$props.radius);
    	};

    	$$self.$capture_state = () => ({
    		size,
    		speed,
    		color,
    		thickness,
    		gap,
    		radius,
    		dash
    	});

    	$$self.$inject_state = $$props => {
    		if ("size" in $$props) $$invalidate(0, size = $$props.size);
    		if ("speed" in $$props) $$invalidate(1, speed = $$props.speed);
    		if ("color" in $$props) $$invalidate(2, color = $$props.color);
    		if ("thickness" in $$props) $$invalidate(3, thickness = $$props.thickness);
    		if ("gap" in $$props) $$invalidate(6, gap = $$props.gap);
    		if ("radius" in $$props) $$invalidate(4, radius = $$props.radius);
    		if ("dash" in $$props) $$invalidate(5, dash = $$props.dash);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*radius, gap*/ 80) {
    			 $$invalidate(5, dash = 2 * Math.PI * radius * (100 - gap) / 100);
    		}
    	};

    	return [size, speed, color, thickness, radius, dash, gap];
    }

    class Src extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {
    			size: 0,
    			speed: 1,
    			color: 2,
    			thickness: 3,
    			gap: 6,
    			radius: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Src",
    			options,
    			id: create_fragment$9.name
    		});
    	}

    	get size() {
    		throw new Error("<Src>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<Src>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get speed() {
    		throw new Error("<Src>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set speed(value) {
    		throw new Error("<Src>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Src>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Src>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get thickness() {
    		throw new Error("<Src>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set thickness(value) {
    		throw new Error("<Src>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get gap() {
    		throw new Error("<Src>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set gap(value) {
    		throw new Error("<Src>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get radius() {
    		throw new Error("<Src>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set radius(value) {
    		throw new Error("<Src>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/ConnectionStatus.svelte generated by Svelte v3.29.0 */
    const file$a = "src/components/ConnectionStatus.svelte";

    // (37:2) {:else}
    function create_else_block_1(ctx) {
    	let span1;
    	let span0;
    	let t0_value = /*displayDeviceName*/ ctx[4](/*deviceName*/ ctx[1]) + "";
    	let t0;
    	let t1;
    	let t2;
    	let span2;
    	let spinner;
    	let current;

    	spinner = new Src({
    			props: {
    				size: "16",
    				speed: "2000",
    				color: "#EFCAF8",
    				thickness: "3",
    				gap: "25"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			span1 = element("span");
    			span0 = element("span");
    			t0 = text(t0_value);
    			t1 = text(" reconnecting");
    			t2 = space();
    			span2 = element("span");
    			create_component(spinner.$$.fragment);
    			attr_dev(span0, "class", "device_name svelte-k7g394");
    			add_location(span0, file$a, 38, 8, 1138);
    			attr_dev(span1, "class", "device_status svelte-k7g394");
    			add_location(span1, file$a, 37, 6, 1101);
    			attr_dev(span2, "class", "spinner svelte-k7g394");
    			add_location(span2, file$a, 41, 6, 1237);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span1, anchor);
    			append_dev(span1, span0);
    			append_dev(span0, t0);
    			append_dev(span1, t1);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, span2, anchor);
    			mount_component(spinner, span2, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty & /*deviceName*/ 2) && t0_value !== (t0_value = /*displayDeviceName*/ ctx[4](/*deviceName*/ ctx[1]) + "")) set_data_dev(t0, t0_value);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(spinner.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(spinner.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span1);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(span2);
    			destroy_component(spinner);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(37:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (22:2) {#if connected}
    function create_if_block$7(ctx) {
    	let span1;

    	let t0_value = (/*app*/ ctx[3].isLocalhost || /*app*/ ctx[3].isLAN
    	? "local node"
    	: "") + "";

    	let t0;
    	let t1;
    	let span0;
    	let t2_value = /*displayDeviceName*/ ctx[4](/*deviceName*/ ctx[1]) + "";
    	let t2;
    	let t3;
    	let t4;
    	let div;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	const if_block_creators = [create_if_block_1$3, create_else_block$3];
    	const if_blocks = [];

    	function select_block_type_1(ctx, dirty) {
    		if (/*isSearching*/ ctx[2]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type_1(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			span1 = element("span");
    			t0 = text(t0_value);
    			t1 = space();
    			span0 = element("span");
    			t2 = text(t2_value);
    			t3 = text(" ready");
    			t4 = space();
    			div = element("div");
    			if_block.c();
    			attr_dev(span0, "class", "device_name svelte-k7g394");
    			add_location(span0, file$a, 25, 8, 702);
    			attr_dev(span1, "class", "device_status svelte-k7g394");
    			add_location(span1, file$a, 23, 6, 606);
    			attr_dev(div, "class", "spinner_or_mark svelte-k7g394");
    			add_location(div, file$a, 28, 6, 795);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span1, anchor);
    			append_dev(span1, t0);
    			append_dev(span1, t1);
    			append_dev(span1, span0);
    			append_dev(span0, t2);
    			append_dev(span1, t3);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, div, anchor);
    			if_blocks[current_block_type_index].m(div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty & /*deviceName*/ 2) && t2_value !== (t2_value = /*displayDeviceName*/ ctx[4](/*deviceName*/ ctx[1]) + "")) set_data_dev(t2, t2_value);
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_1(ctx);

    			if (current_block_type_index !== previous_block_index) {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(div, null);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span1);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(div);
    			if_blocks[current_block_type_index].d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$7.name,
    		type: "if",
    		source: "(22:2) {#if connected}",
    		ctx
    	});

    	return block;
    }

    // (32:8) {:else}
    function create_else_block$3(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			attr_dev(img, "class", "mark svelte-k7g394");
    			if (img.src !== (img_src_value = "/apps/zeta/img/redesign/zetaseek_icon-OK.svg")) attr_dev(img, "src", img_src_value);
    			add_location(img, file$a, 32, 10, 985);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		i: noop$1,
    		o: noop$1,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$3.name,
    		type: "else",
    		source: "(32:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (30:8) {#if isSearching}
    function create_if_block_1$3(ctx) {
    	let span;
    	let spinner;
    	let current;

    	spinner = new Src({
    			props: {
    				size: "16",
    				speed: "400",
    				color: "#fff",
    				thickness: "3",
    				gap: "40"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			span = element("span");
    			create_component(spinner.$$.fragment);
    			attr_dev(span, "class", "spinner svelte-k7g394");
    			add_location(span, file$a, 30, 10, 861);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			mount_component(spinner, span, null);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(spinner.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(spinner.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			destroy_component(spinner);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$3.name,
    		type: "if",
    		source: "(30:8) {#if isSearching}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let p;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	const if_block_creators = [create_if_block$7, create_else_block_1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*connected*/ ctx[0]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			p = element("p");
    			if_block.c();
    			attr_dev(p, "class", "connection_status svelte-k7g394");
    			toggle_class(p, "ok", /*connected*/ ctx[0]);
    			add_location(p, file$a, 20, 0, 479);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			if_blocks[current_block_type_index].m(p, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(p, null);
    			}

    			if (dirty & /*connected*/ 1) {
    				toggle_class(p, "ok", /*connected*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    			if_blocks[current_block_type_index].d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ConnectionStatus", slots, []);
    	const app = getContext("app");
    	let { connected } = $$props;
    	let { deviceName } = $$props;
    	let { isSearching } = $$props;
    	let { device } = $$props;

    	function displayDeviceName(deviceName) {
    		return deviceName && (app.isLocalhost || app.isLAN)
    		? `@${deviceName}`
    		: `@${window.location.hostname}`;
    	}

    	const writable_props = ["connected", "deviceName", "isSearching", "device"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ConnectionStatus> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("connected" in $$props) $$invalidate(0, connected = $$props.connected);
    		if ("deviceName" in $$props) $$invalidate(1, deviceName = $$props.deviceName);
    		if ("isSearching" in $$props) $$invalidate(2, isSearching = $$props.isSearching);
    		if ("device" in $$props) $$invalidate(5, device = $$props.device);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		app,
    		readable,
    		searchMode,
    		Spinner: Src,
    		connected,
    		deviceName,
    		isSearching,
    		device,
    		displayDeviceName
    	});

    	$$self.$inject_state = $$props => {
    		if ("connected" in $$props) $$invalidate(0, connected = $$props.connected);
    		if ("deviceName" in $$props) $$invalidate(1, deviceName = $$props.deviceName);
    		if ("isSearching" in $$props) $$invalidate(2, isSearching = $$props.isSearching);
    		if ("device" in $$props) $$invalidate(5, device = $$props.device);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [connected, deviceName, isSearching, app, displayDeviceName, device];
    }

    class ConnectionStatus extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {
    			connected: 0,
    			deviceName: 1,
    			isSearching: 2,
    			device: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ConnectionStatus",
    			options,
    			id: create_fragment$a.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*connected*/ ctx[0] === undefined && !("connected" in props)) {
    			console.warn("<ConnectionStatus> was created without expected prop 'connected'");
    		}

    		if (/*deviceName*/ ctx[1] === undefined && !("deviceName" in props)) {
    			console.warn("<ConnectionStatus> was created without expected prop 'deviceName'");
    		}

    		if (/*isSearching*/ ctx[2] === undefined && !("isSearching" in props)) {
    			console.warn("<ConnectionStatus> was created without expected prop 'isSearching'");
    		}

    		if (/*device*/ ctx[5] === undefined && !("device" in props)) {
    			console.warn("<ConnectionStatus> was created without expected prop 'device'");
    		}
    	}

    	get connected() {
    		throw new Error("<ConnectionStatus>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set connected(value) {
    		throw new Error("<ConnectionStatus>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get deviceName() {
    		throw new Error("<ConnectionStatus>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set deviceName(value) {
    		throw new Error("<ConnectionStatus>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isSearching() {
    		throw new Error("<ConnectionStatus>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isSearching(value) {
    		throw new Error("<ConnectionStatus>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get device() {
    		throw new Error("<ConnectionStatus>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set device(value) {
    		throw new Error("<ConnectionStatus>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/ZetaExplorersInvite.svelte generated by Svelte v3.29.0 */
    const file$b = "src/components/ZetaExplorersInvite.svelte";

    function create_fragment$b(ctx) {
    	let img;
    	let img_src_value;
    	let t0;
    	let a;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			img = element("img");
    			t0 = text("\nZeta Explorers (βeta) ·\n\n\n");
    			a = element("a");
    			a.textContent = "Starting October 30";
    			if (img.src !== (img_src_value = "/apps/zeta/img/tropical_fish.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "tropical-fish");
    			attr_dev(img, "class", "svelte-1bzlt0t");
    			add_location(img, file$b, 5, 0, 92);
    			attr_dev(a, "href", "#");
    			attr_dev(a, "class", "svelte-1bzlt0t");
    			add_location(a, file$b, 9, 0, 293);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, a, anchor);

    			if (!mounted) {
    				dispose = listen_dev(a, "click", prevent_default(/*click_handler*/ ctx[1]), false, true, false);
    				mounted = true;
    			}
    		},
    		p: noop$1,
    		i: noop$1,
    		o: noop$1,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(a);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ZetaExplorersInvite", slots, []);
    	const app = getContext("app");
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ZetaExplorersInvite> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => {
    		app.emit("explorersClick");
    	};

    	$$self.$capture_state = () => ({ getContext, app });
    	return [app, click_handler];
    }

    class ZetaExplorersInvite extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ZetaExplorersInvite",
    			options,
    			id: create_fragment$b.name
    		});
    	}
    }

    /* src/components/NodeTagline.svelte generated by Svelte v3.29.0 */
    const file$c = "src/components/NodeTagline.svelte";

    // (13:2) {#if app.isZetaSeek}
    function create_if_block$8(ctx) {
    	let div;
    	let if_block = /*connected*/ ctx[0] && create_if_block_1$4(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block) if_block.c();
    			attr_dev(div, "class", "tagline svelte-awns0o");
    			add_location(div, file$c, 13, 4, 311);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block) if_block.m(div, null);
    		},
    		p: function update(ctx, dirty) {
    			if (/*connected*/ ctx[0]) {
    				if (if_block) ; else {
    					if_block = create_if_block_1$4(ctx);
    					if_block.c();
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$8.name,
    		type: "if",
    		source: "(13:2) {#if app.isZetaSeek}",
    		ctx
    	});

    	return block;
    }

    // (15:6) {#if connected}
    function create_if_block_1$4(ctx) {
    	let t0;
    	let a;
    	let t2;

    	const block = {
    		c: function create() {
    			t0 = text("A small step forward ");
    			a = element("a");
    			a.textContent = "each friday";
    			t2 = text(", big leap each year.");
    			attr_dev(a, "href", "https://dmt-system.com");
    			attr_dev(a, "class", "svelte-awns0o");
    			add_location(a, file$c, 15, 29, 384);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, a, anchor);
    			insert_dev(target, t2, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(a);
    			if (detaching) detach_dev(t2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$4.name,
    		type: "if",
    		source: "(15:6) {#if connected}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$c(ctx) {
    	let if_block_anchor;
    	let if_block = /*app*/ ctx[1].isZetaSeek && create_if_block$8(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*app*/ ctx[1].isZetaSeek) if_block.p(ctx, dirty);
    		},
    		i: noop$1,
    		o: noop$1,
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("NodeTagline", slots, []);
    	let { connected } = $$props;
    	let { loggedIn } = $$props;
    	let { searchResults } = $$props;
    	let { displayName } = $$props;
    	const app = getContext("app");
    	const writable_props = ["connected", "loggedIn", "searchResults", "displayName"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<NodeTagline> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("connected" in $$props) $$invalidate(0, connected = $$props.connected);
    		if ("loggedIn" in $$props) $$invalidate(2, loggedIn = $$props.loggedIn);
    		if ("searchResults" in $$props) $$invalidate(3, searchResults = $$props.searchResults);
    		if ("displayName" in $$props) $$invalidate(4, displayName = $$props.displayName);
    	};

    	$$self.$capture_state = () => ({
    		connected,
    		loggedIn,
    		searchResults,
    		displayName,
    		ZetaExplorersInvite,
    		getContext,
    		createEventDispatcher,
    		app
    	});

    	$$self.$inject_state = $$props => {
    		if ("connected" in $$props) $$invalidate(0, connected = $$props.connected);
    		if ("loggedIn" in $$props) $$invalidate(2, loggedIn = $$props.loggedIn);
    		if ("searchResults" in $$props) $$invalidate(3, searchResults = $$props.searchResults);
    		if ("displayName" in $$props) $$invalidate(4, displayName = $$props.displayName);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [connected, app, loggedIn, searchResults, displayName];
    }

    class NodeTagline extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$c, create_fragment$c, safe_not_equal, {
    			connected: 0,
    			loggedIn: 2,
    			searchResults: 3,
    			displayName: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NodeTagline",
    			options,
    			id: create_fragment$c.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*connected*/ ctx[0] === undefined && !("connected" in props)) {
    			console.warn("<NodeTagline> was created without expected prop 'connected'");
    		}

    		if (/*loggedIn*/ ctx[2] === undefined && !("loggedIn" in props)) {
    			console.warn("<NodeTagline> was created without expected prop 'loggedIn'");
    		}

    		if (/*searchResults*/ ctx[3] === undefined && !("searchResults" in props)) {
    			console.warn("<NodeTagline> was created without expected prop 'searchResults'");
    		}

    		if (/*displayName*/ ctx[4] === undefined && !("displayName" in props)) {
    			console.warn("<NodeTagline> was created without expected prop 'displayName'");
    		}
    	}

    	get connected() {
    		throw new Error("<NodeTagline>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set connected(value) {
    		throw new Error("<NodeTagline>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get loggedIn() {
    		throw new Error("<NodeTagline>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set loggedIn(value) {
    		throw new Error("<NodeTagline>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get searchResults() {
    		throw new Error("<NodeTagline>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set searchResults(value) {
    		throw new Error("<NodeTagline>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get displayName() {
    		throw new Error("<NodeTagline>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set displayName(value) {
    		throw new Error("<NodeTagline>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/SearchModeDiagram.svelte generated by Svelte v3.29.0 */
    const file$d = "src/components/SearchModeDiagram.svelte";

    // (25:0) {#if diagramIsVisible}
    function create_if_block$9(ctx) {
    	let div;

    	function select_block_type(ctx, dirty) {
    		if (/*$searchMode*/ ctx[1] == 0) return create_if_block_1$5;
    		return create_else_block$4;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if_block.c();
    			attr_dev(div, "class", "diagram svelte-1bigczx");
    			add_location(div, file$d, 25, 2, 635);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if_block.m(div, null);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type !== (current_block_type = select_block_type(ctx))) {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div, null);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$9.name,
    		type: "if",
    		source: "(25:0) {#if diagramIsVisible}",
    		ctx
    	});

    	return block;
    }

    // (30:4) {:else}
    function create_else_block$4(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (img.src !== (img_src_value = "/apps/zeta/img/zeta_search_queries1.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "zeta_search_query_this_node");
    			attr_dev(img, "class", "svelte-1bigczx");
    			add_location(img, file$d, 30, 6, 898);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$4.name,
    		type: "else",
    		source: "(30:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (28:4) {#if $searchMode == 0}
    function create_if_block_1$5(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (img.src !== (img_src_value = "/apps/zeta/img/zeta_search_queries0.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "zeta_search_query_public");
    			attr_dev(img, "class", "svelte-1bigczx");
    			add_location(img, file$d, 28, 6, 795);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$5.name,
    		type: "if",
    		source: "(28:4) {#if $searchMode == 0}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$d(ctx) {
    	let div;
    	let a;
    	let t0_value = (/*diagramIsVisible*/ ctx[0] ? "Hide" : "Show") + "";
    	let t0;
    	let t1;
    	let t2_value = (/*$searchMode*/ ctx[1] == 0 ? "first" : "second") + "";
    	let t2;
    	let t3;
    	let t4;
    	let if_block_anchor;
    	let mounted;
    	let dispose;
    	let if_block = /*diagramIsVisible*/ ctx[0] && create_if_block$9(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			a = element("a");
    			t0 = text(t0_value);
    			t1 = space();
    			t2 = text(t2_value);
    			t3 = text(" diagram");
    			t4 = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			attr_dev(a, "href", "#");
    			attr_dev(a, "class", "svelte-1bigczx");
    			add_location(a, file$d, 21, 2, 448);
    			attr_dev(div, "class", "show_diagram svelte-1bigczx");
    			add_location(div, file$d, 20, 0, 419);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, a);
    			append_dev(a, t0);
    			append_dev(a, t1);
    			append_dev(a, t2);
    			append_dev(a, t3);
    			insert_dev(target, t4, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);

    			if (!mounted) {
    				dispose = listen_dev(a, "click", prevent_default(/*click_handler*/ ctx[3]), false, true, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*diagramIsVisible*/ 1 && t0_value !== (t0_value = (/*diagramIsVisible*/ ctx[0] ? "Hide" : "Show") + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*$searchMode*/ 2 && t2_value !== (t2_value = (/*$searchMode*/ ctx[1] == 0 ? "first" : "second") + "")) set_data_dev(t2, t2_value);

    			if (/*diagramIsVisible*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$9(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop$1,
    		o: noop$1,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching) detach_dev(t4);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let $searchMode;
    	validate_store(searchMode, "searchMode");
    	component_subscribe($$self, searchMode, $$value => $$invalidate(1, $searchMode = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("SearchModeDiagram", slots, []);
    	const app = getContext("app");
    	let diagramIsVisible = false;

    	function toggleDiagram() {
    		$$invalidate(0, diagramIsVisible = !diagramIsVisible);

    		if (diagramIsVisible && window.screen.width > 768) {
    			document.body.classList.add("darken");
    		} else {
    			document.body.classList.remove("darken");
    		}
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SearchModeDiagram> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => {
    		toggleDiagram();
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		app,
    		searchMode,
    		diagramIsVisible,
    		toggleDiagram,
    		$searchMode
    	});

    	$$self.$inject_state = $$props => {
    		if ("diagramIsVisible" in $$props) $$invalidate(0, diagramIsVisible = $$props.diagramIsVisible);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [diagramIsVisible, $searchMode, toggleDiagram, click_handler];
    }

    class SearchModeDiagram extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SearchModeDiagram",
    			options,
    			id: create_fragment$d.name
    		});
    	}
    }

    /* src/components/SearchModeSelector.svelte generated by Svelte v3.29.0 */
    const file$e = "src/components/SearchModeSelector.svelte";

    // (37:2) {:else}
    function create_else_block$5(ctx) {
    	let span0;
    	let t0;
    	let b;
    	let t2;
    	let span1;
    	let t3;
    	let mounted;
    	let dispose;
    	let if_block = /*$searchMode*/ ctx[0] == 0 && create_if_block_2$1(ctx);

    	const block = {
    		c: function create() {
    			span0 = element("span");
    			t0 = text("↑ ");
    			b = element("b");
    			b.textContent = "This machine search";
    			t2 = text(" ·\n    \n    ");
    			span1 = element("span");
    			if (if_block) if_block.c();
    			t3 = text("\n      Network search");
    			add_location(b, file$e, 39, 8, 1440);
    			attr_dev(span0, "class", "this_node_search svelte-vdz3i6");
    			toggle_class(span0, "active", /*$searchMode*/ ctx[0] == 1);
    			add_location(span0, file$e, 37, 4, 1290);
    			attr_dev(span1, "class", "team_search svelte-vdz3i6");
    			toggle_class(span1, "active", /*$searchMode*/ ctx[0] == 0);
    			add_location(span1, file$e, 42, 4, 1617);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span0, anchor);
    			append_dev(span0, t0);
    			append_dev(span0, b);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, span1, anchor);
    			if (if_block) if_block.m(span1, null);
    			append_dev(span1, t3);

    			if (!mounted) {
    				dispose = [
    					listen_dev(span0, "click", /*click_handler_2*/ ctx[5], false, false, false),
    					listen_dev(span1, "click", /*click_handler_3*/ ctx[6], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$searchMode*/ 1) {
    				toggle_class(span0, "active", /*$searchMode*/ ctx[0] == 1);
    			}

    			if (/*$searchMode*/ ctx[0] == 0) {
    				if (if_block) ; else {
    					if_block = create_if_block_2$1(ctx);
    					if_block.c();
    					if_block.m(span1, t3);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*$searchMode*/ 1) {
    				toggle_class(span1, "active", /*$searchMode*/ ctx[0] == 0);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span0);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(span1);
    			if (if_block) if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$5.name,
    		type: "else",
    		source: "(37:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (27:2) {#if $searchMode == 0}
    function create_if_block$a(ctx) {
    	let span0;
    	let t0;
    	let b;
    	let t2;
    	let span1;
    	let t3;
    	let mounted;
    	let dispose;
    	let if_block = /*$searchMode*/ ctx[0] == 1 && create_if_block_1$6(ctx);

    	const block = {
    		c: function create() {
    			span0 = element("span");
    			t0 = text("↑ ");
    			b = element("b");
    			b.textContent = "Network search";
    			t2 = text(" ·\n    \n    ");
    			span1 = element("span");
    			if (if_block) if_block.c();
    			t3 = text("\n      This machine search");
    			add_location(b, file$e, 29, 8, 933);
    			attr_dev(span0, "class", "team_search svelte-vdz3i6");
    			toggle_class(span0, "active", /*$searchMode*/ ctx[0] == 0);
    			add_location(span0, file$e, 27, 4, 788);
    			attr_dev(span1, "class", "this_node_search svelte-vdz3i6");
    			toggle_class(span1, "active", /*$searchMode*/ ctx[0] == 1);
    			add_location(span1, file$e, 32, 4, 1105);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span0, anchor);
    			append_dev(span0, t0);
    			append_dev(span0, b);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, span1, anchor);
    			if (if_block) if_block.m(span1, null);
    			append_dev(span1, t3);

    			if (!mounted) {
    				dispose = [
    					listen_dev(span0, "click", /*click_handler*/ ctx[3], false, false, false),
    					listen_dev(span1, "click", /*click_handler_1*/ ctx[4], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$searchMode*/ 1) {
    				toggle_class(span0, "active", /*$searchMode*/ ctx[0] == 0);
    			}

    			if (/*$searchMode*/ ctx[0] == 1) {
    				if (if_block) ; else {
    					if_block = create_if_block_1$6(ctx);
    					if_block.c();
    					if_block.m(span1, t3);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*$searchMode*/ 1) {
    				toggle_class(span1, "active", /*$searchMode*/ ctx[0] == 1);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span0);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(span1);
    			if (if_block) if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$a.name,
    		type: "if",
    		source: "(27:2) {#if $searchMode == 0}",
    		ctx
    	});

    	return block;
    }

    // (44:6) {#if $searchMode == 0}
    function create_if_block_2$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("↑");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(44:6) {#if $searchMode == 0}",
    		ctx
    	});

    	return block;
    }

    // (34:6) {#if $searchMode == 1}
    function create_if_block_1$6(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("↑");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$6.name,
    		type: "if",
    		source: "(34:6) {#if $searchMode == 1}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$e(ctx) {
    	let div;

    	function select_block_type(ctx, dirty) {
    		if (/*$searchMode*/ ctx[0] == 0) return create_if_block$a;
    		return create_else_block$5;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if_block.c();
    			attr_dev(div, "class", "search_mode svelte-vdz3i6");
    			add_location(div, file$e, 25, 0, 733);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if_block.m(div, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div, null);
    				}
    			}
    		},
    		i: noop$1,
    		o: noop$1,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let $searchMode;
    	validate_store(searchMode, "searchMode");
    	component_subscribe($$self, searchMode, $$value => $$invalidate(0, $searchMode = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("SearchModeSelector", slots, []);
    	const app = getContext("app");
    	let { searchQuery } = $$props;

    	//export let store;
    	const dispatch = createEventDispatcher();

    	//$: searchMode = $store.searchMode;
    	function setSearchMode(mode) {
    		searchMode.set(mode);

    		//store.set({ searchMode }) // DIDN'T WORK! too slow, reactive argument was not updated in time and triggerSearch function in App.svelte read the old searchMode
    		// used readable store instead
    		localStorage.setItem("searchMode", mode);

    		//updateBrowserQuery();
    		dispatch("searchModeChanged");
    	}

    	const writable_props = ["searchQuery"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SearchModeSelector> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => setSearchMode(0);
    	const click_handler_1 = () => setSearchMode(1);
    	const click_handler_2 = () => setSearchMode(1);
    	const click_handler_3 = () => setSearchMode(0);

    	$$self.$$set = $$props => {
    		if ("searchQuery" in $$props) $$invalidate(2, searchQuery = $$props.searchQuery);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		createEventDispatcher,
    		app,
    		searchMode,
    		SearchModeDiagram,
    		searchQuery,
    		dispatch,
    		setSearchMode,
    		$searchMode
    	});

    	$$self.$inject_state = $$props => {
    		if ("searchQuery" in $$props) $$invalidate(2, searchQuery = $$props.searchQuery);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		$searchMode,
    		setSearchMode,
    		searchQuery,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3
    	];
    }

    class SearchModeSelector extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, { searchQuery: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SearchModeSelector",
    			options,
    			id: create_fragment$e.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*searchQuery*/ ctx[2] === undefined && !("searchQuery" in props)) {
    			console.warn("<SearchModeSelector> was created without expected prop 'searchQuery'");
    		}
    	}

    	get searchQuery() {
    		throw new Error("<SearchModeSelector>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set searchQuery(value) {
    		throw new Error("<SearchModeSelector>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/SearchResults/ResultTags/ResultTag.svelte generated by Svelte v3.29.0 */

    const file$f = "src/components/SearchResults/ResultTags/ResultTag.svelte";

    // (20:2) {:else}
    function create_else_block$6(ctx) {
    	let t_value = /*tag*/ ctx[0].toUpperCase() + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*tag*/ 1 && t_value !== (t_value = /*tag*/ ctx[0].toUpperCase() + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$6.name,
    		type: "else",
    		source: "(20:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (18:2) {#if mediaTypeIcon(tag)}
    function create_if_block_1$7(ctx) {
    	let t_value = mediaTypeIcon(/*tag*/ ctx[0]) + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*tag*/ 1 && t_value !== (t_value = mediaTypeIcon(/*tag*/ ctx[0]) + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$7.name,
    		type: "if",
    		source: "(18:2) {#if mediaTypeIcon(tag)}",
    		ctx
    	});

    	return block;
    }

    // (24:2) {#if tag == 'swarm'}
    function create_if_block$b(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("[beta]");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$b.name,
    		type: "if",
    		source: "(24:2) {#if tag == 'swarm'}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$f(ctx) {
    	let span;
    	let show_if;
    	let t;
    	let span_class_value;

    	function select_block_type(ctx, dirty) {
    		if (show_if == null || dirty & /*tag*/ 1) show_if = !!mediaTypeIcon(/*tag*/ ctx[0]);
    		if (show_if) return create_if_block_1$7;
    		return create_else_block$6;
    	}

    	let current_block_type = select_block_type(ctx, -1);
    	let if_block0 = current_block_type(ctx);
    	let if_block1 = /*tag*/ ctx[0] == "swarm" && create_if_block$b(ctx);

    	const block = {
    		c: function create() {
    			span = element("span");
    			if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			attr_dev(span, "class", span_class_value = "tag " + /*tag*/ ctx[0].toLowerCase() + "Tag" + " svelte-s1fd6d");
    			add_location(span, file$f, 15, 0, 188);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			if_block0.m(span, null);
    			append_dev(span, t);
    			if (if_block1) if_block1.m(span, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx, dirty)) && if_block0) {
    				if_block0.p(ctx, dirty);
    			} else {
    				if_block0.d(1);
    				if_block0 = current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(span, t);
    				}
    			}

    			if (/*tag*/ ctx[0] == "swarm") {
    				if (if_block1) ; else {
    					if_block1 = create_if_block$b(ctx);
    					if_block1.c();
    					if_block1.m(span, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (dirty & /*tag*/ 1 && span_class_value !== (span_class_value = "tag " + /*tag*/ ctx[0].toLowerCase() + "Tag" + " svelte-s1fd6d")) {
    				attr_dev(span, "class", span_class_value);
    			}
    		},
    		i: noop$1,
    		o: noop$1,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			if_block0.d();
    			if (if_block1) if_block1.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function mediaTypeIcon(mediaType) {
    	switch (mediaType) {
    		case "music":
    			return "♬";
    		default:
    			return "";
    	}
    }

    function instance$f($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ResultTag", slots, []);
    	let { tag } = $$props;
    	const writable_props = ["tag"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ResultTag> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("tag" in $$props) $$invalidate(0, tag = $$props.tag);
    	};

    	$$self.$capture_state = () => ({ mediaTypeIcon, tag });

    	$$self.$inject_state = $$props => {
    		if ("tag" in $$props) $$invalidate(0, tag = $$props.tag);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [tag];
    }

    class ResultTag extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$f, create_fragment$f, safe_not_equal, { tag: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ResultTag",
    			options,
    			id: create_fragment$f.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*tag*/ ctx[0] === undefined && !("tag" in props)) {
    			console.warn("<ResultTag> was created without expected prop 'tag'");
    		}
    	}

    	get tag() {
    		throw new Error("<ResultTag>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tag(value) {
    		throw new Error("<ResultTag>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/SearchResults/ResultTags/ResultLinkTag.svelte generated by Svelte v3.29.0 */

    const file$g = "src/components/SearchResults/ResultTags/ResultLinkTag.svelte";

    function create_fragment$g(ctx) {
    	let span;
    	let t_value = /*tag*/ ctx[0].toUpperCase() + "";
    	let t;
    	let span_class_value;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "class", span_class_value = "tag " + /*tag*/ ctx[0].replace("-", "").toLowerCase() + "Tag" + " svelte-1l56r9b");
    			add_location(span, file$g, 4, 0, 38);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*tag*/ 1 && t_value !== (t_value = /*tag*/ ctx[0].toUpperCase() + "")) set_data_dev(t, t_value);

    			if (dirty & /*tag*/ 1 && span_class_value !== (span_class_value = "tag " + /*tag*/ ctx[0].replace("-", "").toLowerCase() + "Tag" + " svelte-1l56r9b")) {
    				attr_dev(span, "class", span_class_value);
    			}
    		},
    		i: noop$1,
    		o: noop$1,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$g($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ResultLinkTag", slots, []);
    	let { tag } = $$props;
    	const writable_props = ["tag"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ResultLinkTag> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("tag" in $$props) $$invalidate(0, tag = $$props.tag);
    	};

    	$$self.$capture_state = () => ({ tag });

    	$$self.$inject_state = $$props => {
    		if ("tag" in $$props) $$invalidate(0, tag = $$props.tag);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [tag];
    }

    class ResultLinkTag extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$g, create_fragment$g, safe_not_equal, { tag: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ResultLinkTag",
    			options,
    			id: create_fragment$g.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*tag*/ ctx[0] === undefined && !("tag" in props)) {
    			console.warn("<ResultLinkTag> was created without expected prop 'tag'");
    		}
    	}

    	get tag() {
    		throw new Error("<ResultLinkTag>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tag(value) {
    		throw new Error("<ResultLinkTag>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/SearchResults/ResultTags/ResultTags.svelte generated by Svelte v3.29.0 */

    // (11:0) {#if mediaType}
    function create_if_block_2$2(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_3, create_else_block$7];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*mediaType*/ ctx[0] == "photo") return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$2.name,
    		type: "if",
    		source: "(11:0) {#if mediaType}",
    		ctx
    	});

    	return block;
    }

    // (15:2) {:else}
    function create_else_block$7(ctx) {
    	let resulttag;
    	let current;

    	resulttag = new ResultTag({
    			props: { tag: /*mediaType*/ ctx[0] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(resulttag.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(resulttag, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const resulttag_changes = {};
    			if (dirty & /*mediaType*/ 1) resulttag_changes.tag = /*mediaType*/ ctx[0];
    			resulttag.$set(resulttag_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(resulttag.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(resulttag.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(resulttag, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$7.name,
    		type: "else",
    		source: "(15:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (13:2) {#if mediaType == 'photo'}
    function create_if_block_3(ctx) {
    	let resulttag;
    	let current;
    	resulttag = new ResultTag({ props: { tag: "image" }, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(resulttag.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(resulttag, target, anchor);
    			current = true;
    		},
    		p: noop$1,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(resulttag.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(resulttag.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(resulttag, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(13:2) {#if mediaType == 'photo'}",
    		ctx
    	});

    	return block;
    }

    // (21:0) {#if resultType}
    function create_if_block_1$8(ctx) {
    	let resulttag;
    	let current;

    	resulttag = new ResultTag({
    			props: { tag: /*resultType*/ ctx[1] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(resulttag.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(resulttag, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const resulttag_changes = {};
    			if (dirty & /*resultType*/ 2) resulttag_changes.tag = /*resultType*/ ctx[1];
    			resulttag.$set(resulttag_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(resulttag.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(resulttag.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(resulttag, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$8.name,
    		type: "if",
    		source: "(21:0) {#if resultType}",
    		ctx
    	});

    	return block;
    }

    // (25:0) {#if linkTag}
    function create_if_block$c(ctx) {
    	let resultlinktag;
    	let current;

    	resultlinktag = new ResultLinkTag({
    			props: { tag: /*linkTag*/ ctx[2] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(resultlinktag.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(resultlinktag, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const resultlinktag_changes = {};
    			if (dirty & /*linkTag*/ 4) resultlinktag_changes.tag = /*linkTag*/ ctx[2];
    			resultlinktag.$set(resultlinktag_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(resultlinktag.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(resultlinktag.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(resultlinktag, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$c.name,
    		type: "if",
    		source: "(25:0) {#if linkTag}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$h(ctx) {
    	let t0;
    	let t1;
    	let if_block2_anchor;
    	let current;
    	let if_block0 = /*mediaType*/ ctx[0] && create_if_block_2$2(ctx);
    	let if_block1 = /*resultType*/ ctx[1] && create_if_block_1$8(ctx);
    	let if_block2 = /*linkTag*/ ctx[2] && create_if_block$c(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			if (if_block2) if_block2.c();
    			if_block2_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t0, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, t1, anchor);
    			if (if_block2) if_block2.m(target, anchor);
    			insert_dev(target, if_block2_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*mediaType*/ ctx[0]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*mediaType*/ 1) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_2$2(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(t0.parentNode, t0);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*resultType*/ ctx[1]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*resultType*/ 2) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_1$8(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(t1.parentNode, t1);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (/*linkTag*/ ctx[2]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);

    					if (dirty & /*linkTag*/ 4) {
    						transition_in(if_block2, 1);
    					}
    				} else {
    					if_block2 = create_if_block$c(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(if_block2_anchor.parentNode, if_block2_anchor);
    				}
    			} else if (if_block2) {
    				group_outros();

    				transition_out(if_block2, 1, 1, () => {
    					if_block2 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			transition_in(if_block2);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			transition_out(if_block2);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t0);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(t1);
    			if (if_block2) if_block2.d(detaching);
    			if (detaching) detach_dev(if_block2_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$h($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ResultTags", slots, []);
    	let { mediaType = undefined } = $$props;
    	let { resultType = undefined } = $$props; // Prevent <ResultTags> was created without expected prop 'resultType'
    	let { entryType = undefined } = $$props; // further description: https://stackoverflow.com/questions/58571604/componentname-was-created-without-expected-prop-segment
    	let { linkTag = undefined } = $$props;
    	const writable_props = ["mediaType", "resultType", "entryType", "linkTag"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ResultTags> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("mediaType" in $$props) $$invalidate(0, mediaType = $$props.mediaType);
    		if ("resultType" in $$props) $$invalidate(1, resultType = $$props.resultType);
    		if ("entryType" in $$props) $$invalidate(3, entryType = $$props.entryType);
    		if ("linkTag" in $$props) $$invalidate(2, linkTag = $$props.linkTag);
    	};

    	$$self.$capture_state = () => ({
    		ResultTag,
    		ResultLinkTag,
    		mediaType,
    		resultType,
    		entryType,
    		linkTag
    	});

    	$$self.$inject_state = $$props => {
    		if ("mediaType" in $$props) $$invalidate(0, mediaType = $$props.mediaType);
    		if ("resultType" in $$props) $$invalidate(1, resultType = $$props.resultType);
    		if ("entryType" in $$props) $$invalidate(3, entryType = $$props.entryType);
    		if ("linkTag" in $$props) $$invalidate(2, linkTag = $$props.linkTag);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [mediaType, resultType, linkTag, entryType];
    }

    class ResultTags extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$h, create_fragment$h, safe_not_equal, {
    			mediaType: 0,
    			resultType: 1,
    			entryType: 3,
    			linkTag: 2
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ResultTags",
    			options,
    			id: create_fragment$h.name
    		});
    	}

    	get mediaType() {
    		throw new Error("<ResultTags>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set mediaType(value) {
    		throw new Error("<ResultTags>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get resultType() {
    		throw new Error("<ResultTags>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set resultType(value) {
    		throw new Error("<ResultTags>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get entryType() {
    		throw new Error("<ResultTags>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set entryType(value) {
    		throw new Error("<ResultTags>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get linkTag() {
    		throw new Error("<ResultTags>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set linkTag(value) {
    		throw new Error("<ResultTags>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/SearchResults/ResultTypes/ResultLink.svelte generated by Svelte v3.29.0 */

    const { console: console_1$1 } = globals;
    const file$h = "src/components/SearchResults/ResultTypes/ResultLink.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[21] = list[i];
    	return child_ctx;
    }

    // (59:2) {#if linkTags}
    function create_if_block_2$3(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value = /*linkTags*/ ctx[5];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*linkTags*/ 32) {
    				each_value = /*linkTags*/ ctx[5];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$3.name,
    		type: "if",
    		source: "(59:2) {#if linkTags}",
    		ctx
    	});

    	return block;
    }

    // (60:4) {#each linkTags as tag}
    function create_each_block(ctx) {
    	let resulttags;
    	let current;

    	resulttags = new ResultTags({
    			props: { linkTag: /*tag*/ ctx[21] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(resulttags.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(resulttags, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const resulttags_changes = {};
    			if (dirty & /*linkTags*/ 32) resulttags_changes.linkTag = /*tag*/ ctx[21];
    			resulttags.$set(resulttags_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(resulttags.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(resulttags.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(resulttags, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(60:4) {#each linkTags as tag}",
    		ctx
    	});

    	return block;
    }

    // (69:2) {#if context && !context.startsWith(title)}
    function create_if_block_1$9(ctx) {
    	let span0;
    	let t1;
    	let b;
    	let span1;
    	let t2;

    	const block = {
    		c: function create() {
    			span0 = element("span");
    			span0.textContent = "·";
    			t1 = space();
    			b = element("b");
    			span1 = element("span");
    			t2 = text(/*context*/ ctx[3]);
    			attr_dev(span0, "class", "dot svelte-1u1q83x");
    			add_location(span0, file$h, 69, 4, 1723);
    			attr_dev(span1, "class", "context svelte-1u1q83x");
    			add_location(span1, file$h, 69, 34, 1753);
    			add_location(b, file$h, 69, 31, 1750);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, b, anchor);
    			append_dev(b, span1);
    			append_dev(span1, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*context*/ 8) set_data_dev(t2, /*context*/ ctx[3]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(b);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$9.name,
    		type: "if",
    		source: "(69:2) {#if context && !context.startsWith(title)}",
    		ctx
    	});

    	return block;
    }

    // (79:2) {#if linkNote}
    function create_if_block$d(ctx) {
    	let div;
    	let raw_value = /*linkNote*/ ctx[4].replace("\n", "<br>") + "";

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "link_note svelte-1u1q83x");
    			add_location(div, file$h, 79, 4, 2020);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			div.innerHTML = raw_value;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*linkNote*/ 16 && raw_value !== (raw_value = /*linkNote*/ ctx[4].replace("\n", "<br>") + "")) div.innerHTML = raw_value;		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$d.name,
    		type: "if",
    		source: "(79:2) {#if linkNote}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$i(ctx) {
    	let div;
    	let t0;
    	let span1;
    	let t1_value = (/*title*/ ctx[2] || "") + "";
    	let t1;
    	let t2;
    	let show_if = /*context*/ ctx[3] && !/*context*/ ctx[3].startsWith(/*title*/ ctx[2]);
    	let t3;
    	let a;
    	let span0;
    	let t4_value = /*url*/ ctx[1].replace(/^https?:\/\//, "").replace(/\/$/, "") + "";
    	let t4;
    	let t5;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*linkTags*/ ctx[5] && create_if_block_2$3(ctx);
    	let if_block1 = show_if && create_if_block_1$9(ctx);
    	let if_block2 = /*linkNote*/ ctx[4] && create_if_block$d(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			span1 = element("span");
    			t1 = text(t1_value);
    			t2 = space();
    			if (if_block1) if_block1.c();
    			t3 = space();
    			a = element("a");
    			span0 = element("span");
    			t4 = text(t4_value);
    			t5 = space();
    			if (if_block2) if_block2.c();
    			attr_dev(span0, "class", "url svelte-1u1q83x");
    			add_location(span0, file$h, 75, 4, 1913);
    			attr_dev(a, "class", "website svelte-1u1q83x");
    			attr_dev(a, "href", /*url*/ ctx[1]);
    			add_location(a, file$h, 74, 2, 1824);
    			attr_dev(span1, "class", "title svelte-1u1q83x");
    			add_location(span1, file$h, 65, 2, 1594);
    			attr_dev(div, "class", "entry svelte-1u1q83x");
    			add_location(div, file$h, 56, 0, 1361);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block0) if_block0.m(div, null);
    			append_dev(div, t0);
    			append_dev(div, span1);
    			append_dev(span1, t1);
    			append_dev(span1, t2);
    			if (if_block1) if_block1.m(span1, null);
    			append_dev(span1, t3);
    			append_dev(span1, a);
    			append_dev(a, span0);
    			append_dev(span0, t4);
    			append_dev(span1, t5);
    			if (if_block2) if_block2.m(span1, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(a, "click", prevent_default(/*click_handler*/ ctx[12]), false, true, false),
    					listen_dev(div, "click", /*click_handler_1*/ ctx[13], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*linkTags*/ ctx[5]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*linkTags*/ 32) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_2$3(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(div, t0);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if ((!current || dirty & /*title*/ 4) && t1_value !== (t1_value = (/*title*/ ctx[2] || "") + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*context, title*/ 12) show_if = /*context*/ ctx[3] && !/*context*/ ctx[3].startsWith(/*title*/ ctx[2]);

    			if (show_if) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_1$9(ctx);
    					if_block1.c();
    					if_block1.m(span1, t3);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if ((!current || dirty & /*url*/ 2) && t4_value !== (t4_value = /*url*/ ctx[1].replace(/^https?:\/\//, "").replace(/\/$/, "") + "")) set_data_dev(t4, t4_value);

    			if (!current || dirty & /*url*/ 2) {
    				attr_dev(a, "href", /*url*/ ctx[1]);
    			}

    			if (/*linkNote*/ ctx[4]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block$d(ctx);
    					if_block2.c();
    					if_block2.m(span1, null);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$i.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$i($$self, $$props, $$invalidate) {
    	let $loginStore,
    		$$unsubscribe_loginStore = noop$1,
    		$$subscribe_loginStore = () => ($$unsubscribe_loginStore(), $$unsubscribe_loginStore = subscribe(loginStore, $$value => $$invalidate(16, $loginStore = $$value)), loginStore);

    	$$self.$$.on_destroy.push(() => $$unsubscribe_loginStore());
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ResultLink", slots, []);
    	let { store } = $$props;
    	let { loginStore } = $$props;
    	validate_store(loginStore, "loginStore");
    	$$subscribe_loginStore();
    	let { url } = $$props;
    	let { title } = $$props;
    	let { context } = $$props;
    	let { linkNote } = $$props;
    	let { score } = $$props;
    	let { linkTags } = $$props;
    	let { hiddenContext } = $$props;
    	let { githubReference } = $$props;
    	let scoreInfoVisible;

    	function trackClick({ url }) {
    		const { host } = window.location;

    		const clickMetadata = {
    			userIdentity,
    			displayName,
    			ethAddress,
    			host
    		};

    		try {
    			const remoteObject = store.remoteObject("GUISearchObject");
    			remoteObject.call("trackClick", { url, clickMetadata });
    		} catch(e) {
    			console.log(e);
    		}

    		window.location = url;
    	} // setTimeout(() => {
    	//   window.location = url;

    	// }, 2000);
    	function toggleScoreInfo() {
    		scoreInfoVisible = !scoreInfoVisible;
    	}

    	function visit(url) {
    		trackClick({ url });
    		window.location.href = url;
    	}

    	const writable_props = [
    		"store",
    		"loginStore",
    		"url",
    		"title",
    		"context",
    		"linkNote",
    		"score",
    		"linkTags",
    		"hiddenContext",
    		"githubReference"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<ResultLink> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => trackClick({ url });
    	const click_handler_1 = () => visit(url);

    	$$self.$$set = $$props => {
    		if ("store" in $$props) $$invalidate(8, store = $$props.store);
    		if ("loginStore" in $$props) $$subscribe_loginStore($$invalidate(0, loginStore = $$props.loginStore));
    		if ("url" in $$props) $$invalidate(1, url = $$props.url);
    		if ("title" in $$props) $$invalidate(2, title = $$props.title);
    		if ("context" in $$props) $$invalidate(3, context = $$props.context);
    		if ("linkNote" in $$props) $$invalidate(4, linkNote = $$props.linkNote);
    		if ("score" in $$props) $$invalidate(9, score = $$props.score);
    		if ("linkTags" in $$props) $$invalidate(5, linkTags = $$props.linkTags);
    		if ("hiddenContext" in $$props) $$invalidate(10, hiddenContext = $$props.hiddenContext);
    		if ("githubReference" in $$props) $$invalidate(11, githubReference = $$props.githubReference);
    	};

    	$$self.$capture_state = () => ({
    		ResultTags,
    		store,
    		loginStore,
    		url,
    		title,
    		context,
    		linkNote,
    		score,
    		linkTags,
    		hiddenContext,
    		githubReference,
    		scoreInfoVisible,
    		trackClick,
    		toggleScoreInfo,
    		visit,
    		ethAddress,
    		$loginStore,
    		userIdentity,
    		userName,
    		displayName
    	});

    	$$self.$inject_state = $$props => {
    		if ("store" in $$props) $$invalidate(8, store = $$props.store);
    		if ("loginStore" in $$props) $$subscribe_loginStore($$invalidate(0, loginStore = $$props.loginStore));
    		if ("url" in $$props) $$invalidate(1, url = $$props.url);
    		if ("title" in $$props) $$invalidate(2, title = $$props.title);
    		if ("context" in $$props) $$invalidate(3, context = $$props.context);
    		if ("linkNote" in $$props) $$invalidate(4, linkNote = $$props.linkNote);
    		if ("score" in $$props) $$invalidate(9, score = $$props.score);
    		if ("linkTags" in $$props) $$invalidate(5, linkTags = $$props.linkTags);
    		if ("hiddenContext" in $$props) $$invalidate(10, hiddenContext = $$props.hiddenContext);
    		if ("githubReference" in $$props) $$invalidate(11, githubReference = $$props.githubReference);
    		if ("scoreInfoVisible" in $$props) scoreInfoVisible = $$props.scoreInfoVisible;
    		if ("ethAddress" in $$props) ethAddress = $$props.ethAddress;
    		if ("userIdentity" in $$props) $$invalidate(17, userIdentity = $$props.userIdentity);
    		if ("userName" in $$props) $$invalidate(18, userName = $$props.userName);
    		if ("displayName" in $$props) displayName = $$props.displayName;
    	};

    	let ethAddress;
    	let userIdentity;
    	let userName;
    	let displayName;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$loginStore*/ 65536) {
    			 ethAddress = $loginStore.ethAddress; // also present in $store but we use it from frontEnd because it's more immediate -> it will work even if backend is currently disonnected
    		}

    		if ($$self.$$.dirty & /*$loginStore*/ 65536) {
    			 $$invalidate(17, userIdentity = $loginStore.userIdentity);
    		}

    		if ($$self.$$.dirty & /*$loginStore*/ 65536) {
    			 $$invalidate(18, userName = $loginStore.userName);
    		}

    		if ($$self.$$.dirty & /*userName, userIdentity*/ 393216) {
    			// duplicate
    			 displayName = userName || userIdentity;
    		}
    	};

    	return [
    		loginStore,
    		url,
    		title,
    		context,
    		linkNote,
    		linkTags,
    		trackClick,
    		visit,
    		store,
    		score,
    		hiddenContext,
    		githubReference,
    		click_handler,
    		click_handler_1
    	];
    }

    class ResultLink extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$i, create_fragment$i, safe_not_equal, {
    			store: 8,
    			loginStore: 0,
    			url: 1,
    			title: 2,
    			context: 3,
    			linkNote: 4,
    			score: 9,
    			linkTags: 5,
    			hiddenContext: 10,
    			githubReference: 11
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ResultLink",
    			options,
    			id: create_fragment$i.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*store*/ ctx[8] === undefined && !("store" in props)) {
    			console_1$1.warn("<ResultLink> was created without expected prop 'store'");
    		}

    		if (/*loginStore*/ ctx[0] === undefined && !("loginStore" in props)) {
    			console_1$1.warn("<ResultLink> was created without expected prop 'loginStore'");
    		}

    		if (/*url*/ ctx[1] === undefined && !("url" in props)) {
    			console_1$1.warn("<ResultLink> was created without expected prop 'url'");
    		}

    		if (/*title*/ ctx[2] === undefined && !("title" in props)) {
    			console_1$1.warn("<ResultLink> was created without expected prop 'title'");
    		}

    		if (/*context*/ ctx[3] === undefined && !("context" in props)) {
    			console_1$1.warn("<ResultLink> was created without expected prop 'context'");
    		}

    		if (/*linkNote*/ ctx[4] === undefined && !("linkNote" in props)) {
    			console_1$1.warn("<ResultLink> was created without expected prop 'linkNote'");
    		}

    		if (/*score*/ ctx[9] === undefined && !("score" in props)) {
    			console_1$1.warn("<ResultLink> was created without expected prop 'score'");
    		}

    		if (/*linkTags*/ ctx[5] === undefined && !("linkTags" in props)) {
    			console_1$1.warn("<ResultLink> was created without expected prop 'linkTags'");
    		}

    		if (/*hiddenContext*/ ctx[10] === undefined && !("hiddenContext" in props)) {
    			console_1$1.warn("<ResultLink> was created without expected prop 'hiddenContext'");
    		}

    		if (/*githubReference*/ ctx[11] === undefined && !("githubReference" in props)) {
    			console_1$1.warn("<ResultLink> was created without expected prop 'githubReference'");
    		}
    	}

    	get store() {
    		throw new Error("<ResultLink>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set store(value) {
    		throw new Error("<ResultLink>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get loginStore() {
    		throw new Error("<ResultLink>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set loginStore(value) {
    		throw new Error("<ResultLink>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get url() {
    		throw new Error("<ResultLink>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set url(value) {
    		throw new Error("<ResultLink>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get title() {
    		throw new Error("<ResultLink>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<ResultLink>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get context() {
    		throw new Error("<ResultLink>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set context(value) {
    		throw new Error("<ResultLink>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get linkNote() {
    		throw new Error("<ResultLink>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set linkNote(value) {
    		throw new Error("<ResultLink>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get score() {
    		throw new Error("<ResultLink>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set score(value) {
    		throw new Error("<ResultLink>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get linkTags() {
    		throw new Error("<ResultLink>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set linkTags(value) {
    		throw new Error("<ResultLink>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hiddenContext() {
    		throw new Error("<ResultLink>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hiddenContext(value) {
    		throw new Error("<ResultLink>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get githubReference() {
    		throw new Error("<ResultLink>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set githubReference(value) {
    		throw new Error("<ResultLink>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/SearchResults/PlayMedia.svelte generated by Svelte v3.29.0 */
    const file$i = "src/components/SearchResults/PlayMedia.svelte";

    // (15:0) {#if hasPlayer && mediaType == 'music'}
    function create_if_block$e(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "PLAY";
    			attr_dev(button, "class", "svelte-cp7du7");
    			add_location(button, file$i, 15, 2, 339);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[4], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop$1,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$e.name,
    		type: "if",
    		source: "(15:0) {#if hasPlayer && mediaType == 'music'}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$j(ctx) {
    	let if_block_anchor;
    	let if_block = /*hasPlayer*/ ctx[2] && /*mediaType*/ ctx[0] == "music" && create_if_block$e(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*hasPlayer*/ ctx[2] && /*mediaType*/ ctx[0] == "music") {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$e(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop$1,
    		o: noop$1,
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$j.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$j($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("PlayMedia", slots, []);
    	const app = getContext("app");
    	let { mediaType } = $$props;
    	let { playableUrl } = $$props;
    	let { hasPlayer } = $$props;

    	function play(playableUrl) {
    		app.emit("play", { playableUrl });
    	}

    	const writable_props = ["mediaType", "playableUrl", "hasPlayer"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<PlayMedia> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => {
    		play(playableUrl);
    	};

    	$$self.$$set = $$props => {
    		if ("mediaType" in $$props) $$invalidate(0, mediaType = $$props.mediaType);
    		if ("playableUrl" in $$props) $$invalidate(1, playableUrl = $$props.playableUrl);
    		if ("hasPlayer" in $$props) $$invalidate(2, hasPlayer = $$props.hasPlayer);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		app,
    		mediaType,
    		playableUrl,
    		hasPlayer,
    		play
    	});

    	$$self.$inject_state = $$props => {
    		if ("mediaType" in $$props) $$invalidate(0, mediaType = $$props.mediaType);
    		if ("playableUrl" in $$props) $$invalidate(1, playableUrl = $$props.playableUrl);
    		if ("hasPlayer" in $$props) $$invalidate(2, hasPlayer = $$props.hasPlayer);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [mediaType, playableUrl, hasPlayer, play, click_handler];
    }

    class PlayMedia extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$j, create_fragment$j, safe_not_equal, {
    			mediaType: 0,
    			playableUrl: 1,
    			hasPlayer: 2
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PlayMedia",
    			options,
    			id: create_fragment$j.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*mediaType*/ ctx[0] === undefined && !("mediaType" in props)) {
    			console.warn("<PlayMedia> was created without expected prop 'mediaType'");
    		}

    		if (/*playableUrl*/ ctx[1] === undefined && !("playableUrl" in props)) {
    			console.warn("<PlayMedia> was created without expected prop 'playableUrl'");
    		}

    		if (/*hasPlayer*/ ctx[2] === undefined && !("hasPlayer" in props)) {
    			console.warn("<PlayMedia> was created without expected prop 'hasPlayer'");
    		}
    	}

    	get mediaType() {
    		throw new Error("<PlayMedia>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set mediaType(value) {
    		throw new Error("<PlayMedia>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get playableUrl() {
    		throw new Error("<PlayMedia>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set playableUrl(value) {
    		throw new Error("<PlayMedia>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hasPlayer() {
    		throw new Error("<PlayMedia>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hasPlayer(value) {
    		throw new Error("<PlayMedia>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/SearchResults/ResultTypes/ResultSwarm.svelte generated by Svelte v3.29.0 */
    const file$j = "src/components/SearchResults/ResultTypes/ResultSwarm.svelte";

    // (21:0) {#if prettyTime}
    function create_if_block_5(ctx) {
    	let t0;
    	let span;
    	let t1;

    	const block = {
    		c: function create() {
    			t0 = text("·\n  ");
    			span = element("span");
    			t1 = text(/*prettyTime*/ ctx[2]);
    			attr_dev(span, "class", "pretty_time svelte-19g6o1f");
    			add_location(span, file$j, 22, 2, 450);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, span, anchor);
    			append_dev(span, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*prettyTime*/ 4) set_data_dev(t1, /*prettyTime*/ ctx[2]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(21:0) {#if prettyTime}",
    		ctx
    	});

    	return block;
    }

    // (26:0) {#if fileSizePretty}
    function create_if_block_4(ctx) {
    	let t0;
    	let span;
    	let t1;

    	const block = {
    		c: function create() {
    			t0 = text("·\n  ");
    			span = element("span");
    			t1 = text(/*fileSizePretty*/ ctx[7]);
    			attr_dev(span, "class", "file_size svelte-19g6o1f");
    			add_location(span, file$j, 27, 2, 530);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, span, anchor);
    			append_dev(span, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*fileSizePretty*/ 128) set_data_dev(t1, /*fileSizePretty*/ ctx[7]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(26:0) {#if fileSizePretty}",
    		ctx
    	});

    	return block;
    }

    // (31:0) {#if context}
    function create_if_block$f(ctx) {
    	let t0;
    	let span;
    	let t1;

    	function select_block_type(ctx, dirty) {
    		if (/*entryType*/ ctx[3] == "ens") return create_if_block_3$1;
    		return create_else_block$8;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block0 = current_block_type(ctx);
    	let if_block1 = /*entryType*/ ctx[3] != "ens" && create_if_block_2$4(ctx);
    	let if_block2 = /*entryType*/ ctx[3] != "ens" && create_if_block_1$a(ctx);

    	const block = {
    		c: function create() {
    			if_block0.c();
    			t0 = space();
    			span = element("span");
    			if (if_block1) if_block1.c();
    			t1 = text(/*context*/ ctx[5]);
    			if (if_block2) if_block2.c();
    			attr_dev(span, "class", "context svelte-19g6o1f");
    			add_location(span, file$j, 37, 2, 659);
    		},
    		m: function mount(target, anchor) {
    			if_block0.m(target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, span, anchor);
    			if (if_block1) if_block1.m(span, null);
    			append_dev(span, t1);
    			if (if_block2) if_block2.m(span, null);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type !== (current_block_type = select_block_type(ctx))) {
    				if_block0.d(1);
    				if_block0 = current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(t0.parentNode, t0);
    				}
    			}

    			if (/*entryType*/ ctx[3] != "ens") {
    				if (if_block1) ; else {
    					if_block1 = create_if_block_2$4(ctx);
    					if_block1.c();
    					if_block1.m(span, t1);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (dirty & /*context*/ 32) set_data_dev(t1, /*context*/ ctx[5]);

    			if (/*entryType*/ ctx[3] != "ens") {
    				if (if_block2) ; else {
    					if_block2 = create_if_block_1$a(ctx);
    					if_block2.c();
    					if_block2.m(span, null);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if_block0.d(detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(span);
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$f.name,
    		type: "if",
    		source: "(31:0) {#if context}",
    		ctx
    	});

    	return block;
    }

    // (34:2) {:else}
    function create_else_block$8(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("·");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$8.name,
    		type: "else",
    		source: "(34:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (32:2) {#if entryType == 'ens'}
    function create_if_block_3$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("∞");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$1.name,
    		type: "if",
    		source: "(32:2) {#if entryType == 'ens'}",
    		ctx
    	});

    	return block;
    }

    // (38:24) {#if entryType != 'ens'}
    function create_if_block_2$4(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("(");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$4.name,
    		type: "if",
    		source: "(38:24) {#if entryType != 'ens'}",
    		ctx
    	});

    	return block;
    }

    // (38:63) {#if entryType != 'ens'}
    function create_if_block_1$a(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text(")");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$a.name,
    		type: "if",
    		source: "(38:63) {#if entryType != 'ens'}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$k(ctx) {
    	let resulttags;
    	let t0;
    	let a;
    	let b;
    	let t1;
    	let t2;
    	let t3;
    	let t4;
    	let t5;
    	let playmedia;
    	let current;

    	resulttags = new ResultTags({
    			props: {
    				entryType: /*entryType*/ ctx[3],
    				mediaType: /*mediaType*/ ctx[4],
    				resultType: "swarm"
    			},
    			$$inline: true
    		});

    	let if_block0 = /*prettyTime*/ ctx[2] && create_if_block_5(ctx);
    	let if_block1 = /*fileSizePretty*/ ctx[7] && create_if_block_4(ctx);
    	let if_block2 = /*context*/ ctx[5] && create_if_block$f(ctx);

    	playmedia = new PlayMedia({
    			props: {
    				playableUrl: /*playableUrl*/ ctx[0],
    				mediaType: /*mediaType*/ ctx[4],
    				hasPlayer: /*hasPlayer*/ ctx[6]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(resulttags.$$.fragment);
    			t0 = space();
    			a = element("a");
    			b = element("b");
    			t1 = text(/*name*/ ctx[1]);
    			t2 = space();
    			if (if_block0) if_block0.c();
    			t3 = space();
    			if (if_block1) if_block1.c();
    			t4 = space();
    			if (if_block2) if_block2.c();
    			t5 = space();
    			create_component(playmedia.$$.fragment);
    			add_location(b, file$j, 17, 2, 407);
    			attr_dev(a, "href", /*playableUrl*/ ctx[0]);
    			attr_dev(a, "class", "svelte-19g6o1f");
    			add_location(a, file$j, 16, 0, 380);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(resulttags, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, a, anchor);
    			append_dev(a, b);
    			append_dev(b, t1);
    			insert_dev(target, t2, anchor);
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t3, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, t4, anchor);
    			if (if_block2) if_block2.m(target, anchor);
    			insert_dev(target, t5, anchor);
    			mount_component(playmedia, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const resulttags_changes = {};
    			if (dirty & /*entryType*/ 8) resulttags_changes.entryType = /*entryType*/ ctx[3];
    			if (dirty & /*mediaType*/ 16) resulttags_changes.mediaType = /*mediaType*/ ctx[4];
    			resulttags.$set(resulttags_changes);
    			if (!current || dirty & /*name*/ 2) set_data_dev(t1, /*name*/ ctx[1]);

    			if (!current || dirty & /*playableUrl*/ 1) {
    				attr_dev(a, "href", /*playableUrl*/ ctx[0]);
    			}

    			if (/*prettyTime*/ ctx[2]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_5(ctx);
    					if_block0.c();
    					if_block0.m(t3.parentNode, t3);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*fileSizePretty*/ ctx[7]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_4(ctx);
    					if_block1.c();
    					if_block1.m(t4.parentNode, t4);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*context*/ ctx[5]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block$f(ctx);
    					if_block2.c();
    					if_block2.m(t5.parentNode, t5);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			const playmedia_changes = {};
    			if (dirty & /*playableUrl*/ 1) playmedia_changes.playableUrl = /*playableUrl*/ ctx[0];
    			if (dirty & /*mediaType*/ 16) playmedia_changes.mediaType = /*mediaType*/ ctx[4];
    			if (dirty & /*hasPlayer*/ 64) playmedia_changes.hasPlayer = /*hasPlayer*/ ctx[6];
    			playmedia.$set(playmedia_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(resulttags.$$.fragment, local);
    			transition_in(playmedia.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(resulttags.$$.fragment, local);
    			transition_out(playmedia.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(resulttags, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(a);
    			if (detaching) detach_dev(t2);
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t3);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(t4);
    			if (if_block2) if_block2.d(detaching);
    			if (detaching) detach_dev(t5);
    			destroy_component(playmedia, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$k.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$k($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ResultSwarm", slots, []);
    	let { playableUrl } = $$props;
    	let { name } = $$props;
    	let { prettyTime } = $$props;
    	let { entryType } = $$props;
    	let { mediaType } = $$props;
    	let { context } = $$props;
    	let { hasPlayer } = $$props;
    	let { fileSizePretty } = $$props;

    	const writable_props = [
    		"playableUrl",
    		"name",
    		"prettyTime",
    		"entryType",
    		"mediaType",
    		"context",
    		"hasPlayer",
    		"fileSizePretty"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ResultSwarm> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("playableUrl" in $$props) $$invalidate(0, playableUrl = $$props.playableUrl);
    		if ("name" in $$props) $$invalidate(1, name = $$props.name);
    		if ("prettyTime" in $$props) $$invalidate(2, prettyTime = $$props.prettyTime);
    		if ("entryType" in $$props) $$invalidate(3, entryType = $$props.entryType);
    		if ("mediaType" in $$props) $$invalidate(4, mediaType = $$props.mediaType);
    		if ("context" in $$props) $$invalidate(5, context = $$props.context);
    		if ("hasPlayer" in $$props) $$invalidate(6, hasPlayer = $$props.hasPlayer);
    		if ("fileSizePretty" in $$props) $$invalidate(7, fileSizePretty = $$props.fileSizePretty);
    	};

    	$$self.$capture_state = () => ({
    		ResultTags,
    		PlayMedia,
    		playableUrl,
    		name,
    		prettyTime,
    		entryType,
    		mediaType,
    		context,
    		hasPlayer,
    		fileSizePretty
    	});

    	$$self.$inject_state = $$props => {
    		if ("playableUrl" in $$props) $$invalidate(0, playableUrl = $$props.playableUrl);
    		if ("name" in $$props) $$invalidate(1, name = $$props.name);
    		if ("prettyTime" in $$props) $$invalidate(2, prettyTime = $$props.prettyTime);
    		if ("entryType" in $$props) $$invalidate(3, entryType = $$props.entryType);
    		if ("mediaType" in $$props) $$invalidate(4, mediaType = $$props.mediaType);
    		if ("context" in $$props) $$invalidate(5, context = $$props.context);
    		if ("hasPlayer" in $$props) $$invalidate(6, hasPlayer = $$props.hasPlayer);
    		if ("fileSizePretty" in $$props) $$invalidate(7, fileSizePretty = $$props.fileSizePretty);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		playableUrl,
    		name,
    		prettyTime,
    		entryType,
    		mediaType,
    		context,
    		hasPlayer,
    		fileSizePretty
    	];
    }

    class ResultSwarm extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$k, create_fragment$k, safe_not_equal, {
    			playableUrl: 0,
    			name: 1,
    			prettyTime: 2,
    			entryType: 3,
    			mediaType: 4,
    			context: 5,
    			hasPlayer: 6,
    			fileSizePretty: 7
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ResultSwarm",
    			options,
    			id: create_fragment$k.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*playableUrl*/ ctx[0] === undefined && !("playableUrl" in props)) {
    			console.warn("<ResultSwarm> was created without expected prop 'playableUrl'");
    		}

    		if (/*name*/ ctx[1] === undefined && !("name" in props)) {
    			console.warn("<ResultSwarm> was created without expected prop 'name'");
    		}

    		if (/*prettyTime*/ ctx[2] === undefined && !("prettyTime" in props)) {
    			console.warn("<ResultSwarm> was created without expected prop 'prettyTime'");
    		}

    		if (/*entryType*/ ctx[3] === undefined && !("entryType" in props)) {
    			console.warn("<ResultSwarm> was created without expected prop 'entryType'");
    		}

    		if (/*mediaType*/ ctx[4] === undefined && !("mediaType" in props)) {
    			console.warn("<ResultSwarm> was created without expected prop 'mediaType'");
    		}

    		if (/*context*/ ctx[5] === undefined && !("context" in props)) {
    			console.warn("<ResultSwarm> was created without expected prop 'context'");
    		}

    		if (/*hasPlayer*/ ctx[6] === undefined && !("hasPlayer" in props)) {
    			console.warn("<ResultSwarm> was created without expected prop 'hasPlayer'");
    		}

    		if (/*fileSizePretty*/ ctx[7] === undefined && !("fileSizePretty" in props)) {
    			console.warn("<ResultSwarm> was created without expected prop 'fileSizePretty'");
    		}
    	}

    	get playableUrl() {
    		throw new Error("<ResultSwarm>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set playableUrl(value) {
    		throw new Error("<ResultSwarm>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get name() {
    		throw new Error("<ResultSwarm>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<ResultSwarm>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get prettyTime() {
    		throw new Error("<ResultSwarm>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set prettyTime(value) {
    		throw new Error("<ResultSwarm>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get entryType() {
    		throw new Error("<ResultSwarm>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set entryType(value) {
    		throw new Error("<ResultSwarm>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get mediaType() {
    		throw new Error("<ResultSwarm>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set mediaType(value) {
    		throw new Error("<ResultSwarm>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get context() {
    		throw new Error("<ResultSwarm>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set context(value) {
    		throw new Error("<ResultSwarm>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hasPlayer() {
    		throw new Error("<ResultSwarm>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hasPlayer(value) {
    		throw new Error("<ResultSwarm>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fileSizePretty() {
    		throw new Error("<ResultSwarm>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fileSizePretty(value) {
    		throw new Error("<ResultSwarm>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/SearchResults/ResultTypes/ResultFS.svelte generated by Svelte v3.29.0 */
    const file$k = "src/components/SearchResults/ResultTypes/ResultFS.svelte";

    // (49:2) {#if directory != prevDirectory}
    function create_if_block_5$1(ctx) {
    	let div;
    	let span;
    	let t1;

    	function select_block_type(ctx, dirty) {
    		if (/*localResult*/ ctx[11]) return create_if_block_6;
    		return create_else_block$9;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			span = element("span");
    			span.textContent = "📁";
    			t1 = space();
    			if_block.c();
    			attr_dev(span, "class", "icon svelte-9b70tc");
    			add_location(span, file$k, 50, 6, 1335);
    			attr_dev(div, "class", "directory svelte-9b70tc");
    			add_location(div, file$k, 49, 4, 1305);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, span);
    			append_dev(div, t1);
    			if_block.m(div, null);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div, null);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5$1.name,
    		type: "if",
    		source: "(49:2) {#if directory != prevDirectory}",
    		ctx
    	});

    	return block;
    }

    // (59:6) {:else}
    function create_else_block$9(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text(/*directory*/ ctx[1]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*directory*/ 2) set_data_dev(t, /*directory*/ ctx[1]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$9.name,
    		type: "else",
    		source: "(59:6) {:else}",
    		ctx
    	});

    	return block;
    }

    // (55:6) {#if localResult}
    function create_if_block_6(ctx) {
    	let a;
    	let t;
    	let a_href_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			a = element("a");
    			t = text(/*directory*/ ctx[1]);
    			attr_dev(a, "href", a_href_value = `/?place=${/*directoryHandle*/ ctx[2]}`);
    			attr_dev(a, "class", "svelte-9b70tc");
    			add_location(a, file$k, 55, 8, 1577);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, t);

    			if (!mounted) {
    				dispose = listen_dev(a, "click", prevent_default(/*click_handler*/ ctx[14]), false, true, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*directory*/ 2) set_data_dev(t, /*directory*/ ctx[1]);

    			if (dirty & /*directoryHandle*/ 4 && a_href_value !== (a_href_value = `/?place=${/*directoryHandle*/ ctx[2]}`)) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(55:6) {#if localResult}",
    		ctx
    	});

    	return block;
    }

    // (76:4) {#if swarmUrl}
    function create_if_block_4$1(ctx) {
    	let a;
    	let t;

    	const block = {
    		c: function create() {
    			a = element("a");
    			t = text("[ VIA SWARM ]");
    			attr_dev(a, "class", "swarm_url svelte-9b70tc");
    			attr_dev(a, "href", /*swarmUrl*/ ctx[9]);
    			add_location(a, file$k, 76, 6, 1974);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*swarmUrl*/ 512) {
    				attr_dev(a, "href", /*swarmUrl*/ ctx[9]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$1.name,
    		type: "if",
    		source: "(76:4) {#if swarmUrl}",
    		ctx
    	});

    	return block;
    }

    // (80:4) {#if fileSizePretty}
    function create_if_block_3$2(ctx) {
    	let span;
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(/*fileSizePretty*/ ctx[6]);
    			attr_dev(span, "class", "file_size svelte-9b70tc");
    			add_location(span, file$k, 80, 6, 2073);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*fileSizePretty*/ 64) set_data_dev(t, /*fileSizePretty*/ ctx[6]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$2.name,
    		type: "if",
    		source: "(80:4) {#if fileSizePretty}",
    		ctx
    	});

    	return block;
    }

    // (84:4) {#if fileUpdatedAtRelativePretty}
    function create_if_block_2$5(ctx) {
    	let span1;
    	let t0;
    	let span0;
    	let t1;

    	const block = {
    		c: function create() {
    			span1 = element("span");
    			t0 = text("⏱️ ");
    			span0 = element("span");
    			t1 = text(/*fileUpdatedAtRelativePretty*/ ctx[7]);
    			attr_dev(span0, "class", "svelte-9b70tc");
    			add_location(span0, file$k, 84, 39, 2209);
    			attr_dev(span1, "class", "file_updated_at svelte-9b70tc");
    			add_location(span1, file$k, 84, 6, 2176);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span1, anchor);
    			append_dev(span1, t0);
    			append_dev(span1, span0);
    			append_dev(span0, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*fileUpdatedAtRelativePretty*/ 128) set_data_dev(t1, /*fileUpdatedAtRelativePretty*/ ctx[7]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$5.name,
    		type: "if",
    		source: "(84:4) {#if fileUpdatedAtRelativePretty}",
    		ctx
    	});

    	return block;
    }

    // (88:4) {#if fileNote}
    function create_if_block_1$b(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("→");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$b.name,
    		type: "if",
    		source: "(88:4) {#if fileNote}",
    		ctx
    	});

    	return block;
    }

    // (92:4) {#if fileNote}
    function create_if_block$g(ctx) {
    	let div;
    	let a;
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			a = element("a");
    			t = text(/*fileNote*/ ctx[8]);
    			attr_dev(a, "href", /*playableUrl*/ ctx[4]);
    			attr_dev(a, "class", "svelte-9b70tc");
    			add_location(a, file$k, 92, 29, 2356);
    			attr_dev(div, "class", "file_note svelte-9b70tc");
    			add_location(div, file$k, 92, 6, 2333);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, a);
    			append_dev(a, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*fileNote*/ 256) set_data_dev(t, /*fileNote*/ ctx[8]);

    			if (dirty & /*playableUrl*/ 16) {
    				attr_dev(a, "href", /*playableUrl*/ ctx[4]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$g.name,
    		type: "if",
    		source: "(92:4) {#if fileNote}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$l(ctx) {
    	let div1;
    	let t0;
    	let div0;
    	let resulttags;
    	let t1;
    	let a;
    	let t2;
    	let t3;
    	let playmedia;
    	let t4;
    	let t5;
    	let t6;
    	let t7;
    	let t8;
    	let current;
    	let if_block0 = /*directory*/ ctx[1] != /*prevDirectory*/ ctx[3] && create_if_block_5$1(ctx);

    	resulttags = new ResultTags({
    			props: { mediaType: /*mediaType*/ ctx[5] },
    			$$inline: true
    		});

    	playmedia = new PlayMedia({
    			props: {
    				playableUrl: /*playableUrl*/ ctx[4],
    				mediaType: /*mediaType*/ ctx[5],
    				hasPlayer: /*hasPlayer*/ ctx[10]
    			},
    			$$inline: true
    		});

    	let if_block1 = /*swarmUrl*/ ctx[9] && create_if_block_4$1(ctx);
    	let if_block2 = /*fileSizePretty*/ ctx[6] && create_if_block_3$2(ctx);
    	let if_block3 = /*fileUpdatedAtRelativePretty*/ ctx[7] && create_if_block_2$5(ctx);
    	let if_block4 = /*fileNote*/ ctx[8] && create_if_block_1$b(ctx);
    	let if_block5 = /*fileNote*/ ctx[8] && create_if_block$g(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			div0 = element("div");
    			create_component(resulttags.$$.fragment);
    			t1 = space();
    			a = element("a");
    			t2 = text(/*fileName*/ ctx[0]);
    			t3 = space();
    			create_component(playmedia.$$.fragment);
    			t4 = space();
    			if (if_block1) if_block1.c();
    			t5 = space();
    			if (if_block2) if_block2.c();
    			t6 = space();
    			if (if_block3) if_block3.c();
    			t7 = space();
    			if (if_block4) if_block4.c();
    			t8 = space();
    			if (if_block5) if_block5.c();
    			attr_dev(a, "href", /*playableUrl*/ ctx[4]);
    			add_location(a, file$k, 69, 4, 1840);
    			attr_dev(div0, "class", "entry svelte-9b70tc");
    			add_location(div0, file$k, 65, 2, 1782);
    			attr_dev(div1, "class", "wrapper svelte-9b70tc");
    			add_location(div1, file$k, 46, 0, 1221);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			if (if_block0) if_block0.m(div1, null);
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			mount_component(resulttags, div0, null);
    			append_dev(div0, t1);
    			append_dev(div0, a);
    			append_dev(a, t2);
    			append_dev(div0, t3);
    			mount_component(playmedia, div0, null);
    			append_dev(div0, t4);
    			if (if_block1) if_block1.m(div0, null);
    			append_dev(div0, t5);
    			if (if_block2) if_block2.m(div0, null);
    			append_dev(div0, t6);
    			if (if_block3) if_block3.m(div0, null);
    			append_dev(div0, t7);
    			if (if_block4) if_block4.m(div0, null);
    			append_dev(div0, t8);
    			if (if_block5) if_block5.m(div0, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*directory*/ ctx[1] != /*prevDirectory*/ ctx[3]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_5$1(ctx);
    					if_block0.c();
    					if_block0.m(div1, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			const resulttags_changes = {};
    			if (dirty & /*mediaType*/ 32) resulttags_changes.mediaType = /*mediaType*/ ctx[5];
    			resulttags.$set(resulttags_changes);
    			if (!current || dirty & /*fileName*/ 1) set_data_dev(t2, /*fileName*/ ctx[0]);

    			if (!current || dirty & /*playableUrl*/ 16) {
    				attr_dev(a, "href", /*playableUrl*/ ctx[4]);
    			}

    			const playmedia_changes = {};
    			if (dirty & /*playableUrl*/ 16) playmedia_changes.playableUrl = /*playableUrl*/ ctx[4];
    			if (dirty & /*mediaType*/ 32) playmedia_changes.mediaType = /*mediaType*/ ctx[5];
    			if (dirty & /*hasPlayer*/ 1024) playmedia_changes.hasPlayer = /*hasPlayer*/ ctx[10];
    			playmedia.$set(playmedia_changes);

    			if (/*swarmUrl*/ ctx[9]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_4$1(ctx);
    					if_block1.c();
    					if_block1.m(div0, t5);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*fileSizePretty*/ ctx[6]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_3$2(ctx);
    					if_block2.c();
    					if_block2.m(div0, t6);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (/*fileUpdatedAtRelativePretty*/ ctx[7]) {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);
    				} else {
    					if_block3 = create_if_block_2$5(ctx);
    					if_block3.c();
    					if_block3.m(div0, t7);
    				}
    			} else if (if_block3) {
    				if_block3.d(1);
    				if_block3 = null;
    			}

    			if (/*fileNote*/ ctx[8]) {
    				if (if_block4) ; else {
    					if_block4 = create_if_block_1$b(ctx);
    					if_block4.c();
    					if_block4.m(div0, t8);
    				}
    			} else if (if_block4) {
    				if_block4.d(1);
    				if_block4 = null;
    			}

    			if (/*fileNote*/ ctx[8]) {
    				if (if_block5) {
    					if_block5.p(ctx, dirty);
    				} else {
    					if_block5 = create_if_block$g(ctx);
    					if_block5.c();
    					if_block5.m(div0, null);
    				}
    			} else if (if_block5) {
    				if_block5.d(1);
    				if_block5 = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(resulttags.$$.fragment, local);
    			transition_in(playmedia.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(resulttags.$$.fragment, local);
    			transition_out(playmedia.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (if_block0) if_block0.d();
    			destroy_component(resulttags);
    			destroy_component(playmedia);
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			if (if_block3) if_block3.d();
    			if (if_block4) if_block4.d();
    			if (if_block5) if_block5.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$l.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$l($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ResultFS", slots, []);
    	const app = getContext("app");
    	const { dmtJS } = app.deps;
    	const { ansicolor } = dmtJS;
    	let { fileName } = $$props;
    	let { directory } = $$props;
    	let { directoryHandle } = $$props; // for now because we're on localhost and we omit device key from place specifier!
    	let { place } = $$props;
    	let { prevDirectory } = $$props;
    	let { playableUrl } = $$props;
    	let { mediaType } = $$props;
    	let { fileSizePretty } = $$props;
    	let { fileUpdatedAtRelativePretty } = $$props;
    	let { fileNote } = $$props;
    	let { swarmUrl } = $$props;
    	let { hasPlayer } = $$props;
    	let { localResult } = $$props; // remove when browsePlace is implemented for more than just localhost!

    	function browsePlace(place) {
    		app.emit("browse_place", place);
    	}

    	const writable_props = [
    		"fileName",
    		"directory",
    		"directoryHandle",
    		"place",
    		"prevDirectory",
    		"playableUrl",
    		"mediaType",
    		"fileSizePretty",
    		"fileUpdatedAtRelativePretty",
    		"fileNote",
    		"swarmUrl",
    		"hasPlayer",
    		"localResult"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ResultFS> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => browsePlace(directoryHandle);

    	$$self.$$set = $$props => {
    		if ("fileName" in $$props) $$invalidate(0, fileName = $$props.fileName);
    		if ("directory" in $$props) $$invalidate(1, directory = $$props.directory);
    		if ("directoryHandle" in $$props) $$invalidate(2, directoryHandle = $$props.directoryHandle);
    		if ("place" in $$props) $$invalidate(13, place = $$props.place);
    		if ("prevDirectory" in $$props) $$invalidate(3, prevDirectory = $$props.prevDirectory);
    		if ("playableUrl" in $$props) $$invalidate(4, playableUrl = $$props.playableUrl);
    		if ("mediaType" in $$props) $$invalidate(5, mediaType = $$props.mediaType);
    		if ("fileSizePretty" in $$props) $$invalidate(6, fileSizePretty = $$props.fileSizePretty);
    		if ("fileUpdatedAtRelativePretty" in $$props) $$invalidate(7, fileUpdatedAtRelativePretty = $$props.fileUpdatedAtRelativePretty);
    		if ("fileNote" in $$props) $$invalidate(8, fileNote = $$props.fileNote);
    		if ("swarmUrl" in $$props) $$invalidate(9, swarmUrl = $$props.swarmUrl);
    		if ("hasPlayer" in $$props) $$invalidate(10, hasPlayer = $$props.hasPlayer);
    		if ("localResult" in $$props) $$invalidate(11, localResult = $$props.localResult);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		app,
    		dmtJS,
    		ansicolor,
    		ResultTags,
    		PlayMedia,
    		fileName,
    		directory,
    		directoryHandle,
    		place,
    		prevDirectory,
    		playableUrl,
    		mediaType,
    		fileSizePretty,
    		fileUpdatedAtRelativePretty,
    		fileNote,
    		swarmUrl,
    		hasPlayer,
    		localResult,
    		browsePlace
    	});

    	$$self.$inject_state = $$props => {
    		if ("fileName" in $$props) $$invalidate(0, fileName = $$props.fileName);
    		if ("directory" in $$props) $$invalidate(1, directory = $$props.directory);
    		if ("directoryHandle" in $$props) $$invalidate(2, directoryHandle = $$props.directoryHandle);
    		if ("place" in $$props) $$invalidate(13, place = $$props.place);
    		if ("prevDirectory" in $$props) $$invalidate(3, prevDirectory = $$props.prevDirectory);
    		if ("playableUrl" in $$props) $$invalidate(4, playableUrl = $$props.playableUrl);
    		if ("mediaType" in $$props) $$invalidate(5, mediaType = $$props.mediaType);
    		if ("fileSizePretty" in $$props) $$invalidate(6, fileSizePretty = $$props.fileSizePretty);
    		if ("fileUpdatedAtRelativePretty" in $$props) $$invalidate(7, fileUpdatedAtRelativePretty = $$props.fileUpdatedAtRelativePretty);
    		if ("fileNote" in $$props) $$invalidate(8, fileNote = $$props.fileNote);
    		if ("swarmUrl" in $$props) $$invalidate(9, swarmUrl = $$props.swarmUrl);
    		if ("hasPlayer" in $$props) $$invalidate(10, hasPlayer = $$props.hasPlayer);
    		if ("localResult" in $$props) $$invalidate(11, localResult = $$props.localResult);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		fileName,
    		directory,
    		directoryHandle,
    		prevDirectory,
    		playableUrl,
    		mediaType,
    		fileSizePretty,
    		fileUpdatedAtRelativePretty,
    		fileNote,
    		swarmUrl,
    		hasPlayer,
    		localResult,
    		browsePlace,
    		place,
    		click_handler
    	];
    }

    class ResultFS extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$l, create_fragment$l, safe_not_equal, {
    			fileName: 0,
    			directory: 1,
    			directoryHandle: 2,
    			place: 13,
    			prevDirectory: 3,
    			playableUrl: 4,
    			mediaType: 5,
    			fileSizePretty: 6,
    			fileUpdatedAtRelativePretty: 7,
    			fileNote: 8,
    			swarmUrl: 9,
    			hasPlayer: 10,
    			localResult: 11
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ResultFS",
    			options,
    			id: create_fragment$l.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*fileName*/ ctx[0] === undefined && !("fileName" in props)) {
    			console.warn("<ResultFS> was created without expected prop 'fileName'");
    		}

    		if (/*directory*/ ctx[1] === undefined && !("directory" in props)) {
    			console.warn("<ResultFS> was created without expected prop 'directory'");
    		}

    		if (/*directoryHandle*/ ctx[2] === undefined && !("directoryHandle" in props)) {
    			console.warn("<ResultFS> was created without expected prop 'directoryHandle'");
    		}

    		if (/*place*/ ctx[13] === undefined && !("place" in props)) {
    			console.warn("<ResultFS> was created without expected prop 'place'");
    		}

    		if (/*prevDirectory*/ ctx[3] === undefined && !("prevDirectory" in props)) {
    			console.warn("<ResultFS> was created without expected prop 'prevDirectory'");
    		}

    		if (/*playableUrl*/ ctx[4] === undefined && !("playableUrl" in props)) {
    			console.warn("<ResultFS> was created without expected prop 'playableUrl'");
    		}

    		if (/*mediaType*/ ctx[5] === undefined && !("mediaType" in props)) {
    			console.warn("<ResultFS> was created without expected prop 'mediaType'");
    		}

    		if (/*fileSizePretty*/ ctx[6] === undefined && !("fileSizePretty" in props)) {
    			console.warn("<ResultFS> was created without expected prop 'fileSizePretty'");
    		}

    		if (/*fileUpdatedAtRelativePretty*/ ctx[7] === undefined && !("fileUpdatedAtRelativePretty" in props)) {
    			console.warn("<ResultFS> was created without expected prop 'fileUpdatedAtRelativePretty'");
    		}

    		if (/*fileNote*/ ctx[8] === undefined && !("fileNote" in props)) {
    			console.warn("<ResultFS> was created without expected prop 'fileNote'");
    		}

    		if (/*swarmUrl*/ ctx[9] === undefined && !("swarmUrl" in props)) {
    			console.warn("<ResultFS> was created without expected prop 'swarmUrl'");
    		}

    		if (/*hasPlayer*/ ctx[10] === undefined && !("hasPlayer" in props)) {
    			console.warn("<ResultFS> was created without expected prop 'hasPlayer'");
    		}

    		if (/*localResult*/ ctx[11] === undefined && !("localResult" in props)) {
    			console.warn("<ResultFS> was created without expected prop 'localResult'");
    		}
    	}

    	get fileName() {
    		throw new Error("<ResultFS>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fileName(value) {
    		throw new Error("<ResultFS>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get directory() {
    		throw new Error("<ResultFS>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set directory(value) {
    		throw new Error("<ResultFS>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get directoryHandle() {
    		throw new Error("<ResultFS>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set directoryHandle(value) {
    		throw new Error("<ResultFS>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get place() {
    		throw new Error("<ResultFS>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set place(value) {
    		throw new Error("<ResultFS>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get prevDirectory() {
    		throw new Error("<ResultFS>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set prevDirectory(value) {
    		throw new Error("<ResultFS>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get playableUrl() {
    		throw new Error("<ResultFS>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set playableUrl(value) {
    		throw new Error("<ResultFS>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get mediaType() {
    		throw new Error("<ResultFS>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set mediaType(value) {
    		throw new Error("<ResultFS>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fileSizePretty() {
    		throw new Error("<ResultFS>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fileSizePretty(value) {
    		throw new Error("<ResultFS>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fileUpdatedAtRelativePretty() {
    		throw new Error("<ResultFS>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fileUpdatedAtRelativePretty(value) {
    		throw new Error("<ResultFS>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fileNote() {
    		throw new Error("<ResultFS>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fileNote(value) {
    		throw new Error("<ResultFS>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get swarmUrl() {
    		throw new Error("<ResultFS>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set swarmUrl(value) {
    		throw new Error("<ResultFS>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hasPlayer() {
    		throw new Error("<ResultFS>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hasPlayer(value) {
    		throw new Error("<ResultFS>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get localResult() {
    		throw new Error("<ResultFS>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set localResult(value) {
    		throw new Error("<ResultFS>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/SearchResults/ResultTypes/ResultNote.svelte generated by Svelte v3.29.0 */
    const file$l = "src/components/SearchResults/ResultTypes/ResultNote.svelte";

    function create_fragment$m(ctx) {
    	let resulttags;
    	let t0;
    	let a;
    	let t1;
    	let t2;
    	let span;
    	let t3;
    	let t4;
    	let t5;
    	let current;

    	resulttags = new ResultTags({
    			props: { resultType: "note" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(resulttags.$$.fragment);
    			t0 = space();
    			a = element("a");
    			t1 = text(/*notePreview*/ ctx[1]);
    			t2 = space();
    			span = element("span");
    			t3 = text("[");
    			t4 = text(/*noteTags*/ ctx[2]);
    			t5 = text("]");
    			attr_dev(span, "class", "note_tags svelte-16d5mug");
    			add_location(span, file$l, 11, 16, 223);
    			attr_dev(a, "href", /*noteUrl*/ ctx[0]);
    			add_location(a, file$l, 10, 0, 186);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(resulttags, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, a, anchor);
    			append_dev(a, t1);
    			append_dev(a, t2);
    			append_dev(a, span);
    			append_dev(span, t3);
    			append_dev(span, t4);
    			append_dev(span, t5);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*notePreview*/ 2) set_data_dev(t1, /*notePreview*/ ctx[1]);
    			if (!current || dirty & /*noteTags*/ 4) set_data_dev(t4, /*noteTags*/ ctx[2]);

    			if (!current || dirty & /*noteUrl*/ 1) {
    				attr_dev(a, "href", /*noteUrl*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(resulttags.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(resulttags.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(resulttags, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$m.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$m($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ResultNote", slots, []);
    	let { noteUrl } = $$props;
    	let { notePreview } = $$props;
    	let { noteTags } = $$props;
    	const writable_props = ["noteUrl", "notePreview", "noteTags"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ResultNote> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("noteUrl" in $$props) $$invalidate(0, noteUrl = $$props.noteUrl);
    		if ("notePreview" in $$props) $$invalidate(1, notePreview = $$props.notePreview);
    		if ("noteTags" in $$props) $$invalidate(2, noteTags = $$props.noteTags);
    	};

    	$$self.$capture_state = () => ({
    		ResultTags,
    		noteUrl,
    		notePreview,
    		noteTags
    	});

    	$$self.$inject_state = $$props => {
    		if ("noteUrl" in $$props) $$invalidate(0, noteUrl = $$props.noteUrl);
    		if ("notePreview" in $$props) $$invalidate(1, notePreview = $$props.notePreview);
    		if ("noteTags" in $$props) $$invalidate(2, noteTags = $$props.noteTags);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [noteUrl, notePreview, noteTags];
    }

    class ResultNote extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$m, create_fragment$m, safe_not_equal, { noteUrl: 0, notePreview: 1, noteTags: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ResultNote",
    			options,
    			id: create_fragment$m.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*noteUrl*/ ctx[0] === undefined && !("noteUrl" in props)) {
    			console.warn("<ResultNote> was created without expected prop 'noteUrl'");
    		}

    		if (/*notePreview*/ ctx[1] === undefined && !("notePreview" in props)) {
    			console.warn("<ResultNote> was created without expected prop 'notePreview'");
    		}

    		if (/*noteTags*/ ctx[2] === undefined && !("noteTags" in props)) {
    			console.warn("<ResultNote> was created without expected prop 'noteTags'");
    		}
    	}

    	get noteUrl() {
    		throw new Error("<ResultNote>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set noteUrl(value) {
    		throw new Error("<ResultNote>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get notePreview() {
    		throw new Error("<ResultNote>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set notePreview(value) {
    		throw new Error("<ResultNote>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get noteTags() {
    		throw new Error("<ResultNote>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set noteTags(value) {
    		throw new Error("<ResultNote>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/SearchResults/ResultsMetaTop.svelte generated by Svelte v3.29.0 */

    const file$m = "src/components/SearchResults/ResultsMetaTop.svelte";

    // (11:72) {#if meta.contentId}
    function create_if_block$h(ctx) {
    	let t0;
    	let t1_value = /*meta*/ ctx[0].contentId + "";
    	let t1;

    	const block = {
    		c: function create() {
    			t0 = text("/");
    			t1 = text(t1_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*meta*/ 1 && t1_value !== (t1_value = /*meta*/ ctx[0].contentId + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$h.name,
    		type: "if",
    		source: "(11:72) {#if meta.contentId}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$n(ctx) {
    	let div;
    	let span0;
    	let t1;
    	let span1;
    	let t2;
    	let t3_value = /*meta*/ ctx[0].providerHost + "";
    	let t3;
    	let span2;
    	let if_block = /*meta*/ ctx[0].contentId && create_if_block$h(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			span0 = element("span");
    			span0.textContent = "Results from";
    			t1 = space();
    			span1 = element("span");
    			t2 = text("@");
    			t3 = text(t3_value);
    			span2 = element("span");
    			if (if_block) if_block.c();
    			attr_dev(span0, "class", "info svelte-c2g2qf");
    			add_location(span0, file$m, 6, 2, 103);
    			attr_dev(span1, "class", "host svelte-c2g2qf");
    			add_location(span1, file$m, 10, 2, 221);
    			attr_dev(span2, "class", "contentId svelte-c2g2qf");
    			add_location(span2, file$m, 10, 48, 267);
    			attr_dev(div, "class", "provider_host svelte-c2g2qf");
    			add_location(div, file$m, 4, 0, 39);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, span0);
    			append_dev(div, t1);
    			append_dev(div, span1);
    			append_dev(span1, t2);
    			append_dev(span1, t3);
    			append_dev(div, span2);
    			if (if_block) if_block.m(span2, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*meta*/ 1 && t3_value !== (t3_value = /*meta*/ ctx[0].providerHost + "")) set_data_dev(t3, t3_value);

    			if (/*meta*/ ctx[0].contentId) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$h(ctx);
    					if_block.c();
    					if_block.m(span2, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop$1,
    		o: noop$1,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$n.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$n($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ResultsMetaTop", slots, []);
    	let { meta } = $$props;
    	const writable_props = ["meta"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ResultsMetaTop> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("meta" in $$props) $$invalidate(0, meta = $$props.meta);
    	};

    	$$self.$capture_state = () => ({ meta });

    	$$self.$inject_state = $$props => {
    		if ("meta" in $$props) $$invalidate(0, meta = $$props.meta);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [meta];
    }

    class ResultsMetaTop extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$n, create_fragment$n, safe_not_equal, { meta: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ResultsMetaTop",
    			options,
    			id: create_fragment$n.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*meta*/ ctx[0] === undefined && !("meta" in props)) {
    			console.warn("<ResultsMetaTop> was created without expected prop 'meta'");
    		}
    	}

    	get meta() {
    		throw new Error("<ResultsMetaTop>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set meta(value) {
    		throw new Error("<ResultsMetaTop>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/SearchResults/ResultsMetaBottom.svelte generated by Svelte v3.29.0 */
    const file$n = "src/components/SearchResults/ResultsMetaBottom.svelte";

    function create_fragment$o(ctx) {
    	let div;
    	let raw_value = /*displayResultsMeta*/ ctx[1](/*providerResponse*/ ctx[0]) + "";

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "results_meta svelte-1l1lxgb");
    			add_location(div, file$n, 42, 0, 1306);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			div.innerHTML = raw_value;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*providerResponse*/ 1 && raw_value !== (raw_value = /*displayResultsMeta*/ ctx[1](/*providerResponse*/ ctx[0]) + "")) div.innerHTML = raw_value;		},
    		i: noop$1,
    		o: noop$1,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$o.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$o($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ResultsMetaBottom", slots, []);
    	const app = getContext("app");
    	const { dmtJS } = app.deps;
    	const { colorsHTML: colors } = dmtJS;
    	let { providerResponse } = $$props;

    	function displayResultsMeta(providerResponse) {
    		if (providerResponse.error) {
    			return colors.red(`⚠️  Error: ${providerResponse.error}`);
    		}

    		const { meta } = providerResponse;
    		const { page, noMorePages, resultCount, resultsFrom, resultsTo, searchTimePretty, networkTimePretty } = meta;
    		let time = "";

    		if (searchTimePretty) {
    			time += colors.gray(` · ${colors.gray("fs")} ${colors.white(searchTimePretty)}`);
    		}

    		if (networkTimePretty) {
    			time += colors.gray(` · ${colors.gray("network")} ${colors.white(networkTimePretty)}`);
    		}

    		if (resultCount > 0) {
    			if (page == 1 && noMorePages) {
    				return colors.white(`${resultCount} ${resultCount == 1 ? "result" : "results"}${time}`);
    			}

    			const isLastPage = noMorePages ? colors.white(" (last page)") : "";
    			const resultsDescription = `${colors.white(`Results ${resultsFrom} to ${resultsTo}`)}`;
    			return colors.gray(`${colors.white(`Page ${page}`)}${isLastPage} → ${resultsDescription}${time}`);
    		}

    		return colors.gray(`No ${page > 1 ? "more " : ""}results${time}`);
    	}

    	const writable_props = ["providerResponse"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ResultsMetaBottom> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("providerResponse" in $$props) $$invalidate(0, providerResponse = $$props.providerResponse);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		app,
    		dmtJS,
    		colors,
    		providerResponse,
    		displayResultsMeta
    	});

    	$$self.$inject_state = $$props => {
    		if ("providerResponse" in $$props) $$invalidate(0, providerResponse = $$props.providerResponse);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [providerResponse, displayResultsMeta];
    }

    class ResultsMetaBottom extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$o, create_fragment$o, safe_not_equal, { providerResponse: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ResultsMetaBottom",
    			options,
    			id: create_fragment$o.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*providerResponse*/ ctx[0] === undefined && !("providerResponse" in props)) {
    			console.warn("<ResultsMetaBottom> was created without expected prop 'providerResponse'");
    		}
    	}

    	get providerResponse() {
    		throw new Error("<ResultsMetaBottom>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set providerResponse(value) {
    		throw new Error("<ResultsMetaBottom>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/SearchResults/SearchResults.svelte generated by Svelte v3.29.0 */
    const file$o = "src/components/SearchResults/SearchResults.svelte";

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[12] = list[i].filePath;
    	child_ctx[13] = list[i].fileName;
    	child_ctx[14] = list[i].directory;
    	child_ctx[15] = list[i].directoryHandle;
    	child_ctx[16] = list[i].place;
    	child_ctx[17] = list[i].fileNote;
    	child_ctx[18] = list[i].url;
    	child_ctx[19] = list[i].title;
    	child_ctx[20] = list[i].name;
    	child_ctx[21] = list[i].context;
    	child_ctx[22] = list[i].linkNote;
    	child_ctx[23] = list[i].hiddenContext;
    	child_ctx[24] = list[i].githubReference;
    	child_ctx[25] = list[i].score;
    	child_ctx[26] = list[i].swarmBzzHash;
    	child_ctx[27] = list[i].swarmUrl;
    	child_ctx[28] = list[i].mediaType;
    	child_ctx[29] = list[i].entryType;
    	child_ctx[30] = list[i].prettyTime;
    	child_ctx[31] = list[i].filePathANSI;
    	child_ctx[32] = list[i].playableUrl;
    	child_ctx[33] = list[i].fiberContentURL;
    	child_ctx[34] = list[i].fileSizePretty;
    	child_ctx[35] = list[i].fileUpdatedAtRelativePretty;
    	child_ctx[36] = list[i].isNote;
    	child_ctx[37] = list[i].notePreview;
    	child_ctx[38] = list[i].noteUrl;
    	child_ctx[39] = list[i].noteContents;
    	child_ctx[40] = list[i].noteTags;
    	child_ctx[41] = list[i].linkTags;
    	child_ctx[43] = i;
    	return child_ctx;
    }

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[9] = list[i];
    	return child_ctx;
    }

    // (30:0) {:else}
    function create_else_block_2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("machine");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_2.name,
    		type: "else",
    		source: "(30:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (28:0) {#if $searchMode == 0}
    function create_if_block_8(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("network");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_8.name,
    		type: "if",
    		source: "(28:0) {#if $searchMode == 0}",
    		ctx
    	});

    	return block;
    }

    // (53:0) {#if searchResults}
    function create_if_block$i(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_1$c, create_else_block$a];
    	const if_blocks = [];

    	function select_block_type_1(ctx, dirty) {
    		if (/*searchResults*/ ctx[0].error) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type_1(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_1(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$i.name,
    		type: "if",
    		source: "(53:0) {#if searchResults}",
    		ctx
    	});

    	return block;
    }

    // (61:2) {:else}
    function create_else_block$a(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value = /*searchResults*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*searchResults, store, loginStore, hasPlayer*/ 29) {
    				each_value = /*searchResults*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$a.name,
    		type: "else",
    		source: "(61:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (55:2) {#if searchResults.error}
    function create_if_block_1$c(ctx) {
    	let div;
    	let p;
    	let t1;
    	let span0;
    	let t2_value = /*searchResults*/ ctx[0].error.message + "";
    	let t2;
    	let t3;
    	let span1;
    	let raw_value = /*searchResults*/ ctx[0].error.stack.split("\n").join("<br>") + "";

    	const block = {
    		c: function create() {
    			div = element("div");
    			p = element("p");
    			p.textContent = "Search Error in Frontend Code:";
    			t1 = space();
    			span0 = element("span");
    			t2 = text(t2_value);
    			t3 = space();
    			span1 = element("span");
    			add_location(p, file$o, 56, 6, 1598);
    			attr_dev(span0, "class", "svelte-ogrn4i");
    			add_location(span0, file$o, 57, 6, 1642);
    			attr_dev(span1, "class", "svelte-ogrn4i");
    			add_location(span1, file$o, 58, 6, 1691);
    			attr_dev(div, "class", "search_error svelte-ogrn4i");
    			add_location(div, file$o, 55, 4, 1565);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p);
    			append_dev(div, t1);
    			append_dev(div, span0);
    			append_dev(span0, t2);
    			append_dev(div, t3);
    			append_dev(div, span1);
    			span1.innerHTML = raw_value;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*searchResults*/ 1 && t2_value !== (t2_value = /*searchResults*/ ctx[0].error.message + "")) set_data_dev(t2, t2_value);
    			if (dirty[0] & /*searchResults*/ 1 && raw_value !== (raw_value = /*searchResults*/ ctx[0].error.stack.split("\n").join("<br>") + "")) span1.innerHTML = raw_value;		},
    		i: noop$1,
    		o: noop$1,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$c.name,
    		type: "if",
    		source: "(55:2) {#if searchResults.error}",
    		ctx
    	});

    	return block;
    }

    // (65:8) {#if providerResponse.error}
    function create_if_block_7(ctx) {
    	let div1;
    	let resultsmetatop;
    	let t0;
    	let div0;
    	let t1;
    	let span;
    	let t2_value = JSON.stringify(/*providerResponse*/ ctx[9].error) + "";
    	let t2;
    	let current;

    	resultsmetatop = new ResultsMetaTop({
    			props: { meta: /*providerResponse*/ ctx[9].meta },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			create_component(resultsmetatop.$$.fragment);
    			t0 = space();
    			div0 = element("div");
    			t1 = text("Error: ");
    			span = element("span");
    			t2 = text(t2_value);
    			attr_dev(span, "class", "svelte-ogrn4i");
    			add_location(span, file$o, 69, 21, 2052);
    			attr_dev(div0, "class", "result_error svelte-ogrn4i");
    			add_location(div0, file$o, 68, 12, 2004);
    			attr_dev(div1, "class", "results svelte-ogrn4i");
    			add_location(div1, file$o, 65, 10, 1910);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			mount_component(resultsmetatop, div1, null);
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			append_dev(div0, t1);
    			append_dev(div0, span);
    			append_dev(span, t2);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const resultsmetatop_changes = {};
    			if (dirty[0] & /*searchResults*/ 1) resultsmetatop_changes.meta = /*providerResponse*/ ctx[9].meta;
    			resultsmetatop.$set(resultsmetatop_changes);
    			if ((!current || dirty[0] & /*searchResults*/ 1) && t2_value !== (t2_value = JSON.stringify(/*providerResponse*/ ctx[9].error) + "")) set_data_dev(t2, t2_value);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(resultsmetatop.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(resultsmetatop.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_component(resultsmetatop);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7.name,
    		type: "if",
    		source: "(65:8) {#if providerResponse.error}",
    		ctx
    	});

    	return block;
    }

    // (76:8) {#if providerResponse.results && providerResponse.results.length > 0}
    function create_if_block_2$6(ctx) {
    	let div;
    	let resultsmetatop;
    	let t0;
    	let t1;
    	let resultsmetabottom;
    	let t2;
    	let current;

    	resultsmetatop = new ResultsMetaTop({
    			props: { meta: /*providerResponse*/ ctx[9].meta },
    			$$inline: true
    		});

    	let each_value_1 = /*providerResponse*/ ctx[9].results;
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	resultsmetabottom = new ResultsMetaBottom({
    			props: {
    				providerResponse: /*providerResponse*/ ctx[9]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(resultsmetatop.$$.fragment);
    			t0 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t1 = space();
    			create_component(resultsmetabottom.$$.fragment);
    			t2 = space();
    			attr_dev(div, "class", "results svelte-ogrn4i");
    			add_location(div, file$o, 76, 10, 2315);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(resultsmetatop, div, null);
    			append_dev(div, t0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			append_dev(div, t1);
    			mount_component(resultsmetabottom, div, null);
    			append_dev(div, t2);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const resultsmetatop_changes = {};
    			if (dirty[0] & /*searchResults*/ 1) resultsmetatop_changes.meta = /*providerResponse*/ ctx[9].meta;
    			resultsmetatop.$set(resultsmetatop_changes);

    			if (dirty[0] & /*searchResults, store, loginStore, hasPlayer*/ 29) {
    				each_value_1 = /*providerResponse*/ ctx[9].results;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, t1);
    					}
    				}

    				group_outros();

    				for (i = each_value_1.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			const resultsmetabottom_changes = {};
    			if (dirty[0] & /*searchResults*/ 1) resultsmetabottom_changes.providerResponse = /*providerResponse*/ ctx[9];
    			resultsmetabottom.$set(resultsmetabottom_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(resultsmetatop.$$.fragment, local);

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			transition_in(resultsmetabottom.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(resultsmetatop.$$.fragment, local);
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			transition_out(resultsmetabottom.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(resultsmetatop);
    			destroy_each(each_blocks, detaching);
    			destroy_component(resultsmetabottom);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$6.name,
    		type: "if",
    		source: "(76:8) {#if providerResponse.results && providerResponse.results.length > 0}",
    		ctx
    	});

    	return block;
    }

    // (91:16) {:else}
    function create_else_block_1$1(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "Unsupported search results format.";
    			attr_dev(div, "class", "resultError");
    			add_location(div, file$o, 91, 18, 3875);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: noop$1,
    		i: noop$1,
    		o: noop$1,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1$1.name,
    		type: "else",
    		source: "(91:16) {:else}",
    		ctx
    	});

    	return block;
    }

    // (89:33) 
    function create_if_block_6$1(ctx) {
    	let resultnote;
    	let current;

    	resultnote = new ResultNote({
    			props: {
    				noteUrl: /*noteUrl*/ ctx[38],
    				notePreview: /*notePreview*/ ctx[37],
    				noteTags: /*noteTags*/ ctx[40]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(resultnote.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(resultnote, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const resultnote_changes = {};
    			if (dirty[0] & /*searchResults*/ 1) resultnote_changes.noteUrl = /*noteUrl*/ ctx[38];
    			if (dirty[0] & /*searchResults*/ 1) resultnote_changes.notePreview = /*notePreview*/ ctx[37];
    			if (dirty[0] & /*searchResults*/ 1) resultnote_changes.noteTags = /*noteTags*/ ctx[40];
    			resultnote.$set(resultnote_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(resultnote.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(resultnote.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(resultnote, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6$1.name,
    		type: "if",
    		source: "(89:33) ",
    		ctx
    	});

    	return block;
    }

    // (87:35) 
    function create_if_block_5$2(ctx) {
    	let resultfs;
    	let current;

    	resultfs = new ResultFS({
    			props: {
    				playableUrl: /*playableUrl*/ ctx[32],
    				mediaType: /*mediaType*/ ctx[28],
    				fileName: /*fileName*/ ctx[13],
    				hasPlayer: /*hasPlayer*/ ctx[4],
    				prevDirectory: /*i*/ ctx[43] > 0
    				? /*providerResponse*/ ctx[9].results[/*i*/ ctx[43] - 1].directory
    				: null,
    				directory: /*directory*/ ctx[14],
    				directoryHandle: /*directoryHandle*/ ctx[15],
    				place: /*place*/ ctx[16],
    				fileSizePretty: /*fileSizePretty*/ ctx[34],
    				fileUpdatedAtRelativePretty: /*fileUpdatedAtRelativePretty*/ ctx[35],
    				fileNote: /*fileNote*/ ctx[17],
    				swarmUrl: /*swarmUrl*/ ctx[27],
    				localResult: /*providerResponse*/ ctx[9].meta.providerAddress == "localhost"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(resultfs.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(resultfs, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const resultfs_changes = {};
    			if (dirty[0] & /*searchResults*/ 1) resultfs_changes.playableUrl = /*playableUrl*/ ctx[32];
    			if (dirty[0] & /*searchResults*/ 1) resultfs_changes.mediaType = /*mediaType*/ ctx[28];
    			if (dirty[0] & /*searchResults*/ 1) resultfs_changes.fileName = /*fileName*/ ctx[13];
    			if (dirty[0] & /*hasPlayer*/ 16) resultfs_changes.hasPlayer = /*hasPlayer*/ ctx[4];

    			if (dirty[0] & /*searchResults*/ 1) resultfs_changes.prevDirectory = /*i*/ ctx[43] > 0
    			? /*providerResponse*/ ctx[9].results[/*i*/ ctx[43] - 1].directory
    			: null;

    			if (dirty[0] & /*searchResults*/ 1) resultfs_changes.directory = /*directory*/ ctx[14];
    			if (dirty[0] & /*searchResults*/ 1) resultfs_changes.directoryHandle = /*directoryHandle*/ ctx[15];
    			if (dirty[0] & /*searchResults*/ 1) resultfs_changes.place = /*place*/ ctx[16];
    			if (dirty[0] & /*searchResults*/ 1) resultfs_changes.fileSizePretty = /*fileSizePretty*/ ctx[34];
    			if (dirty[0] & /*searchResults*/ 1) resultfs_changes.fileUpdatedAtRelativePretty = /*fileUpdatedAtRelativePretty*/ ctx[35];
    			if (dirty[0] & /*searchResults*/ 1) resultfs_changes.fileNote = /*fileNote*/ ctx[17];
    			if (dirty[0] & /*searchResults*/ 1) resultfs_changes.swarmUrl = /*swarmUrl*/ ctx[27];
    			if (dirty[0] & /*searchResults*/ 1) resultfs_changes.localResult = /*providerResponse*/ ctx[9].meta.providerAddress == "localhost";
    			resultfs.$set(resultfs_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(resultfs.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(resultfs.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(resultfs, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5$2.name,
    		type: "if",
    		source: "(87:35) ",
    		ctx
    	});

    	return block;
    }

    // (85:39) 
    function create_if_block_4$2(ctx) {
    	let resultswarm;
    	let current;

    	resultswarm = new ResultSwarm({
    			props: {
    				name: /*name*/ ctx[20],
    				playableUrl: /*playableUrl*/ ctx[32],
    				mediaType: /*mediaType*/ ctx[28],
    				entryType: /*entryType*/ ctx[29],
    				prettyTime: /*prettyTime*/ ctx[30],
    				fileSizePretty: /*fileSizePretty*/ ctx[34],
    				context: /*context*/ ctx[21],
    				hasPlayer: /*hasPlayer*/ ctx[4]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(resultswarm.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(resultswarm, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const resultswarm_changes = {};
    			if (dirty[0] & /*searchResults*/ 1) resultswarm_changes.name = /*name*/ ctx[20];
    			if (dirty[0] & /*searchResults*/ 1) resultswarm_changes.playableUrl = /*playableUrl*/ ctx[32];
    			if (dirty[0] & /*searchResults*/ 1) resultswarm_changes.mediaType = /*mediaType*/ ctx[28];
    			if (dirty[0] & /*searchResults*/ 1) resultswarm_changes.entryType = /*entryType*/ ctx[29];
    			if (dirty[0] & /*searchResults*/ 1) resultswarm_changes.prettyTime = /*prettyTime*/ ctx[30];
    			if (dirty[0] & /*searchResults*/ 1) resultswarm_changes.fileSizePretty = /*fileSizePretty*/ ctx[34];
    			if (dirty[0] & /*searchResults*/ 1) resultswarm_changes.context = /*context*/ ctx[21];
    			if (dirty[0] & /*hasPlayer*/ 16) resultswarm_changes.hasPlayer = /*hasPlayer*/ ctx[4];
    			resultswarm.$set(resultswarm_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(resultswarm.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(resultswarm.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(resultswarm, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$2.name,
    		type: "if",
    		source: "(85:39) ",
    		ctx
    	});

    	return block;
    }

    // (83:16) {#if url}
    function create_if_block_3$3(ctx) {
    	let resultlink;
    	let current;

    	resultlink = new ResultLink({
    			props: {
    				url: /*url*/ ctx[18],
    				title: /*title*/ ctx[19],
    				context: /*context*/ ctx[21],
    				hiddenContext: /*hiddenContext*/ ctx[23],
    				linkNote: /*linkNote*/ ctx[22],
    				score: /*score*/ ctx[25],
    				linkTags: /*linkTags*/ ctx[41],
    				githubReference: /*githubReference*/ ctx[24],
    				store: /*store*/ ctx[2],
    				loginStore: /*loginStore*/ ctx[3]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(resultlink.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(resultlink, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const resultlink_changes = {};
    			if (dirty[0] & /*searchResults*/ 1) resultlink_changes.url = /*url*/ ctx[18];
    			if (dirty[0] & /*searchResults*/ 1) resultlink_changes.title = /*title*/ ctx[19];
    			if (dirty[0] & /*searchResults*/ 1) resultlink_changes.context = /*context*/ ctx[21];
    			if (dirty[0] & /*searchResults*/ 1) resultlink_changes.hiddenContext = /*hiddenContext*/ ctx[23];
    			if (dirty[0] & /*searchResults*/ 1) resultlink_changes.linkNote = /*linkNote*/ ctx[22];
    			if (dirty[0] & /*searchResults*/ 1) resultlink_changes.score = /*score*/ ctx[25];
    			if (dirty[0] & /*searchResults*/ 1) resultlink_changes.linkTags = /*linkTags*/ ctx[41];
    			if (dirty[0] & /*searchResults*/ 1) resultlink_changes.githubReference = /*githubReference*/ ctx[24];
    			if (dirty[0] & /*store*/ 4) resultlink_changes.store = /*store*/ ctx[2];
    			if (dirty[0] & /*loginStore*/ 8) resultlink_changes.loginStore = /*loginStore*/ ctx[3];
    			resultlink.$set(resultlink_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(resultlink.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(resultlink.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(resultlink, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$3.name,
    		type: "if",
    		source: "(83:16) {#if url}",
    		ctx
    	});

    	return block;
    }

    // (81:12) {#each providerResponse.results as { filePath, fileName, directory, directoryHandle, place, fileNote, url, title, name, context, linkNote, hiddenContext, githubReference, score, swarmBzzHash, swarmUrl, mediaType, entryType, prettyTime, filePathANSI, playableUrl, fiberContentURL, fileSizePretty, fileUpdatedAtRelativePretty, isNote, notePreview, noteUrl, noteContents, noteTags, linkTags }
    function create_each_block_1(ctx) {
    	let div;
    	let current_block_type_index;
    	let if_block;
    	let current;

    	const if_block_creators = [
    		create_if_block_3$3,
    		create_if_block_4$2,
    		create_if_block_5$2,
    		create_if_block_6$1,
    		create_else_block_1$1
    	];

    	const if_blocks = [];

    	function select_block_type_2(ctx, dirty) {
    		if (/*url*/ ctx[18]) return 0;
    		if (/*swarmBzzHash*/ ctx[26]) return 1;
    		if (/*filePath*/ ctx[12]) return 2;
    		if (/*isNote*/ ctx[36]) return 3;
    		return 4;
    	}

    	current_block_type_index = select_block_type_2(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if_block.c();
    			attr_dev(div, "class", "result svelte-ogrn4i");
    			toggle_class(div, "url_result", /*url*/ ctx[18]);
    			add_location(div, file$o, 81, 14, 2933);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if_blocks[current_block_type_index].m(div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_2(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(div, null);
    			}

    			if (dirty[0] & /*searchResults*/ 1) {
    				toggle_class(div, "url_result", /*url*/ ctx[18]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_blocks[current_block_type_index].d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(81:12) {#each providerResponse.results as { filePath, fileName, directory, directoryHandle, place, fileNote, url, title, name, context, linkNote, hiddenContext, githubReference, score, swarmBzzHash, swarmUrl, mediaType, entryType, prettyTime, filePathANSI, playableUrl, fiberContentURL, fileSizePretty, fileUpdatedAtRelativePretty, isNote, notePreview, noteUrl, noteContents, noteTags, linkTags }",
    		ctx
    	});

    	return block;
    }

    // (62:4) {#each searchResults as providerResponse}
    function create_each_block$1(ctx) {
    	let t;
    	let if_block1_anchor;
    	let current;
    	let if_block0 = /*providerResponse*/ ctx[9].error && create_if_block_7(ctx);
    	let if_block1 = /*providerResponse*/ ctx[9].results && /*providerResponse*/ ctx[9].results.length > 0 && create_if_block_2$6(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*providerResponse*/ ctx[9].error) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty[0] & /*searchResults*/ 1) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_7(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(t.parentNode, t);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*providerResponse*/ ctx[9].results && /*providerResponse*/ ctx[9].results.length > 0) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty[0] & /*searchResults*/ 1) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_2$6(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(62:4) {#each searchResults as providerResponse}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$p(ctx) {
    	let div;
    	let t0;
    	let br;
    	let t1;
    	let span;
    	let t2;
    	let t3;
    	let t4;
    	let if_block1_anchor;
    	let current;

    	function select_block_type(ctx, dirty) {
    		if (/*$searchMode*/ ctx[5] == 0) return create_if_block_8;
    		return create_else_block_2;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block0 = current_block_type(ctx);
    	let if_block1 = /*searchResults*/ ctx[0] && create_if_block$i(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text("— NOTHING WAS FOUND — ");
    			br = element("br");
    			t1 = space();
    			span = element("span");
    			t2 = text("Have you tried turning the\n\n");
    			if_block0.c();
    			t3 = text("\n\noff and on again?");
    			t4 = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    			add_location(br, file$o, 25, 75, 822);
    			attr_dev(span, "class", "svelte-ogrn4i");
    			add_location(span, file$o, 25, 145, 892);
    			attr_dev(div, "class", "no_results svelte-ogrn4i");
    			toggle_class(div, "visible", /*noSearchHits*/ ctx[1]);
    			add_location(div, file$o, 25, 0, 747);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, br);
    			append_dev(div, t1);
    			append_dev(div, span);
    			append_dev(span, t2);
    			if_block0.m(span, null);
    			append_dev(span, t3);
    			insert_dev(target, t4, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type !== (current_block_type = select_block_type(ctx))) {
    				if_block0.d(1);
    				if_block0 = current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(span, t3);
    				}
    			}

    			if (dirty[0] & /*noSearchHits*/ 2) {
    				toggle_class(div, "visible", /*noSearchHits*/ ctx[1]);
    			}

    			if (/*searchResults*/ ctx[0]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty[0] & /*searchResults*/ 1) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block$i(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_block0.d();
    			if (detaching) detach_dev(t4);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$p.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$p($$self, $$props, $$invalidate) {
    	let $searchMode;
    	validate_store(searchMode, "searchMode");
    	component_subscribe($$self, searchMode, $$value => $$invalidate(5, $searchMode = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("SearchResults", slots, []);
    	const app = getContext("app");
    	const { dmtJS } = app.deps;
    	let { loggedIn } = $$props;
    	let { searchResults } = $$props;
    	let { noSearchHits } = $$props;
    	let { store } = $$props;
    	let { loginStore } = $$props;
    	let { hasPlayer } = $$props;

    	const writable_props = [
    		"loggedIn",
    		"searchResults",
    		"noSearchHits",
    		"store",
    		"loginStore",
    		"hasPlayer"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SearchResults> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("loggedIn" in $$props) $$invalidate(6, loggedIn = $$props.loggedIn);
    		if ("searchResults" in $$props) $$invalidate(0, searchResults = $$props.searchResults);
    		if ("noSearchHits" in $$props) $$invalidate(1, noSearchHits = $$props.noSearchHits);
    		if ("store" in $$props) $$invalidate(2, store = $$props.store);
    		if ("loginStore" in $$props) $$invalidate(3, loginStore = $$props.loginStore);
    		if ("hasPlayer" in $$props) $$invalidate(4, hasPlayer = $$props.hasPlayer);
    	};

    	$$self.$capture_state = () => ({
    		ResultLink,
    		ResultSwarm,
    		ResultFs: ResultFS,
    		ResultNote,
    		ResultsMetaTop,
    		ResultsMetaBottom,
    		ZetaExplorersInvite,
    		getContext,
    		app,
    		searchMode,
    		dmtJS,
    		loggedIn,
    		searchResults,
    		noSearchHits,
    		store,
    		loginStore,
    		hasPlayer,
    		$searchMode
    	});

    	$$self.$inject_state = $$props => {
    		if ("loggedIn" in $$props) $$invalidate(6, loggedIn = $$props.loggedIn);
    		if ("searchResults" in $$props) $$invalidate(0, searchResults = $$props.searchResults);
    		if ("noSearchHits" in $$props) $$invalidate(1, noSearchHits = $$props.noSearchHits);
    		if ("store" in $$props) $$invalidate(2, store = $$props.store);
    		if ("loginStore" in $$props) $$invalidate(3, loginStore = $$props.loginStore);
    		if ("hasPlayer" in $$props) $$invalidate(4, hasPlayer = $$props.hasPlayer);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		searchResults,
    		noSearchHits,
    		store,
    		loginStore,
    		hasPlayer,
    		$searchMode,
    		loggedIn
    	];
    }

    class SearchResults extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$p,
    			create_fragment$p,
    			safe_not_equal,
    			{
    				loggedIn: 6,
    				searchResults: 0,
    				noSearchHits: 1,
    				store: 2,
    				loginStore: 3,
    				hasPlayer: 4
    			},
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SearchResults",
    			options,
    			id: create_fragment$p.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*loggedIn*/ ctx[6] === undefined && !("loggedIn" in props)) {
    			console.warn("<SearchResults> was created without expected prop 'loggedIn'");
    		}

    		if (/*searchResults*/ ctx[0] === undefined && !("searchResults" in props)) {
    			console.warn("<SearchResults> was created without expected prop 'searchResults'");
    		}

    		if (/*noSearchHits*/ ctx[1] === undefined && !("noSearchHits" in props)) {
    			console.warn("<SearchResults> was created without expected prop 'noSearchHits'");
    		}

    		if (/*store*/ ctx[2] === undefined && !("store" in props)) {
    			console.warn("<SearchResults> was created without expected prop 'store'");
    		}

    		if (/*loginStore*/ ctx[3] === undefined && !("loginStore" in props)) {
    			console.warn("<SearchResults> was created without expected prop 'loginStore'");
    		}

    		if (/*hasPlayer*/ ctx[4] === undefined && !("hasPlayer" in props)) {
    			console.warn("<SearchResults> was created without expected prop 'hasPlayer'");
    		}
    	}

    	get loggedIn() {
    		throw new Error("<SearchResults>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set loggedIn(value) {
    		throw new Error("<SearchResults>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get searchResults() {
    		throw new Error("<SearchResults>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set searchResults(value) {
    		throw new Error("<SearchResults>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get noSearchHits() {
    		throw new Error("<SearchResults>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set noSearchHits(value) {
    		throw new Error("<SearchResults>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get store() {
    		throw new Error("<SearchResults>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set store(value) {
    		throw new Error("<SearchResults>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get loginStore() {
    		throw new Error("<SearchResults>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set loginStore(value) {
    		throw new Error("<SearchResults>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hasPlayer() {
    		throw new Error("<SearchResults>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hasPlayer(value) {
    		throw new Error("<SearchResults>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.29.0 */

    const { console: console_1$2 } = globals;
    const file$p = "src/App.svelte";

    // (339:4) {#if !connected && isLocalhost}
    function create_if_block_3$4(ctx) {
    	let p;
    	let t0;
    	let span;
    	let t2;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t0 = text("⚠️ Please start the ");
    			span = element("span");
    			span.textContent = "dmt-proc";
    			t2 = text(" ...");
    			attr_dev(span, "class", "svelte-a24143");
    			add_location(span, file$p, 340, 28, 10414);
    			attr_dev(p, "class", "connection_status_help svelte-a24143");
    			add_location(p, file$p, 339, 6, 10351);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t0);
    			append_dev(p, span);
    			append_dev(p, t2);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$4.name,
    		type: "if",
    		source: "(339:4) {#if !connected && isLocalhost}",
    		ctx
    	});

    	return block;
    }

    // (345:4) {#if connected}
    function create_if_block_2$7(ctx) {
    	let searchmodeselector;
    	let current;

    	searchmodeselector = new SearchModeSelector({
    			props: { searchQuery: /*searchQuery*/ ctx[5] },
    			$$inline: true
    		});

    	searchmodeselector.$on("searchModeChanged", /*searchModeChanged*/ ctx[24]);

    	const block = {
    		c: function create() {
    			create_component(searchmodeselector.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(searchmodeselector, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const searchmodeselector_changes = {};
    			if (dirty[0] & /*searchQuery*/ 32) searchmodeselector_changes.searchQuery = /*searchQuery*/ ctx[5];
    			searchmodeselector.$set(searchmodeselector_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(searchmodeselector.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(searchmodeselector.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(searchmodeselector, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$7.name,
    		type: "if",
    		source: "(345:4) {#if connected}",
    		ctx
    	});

    	return block;
    }

    // (349:4) {#if errorCode == 'file_not_found'}
    function create_if_block$j(ctx) {
    	let br;
    	let t0;
    	let div;
    	let t1;
    	let if_block = !/*noSearchHits*/ ctx[4] && create_if_block_1$d(ctx);

    	const block = {
    		c: function create() {
    			br = element("br");
    			t0 = space();
    			div = element("div");
    			t1 = text("⚠️ Requested file was renamed or moved ");
    			if (if_block) if_block.c();
    			attr_dev(br, "class", "svelte-a24143");
    			add_location(br, file$p, 349, 6, 10625);
    			attr_dev(div, "class", "error svelte-a24143");
    			add_location(div, file$p, 350, 6, 10636);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, br, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div, anchor);
    			append_dev(div, t1);
    			if (if_block) if_block.m(div, null);
    		},
    		p: function update(ctx, dirty) {
    			if (!/*noSearchHits*/ ctx[4]) {
    				if (if_block) ; else {
    					if_block = create_if_block_1$d(ctx);
    					if_block.c();
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(br);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$j.name,
    		type: "if",
    		source: "(349:4) {#if errorCode == 'file_not_found'}",
    		ctx
    	});

    	return block;
    }

    // (352:47) {#if !noSearchHits}
    function create_if_block_1$d(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("but perhaps one of the following results matches:");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$d.name,
    		type: "if",
    		source: "(352:47) {#if !noSearchHits}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$q(ctx) {
    	let leftbar;
    	let t0;
    	let about;
    	let t1;
    	let main;
    	let login;
    	let t2;
    	let div0;
    	let a;
    	let img0;
    	let img0_src_value;
    	let t3;
    	let connectionstatus;
    	let t4;
    	let nodetagline;
    	let t5;
    	let div2;
    	let div1;
    	let input;
    	let input_disabled_value;
    	let t6;
    	let img1;
    	let img1_src_value;
    	let t7;
    	let t8;
    	let t9;
    	let t10;
    	let searchresults;
    	let current;
    	let mounted;
    	let dispose;

    	leftbar = new LeftBar({
    			props: {
    				connected: /*connected*/ ctx[10],
    				loggedIn: /*loggedIn*/ ctx[15],
    				loginStore: /*loginStore*/ ctx[2],
    				isAdmin: /*isAdmin*/ ctx[20],
    				metamaskConnect: /*metamaskConnect*/ ctx[1],
    				displayName: /*displayName*/ ctx[21],
    				store: /*store*/ ctx[0],
    				searchQuery: /*searchQuery*/ ctx[5],
    				deviceName: /*deviceName*/ ctx[8]
    			},
    			$$inline: true
    		});

    	about = new About({
    			props: {
    				isMobile: /*isMobile*/ ctx[19],
    				searchQuery: /*searchQuery*/ ctx[5],
    				dmtVersion: /*dmtVersion*/ ctx[13]
    			},
    			$$inline: true
    		});

    	login = new Login({
    			props: {
    				connected: /*connected*/ ctx[10],
    				metamaskConnect: /*metamaskConnect*/ ctx[1],
    				ethAddress: /*ethAddress*/ ctx[14],
    				displayName: /*displayName*/ ctx[21],
    				isAdmin: /*isAdmin*/ ctx[20]
    			},
    			$$inline: true
    		});

    	connectionstatus = new ConnectionStatus({
    			props: {
    				connected: /*connected*/ ctx[10],
    				device: /*device*/ ctx[11],
    				isSearching: /*isSearching*/ ctx[3],
    				deviceName: /*deviceName*/ ctx[8]
    			},
    			$$inline: true
    		});

    	nodetagline = new NodeTagline({
    			props: {
    				connected: /*connected*/ ctx[10],
    				searchResults: /*searchResults*/ ctx[9],
    				displayName: /*displayName*/ ctx[21],
    				loggedIn: /*loggedIn*/ ctx[15]
    			},
    			$$inline: true
    		});

    	nodetagline.$on("explorersClick", /*explorersClick*/ ctx[25]);
    	let if_block0 = !/*connected*/ ctx[10] && /*isLocalhost*/ ctx[18] && create_if_block_3$4(ctx);
    	let if_block1 = /*connected*/ ctx[10] && create_if_block_2$7(ctx);
    	let if_block2 = /*errorCode*/ ctx[6] == "file_not_found" && create_if_block$j(ctx);

    	searchresults = new SearchResults({
    			props: {
    				loggedIn: /*loggedIn*/ ctx[15],
    				searchResults: /*searchResults*/ ctx[9],
    				noSearchHits: /*noSearchHits*/ ctx[4],
    				store: /*store*/ ctx[0],
    				loginStore: /*loginStore*/ ctx[2],
    				hasPlayer: /*player*/ ctx[12] && /*player*/ ctx[12].volume != undefined
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(leftbar.$$.fragment);
    			t0 = space();
    			create_component(about.$$.fragment);
    			t1 = space();
    			main = element("main");
    			create_component(login.$$.fragment);
    			t2 = space();
    			div0 = element("div");
    			a = element("a");
    			img0 = element("img");
    			t3 = space();
    			create_component(connectionstatus.$$.fragment);
    			t4 = space();
    			create_component(nodetagline.$$.fragment);
    			t5 = space();
    			div2 = element("div");
    			div1 = element("div");
    			input = element("input");
    			t6 = space();
    			img1 = element("img");
    			t7 = space();
    			if (if_block0) if_block0.c();
    			t8 = space();
    			if (if_block1) if_block1.c();
    			t9 = space();
    			if (if_block2) if_block2.c();
    			t10 = space();
    			create_component(searchresults.$$.fragment);
    			if (img0.src !== (img0_src_value = "/apps/zeta/img/zetaseek_logo.svg?v=2")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "zeta logo");
    			attr_dev(img0, "class", "svelte-a24143");
    			add_location(img0, file$p, 323, 6, 9626);
    			attr_dev(a, "href", "#");
    			attr_dev(a, "class", "svelte-a24143");
    			add_location(a, file$p, 322, 4, 9561);
    			attr_dev(div0, "class", "logo svelte-a24143");
    			add_location(div0, file$p, 321, 2, 9538);
    			attr_dev(input, "id", "search_input");
    			attr_dev(input, "placeholder", /*placeholderText*/ ctx[17]);
    			input.disabled = input_disabled_value = !/*connected*/ ctx[10];
    			attr_dev(input, "class", "svelte-a24143");
    			toggle_class(input, "public_search", /*$searchMode*/ ctx[16] == 0);
    			toggle_class(input, "this_node_search", /*$searchMode*/ ctx[16] == 1);
    			add_location(input, file$p, 334, 6, 9960);
    			if (img1.src !== (img1_src_value = "/apps/zeta/img/redesign/zetaseek_icon-search.svg")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "class", "svelte-a24143");
    			add_location(img1, file$p, 335, 6, 10234);
    			attr_dev(div1, "class", "search_input_wrapper svelte-a24143");
    			add_location(div1, file$p, 333, 4, 9919);
    			attr_dev(div2, "class", "search svelte-a24143");
    			add_location(div2, file$p, 331, 2, 9893);
    			attr_dev(main, "class", "svelte-a24143");
    			add_location(main, file$p, 311, 0, 9338);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(leftbar, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(about, target, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, main, anchor);
    			mount_component(login, main, null);
    			append_dev(main, t2);
    			append_dev(main, div0);
    			append_dev(div0, a);
    			append_dev(a, img0);
    			append_dev(main, t3);
    			mount_component(connectionstatus, main, null);
    			append_dev(main, t4);
    			mount_component(nodetagline, main, null);
    			append_dev(main, t5);
    			append_dev(main, div2);
    			append_dev(div2, div1);
    			append_dev(div1, input);
    			set_input_value(input, /*searchQuery*/ ctx[5]);
    			/*input_binding*/ ctx[30](input);
    			append_dev(div1, t6);
    			append_dev(div1, img1);
    			append_dev(div2, t7);
    			if (if_block0) if_block0.m(div2, null);
    			append_dev(div2, t8);
    			if (if_block1) if_block1.m(div2, null);
    			append_dev(div2, t9);
    			if (if_block2) if_block2.m(div2, null);
    			append_dev(div2, t10);
    			mount_component(searchresults, div2, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(a, "click", prevent_default(/*click_handler*/ ctx[28]), false, true, false),
    					listen_dev(input, "input", /*input_input_handler*/ ctx[29]),
    					listen_dev(input, "keyup", /*searchInputChanged*/ ctx[22], false, false, false),
    					listen_dev(input, "paste", /*searchInputChanged*/ ctx[22], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			const leftbar_changes = {};
    			if (dirty[0] & /*connected*/ 1024) leftbar_changes.connected = /*connected*/ ctx[10];
    			if (dirty[0] & /*loggedIn*/ 32768) leftbar_changes.loggedIn = /*loggedIn*/ ctx[15];
    			if (dirty[0] & /*loginStore*/ 4) leftbar_changes.loginStore = /*loginStore*/ ctx[2];
    			if (dirty[0] & /*metamaskConnect*/ 2) leftbar_changes.metamaskConnect = /*metamaskConnect*/ ctx[1];
    			if (dirty[0] & /*store*/ 1) leftbar_changes.store = /*store*/ ctx[0];
    			if (dirty[0] & /*searchQuery*/ 32) leftbar_changes.searchQuery = /*searchQuery*/ ctx[5];
    			if (dirty[0] & /*deviceName*/ 256) leftbar_changes.deviceName = /*deviceName*/ ctx[8];
    			leftbar.$set(leftbar_changes);
    			const about_changes = {};
    			if (dirty[0] & /*searchQuery*/ 32) about_changes.searchQuery = /*searchQuery*/ ctx[5];
    			if (dirty[0] & /*dmtVersion*/ 8192) about_changes.dmtVersion = /*dmtVersion*/ ctx[13];
    			about.$set(about_changes);
    			const login_changes = {};
    			if (dirty[0] & /*connected*/ 1024) login_changes.connected = /*connected*/ ctx[10];
    			if (dirty[0] & /*metamaskConnect*/ 2) login_changes.metamaskConnect = /*metamaskConnect*/ ctx[1];
    			if (dirty[0] & /*ethAddress*/ 16384) login_changes.ethAddress = /*ethAddress*/ ctx[14];
    			login.$set(login_changes);
    			const connectionstatus_changes = {};
    			if (dirty[0] & /*connected*/ 1024) connectionstatus_changes.connected = /*connected*/ ctx[10];
    			if (dirty[0] & /*device*/ 2048) connectionstatus_changes.device = /*device*/ ctx[11];
    			if (dirty[0] & /*isSearching*/ 8) connectionstatus_changes.isSearching = /*isSearching*/ ctx[3];
    			if (dirty[0] & /*deviceName*/ 256) connectionstatus_changes.deviceName = /*deviceName*/ ctx[8];
    			connectionstatus.$set(connectionstatus_changes);
    			const nodetagline_changes = {};
    			if (dirty[0] & /*connected*/ 1024) nodetagline_changes.connected = /*connected*/ ctx[10];
    			if (dirty[0] & /*searchResults*/ 512) nodetagline_changes.searchResults = /*searchResults*/ ctx[9];
    			if (dirty[0] & /*loggedIn*/ 32768) nodetagline_changes.loggedIn = /*loggedIn*/ ctx[15];
    			nodetagline.$set(nodetagline_changes);

    			if (!current || dirty[0] & /*placeholderText*/ 131072) {
    				attr_dev(input, "placeholder", /*placeholderText*/ ctx[17]);
    			}

    			if (!current || dirty[0] & /*connected*/ 1024 && input_disabled_value !== (input_disabled_value = !/*connected*/ ctx[10])) {
    				prop_dev(input, "disabled", input_disabled_value);
    			}

    			if (dirty[0] & /*searchQuery*/ 32 && input.value !== /*searchQuery*/ ctx[5]) {
    				set_input_value(input, /*searchQuery*/ ctx[5]);
    			}

    			if (dirty[0] & /*$searchMode*/ 65536) {
    				toggle_class(input, "public_search", /*$searchMode*/ ctx[16] == 0);
    			}

    			if (dirty[0] & /*$searchMode*/ 65536) {
    				toggle_class(input, "this_node_search", /*$searchMode*/ ctx[16] == 1);
    			}

    			if (!/*connected*/ ctx[10] && /*isLocalhost*/ ctx[18]) {
    				if (if_block0) ; else {
    					if_block0 = create_if_block_3$4(ctx);
    					if_block0.c();
    					if_block0.m(div2, t8);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*connected*/ ctx[10]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty[0] & /*connected*/ 1024) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_2$7(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div2, t9);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (/*errorCode*/ ctx[6] == "file_not_found") {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block$j(ctx);
    					if_block2.c();
    					if_block2.m(div2, t10);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			const searchresults_changes = {};
    			if (dirty[0] & /*loggedIn*/ 32768) searchresults_changes.loggedIn = /*loggedIn*/ ctx[15];
    			if (dirty[0] & /*searchResults*/ 512) searchresults_changes.searchResults = /*searchResults*/ ctx[9];
    			if (dirty[0] & /*noSearchHits*/ 16) searchresults_changes.noSearchHits = /*noSearchHits*/ ctx[4];
    			if (dirty[0] & /*store*/ 1) searchresults_changes.store = /*store*/ ctx[0];
    			if (dirty[0] & /*loginStore*/ 4) searchresults_changes.loginStore = /*loginStore*/ ctx[2];
    			if (dirty[0] & /*player*/ 4096) searchresults_changes.hasPlayer = /*player*/ ctx[12] && /*player*/ ctx[12].volume != undefined;
    			searchresults.$set(searchresults_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(leftbar.$$.fragment, local);
    			transition_in(about.$$.fragment, local);
    			transition_in(login.$$.fragment, local);
    			transition_in(connectionstatus.$$.fragment, local);
    			transition_in(nodetagline.$$.fragment, local);
    			transition_in(if_block1);
    			transition_in(searchresults.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(leftbar.$$.fragment, local);
    			transition_out(about.$$.fragment, local);
    			transition_out(login.$$.fragment, local);
    			transition_out(connectionstatus.$$.fragment, local);
    			transition_out(nodetagline.$$.fragment, local);
    			transition_out(if_block1);
    			transition_out(searchresults.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(leftbar, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(about, detaching);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(main);
    			destroy_component(login);
    			destroy_component(connectionstatus);
    			destroy_component(nodetagline);
    			/*input_binding*/ ctx[30](null);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			destroy_component(searchresults);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$q.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$q($$self, $$props, $$invalidate) {
    	let $store,
    		$$unsubscribe_store = noop$1,
    		$$subscribe_store = () => ($$unsubscribe_store(), $$unsubscribe_store = subscribe(store, $$value => $$invalidate(34, $store = $$value)), store);

    	let $loginStore,
    		$$unsubscribe_loginStore = noop$1,
    		$$subscribe_loginStore = () => ($$unsubscribe_loginStore(), $$unsubscribe_loginStore = subscribe(loginStore, $$value => $$invalidate(35, $loginStore = $$value)), loginStore);

    	let $searchMode;
    	validate_store(searchMode, "searchMode");
    	component_subscribe($$self, searchMode, $$value => $$invalidate(16, $searchMode = $$value));
    	$$self.$$.on_destroy.push(() => $$unsubscribe_store());
    	$$self.$$.on_destroy.push(() => $$unsubscribe_loginStore());
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	let { store } = $$props;
    	validate_store(store, "store");
    	$$subscribe_store();
    	let { concurrency } = $$props;
    	let { appHelper } = $$props;
    	let { metamaskConnect } = $$props;
    	let { loginStore } = $$props;
    	validate_store(loginStore, "loginStore");
    	$$subscribe_loginStore();
    	setContext("app", appHelper);
    	const { isZetaSeek, isLocalhost, isMobile } = appHelper;
    	const { cssBridge, Escape, executeSearch } = appHelper.deps.dmtJS;

    	appHelper.on("play", ({ playableUrl }) => {
    		console.log(`Loading ${playableUrl} into mpv on localhost ...`);
    		store.remoteObject("GUIPlayerObject").call("playUrl", { playableUrl });
    	});

    	// ---------
    	const searchDelay = isLocalhost ? 50 : 70; // 50 : 400  // zetaseek we spare our own resources and let users wait a little bit so they don't trigger a lot of requests

    	let isSearching;
    	let noSearchHits;
    	let userIdentity = undefined;
    	let userName = undefined;
    	let isAdmin = undefined; // hmm ...
    	let userTeams = undefined; // hmm ...
    	let displayName = undefined;

    	//$: ethAddress = $loginStore.ethAddress; // also present in $store but we use it from frontEnd because it's more immediate -> it will work even if backend is currently disonnected
    	// $: userIdentity = $loginStore.userIdentity;
    	// $: userName = $loginStore.userName;
    	// $: loggedIn = $loginStore.loggedIn;
    	// $: isAdmin = $loginStore.isAdmin; // hmm ...
    	// $: userTeams = $loginStore.userTeams; // hmm ...
    	// // duplicate
    	// $: displayName = userName || userIdentity;
    	store.set({ panels: {} });

    	let searchQuery;
    	let browsePlace;
    	let searchNodes = [];

    	// read browser query strings
    	const { q, place, nodes, error, mode } = lib.parseQuery();

    	let errorCode = error;

    	if (q) {
    		searchQuery = decodeURIComponent(q);
    	}

    	if (place) {
    		browsePlace = decodeURIComponent(place);
    	}

    	if (mode != null) {
    		searchMode.set(mode);
    		localStorage.setItem("searchMode", mode); // override current search mode
    	}

    	if (q || place) {
    		localStorage.removeItem("searchMode"); // reset saved state on links like ?q=abc or ?place=xyz   (where mode is not provided)
    	} else if (localStorage.getItem("searchMode")) {
    		// if no query, place and mode passed in, we utilize searchMode from localstorage if present
    		searchMode.set(parseInt(localStorage.getItem("searchMode")));
    	}

    	// nodes
    	// list of node pubkeys separated by comma
    	if (nodes) {
    		searchNodes = nodes.split(",");
    	}

    	// FIN
    	function updateBrowserQuery() {
    		// console.log("temporarily not updating query string in browser")
    		// return;
    		if (searchQuery) {
    			lib.updateSearchParam("q", searchQuery);
    		} else {
    			lib.updateSearchParam("q"); // delete
    		}

    		if (browsePlace) {
    			lib.updateSearchParam("place", browsePlace);
    		} else {
    			lib.updateSearchParam("place"); // delete
    		}

    		if ($searchMode) {
    			lib.updateSearchParam("mode", $searchMode);
    		} else {
    			lib.updateSearchParam("mode"); // delete
    		}

    		if (searchNodes.length > 0) {
    			lib.updateSearchParam("nodes", searchNodes.join(","));
    		} else {
    			lib.updateSearchParam("nodes"); // delete
    		}
    	}

    	const firstMountAndConnect = concurrency.requireConditions(2, () => {
    		console.log("✓ FIRST STORE CONNECT after MOUNTING the APP ...");

    		if (browsePlace) {
    			_browsePlace(browsePlace);
    		} else {
    			triggerSearch({ force: true });
    		}
    	});

    	store.on("ready", () => {
    		firstMountAndConnect.oneConditionFulfilled();
    	});

    	let searchInput;

    	onMount(() => {
    		if (!isMobile) {
    			// let's not focus on the mobile, users should see the entire page on first visit... there are more important things on it that search itself! :) Maybe on mobile recommend more stuff instead of typing
    			setTimeout(
    				() => {
    					// after the input field is hopefully connected (and thus not :disabled... so that focusing the field will work...)
    					searchInput.focus();
    				},
    				1000
    			);
    		}

    		firstMountAndConnect.oneConditionFulfilled();
    	});

    	const searchOriginHost = window.location.host;

    	function searchMetadata() {
    		return {
    			userIdentity,
    			displayName,
    			ethAddress,
    			searchNodes,
    			searchOriginHost
    		}; // searchNode -- not yet implemented
    	}

    	appHelper.on("browse_place", place => {
    		$$invalidate(5, searchQuery = null);
    		browsePlace = place;
    		updateBrowserQuery();
    		_browsePlace(place);
    	});

    	function _browsePlace(place) {
    		console.log(`Browse place: ${place}`);
    		const remoteObject = store.remoteObject("GUISearchObject");
    		const remoteMethod = "browsePlace";

    		remoteObject.call(remoteMethod, { place, searchMetadata: searchMetadata() }).then(searchResults => {
    			console.log("browsePlace RESULTS:");
    			console.dir(searchResults);
    			store.set({ searchResults });
    		}).catch(e => {
    			store.set({ searchResults: { error: e } });
    		});
    	}

    	let searchTriggerTimeout;

    	function searchInputChanged() {
    		clearTimeout(searchTriggerTimeout);

    		searchTriggerTimeout = setTimeout(
    			() => {
    				console.log("searchInputChanged event received, triggering search ...");
    				triggerSearch({ userActivated: true });
    			},
    			searchQuery.trim() == "" ? 0 : 300
    		); // clear search results immediately, otherwise 50ms delay
    	}

    	function placeSearch(query, { nodes = [], mode = undefined } = {}) {
    		$$invalidate(5, searchQuery = query);
    		searchNodes = nodes;

    		if (mode) {
    			searchMode.set(mode);
    		}

    		setTimeout(
    			() => {
    				triggerSearch({ userActivated: true });
    			},
    			50
    		);
    	}

    	function triggerSearch({ force = false, userActivated = false } = {}) {
    		// BECAUSE IT IS NOT ALWAYS BOUND !! (especially at first load) ... we read it manually ...
    		$$invalidate(5, searchQuery = document.getElementById("search_input").value);

    		browsePlace = null;

    		// we have to do this because <svelte head> is static -- only on first load! -- (?)
    		if (searchQuery) {
    			document.title = `${searchQuery} — zetaseek`;

    			if (window.screen.width > 768) {
    				document.body.classList.add("darken");
    			}
    		} else {
    			document.body.classList.remove("darken");
    			document.title = "ZetaSeek Engine";
    		}

    		console.log(`triggerSearch: ${searchQuery}`);
    		const remoteObject = store.remoteObject("GUISearchObject");
    		const remoteMethod = "search";

    		const searchStatusCallback = ({ searching, noHits }) => {
    			$$invalidate(3, isSearching = searching);
    			$$invalidate(4, noSearchHits = noHits);
    		};

    		// remove error after first user input
    		if (userActivated && errorCode) {
    			$$invalidate(6, errorCode = undefined);
    			lib.updateSearchParam("error"); // delete
    		}

    		if (searchQuery == null) {
    			console.log("Warning: null SEARCH QUERY !!! Should not hapen. There is a bug probably in GUI code");
    		}

    		updateBrowserQuery();

    		executeSearch({
    			searchQuery,
    			searchMode: $searchMode,
    			remoteObject,
    			remoteMethod,
    			searchStatusCallback,
    			searchDelay,
    			force,
    			searchMetadata: searchMetadata()
    		}).then(searchResults => {
    			console.log("SEARCH RESULTS:");
    			console.dir(searchResults);
    			store.set({ searchResults, searchQuery }); // searchQuery --> only used in search results to show "BANNER"
    		}).catch(e => {
    			// console.log('SEARCH ERROR:');
    			// console.log(e);
    			store.set({ searchResults: { error: e } });
    		});
    	}

    	function goHome() {
    		doSearch("");

    		if (!isMobile) {
    			searchInput.focus();
    		}
    	}

    	function doSearch(query) {
    		document.getElementById("search_input").value = query; // clear input field (searchQuery is bound at should change automatically)
    		triggerSearch(); // clear search results
    	}

    	function searchModeChanged() {
    		if (!isMobile) {
    			searchInput.focus();
    		}

    		triggerSearch({ userActivated: true });
    	}

    	function explorersClick() {
    		placeSearch("explorers", { mode: 1 });
    	}

    	appHelper.on("explorersClick", explorersClick);
    	appHelper.on("search", doSearch);
    	const writable_props = ["store", "concurrency", "appHelper", "metamaskConnect", "loginStore"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$2.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => {
    		goHome();
    	};

    	function input_input_handler() {
    		searchQuery = this.value;
    		$$invalidate(5, searchQuery);
    	}

    	function input_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			searchInput = $$value;
    			$$invalidate(7, searchInput);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("store" in $$props) $$subscribe_store($$invalidate(0, store = $$props.store));
    		if ("concurrency" in $$props) $$invalidate(26, concurrency = $$props.concurrency);
    		if ("appHelper" in $$props) $$invalidate(27, appHelper = $$props.appHelper);
    		if ("metamaskConnect" in $$props) $$invalidate(1, metamaskConnect = $$props.metamaskConnect);
    		if ("loginStore" in $$props) $$subscribe_loginStore($$invalidate(2, loginStore = $$props.loginStore));
    	};

    	$$self.$capture_state = () => ({
    		Url: lib,
    		onMount,
    		setContext,
    		About,
    		Login,
    		LeftBar,
    		ConnectionStatus,
    		NodeTagline,
    		SearchModeSelector,
    		SearchResults,
    		searchMode,
    		store,
    		concurrency,
    		appHelper,
    		metamaskConnect,
    		loginStore,
    		isZetaSeek,
    		isLocalhost,
    		isMobile,
    		cssBridge,
    		Escape,
    		executeSearch,
    		searchDelay,
    		isSearching,
    		noSearchHits,
    		userIdentity,
    		userName,
    		isAdmin,
    		userTeams,
    		displayName,
    		searchQuery,
    		browsePlace,
    		searchNodes,
    		q,
    		place,
    		nodes,
    		error,
    		mode,
    		errorCode,
    		updateBrowserQuery,
    		firstMountAndConnect,
    		searchInput,
    		searchOriginHost,
    		searchMetadata,
    		_browsePlace,
    		searchTriggerTimeout,
    		searchInputChanged,
    		placeSearch,
    		triggerSearch,
    		goHome,
    		doSearch,
    		searchModeChanged,
    		explorersClick,
    		deviceName,
    		$store,
    		searchResults,
    		connected,
    		device,
    		player,
    		dmtVersion,
    		ethAddress,
    		$loginStore,
    		loggedIn,
    		$searchMode,
    		placeholderText
    	});

    	$$self.$inject_state = $$props => {
    		if ("store" in $$props) $$subscribe_store($$invalidate(0, store = $$props.store));
    		if ("concurrency" in $$props) $$invalidate(26, concurrency = $$props.concurrency);
    		if ("appHelper" in $$props) $$invalidate(27, appHelper = $$props.appHelper);
    		if ("metamaskConnect" in $$props) $$invalidate(1, metamaskConnect = $$props.metamaskConnect);
    		if ("loginStore" in $$props) $$subscribe_loginStore($$invalidate(2, loginStore = $$props.loginStore));
    		if ("isSearching" in $$props) $$invalidate(3, isSearching = $$props.isSearching);
    		if ("noSearchHits" in $$props) $$invalidate(4, noSearchHits = $$props.noSearchHits);
    		if ("userIdentity" in $$props) userIdentity = $$props.userIdentity;
    		if ("userName" in $$props) userName = $$props.userName;
    		if ("isAdmin" in $$props) $$invalidate(20, isAdmin = $$props.isAdmin);
    		if ("userTeams" in $$props) userTeams = $$props.userTeams;
    		if ("displayName" in $$props) $$invalidate(21, displayName = $$props.displayName);
    		if ("searchQuery" in $$props) $$invalidate(5, searchQuery = $$props.searchQuery);
    		if ("browsePlace" in $$props) browsePlace = $$props.browsePlace;
    		if ("searchNodes" in $$props) searchNodes = $$props.searchNodes;
    		if ("errorCode" in $$props) $$invalidate(6, errorCode = $$props.errorCode);
    		if ("searchInput" in $$props) $$invalidate(7, searchInput = $$props.searchInput);
    		if ("searchTriggerTimeout" in $$props) searchTriggerTimeout = $$props.searchTriggerTimeout;
    		if ("deviceName" in $$props) $$invalidate(8, deviceName = $$props.deviceName);
    		if ("searchResults" in $$props) $$invalidate(9, searchResults = $$props.searchResults);
    		if ("connected" in $$props) $$invalidate(10, connected = $$props.connected);
    		if ("device" in $$props) $$invalidate(11, device = $$props.device);
    		if ("player" in $$props) $$invalidate(12, player = $$props.player);
    		if ("dmtVersion" in $$props) $$invalidate(13, dmtVersion = $$props.dmtVersion);
    		if ("ethAddress" in $$props) $$invalidate(14, ethAddress = $$props.ethAddress);
    		if ("loggedIn" in $$props) $$invalidate(15, loggedIn = $$props.loggedIn);
    		if ("placeholderText" in $$props) $$invalidate(17, placeholderText = $$props.placeholderText);
    	};

    	let deviceName;
    	let searchResults;
    	let connected;
    	let device;
    	let player;
    	let dmtVersion;
    	let ethAddress;
    	let loggedIn;
    	let placeholderText;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[1] & /*$store*/ 8) {
    			// if (isZetaSeek) {
    			//   cssBridge.setWallpaper('/apps/zeta/wallpapers/hilly_dark_forest_river_fog.jpg');
    			// } else {
    			//   cssBridge.setWallpaper('/apps/zeta/wallpapers/black_triangles.jpg');
    			//}
    			 $$invalidate(8, deviceName = $store.deviceName);
    		}

    		if ($$self.$$.dirty[1] & /*$store*/ 8) {
    			 $$invalidate(9, searchResults = $store.searchResults);
    		}

    		if ($$self.$$.dirty[1] & /*$store*/ 8) {
    			 $$invalidate(10, connected = $store.connected);
    		}

    		if ($$self.$$.dirty[1] & /*$store*/ 8) {
    			 $$invalidate(11, device = $store.device);
    		}

    		if ($$self.$$.dirty[1] & /*$store*/ 8) {
    			 $$invalidate(12, player = $store.player);
    		}

    		if ($$self.$$.dirty[0] & /*device*/ 2048) {
    			 $$invalidate(13, dmtVersion = device ? device.dmtVersion : null);
    		}

    		if ($$self.$$.dirty[1] & /*$loginStore*/ 16) {
    			 $$invalidate(14, ethAddress = $loginStore.ethAddress);
    		}

    		if ($$self.$$.dirty[1] & /*$loginStore*/ 16) {
    			 $$invalidate(15, loggedIn = $loginStore.ethAddress);
    		}

    		if ($$self.$$.dirty[0] & /*connected, $searchMode*/ 66560) {
    			 $$invalidate(17, placeholderText = !connected
    			? "Search is currently not available"
    			: $searchMode == 0
    				? "Zeta network search"
    				: "This machine search");
    		}
    	};

    	return [
    		store,
    		metamaskConnect,
    		loginStore,
    		isSearching,
    		noSearchHits,
    		searchQuery,
    		errorCode,
    		searchInput,
    		deviceName,
    		searchResults,
    		connected,
    		device,
    		player,
    		dmtVersion,
    		ethAddress,
    		loggedIn,
    		$searchMode,
    		placeholderText,
    		isLocalhost,
    		isMobile,
    		isAdmin,
    		displayName,
    		searchInputChanged,
    		goHome,
    		searchModeChanged,
    		explorersClick,
    		concurrency,
    		appHelper,
    		click_handler,
    		input_input_handler,
    		input_binding
    	];
    }

    class App$1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$q,
    			create_fragment$q,
    			safe_not_equal,
    			{
    				store: 0,
    				concurrency: 26,
    				appHelper: 27,
    				metamaskConnect: 1,
    				loginStore: 2
    			},
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$q.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*store*/ ctx[0] === undefined && !("store" in props)) {
    			console_1$2.warn("<App> was created without expected prop 'store'");
    		}

    		if (/*concurrency*/ ctx[26] === undefined && !("concurrency" in props)) {
    			console_1$2.warn("<App> was created without expected prop 'concurrency'");
    		}

    		if (/*appHelper*/ ctx[27] === undefined && !("appHelper" in props)) {
    			console_1$2.warn("<App> was created without expected prop 'appHelper'");
    		}

    		if (/*metamaskConnect*/ ctx[1] === undefined && !("metamaskConnect" in props)) {
    			console_1$2.warn("<App> was created without expected prop 'metamaskConnect'");
    		}

    		if (/*loginStore*/ ctx[2] === undefined && !("loginStore" in props)) {
    			console_1$2.warn("<App> was created without expected prop 'loginStore'");
    		}
    	}

    	get store() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set store(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get concurrency() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set concurrency(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get appHelper() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set appHelper(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get metamaskConnect() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set metamaskConnect(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get loginStore() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set loginStore(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    // we import dmtJS and connectome stores only here !

    const { metamask: metamask$1 } = dmtJS;

    appHelper.deps = { dmtJS };

    const { LogStore: LogStore$1 } = stores;

    const { metamaskInit: metamaskInit$1 } = metamask$1;

    const port = appHelper.ssl ? '/ws' : 7780; // hackish ?
    const protocol = 'zeta';
    const lane = 'gui';

    const logStore = new LogStore$1();

    // source: https://stackoverflow.com/a/9216488
    const log$2 = console.log.bind(console);
    console.log = (...args) => {
      logStore.addToLog({ origConsoleLog: log$2, limit: 100 }, ...args);
      log$2(...args);
    };

    const verbose = false;
    const address = window.location.hostname;

    const rpcRequestTimeout = 5500; // 500ms more than default so that if any underlying request time outs, we still get that info to the frontent (otherwise this request would time-out as well)
    // todo: what if default changes ? we should somehow add 500ms to default... or specify hopNumber which decreases as we nest searches... current hop is multiplied by 500ms to allow for underlying timeouts
    const store = new ConnectedStore({
      address,
      port,
      ssl: appHelper.ssl, // IT IS USED!!! not used yet.. use this only if we connect directly to our process and not via lighttpd /ws proxy
      protocol,
      lane,
      rpcRequestTimeout,
      verbose
    });

    const loginStore = writable({});

    const metamaskConnect$1 = metamaskInit$1(ethAddress => {
      // main place where we get always current connected account!
      // should be in sync with metamask state
      console.log(`Connected ethereum address: ${ethAddress}`);

      loginStore.set({ ethAddress });

      //loginStore.login(ethAddress);
      //old code
      //this.emitProgramEvent('zeta::login', { ...identity, ...data });

      // also reconnects are handled here
      // this.on('connected', () => {
      //   const { ethAddress } = this.loginStore.get();

      //   if (ethAddress) {
      //     //console.log(`AAAAA ${ethAddress}`);
      //     this.loginAddress(ethAddress);
      //   }
      // });

      // loginStore.on('metamask_login', ethAddress => {
      //   if (this.connected) {
      //     //console.log(`BBBBB ${ethAddress}`);
      //     this.loginAddress(ethAddress);
      //   }
      // });
    });

    const app = new App$1({
      target: document.body,
      props: {
        store,
        loginStore,
        concurrency,
        appHelper,
        metamaskConnect: metamaskConnect$1
      }
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
