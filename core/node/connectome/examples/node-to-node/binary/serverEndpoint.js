function serverEndpoint({ channel }) {
  let count = 0;

  const MAX_MSG = 3;

  channel.on('receive_binary', data => {
    console.log('Received from client:');
    console.log(data);
  });

  const send = () => {
    count += 1;

    const msg = new Uint8Array([1, 2, 3, 4, 5]);

    console.log(`sending...`);

    channel.send(msg);

    if (count < MAX_MSG) {
      setTimeout(() => {
        send();
      }, 120);
    }
  };

  send();
}

export default serverEndpoint;
