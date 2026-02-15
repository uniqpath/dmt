import { device } from 'dmt/common';

export default function setupRedirects({ app }) {
  const redirects = { '/': '/dmt' };
  if (device().serverMode) {
    redirects['/'] = '/dmt-search';
  }

  for (const [source, target] of Object.entries(redirects)) {
    app.get(source, (req, res) => {
      res.redirect(`${target}${req.originalUrl}`);
    });
  }
}
