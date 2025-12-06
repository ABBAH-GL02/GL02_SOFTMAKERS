import fs from 'node:fs/promises';
import path from 'node:path';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { readGiftFile, parseGiftQuestion } from '../GiftParser.js';
import { calculateExamStats, typeMapping } from '../utils/statsExamen.js';

async function genererBanque() {
  const dbPath = path.join(process.cwd(), 'database_profils.json');
  const rl = readline.createInterface({ input, output });

  try {
    // 1. Persistence Check
    try {
      await fs.access(dbPath);
      const answer = await rl.question('\nLa banque de données (database_profils.json) existe déjà.\nVoulez-vous la régénérer et écraser l\'existante ? (y/N) : ');
      if (answer.trim().toLowerCase() !== 'y') {
        console.log('Opération annulée. La banque existante est conservée.');
        return;
      }
    } catch {
      // File does not exist, proceed
    }

    console.log('\n[Génération] Création de la banque de profils...');

    // 2. Read all questions from SujetB_data
    const dataDir = path.join(process.cwd(), 'SujetB_data');
    let files;
    try {
      files = await fs.readdir(dataDir);
    } catch (e) {
      console.error('Erreur : Impossible de lire le dossier SujetB_data.');
      return;
    }

    const giftFiles = files.filter(f => f.toLowerCase().endsWith('.gift'));
    let allQuestions = [];

    for (const f of giftFiles) {
      const fullPath = path.join(dataDir, f);
      try {
        const blocks = readGiftFile(fullPath);
        const parsed = blocks.map(parseGiftQuestion);
        // Exclure les consignes
        const usable = parsed.filter(q => {
            if (!q || !q.text) return false;
            const noAnswers = Array.isArray(q.answers) && q.answers.length === 0;
            if (!noAnswers) return true;
            
            const txt = (q.text || '').toLowerCase();
            const title = (q.title || '').toLowerCase();
            const keywords = ['complete', 'completez', 'complète', 'consigne', 'instruction', 'instructions', 'look carefully', 'read carefully', 'fill in', 'fill the', 'choose the', 'select the', 'complete the sentences', 'complete the text'];
            const containsKeyword = keywords.some(k => txt.includes(k) || title.includes(k));
            const tooLong = txt.length > 30;
            return !(containsKeyword || tooLong);
        });
        allQuestions.push(...usable);
      } catch (err) {
        console.warn(`Attention : Erreur de lecture pour ${f}`);
      }
    }

    console.log(`Pool total de questions trouvées : ${allQuestions.length}`);

    if (allQuestions.length < 20) {
      console.error('Pas assez de questions pour générer des examens variés.');
      return;
    }

    // 3. Generate N exams
    const NUM_EXAMS = 50;
    const database = [];

    for (let i = 0; i < NUM_EXAMS; i++) {
        // Random size between 15 and 20
        const size = Math.floor(Math.random() * (20 - 15 + 1)) + 15;
        const examQuestions = [];
        const usedIndices = new Set();
        
        while(examQuestions.length < size) {
            const idx = Math.floor(Math.random() * allQuestions.length);
            if (!usedIndices.has(idx)) {
                usedIndices.add(idx);
                examQuestions.push(allQuestions[idx]);
            }
        }

        const stats = calculateExamStats(examQuestions);
        database.push({
            id: `simulated_${Date.now()}_${i}`,
            timestamp: new Date().toISOString(),
            stats: stats
        });
    }

    // 4. Save to JSON
    await fs.writeFile(dbPath, JSON.stringify(database, null, 2), 'utf8');
    console.log(`\nSuccès ! ${NUM_EXAMS} profils générés dans ${dbPath}`);

  } catch (err) {
    console.error('Erreur fatale :', err);
  } finally {
    rl.close();
  }
}

genererBanque();
