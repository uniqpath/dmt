## DMT FRONTEND framework

DMT Frontend is  just one of DMT Apps. It provides "DMT Frontend frontend" with Clock and the rest of homescreen and also provides DMT Apps integrated app (through claimed route) which lists all the other DMT apps and navigates to them. 

Each DMT App consists of:

- frontend (static gui) 
- DMT App Engine (which is a node.js JS code which plugs into DMT ENGINE and can use DMT Api on each device). 

![dmt frontend framework](https://raw.githubusercontent.com/uniqpath/info/master/assets/img/dmt_apps.png)

DMT Apps' frontends communicate with corresponding DMT App Engines and in general DMT ENGINE through [Connectome](https://github.com/uniqpath/connectome).

### App directory structure

**DMT SYSTEM apps** are in `~/.dmt/apps/[appName]`.

If app only has static gui without DMT ENGINE plugin (hook) then gui can be directly in `[appName]` directory (eg. `dmt-insight`):

```
~/.dmt/apps/dmt-insight/index.html
~/.dmt/apps/dmt-insight/assets/*
```

If it has DMT Plugin hook (`index.js`) as well then gui can be moved to `/gui` subdir for nicer separation.

```
~/.dmt/apps/dmt-search/gui/index.html
~/.dmt/apps/dmt-search/gui/assets/*
```

And hook with any importable helper libs or defined **Connectome protocols** etc. is here:

```
~/.dmt/apps/dmt-search/index.js
~/.dmt/apps/dmt-search/lib/*
~/.dmt/apps/dmt-search/protocols/*
```

Same with **DMT USER apps**.

Here is a sample `~/.dmt/user/devices/this/scripts/prepare_engine` which is used to deploy DMT SYSTEM apps and two user apps:

```bash
#!/bin/bash

# import dirsync function
source ~/.dmt/etc/.bash_aliases_bundle 

DMT_PACKAGES="$HOME/Projects/dmt-system/packages"
DMT_APPS="$HOME/.dmt/apps"
DMT_USER_APPS="$HOME/.dmt/user/apps"

# DMT SYSTEM apps sync

# dmt-mobile

mkdir -p "$DMT_APPS/dmt-mobile"; cd $_
SOURCE="$DMT_PACKAGES/dmt-mobile/dist"
dirsync "$SOURCE" .

# dmt-insight

mkdir -p "$DMT_APPS/dmt-insight"; cd $_
SOURCE="$DMT_PACKAGES/dmt-insight/dist"
dirsync "$SOURCE" .

# dmt-search

mkdir -p "$DMT_APPS/dmt-search/gui"; cd $_
SOURCE="$DMT_PACKAGES/dmt-search/gui/dist"
dirsync "$SOURCE" .

mkdir -p "$DMT_APPS/dmt-search"; cd $_
SOURCE="$DMT_PACKAGES/dmt-search"
dirsync --exclude gui "$SOURCE" .

printf "${GREEN}✓ Updated ~/.dmt/apps${NC}\n"

# -----------
#  USER APPS |
# -----------

# dmt-blinds

mkdir -p "$DMT_USER_APPS/dmt-blinds"; cd $_
SOURCE="$DMT_PACKAGES/dmt-blinds/dist"
dirsync "$SOURCE" .

# dmt-router-restart

mkdir -p "$DMT_USER_APPS/dmt-router-restart"; cd $_
SOURCE="$DMT_PACKAGES/dmt-router-restart/dist"
dirsync "$SOURCE" .

printf "${GREEN}✓ Updated ~/.dmt/user/apps${NC}\n"
```

Note the `--exclude` option for `dirsync` when syncing over dmt-search hook while retaining previously synced `gui` subdir.

## ⚠️ Frontend routing basics -- not yet in use

Examples are for Svelte (using [Tinro router](https://github.com/AlexxNB/tinro)):

Links to routes should have `/[appName]` prefix:

```html
<a href="/dmt-search/profile">My Profile</a>
```

Views look like this:

```html
<Route path="/dmt-search">
  <Home {connector} />
</Route>

<Route path="/dmt-search/profile">
  <h2>MY PROFILE</h2>
</Route>
```

It is recommended that in `App.svelte` you have these lines

```js
import { Route, router, active } from 'tinro';

if(window.location.pathname == '/') {
  router.goto('/dmt-search');
}
```

This means that when you run a development server it will all work since navigation to `localhost:3000` will then redirect to the correct route:

```
https://localhost:3000 → 301 REDIRECT → https://localhost:3000/dmt-search
```

Resources are best fetched with relative urls with no starting slash:

```html
<img src="img/logo.svg" alt="logo" />
```



