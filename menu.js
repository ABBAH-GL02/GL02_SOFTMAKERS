import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { colors } from './utils/colors.js';
// readline est une bibliothèque intégrée à Node.js qui permet de lire des entrées (input) et d'afficher des sorties (output) dans le terminal
const rl = readline.createInterface({ input, output, terminal: true });
import * as actions from './actions/index.js';
async function demanderReponseUtilisateur(prompt) {
  const ans = await rl.question(prompt);
  return ans?.trim();
}

async function menuPrincipal() {
  const user = await menuLogin();
  const role = user.role;
  const userId = user.id;

  if (role == "enseignant") {
    console.log("---------------------------------------------------\n");
    while (true) {
      console.log("MENU PRINCIPAL");
      console.log("1) Rechercher et afficher des questions");
      console.log("2) Créer un examen (GIFT))");
      console.log("3) Générer un fichier VCard");
      console.log("4) Vérifier la qualité d'un examen");
      console.log("5) Visualiser le profil d'un examen (générer un fichier HTML)");
      console.log("6) Comparer un profil d'examen");
      console.log("7) Aide / Informations");
      console.log("8) Gérer mes informations personnelles");
      console.log("0) Retourner au login");
      const choice = await demanderReponseUtilisateur("\nChoix > ");

      switch (choice) {
        case "1":
          await chercherQuestions();
          break;
        case "2":
          await creerExamen();
          break;
        case "3":
          await genererVCard();
          break;
        case "4":
          await verifierExamen();
          break;
        case "5":
          await visualiserProfil();
          break;
        case "6":
          await comparerProfils();
          break;
        case "7":
          afficherAide();
          break;
        case "8":
          const resultEns = await gererInfosPersonnelles(userId);
          if (resultEns === "ACCOUNT_DELETED") return;
          break;
        case "0":
          await menuLogin();
          break;
        default:
          console.log(`${colors.red}Commande inconnue.${colors.reset} Tapez 7 pour l'aide.`);
      }
    }
    console.log("\n---\n");
  }
  else if (role == "etudiant") {
    console.log("---------------------------------------------------\n");
    while (true) {
      console.log("MENU PRINCIPAL");
      console.log("1) Générer un fichier VCard");
      console.log("2) Simuler la passation d'un examen");
      console.log("3) Aide / Informations");
      console.log("4) Gérer mes informations personnelles");
      console.log("0) Retourner au login");
      const choice = await demanderReponseUtilisateur("\nChoix > ");

      switch (choice) {
        case "1":
          await genererVCard();
          break;
        case "2":
          await simulerExamen();
          break;
        case "3":
          afficherAide();
          break;
        case "4":
          const resultEtu = await gererInfosPersonnelles(userId);
          if (resultEtu === "ACCOUNT_DELETED") return;
          break;
        case "0":
          await menuLogin();
          break;
        default:
          console.log(`${colors.red}Commande inconnue.${colors.reset} Tapez 3 pour l'aide.`);
      }
    }
    console.log("\n---\n");
  }
}

async function menuLogin() {
  return await actions.menuLogin(rl);
}

async function chercherQuestions() {
  await actions.chercherQuestions(rl);
}

async function creerExamen() {
  await actions.creerExamen(rl);
}

async function genererVCard() {
  await actions.genererVCard(rl);
}

async function verifierExamen() {
  await actions.verifierExamen(rl);
}

async function visualiserProfil() {
  await actions.visualiserProfil(rl);
}

async function simulerExamen() {
  await actions.simulerExamen(rl);
}

async function comparerProfils() {
  await actions.comparerProfils(rl);
}

async function afficherAide() {
  await actions.afficherAide();
}

async function gererInfosPersonnelles(userId) {
  return await actions.gererInfosPersonnelles(rl, userId);
}

export { demanderReponseUtilisateur, menuPrincipal };

import { fileURLToPath as _fileURLToPath } from 'node:url';

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  async function mainLoop() {
    while (true) {
      try {
        await menuPrincipal();
        // Si menuPrincipal retourne (déconnexion ou suppression compte), on boucle pour revenir au login
      } catch (err) {
        console.error('Erreur fatale :', err);
        rl.close();
        process.exit(1);
      }
    }
  }
  mainLoop();
}
