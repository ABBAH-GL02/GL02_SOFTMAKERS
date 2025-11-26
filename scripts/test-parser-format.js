import assert from 'node:assert/strict';
import { readGiftFile, parseGiftQuestion } from '../GiftParser.js';
import fs from 'node:fs';

async function run() {
  console.log('Running parser-format quick check...');
  const file = 'SujetB_data/U9-p94-Listening.gift';
  const blocks = readGiftFile(file);
  const parsed = blocks.map(parseGiftQuestion);
  const target = parsed.find(p => p.choices && ((Array.isArray(p.choices) && p.choices.flat().length > 0) || p.type === 'cloze'));
  assert(target, 'No multiplechoice/cloze question found in sample file');
  assert(target.display && typeof target.display === 'string');

  if (target.type === 'multiplechoice') {
    assert(Array.isArray(target.choices) && target.choices.length >= 2, 'choices should exist for multiplechoice');
    assert(target.display.includes('Options:'), 'display should contain Options: for multiple choice');
  } else if (target.type === 'cloze') {
    assert(Array.isArray(target.choices) && target.choices.length >= 1, 'choices should exist for cloze blocks');
    assert(target.display.includes('Blank'), 'display should contain Blank for cloze');
  }

  console.log('parser-format quick check: OK');
}

run().catch((err) => {
  console.error('parser-format quick check failed:', err);
  process.exit(1);
});
