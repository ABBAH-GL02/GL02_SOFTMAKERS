import { readGiftFile, parseGiftQuestion } from '../GiftParser.js';
import { composeExamFromBlocks } from '../actions/creerExamen.js';
import fs from 'node:fs';

async function run() {
  console.log('Running createExam quick check...');
  const dir = 'SujetB_data';
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.gift'));

  const collected = [];
  for (const f of files) {
    const blocks = readGiftFile(`${dir}/${f}`);
    for (const b of blocks) {
      const parsed = parseGiftQuestion(b);
      if (Array.isArray(parsed.answers) && parsed.answers.length === 0) continue;
      const raw = b.trim();
      if (!collected.includes(raw)) collected.push(raw);
      if (collected.length >= 15) break;
    }
    if (collected.length >= 15) break;
  }

  if (collected.length < 15) {
    throw new Error('Pas assez de questions disponibles pour créer un examen test.');
  }

  const content = composeExamFromBlocks(collected.slice(0, 15));
  if (!content || typeof content !== 'string') throw new Error('composeExamFromBlocks n\'a pas renvoyé une string');

  console.log('createExam quick check: OK — composition possible');
}

run().catch(err => { console.error('test-createExam failed:', err); process.exit(1); });
