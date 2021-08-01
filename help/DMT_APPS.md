## DMT APPS

### Definitions

1. DMT APP is an application that runs on DMT ENGINE

2. Each DMT APP consists of two parts: 

   - Frontend (GUI)
   - DMT ENGINE extension (hook)

3. Each DMT APP can be installed on:

   - Main DMT ENGINE — this usually means user's laptop / PC

     - Inside `~/.dmt/user/apps`
     - Inside `~/.dmt/apps` — DMT SYSTEM apps live here and come bundled with DMT ENGINE

     System and user apps are replicated to all other devices through `dmt update`.

   - Or alternatively on each device separately:

     - "Singular" DMT apps inside `~/.dmt-here/apps` directory.

       These apps live only on this device and are not replicated to the rest.

       Singular apps can be installed on multiple devices separately as needed, it usually makes sense to install apps that only run on server as singular apps so they are not replicated to all other devices including single board computers.

### Integration

