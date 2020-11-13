function serverEndpoint({ channel }) {
  let count = 0;

  const MAX_MSG = 3;

  const send = () => {
    count += 1;

    channel.send({ msg: `Message from server: ${count}/${MAX_MSG}` });

    if (count < MAX_MSG) {
      setTimeout(() => {
        send();
      }, 120);
    }
  };

  send();
}

export default serverEndpoint;
