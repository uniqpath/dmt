# DMT GUI KIT

Svelte components and helper utilities used from DMT GUI, DMT MOBILE and other [DMT APPS](https://github.com/uniqpath/dmt/blob/main/help/DMT_APPS_SVELTE.md).

Use `npm run build` or `pnpm build` to produce the bundle.

Bundle ships with [DMT ENGINE](https://github.com/uniqpath/dmt) and this is an example of how to import it in `package.json`:

```json
"dependencies": {
    "dmt-gui-kit": "~/.dmt/core/lib/dmt-gui-kit"
}
```

## Important notice for developing components

If components have any dependencies, for example:

```js
import { BROWSER, DEV } from 'esm-env';
```

then these packages (`esm-env`) have to be added in `package.json` of this repository:

```
  "dependencies": {
    "esm-env": "^1.0.0"
  },
```

⚠️ Do not add deps that components use in production under `devDependencies`, always add them under `dependencies`

⚠️ On the other hand add everything else (Svelte etc.) under `devDependencies` instead of `dependencies`

Only dependencies listed in `dependencies` field will be packaged into `~/.dmt/core/lib/dmt-gui-kit` on each **DMT ENGINE** release.
