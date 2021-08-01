## DMT APP INSTALL

Run `dmt integrate` inside an _installable DMT app directory_.

This will install or **integrate the app into DMT ENGINE**. It is not called simply "dmt install" because this would mean installing the DMT ENGINE somewhere, to avoid confusion and be even more descriptive we call installing apps into the engine "to integrate".

See [svelte-demo](https://github.com/dmtsys/svelte-demo) for a nice example of a simple DMT-installable app.

### How it works?

`dmt integrate` command will look into `dmt-install` subdirectory of installable app and find `settings.def` and `before-install` / `after-install` scripts (optional) or `dmt-install` script.

If `dmt-install/dmt-install` script is present then `dmt integrate` only runs this script.

### settings.def

If `settings.def` file is present then app frontend is built according to these settings, for example:

```
base: dmt-search
build: dist
target: user
```

- `base` — where the app will be mounted on the url path, for example: `localhost:7777/dmt-search`
- `build` — directory with frontend result which is synced into `~/.dmt/user/apps` (user) or `~/.dmt-here/apps` (device)
- `target` — `device` or `user`

### DMT hook

If installable app has a `dmt` directory then this is synced to `~/.dmt/user/apps/[app_name]/dmt`. This directory contains `index.js` which is integrated into DMT ENGINE. This directory is called DMT hook and should be used for backend logic, not to serve the frontend or things like that (for that use SSR handler).

If there is any other tasks that need to be performed after building the app and syncing over the artefacts and any hook (`dmt` subdir), then these tasks can be specified in `before-install` and `after-install` scripts which will run at this point. It will run from the perspective of installed app (current directory will be `~/.dmt/user/apps/[app_name]`).

### SSR handler

Installable apps can return SSR (server-side rendering) handler from `index.js`:

```js
export async function init(program) {
  const { handler } = await import('./handler.js');
  return { handler };
}
```

This works with SvelteKit and other apps that use express-compatible server middleware (see **svelte-demo**).

### Serving static frontends

If app has `index.html` then directory is served statically without SSR.

### Special options

- `dmt integrate --reset` — will first delete the target app directory if it exists instead of syncing over it
