This is executed after rsync (after-copy) a particular device (or before restarting it -- on update (copy+restart).

Scripts in this directory are executed for each device in general and if the same scripts are also present in each devices' directory (~/.dmt/user/devices/[device]), they are also executed BEFORE the general ones.
