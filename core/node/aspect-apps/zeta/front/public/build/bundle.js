var app = (function (crypto) {
    'use strict';

    crypto = crypto && Object.prototype.hasOwnProperty.call(crypto, 'default') ? crypto['default'] : crypto;

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

    var cssBridge = new CssBridge();

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

    let id = 0;
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
          const eev = fn._eev || (fn._eev = ++id);

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

    // not used a lot -- extending Emitter is not crucial, we use it sometimes for custom events on stores (example: logStore when new entry is added... so we can scroll the textarea to bottom)
    class Store extends Eev {
      constructor() {
        // initState = {}
        super();

        this.state = {};

        this.subscriptions = [];

        //this.set(initState);
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

      // boilerplate
      subscribe(callback) {
        // todo check if the same ID already exists ... small chance but still ;)
        const subscriptionId = Math.random();

        this.subscriptions.push({ subscriptionId, callback });

        callback(this.state);

        return () => {
          this.subscriptions.forEach((el, index) => {
            if (el.subscriptionId == subscriptionId) {
              this.subscriptions.splice(index, 1);
            }
          });
        };
      }

      pushStateToSubscribers() {
        this.subscriptions.forEach(sub => sub.callback(this.state));
      }
    }

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

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function commonjsRequire () {
    	throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
    }

    function createCommonjsModule(fn, module) {
    	return module = { exports: {} }, fn(module, module.exports), module.exports;
    }

    function getCjsExportFromNamespace (n) {
    	return n && n['default'] || n;
    }

    var _nodeResolve_empty = {};

    var _nodeResolve_empty$1 = /*#__PURE__*/Object.freeze({
        __proto__: null,
        'default': _nodeResolve_empty
    });

    var require$$0 = getCjsExportFromNamespace(_nodeResolve_empty$1);

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
          carry = (x[j] + 128) >> 8;
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
      var i, mlen;
      var t = new Uint8Array(32), h = new Uint8Array(64);
      var p = [gf(), gf(), gf(), gf()],
          q = [gf(), gf(), gf(), gf()];

      mlen = -1;
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
      mlen = n;
      return mlen;
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
      crypto_hash_BYTES: crypto_hash_BYTES
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
        if (!(/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(s))) {
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

    function noop$1() {}

    class RunnableLink$1 {
      constructor(prev, next, fn) {
        this.prev = prev;
        this.next = next;
        this.fn = fn || noop$1;
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

    let id$1 = 0;
    const splitter$1 = /[\s,]+/g;

    // A link in the linked list which allows
    // for efficient execution of the callbacks

    class Eev$1 {
      constructor() {
        this.events = {};
      }

      on(names, fn) {
        const me = this;

        names.split(splitter$1).forEach(name => {
          const list = me.events[name] || (me.events[name] = new LinkedList$1());
          const eev = fn._eev || (fn._eev = ++id$1);

          list.reg[eev] || (list.reg[eev] = list.insert(fn));
        });
      }

      off(names, fn) {
        const me = this;
        fn &&
          names.split(splitter$1).forEach(function(name) {
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

    function log(msg) {
      console.log(`${new Date().toLocaleString()} → ${msg}`);
    }

    function listify(obj) {
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

    const nullNonce = new Uint8Array(new ArrayBuffer(24), 0);

    function send({ data, connector }) {
      if (isObject(data)) {
        data = JSON.stringify(data);
      }

      if (connector.isConnected()) {
        if (connector.sentCounter > 1) {
          // we don't encrypt first two messags (RPC: exchangePubkeys and exchangePubkeys::ACK)

          let flag = 0; // binary

          if (typeof data == 'string') {
            flag = 1; // string
          }

          const _encodedMessage = flag == 1 ? naclFast.util.decodeUTF8(data) : data; // binary data (file stream...)
          const encodedMessage = addHeader(_encodedMessage, flag);

          const encryptedMessage = naclFast.secretbox(encodedMessage, nullNonce, connector.sharedSecret);

          if (connector.verbose) {
            console.log('Sending encrypted data:');
            console.log(data);
          }

          connector.connection.websocket.send(encryptedMessage);
        } else {
          if (connector.verbose) {
            console.log('Sending plain-text data:');
            console.log(data);
          }

          connector.connection.websocket.send(data);
        }
        connector.sentCounter += 1;
      } else {
        console.log(`Warning: "${data}" was not sent because the store is not yet connected to the backend`);
        // TODO: check if it's better to pass on the "log" function from establishAndMaintainConnection
      }
    }

    naclFast.util = naclUtil;

    const nullNonce$1 = new Uint8Array(new ArrayBuffer(24), 0);

    function isRpcCallResult(jsonData) {
      return Object.keys(jsonData).includes('result') || Object.keys(jsonData).includes('error');
    }

    function wireReceive({ jsonData, encryptedData, rawMessage, wasEncrypted, connector }) {
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
          connector.emit('wire_receive', { jsonData, rawMessage });
        }
      } else if (encryptedData) {
        if (connector.verbose == 'extra') {
          console.log('Received bytes:');
          console.log(encryptedData);
          console.log(`Decrypting with shared secret ${connector.sharedSecret}...`);
        }

        // we assume connector.sharedSecret exists and was successful
        // OPEN QUESTION :: binaryData can be both: encryptedData or actual binaryData.. if we always encrypt we can solve the dilemma
        const _decryptedMessage = naclFast.secretbox.open(encryptedData, nullNonce$1, connector.sharedSecret);

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

            //if (jsonData) {
            if (jsonData.jsonrpc) {
              if (connector.verbose) {
                console.log('Received and decrypted rpc result:');
                console.log(jsonData);
              }

              connector.wireReceive({ jsonData, rawMessage: decodedMessage, wasEncrypted: true }); // recursive: will call rpcClient as before
            } else if (jsonData.tag) {
              const msg = jsonData;

              if (msg.tag == 'binary_start') {
                //console.log(`received binary_start from (remote) content server, sessionId: ${msg.sessionId}`);
                connector.emit(msg.tag, { ...msg, ...{ tag: undefined } });
              } else if (msg.tag == 'binary_end') {
                //console.log(`fiberConnection: received binary_end from (remote) content server, sessionId: ${msg.sessionId}`);
                connector.emit(msg.tag, { sessionId: msg.sessionId });
              } else {
                connector.emit('wire_receive', { jsonData, rawMessage: decodedMessage });
              }
            } else {
              connector.emit('wire_receive', { jsonData, rawMessage: decodedMessage });
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

        //connector.emit('wire_receive', { jsonData, binaryData, rawMessage });
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

      async registerTransport(transport) {
        await transport.onData(this._processRequest.bind(this, transport));
      }

      async removeTransport(transport) {
        await transport.shutdown(); // TODO
      }

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

      async run() {
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
      constructor(message) {
        super({
          code: -32001,
          message: `Request exceeded maximum execution time ${message}`
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
        await this._init();

        const method = this.methodPrefix ? `${this.methodPrefix}::${methodName}` : methodName;

        const request = this._makeRequestObject({ method, params });
        return this._sendRequest({ object: request, id: request.id });
      }

      async notify(method, params) {
        await this._init();

        const request = this._makeRequestObject({ method, params, mode: 'notify' });
        await this.transport.sendData(JSON.stringify(request));
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

      async _init() {
        if (this.initialized) return;

        await this.transport.onData(this._processResponse.bind(this));

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

              reject(new X.RequestTimeout(data));
            }
          }, this.requestTimeout);

          return this.transport.sendData(data).catch(error => {
            delete this.pendingRequest[id];
            reject(error); // TODO new X.InternalError() <--- ??
            //reject(new X.InternalError());
          });
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

      async onData(callback) {
        this.channel.on('json_rpc', callback);
      }

      async sendData(data) {
        await this.channel.send(data);
      }
    }

    class TransportServerChannel {
      constructor(channel) {
        this.channel = channel;
      }

      async onData(callback) {
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
      constructor(connectorOrServersideChannel, methodPrefix) {
        this.moleChannel = new Channel(connectorOrServersideChannel);
        this.methodPrefix = methodPrefix;

        this.connectorOrServersideChannel = connectorOrServersideChannel;

        this.client = new MoleClient$1({
          requestTimeout: 5000, // 1000
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
                `Method call [${methodName}] on closed channel or connector ignored. Please add a check for closed channel in your code.`,
                'CLOSED_CHANNEL'
              )
            );
          });
        }

        return this.client.callMethod(`${this.methodPrefix}::${methodName}`, params);
      }
    }

    class RpcClient {
      constructor(connectorOrServersideChannel) {
        // connectorOrServersideChannel or channel actually, todo: change variable name
        this.connectorOrServersideChannel = connectorOrServersideChannel;
        this.remoteObjects = {};
      }

      remoteObject(methodPrefix) {
        const remoteObject = this.remoteObjects[methodPrefix];
        if (!remoteObject) {
          this.remoteObjects[methodPrefix] = new SpecificRpcClient(this.connectorOrServersideChannel, methodPrefix);
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

    // EventEmitter for browser (and nodejs as well)
    class Connector extends Eev$1 {
      constructor({ protocolLane, clientPrivateKey, clientPublicKey, clientInitData, verbose = false, address } = {}) {
        super();

        this.protocolLane = protocolLane;

        this.clientPrivateKey = clientPrivateKey;
        this.clientPublicKey = clientPublicKey;
        this.clientPublicKeyHex = bufferToHex(clientPublicKey);

        this.clientInitData = clientInitData;

        this.rpcClient = new RpcClient(this);

        this.address = address;
        this.verbose = verbose;
      }

      isConnected() {
        return this.connected;
      }

      send(data) {
        send({ data, connector: this });
      }

      wireReceive({ jsonData, encryptedData, rawMessage, wasEncrypted }) {
        wireReceive({ jsonData, encryptedData, rawMessage, wasEncrypted, connector: this });
      }

      // channel has this method and connector also has to have it so that rpc client can detect and warn us
      closed() {
        return !this.isConnected();
      }

      connectStatus(connected) {
        this.connected = connected;

        if (connected) {
          this.sentCounter = 0;

          this.diffieHellman({ clientPrivateKey: this.clientPrivateKey, clientPublicKey: this.clientPublicKey, protocolLane: this.protocolLane })
            .then(({ sharedSecret, sharedSecretHex }) => {
              //console.log(colors.magenta(`Shared secret: ${colors.gray(sharedSecretHex)}`));
              this.emit('connected', { sharedSecret, sharedSecretHex });
            })
            .catch(e => {
              // Auth::exchangePubkeys request exceeded maximum allowed time... can sometimes happen on RPi ... maybe increase this time
              console.log(e);
              console.log('dropping connection and retrying again ...');
              this.close();
            });
        } else {
          this.emit('disconnected');
        }
      }

      remoteObject(handle) {
        return {
          call: (methodName, params = []) => {
            return this.rpcClient.remoteObject(handle).call(methodName, listify(params)); // rpcClient always expects a list of arguments, never a single argument
          }
        };
      }

      registerRemoteObject(handle, obj) {
        // todo: servesideChannel is actually connector in this (reverse) case
        new RPCTarget({ serversideChannel: this, serverMethods: obj, methodPrefix: handle });
      }

      diffieHellman({ clientPrivateKey, clientPublicKey, protocolLane }) {
        // TODO: to be improved
        return new Promise((success, reject) => {
          this.remoteObject('Auth')
            .call('exchangePubkeys', { pubkey: this.clientPublicKeyHex })
            .then(remotePubkey => {
              const sharedSecret = naclFast.box.before(hexToBuffer(remotePubkey), clientPrivateKey);
              const sharedSecretHex = bufferToHex(sharedSecret);
              this.sharedSecret = sharedSecret;

              this.remotePubkeyHex = remotePubkey;

              success({ sharedSecret, sharedSecretHex });

              if (this.verbose) {
                console.log('Established shared secret through diffie-hellman exchange:');
                console.log(sharedSecretHex);
              }

              // let server know we're ready
              this.remoteObject('Auth')
                .call('finalizeHandshake', { protocolLane, expectHelloData: !!this.clientInitData })
                .then(() => {
                  if (this.clientInitData) {
                    this.remoteObject('Hello')
                      .call('hello', this.clientInitData)
                      .catch(reject);
                  }
                })
                .catch(reject);
            })
            .catch(reject);
        });
      }

      clientPubkey() {
        return this.clientPublicKeyHex;
      }

      remotePubkey() {
        return this.remotePubkeyHex;
      }

      // can actually be an url as well
      remoteIp() {
        return this.address;
      }

      close() {
        this.connection.websocket.close();
      }

      // RECENTLY DONE:
      // no manual connection flag is set... we close connection here after unsuccessful diffie hellman/
      // we do want it to reopen... not sure if manual close is used somewhere??
      // TODO: if not needed, remove closedManually checks in establishAndMaintainConnection
      closeAndDontReopenUNUSED() {
        this.connection.closedManually = true;
        this.connection.websocket.onclose = () => {}; // disable onclose handler first

        // the reason is to avoid this issue:
        //// there could be problems here -- ?
        // 1. we close the connection by calling connection.close on the connection store
        // 2. we create a new connection which sets connected=true on our store
        // 3. after that the previous connection actually closes and sets connected=false on our store (next line!)
        // todo: solve if proven problematic... maybe it won't cause trouble because closeCallback will trigger immediatelly

        this.connectStatus(false);
        this.connection.websocket.close();
      }

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

    function establishAndMaintainConnection(
      { obj, address, port, protocol, protocolLane, clientPrivateKey, clientPublicKey, clientInitData, remotePubkey, resumeNow, verbose },
      { WebSocket, log }
    ) {
      const endpoint = `ws://${address}:${port}`;

      log(`Trying to connect to ws endpoint ${endpoint} ...`);

      // address goes into connector only for informative purposes
      const connector = obj || new Connector({ address, protocolLane, clientPrivateKey, clientPublicKey, clientInitData, verbose });

      if (resumeNow) {
        // we could do without this and just wait for the next 1s check interval but this is faster and resumes connection immediately
        checkConnection({ connector, endpoint, protocol }, { WebSocket, log, resumeNow });
        return connector;
      }

      if (connector.connection) {
        return connector;
      }

      connector.connection = {};
      connector.connection.endpoint = endpoint; // only for logging purposes, not needed for functionality

      // so that event handlers on "connector" have time to get attached
      // we would use process.nextTick here usually but it doesn't work in browser!
      setTimeout(() => tryReconnect({ connector, endpoint, protocol }, { WebSocket, log }), 10);

      connector.connection.checkTicker = 0; // gets reset to zero everytime anything comes out of the socket

      // we check once per second, if process on the other side closed connection, we will detect this within one second
      // if network went down, we will need maximum 10-12s to determine the other side is now disconnected
      //
      // Technical explanation:
      //
      // Sometimes the link between the server and the client can be interrupted in a way that keeps both the server and
      // the client unaware of the broken state of the connection (e.g. when pulling the cord).
      // In these cases ping messages can be used as a means to verify that the remote endpoint is still responsive.
      //
      const connectionCheckInterval = 1000;
      const callback = () => {
        if (!connector.connection.closedManually) {
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
    function checkConnection({ connector, endpoint, protocol }, { WebSocket, log, resumeNow }) {
      const conn = connector.connection;

      //const prevConnected = connector.connected;

      if (connectionIdle(conn)) {
        // TODO: verify how often this gets called....
        // seemed to happen on: dmt update lab dpanel ... not sure why... restart didn't last more than 12s
        conn.websocket.close(); // will trigger onClose which will set connection status to false
        // we home onClose is called rather instantly.. IF THERE ARE PROBLEMS, CHECK THIS PART IN THE FUTURE

        // todo2: maybe check if under nodejs (ws) we should do terminate() instead ..
        // https://stackoverflow.com/a/49791634
        // todo3: instantly execute close handler and forget about this connection, label it inactive
        // then it can take some time to close if it wants ... we should discard it immediately
        //conn.websocket = null; // done: todo3 -- problem with onClose -- setConnected would get set on this connection
        return;
      }

      const connected = socketConnected(conn);
      // via ticker

      // TODO: check ticker, if more than 12s, terminate socket ... then close handler should fire...
      // then it's closed for good.. otherwise we may have issues with sharedSecret sync...

      if (connected) {
        // we cannot send lower-level ping frames from browser: https://stackoverflow.com/a/10586583/458177
        conn.websocket.send('ping');
      } else if (!connector.reconnectPaused && (resumeNow || conn.checkTicker <= 30 || conn.checkTicker % 3 == 0)) {
        if (connector.connected == undefined) {
          connector.connectStatus(false); // initial status report when not able to connect at beginning
        }

        // first 30s we try to reconnect every second, after that every 3s
        tryReconnect({ connector, endpoint, protocol }, { WebSocket, log });
      }

      // if (prevConnected != connected || prevConnected == null) {
      //   connector.connectStatus(connected);
      // }

      conn.checkTicker += 1;
    }

    function tryReconnect({ connector, endpoint, protocol }, { WebSocket, log }) {
      if (connector.connection.closedManually) {
        return;
      }

      const conn = connector.connection;

      //if (conn.websocket) {
      // get rid of possible previous websocket hanging around and executing opencallback
      //conn.websocket.close(); // we don't strictky need this because of double check in openCallback but it's nice to do so we don't get brief temporary connections on server (just to confuse us) ... previous ws can linger around and open:

      // ACTUALLY IT DOESN'T HELP !!! WE STILL GET LINGERING CONNECTIONS (AT MOST ONE ACCORDING TO TESTS) --> THAT'S WHY WE MAKE SURE

      //conn.websocket.terminate(); // NOT OK!!! we have to actually use .close() !!

      // testground pid 26235 7/24/2019, 9:42:54 PM 6311ms (+25ms) ∞ OPEN CALLBACK !!!!!!!!! 1
      // testground pid 26235 7/24/2019, 9:42:54 PM 6313ms (+02ms) ∞ websocket conn to ws://192.168.0.10:8888 open
      // testground pid 26235 7/24/2019, 9:42:54 PM 6315ms (+02ms) ∞ FiberConnection received state: {
      //   "connected": true
      // }
      // testground pid 26235 7/24/2019, 9:42:54 PM 6317ms (+02ms) ∞ ✓✓✓✓✓✓ CONNECTED
      // testground pid 26235 7/24/2019, 9:42:54 PM 6542ms (+33ms) ∞ OPEN CALLBACK !!!!!!!!! 0  <---- previous lingering connection!!
      //}

      // we supposedly don't have to do anything with previous instance of WebSocket after repeatd reconnect retries
      // it will get garbage collected (but it seems to slow everything down once we're past 100 unsuccessfull reconnects in a row)

      // this line causes slowness after we keep disconnected on localhost and frontent keeps retrying
      // after reconnect, connecting to nearby devices will be slow for some time
      // we partially solved this by delaying retries longer (3s instead of 1s after first 30s of not being able to connect)
      //
      // when we are retrying connections to non-local endpoints, we pause retries after device drops from nearbyDevices list (implemented in multiConnectedStore::pauseActiveStoreIfDeviceNotNearby)
      // for non-local endpoints on devices that we are connected to but not in foreground (selected device), we pause reconnects alltogether (multiConnectedStore::pauseDisconnectedStores)
      const ws = new WebSocket(endpoint, protocol);

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
        //log.cyan(`OPEN CALLBACK !!!!!!!!! ${conn.checkTicker}`);

        if (!connector.isConnected()) {
          // double-checking... ws connection retries could apparently come back and later open MANY connections when backend is accessible
          // this was a bug with 50-200 sudden connections after backend was offline for some little time.. this happened more on rpi than on laptop but it still happened
          // check in: https://tools.ietf.org/html/rfc6455
          log(`websocket conn to ${endpoint} open`);
          //log('new websocket conn open');

          conn.checkTicker = 0; // ADDED HERE LATER --- usually we don't need this in frontend because we keep sending state! but we better do the same there as well !! TODO±!!!!!

          //log(`✓✓✓✓✓✓ CONNECTED`);

          addSocketListeners({ ws, connector, openCallback }, { log });

          conn.websocket = ws;

          connector.connectStatus(true);
        } else {
          //log('new connection not needed');
          ws.close();
        }
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
        log(`websocket conn ${connector.connection.endpoint} error`);
        log(m);
      };

      const closeCallback = m => {
        log(`websocket conn ${connector.connection.endpoint} closed`);

        if (connector.isConnected()) {
          // we have to check this because of initial status can be set elsewhere and we don't want to report of disconnection
          connector.connectStatus(false);
        }
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
          if (browser) {
            // we have to convert from ArrayBuffer
            connector.wireReceive({ encryptedData: new Uint8Array(msg) });
          } else {
            connector.wireReceive({ encryptedData: msg });
          }
        }
      };

      if (browser) {
        ws.addEventListener('error', errorCallback);
        ws.addEventListener('close', closeCallback);
        ws.addEventListener('message', messageCallback);
      } else {
        ws.on('error', errorCallback);
        ws.on('close', closeCallback);
        ws.on('message', messageCallback);
      }

      // separate interval handler to purge stale sockets, because we couldn't detach the handlers from checkConnection function....
      // only here because we set them here ....
      const staleSocketCheckInterval = 1 * 1000;
      const purgeSocketIfStale = () => {
        if (!socketConnected(conn)) {
          //log(`socket not connected anymore ticker: ${conn.checkTicker}, socket state: ${conn.websocket.readyState}`);
          // removing these listeners is probably not needed -- test later
          // ws.removeEventListener('open', openCallback);
          // ws.removeEventListener('error', errorCallback);
          // ws.removeEventListener('close', closeCallback);
          // ws.removeEventListener('message', messageCallback);
          ws.close(); // added later - test
        } else {
          setTimeout(purgeSocketIfStale, staleSocketCheckInterval);
        }
      };
      setTimeout(purgeSocketIfStale, staleSocketCheckInterval);
    }

    function connectionIdle(conn) {
      const STATE_OPEN = 1;

      // we allow 12 seconds without message receive from the server side until we determine connection is broken
      // this double negation is needed because otherwise (in node but not in browse!)
      // we get "undefined" returned in case there is no conn.websocket object yet
      // we actually need false so that set({connected}) actually works! if undefined this doesn't set any key.. bla bla bla, unimportant trickery
      return conn.websocket && conn.checkTicker > 12 && conn.websocket.readyState == STATE_OPEN;
    }

    function socketConnected(conn) {
      const STATE_OPEN = 1;
      return conn.websocket && conn.websocket.readyState == STATE_OPEN;
    }

    function establishAndMaintainConnection$1(opts) {
      return new Promise(success => {
        success(establishAndMaintainConnection(opts, { WebSocket, log }));
      });
    }

    naclFast.util = naclUtil;

    naclFast.util = naclUtil;

    naclFast.util = naclUtil;

    naclFast.util = naclUtil;

    function newKeypair() {
      const keys = naclFast.box.keyPair();
      const publicKeyHex = bufferToHex(keys.publicKey);
      const privateKeyHex = bufferToHex(keys.secretKey);

      return { privateKey: keys.secretKey, publicKey: keys.publicKey, privateKeyHex, publicKeyHex };
    }

    const { applyPatch: applyJSONPatch } = fastJsonPatch;

    class ConnectedStore extends Store {
      constructor({ ip = null, port, protocol, protocolLane, session, logStore, rpcObjectsSetup, verbose } = {}) {
        super();

        this.protocol = protocol;
        this.protocolLane = protocolLane;
        this.session = session;
        this.logStore = logStore;
        this.verbose = verbose;

        this.set({ ip: ip || window.location.hostname });

        const objects = rpcObjectsSetup ? rpcObjectsSetup({ store: this }) : {};

        this.connect(this.ip, port, objects);
      }

      remoteObject(handle) {
        return this.connector.remoteObject(handle);
      }

      connect(address, port, objects) {
        const clientPrivateKey = this.session.privateKey;
        const clientPublicKey = this.session.publicKey;

        establishAndMaintainConnection$1({ address, port, protocol: this.protocol, protocolLane: this.protocolLane, clientPrivateKey, clientPublicKey, verbose: this.verbose }).then(
          connector => {
            this.connector = connector;

            for (const [handle, obj] of Object.entries(objects)) {
              connector.registerRemoteObject(handle, obj);
            }

            connector.on('wire_receive', ({ jsonData }) => {
              if (jsonData.state) {
                this.wireStateReceived = true;
                if (this.verbose) {
                  console.log(`New store ${this.ip} / ${this.protocol} / ${this.protocolLane} state:`);
                  console.log(jsonData.state);
                }
                this.set(jsonData.state);
              }

              if (jsonData.diff && this.wireStateReceived) {
                applyJSONPatch(this.state, jsonData.diff);
                this.pushStateToSubscribers();
              }
            });

            connector.on('connected', ({ sharedSecret, sharedSecretHex }) => {
              this.set({ connected: true });

              //console.log(`Shared secret: ${sharedSecretHex}`);
              this.session.set({ sharedSecret, sharedSecretHex }); // so we can show in gui easily
            });

            connector.on('disconnected', () => {
              this.set({ connected: false });
            });
          }
        );
      }
    }

    class MultiConnectedStore extends Store {
      constructor({ port, protocol, protocolLane, session, initialIp }) {
        super();

        this.session = session;

        this.activeStoreId = 0;
        this.currentIp = window.location.hostname; // usually localhost

        this.port = port;
        this.protocol = protocol;
        this.protocolLane = protocolLane;

        this.stores = [];
        this.switch({ ip: this.currentIp });

        //console.log(initialIp);

        if (initialIp) {
          this.switch({ ip: initialIp });

          // setTimeout(() => { }, 1000)
        }
      }

      remoteObject(handle) {
        return this.activeStore.remoteObject(handle);
      }

      switch({ deviceId, ip }) {
        let matchingStore;

        this.stores.forEach((store, index) => {
          if (store.ip == ip) {
            matchingStore = store;
          }
        });

        this.currentIp = ip;

        if (!matchingStore) {
          const newStore = new ConnectedStore({ ip, port: this.port, protocol: this.protocol, protocolLane: this.protocolLane, session: this.session });
          matchingStore = newStore;

          newStore.subscribe(state => {
            // delete current.notifications; // not interested in remote notifications -- we don't show or use them
            // // we make sure that in our Svelte Global Store (and thus GUI) there are only this device notifications...
            // delete current.nearbyDevices; // also not interested in other devices "nearbyDevices list"
            //this.stateChangeHandler({ state: current, storeId: newStoreId, stateDiff: changed });
            if (state.ip == this.currentIp) {
              this.set(state);
            }
          });

          this.stores.push(newStore);
        }

        this.set(matchingStore.state);

        this.activeStore = matchingStore;
      }
    }

    // not yet sure if this is needed
    class ParallelStore extends Store {
      constructor({ session, port, protocol, addressList }) {
        super();

        this.stores = [];

        for (const { ip } of addressList) {
          this.addStore({ ip, port, protocol, session });
        }
      }

      addStore({ ip, port, protocol, session }) {
        let matchingStore;

        this.stores.forEach((store, index) => {
          if (store.ip == ip) {
            matchingStore = store;
          }
        });

        this.currentIp = ip;

        if (!matchingStore) {
          const newStore = new ConnectedStore({ ip, port, protocol, session });
          matchingStore = newStore;

          newStore.subscribe(state => {
            // delete current.notifications; // not interested in remote notifications -- we don't show or use them
            // // we make sure that in our Svelte Global Store (and thus GUI) there are only this device notifications...
            // delete current.nearbyDevices; // also not interested in other devices "nearbyDevices list"
            //this.stateChangeHandler({ state: current, storeId: newStoreId, stateDiff: changed });
            if (state.ip == this.currentIp) {
              this.set(state);
            }
          });

          this.stores.push(newStore);
        }

        this.set(matchingStore.state);
      }
    }

    class SessionStore extends Store {
      constructor({ verbose = false } = {}) {
        super();

        this.verbose = verbose;

        this.constructOurKeypair();
      }

      constructOurKeypair() {
        const keypair = newKeypair();
        this.set(keypair);

        if (this.verbose) {
          console.log('Constructed new client keypair:');
          console.log(`Private key: ${keypair.privateKeyHex}`);
          console.log(`Public key: ${keypair.publicKeyHex}`);
        }
      }
    }

    class LogStore extends Store {
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

        // origConsoleLog('HEYYY:');
        // origConsoleLog(args);

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

        this.emit('new_log_entry');
      }
    }

    var stores = { SimpleStore: Store, ConnectedStore, MultiConnectedStore, ParallelStore, SessionStore, LogStore };

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

    var colors = { white, red, green, gray, yellow, cyan, magenta };

    function queryDifferentEnough({ searchQuery, prevQuery }) {
      return normalizeQuery(searchQuery) != normalizeQuery(prevQuery);
    }

    function normalizeQuery(query) {
      return query ? query.trim().replace(/\s+/g, ' ') : query;
    }

    let prevQuery = '';
    let executeQueryTimeout;
    const timeTags = []; // we can keep this growing (for now ?)  probably forever, todo: OPTIMIZE LATER and be careful when reassigning this array, learn more about event loops!

    const SEARCH_LAG_MS = 300; // 300 -- best value ->> if user presses the next key within this much from the last one, previous search query is cancelled

    function executeSearch({ searchQuery, remoteObject, remoteMethod, searchDelay = SEARCH_LAG_MS, searchStatusCallback = () => {} }) {
      return new Promise((success, reject) => {
        if (searchQuery.trim() == '') {
          timeTags.push(Date.now());

          if (prevQuery != '') {
            clearTimeout(executeQueryTimeout);
            searchStatusCallback({ searching: false });
            success([]); // empty result set
          }

          prevQuery = searchQuery;

          return;
        }

        try {
          if (queryDifferentEnough({ searchQuery, prevQuery })) {
            clearTimeout(executeQueryTimeout);

            searchStatusCallback({ searching: true });
            // if we called this from inside a timeout, there would be a gui lag. Now we report that we are searching even before we fire off search (while we wait for possible next user input)

            prevQuery = searchQuery;

            executeQueryTimeout = setTimeout(() => {
              const timeTag = Date.now();
              timeTags.push(timeTag);

              //console.log(`Search executed: ${searchQuery}`);

              remoteObject
                .call(remoteMethod, { query: normalizeQuery(searchQuery), searchOriginHost: window.location.host })
                .then(searchResults => {
                  //console.log(`Search with timeTag ${timeTag} just returned ...`);

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

    function noop$2() { }
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
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop$2;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
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
        if (value != null || input.value) {
            input.value = value;
        }
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

    const globals = (typeof window !== 'undefined' ? window : global);
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
            update: noop$2,
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
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
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
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(children(options.target));
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
            this.$destroy = noop$2;
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
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.19.2' }, detail)));
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
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
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

    /* Users/david/.dmt/core/node/dmt-js/gui_components/Escape.svelte generated by Svelte v3.19.2 */

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
    		p: noop$2,
    		i: noop$2,
    		o: noop$2,
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
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Escape> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Escape", $$slots, []);
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

    // warning: keep in sync with what walksearch returns

    function mediaTypeIcon(mediaType) {
      switch (mediaType) {
        case 'photo':
          return '';
        //return '[image]';

        case 'music':
          return '♬';
        //return '[sound]';

        case 'video':
          return '';
        //return '[video]';

        default:
          return '';
      }
    }

    /* src/components/About.svelte generated by Svelte v3.19.2 */

    const file$1 = "src/components/About.svelte";

    // (9:0) {#if isZetaSeek}
    function create_if_block(ctx) {
    	let div;
    	let b0;
    	let t1;
    	let span;
    	let t3;
    	let p0;
    	let t5;
    	let p1;
    	let b1;
    	let t7;
    	let b2;
    	let t9;
    	let t10;
    	let p2;
    	let b3;
    	let t12;

    	const block = {
    		c: function create() {
    			div = element("div");
    			b0 = element("b");
    			b0.textContent = "Zeta";
    			t1 = space();
    			span = element("span");
    			span.textContent = "PoC v0.1.1";
    			t3 = space();
    			p0 = element("p");
    			p0.textContent = "A new p2p digital era is slowly arriving.";
    			t5 = space();
    			p1 = element("p");
    			b1 = element("b");
    			b1.textContent = "Zeta";
    			t7 = text(" is a fast evolving search technology on ");
    			b2 = element("b");
    			b2.textContent = "modern web3 stack";
    			t9 = text(".");
    			t10 = space();
    			p2 = element("p");
    			b3 = element("b");
    			b3.textContent = "zetaseek.com";
    			t12 = text(" is one useful instance of Zeta knowledge node.");
    			add_location(b0, file$1, 11, 4, 171);
    			attr_dev(span, "class", "svelte-1vn6uc8");
    			add_location(span, file$1, 11, 16, 183);
    			attr_dev(p0, "class", "svelte-1vn6uc8");
    			add_location(p0, file$1, 13, 4, 212);
    			add_location(b1, file$1, 18, 6, 288);
    			add_location(b2, file$1, 18, 58, 340);
    			attr_dev(p1, "class", "svelte-1vn6uc8");
    			add_location(p1, file$1, 17, 4, 278);
    			add_location(b3, file$1, 22, 6, 390);
    			attr_dev(p2, "class", "svelte-1vn6uc8");
    			add_location(p2, file$1, 21, 4, 380);
    			attr_dev(div, "class", "about svelte-1vn6uc8");
    			add_location(div, file$1, 10, 2, 147);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, b0);
    			append_dev(div, t1);
    			append_dev(div, span);
    			append_dev(div, t3);
    			append_dev(div, p0);
    			append_dev(div, t5);
    			append_dev(div, p1);
    			append_dev(p1, b1);
    			append_dev(p1, t7);
    			append_dev(p1, b2);
    			append_dev(p1, t9);
    			append_dev(div, t10);
    			append_dev(div, p2);
    			append_dev(p2, b3);
    			append_dev(p2, t12);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(9:0) {#if isZetaSeek}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let if_block_anchor;
    	let if_block = /*isZetaSeek*/ ctx[0] && create_if_block(ctx);

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
    		p: noop$2,
    		i: noop$2,
    		o: noop$2,
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
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
    	let { store } = $$props;

    	// ugly hack for now:
    	const isZetaSeek = window.location.hostname == "zetaseek.com";

    	const writable_props = ["store"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<About> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("About", $$slots, []);

    	$$self.$set = $$props => {
    		if ("store" in $$props) $$invalidate(1, store = $$props.store);
    	};

    	$$self.$capture_state = () => ({ store, isZetaSeek });

    	$$self.$inject_state = $$props => {
    		if ("store" in $$props) $$invalidate(1, store = $$props.store);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [isZetaSeek, store];
    }

    class About extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { store: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "About",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*store*/ ctx[1] === undefined && !("store" in props)) {
    			console.warn("<About> was created without expected prop 'store'");
    		}
    	}

    	get store() {
    		throw new Error("<About>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set store(value) {
    		throw new Error("<About>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-spinner/src/index.svelte generated by Svelte v3.19.2 */

    const file$2 = "node_modules/svelte-spinner/src/index.svelte";

    function create_fragment$2(ctx) {
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
    			add_location(circle, file$2, 19, 2, 384);
    			attr_dev(svg, "height", /*size*/ ctx[0]);
    			attr_dev(svg, "width", /*size*/ ctx[0]);
    			set_style(svg, "animation-duration", /*speed*/ ctx[1] + "ms");
    			attr_dev(svg, "class", "svelte-spinner svelte-1bbsd2f");
    			attr_dev(svg, "viewBox", "0 0 32 32");
    			add_location(svg, file$2, 12, 0, 253);
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
    		i: noop$2,
    		o: noop$2,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
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

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Src", $$slots, []);

    	$$self.$set = $$props => {
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

    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {
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
    			id: create_fragment$2.name
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

    /* src/App.svelte generated by Svelte v3.19.2 */

    const { console: console_1 } = globals;
    const file$3 = "src/App.svelte";

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[31] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[18] = list[i].filePath;
    	child_ctx[19] = list[i].name;
    	child_ctx[20] = list[i].context;
    	child_ctx[21] = list[i].swarmBzzHash;
    	child_ctx[22] = list[i].mediaType;
    	child_ctx[23] = list[i].entryType;
    	child_ctx[24] = list[i].prettyTime;
    	child_ctx[25] = list[i].filePathANSI;
    	child_ctx[26] = list[i].playableUrl;
    	child_ctx[27] = list[i].fiberContentURL;
    	child_ctx[28] = list[i].fileSizePretty;
    	return child_ctx;
    }

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[15] = list[i];
    	return child_ctx;
    }

    // (110:2) {#if isLocalhost}
    function create_if_block_23(ctx) {
    	let current;
    	const escape_1 = new Escape({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(escape_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(escape_1, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(escape_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(escape_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(escape_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_23.name,
    		type: "if",
    		source: "(110:2) {#if isLocalhost}",
    		ctx
    	});

    	return block;
    }

    // (127:4) {:else}
    function create_else_block_4(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("— disconnected —");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop$2,
    		i: noop$2,
    		o: noop$2,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_4.name,
    		type: "else",
    		source: "(127:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (119:4) {#if connected}
    function create_if_block_21(ctx) {
    	let t0_value = (/*$store*/ ctx[6].deviceName || "") + "";
    	let t0;
    	let t1;
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_22, create_else_block_3];
    	const if_blocks = [];

    	function select_block_type_1(ctx, dirty) {
    		if (/*isSearching*/ ctx[1]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type_1(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			t0 = text(t0_value);
    			t1 = text(" connected:\n\n      ");
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty[0] & /*$store*/ 64) && t0_value !== (t0_value = (/*$store*/ ctx[6].deviceName || "") + "")) set_data_dev(t0, t0_value);
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
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_21.name,
    		type: "if",
    		source: "(119:4) {#if connected}",
    		ctx
    	});

    	return block;
    }

    // (124:6) {:else}
    function create_else_block_3(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("✓");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		i: noop$2,
    		o: noop$2,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_3.name,
    		type: "else",
    		source: "(124:6) {:else}",
    		ctx
    	});

    	return block;
    }

    // (122:6) {#if isSearching}
    function create_if_block_22(ctx) {
    	let current;

    	const spinner = new Src({
    			props: {
    				id: "search_spinner",
    				size: "15",
    				speed: "400",
    				color: "#fff",
    				thickness: "2",
    				gap: "40"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(spinner.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(spinner, target, anchor);
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
    			destroy_component(spinner, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_22.name,
    		type: "if",
    		source: "(122:6) {#if isSearching}",
    		ctx
    	});

    	return block;
    }

    // (137:4) {#if !connected}
    function create_if_block_20(ctx) {
    	let p;
    	let t0;
    	let span;
    	let t2;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t0 = text("Operator, please start ");
    			span = element("span");
    			span.textContent = "dmt-proc";
    			t2 = text(".");
    			attr_dev(span, "class", "svelte-xkqbnv");
    			add_location(span, file$3, 138, 31, 4158);
    			attr_dev(p, "class", "connection_status_help svelte-xkqbnv");
    			add_location(p, file$3, 137, 6, 4092);
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
    		id: create_if_block_20.name,
    		type: "if",
    		source: "(137:4) {#if !connected}",
    		ctx
    	});

    	return block;
    }

    // (146:4) {#if searchResults}
    function create_if_block$1(ctx) {
    	let each_1_anchor;
    	let each_value = /*searchResults*/ ctx[5];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

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
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*searchResults, play, isZetaSeek*/ 2592) {
    				each_value = /*searchResults*/ ctx[5];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(146:4) {#if searchResults}",
    		ctx
    	});

    	return block;
    }

    // (150:8) {#if providerResponse.results && providerResponse.results.length > 0}
    function create_if_block_1(ctx) {
    	let div;
    	let h3;
    	let t0;
    	let t1_value = /*providerResponse*/ ctx[15].meta.providerHost + "";
    	let t1;
    	let span;
    	let t2;
    	let t3;
    	let if_block0 = /*providerResponse*/ ctx[15].meta.contentId && create_if_block_19(ctx);

    	function select_block_type_2(ctx, dirty) {
    		if (/*providerResponse*/ ctx[15].error) return create_if_block_2;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type_2(ctx);
    	let if_block1 = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			h3 = element("h3");
    			t0 = text("@");
    			t1 = text(t1_value);
    			span = element("span");
    			if (if_block0) if_block0.c();
    			t2 = space();
    			if_block1.c();
    			t3 = space();
    			attr_dev(span, "class", "contentId svelte-xkqbnv");
    			add_location(span, file$3, 154, 51, 4586);
    			add_location(h3, file$3, 153, 12, 4530);
    			attr_dev(div, "class", "results svelte-xkqbnv");
    			add_location(div, file$3, 151, 10, 4455);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h3);
    			append_dev(h3, t0);
    			append_dev(h3, t1);
    			append_dev(h3, span);
    			if (if_block0) if_block0.m(span, null);
    			append_dev(div, t2);
    			if_block1.m(div, null);
    			append_dev(div, t3);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*searchResults*/ 32 && t1_value !== (t1_value = /*providerResponse*/ ctx[15].meta.providerHost + "")) set_data_dev(t1, t1_value);

    			if (/*providerResponse*/ ctx[15].meta.contentId) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_19(ctx);
    					if_block0.c();
    					if_block0.m(span, null);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (current_block_type === (current_block_type = select_block_type_2(ctx)) && if_block1) {
    				if_block1.p(ctx, dirty);
    			} else {
    				if_block1.d(1);
    				if_block1 = current_block_type(ctx);

    				if (if_block1) {
    					if_block1.c();
    					if_block1.m(div, t3);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block0) if_block0.d();
    			if_block1.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(150:8) {#if providerResponse.results && providerResponse.results.length > 0}",
    		ctx
    	});

    	return block;
    }

    // (155:75) {#if providerResponse.meta.contentId}
    function create_if_block_19(ctx) {
    	let t0;
    	let t1_value = /*providerResponse*/ ctx[15].meta.contentId + "";
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
    			if (dirty[0] & /*searchResults*/ 32 && t1_value !== (t1_value = /*providerResponse*/ ctx[15].meta.contentId + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_19.name,
    		type: "if",
    		source: "(155:75) {#if providerResponse.meta.contentId}",
    		ctx
    	});

    	return block;
    }

    // (172:12) {:else}
    function create_else_block(ctx) {
    	let t0;
    	let div;
    	let raw_value = displayResultsMeta(/*providerResponse*/ ctx[15]) + "";
    	let t1;
    	let if_block_anchor;
    	let each_value_1 = /*providerResponse*/ ctx[15].results;
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	let if_block = /*providerResponse*/ ctx[15].meta.pageNumber && create_if_block_3(ctx);

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t0 = space();
    			div = element("div");
    			t1 = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			attr_dev(div, "class", "results_meta svelte-xkqbnv");
    			add_location(div, file$3, 238, 14, 7756);
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, t0, anchor);
    			insert_dev(target, div, anchor);
    			div.innerHTML = raw_value;
    			insert_dev(target, t1, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*searchResults, play, isZetaSeek*/ 2592) {
    				each_value_1 = /*providerResponse*/ ctx[15].results;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(t0.parentNode, t0);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}

    			if (dirty[0] & /*searchResults*/ 32 && raw_value !== (raw_value = displayResultsMeta(/*providerResponse*/ ctx[15]) + "")) div.innerHTML = raw_value;
    			if (/*providerResponse*/ ctx[15].meta.pageNumber) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_3(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div);
    			if (detaching) detach_dev(t1);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(172:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (167:12) {#if providerResponse.error}
    function create_if_block_2(ctx) {
    	let div;
    	let t0;
    	let span;
    	let t1_value = JSON.stringify(/*providerResponse*/ ctx[15].error) + "";
    	let t1;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text("Error:\n                ");
    			span = element("span");
    			t1 = text(t1_value);
    			attr_dev(span, "class", "svelte-xkqbnv");
    			add_location(span, file$3, 169, 16, 5229);
    			attr_dev(div, "class", "resultError svelte-xkqbnv");
    			add_location(div, file$3, 167, 14, 5166);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, span);
    			append_dev(span, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*searchResults*/ 32 && t1_value !== (t1_value = JSON.stringify(/*providerResponse*/ ctx[15].error) + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(167:12) {#if providerResponse.error}",
    		ctx
    	});

    	return block;
    }

    // (176:18) {#if mediaType == 'video'}
    function create_if_block_18(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "VIDEO";
    			attr_dev(span, "class", "tag videoTag svelte-xkqbnv");
    			add_location(span, file$3, 176, 20, 5611);
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
    		id: create_if_block_18.name,
    		type: "if",
    		source: "(176:18) {#if mediaType == 'video'}",
    		ctx
    	});

    	return block;
    }

    // (180:18) {#if mediaType == 'photo'}
    function create_if_block_17(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "IMAGE";
    			attr_dev(span, "class", "tag imageTag svelte-xkqbnv");
    			add_location(span, file$3, 180, 20, 5741);
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
    		id: create_if_block_17.name,
    		type: "if",
    		source: "(180:18) {#if mediaType == 'photo'}",
    		ctx
    	});

    	return block;
    }

    // (184:18) {#if mediaType == 'pdf'}
    function create_if_block_16(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "PDF";
    			attr_dev(span, "class", "tag pdfTag svelte-xkqbnv");
    			add_location(span, file$3, 184, 20, 5869);
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
    		id: create_if_block_16.name,
    		type: "if",
    		source: "(184:18) {#if mediaType == 'pdf'}",
    		ctx
    	});

    	return block;
    }

    // (221:18) {:else}
    function create_else_block_2(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "Unsupported search results format.";
    			attr_dev(div, "class", "resultError");
    			add_location(div, file$3, 221, 20, 7155);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: noop$2,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_2.name,
    		type: "else",
    		source: "(221:18) {:else}",
    		ctx
    	});

    	return block;
    }

    // (217:37) 
    function create_if_block_15(ctx) {
    	let a;
    	let a_href_value;
    	let each_value_2 = ansicolor.parse(/*filePathANSI*/ ctx[25]).spans;
    	validate_each_argument(each_value_2);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	const block = {
    		c: function create() {
    			a = element("a");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(a, "href", a_href_value = /*playableUrl*/ ctx[26]);
    			attr_dev(a, "class", "svelte-xkqbnv");
    			add_location(a, file$3, 217, 20, 6935);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(a, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*searchResults*/ 32) {
    				each_value_2 = ansicolor.parse(/*filePathANSI*/ ctx[25]).spans;
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(a, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_2.length;
    			}

    			if (dirty[0] & /*searchResults*/ 32 && a_href_value !== (a_href_value = /*playableUrl*/ ctx[26])) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_15.name,
    		type: "if",
    		source: "(217:37) ",
    		ctx
    	});

    	return block;
    }

    // (188:18) {#if swarmBzzHash}
    function create_if_block_8(ctx) {
    	let span;
    	let t1;
    	let t2;
    	let a;
    	let b;
    	let t3_value = /*name*/ ctx[19] + "";
    	let t3;
    	let a_href_value;
    	let t4;
    	let t5;
    	let t6;
    	let if_block3_anchor;
    	let if_block0 = /*entryType*/ ctx[23] == "ens" && create_if_block_14(ctx);
    	let if_block1 = /*prettyTime*/ ctx[24] && create_if_block_13(ctx);

    	function select_block_type_4(ctx, dirty) {
    		if (/*entryType*/ ctx[23] == "ens") return create_if_block_12;
    		return create_else_block_1;
    	}

    	let current_block_type = select_block_type_4(ctx);
    	let if_block2 = current_block_type(ctx);
    	let if_block3 = /*context*/ ctx[20] && create_if_block_9(ctx);

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "SWARM";
    			t1 = space();
    			if (if_block0) if_block0.c();
    			t2 = space();
    			a = element("a");
    			b = element("b");
    			t3 = text(t3_value);
    			t4 = space();
    			if (if_block1) if_block1.c();
    			t5 = space();
    			if_block2.c();
    			t6 = space();
    			if (if_block3) if_block3.c();
    			if_block3_anchor = empty();
    			attr_dev(span, "class", "tag swarmTag svelte-xkqbnv");
    			add_location(span, file$3, 188, 20, 5987);
    			add_location(b, file$3, 195, 22, 6297);
    			attr_dev(a, "href", a_href_value = /*playableUrl*/ ctx[26]);
    			attr_dev(a, "class", "svelte-xkqbnv");
    			add_location(a, file$3, 194, 20, 6250);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			insert_dev(target, t1, anchor);
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, a, anchor);
    			append_dev(a, b);
    			append_dev(b, t3);
    			insert_dev(target, t4, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, t5, anchor);
    			if_block2.m(target, anchor);
    			insert_dev(target, t6, anchor);
    			if (if_block3) if_block3.m(target, anchor);
    			insert_dev(target, if_block3_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*entryType*/ ctx[23] == "ens") {
    				if (!if_block0) {
    					if_block0 = create_if_block_14(ctx);
    					if_block0.c();
    					if_block0.m(t2.parentNode, t2);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (dirty[0] & /*searchResults*/ 32 && t3_value !== (t3_value = /*name*/ ctx[19] + "")) set_data_dev(t3, t3_value);

    			if (dirty[0] & /*searchResults*/ 32 && a_href_value !== (a_href_value = /*playableUrl*/ ctx[26])) {
    				attr_dev(a, "href", a_href_value);
    			}

    			if (/*prettyTime*/ ctx[24]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_13(ctx);
    					if_block1.c();
    					if_block1.m(t5.parentNode, t5);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (current_block_type !== (current_block_type = select_block_type_4(ctx))) {
    				if_block2.d(1);
    				if_block2 = current_block_type(ctx);

    				if (if_block2) {
    					if_block2.c();
    					if_block2.m(t6.parentNode, t6);
    				}
    			}

    			if (/*context*/ ctx[20]) {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);
    				} else {
    					if_block3 = create_if_block_9(ctx);
    					if_block3.c();
    					if_block3.m(if_block3_anchor.parentNode, if_block3_anchor);
    				}
    			} else if (if_block3) {
    				if_block3.d(1);
    				if_block3 = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			if (detaching) detach_dev(t1);
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(a);
    			if (detaching) detach_dev(t4);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(t5);
    			if_block2.d(detaching);
    			if (detaching) detach_dev(t6);
    			if (if_block3) if_block3.d(detaching);
    			if (detaching) detach_dev(if_block3_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_8.name,
    		type: "if",
    		source: "(188:18) {#if swarmBzzHash}",
    		ctx
    	});

    	return block;
    }

    // (219:22) {#each ansicolor.parse(filePathANSI).spans as span}
    function create_each_block_2(ctx) {
    	let span;
    	let t_value = /*span*/ ctx[31].text + "";
    	let t;
    	let span_style_value;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "style", span_style_value = /*span*/ ctx[31].css);
    			attr_dev(span, "class", "svelte-xkqbnv");
    			add_location(span, file$3, 218, 73, 7033);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*searchResults*/ 32 && t_value !== (t_value = /*span*/ ctx[31].text + "")) set_data_dev(t, t_value);

    			if (dirty[0] & /*searchResults*/ 32 && span_style_value !== (span_style_value = /*span*/ ctx[31].css)) {
    				attr_dev(span, "style", span_style_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(219:22) {#each ansicolor.parse(filePathANSI).spans as span}",
    		ctx
    	});

    	return block;
    }

    // (191:20) {#if entryType == 'ens'}
    function create_if_block_14(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "ENS";
    			attr_dev(span, "class", "tag ensTag svelte-xkqbnv");
    			add_location(span, file$3, 191, 22, 6167);
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
    		id: create_if_block_14.name,
    		type: "if",
    		source: "(191:20) {#if entryType == 'ens'}",
    		ctx
    	});

    	return block;
    }

    // (199:20) {#if prettyTime}
    function create_if_block_13(ctx) {
    	let t0;
    	let t1_value = /*prettyTime*/ ctx[24] + "";
    	let t1;

    	const block = {
    		c: function create() {
    			t0 = text("·\n                      ");
    			t1 = text(t1_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*searchResults*/ 32 && t1_value !== (t1_value = /*prettyTime*/ ctx[24] + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_13.name,
    		type: "if",
    		source: "(199:20) {#if prettyTime}",
    		ctx
    	});

    	return block;
    }

    // (206:20) {:else}
    function create_else_block_1(ctx) {
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
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(206:20) {:else}",
    		ctx
    	});

    	return block;
    }

    // (204:20) {#if entryType == 'ens'}
    function create_if_block_12(ctx) {
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
    		id: create_if_block_12.name,
    		type: "if",
    		source: "(204:20) {#if entryType == 'ens'}",
    		ctx
    	});

    	return block;
    }

    // (210:20) {#if context}
    function create_if_block_9(ctx) {
    	let t_value = /*context*/ ctx[20] + "";
    	let t;
    	let if_block1_anchor;
    	let if_block0 = /*entryType*/ ctx[23] != "ens" && create_if_block_11(ctx);
    	let if_block1 = /*entryType*/ ctx[23] != "ens" && create_if_block_10(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t = text(t_value);
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*entryType*/ ctx[23] != "ens") {
    				if (!if_block0) {
    					if_block0 = create_if_block_11(ctx);
    					if_block0.c();
    					if_block0.m(t.parentNode, t);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (dirty[0] & /*searchResults*/ 32 && t_value !== (t_value = /*context*/ ctx[20] + "")) set_data_dev(t, t_value);

    			if (/*entryType*/ ctx[23] != "ens") {
    				if (!if_block1) {
    					if_block1 = create_if_block_10(ctx);
    					if_block1.c();
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
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
    		id: create_if_block_9.name,
    		type: "if",
    		source: "(210:20) {#if context}",
    		ctx
    	});

    	return block;
    }

    // (211:22) {#if entryType != 'ens'}
    function create_if_block_11(ctx) {
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
    		id: create_if_block_11.name,
    		type: "if",
    		source: "(211:22) {#if entryType != 'ens'}",
    		ctx
    	});

    	return block;
    }

    // (211:61) {#if entryType != 'ens'}
    function create_if_block_10(ctx) {
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
    		id: create_if_block_10.name,
    		type: "if",
    		source: "(211:61) {#if entryType != 'ens'}",
    		ctx
    	});

    	return block;
    }

    // (225:18) {#if mediaType && mediaTypeIcon(mediaType)}
    function create_if_block_7(ctx) {
    	let span;
    	let t_value = mediaTypeIcon(/*mediaType*/ ctx[22]) + "";
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "class", "mediaType svelte-xkqbnv");
    			add_location(span, file$3, 225, 20, 7328);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*searchResults*/ 32 && t_value !== (t_value = mediaTypeIcon(/*mediaType*/ ctx[22]) + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7.name,
    		type: "if",
    		source: "(225:18) {#if mediaType && mediaTypeIcon(mediaType)}",
    		ctx
    	});

    	return block;
    }

    // (229:18) {#if !isZetaSeek && mediaType == 'music'}
    function create_if_block_6(ctx) {
    	let a;
    	let dispose;

    	function click_handler(...args) {
    		return /*click_handler*/ ctx[14](/*playableUrl*/ ctx[26], ...args);
    	}

    	const block = {
    		c: function create() {
    			a = element("a");
    			a.textContent = "PLAY";
    			attr_dev(a, "class", "button svelte-xkqbnv");
    			add_location(a, file$3, 229, 20, 7491);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			dispose = listen_dev(a, "click", click_handler, false, false, false);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(229:18) {#if !isZetaSeek && mediaType == 'music'}",
    		ctx
    	});

    	return block;
    }

    // (233:18) {#if fileSizePretty}
    function create_if_block_5(ctx) {
    	let span;
    	let t_value = /*fileSizePretty*/ ctx[28] + "";
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "class", "svelte-xkqbnv");
    			add_location(span, file$3, 233, 20, 7642);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*searchResults*/ 32 && t_value !== (t_value = /*fileSizePretty*/ ctx[28] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(233:18) {#if fileSizePretty}",
    		ctx
    	});

    	return block;
    }

    // (173:14) {#each providerResponse.results as {filePath, name, context, swarmBzzHash, mediaType, entryType, prettyTime, filePathANSI, playableUrl, fiberContentURL, fileSizePretty}}
    function create_each_block_1(ctx) {
    	let div;
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let show_if = /*mediaType*/ ctx[22] && mediaTypeIcon(/*mediaType*/ ctx[22]);
    	let t4;
    	let t5;
    	let if_block0 = /*mediaType*/ ctx[22] == "video" && create_if_block_18(ctx);
    	let if_block1 = /*mediaType*/ ctx[22] == "photo" && create_if_block_17(ctx);
    	let if_block2 = /*mediaType*/ ctx[22] == "pdf" && create_if_block_16(ctx);

    	function select_block_type_3(ctx, dirty) {
    		if (/*swarmBzzHash*/ ctx[21]) return create_if_block_8;
    		if (/*filePath*/ ctx[18]) return create_if_block_15;
    		return create_else_block_2;
    	}

    	let current_block_type = select_block_type_3(ctx);
    	let if_block3 = current_block_type(ctx);
    	let if_block4 = show_if && create_if_block_7(ctx);
    	let if_block5 = !/*isZetaSeek*/ ctx[9] && /*mediaType*/ ctx[22] == "music" && create_if_block_6(ctx);
    	let if_block6 = /*fileSizePretty*/ ctx[28] && create_if_block_5(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			if (if_block2) if_block2.c();
    			t2 = space();
    			if_block3.c();
    			t3 = space();
    			if (if_block4) if_block4.c();
    			t4 = space();
    			if (if_block5) if_block5.c();
    			t5 = space();
    			if (if_block6) if_block6.c();
    			attr_dev(div, "class", "result svelte-xkqbnv");
    			add_location(div, file$3, 173, 16, 5524);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block0) if_block0.m(div, null);
    			append_dev(div, t0);
    			if (if_block1) if_block1.m(div, null);
    			append_dev(div, t1);
    			if (if_block2) if_block2.m(div, null);
    			append_dev(div, t2);
    			if_block3.m(div, null);
    			append_dev(div, t3);
    			if (if_block4) if_block4.m(div, null);
    			append_dev(div, t4);
    			if (if_block5) if_block5.m(div, null);
    			append_dev(div, t5);
    			if (if_block6) if_block6.m(div, null);
    		},
    		p: function update(ctx, dirty) {
    			if (/*mediaType*/ ctx[22] == "video") {
    				if (!if_block0) {
    					if_block0 = create_if_block_18(ctx);
    					if_block0.c();
    					if_block0.m(div, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*mediaType*/ ctx[22] == "photo") {
    				if (!if_block1) {
    					if_block1 = create_if_block_17(ctx);
    					if_block1.c();
    					if_block1.m(div, t1);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*mediaType*/ ctx[22] == "pdf") {
    				if (!if_block2) {
    					if_block2 = create_if_block_16(ctx);
    					if_block2.c();
    					if_block2.m(div, t2);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (current_block_type === (current_block_type = select_block_type_3(ctx)) && if_block3) {
    				if_block3.p(ctx, dirty);
    			} else {
    				if_block3.d(1);
    				if_block3 = current_block_type(ctx);

    				if (if_block3) {
    					if_block3.c();
    					if_block3.m(div, t3);
    				}
    			}

    			if (dirty[0] & /*searchResults*/ 32) show_if = /*mediaType*/ ctx[22] && mediaTypeIcon(/*mediaType*/ ctx[22]);

    			if (show_if) {
    				if (if_block4) {
    					if_block4.p(ctx, dirty);
    				} else {
    					if_block4 = create_if_block_7(ctx);
    					if_block4.c();
    					if_block4.m(div, t4);
    				}
    			} else if (if_block4) {
    				if_block4.d(1);
    				if_block4 = null;
    			}

    			if (!/*isZetaSeek*/ ctx[9] && /*mediaType*/ ctx[22] == "music") {
    				if (if_block5) {
    					if_block5.p(ctx, dirty);
    				} else {
    					if_block5 = create_if_block_6(ctx);
    					if_block5.c();
    					if_block5.m(div, t5);
    				}
    			} else if (if_block5) {
    				if_block5.d(1);
    				if_block5 = null;
    			}

    			if (/*fileSizePretty*/ ctx[28]) {
    				if (if_block6) {
    					if_block6.p(ctx, dirty);
    				} else {
    					if_block6 = create_if_block_5(ctx);
    					if_block6.c();
    					if_block6.m(div, null);
    				}
    			} else if (if_block6) {
    				if_block6.d(1);
    				if_block6 = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			if_block3.d();
    			if (if_block4) if_block4.d();
    			if (if_block5) if_block5.d();
    			if (if_block6) if_block6.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(173:14) {#each providerResponse.results as {filePath, name, context, swarmBzzHash, mediaType, entryType, prettyTime, filePathANSI, playableUrl, fiberContentURL, fileSizePretty}}",
    		ctx
    	});

    	return block;
    }

    // (243:14) {#if providerResponse.meta.pageNumber}
    function create_if_block_3(ctx) {
    	let div;
    	let t0;
    	let span;
    	let t1_value = /*providerResponse*/ ctx[15].meta.pageNumber + "";
    	let t1;
    	let t2;
    	let if_block = /*providerResponse*/ ctx[15].meta.hasMore && create_if_block_4(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text("Page: ");
    			span = element("span");
    			t1 = text(t1_value);
    			t2 = space();
    			if (if_block) if_block.c();
    			attr_dev(span, "class", "svelte-xkqbnv");
    			add_location(span, file$3, 243, 49, 7968);
    			attr_dev(div, "class", "results_count svelte-xkqbnv");
    			add_location(div, file$3, 243, 16, 7935);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, span);
    			append_dev(span, t1);
    			append_dev(div, t2);
    			if (if_block) if_block.m(div, null);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*searchResults*/ 32 && t1_value !== (t1_value = /*providerResponse*/ ctx[15].meta.pageNumber + "")) set_data_dev(t1, t1_value);

    			if (/*providerResponse*/ ctx[15].meta.hasMore) {
    				if (!if_block) {
    					if_block = create_if_block_4(ctx);
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
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(243:14) {#if providerResponse.meta.pageNumber}",
    		ctx
    	});

    	return block;
    }

    // (245:18) {#if providerResponse.meta.hasMore}
    function create_if_block_4(ctx) {
    	let a;

    	const block = {
    		c: function create() {
    			a = element("a");
    			a.textContent = "Next page";
    			attr_dev(a, "href", "next_page");
    			add_location(a, file$3, 245, 20, 8090);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(245:18) {#if providerResponse.meta.hasMore}",
    		ctx
    	});

    	return block;
    }

    // (148:6) {#each searchResults as providerResponse}
    function create_each_block(ctx) {
    	let if_block_anchor;
    	let if_block = /*providerResponse*/ ctx[15].results && /*providerResponse*/ ctx[15].results.length > 0 && create_if_block_1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*providerResponse*/ ctx[15].results && /*providerResponse*/ ctx[15].results.length > 0) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_1(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(148:6) {#each searchResults as providerResponse}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let t0;
    	let main;
    	let t1;
    	let div0;
    	let img;
    	let img_src_value;
    	let t2;
    	let p;
    	let current_block_type_index;
    	let if_block1;
    	let t3;
    	let div2;
    	let input;
    	let t4;
    	let t5;
    	let div1;
    	let t7;
    	let current;
    	let dispose;

    	const about = new About({
    			props: { store: /*store*/ ctx[0] },
    			$$inline: true
    		});

    	let if_block0 = /*isLocalhost*/ ctx[8] && create_if_block_23(ctx);
    	const if_block_creators = [create_if_block_21, create_else_block_4];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*connected*/ ctx[7]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	let if_block2 = !/*connected*/ ctx[7] && create_if_block_20(ctx);
    	let if_block3 = /*searchResults*/ ctx[5] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			create_component(about.$$.fragment);
    			t0 = space();
    			main = element("main");
    			if (if_block0) if_block0.c();
    			t1 = space();
    			div0 = element("div");
    			img = element("img");
    			t2 = space();
    			p = element("p");
    			if_block1.c();
    			t3 = space();
    			div2 = element("div");
    			input = element("input");
    			t4 = space();
    			if (if_block2) if_block2.c();
    			t5 = space();
    			div1 = element("div");
    			div1.textContent = "NO RESULTS :( ... Yet ;)";
    			t7 = space();
    			if (if_block3) if_block3.c();
    			if (img.src !== (img_src_value = "/apps/zeta/img/zeta_logo.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "zeta logo");
    			attr_dev(img, "class", "svelte-xkqbnv");
    			add_location(img, file$3, 114, 4, 3432);
    			attr_dev(div0, "class", "logo svelte-xkqbnv");
    			add_location(div0, file$3, 113, 2, 3409);
    			attr_dev(p, "class", "connection_status svelte-xkqbnv");
    			toggle_class(p, "ok", /*connected*/ ctx[7]);
    			toggle_class(p, "isLocalhost", /*isLocalhost*/ ctx[8]);
    			add_location(p, file$3, 117, 2, 3501);
    			attr_dev(input, "id", "searchInput");
    			attr_dev(input, "placeholder", "Please type your query ...");
    			attr_dev(input, "class", "svelte-xkqbnv");
    			add_location(input, file$3, 134, 4, 3889);
    			attr_dev(div1, "class", "noResults svelte-xkqbnv");
    			toggle_class(div1, "visible", /*noSearchHits*/ ctx[2]);
    			add_location(div1, file$3, 143, 4, 4208);
    			attr_dev(div2, "class", "search svelte-xkqbnv");
    			add_location(div2, file$3, 132, 2, 3863);
    			attr_dev(main, "class", "svelte-xkqbnv");
    			add_location(main, file$3, 107, 0, 3355);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(about, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, main, anchor);
    			if (if_block0) if_block0.m(main, null);
    			append_dev(main, t1);
    			append_dev(main, div0);
    			append_dev(div0, img);
    			append_dev(main, t2);
    			append_dev(main, p);
    			if_blocks[current_block_type_index].m(p, null);
    			append_dev(main, t3);
    			append_dev(main, div2);
    			append_dev(div2, input);
    			set_input_value(input, /*searchQuery*/ ctx[3]);
    			/*input_binding*/ ctx[13](input);
    			append_dev(div2, t4);
    			if (if_block2) if_block2.m(div2, null);
    			append_dev(div2, t5);
    			append_dev(div2, div1);
    			append_dev(div2, t7);
    			if (if_block3) if_block3.m(div2, null);
    			current = true;

    			dispose = [
    				listen_dev(input, "input", /*input_input_handler*/ ctx[12]),
    				listen_dev(input, "keyup", /*searchInputChanged*/ ctx[10], false, false, false),
    				listen_dev(input, "paste", /*searchInputChanged*/ ctx[10], false, false, false)
    			];
    		},
    		p: function update(ctx, dirty) {
    			const about_changes = {};
    			if (dirty[0] & /*store*/ 1) about_changes.store = /*store*/ ctx[0];
    			about.$set(about_changes);
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
    				if_block1 = if_blocks[current_block_type_index];

    				if (!if_block1) {
    					if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block1.c();
    				}

    				transition_in(if_block1, 1);
    				if_block1.m(p, null);
    			}

    			if (dirty[0] & /*connected*/ 128) {
    				toggle_class(p, "ok", /*connected*/ ctx[7]);
    			}

    			if (dirty[0] & /*isLocalhost*/ 256) {
    				toggle_class(p, "isLocalhost", /*isLocalhost*/ ctx[8]);
    			}

    			if (dirty[0] & /*searchQuery*/ 8 && input.value !== /*searchQuery*/ ctx[3]) {
    				set_input_value(input, /*searchQuery*/ ctx[3]);
    			}

    			if (!/*connected*/ ctx[7]) {
    				if (!if_block2) {
    					if_block2 = create_if_block_20(ctx);
    					if_block2.c();
    					if_block2.m(div2, t5);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (dirty[0] & /*noSearchHits*/ 4) {
    				toggle_class(div1, "visible", /*noSearchHits*/ ctx[2]);
    			}

    			if (/*searchResults*/ ctx[5]) {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);
    				} else {
    					if_block3 = create_if_block$1(ctx);
    					if_block3.c();
    					if_block3.m(div2, null);
    				}
    			} else if (if_block3) {
    				if_block3.d(1);
    				if_block3 = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(about.$$.fragment, local);
    			transition_in(if_block0);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(about.$$.fragment, local);
    			transition_out(if_block0);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(about, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(main);
    			if (if_block0) if_block0.d();
    			if_blocks[current_block_type_index].d();
    			/*input_binding*/ ctx[13](null);
    			if (if_block2) if_block2.d();
    			if (if_block3) if_block3.d();
    			run_all(dispose);
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

    function instance$3($$self, $$props, $$invalidate) {
    	let $store,
    		$$unsubscribe_store = noop$2,
    		$$subscribe_store = () => ($$unsubscribe_store(), $$unsubscribe_store = subscribe(store, $$value => $$invalidate(6, $store = $$value)), store);

    	$$self.$$.on_destroy.push(() => $$unsubscribe_store());

    	ansicolor.rgb = {
    		black: [0, 0, 0],
    		darkGray: [180, 180, 180],
    		//cyan: [255, 255, 255]
    		cyan: [37, 176, 188],
    		lightCyan: [0, 204, 255]
    	};

    	let { store } = $$props;
    	validate_store(store, "store");
    	$$subscribe_store();
    	const isLocalhost = window.location.hostname == "localhost";

    	// ugly hack for now:
    	const isZetaSeek = window.location.hostname == "zetaseek.com";

    	let isSearching;
    	let noSearchHits;

    	if (isZetaSeek) {
    		cssBridge.setWallpaper("/apps/zeta/wallpapers/hilly_dark_forest_river_fog.jpg");
    	} else {
    		cssBridge.setWallpaper("/apps/zeta/wallpapers/black_triangles.jpg");
    	}

    	let searchQuery = "";
    	let searchInput;

    	onMount(() => {
    		searchInput.focus();

    		setTimeout(
    			() => {
    				$$invalidate(3, searchQuery = document.getElementById("searchInput").value);
    				searchInputChanged();
    			},
    			300
    		); // todo: fix -- handle back inside our app ? then read last results from localstorate ?!
    	}); // when we go back in browser history and search query is kept for us (by default)
    	// we need small delay because otherwiser "store" is not yet setup

    	function searchInputChanged() {
    		const remoteObject = store.remoteObject("GUISearchObject");
    		const remoteMethod = "search";

    		const searchStatusCallback = ({ searching, noHits }) => {
    			$$invalidate(1, isSearching = searching);
    			$$invalidate(2, noSearchHits = noHits);
    		};

    		if (connected) {
    			executeSearch({
    				searchQuery,
    				remoteObject,
    				remoteMethod,
    				searchStatusCallback,
    				searchDelay: 400
    			}).then(searchResults => {
    				store.set({ searchResults });
    			}).catch(e => {
    				store.set({ searchResults: { error: e.message } });
    			});
    		}
    	}

    	function play(playableUrl) {
    		console.log(`Loading ${playableUrl} into mpv on localhost ...`);
    		store.remoteObject("GUIPlayerObject").call("playUrl", { playableUrl });
    	}

    	const writable_props = ["store"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("App", $$slots, []);

    	function input_input_handler() {
    		searchQuery = this.value;
    		$$invalidate(3, searchQuery);
    	}

    	function input_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(4, searchInput = $$value);
    		});
    	}

    	const click_handler = playableUrl => {
    		play(playableUrl);
    	};

    	$$self.$set = $$props => {
    		if ("store" in $$props) $$subscribe_store($$invalidate(0, store = $$props.store));
    	};

    	$$self.$capture_state = () => ({
    		cssBridge,
    		Escape,
    		executeSearch,
    		ansicolor,
    		colors,
    		mediaTypeIcon,
    		onMount,
    		About,
    		Spinner: Src,
    		store,
    		isLocalhost,
    		isZetaSeek,
    		isSearching,
    		noSearchHits,
    		searchQuery,
    		searchInput,
    		searchInputChanged,
    		play,
    		displayResultsMeta,
    		searchResults,
    		$store,
    		connected
    	});

    	$$self.$inject_state = $$props => {
    		if ("store" in $$props) $$subscribe_store($$invalidate(0, store = $$props.store));
    		if ("isSearching" in $$props) $$invalidate(1, isSearching = $$props.isSearching);
    		if ("noSearchHits" in $$props) $$invalidate(2, noSearchHits = $$props.noSearchHits);
    		if ("searchQuery" in $$props) $$invalidate(3, searchQuery = $$props.searchQuery);
    		if ("searchInput" in $$props) $$invalidate(4, searchInput = $$props.searchInput);
    		if ("searchResults" in $$props) $$invalidate(5, searchResults = $$props.searchResults);
    		if ("connected" in $$props) $$invalidate(7, connected = $$props.connected);
    	};

    	let searchResults;
    	let connected;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*$store*/ 64) {
    			 $$invalidate(5, searchResults = $store.searchResults);
    		}

    		if ($$self.$$.dirty[0] & /*$store*/ 64) {
    			 $$invalidate(7, connected = $store.connected);
    		}

    		if ($$self.$$.dirty[0] & /*$store*/ 64) {
    			 document.title = $store.deviceName || document.title;
    		}
    	};

    	return [
    		store,
    		isSearching,
    		noSearchHits,
    		searchQuery,
    		searchInput,
    		searchResults,
    		$store,
    		connected,
    		isLocalhost,
    		isZetaSeek,
    		searchInputChanged,
    		play,
    		input_input_handler,
    		input_binding,
    		click_handler
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { store: 0 }, [-1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*store*/ ctx[0] === undefined && !("store" in props)) {
    			console_1.warn("<App> was created without expected prop 'store'");
    		}
    	}

    	get store() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set store(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const { SessionStore: SessionStore$1, ConnectedStore: ConnectedStore$1, LogStore: LogStore$1 } = stores;

    const port = 7780;
    const protocol = 'zeta';
    const protocolLane = 'gui';

    // RPC targets on frontend

    const rpcObjectsSetup = ({ store }) => {
      return {
        Receiver: {
          msg: msg => {
            store.set({ msg });
          }
        }
      };
    };

    const logStore = new LogStore$1();

    // source: https://stackoverflow.com/a/9216488
    const log$1 = console.log.bind(console);
    console.log = (...args) => {
      logStore.addToLog({ origConsoleLog: log$1, limit: 100 }, ...args);
      log$1(...args);
    };

    const verbose = false;
    const session = new SessionStore$1({ verbose });
    const store = new ConnectedStore$1({ port, protocol, protocolLane, rpcObjectsSetup, verbose, session, logStore });

    const app = new App({
      target: document.body,
      props: {
        store
      }
    });

    return app;

}(crypto));
//# sourceMappingURL=bundle.js.map
