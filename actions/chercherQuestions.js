import fs from 'node:fs/promises';
import path from 'node:path';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { readGiftFile, parseGiftQuestion } from '../GiftParser.js';
export async function discoverSujetStructure(dataDir = path.join(process.cwd(), 'SujetB_data')) {
  let files;
  try {
    files = await fs.readdir(dataDir);
  } catch (err) {
    throw new Error(`SujetB_data introuvable: ${err.message}`);
  }

  const giftFiles = files.filter((f) => f.toLowerCase().endsWith('.gift'));
  if (giftFiles.length === 0) {
    return {};
  }

  // Organiser fichiers par unité (U\d+) puis par page (p\d+(?:_\d+)?)
  const units = {};
  for (const fname of giftFiles) {
    const unitMatch = fname.match(/U\d+/i);
    const pageMatch = fname.match(/p\d+(?:_\d+)?/i);
    const unit = unitMatch ? unitMatch[0].toUpperCase() : 'UNKNOWN';
    const page = pageMatch ? pageMatch[0].toLowerCase() : 'pas de numéro de page. Taper 1';

    units[unit] = units[unit] || {};
    units[unit][page] = units[unit][page] || [];
    units[unit][page].push(fname);
  }

  return units;
}

export default async function chercherQuestions(rl = null) {
  const dataDir = path.join(process.cwd(), 'SujetB_data');
  const blue = '\x1b[34m';
  const reset = '\x1b[0m';

  let files;
  try {
    files = await fs.readdir(dataDir);
  } catch (err) {
    console.error("Le dossier SujetB_data est introuvable :", err.message);
    return;
  }

  const giftFiles = files.filter((f) => f.toLowerCase().endsWith('.gift'));
  if (giftFiles.length === 0) {
    console.log("Aucun fichier .gift trouvé dans SujetB_data.");
    return;
  }

  let ownRl = false;
  if (!rl) {
    rl = readline.createInterface({ input, output });
    ownRl = true;
  }

  try {
    while (true) {
      // Demander le mot-clé de recherche
      const keywordPrompt = `\n${blue}Entrez un mot-clé pour rechercher (ou q pour quitter):${reset} `;
      const keyword = await rl.question(keywordPrompt);
      
      if (keyword.trim().toLowerCase() === 'q') return;
      
      if (keyword.trim() === '') {
        console.log('Veuillez entrer un mot-clé valide.');
        continue;
      }

      // Chercher dans tous les fichiers .gift
      const matchedQuestions = [];
      const keywordLower = keyword.toLowerCase();

      for (const fname of giftFiles) {
        const fullPath = path.join(dataDir, fname);
        const questionBlocks = readGiftFile(fullPath);
        
        if (!questionBlocks || questionBlocks.length === 0) continue;

        const parsed = questionBlocks.map((b) => parseGiftQuestion(b));
        
        // Filtrer les questions contenant le mot-clé dans le titre ou le texte
        parsed.forEach((q) => {
          if (q.title.toLowerCase().includes(keywordLower) || 
              q.text.toLowerCase().includes(keywordLower)) {
            matchedQuestions.push({
              question: q,
              file: fname
            });
          }
        });
      }

      if (matchedQuestions.length === 0) {
        console.log(`\nAucune question trouvée contenant "${keyword}".`);
        continue;
      }

      // Afficher les questions trouvées
      console.log(`\n${blue}Résultats (${matchedQuestions.length} question(s) trouvée(s)):${reset}`);
      matchedQuestions.forEach((item, i) => {
        console.log(`${i + 1}) ${item.question.title} (${item.file})`);
      });

      // Demander le numéro de la question à afficher
      let questionPrompt = '\nNuméro de question pour afficher (ou q pour nouvelle recherche): ';
      const qChoice = await rl.question(questionPrompt);
      
      if (qChoice.trim().toLowerCase() === 'q') continue;
      
      const qIdx = parseInt(qChoice, 10) - 1;
      if (!(qIdx >= 0 && qIdx < matchedQuestions.length)) {
        console.log('Choix de question invalide.');
        continue;
      }

      const selectedQuestion = matchedQuestions[qIdx];
      console.log('\n---- Question sélectionnée ----');
      console.log(selectedQuestion.question.display || selectedQuestion.question.raw);
      console.log('----');

      // Appuyez sur n'importe quelle touche pour revenir à la recherche
      if (process.stdin && process.stdin.isTTY) {
        process.stdin.setRawMode(true);
        console.log("\nAppuyez sur n'importe quelle touche pour continuer...");
        await new Promise((resolve) => {
          const onData = () => {
            process.stdin.setRawMode(false);
            process.stdin.removeListener('data', onData);
            resolve();
          };
          process.stdin.once('data', onData);
        });
      } else {
        await rl.question("\nAppuyez sur Entrée pour continuer...");
      }
    }
  } finally {
    if (ownRl && rl) rl.close();
  }
}

