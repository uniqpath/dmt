## dmt-proc debugging

### Background

`dmt log` command shows information from  `~/.dmt/log/dmt.log`. `dmt-proc` writes a self-rotating log in this file and it also outputs the same information when run in foreground with `dmt run` instead of `dmt start`.

### Enable debugging

It is possible to output more information to the log by calling this command in CLI:

`dmt debug`

or

`dmt debug on`

This setting will then immediately (no need to restart `dmt-proc`) start showing every output from `dmt-proc` that was logged with `log.debug(...)` instead of normal `log.write(...)`.

To turn debugging off use:

`dmt debug off`

### Additional debugging information

To show yet more debugging info you can use

`dmt debug edit`

and then remove comments in front of corresponding entries:

```
#mpv
#mpv-ipc
#ws
#lanbus
#network-detect
#mqtt-sent
#mqtt-received
```

for example to enable `lanbus` and `mpv-ipc` debug messages remove `#` symbol in front of them like so:

```
#mpv
mpv-ipc
#ws
lanbus
#network-detect
#mqtt-sent
#mqtt-received
```

After you save (CTRL+O, ENTER) in nano editor, `dmt-proc` will immediately start showing this additional info.

#### Special case - mpv logging

Since this shows log output from `mpv` process and has nothing to do with what is happening in `dmt-proc`, we enable logging from `mpv` process like this:

1. see how `mpv` is usually running because `dmt-proc` starts it on first run: `ps aux | grep mpv`, you should see something like: `mpv --idle --really-quiet --msg-level=ipc=v ...`
2. `dmt debug edit`, uncomment `mpv` entry, save with CTRL+O, can also exit nano editor: CTRL+X (this step can also be done after step 4 but always before next `dmt start`)
3. `dmt stop` (or CTRL+C on `dmt run`)
4. `killall mpv`, confirm that `mpv` is not running anymore at the moment with `ps aux | grep mpv`
5. `dmt start`, you can check with `ps aux | grep mpv` that mpv is now running and was started with additional flag `(--log-file /root/.dmt/log/mpv.log)` to output its log into `~/.dmt/log/mpv.log`
6. you can use `tail -f ~/.dmt/log/mpv.log` and try changing volume through dmt gui, you should see: `[  46.405][v][cplayer] Set property: volume=55 -> 1` etc.
7. when done, do the reverse steps: `dmt stop`, `dmt debug off`, `killall mpv`, `dmt start` and also `rm ~/.dmt/log/mpv.log` if you want

