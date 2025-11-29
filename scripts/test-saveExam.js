import { saveExamToDir } from '../actions/creerExamen.js';
import fs from 'node:fs/promises';

async function run() {
  const content = '::Q1::Sample question{=A}';
  const name = `my_exam_test_${Date.now()}`;
  const out = await saveExamToDir(content, name, 'examens');
  console.log('Saved file path:', out);
  const exists = await fs.stat(out).then(s => !!s).catch(() => false);
  if (!exists) throw new Error('Saved file not found');
  console.log('File exists and was written — test passed.');
}

run().catch(err => { console.error('test-saveExam failed:', err); process.exit(1); });
