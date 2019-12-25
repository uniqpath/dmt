# DMT Replicate

## Basics

The `~/.dmt` directory (with everything that is needed for `dmt-proc` to run) can land on a machine in one of these ways:

1) manual copy via some storage medium
2) by using the [install instructions](GETTING_STARTED.md)
3) by using `dmt update user@device_ip` command
4) **by self-replication**

<hr>

1) One needs no special explaining and will probably be rarely used
2) This is how you get the code initially on your main device
3) This is how you spread the code on all other devices you manage / own
4) This process can be used to share the code with someone nearby (on the same wifi network)

## How it works?

You can open [http://localhost:1111](http://localhost:1111) on your machine while `dmt-proc` is running.

You will see something similar to:

<img src="https://github.com/uniqpath/info/blob/master/assets/img/dmt-start/dmt-replicate.jpg?raw=true" width="500px">

You then instruct your friend to do as the instructions say:

```
curl your_machine_local_ip:1111 | bash
```

This will get the `~/.dmt` directory over to your friend (without `~/.dmt/state`, `~/.dmt/log` and `~/.dmt/user`) and will create a bash shortcut so that `dmt` command works.

Friend still needs all the dependencies as listed in the original [install instructions](GETTING_STARTED.md).

## How it actually works?

1) When generated script that is served from `your_machine_local_ip:1111` runs on the target machine, <br>it will try to fetch `your_machine_local_ip:1111/dmt.zip`, [see here](https://github.com/uniqpath/dmt/blob/master/core/node/aspect-meta/dmt-replicate/templates/install_from#L105)
2) `dmt-replicate` module (middleware) inside your `dmt-proc` will start dynamically<br>streaming the `.zip` archive which will include all needed files
