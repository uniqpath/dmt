For raspberries where cron is root:

# special, root is user at the same time

* * * * * bash -ic ~/.dmt/etc/cron/1min
*/15 * * * * bash -ic ~/.dmt/etc/cron/15min
*/5 * * * * bash -ic ~/.dmt/etc/cron/5min
0 * * * * bash -ic ~/.dmt/etc/cron/hourly
0 0 * * * bash -ic ~/.dmt/etc/cron/daily

* * * * * ~/.dmt/etc/cron/root/1min root
*/5 * * * * ~/.dmt/etc/cron/root/5min root
*/15 * * * * ~/.dmt/etc/cron/root/15min root
0 * * * * ~/.dmt/etc/cron/root/hourly root
0 0 * * * ~/.dmt/etc/cron/root/daily root
