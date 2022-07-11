import { scan } from 'dmt/common';

export default function(directory) {
  return scan.recursive(directory, {
    flatten: true,
    extname: '.txt',
    filter: ({ basename, reldir }) => {
      return !reldir.includes('-disabled') && !basename.includes('-disabled') && !reldir.endsWith('.git');
    }
  });
}
