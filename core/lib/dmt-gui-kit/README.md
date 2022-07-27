# DMT GUI KIT

Svelte components and helper utilities used from DMT GUI, [DMT MOBILE](https://github.com/dmtsys/dmt-mobile) and other [DMT APPS](https://github.com/uniqpath/dmt/blob/main/help/DMT_APPS_SVELTE.md).

Use `npm run package` to produce the bundle.

Bundle ships with [DMT ENGINE](https://github.com/uniqpath/dmt/tree/main/core/lib/dmt-gui-kit) as well and this is how DMT MOBILE [imports it](https://github.com/dmtsys/dmt-mobile/blob/main/package.json):

```
"dependencies": {
  "connectome": "~/.dmt/core/node/connectome",
  "dmt-gui-kit": "~/.dmt/core/lib/dmt-gui-kit"
}
```
