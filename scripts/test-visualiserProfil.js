import visualiserProfil from '../actions/visualiserProfil.js';
import { saveExamToDir } from '../actions/creerExamen.js';
import fs from 'node:fs/promises';

async function run() {
  console.log('Running visualiserProfil quick check...');

  const sampleQ = (i) => `::Q${i}::Question ${i}{=A}`;
  const instruction = `::I::Look carefully at how the test works. This is an instruction.`;
  const blocks = [instruction, ...Array.from({length: 15}, (_,i) => sampleQ(i))];
  const content = blocks.join('\n\n');
  const out = await saveExamToDir(content, `test_visualiser_${Date.now()}`, 'examens');
  console.log('Saved test exam to:', out);

  const rl = {
    question: async (prompt) => {
      const d = await fs.readdir('examens');
      const gifts = d.filter(f => f.toLowerCase().endsWith('.gift'));
      return String(gifts.length);
    }
  };

  await visualiserProfil(rl);
  console.log('visualiserProfil quick check completed');
}

run().catch(err => { console.error('test-visualiserProfil failed:', err); process.exit(1); });
