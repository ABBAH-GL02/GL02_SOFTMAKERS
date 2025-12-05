import { readGiftFile, parseGiftQuestion } from '../GiftParser.js';
import fs from 'node:fs/promises';
import path from 'node:path';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { colors } from '../utils/colors.js';

export default async function verifierExamen(rl = null) {
  console.log("\n[actions] Vérification d'un examen...");

  let ownRl = false;
  if (!rl){
      rl = readline.createInterface({ input, output });
      ownRl = true;
  }

  try {
      const cwd = process.cwd();
      const dataDir = path.join(cwd, 'examens');
      let files;
      try {
          files = await fs.readdir(dataDir);
      } catch (e) {
          console.log(`${colors.red}Le dossier 'examens' n'existe pas ou est inaccessible.${colors.reset}`);
          return;
      }

      const examFiles = files.filter(f => f.toLowerCase().endsWith('.gift'));

      if (examFiles.length === 0) {
        console.log(`${colors.red}Aucun fichier d'examen .gift trouvé dans le dossier ./examens.${colors.reset}`);
        return;
      }

      console.log("\nFichiers d'examen disponibles : \n");
      examFiles.forEach((f, i) => console.log(`${i + 1}) ${f}`));

      const choice = await rl.question(`\nNuméro du fichier à vérifier (ou q pour quitter):\n${colors.blue}(exemple: taper '1')${colors.reset} `);
      if (choice.toLowerCase() === 'q') return;

      const index = parseInt(choice, 10) - 1;
      if (!(index >= 0 && index < examFiles.length)){
          console.log(`${colors.red}Choix invalide.${colors.reset} Tapez 7 pour l'aide.`);
          return;
      }

      const selected = examFiles[index];
    const fullPath = path.join(dataDir, selected);

      console.log(`\n Vérification du fichier ${selected} \n`);

      let blocks;
      try {
          blocks = readGiftFile(fullPath);
      } catch (err) {
          console.error(`${colors.red}Erreur lors de la lecture du fichier :${colors.reset}`, err.message);
          return;
      }

            if (!blocks || blocks.length === 0){
                    console.log(`${colors.red}Le fichier n'a pas de questions.${colors.reset}`);
                    return;
            }

            function isLikelyInstruction(q) {
                if (!q || !q.text) return false;
                const noAnswers = Array.isArray(q.answers) && q.answers.length === 0;
                if (!noAnswers) return false;
                const txt = (q.text || '').toLowerCase();
                const title = (q.title || '').toLowerCase();
                const keywords = ['complete', 'completez', 'complète', 'consigne', 'instruction', 'instructions', 'look carefully', 'read carefully', 'fill in', 'fill the', 'choose the', 'select the', 'complete the sentences', 'complete the text'];
                const containsKeyword = keywords.some(k => txt.includes(k) || title.includes(k));
                const tooLong = txt.length > 30;
                return containsKeyword || tooLong;
            }

            const parsedBlocks = blocks.map(parseGiftQuestion);
            const filteredBlocks = [];
            for (let i = 0; i < blocks.length; i++){
                if (isLikelyInstruction(parsedBlocks[i])) continue;
                filteredBlocks.push(blocks[i]);
            }

    const nb = filteredBlocks.length;
      let valid = true;

      if (nb < 15 || nb > 20){
          console.log(`${colors.red}Le fichier contient ${nb} questions. Il doit contenir entre 15 et 20 questions.${colors.reset}`);
          valid = false;
      } else {
          console.log(`${colors.green}Le fichier contient ${nb} questions.${colors.reset}`);
      }

      const seen = new Set();
      const duplicates = [];

      for (const b of filteredBlocks){
          const key = b.trim();
          if (seen.has(key)){
              duplicates.push(key);
          } else {
              seen.add(key);
          }
      }

      if (duplicates.length > 0){
          console.log(`${colors.red}Le fichier contient ${duplicates.length} doublons.${colors.reset}`);
          valid = false;
      } else {
          console.log(`${colors.green}Le fichier ne contient aucun doublon.${colors.reset}`);
      }

      if (valid){
          console.log(`${colors.green}\nLe fichier est valide.${colors.reset}`);
      } else {
          console.log(`${colors.red}\nLe fichier n'est pas valide.${colors.reset}`);
      }
  } finally {
      if (ownRl && rl) rl.close();
  }
}
