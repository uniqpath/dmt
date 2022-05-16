import colors from 'kleur';

function serverEndpoint({ channel }) {
  channel.on('a b c', () => {
    console.log(colors.green('Received signal'));
  });
}

export default serverEndpoint;
