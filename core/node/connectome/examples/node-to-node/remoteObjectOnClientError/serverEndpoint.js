import colors from 'kleur';

function serverEndpoint({ channel }) {
  const object = colors.green('ErrorObject::makeError');
  console.log(`Calling remote object method: ${object}`);

  channel
    .remoteObject('ErrorObject')
    .call('makeError')
    .then(response => {
      console.log(`Received response from ${object} → ${colors.yellow(response)}`);
    })
    .catch(e => {
      console.log('Error:');
      console.log(colors.red(e));
    });
}

export default serverEndpoint;
