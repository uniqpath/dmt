<!-- <img src="https://github.com/uniqpath/info/blob/master/assets/img/dmt-logo.png?raw=true" width="500px"> -->
<img src="https://github.com/uniqpath/info/blob/master/assets/img/dmt-logo-with-tagline.png?raw=true&ver=5" width="600px">

<img src="https://github.com/uniqpath/info/blob/master/assets/img/screens/home_inside_brave_new_tab.png?raw=true&v=2">

## 🔌 Prerequisites

### Linux (debian) deps

```
sudo apt-get install -y curl git
```

### Other linux deps

See your os manual.

### macOS deps

```
brew install git
```

### Node.js

recommended way on both Linux and macOS:

```
curl -L https://git.io/n-install | bash
```

This install `node.js` via [n](https://github.com/tj/n). If you already have system version of `node.js`, try with that. It has to be higher than `v8.0`.

## 🌀 Install DMT

The best technology helps you become more isolated from uncertainty and unpredicatble actions of _"the external world"_. The most useful digital systems let you progress at your own stable pace and help you learn more useful and true information instead of dissipating your attention needlessly. The greatest information systems of the future have no direct incentives to extract "value" from its users. **DMT** is progressing each day and there is no exact path forward, just a few basic assumptions of what we want to achieve. One of the clearest goals is: taking back individual control of our destinies while still staying connected in coherent but dynamic whole.

### Pro way ✓✓

```bash
curl -L https://raw.githubusercontent.com/uniqpath/dmt/master/shell/web-one-line-install-script | bash
```

```bash
source ~/.bash_aliases
dmt help
```
### Beginner way ✓

```bash
cd ~
git clone https://github.com/uniqpath/dmt .dmt
cd .dmt
git clone https://github.com/uniqpath/dmt-core core
git clone https://github.com/uniqpath/dmt-bin bin
./dmt symlink
```

```bash
cd ~/.dmt
./dmt help
```

Beginner, move to Pro →

```bash
./install full
```

## Usage

Get the basic information about current device (you are invited to install `dmt` on as many of your devices as allowed).

Beginner ✓

```bash
cd ~/.dmt
./dmt info
```

Pro ✓✓

```
dmt info
```

### 💡Start the process

_DMT background process_ is like your digital servant that can fullfill a lot of your digital wishes and not tell anyone about it.

Beginner ✓

```bash
cd ~/.dmt
./dmt start
```

Pro ✓✓

```
dmt start
```

Use `dmt stop` to full terminate the background process.

### See what is going on inside the process

Beginner ✓

```bash
cd ~/.dmt
./dmt log
```

Pro ✓✓

```
dmt log
```

If you wish to have immediate feedback, try `dmt stop` and `dmt startfg` to start the _dmt process_ in foreground, not background. You will be able to observe all the log output as it happens in realtime.

## ➬ Update request

To pull stable changes from github from the three repositories: [dmt](https://github.com/uniqpath/dmt), [dmt-core](https://github.com/uniqpath/dmt-core), [dmt-bin](https://github.com/uniqpath/dmt-bin), use this command:

```
dmt next
```

## 🦄 Congrats!

This was just the zeroth step, [now you can start](https://github.com/uniqpath/info).

<img src="https://github.com/uniqpath/info/blob/master/assets/img/dmt-processor.png?raw=true">

