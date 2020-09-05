<img src="https://github.com/uniqpath/info/blob/master/assets/img/dmt_banner.png?raw=true">

⚠️⚠️⚠️ This is not yet working - in development, should be done by ~10.9.2020

## **SETUP THE 🐠 ZETA EXPLORER NODE**

**PREREQUISITES:** Get a fresh debian-based linux server on a public IP address and [GO THROUGH A BASIC SETUP](./help/SERVER_SETUP.md)

---

After successful login to your **⚡new remote computer⚡** with your *non-root username*:

```
ssh username@ip
```

 continue with setup:

```
sudo apt-get update
sudo apt-get -y install git
```

**We are now ready** to install the [dmt-system](https://dmt-system.com) 👋👽🚀

(this is the ⚙️ engine that runs our node and connects to other network nodes):

```
git clone https://github.com/uniqpath/dmt.git ~/.dmt
cd ~/.dmt
./install
```

Reload the terminal (logout and then ssh back in).

💡To update `~/.dmt` to new version manually in the future if auto-updates fail for some reason use: `dmt next`.

**We are now ready** to setup the **Zeta Explorer Node**

Here is some [BASIC BACKGROUND](./help/ZETA_BACKGROUND.md).

```
zeta_setup [ ⚠️ going to be added on 10.9.2020 ]
```

**Remember to logout and login if you get this error:**

```
zeta_setup: command not found
```

The correct result you should get is this:

![zeta_setup](./help/img/zeta_setup.png)

✨**That's it**, follow the instructions on screen ..................... 👣

### Support

For any support questions please [Join our Discord server](https://discord.com/invite/XvJzmtF).

🐠 **Happy exploration!**


