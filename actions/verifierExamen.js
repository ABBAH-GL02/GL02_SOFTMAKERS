import { readGiftFile } from '../GiftParser.js';
import fs from 'node:fs/promises';
import path from 'node:path';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

export default async function verifierExamen(rl = null) {
  console.log("\n[actions] Vérification d'un examen...");

  let ownRl = false;
  if (!rl){
      rl = readline.createInterface({ input, output });
      ownRl = true;
  }

  try {
      const cwd = process.cwd();
      const files = await fs.readdir(cwd);
      const examFiles = files.filter(f => f.toLowerCase().endsWith('.gift'));

      if(examFiles.length === 0){
          console.log("Aucun fichier d'examen .gift est trouvé dans le dossier courant.");
          return;
      }

      console.log("\nFichiers d'examen disponibles : \n");
      examFiles.forEach((f, i) => console.log(`${i + 1}) ${f}`));

      const choice = await rl.question("\n Numéro du fichier à vérifier (ou q pour quitter) :");
      if (choice.toLowerCase() === 'q') return;

      const index = parseInt(choice, 10) - 1;
      if (!(index >= 0 && index < examFiles.length)){
          console.log("Choix invalide.");
          return;
      }

      const selected = examFiles[index];
      const fullPath = path.join(cwd, selected);

      console.log(`\n Vérification du fichier ${selected} \n`);

      let blocks;
      try {
          blocks = readGiftFile(fullPath);
      } catch (err) {
          console.error("Erreur lors de la lecture du fichier :", err.message);
          return;
      }

      if (!blocks || blocks.length === 0){
          console.log("Le fichier n'a pas de questions.");
          return;
      }

      const nb = blocks.length;
      let valid = true;

      if (nb < 15 || nb > 20){
          console.log(`Le fichier contient ${nb} questions. Il doit contenir entre 15 et 20 questions.`);
          valid = false;
      } else {
          console.log(`Le fichier contient ${nb} questions. Il est valide.`);
      }

      const seen = new Set();
      const duplicates = [];

      for (const b of blocks){
          const key = b.trim();
          if (seen.has(key)){
              duplicates.push(key);
          } else {
              seen.add(key);
          }
      }

      if (duplicates.length > 0){
          console.log(`Le fichier contient ${duplicates.length} doublons.`);
          valid = false;
      } else {
          console.log("Le fichier ne contient aucun doublon.");
      }

      if (valid){
          console.log("\nLe fichier est valide.");
      } else {
          console.log("\nLe fichier n'est pas valide.");
      }
  } finally {
      if (ownRl && rl) rl.close();
  }
}
