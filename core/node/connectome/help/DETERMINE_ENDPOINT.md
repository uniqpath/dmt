## Determine Endpoint

Function source is [here](https://github.com/uniqpath/connectome/blob/main/src/client/connect/determineEndpoint.js).

```js
function determineEndpoint({ endpoint, host, port }) {
  ...
}
```

### Endpoint specified explicitly

Endpoint can be specified exactly like this:

```
ws://example.com
ws://192.168.0.10:7780
wss://example.com
wss://example.com:7780
```

in this case `host` and `port` are ignored even if passed into function.

If `endpoint` is `/something` then it is rewritten as `ws[s]://origin/something`. Origin is `window.location.host` (place where our website is served from) and `wss` is used if protocol over which our website is served is `https` as opposed to plain `http`.

### Endpoint is not specified

#### a) Connection is from node.js process

Endpoint is constructed from `host` and `port` as shown — if host is missing then `localhost` is used.

```js
endpoint = `ws://${host || 'localhost'}:${port}`;
```

#### b) Connection is from browser

If no `host` is specified then `window.location.hostname` is used.

Websocket protocol (`ws` vs. `wss`) is determined from `http/s` origin.

⚠️ If website is served from `https` then `port` is ignored and endpoint becomes `wss://host/ws`. We never try to connect to some port directly but always use `/ws` route which has to be secured with https certificate and reverse proxied to appropriate port.

If website is served from `http` and  `port` is passed in then we use it to construct the endpoint (`ws://host:port`).

If website is served from `http` and no `port` is provided then we connect to `ws://host:[window.location.port]`.

### Conclusion

This approach makes it very eash to connect to the right endpoint by almost always simply using:

```js
import { connect } from 'connectome';

const connector = connect(); // will connect to the origin server
```

If we are serving the website from `https` then we just have to enable the proxied endpoint at `/ws` :

```
$HTTP["url"] =~ "^/ws" {
  proxy.server = ( "" => ( ( "host" => "127.0.0.1", "port" => "7780" ) ) )
  proxy.header = ( "upgrade" => "enable" )
}
```

(Example configuration for lighttpd)

This will upgrade connections coming to `/ws` from `http[s]` to websocket protocol listening at port 7780 (usually Connectome server).