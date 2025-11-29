import verifierExamen from '../actions/verifierExamen.js';
import { saveExamToDir, composeExamFromBlocks } from '../actions/creerExamen.js';

async function run() {
  console.log('Running verifier quick check...');

  const blocks = Array.from({length: 15}, (_,i) => `::Q${i}::Question ${i}{=A}`);
  const content = composeExamFromBlocks(blocks);
  const out = await saveExamToDir(content, `test_verif_${Date.now()}`, 'examens');
  console.log('Saved test exam to:', out);

  const answers = ['1'];
  const rl = {
    question: async () => answers.shift() || 'q'
  };

  await verifierExamen(rl);
  console.log('verifier quick check completed.');
}

run().catch(err => { console.error('test-verifyExam failed:', err); process.exit(1); });
