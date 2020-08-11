### Use case:

# Playing media files stored on local network-attached storage (NAS)

## Background

When designing you home media setup you will want to designate one device with a relatively bigger storage space as your **NAS** (Network Attached Storage).

```
                                                    +-----------------+
                                                    |                 |
                                                    | SMART SPEAKER 1 |
                                                    |                 |
                                                    |   BUILT-IN RPi  |
                                                    |     COMPUTER    |
                                                    |                 |
                                                    +-----------------+
                                                    |                 |   WIFI or CABLED
+-----------------------------+     LOGICAL MOUNT   |  MOUNTED SHARE  |   CONNECTION TO
|                             |             XXXXXX  |  FROM NAS       |   THE ROUTER
|                             |          XXX        |                 |
|                             |         XX          +-----------------+
|                             |        XX
|        NAS DEVICE           |       XX
|                             |       X
|        (static ip)          |      X
|                             |     XX                  +          WIFI          +
|                             |    XX                   |                        |
+-----------------------------+  XXX                    |                        |
| STORAGE SPACE               | XX                     ++------------------------++
|                             |                        |                          |
| 200GB, 1TB, 10TB, 100TB etc |   CABLED CONNECTION    |                          |
|                             +------------------------+       NETWORK ROUTER     |
| MEDIA FILES ARE KEPT HERE   |   IS PREFERRED         |                          |
|                             |                        |                          |
+-----------------------------+                        +--------------------------+
```

You have a few options for NAS device:

**1)** Cheapest and simplest - good for learning and experimenting:

Designate one of you RaspberryPi computers to be a NAS. Put a big SD card into it, 200GB should be ok. Install [SAMBA](../SAMBA.md) service on it.

Weakness here is that you really should not put your data **only** on an SD card, you need a proper backup. SD cards are less reliable than HDD/SSD drives.

**2)** Devices like Intel NUC (?), Synology or even bigger servers for professional use (with internal or external storage).

We will focus and guide you through the first option but in general it should be more or less the same for any other system. You just have to make sure you somehow mount the NAS shares to your local devices, usually through SMB (Samba).

## dmt setup

We can abstract away all the details of how exactly you have setup the local mounts and you should have something like this configured now:

server's `content.def` (`~/.dmt/user/devices/server/def/content.def`):

```
content: music
  path: ~/Storage/Music

content: movies
  path: ~/Storage/Movies
```

and `device.def` can be:

```
device: server
  network:
    ip: 192.168.0.20
```

`server` is the name of device and is important because we will reference this device in our `contentRef` subkey on each player device. (For now) we have to assign a static ip to each device that acts as a media content server. We pin device's mac address to a static ip on our router and then list the ip address as shown above.

We can also make the device be aware on which network it lives, like this:

```
...
  network: [networkId]
    ip: ...
```

See [this section](../USER_DEFINITIONS.md#-networksdef) for more information.

On (each) player device you will have mounts similar to this:

<pre>
ls -la ~/Media

root@speaker:~$ ls -b ~/Media

<b>Movies</b>
<b>Music</b>
</pre>

When you `cd` into one of these, for example:

```
cd ~/Media/Music
```

and do `ls` you should see the files that actually reside on the server under `~/Storage/Music` but are mounted locally in `~/Media/Music`.

`device.def` on your speaker and other devices should look like this:

```
device: speaker1

  service: player
    contentRef: @server/music
    defaultVolume:
      mpv: 70
```

As you can see, `contentRef` is made of two parts in this case: `@deviceName/contentId`. A more basic example would be `contentRef: music` and it would signify a local content with id `music`. Search would then be performed locally on that content instead of going through a [RPC](https://github.com/uniqpath/info/tree/master/docs#search-architecture) (remote-procedure-call) and executing on the server's local filesystem.

You also need one other special file under your device's def directory — `mountpoints.def`. It should look like this:

```
provider: server
  map:
    from: /home/your_user/Storage/Music
    to: ~/Media/Music
```

Provider value (`server` in this example) has to match the device name (id) where the data is coming from (`device: server`).

Just to clarify which files are needed again:

<pre>
~/.dmt/user/devices/this/def $ ls -b

<b>content.def</b>
<b>device.def</b>
<b>mountpoints.def</b>
</pre>

`mountpoints.def` is needed because search service on the server will return local paths of search results (media files) and player service on each device has to map them to how they actually appear locally.

After you have this setup the search in the interface:

![mpv_control](https://github.com/uniqpath/info/blob/master/assets/img/screens/screen8.jpg?raw=true)

will work flawlessly and without further setup or thinking. It's like **'configure once, enjoy forever'**. 👌🚀
