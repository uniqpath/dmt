import dmt from 'dmt/bridge';

class MessageDropper {
  constructor() {
    this.resolutionMs = 500;
    this.staleMs = 5 * this.resolutionMs;

    this.cleanupInterval = 5 * this.staleMs;

    this.messages = [];

    this.cleanup();
  }

  shouldDrop({ topic, msg }) {
    const _topic = topic;
    const _msg = msg;

    const now = Date.now();

    const match = this.messages.find(({ topic, msg, receivedAt }) => topic == _topic && msg == _msg && now - receivedAt < this.resolutionMs);

    if (match) {
      return true;
    }

    this.messages.push({ topic, msg, receivedAt: now });

    return false;
  }

  cleanup() {
    const now = Date.now();

    this.messages = this.messages.filter(({ receivedAt }) => now - receivedAt < this.staleMs);

    setTimeout(() => this.cleanup(), this.cleanupInterval);
  }
}

export default MessageDropper;
