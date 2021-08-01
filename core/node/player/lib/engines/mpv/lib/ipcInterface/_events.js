const events = {
  closeHandler() {
    if (this.options.debug) {
      console.log('Socket closed on the other side. This usually occurs \
             when MPV has crashed');
    }
    this.socket.destroy();
  },
  errHandler(error) {
    if (this.options.debug) {
      console.log(error);
    }
  },
  dataHandler(data) {
    const messages = data.toString().split('\n');

    messages.forEach(message => {
      if (message.length > 0) {
        const JSONmessage = JSON.parse(message);
        if ('request_id' in JSONmessage) {
          if (JSONmessage.error === 'success') {
            this.ipcRequests[JSONmessage.request_id].resolve(JSONmessage.data);
            delete this.ipcRequests[JSONmessage.request_id];
          } else {
            this.ipcRequests[JSONmessage.request_id].reject(JSONmessage.error);
            delete this.ipcRequests[JSONmessage.request_id];
          }
        } else {
          this.emit('message', JSON.parse(message));
        }
      }
    });
  }
};

export default events;
