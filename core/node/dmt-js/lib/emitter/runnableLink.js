function noop() {}

class RunnableLink {
  constructor(prev, next, fn) {
    this.prev = prev;
    this.next = next;
    this.fn = fn || noop;
  }

  run(data) {
    this.fn(data);
    this.next && this.next.run(data);
  }
}

export default RunnableLink;
