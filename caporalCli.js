const cli = require("@caporal/core").default;
const fs = require("fs");
const vega = require("vega");
const vegaLite = require("vega-lite");
const menu = require("./menu.js");
const actions = require("./actions");

cli
  .version("1.0.0")

  .command("menu", "Lancer le menu interactif")
  .action(async () => {
    await menu.menuPrincipal();
  })

  .command("search", "Rechercher et afficher des questions")
  .action(async () => {
    await actions.chercherQuestions();
  })

  .command("createTest", "Créer un examen (GIFT)")
  .action(async () => {
    await actions.creerExamen();
  })

  .command("vcard", "Créer un fichier VCard")
  .action(async () => {
    await actions.genererVCard();
  })

  .command("verif", "Vérifier la qualité d'un examen")
  .action(async () => {
    await actions.verifierExamen();
  })

  .command("visualize", "Visualiser le profil d'un examen")
  .action(async () => {
    await actions.visualiserProfil();
  })

  .command("pass", "Simuler la passation d'un examen")
  .action(async () => {
    await actions.simulerExamen();
  })

  .command("compare", "Comparer un profil d'examen")
  .action(async () => {
    await actions.comparerProfils();
  });

// Run the CLI (pass only user args, not node/script paths)
cli.run(process.argv.slice(2));
