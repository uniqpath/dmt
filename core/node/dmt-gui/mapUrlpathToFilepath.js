import path from 'path';

export default function mapUrlpathToFilepath({ urlPath, staticServerOptions }) {
  const { rootDir, assetsSubdir, subServings } = staticServerOptions.servingOptions;

  for (const subServing of subServings) {
    if (urlPath.startsWith(subServing.mountpoint)) {
      return path.join(subServing.dir, urlPath.replace(subServing.mountpoint, ''));
    }
  }

  return path.join(path.join(rootDir, assetsSubdir), urlPath);
}
