# Device definitions

## Basics

1) `dmt-system` is a system of devices owned and controlled by one user — you

2) Device examples:

- personal computer (desktop or laptop)
- many single board computers like RaspberryPi
- servers

Basically everything except **a)** mobile phones (for now?) **b)** lower level IoT devices that have very basic µcontrollers.

3) Each device runs the same [dmt-proc](DMT-PROC.md)

4) `dmt-proc` is configured and defined to fit the needs of each device using `.def` files (simple text format).

5) All definition files for all user's devices live inside `~/.dmt/user/devices` directory, like this:

```
~/.dmt/user/devices$ ls -b

lab     example1      example2      speaker_roomA       speaker_roomB          tv       my_laptop
```

One subdirectory per device.

6) One of your devices — usually your primary laptop or desktop computer — is treated as a "source of truth" or central point of configuration. Any changes to any device definition is done there. When `~/.dmt` directory is [synced to other devices](UPDATING_DEVICES.md) (on dmt-core updates or just definition changes), device definitions are transfered over to these device.

7) `dmt-proc` can then perform different roles on each (type of) device or just have specific settings tweaked for each device. Speaker definitions are usually more or less similar for each speaker with possible minor differences.

8) `~/.dmt` directory is entirely the same on each device except for one important addition, the `this` pointer (symlink).

<pre>
~/.dmt/user/devices$ ls -la

lab
example1
example2
speaker_roomA
speaker_roomB
tv
my_laptop

<b>this</b> -> speaker_roomA
</pre>

This is a simple and effective way to *pin* some device definition in a particular directory to a specific device.

To create or change the `this` pointer, ssh into a device and run `dmt device select` command to get an interactive shell menu for selecting the correct subdirectory to which to pin this device. You can also do `ln -s tv this` to achieve the same effect manually (if `this` already exists, remove it with `rm this` before `ln -s ...`).

## Device def directory

Let's now move to one example device definition directory:

`~/.dmt/user/devices/lab`

All definition files for the `lab` device actually live one level deeper inside `~/.dmt/user/devices/lab/def` directory — let's call this a `device def directory`.

`~/.dmt/user/devices/[device_name]/def` ≡ **device def directory**

Command-line shorthand to move into "this device's def directory" is `dmt device cd`.

### device.def

All devices have `device.def` inside their def directory. This is the main definition file. They usually have a few other `.def` files, one good example is `content.def`.

The shortest possible `device.def` file looks like this:

```
device: [device_name]
```

a concrete example:

```
device: dmt-new
```

To generalize, **all .def files** follow the same simple format:

```
key: val
  subkeyA: valA
  subkeyB: valB
```

Every "key" can have one or multiple "subkeys" which can have values and/or further subkeys ad infinum.

A little bit more involved **example.def** →

```
key: val
  subkey: val
    subkey: val
    subkey: val
    subkey: val
  subkey: val
    subkey: val
      subkey: val
      subkey: val
        subkey: val

key:
  subkey: val
  subkey:
    subkey: val
    subkey: val
  subkey:
    subkey: val
    subkey: val
    subkey: val

key: val
```

Subkeys are always indented by exactly **two spaces**.

Following the same rules let's create a more practical `device.def` file:

```
device: dmt-new

  service: player
    contentRef: music
    defaultVolume:
      mpv: 70
```

The main key is **device** which has value (= "the name of device") **dmt-new**.

Under that there is a "service" definition for a service with the name "player" and what follows is specific to this service. Note that all of these are already semantic notions and dependent on the semantic parser inside `dmt-proc`, the syntactic definition remains as simple as described above (the notion of *keys*, *subkeys* and *values*).

We see that the *player service* has a subkey **contentRef**. The parser is programmed so that this is understood to reference "contents" that are defined in `content.def` inside the same device def directory as `device.def`:

```
~/.dmt/etc/sample_user/devices/dmt-new/def$ ls
content.def device.def
```

**content.def** example:

```
content: music
  path: ~/Music
```

This simple content definition file defines content with id "music" (values are sometimes called "id"s, especially at root level).

Expanded content.def example file that defines another content and uses more paths for each content could look like this:

```
content: music
  path: ~/Music
  path: ~/Bandcamp-check
  path: ~/Sounds

content: video
  path: ~/Movies
  path: ~/YouTube-Saved
```

Content ids can be anything but each `contentRef` has to match one of them.

All of this is so that the player and its search know where the content of interest lives on your device. ContentRefs can also reference content on other devices! Example: `@my_server/music`. This is explained in detail [elsewhere](use_cases/PLAY_MEDIA_VIA_NAS_SERVER.md).

# device.def

all options reference:

<hr>

## network

```
device: example
  network:
    ip: 192.168.0.20
```

We specify local static ip addresses for devices as a subkey `ip` on (sub)key `network`.


We can also make the device be aware on which network it lives, and so
`network` can reference some network id defined in `~/.dmt/user/def/networks.def` ([see here](USER_DEFINITIONS.md#-networksdef) for more information and reasoning).

```
...
  network: [networkId]
    ip: ...
```

## service: player

```
device: example
...

  service: player
    contentRef: music
    defaultVolume:
      mpv: 70
...
```

Nothing crucial to add here, as shown above, we can set the default `mpv` (media player) volume for the first start before program state is changed and persisted.

Main thing with defining the "player service" is specifying the `contentRefs` which tell the player from where to fetch our local (on device or on [LAN server](use_cases/PLAY_MEDIA_VIA_NAS_SERVER.md)) music.

## service: gui

```
device: example
...

  service: gui
    theme: dmt_default | dmt_mountains | dmt_code | dmt_mist | dmt_space

    idleView: home | player | clock

    nearby:
      disableDeviceSelector: true
      showOnly: device1, device2, device3

...
```

Gui is also defined through a service concept (service in general can also be anything but is a nice and fitting notion for both). Important gui options are as shown in the example:

#### theme

Select one of five built-in themes. Each theme defines a wallpaper for each view (home, player, clock, device, help ...).
"|" (pipe) symbol means "or" in programming speak. So use one of the shown options delimited by the "|" symbol.

#### idleView

When device gui is idle for 30-60s (there are no touch events), the view will automatically switch to whatever we define under `idleView` key. This is useful for `home controllers` (tablets inside our home that show us important information like time and date, temperature and allow us to control music and video on all other devices in the system).

#### nearby

##### disableDeviceSelector

Do not show the option (nearby devices list on the right-hand side) to switch to other devices. This is useful in the use case when children are using tablets and we don't want them to mess with any other device except the current one they are on.

##### showOnly

If we allow device selector (there is no `disableDeviceSelector` key or is set to `false`), then we can only include some specific devices in this list. This is useful if we don't want to allow just any home controller to control some specific rooms.

## Restarting dmt-proc after device definition changes

Usually definition changes require the `dmt-proc` restart, use: `dmt restart`.

Exception is changing the theme or [custom wallpapers](WALLPAPERS.md). In this case `dmt gui reload` suffices.

If you changed the definition of some other device on you "central configuration point" (eg. your main computer), then you need to transfer device definitions over with either:

`dmt copy user@device_ip`

This syncs the entire `~/.dmt` directory to another device and reloads any connected browser gui.

or

`dmt update user@device_ip`

This first does the copy as just described and then restarts the `dmt-proc` on the target device in case `.def` changes need to be picked up.

You can read more about device synchronization [here](UPDATING_DEVICES.md).
