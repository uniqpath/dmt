# Wallpapers

## Background and motivation

Powerful customization is one of central aspects of `dmt-system`. The most powerful visual customization is the background image (≡ wallpaper) of each device with a screen.

There are five themes (this means one wallpaper per view per theme) already included in this repo.

## How to change the theme?

You change device's theme by editing its [device.def](DEVICE_DEFINITIONS.md) file and specifying the *subkey* `theme` on `service: gui`, like this:

```
device: example
...

  service: gui
    theme: dmt_default | dmt_mountains | dmt_code | dmt_mist | dmt_space
    ...
```

Choose and specify one of five built-in themes. Each theme defines a wallpaper for each view (home, player, clock, device, help ...). "|" (pipe) symbol means "or" in programming speak. So use one of the shown options delimited by the "|" symbol.

Check this source file — [def/gui_views.def](https://github.com/uniqpath/dmt/blob/master/def/gui_views.def) if you want to see how exactly are these default themes predefined.

Actual images live inside the `~/.dmt/core/node/dmt-gui/gui-frontend-core/common_assets/wallpapers` directory.

If you want to override some of the views with your custom wallpapers for a particular device, you have to create a `gui_views.def` file inside the `~/.dmt/user/devices/[device_name]/def` directory and specify something like this:

```
view: clock
  wallpaper: /user/wallpapers/my_custom_clock_wallpaper.jpg

view: player
  wallpaper: /user/wallpapers/my_custom_player_wallpaper.jpg
```

You then place both files (`my_custom_clock_wallpaper` and `my_custom_player_wallpaper`) inside the `~/.dmt/user/wallpapers` directory. As you can see, wallpapers live inside two directories:

- `~/.dmt/user/wallpapers` (user wallpapers)
- `~/.dmt/core/node/dmt-gui/gui-frontend-core/common_assets/wallpapers` (built-in wallpapers)

You refer to pre-defined ones in `gui_views.def` by `/wallpapers/...` prefix and you refer to user-added wallpapers with `/user/wallpapers` prefix.

There are some additional options on `wallpaper` subkeys:

#### protectVisibility

If you specify:
```
view: home
  wallpaper: /user/wallpapers/my_custom_home_wallpaper.jpg
    protectVisibility: true
```

Then this will put crucial information (like time and date on home screen) inside a semi-transparent dark rectangle so it is visible no matter how bright the wallpaper is at that spot.

## Creating your own themes

Defining wallpapers for many views on multiple devices can quickly become tiresome and not elegant. There is a better solution and you can use it by creating a `~/.dmt/user/def/gui_views.def` file with content similar to this:

```
view: home
  wallpaper: /user/wallpapers/my_fantastic_theme1/home.jpg
    theme: my_fantastic_theme1
  wallpaper: /user/wallpapers/my_fantastic_theme2/home.jpg
    theme: my_fantastic_theme2

view: player
  wallpaper: /user/wallpapers/my_fantastic_theme1/player.jpg
    theme: my_fantastic_theme1
  wallpaper: /user/wallpapers/my_fantastic_theme2/player.jpg
    theme: my_fantastic_theme2

view: clock
  wallpaper: /user/wallpapers/my_fantastic_theme1/clock.jpg
    theme: my_fantastic_theme1
  wallpaper: /user/wallpapers/my_fantastic_theme2/clock.jpg
    theme: my_fantastic_theme2

...
```

And then you can use these themes inside `service: gui` as you would use the built-in ones starting with `dmt-` prefix.

Example of `device.def` file with your custom theme:

```
device: example1
...

  service: gui
    theme: my_fantastic_theme1
    ...
```

or:

```
device: example2
...

  service: gui
    theme: my_fantastic_theme2
    ...
```

You can still have per-device `gui_views.def` too where you override any wallpaper for view that you want to still differ from your own predefined themes.

## Forcing GUIs to apply new wallpapers

You can either restart the dmt process by `dmt restart` but this is actually not needed and this option is faster:

`dmt gui reload`

This will send the request to browser to reload the view. You can also do:

`dmt gui reload [view]` where `[view]` is one of: `home | player | clock | device | help` to switch to another view from currently displayed one.

Or you can use `dmt gui switch [deviceIp]` to swith all currently open GUIs for this device to connect to some other dmt device on your local network.

This was a digression, back to reloading after wallpaper / theme changes - we have described hot to reload the gui of your local device. What if you changed options for some other device? Then you execute:

`dmt update user@device_ip` (`update` is enough, no need to `renew` eg. to restart the `dmt-proc` on that device).

## Future plans

As of now, *wallpapers are static*, once set, they stay that way. In the future we will add progammability so that wallpapers can change dynamically based on different conditions — time of day, outside weather, holidays etc.

## Default themes example screens

This is how default themes look (example for `home` and `player` screen):

### Built-in theme 1 — DMT_DEFAULT

![dmt_default_home](https://github.com/uniqpath/info/blob/master/assets/img/themes/dmt_default_home.png?raw=true)
![dmt_default_player](https://github.com/uniqpath/info/blob/master/assets/img/themes/dmt_default_player.png?raw=true)

### Built-in theme 2 — DMT_MOUNTAINS

![dmt_mountains_home](https://github.com/uniqpath/info/blob/master/assets/img/themes/dmt_mountains_home.png?raw=true)
![dmt_mountains_player](https://github.com/uniqpath/info/blob/master/assets/img/themes/dmt_mountains_player.png?raw=true)

### Built-in theme 3 — DMT_CODE

![dmt_code_home](https://github.com/uniqpath/info/blob/master/assets/img/themes/dmt_code_home.png?raw=true)
![dmt_code_player](https://github.com/uniqpath/info/blob/master/assets/img/themes/dmt_code_player.png?raw=true)

### Built-in theme 4 — DMT_MIST

![dmt_mist_home](https://github.com/uniqpath/info/blob/master/assets/img/themes/dmt_mist_home.png?raw=true)
![dmt_mist_player](https://github.com/uniqpath/info/blob/master/assets/img/themes/dmt_mist_player.png?raw=true)

### Built-in theme 5 — DMT_SPACE

![dmt_space_home](https://github.com/uniqpath/info/blob/master/assets/img/themes/dmt_space_home.png?raw=true)
![dmt_space_player](https://github.com/uniqpath/info/blob/master/assets/img/themes/dmt_space_player.png?raw=true)

