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

      if (q.type === 'multiplechoice' || q.type === 'truefalse') {
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
        // Text, Cloze, etc.
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
        // Afficher la bonne réponse si possible
        if (q.type === 'multiplechoice' || q.type === 'truefalse') {
            const correctChoice = q.choices.find(c => c.correct);
            if (correctChoice) console.log(`La bonne réponse était : ${correctChoice.text}`);
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
