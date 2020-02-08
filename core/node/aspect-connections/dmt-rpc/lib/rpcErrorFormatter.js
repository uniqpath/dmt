import colors from 'colors';
import dmt from 'dmt-bridge';

function errorFormatter(e, { host }) {
  if (dmt.isDevMachine()) {
    console.log(colors.cyan('\n⚙️  Dev machine detailed log:'));
    console.log(colors.red(e));
  }

  if (e.syscall == 'getaddrinfo' && e.code == 'ENOTFOUND') {
    console.log(colors.red(`⮑  ${colors.cyan(host)} is unknown.`));
  } else if (e.syscall == 'connect') {
    if (e.code == 'ECONNREFUSED' || e.code == 'EHOSTDOWN') {
      console.log(colors.white(`⮑  ${colors.cyan(host)} ${colors.red('service unreachable')}`));
    } else if (e.code == 'EHOSTUNREACH') {
      console.log(colors.white(`⮑  ${colors.cyan(host)} ${colors.red('is unreachable')}`));
    } else if (e.code == 'ENETUNREACH') {
      console.log(colors.white(`⮑  ${colors.red('network is unreachable')}`));
    } else {
      console.log(colors.red(e));
    }
  } else if (e.code == 'ECONNRESET') {
    console.log(colors.white(`⮑  ${colors.red('socket hang up')}`));
  } else if (e.error) {
    console.log(colors.white(`⮑  ${colors.red(e.error)}`));
  } else if (e) {
    console.log(colors.white(`⮑  ${colors.red(e.toString())}`));
  } else {
    console.log(colors.white(`⮑  ${colors.red('is unreachable')}`));
  }
}

export default errorFormatter;
