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

  let files;
  try {
    files = await fs.readdir(dataDir);
  } catch (err) {
    // Définir les couleurs une seule fois pour toute la fonction
    const blue = '\x1b[34m';
    const reset = '\x1b[0m';
    console.error("Le dossier SujetB_data est introuvable :", err.message);
    return;
  }

  const giftFiles = files.filter((f) => f.toLowerCase().endsWith('.gift'));
  if (giftFiles.length === 0) {
    console.log("Aucun fichier .gift trouvé dans SujetB_data.");
    return;
  }

  // Organiser fichiers par unité (U\d+) puis par page (p\d+(?:_\d+)?)
  const units = {};
  for (const fname of giftFiles) {
    const unitMatch = fname.match(/U\d+/i);
    const pageMatch = fname.match(/p\d+(?:_\d+)?/i);
    const unit = unitMatch ? unitMatch[0].toUpperCase() : 'UNKNOWN';
    const page = pageMatch ? pageMatch[0].toLowerCase() : "pas de numéro de page (c'est normal car ce fichier n'en a pas, contrairement aux autres questions). Taper 1"; //'unknown'

    units[unit] = units[unit] || {};
    units[unit][page] = units[unit][page] || [];
    units[unit][page].push(fname);
  }

  let ownRl = false;
  if (!rl) {
    rl = readline.createInterface({ input, output });
    ownRl = true;
  }

  try {
    while (true) {
      // Choix de l'unité
      const unitKeys = Object.keys(units).sort();
      console.log('\nUnités disponibles:');
      unitKeys.forEach((u, i) => console.log(`${i + 1}) ${u}`));

      // Affichage en bleu pour la ligne de saisie du numéro d'unité
      const blue = '\x1b[34m';
      const reset = '\x1b[0m';
      const unitPrompt = `\nNuméro d'unité (ou q pour quitter):\n${blue}(exemple: taper l'index "2" pour accéder à l'unité \"${unitKeys[1]}\")${reset} `;
      const unitChoice = await rl.question(unitPrompt);
      if (unitChoice.trim().toLowerCase() === 'q') return;
      const unitIdx = parseInt(unitChoice, 10) - 1;
      if (!(unitIdx >= 0 && unitIdx < unitKeys.length)) {
        console.log('Choix d\'unité invalide.');
        return;
      }

      const chosenUnit = unitKeys[unitIdx];
      const pages = Object.keys(units[chosenUnit]).sort();

      console.log(`\nPages disponibles pour ${chosenUnit}:`);
      pages.forEach((p, i) => console.log(`${i + 1}) ${p}`));

      // Affichage en bleu pour l'exemple de sélection de page
      
      let pagePrompt = '\nNuméro de page (ou q pour quitter): ';
      if (pages.length > 0) {
        pagePrompt += `\n${blue}(exemple: taper l'index "1" pour accéder à la page "${pages[0]}")${reset} `;
      }
      const pageChoice = await rl.question(pagePrompt);
      if (pageChoice.trim().toLowerCase() === 'q') return;
      const pageIdx = parseInt(pageChoice, 10) - 1;
      if (!(pageIdx >= 0 && pageIdx < pages.length)) {
        console.log('Choix de page invalide.');
        return;
      }

      const chosenPage = pages[pageIdx];
      const filesForPage = units[chosenUnit][chosenPage];

      // Si plusieurs fichiers pour la même page, on demande lequel ouvrir
      let selectedFile;
      if (filesForPage.length === 1) {
        selectedFile = filesForPage[0];
      } else {
        console.log('\nFichiers disponibles pour cette page:');
        filesForPage.forEach((f, i) => console.log(`${i + 1}) ${f}`));
        const fileChoice = await rl.question('\nNuméro du fichier (ou q pour quitter): ');
        if (fileChoice.trim().toLowerCase() === 'q') return;
        const fileIdx = parseInt(fileChoice, 10) - 1;
        if (!(fileIdx >= 0 && fileIdx < filesForPage.length)) {
          console.log('Choix de fichier invalide.');
          return;
        }
        selectedFile = filesForPage[fileIdx];
      }

      const fullPath = path.join(dataDir, selectedFile);
      const questionBlocks = readGiftFile(fullPath);

      if (!questionBlocks || questionBlocks.length === 0) {
        console.log('Aucune question trouvée dans le fichier sélectionné.');
        return;
      }

      // Afficher sommaire des questions (titre seulement)
      const parsed = questionBlocks.map((b) => parseGiftQuestion(b));
      console.log(`\nQuestions dans ${selectedFile}:`);
      parsed.forEach((q, i) => {
        console.log(`${i + 1}) ${q.title}`);
      });

      // Affichage en bleu pour l'exemple de sélection de question
      let questionPrompt = '\nNuméro de question pour afficher (ou q pour quitter): ';
      if (parsed.length > 0) {
        questionPrompt += `\n${blue}(exemple: taper l'index "1" pour accéder à la question \"${parsed[0].title}\")${reset} `;
      }
      const qChoice = await rl.question(questionPrompt);
      if (qChoice.trim().toLowerCase() === 'q') return;
      const qIdx = parseInt(qChoice, 10) - 1;
      if (!(qIdx >= 0 && qIdx < parsed.length)) {
        console.log('Choix de question invalide.');
        return;
      }

      const q = parsed[qIdx];
      console.log('\n---- Question sélectionnée ----');
      console.log(q.display || q.raw);
      console.log('----');

      // Appuyez sur n'importe quelle touche pour revenir au menu principal
      // Si le terminal supporte le mode brut, on capte une seule touche, sinon on attend Entrée
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
        return; // Retour au menu principal
      } else {
        await rl.question("\nAppuyez sur Entrée pour revenir au menu principal...");
        return;
      }
    }
  } finally {
    if (ownRl && rl) rl.close();
  }
}

