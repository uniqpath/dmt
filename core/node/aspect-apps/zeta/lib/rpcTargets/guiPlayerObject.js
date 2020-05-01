import dmt from 'dmt/bridge';

class GUIPlayerObject {
  constructor({ program, channel }) {
    this.program = program;
    this.channel = channel;
  }

  playUrl({ playableUrl }) {
    return new Promise((success, reject) => {
      this.program
        .actor('player')
        .call('playUrl', playableUrl)
        .then(success)
        .catch(error => {
          console.log('GUIPlayerObject error:');
          console.log(error);
        });
    });
  }
}

export default GUIPlayerObject;
