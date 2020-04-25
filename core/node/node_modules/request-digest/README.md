# Request digest client in Node.js [![Build Status](https://travis-ci.org/bnjjj/node-request-digest.svg?branch=master)](https://travis-ci.org/bnjjj/node-request-digest)
[![NPM](https://nodei.co/npm/request-digest.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/request-digest/)

Perform a client request (http) with a digest authentication, a simple node http digest client.

## Disclaimer

Only tested against one server and spec is not followed fully. It works for me
and for what I am doing. I often try to improve this npm and I answer to your pull-request and issue ASAP in order to improve your experience with this package.
Pay attention, it only works with MD5 algorithm currently.

## Usage (callback)
```javascript
var digestRequest = require('request-digest')('username', 'password');
digestRequest.request({
  host: 'http://test.com',
  path: '/api/v1/test.json',
  port: 80,
  method: 'GET',
  headers: {
    'Custom-Header': 'OneValue',
    'Other-Custom-Header': 'OtherValue'
  }
}, function (error, response, body) {
  if (error) {
    throw error;
  }

  console.log(body);
});
```

## Usage (promise, only >= 1.0.0)

### GET example
```javascript
var digestRequest = require('request-digest')('username', 'password');
digestRequest.requestAsync({
  host: 'http://test.com',
  path: '/api/v1/test.json',
  port: 80,
  method: 'GET',
  excludePort: false,
  headers: {
    'Custom-Header': 'OneValue',
    'Other-Custom-Header': 'OtherValue'
  }
})
.then(function (response) {
  console.log(response.body);
})
.catch(function (error) {
  console.log(error.statusCode);
  console.log(error.body);
});
```

The digest client will make one request to the server, authentication response
is calculated and then the request is made again. Hopefully you will then
be authorized.

If you don't want to specify or to use a specific port. Default port value is 80 but if you set the option `excludePort` to true it won't add a port to your URL.

### POST example

Following is a POST with JSON body example.

```javascript
var digestRequest = require('request-digest')('username', 'password');
digestRequest.requestAsync({
  host: 'http://test.com',
  path: '/api/v1/test',
  port: 80,
  method: 'POST',
  json: true,
  body: {
     myData: 'test'
  },
  headers: {
        'Content-Type': 'application/json'
      }
})
.then(function (response) {
  console.log(response.body);
})
.catch(function (error) {
  console.log(error.statusCode);
  console.log(error.body);
});
```


## Return object
+ Response object :
```javascript
response = {
  response,
  body
};
```
+ Error object :
```javascript
error = {
  response,
  body,
  statusCode
};
```

## Versions:
Pay attention, after version 1.0.0 I have implemented promise support and add a better support of errors with statusCode >= 400.

## Contributions

Feel free to contribute and extend this package and if you have bugs or if you want more specs make an issue. Have fun !

-------------

Made by [Coenen Benjamin](https://twitter.com/BnJ25) with love
