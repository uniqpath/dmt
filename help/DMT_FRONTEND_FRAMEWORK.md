Work in progress

### App structure in directories

DMT SYSTEM apps are in `~/.dmt/apps/[appName]`.

If app only has static gui without DMT ENGINE plugin (hook) then gui can be directly in this directory:

```
~/.dmt/apps/dmt-insight/index.html
~/.dmt/apps/dmt-insight/assets/*
```

If it has DMT Plugin hook (`index.js`)as well then gui can be moved to `/gui` subdir for nicer separation.

```
~/.dmt/apps/dmt-search/gui/index.html
~/.dmt/apps/dmt-search/gui/assets/*
```

And hook with any imported helper libs etc is here:

```
~/.dmt/apps/dmt-search/index.js
~/.dmt/apps/dmt-search/lib/*
```

Same with DMT USER apps.

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