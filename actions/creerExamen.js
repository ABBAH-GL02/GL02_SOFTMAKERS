import path from 'node:path';
import fs from 'node:fs/promises';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { discoverSujetStructure } from './chercherQuestions.js';
import { readGiftFile, parseGiftQuestion } from '../GiftParser.js';

export function composeExamFromBlocks(blocks, options = {}) {
  const unique = [];
  const seen = new Set();
  for (const b of blocks) {
    const key = b.trim();
    if (!seen.has(key)) {
      unique.push(b.trim());
      seen.add(key);
    }
  }

  const count = unique.length;
  if (count < 15 || count > 20) {
    throw new Error(`Nombre de questions non valide: ${count} (doit être entre 15 et 20 inclus)`);
  }

  const content = unique.map(b => b.trim()).join('\n\n');
  return content;
}

export default async function creerExamen(rl = null) {
  console.log('\n[actions] Création d\'un examen — sélection interactive (Spec_F2)');

  let ownRl = false;
  if (!rl) {
    rl = readline.createInterface({ input, output });
    ownRl = true;
  }


  try {
    const blue = '\x1b[34m';
    const reset = '\x1b[0m';
    const dataDir = path.join(process.cwd(), 'SujetB_data');
    const units = await discoverSujetStructure(dataDir);
    const unitKeys = Object.keys(units).sort();

    const selectedBlocks = [];
    const selectedSet = new Set();

    while (true) {
      console.log('\nUnités disponibles:');
      unitKeys.forEach((u, i) => console.log(`${i + 1}) ${u}`));

      // Prompt unité avec exemple bleu
      const unitPrompt = `\nNuméro d'unité (ou q pour terminer la création):\n${blue}(exemple: taper l'index "1" pour accéder à l'unité \"${unitKeys[0]}\")${reset} `;
      const unitChoice = await rl.question(unitPrompt);
      if (unitChoice.trim().toLowerCase() === 'q') break;
      const unitIdx = parseInt(unitChoice, 10) - 1;
      if (!(unitIdx >= 0 && unitIdx < unitKeys.length)) {
        console.log('Choix d\'unité invalide.');
        continue;
      }

      const chosenUnit = unitKeys[unitIdx];
      const pages = Object.keys(units[chosenUnit]).sort();

      console.log(`\nPages disponibles pour ${chosenUnit}:`);
      pages.forEach((p, i) => console.log(`${i + 1}) ${p}`));

      // Prompt page avec exemple bleu
      let pagePrompt = '\nNuméro de page (ou q pour terminer la création): ';
      if (pages.length > 0) {
        pagePrompt += `\n${blue}(exemple: taper l'index "1" pour accéder à la page \"${pages[0]}\")${reset} `;
      }
      const pageChoice = await rl.question(pagePrompt);
      if (pageChoice.trim().toLowerCase() === 'q') break;
      const pageIdx = parseInt(pageChoice, 10) - 1;
      if (!(pageIdx >= 0 && pageIdx < pages.length)) {
        console.log('Choix de page invalide.');
        continue;
      }

      const chosenPage = pages[pageIdx];
      const filesForPage = units[chosenUnit][chosenPage];

      let selectedFile;
      if (filesForPage.length === 1) {
        selectedFile = filesForPage[0];
      } else {
        console.log('\nFichiers disponibles pour cette page:');
        filesForPage.forEach((f, i) => console.log(`${i + 1}) ${f}`));
        const fileChoice = await rl.question('\nNuméro du fichier (ou q pour terminer la création): ');
        if (fileChoice.trim().toLowerCase() === 'q') break;
        const fileIdx = parseInt(fileChoice, 10) - 1;
        if (!(fileIdx >= 0 && fileIdx < filesForPage.length)) {
          console.log('Choix de fichier invalide.');
          continue;
        }
        selectedFile = filesForPage[fileIdx];
      }

      const fullPath = path.join(dataDir, selectedFile);
      const blocks = readGiftFile(fullPath);
      if (!blocks || blocks.length === 0) {
        console.log('Aucune question trouvée dans le fichier sélectionné.');
        continue;
      }

      const parsed = blocks.map(parseGiftQuestion);
      console.log(`\nQuestions dans ${selectedFile}:`);
      parsed.forEach((q, i) => console.log(`${i + 1}) ${q.title}`));

      // Prompt question avec exemple bleu
      let questionPrompt = '\nNuméro de question à ajouter (ou a pour ajouter une plage, q pour terminer): ';
      if (parsed.length > 0) {
        questionPrompt += `\n${blue}(exemple: taper l'index "1" pour ajouter la question \"${parsed[0].title}\")${reset} `;
      }
      const qChoice = await rl.question(questionPrompt);
      if (qChoice.trim().toLowerCase() === 'q') break;
      if (qChoice.trim().toLowerCase() === 'a') {
        const range = await rl.question('Entrez la plage (ex: 1-3) : ');
        const m = range.match(/^(\d+)\s*-\s*(\d+)$/);
        if (!m) {
          console.log('Plage invalide.');
          continue;
        }
        const start = parseInt(m[1], 10) - 1;
        const end = parseInt(m[2], 10) - 1;
        if (start < 0 || end >= parsed.length || start > end) {
          console.log('Plage hors limites.');
          continue;
        }
        for (let idx = start; idx <= end; idx++) {
          const raw = blocks[idx].trim();
          if (!selectedSet.has(raw)) {
            selectedBlocks.push(raw);
            selectedSet.add(raw);
          }
        }
      } else {
        const idx = parseInt(qChoice, 10) - 1;
        if (!(idx >= 0 && idx < parsed.length)) {
          console.log('Choix de question invalide.');
          continue;
        }
        const raw = blocks[idx].trim();
        if (selectedSet.has(raw)) {
          console.log('Question déjà sélectionnée, elle sera ignorée.');
        } else {
          selectedBlocks.push(raw);
          selectedSet.add(raw);
        }
      }

      console.log(`\nNombre de questions sélectionnées : ${selectedBlocks.length}`);

      const finish = await rl.question(`Terminer la création maintenant ? (y=oui, n=continuer) : \n${blue}votre examen doit avoir entre 15 et 20 questions uniques pour être valide${reset} `);
      if (finish.trim().toLowerCase() === 'y') break;
    }

    try {
      const content = composeExamFromBlocks(selectedBlocks);
      console.log('\nExamen prêt — nombre de questions :', selectedBlocks.length);
      const defaultName = `examen_${Date.now()}.gift`;
      const name = await rl.question(`Nom du fichier (ou Entrée pour ${defaultName}): `);
      const filename = (name && name.trim()) ? name.trim() : defaultName;
      await fs.writeFile(filename, content, 'utf8');
      console.log('Examen sauvegardé sous :', filename);
    } catch (e) {
      const red = '\x1b[31m';
      const reset = '\x1b[0m';
      console.error(`\n${red}Erreur lors de la création de l'examen : ${e.message}\nAssurez-vous d'avoir entre 15 et 20 questions uniques. Vous pouvez relancer la création.${reset}`);
    }

  } finally {
    if (ownRl && rl) rl.close();
  }
}
