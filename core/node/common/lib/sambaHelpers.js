import dmt from './dmtHelper';
const { def, util } = dmt;

function sambaDefinitionErrorCheck(content, filePath) {
  if (content.sambaShare) {
    const ident = `${filePath} -- contentId ${content.id}`;

    if (Array.isArray(content.sambaShare)) {
      throw new Error(`${ident} has multiple sambaShares instead of at most one (${def.values(content.sambaShare)})`);
    }

    if (content.path) {
      throw new Error(`${ident} is a sambaShare, it cannot also have paths (eg. ${def.values(content.path)})`);
    }

    if (!content.sambaPath || Array.isArray(content.sambaPath)) {
      throw new Error(
        `${ident} is a sambaShare, it has to have exactly one sambaPath which matches the path in smb.conf, this one has ${
          util.listify(content.sambaPath).length
        }`
      );
    }

    if (!content.sambaPath.match(/^\//)) {
      throw new Error(`${ident} sambaPath has to be absolute path but is ${content.sambaPath} instead`);
    }
  }
}

export { sambaDefinitionErrorCheck };
