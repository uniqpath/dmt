import colors from 'colors';

function serverEndpoint({ channel }) {
  const object = colors.green('ClientObject::hello');
  console.log(`Calling remote object method: ${object}`);

  channel
    .remoteObject('ClientObject')
    .call('hello')
    .then(response => {
      console.log(`Received response from ${object} → ${colors.yellow(response)}`);
    })
    .catch(e => {
      console.log('Error:');
      console.log(colors.red(e));
    });
}

export default serverEndpoint;
