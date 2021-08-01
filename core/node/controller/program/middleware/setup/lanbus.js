import { Nearby } from 'dmt/nearby';

export default (program, { lanbus }) => {
  program.on('nearby_setup', () => {
    new Nearby({ program, lanbus });
  });
};
