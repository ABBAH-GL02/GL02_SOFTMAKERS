const readline = require("readline");
// readline est une bibliothèque intégrée à Node.js qui permet de lire des entrées (input) et d’afficher des sorties (output) dans le terminal
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: true,
});
const actions = require("./actions");
function demanderReponseUtilisateur(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, (ans) => resolve(ans.trim()));
  });
}

async function menuPrincipal() {
  console.log("---------------------------------------------------\n");
  while (true) {
    console.log("MENU PRINCIPAL");
    console.log("1) Rechercher et afficher des questions");
    console.log("2) Créer un examen (GIFT))");
    console.log("3) Générer un fichier VCard");
    console.log("4) Vérifier la qualité d'un examen");
    console.log(
      "5) Visualiser le profil d'un examen (générer un fichier HTML)"
    );
    console.log("6) Simuler la passation d'un examen");
    console.log("7) Comparer un profil d'examen");
    console.log("8) Aide / Informations");
    console.log("0) Quitter");
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
        await simulerExamen();
        break;
      case "7":
        await comparerProfils();
        break;
      case "8":
        afficherAide();
        break;
      case "0":
        console.log("Vous avez quitté le logiciel.");
        rl.close();
        process.exit(0);
      default:
        console.log("Commande inconnue. Tapez 8 pour l'aide.");
    }
    console.log("\n---\n");
  }
}

async function chercherQuestions() {
  await actions.chercherQuestions();
}

async function creerExamen() {
  await actions.creerExamen();
}

async function genererVCard() {
  await actions.genererVCard();
}

async function verifierExamen() {
  await actions.verifierExamen();
}

async function visualiserProfil() {
  await actions.visualiserProfil();
}

async function simulerExamen() {
  await actions.simulerExamen();
}

async function comparerProfils() {
  await actions.comparerProfils();
}

async function afficherAide() {
  await actions.afficherAide();
}

module.exports = {
  demanderReponseUtilisateur,
  menuPrincipal,
};

if (require.main === module) {
  menuPrincipal().catch((err) => {
    console.error("Erreur fatale :", err);
    rl.close();
    process.exit(1); //process.exit(1) indique que le programme s’est terminé avec une erreur.
  });
}
