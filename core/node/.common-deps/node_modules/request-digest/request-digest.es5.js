'use strict';
Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

var _crypto = require('crypto');

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var HTTPDigest = (function () {
    function HTTPDigest(username, password) {
        _classCallCheck(this, HTTPDigest);

        this.nc = 0;
        this.username = username;
        this.password = password;
    }

    _createClass(HTTPDigest, [{
        key: 'requestAsync',
        value: function requestAsync(options) {
            var _this = this;

            return new _bluebird2['default'](function (resolve, reject) {
                _this.request(options, function (error, response, body) {
                    if (error) {
                        return reject(error);
                    }

                    return resolve({ response: response, body: body });
                });
            });
        }
    }, {
        key: 'request',
        value: function request(options, callback) {
            var _this2 = this;

            var port = options.port ? options.port : 80;

            options.url = options.excludePort ? '' + options.host + options.path : options.host + ':' + port + options.path;
            return (0, _request2['default'])(options, function (error, res) {
                return _this2._handleResponse(options, res, callback);
            });
        }
    }, {
        key: '_handleResponse',
        value: function _handleResponse(options, res, callback) {
            if (!res) {
                return callback(new Error('Bad request, answer is empty'));
            }
            if (res.statusCode === 200) {
                return callback(null, res, res.body);
            }
            if (typeof res.caseless.dict['www-authenticate'] !== 'string' || res.caseless.dict['www-authenticate'] === '') {
                return callback(new Error('Bad request, www-authenticate field is malformed'));
            }

            var challenge = this._parseDigestResponse(res.caseless.dict['www-authenticate']);
            var ha1 = (0, _crypto.createHash)('md5');
            ha1.update([this.username, challenge.realm, this.password].join(':'));
            var ha2 = (0, _crypto.createHash)('md5');
            ha2.update([options.method, options.path].join(':'));

            var _generateCNONCE2 = this._generateCNONCE(challenge.qop);

            var nc = _generateCNONCE2.nc;
            var cnonce = _generateCNONCE2.cnonce;

            // Generate response hash
            var response = (0, _crypto.createHash)('md5');
            var responseParams = [ha1.digest('hex'), challenge.nonce];

            if (cnonce) {
                responseParams.push(nc);
                responseParams.push(cnonce);
            }

            responseParams.push(challenge.qop);
            responseParams.push(ha2.digest('hex'));
            response.update(responseParams.join(':'));

            // Setup response parameters
            var authParams = {
                username: this.username,
                realm: challenge.realm,
                nonce: challenge.nonce,
                uri: options.path,
                qop: challenge.qop,
                algorithm: "MD5",
                opaque: challenge.opaque,
                response: response.digest('hex')
            };

            authParams = this._omitNull(authParams);

            if (cnonce) {
                authParams.nc = nc;
                authParams.cnonce = cnonce;
            }

            var headers = options.headers || {};
            headers.Authorization = this._compileParams(authParams);
            options.headers = headers;

            return (0, _request2['default'])(options, function (error, response, body) {
                if (!error && response.statusCode >= 400) {
                    var errorMessage = {
                        statusCode: response.statusCode,
                        response: response,
                        body: body
                    };

                    return callback(errorMessage);
                }
                callback(error, response, body);
            });
        }
    }, {
        key: '_omitNull',
        value: function _omitNull(data) {
            // _.omit(data, (elt) => {
            //   console.log('elt ' + elt + ' et condition : ' + elt === null);
            //   return elt == null;
            // });
            var newObject = {};
            _lodash2['default'].forEach(data, function (elt, key) {
                if (elt != null) {
                    newObject[key] = elt;
                }
            });

            return newObject;
        }
    }, {
        key: '_parseDigestResponse',
        value: function _parseDigestResponse(digestHeader) {
            var prefix = 'Digest ';
            var challenge = digestHeader.substr(digestHeader.indexOf(prefix) + prefix.length);
            var parts = challenge.split(',');
            var length = parts.length;
            var params = {};

            for (var i = 0; i < length; i++) {
                var paramSplitted = this._splitParams(parts[i]);

                if (paramSplitted && paramSplitted.length > 2) {
                    params[paramSplitted[1]] = paramSplitted[2].replace(/\"/g, '');
                }
            }

            return params;
        }
    }, {
        key: '_splitParams',
        value: function _splitParams(paramString) {
            if (!paramString) {
                return null;
            }
            return paramString.match(/^\s*?([a-zA-Z0-0]+)=("?(.*)"?|MD5|MD5-sess|token|TRUE|FALSE)\s*?$/);
        }

        //
        // ## Parse challenge digest
        //
    }, {
        key: '_generateCNONCE',
        value: function _generateCNONCE(qop) {
            var cnonce = false;
            var nc = false;

            if (typeof qop === 'string') {
                var cnonceHash = (0, _crypto.createHash)('md5');

                cnonceHash.update(Math.random().toString(36));
                cnonce = cnonceHash.digest('hex').substr(0, 8);
                nc = this._updateNC();
            }

            return { cnonce: cnonce, nc: nc };
        }

        //
        // ## Compose authorization header
        //

    }, {
        key: '_compileParams',
        value: function _compileParams(params) {
            var parts = [];
            for (var i in params) {
                if (typeof params[i] === 'function') {
                    continue;
                }

                var param = i + '=' + (this._putDoubleQuotes(i) ? '"' : '') + params[i] + (this._putDoubleQuotes(i) ? '"' : '');
                parts.push(param);
            }

            return 'Digest ' + parts.join(',');
        }

        //
        // ## Define if we have to put double quotes or not
        //

    }, {
        key: '_putDoubleQuotes',
        value: function _putDoubleQuotes(i) {
            var excludeList = ['qop', 'nc'];

            return !_lodash2['default'].includes(excludeList, i);
        }

        //
        // ## Update and zero pad nc
        //

    }, {
        key: '_updateNC',
        value: function _updateNC() {
            var max = 99999999;
            var padding = new Array(8).join('0') + '';
            this.nc = this.nc > max ? 1 : this.nc + 1;
            var nc = this.nc + '';

            return padding.substr(0, 8 - nc.length) + nc;
        }
    }]);

    return HTTPDigest;
})();

exports['default'] = function (username, password) {
    return new HTTPDigest(username, password);
};

module.exports = exports['default'];
