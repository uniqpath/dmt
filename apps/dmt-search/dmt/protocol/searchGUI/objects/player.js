class GUIPlayerObject {
  constructor({ program, channel }) {
    this.program = program;
    this.channel = channel;
  }

  playUrl({ playableUrl }) {
    //console.log(`GUIPlayerObject call to playUrl: ${playableUrl}`);

    return new Promise((success, reject) => {
      this.program
        .api('player')
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
