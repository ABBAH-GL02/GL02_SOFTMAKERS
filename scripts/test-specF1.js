import assert from 'node:assert/strict';
import { discoverSujetStructure } from '../actions/chercherQuestions.js';

async function run() {
  console.log('Running spec F1 quick check (discoverSujetStructure)...');
  const units = await discoverSujetStructure(`${process.cwd()}/SujetB_data`);

  assert.equal(typeof units, 'object');
  const keys = Object.keys(units);
  assert(keys.length > 0, 'No units discovered in SujetB_data');

  assert(keys.includes('U1'), 'U1 should exist');
  assert(keys.includes('U3'), 'U3 should exist');
  assert(Object.keys(units['U1']).length > 0, 'U1 should have pages');

  console.log('Spec F1 quick check: OK');
}

run().catch((err) => {
  console.error('Spec F1 quick check failed: ', err);
  process.exit(1);
});
