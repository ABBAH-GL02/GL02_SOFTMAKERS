import { composeExamFromBlocks } from '../actions/creerExamen.js';

describe('Spec_F2 - Création d\'un examen (composeExamFromBlocks)', () => {
  it('rejette moins de 15 questions', async () => {
    const blocks = Array.from({length: 10}, (_,i) => `::Q${i}::Question ${i}{=A}`);
    expect(() => composeExamFromBlocks(blocks)).toThrow();
  });

  it('rejette plus de 20 questions', async () => {
    const blocks = Array.from({length: 25}, (_,i) => `::Q${i}::Question ${i}{=A}`);
    expect(() => composeExamFromBlocks(blocks)).toThrow();
  });

  it('accepte 15 questions et retourne une string', async () => {
    const blocks = Array.from({length: 15}, (_,i) => `::Q${i}::Question ${i}{=A}`);
    const res = composeExamFromBlocks(blocks);
    expect(typeof res).toBe('string');
  });

  it('ignore les consignes (blocs sans réponses) lors de la composition', async () => {
    const instruction = `::I::Look carefully at the following instructions and complete the tasks.`;
    const qBlocks = Array.from({length: 15}, (_,i) => `::Q${i}::Question ${i}{=A}`);
    const combined = [instruction, ...qBlocks];
    const res = composeExamFromBlocks(combined);
    expect(typeof res).toBe('string');
  });
});
