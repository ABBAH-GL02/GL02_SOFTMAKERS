import path from 'node:path';
import fs from 'node:fs/promises';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { readGiftFile, parseGiftQuestion } from '../GiftParser.js';
import { exec } from 'node:child_process';

export default async function visualiserProfil(rl = null) {
  console.log('\n[actions] Visualisation du profil d\'examen');

  let ownRl = false;
  if (!rl) {
    rl = readline.createInterface({ input, output });
    ownRl = true;
  }

  try {
    const cwd = process.cwd();
    const examsDir = path.join(cwd, 'examens');
    let files;
    try {
      files = await fs.readdir(examsDir);
    } catch (e) {
      console.error("Le dossier 'examens' est introuvable. Créez-le ou sauvegardez un examen d'abord.");
      return;
    }

    const giftFiles = files.filter(f => f.toLowerCase().endsWith('.gift'));
    if (giftFiles.length === 0) {
      console.log("Aucun fichier .gift trouvé dans ./examens.");
      return;
    }

    console.log('\nFichiers d\'examen disponibles dans ./examens :');
    giftFiles.forEach((f, i) => console.log(`${i + 1}) ${f}`));
    const choice = await rl.question('\nNuméro du fichier à visualiser (ou q pour quitter) : ');
    if (choice.trim().toLowerCase() === 'q') return;
    const index = parseInt(choice, 10) - 1;
    if (!(index >= 0 && index < giftFiles.length)) {
      console.error('Choix invalide.');
      return;
    }
    const absolutePath = path.join(examsDir, giftFiles[index]);

    const blocks = readGiftFile(absolutePath);
    const questions = blocks.map(parseGiftQuestion);

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

    const filtered = [];
    for (let i = 0; i < questions.length; i++) {
      if (isLikelyInstruction(questions[i])) continue;
      filtered.push(questions[i]);
    }

    const stats = {
      total: filtered.length,
      types: {}
    };

    filtered.forEach(q => {
      stats.types[q.type] = (stats.types[q.type] || 0) + 1;
    });

    const typeMapping = {
      'multiplechoice': 'QCM',
      'truefalse': 'V/F',
      'matching': 'Association',
      'cloze': 'Mot manquant',
      'text': 'Ouverte',
      'unknown': 'Inconnu'
    };

    const colorMapping = {
      'Association': '#4c78a8',
      'Mot manquant': '#e45756',
      'Numérique': '#59a14f',
      'Ouverte': '#eeca3b',
      'QCM': '#b07aa1',
      'V/F': '#ff9da7',
      'Inconnu': '#bab0ac'
    };

    const data = [];
    Object.entries(stats.types).forEach(([type, count]) => {
      const label = typeMapping[type] || type;
      data.push({ type: label, count: count });
    });

    const vegaSpec = {
      $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
      description: 'Profil de l\'examen',
      width: 400,
      height: 300,
      data: {
        values: data
      },
      mark: 'bar',
      encoding: {
        x: { field: 'type', type: 'nominal', axis: { title: 'Type de question', labelAngle: -45 } },
        y: { field: 'count', type: 'quantitative', axis: { title: 'Nombre de questions' } },
        color: {
          field: 'type',
          type: 'nominal',
          scale: {
            domain: Object.keys(colorMapping),
            range: Object.values(colorMapping)
          },
          legend: { title: 'Type' }
        },
        tooltip: [
          { field: 'type', title: 'Type' },
          { field: 'count', title: 'Nombre' }
        ]
      },
      title: 'Profil de l\'examen — Nombre de questions par type'
    };

    const htmlContent = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Profil de l'examen</title>
    <script src="https://cdn.jsdelivr.net/npm/vega@5"></script>
    <script src="https://cdn.jsdelivr.net/npm/vega-lite@5"></script>
    <script src="https://cdn.jsdelivr.net/npm/vega-embed@6"></script>
    <style>
        body { font-family: sans-serif; max-width: 900px; margin: 2rem auto; padding: 0 1rem; }
        h1 { color: #333; }
        .stat-card { background: #f4f4f4; padding: 1rem; border-radius: 8px; margin-bottom: 1rem; }
        #vis { width: 100%; }
    </style>
</head>
<body>
    <h1>Profil de l'examen</h1>
    <div class="stat-card">
        <h2>Statistiques Globales</h2>
        <p><strong>Fichier :</strong> ${path.basename(absolutePath)}</p>
        <p><strong>Nombre total de questions :</strong> ${stats.total}</p>
    </div>

    <div class="stat-card">
        <div id="vis"></div>
    </div>

    <script>
        const spec = ${JSON.stringify(vegaSpec)};
        vegaEmbed('#vis', spec).then(function(result) {
            // Access the Vega view instance (https://vega.github.io/vega/docs/api/view/) as result.view
        }).catch(console.error);
    </script>
</body>
</html>
    `;

    const fileNameNoExt = path.parse(absolutePath).name;
    const outputDir = path.join(cwd, 'profil_examen');
    try {
      await fs.mkdir(outputDir, { recursive: true });
    } catch (e) {
    }
    const outputPath = path.join(outputDir, `profil_examen_${fileNameNoExt}.html`);
    await fs.writeFile(outputPath, htmlContent, 'utf8');
    console.log(`\nProfil généré avec succès : ${outputPath}`);
    
    const fileUrl = new URL(`file:///${outputPath.replace(/\\/g, '/')}`).href;
    console.log(`Lien cliquable : ${fileUrl}`);

    // Ouvrir automatiquement dans le navigateur
    const command = process.platform === 'win32' ? `start "" "${outputPath}"` : (process.platform === 'darwin' ? `open "${outputPath}"` : `xdg-open "${outputPath}"`);
    exec(command, (error) => {
      if (error) console.error(`Erreur lors de l'ouverture automatique : ${error.message}`);
    });

  } catch (err) {
    console.error('Erreur :', err.message);
  } finally {
    if (ownRl && rl) rl.close();
  }
}
