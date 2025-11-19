//Fichier permettant d'importer toutes les actions disponibles

const chercherQuestions = require("./chercherQuestions");
const creerExamen = require("./creerExamen");
const genererVCard = require("./genererVCard");
const verifierExamen = require("./verifierExamen");
const visualiserProfil = require("./visualiserProfil");
const simulerExamen = require("./simulerExamen");
const comparerProfils = require("./comparerProfils");
const afficherAide = require("./afficherAide");

module.exports = {
  chercherQuestions,
  creerExamen,
  genererVCard,
  verifierExamen,
  visualiserProfil,
  simulerExamen,
  comparerProfils,
  afficherAide,
};
