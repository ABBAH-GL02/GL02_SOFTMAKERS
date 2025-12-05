import path from 'node:path';
import fs from 'node:fs/promises';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { readGiftFile, parseGiftQuestion } from '../GiftParser.js';
import { calculateExamStats, typeMapping, colorMapping } from '../utils/statsExamen.js';
import { exec } from 'node:child_process';

export default async function comparerProfils(rl = null) {
  console.log('\n[actions] Comparaison de profils...');

  let ownRl = false;
  if (!rl) {
    rl = readline.createInterface({ input, output });
    ownRl = true;
  }

  try {
    // 1. Select User Exam
    const cwd = process.cwd();
    const examsDir = path.join(cwd, 'examens');
    let files;
    try {
        files = await fs.readdir(examsDir);
    } catch (e) {
        console.error("Le dossier 'examens' est introuvable.");
        return;
    }

    const giftFiles = files.filter(f => f.toLowerCase().endsWith('.gift'));
    if (giftFiles.length === 0) {
        console.log("Aucun fichier .gift trouvé dans ./examens.");
        return;
    }

    console.log('\nFichiers d\'examen disponibles dans ./examens :');
    giftFiles.forEach((f, i) => console.log(`${i + 1}) ${f}`));
    const choice = await rl.question('\nNuméro du fichier à comparer (ou q pour quitter) : ');
    if (choice.trim().toLowerCase() === 'q') return;
    const index = parseInt(choice, 10) - 1;
    if (!(index >= 0 && index < giftFiles.length)) {
        console.error('Choix invalide.');
        return;
    }
    const absolutePath = path.join(examsDir, giftFiles[index]);
    const fileName = giftFiles[index];

    // 2. Calculate User Stats
    const blocks = readGiftFile(absolutePath);
    const questions = blocks.map(parseGiftQuestion);
    const userStats = calculateExamStats(questions);

    // 3. Load Database
    const dbPath = path.join(cwd, 'database_profils.json');
    let database = [];
    try {
        const dbContent = await fs.readFile(dbPath, 'utf8');
        database = JSON.parse(dbContent);
    } catch (e) {
        console.error("Erreur : Impossible de lire la banque de données (database_profils.json).");
        console.error("Veuillez d'abord exécuter 'node scripts/genererBanque.js'.");
        return;
    }

    if (database.length === 0) {
        console.warn("Attention : La banque de données est vide.");
        return;
    }

    // 4. Calculate Average Stats
    const totalExams = database.length;
    const avgStats = {};
    
    // Accumulate
    database.forEach(entry => {
        Object.entries(entry.stats.types).forEach(([type, count]) => {
            const pct = (count / entry.stats.total) * 100;
            if (!avgStats[type]) avgStats[type] = 0;
            avgStats[type] += pct;
        });
    });

    // Average
    Object.keys(avgStats).forEach(type => {
        avgStats[type] = avgStats[type] / totalExams;
    });

    // 5. Compare and Display CLI (Spec F7)
    console.log('\n--- Résultats de la comparaison ---');
    console.log(`Examen : ${fileName} (${userStats.total} questions)`);
    console.log(`Base de référence : ${totalExams} examens simulés\n`);

    const allTypes = new Set([...Object.keys(userStats.types), ...Object.keys(avgStats)]);
    const comparisonData = [];

    allTypes.forEach(type => {
        const userCount = userStats.types[type] || 0;
        const userPct = (userStats.total > 0) ? (userCount / userStats.total) * 100 : 0;
        const avgPct = avgStats[type] || 0;
        
        const label = typeMapping[type] || type;
        
        // Warning for unknown types (Spec F7)
        if (!typeMapping[type]) {
             console.warn(`[Avertissement] Type de question inconnu détecté : ${type}`);
        }

        console.log(`Type de question : ${label.padEnd(15)} | Profil : ${userPct.toFixed(1)}% | Moyenne Banque : ${avgPct.toFixed(1)}%`);
        
        comparisonData.push({ type: label, category: 'Votre Examen', value: userPct });
        comparisonData.push({ type: label, category: 'Moyenne Banque', value: avgPct });
    });

    // 6. Generate Visualization (HTML)
    const vegaSpec = {
      $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
      title: 'Comparaison de Profil : Votre Examen vs Moyenne Nationale',
      width: 400,
      height: 300,
      data: { values: comparisonData },
      mark: 'bar',
      encoding: {
        x: { 
            field: 'type', 
            axis: { title: null, labelAngle: -45 } 
        },
        y: { 
            field: 'value', 
            type: 'quantitative', 
            axis: { title: 'Pourcentage (%)' } 
        },
        xOffset: { field: 'category' },
        color: { 
            field: 'category', 
            scale: { scheme: 'category10' },
            legend: { title: 'Légende' } 
        },
        tooltip: [
            { field: 'type', title: 'Type' },
            { field: 'category', title: 'Source' },
            { field: 'value', title: 'Pourcentage', format: '.1f' }
        ]
      }
    };

    const htmlContent = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Comparaison de Profil</title>
    <script src="https://cdn.jsdelivr.net/npm/vega@5"></script>
    <script src="https://cdn.jsdelivr.net/npm/vega-lite@5"></script>
    <script src="https://cdn.jsdelivr.net/npm/vega-embed@6"></script>
    <style>
        body { font-family: sans-serif; max-width: 800px; margin: 2rem auto; padding: 1rem; }
        .card { background: #f9f9f9; padding: 1.5rem; border-radius: 8px; margin-bottom: 2rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        h1, h2 { color: #2c3e50; }
        #vis { width: 100%; }
        table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
        th, td { text-align: left; padding: 8px; border-bottom: 1px solid #ddd; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <h1>Rapport de Comparaison</h1>
    
    <div class="card">
        <h2>Détails</h2>
        <p><strong>Fichier analysé :</strong> ${fileName}</p>
        <p><strong>Questions :</strong> ${userStats.total}</p>
        <p><strong>Base de comparaison :</strong> ${totalExams} profils nationaux</p>
    </div>

    <div class="card">
        <h2>Visualisation</h2>
        <div id="vis"></div>
    </div>

    <script>
        const spec = ${JSON.stringify(vegaSpec)};
        vegaEmbed('#vis', spec).catch(console.error);
    </script>
</body>
</html>
    `;

    const fileNameNoExt = path.parse(fileName).name;
    const outputDir = path.join(cwd, 'profil_examen');
    try { await fs.mkdir(outputDir, { recursive: true }); } catch(e) {}
    
    const outputPath = path.join(outputDir, `comparaison_${fileNameNoExt}.html`);
    await fs.writeFile(outputPath, htmlContent, 'utf8');
    
    console.log(`\nRapport détaillé généré : ${outputPath}`);
    
    // Open in browser
    const command = process.platform === 'win32' ? `start "" "${outputPath}"` : (process.platform === 'darwin' ? `open "${outputPath}"` : `xdg-open "${outputPath}"`);
    exec(command, (error) => {
      if (error) console.error(`Erreur ouverture auto : ${error.message}`);
    });

  } catch (err) {
    console.error('Erreur :', err.message);
  } finally {
    if (ownRl && rl) rl.close();
  }
}

