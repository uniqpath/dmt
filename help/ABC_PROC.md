# ABC of DMT

**Rule #0 is that `dmt-proc` (on each device) should always be running.**

When it doesn't it is because of:

- user manually stopped it ✓
- process is restarting because of an update and will be running again shortly ✓

These are valid reasons for it _not to be running_.

There are a few more possible reasons:

- process crashed because of a bug ✖
- underlying OS killed the process for some reason (out of system memory or some other reason) ✖

If one of these is the reason, the process has to be restarted.

Who monitors `dmt-proc` and starts it again in case it crashes or is killed? It is `abc-proc`!

### Rules for always keeping one instance of DMT Process running

1) when `dmt-proc` starts it will try to connect to existing `abc-proc` on the same machine through IPC (unix socket) once
2) if `dmt-proc` initially fails to connect to `abc-proc` it will start it first and then connect to it
3) if `dmt-proc` loses connection to `abc-proc` at any later time it will try to reconnect until it succeeds but it won't try to start it
4) if `abc-proc` notices disconnect with `dmt-proc` and no previous IPC signal *stopping* was emitted, 
   it concludes that `dmt-proc` crashed or was killed and `abc-proc` starts a new `dmt-proc`
5) if on the other hand _stopping_ signal was received then `abc-proc` does nothing,
   it means that `dmt-proc` stopped because user requested stop or restart (including during update)
6) `abc-proc` will restart (upgrade) itself if it detects that contents of `~/.dmt/etc/.abc_version` changed
7) `1 min` cron job checks if `abc-proc` is missing and starts it

### What is achieved with this?

- if `dmt-proc` crashed because of a bug then incident is logged locally to be analyzed (with goal of fixing the bug) but the user **can continue using the device** provided that she avoids the same steps that caused the problem
- if OS killed the process we also log conditions under which this happened and measures can be taken and/or facts learned
- smaller devices like RaspberryPi computers (especially with worn-out sd-cards) can sometimes (rarely) kill any process for no reason and this is out of our control... we need to continue when this happens and this approach enables this. User/developer should know (via receiving a push message on the phone) that this happened and they should analyze if anything is to be done or conclude that it is a rare event of single board computers unpredictability and we have to live with. This is not troublesome because **dmt system** abstracts the problem away. In reality this should almost never happen, our testing shows that on most devices it does not happen at all, we only had one RPi device with occasional unexplained killed `dmt-proc` and even this only twice a few days apart and never since.
- there is no possibility of infinite loops when `abc-proc` and `dmt-proc` would keep trying to restart each other and fail

#### What is (currently) not covered with this approach?

There is still a possibility for `dmt-proc` not to be running when it actually should be.

This would theoretically happen if both `dmt-proc` and `abc-proc` would get killed (the equivalent of `kill -9`) by OS.

`cron` would still restart `abc-proc` within a minute but `abc-proc` would not know it needs to start a new `dmt-proc`. See above rules (eg. `abc-proc` only starts `dmt-proc` when it detects IPC disconnect, it cannot just blindly start `dmt-proc` if it is not running because user may have manually stopped `dmt-proc` because she actually doesn't want it to be running).

We think that this happening is not realistic since `abc-proc` is very simple and small and doing almost nothing. We will have to test in practice and if this turns out like a realistic option we have to decide and figure out a solution by adding some complexity or decide it is not worth it since it almost never happens. For now this is not a crucial open question, it will get worked on as needed.

#### How can you test this functionality?

Make sure that on RaspberryPi you add the following [lines](https://github.com/uniqpath/dmt/blob/main/etc/cron/readme.txt) to cron (using `crontab -e`).

##### Test cron restarting `abc-proc`:

1. `ps aux | grep abc-proc` whould report something like:

   ```
   root     10899  0.0  4.8 153552 43524 ?        Ssl  Aug14   1:06 /root/n/bin/node --unhandled-rejections=strict --experimental-specifier-resolution=node --experimental-modules /root/.dmt/core/node/controller/daemons/abc-proc.js
   ```

2. Note the process pid (`10899`) and issue `kill -9 10899` to kill the process.

   Type `ps aux | grep abc-proc` again and notice `abc-proc.js` line missing. Try this command again after 1 minute and the process should be running again with a different pid (process identifier).

##### Test `abc-proc` restarting `dmt-proc`:

Do similar as above but for `dmt-proc`. When you kill active `dmt-proc` using `kill -9 [dmtPid]` you should almost immediately see a new `dmt-proc` with a different pid. Also check both logs:

`dmt log` or `tail -n 100 ~/.dmt/log/dmt.log`

and `tail -n 100 ~/.dmt/log/abc.log`

abc.log:

```
dmt-new 10899 8/15/2021, 11:21:44 PM ∞ 🛑😱⚠️ DMT process crashed or got killed
dmt-new 10899 8/15/2021, 11:21:45 PM (+1000ms) ∞ ✨ Spawning a new dmt-proc ...
```

dmt.log:

```
dmt-new 19392 8/15/2021, 10:57:59 PM (+187541ms) ∞ Current media just finished
dmt-new 5225 8/15/2021, 11:21:52 PM ∞ dmt-proc booting ...
...
dmt-new 5225 8/15/2021, 11:22:00 PM (+04ms) ∞ DMT IPC listening on /root/.dmt/state/ipc.dmt-proc.sock
dmt-new 5225 8/15/2021, 11:22:00 PM (+21ms) ∞ ✓ Connected to ABC process
dmt-new 5225 8/15/2021, 11:22:00 PM (+387ms) ∞ ABC v1 (uptime: 30 days)
```

We can see that `dmt-proc` with pid `19392` terminated abruptly with nothing written in log (it had no chance) and then new `dmt-proc` with pid `5225` was started by `abc-proc`.

⚠️ If you try killing `dmt-proc` again after it is just starting you have to wait until it is fully connected to `abc-proc` or else it will not get restarted. This usually takes around `5s` after `dmt-proc` starts booting.

```
dmt-new 15543 10/13/2021, 1:15:16 PM (+53ms) ∞ ✓ Connected to ABC process
dmt-new 15543 10/13/2021, 1:15:16 PM (+137ms) ∞ ABC v0 (uptime: 9 minutes)
```

Info from unix manual:

The command `kill` sends the specified signal to the specified process or process group. If no signal is specified, the `TERM` signal is sent. The `TERM` signal will kill processes which do not catch this signal. For other processes, it may be necessary to use the `KILL` (`9`) signal, since this signal cannot be caught.

Note: and this is also what happens when process is killed by OS in "extreme conditions".