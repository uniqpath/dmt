## Static GUIs

This document focuses on building **static** guis that can be served from dmt-proc.

In case of SvelteKit this means SSR disabled and static bundle prerendered.

Svelte does this by default so all simple Svelte apps with no routing can be served as well.

For apps with any type of client-side routing use SvelteKit or just use SvelteKit always.

**Why would you still use pure Svelte?**

- if you are sure no routing will be needed
- you want to keep it simple and avoid SvelteKit before 1.0
- you can always easily move from Svelte to SvelteKit when your app needs routes OR when it needs SSR (and when we add this capability to DMT)

You can use pure Svelte and then refactor to SvelteKit if routing is later needed, if you know you won't need this and also won't be utilizing SSR.

### SvelteKit

Disable SSR with `./src/hooks.ts`:

```js
// disable SSR
export async function handle({ event, resolve }) {
    return resolve(event, { ssr: false });
}
```

Add this to `svelte.config.js`:

```js
kit: {
    adapter: adapter(),
    trailingSlash: 'always',
    paths: {
      base: '/my-app'
    },
    prerender: {
      default: true
    },
    ...
```

Run `npm run build` and then:

```
mv build ~/.dmt/user/apps/my-app
```

(or use app install script if provided)

Restart `dmt-proc` if app is added for the first time (later restart are not needed anymore). First time `dmt-proc` needs to learn about a new subdirectory in `~/.dmt/user/apps`.

App will be served at `localhost:7777/my-app`.

If you have any routes it will all work, for example `localhost:7777/my-app/about`.

⚠️ Do not forget to use `base` functionality correctly, you have to:

```js
import { base } from "$app/paths";
```

and then

```html
<a href="{base}/about">About</a>
```

### Svelte

[todo / soon]

[DMT MOBILE](https://github.com/dmtsys/dmt-mobile) is an example of such app. SvelteKit is not needed here at all (for now at least).

## SSR GUIs

[todo]