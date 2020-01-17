# User definitions

In addition to global `~/.dmt/def` directory and individual device's def directories, there is also an user-level def directory —

### 📁 **User definitions directory:**

`~/.dmt/user/def`

Here we define things that are equally available to all of our devices.

Notable files in this directory are:

### 💾 user.def

Example `user.def` file:

```
user:
```

That's it, no special definitions! In this case `user.def` files could also be missing.

We do have a few possible subkeys as options:

#### shell

```
user:
  shell: full | full_without_prompt
```

`shell` subkey has two possible values: `full` and `full_without_prompt`.<br>
This turns on the full bash shell with or without prompt customizations.

Read more in [shell framework section](SHELL_FRAMEWORK.md).

#### disableStartNotification

```
user:
  disableStartNotification: true
```

If we add this subkey, we will stop getting this os-level notification on each `dmt-proc` start::

![dmt_start_notification](https://github.com/uniqpath/info/blob/master/assets/img/dmt-start/macos-notification.png?raw=true)

This helps explain to new users what to do next after `dmt-proc` is started. <br>
After a while it can become annoying and this is a way to turn it off.

### 💾 networks.def

Here we define one or more lan networks. Example:

```
network: home
  latlng: 45.1605, 15.1663

network: office
  latlng: 45.1705, 15.1563
```

There are some other options here but for now we mention only the `latlng` subkey. In this way we define the geo position of our place(s) which remains fully private all times. When some device is set to be a part of some network like this:

**device.def**:
```
device: tv
  network: home
```

it learns what its geo position is and it can display (locally calculated) sunrise and sunset times at the bottom of the home view.

Do not tie your movable devices (eg. laptop) to a specific network, you just have to tie a few permanent devices and other devices will learn on what network they are dynamically by listening to lan broadcasts by devices with specified known network.

### 💾 gui_views.def

This is where you can define your custom wallpaper themes.

See the [wallpapers section](WALLPAPERS.md).
