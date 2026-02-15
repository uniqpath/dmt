import ShairportReader from 'shairport-sync-reader';

const pipeReader = new ShairportReader({ path: '/tmp/shairport-sync-metadata' });

pipeReader.on('prgr', data => {
  console.log('PLaystream progress');
  console.log(data);
});

pipeReader.on('pbeg', data => {
  console.log('PLaystream begin');
  console.log(data);
});

pipeReader.on('pend', data => {
  console.log('PLaystream end');
  console.log(data);
});

pipeReader.on('pfls', data => {
  console.log('PLaystream flush');
  console.log(data);
});

pipeReader.on('prsm', data => {
  console.log('PLaystream resume');
  console.log(data);
});

pipeReader.on('pvol', data => {
  console.log('PLaystream volume');
  console.log(data);
});

pipeReader.on('snam', data => {
  console.log('Device started playsession');
  console.log(data);
});

pipeReader.on('snua', data => {
  console.log('User agent started playsession');
  console.log(data);
});

pipeReader.on('meta', data => {
  console.log(data);
});

pipeReader.on('core', data => {
  console.log('core');
  console.log(data);
});

pipeReader.on('ssnc', data => {
  console.log('shairport-sync metadata');
  console.log(data);
});
