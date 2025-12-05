import simulerExamen from '../actions/simulerExamen.js';
import { saveExamToDir } from '../actions/creerExamen.js';

async function run() {
  console.log('Running simulerExamen quick check...');

  const instruction = `::I::Please read the instructions carefully.`;
  const mc = `::MC1::What color is the sky?{=Blue~Green~Red}`;
  const tf = `::TF1::The sun rises in the East.{T}`;
  const matching = `::M1::Match A to 1 and B to 2.{=A->1= B->2}`; // matching format
  const textq = `::TXT1::Name the planet we live on.{=Earth}`;

  const content = [instruction, mc, tf, matching, textq].join('\n\n');
  const out = await saveExamToDir(content, `test_simuler_${Date.now()}`, 'examens');
  console.log('Saved test exam to:', out);

  const fs = await import('node:fs/promises');
  const d = await fs.readdir('examens');
  const gifts = d.filter(f => f.toLowerCase().endsWith('.gift'));
  const fileIndex = gifts.indexOf(out.split('/').pop()) + 1;

  const answers = [String(fileIndex), '1', '1', 'A->1,B->2', 'Earth'];

  const rl = {
    question: async () => answers.shift() || 'q'
  };

  await simulerExamen(rl);
  console.log('simulerExamen quick check completed');
}

run().catch(err => { console.error('test-simulerExam failed:', err); process.exit(1); });
