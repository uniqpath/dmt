import servingStrategy from './servingStrategy.js';

function setup(app, { servingOptions = {}, redirects = {} }) {
  configureRedirects(servingStrategy(app, servingOptions), redirects);
}

function configureRedirects(app, redirects) {
  for (const source of Object.keys(redirects)) {
    const target = redirects[source];
    app.get(source, (req, res) => {
      res.redirect(target);
    });
  }

  return app;
}

export default setup;
