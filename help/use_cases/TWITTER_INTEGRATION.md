### Use case:

# Showing your recent favorite tweets on the "clock" (general purpose) view

## Background

## Install dmt-system:

[Getting started](../GETTING_STARTED.md)

## Create a twitter app

Go to [Twitter developer portal](https://developer.twitter.com/en/apps) and create an app, you can name it `@yourhandle-dmt` or something else.

You may need to apply for "developer account" which is quite simple and usually you will get it approved instantly.

<img src="https://github.com/uniqpath/info/blob/master/assets/img/twitter_developer_portal.png?raw=true">

## Add your twitter app credentials to dmt-system

```
mkdir -p ~/.dmt/user/access_tokens

nano ~/.dmt/user/access_tokens/twitter.def
```

`twitter.def` should look like this:

```
twitter:
  consumerKey: a5UjVRNrDBc1LgyyBwk2DoP56
  consumerSecret: anhftaRCaW2cKsjGz8SSzMdbAhZbO5ascPV6yBnxLpARANajb3
  accessTokenKey: 6544132-lhTaCNSlckLeEIT39q6rJyZAgPz0V5XkxixHfgTuNR
  accessTokenSecret: W3fN6oy8sxkuso40KzV20deYbvE4jh8vW3AzGQPvSsXuK
```

**Use two spaces** for indentation.

Copy these tokens from your Twitter developer portal on your created app. Shown here are random example **invalid** tokens!

## Specify what you want to see in the clock view

```
cd ~/.dmt/user/devices/this/def
nano gui_views.def
```

Make `gui_views.def` look like this:
```
view: clock
  show: twitter
```

Again: **Use two spaces** for indentation.

## Start dmt-proc

```
dmt startfg
```

in terminal foreground or:

```
dmt start
```

as a daemonized process.

## Open the gui

Open [http://localhost:7777](http://localhost:7777) in your web browser and click on **Clock**.

You should see something like this:

<img src="https://github.com/uniqpath/info/blob/master/assets/img/dmt_twitter_integration.jpg?raw=true">

By default tweets update every **15 min**.

We will make this configurable in the near future but Twitter is very strict with API rate limits (per user, counting **all user's apps**) so this should not be too frequent. We will explore more about this soon.
