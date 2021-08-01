import colors from 'colors';

function serverEndpoint({ channel }) {
  channel.on('a b c', () => {
    console.log(colors.green('Received signal'));
  });
}

export default serverEndpoint;
