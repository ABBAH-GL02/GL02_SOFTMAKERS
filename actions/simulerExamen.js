import path from 'node:path';
import fs from 'node:fs/promises';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { readGiftFile, parseGiftQuestion } from '../GiftParser.js';

export default async function simulerExamen(rl = null) {
  console.log('\n[actions] Simulation de passation d\'examen');

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
    const choice = await rl.question('\nNuméro du fichier à simuler (ou q pour quitter) : ');
    if (choice.trim().toLowerCase() === 'q') return;
    const index = parseInt(choice, 10) - 1;
    if (!(index >= 0 && index < giftFiles.length)) {
      console.error('Choix invalide.');
      return;
    }

    const absolutePath = path.join(examsDir, giftFiles[index]);
    const blocks = readGiftFile(absolutePath);
    const parsed = blocks.map(parseGiftQuestion);

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

    const questions = [];
    for (let i = 0; i < parsed.length; i++) {
      if (isLikelyInstruction(parsed[i])) continue;
      questions.push(parsed[i]);
    }

    if (questions.length === 0) {
      console.log('Aucune question trouvée dans ce fichier.');
      return;
    }

    let score = 0;
    console.log(`\nDébut de l'examen : ${questions.length} questions.`);
    console.log('---------------------------------------------------');

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      console.log(`\nQuestion ${i + 1}: ${q.title}`);
      console.log(q.text);

      let isCorrect = false;

      // Vérifie si c'est une question avec réponse à taper (même si le type est multiplechoice)
      // Si le texte contient des balises <b> avec des mots-clés, c'est probablement un cloze à taper
      const hasHiddenChoices = q.text && q.text.includes('<b>') && q.text.includes('</b>');
      
      if (q.type === 'shortanswer' || q.type === 'cloze' || q.type === 'text' || hasHiddenChoices) {
        // Questions ouvertes: demander la réponse SANS afficher les bonnes réponses d'avance
        const answer = await rl.question('Votre réponse : ');
        if (q.correctAnswers && q.correctAnswers.length > 0) {
          if (q.correctAnswers.some(ca => ca.toLowerCase() === answer.trim().toLowerCase())) {
            isCorrect = true;
          }
        }
      } else if (q.type === 'multiplechoice') {
        // Affiche les choix pour les QCM
        if (q.choices && q.choices.length > 0) {
          q.choices.forEach((c, idx) => {
            console.log(`${idx + 1}) ${c.text}`);
          });

          const answer = await rl.question('Votre réponse (numéro) : ');
          const choiceIdx = parseInt(answer.trim()) - 1;

          if (choiceIdx >= 0 && choiceIdx < q.choices.length) {
            if (q.choices[choiceIdx].correct) {
              isCorrect = true;
            }
          }
        }
      } else if (q.type === 'truefalse') {
        // Vrai/Faux
        console.log('1) True');
        console.log('2) False');

        const answer = await rl.question('Votre réponse (1 ou 2) : ');
        const choiceIdx = parseInt(answer.trim()) - 1;

        if (choiceIdx >= 0 && choiceIdx < q.choices.length) {
          if (q.choices[choiceIdx].correct) {
            isCorrect = true;
          }
        }
      } else if (q.type === 'matching') {
         console.log('Appariement (format simplifié : entrez les paires séparées par des virgules, ex: A->B, C->D)');
         if (q.matchingPairs) {
             q.matchingPairs.forEach((p, idx) => {
                 console.log(`Paire ${idx+1}: ${p.left} -> ?`);
             });

             console.log('(Note: La vérification automatique des questions d\'appariement est simplifiée)');
             const answer = await rl.question('Entrez la réponse complète attendue pour valider (ou Entrée pour passer) : ');

             isCorrect = true; 
             for(const p of q.matchingPairs) {
                 if(!answer.includes(p.right)) isCorrect = false;
             }
         }
      } else {
        // Fallback pour autres types
        const answer = await rl.question('Votre réponse : ');
        if (q.correctAnswers && q.correctAnswers.length > 0) {
          if (q.correctAnswers.some(ca => ca.toLowerCase() === answer.trim().toLowerCase())) {
            isCorrect = true;
          }
        }
      }

      if (isCorrect) {
        console.log('✅ Correct !');
        score++;
      } else {
        console.log('❌ Incorrect.');
        const hasHiddenChoices = q.text && q.text.includes('<b>') && q.text.includes('</b>');
        
        if (q.type === 'multiplechoice' && !hasHiddenChoices) {
          console.log('\nRéponses possibles :');
          q.choices.forEach((c, idx) => {
            const marker = c.correct ? '✓' : ' ';
            console.log(`${idx + 1}) ${c.text} ${marker}`);
          });
        } else if (q.type === 'truefalse') {
          console.log('\nRéponses correctes :');
          q.choices.forEach((c) => {
            const marker = c.correct ? '✓' : ' ';
            console.log(`${c.text} ${marker}`);
          });
        } else if (q.type === 'matching') {
          console.log('\nPaires attendues :');
          if (q.matchingPairs && q.matchingPairs.length > 0) {
            q.matchingPairs.forEach((p, idx) => {
              console.log(`${idx + 1}) ${p.left} -> ${p.right}`);
            });
          }
        } else {
          // Questions ouvertes, cloze, shortanswer: afficher les bonnes réponses seulement si incorrect
          if (q.correctAnswers && q.correctAnswers.length > 0) {
            console.log('\nBonne(s) réponse(s) :');
            q.correctAnswers.forEach((a, idx) => console.log(`${idx + 1}) ${a}`));
          }
        }
      }
    }

    console.log('\n---------------------------------------------------');
    console.log(`Examen terminé.`);
    console.log(`Votre score : ${score} / ${questions.length}`);
    const percentage = Math.round((score / questions.length) * 100);
    console.log(`Pourcentage : ${percentage}%`);

  } catch (err) {
    console.error('Erreur :', err.message);
  } finally {
    if (ownRl && rl) rl.close();
  }
}
