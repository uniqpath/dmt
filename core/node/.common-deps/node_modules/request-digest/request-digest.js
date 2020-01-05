'use strict';
//
// # Digest Client
//
// Use together with HTTP Client to perform requests to servers protected
// by digest authentication.
//

var HTTPDigest = function () {
  var crypto = require('crypto');
  var request = require('request');
  var _ = require('lodash');

  var HTTPDigest = function (username, password) {
    this.nc = 0;
    this.username = username;
    this.password = password;
  };

  //
  // ## Make request
  //
  // Wraps the http.request function to apply digest authorization.
  //
  HTTPDigest.prototype.request = function (options, callback) {
    var self = this;
    options.url = options.host + options.path;
    return request(options, function (error, res) {
      self._handleResponse(options, res, callback);
    });
  };

  //
  // ## Handle authentication
  //
  // Parse authentication headers and set response.
  //
  HTTPDigest.prototype._handleResponse = function handleResponse(options, res, callback) {
    var challenge = this._parseDigestResponse(res.caseless.dict['www-authenticate']);
    var ha1 = crypto.createHash('md5');
    ha1.update([this.username, challenge.realm, this.password].join(':'));
    var ha2 = crypto.createHash('md5');
    ha2.update([options.method, options.path].join(':'));

    var cnonceObj = this._generateCNONCE(challenge.qop);

    // Generate response hash
    var response = crypto.createHash('md5');
    var responseParams = [
      ha1.digest('hex'),
      challenge.nonce
    ];

    if (cnonceObj.cnonce) {
      responseParams.push(cnonceObj.nc);
      responseParams.push(cnonceObj.cnonce);
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
      algorithm: "MD5",
      qop: challenge.qop,
      opaque: challenge.opaque,
      response: response.digest('hex'),
    };

    authParams = this._omitNull(authParams);

    if (cnonceObj.cnonce) {
      authParams.nc = cnonceObj.nc;
      authParams.cnonce = cnonceObj.cnonce;
    }

    var headers = options.headers || {};
    headers.Authorization = this._compileParams(authParams);
    options.headers = headers;

    return request(options, function (error, response, body) {
      callback(error, response, body);
    });
  };

  //
  // ## Delete null or undefined value in an object
  //
  HTTPDigest.prototype._omitNull = function omitNull(data) {
    return _.omit(data, function(elt) {
      return elt == null;
    });
  };

  //
  // ## Parse challenge digest
  //
  HTTPDigest.prototype._parseDigestResponse = function parseDigestResponse(digestHeader) {
    var prefix = 'Digest ';
    var challenge = digestHeader.substr(digestHeader.indexOf(prefix) + prefix.length);
    var parts = challenge.split(',');
    var length = parts.length;
    var params = {};

    for (var i = 0; i < length; i++) {
      var paramSplitted = this._splitParams(parts[i]);

      if (paramSplitted.length > 2) {
        params[paramSplitted[1]] = paramSplitted[2].replace(/\"/g, '');
      }
    }

    return params;
  };

  HTTPDigest.prototype._splitParams = function splitParams(paramString) {
    return paramString.match(/^\s*?([a-zA-Z0-0]+)=("?(.*)"?|MD5|MD5-sess|token)\s*?$/);
  };

  //
  // ## Parse challenge digest
  //
  HTTPDigest.prototype._generateCNONCE = function generateCNONCE(qop) {
    var cnonce = false;
    var nc = false;

    if (typeof qop === 'string') {
      var cnonceHash = crypto.createHash('md5');

      cnonceHash.update(Math.random().toString(36));
      cnonce = cnonceHash.digest('hex').substr(0, 8);
      nc = this._updateNC();
    }

    return { cnonce: cnonce, nc: nc };
  };

  //
  // ## Compose authorization header
  //
  HTTPDigest.prototype._compileParams = function compileParams(params) {
    var parts = [];
    for (var i in params) {
      if (typeof params[i] === 'function') {
        continue;
      }

      var param = i + '=' + (this._putDoubleQuotes(i) ? '"' : '') + params[i] + (this._putDoubleQuotes(i) ? '"' : '');
      parts.push(param);
    }

    return 'Digest ' + parts.join(',');
  };

  //
  // ## Define if we have to put double quotes or not
  //
  HTTPDigest.prototype._putDoubleQuotes = function putDoubleQuotes(i) {
    var excludeList = ['qop', 'nc'];

    return (_.includes(excludeList, i) ? true : false);
  };

  //
  // ## Update and zero pad nc
  //
  HTTPDigest.prototype._updateNC = function updateNC() {
    var max = 99999999;
    this.nc++;
    if (this.nc > max) {
      this.nc = 1;
    }
    var padding = new Array(8).join('0') + '';
    var nc = this.nc + '';

    return padding.substr(0, 8 - nc.length) + nc;
  };

  // Return response handler
  return HTTPDigest;
}();

module.exports = function _createDigestClient(username, password) {
  return new HTTPDigest(username, password);
};
