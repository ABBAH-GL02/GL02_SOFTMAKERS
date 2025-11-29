import { readGiftFile, parseGiftQuestion } from '../GiftParser.js';

async function run() {
  console.log('Running parser options quick check...');
  const path = 'SujetB_data/U8-p84-Voc-Linking_words.gift';
  const blocks = readGiftFile(path);
  console.log('Blocks loaded:', blocks.length);

  const parsed = blocks.map(parseGiftQuestion);

  parsed.forEach((q, i) => {
    console.log(`\nQ${i + 1}: ${q.title} [type=${q.type}]`);
    console.log('text:', q.text);
    console.log('correctAnswers:', q.correctAnswers);
    console.log('choices:', q.choices ? q.choices.map(c=>`${c.text}${c.correct? ' (✓)':''}`).join(' | ') : 'none');
  });

  const linkingQuestions = parsed.filter(q => q.title && q.title.toLowerCase().includes('linking words'));
  if (linkingQuestions.length === 0) throw new Error('No linking words questions found');
  linkingQuestions.forEach(q => {
    if (!q.choices || q.choices.length < 2) throw new Error(`Question ${q.title} does not have choices`);
  });

  console.log('\nParser options quick check: OK');
}

run().catch(err => { console.error('test-parser-options failed:', err); process.exit(1); });
