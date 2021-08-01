# ⚠️ This repo is obsolete

[DMT GUI KIT](https://github.com/dmtsys/dmt-gui-kit) will replace it ...

# DMT Frontend Components

Component library used in DMT Apps.

## Install

Usually no need to install, comes included in DMT ENGINE and DMT APPS reference that version.

## Usage

```js
import { Button } from 'dmt-frontend-components';
```

See [src/index.js](./src/index.js) for all exported components.

The library also includes a CSS file for various styling. Copy [src/assets](./src/assets) into your project and include [src/assets/css/global.css](./src/assets/css/global.css) in your `index.html`.
UPDATE1: don't include in index.html but import in main.js after moving to vite!

UPDATE2, check hot to automatically copy this asset in vite...
this is how it is done in dmt-connect currently (which is still on rollup directly instead of vite)

copy({
  targets: [{ src: './node_modules/dmt-frontend-components/src/assets', dest: 'public/build' }]
}),
