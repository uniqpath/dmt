This is executed after updating (rsync) a particular device (or before "renewing" it -- "renew" mean update + dmt-proc restart).

Scripts in this directory are executed for each device in general and if the same scripts are also present in each devices' directory (~/.dmt/user/devices/[device]), they are also executed BEFORE the general ones.
