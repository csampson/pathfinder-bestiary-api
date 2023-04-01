const SRD = require('./adapters/srd');

async function test() {
  const creature = await SRD.import('https://www.d20pfsrd.com/bestiary/monster-listings/outsiders/elemental/elemental-earth/huge-earth-elemental/');
  console.log(creature);
}

test();
