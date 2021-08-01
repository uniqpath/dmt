# DMT COMMON

## colors

```js
import { colors } from 'dmt/common';
```

Example:

```js
console.log(colors.red("Danger"));
```

**dmt** `colors` is actually [Kleur](https://github.com/lukeed/kleur) with added ability to output contents of objects (using `util.inspect` internally):

```js
console.log(colors.green({ a: 1 }));
```
Output:

> { a: 1 }

(in green)

While Kleur outputs

> [object Object]

(in green :)

## dmtPath

```js
import { dmtPath } from 'dmt/common';
```
DMT ENGINE directory on device file system.

```js
console.log(dmtPath);
```
Output:

>  /home/user/.dmt

## dmtHerePath

```js
import { dmtHerePath } from 'dmt/common';
```
Local directory on device for saving various pieces of data.

```js
console.log(dmtHerePath);
```
Output:

> /home/user/.dmt-here

### isMacOS,  isWindows,  isLinux

```js
import { isMacOS,  isWindows,  isLinux } from 'dmt/common';
```
Functions returning boolean, indicating the operating system.

```js
console.log(isLinux());
```
Output:

> True` | `False 

### isRPi

```js
import { isRPi } from 'dmt/common';
```
Function returning boolean if device is RaspberryPi computer.

```js
console.log(isRPi());
```
Output:

> True` | `False

### formatNumber

```js
import { formatNumber } from 'dmt/common';
```

