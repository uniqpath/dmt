import RunnableLink from './runnableLink';

class LinkedList {
  constructor(linkConstructor) {
    this.head = new RunnableLink();
    this.tail = new RunnableLink(this.head);
    this.head.next = this.tail;
    this.linkConstructor = linkConstructor;
    this.reg = {};
  }

  insert(data) {
    const link = new RunnableLink(this.tail.prev, this.tail, data);
    link.next.prev = link;
    link.prev.next = link;
    return link;
  }

  remove(link) {
    link.prev.next = link.next;
    link.next.prev = link.prev;
  }
}

export default LinkedList;
