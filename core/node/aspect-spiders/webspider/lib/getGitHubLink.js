import fs from 'fs';
import git from 'isomorphic-git';

export default async function getGitHubLink({ filePath, githubLineNum }) {
  const gitroot = await git.findRoot({
    fs,
    filepath: filePath
  });

  const remotes = await git.listRemotes({ fs, dir: gitroot });

  const matchingRemote = remotes.find(({ remote }) => remote == 'origin');

  if (!matchingRemote) {
    return;
  }

  let { url } = matchingRemote;

  if (url.startsWith('git@github.com:')) {
    url = url.replace('git@github.com:', 'https://github.com/');
  }

  const repoUrl = url.replace(new RegExp(/\.git$/), '');

  const relativeFile = filePath.replace(gitroot, '');

  return `${repoUrl}/blob/master${relativeFile}#L${githubLineNum}`;
}
