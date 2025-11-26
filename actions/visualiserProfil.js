import path from 'node:path';
import fs from 'node:fs/promises';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { readGiftFile, parseGiftQuestion } from '../GiftParser.js';

export default async function visualiserProfil(rl = null) {
  console.log('\n[actions] Visualisation du profil d\'examen');

  let ownRl = false;
  if (!rl) {
    rl = readline.createInterface({ input, output });
    ownRl = true;
  }

  try {
    const filePath = await rl.question('Entrez le chemin du fichier GIFT : ');
    const absolutePath = path.resolve(filePath.trim());

    try {
      await fs.access(absolutePath);
    } catch {
      console.error('Fichier introuvable.');
      return;
    }

    const blocks = readGiftFile(absolutePath);
    const questions = blocks.map(parseGiftQuestion);

    const stats = {
      total: questions.length,
      types: {}
    };

    questions.forEach(q => {
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

    const outputPath = 'profil_examen.html';
    await fs.writeFile(outputPath, htmlContent, 'utf8');
    console.log(`\nProfil généré avec succès : ${outputPath}`);
    console.log('Ouvrez ce fichier dans votre navigateur pour voir le rapport.');

  } catch (err) {
    console.error('Erreur :', err.message);
  } finally {
    if (ownRl && rl) rl.close();
  }
}
