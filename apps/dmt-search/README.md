# DMT Search

```bash
cd ~/Projects # or some other directory

git clone git@github.com:dmtsys/dmt-search.git
cd dmt-search/gui

npm install

# Start dev server at http://localhost:3000
npm run dev

# Build production to dist
npm run build

# Serve the production build at http://localhost:5000
npm run serve
```

Please have (latest version) [DMT ENGINE](https://github.com/uniqpath/dmt) installed and running because this frontend connects to it and also connectome and dmt-frontend-components libs from ~/.dmt/core are referenced from this package.json.
