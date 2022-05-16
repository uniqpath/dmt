const MAX_INTERVAL_SLOW_PING_REPORT_MINUTES = 5;

export default class MeasureLatency {
  constructor() {
    this.reportedSlowPingAt = undefined;
    this.lastGoodPingAt = undefined;
  }

  measure() {
    if (!isMainDevice()) {
      const values = results.map(el => el.ping).sort((a, b) => b - a);
      const secondMaxValue = Math.round(values[1]);

      const goodPing = secondMaxValue < 100;

      if (
        !goodPing &&
        this.lastGoodPingAt &&
        (!this.reportedSlowPingAt || Date.now() - this.reportedSlowPingAt > MAX_INTERVAL_SLOW_PING_REPORT_MINUTES * 60 * 1000)
      ) {
        this.emit('slow_ping', { target, latency: secondMaxValue, allResults: results });

        this.reportedSlowPingAt = Date.now();
      }

      if (goodPing) {
        this.lastGoodPingAt = Date.now();
      }
    }
  }
}
