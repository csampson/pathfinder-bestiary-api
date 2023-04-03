import SRD from './adapters/srd';

const [url] = process.argv.slice(2);

SRD.import(url)
  .then(console.log)
  .catch(console.error);
