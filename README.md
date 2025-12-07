<h1 align="left">Projet GL02 📊 A25 Sujet B</h1>

###

<p align="left">Le ministère de l’Éducation de la République de Sealand (SRYEM) développe un outil en ligne de commande pour gérer les examens au format GIFT. L’objectif est de permettre aux enseignants de rechercher, visualiser et sélectionner des questions issues d’une base certifiée pour créer des fichiers d’examen, générer un fichier VCard, simuler une passation de test et vérifier la validité des examens (unicité des questions, 15 à 20 par test). L’outil doit aussi analyser le profil d’un examen et comparer la répartition des types de questions avec la base nationale.</p>

###

<h2 align="left">Équipe 🤝  SoftMakers</h2>

###

<img height="50" src="https://image.noelshack.com/fichiers/2025/46/4/1763018890-capture-d-e-cran-2025-11-13-a-08-27-48.png" />

<p align="left">ALLABERT Mathéo<br>WITLING Louis<br>BERNET Lilian<br>LE Remy<br>LE PELTIER Swan</p>

###

<h2 align="left">💻 Langage</h2>

###

<div align="left">
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" height="40" alt="javascript logo"  />
  <img width="12" />
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" height="40" alt="nodejs logo"  />
</div>

###

<h2>👉 Utilisation</h2>

### Prérequis

- [Node.js](https://nodejs.org/) doit être installé sur votre machine.

### Installation

Ouvrez un terminal dans le dossier du projet et installez les dépendances (s'il y en a) :

```powershell
npm install
```

### Lancer le logiciel

Dans le terminal, exécutez :

```powershell
node menu.js
```

ou :

```powershell
npm start
```

<h2>🔑 Login</h2>

Une page de login vous demandera de vous connecter :

<h4>Pour un professeur :</h4>

<p>Identifiant : pierre <br> Mot de passe : 1234</p>

<h4>Pour un étudiant :</h4>

<p>Identifiant : jean <br> Mot de passe : 2345</p>

<h2>📝 Menu</h2> 

<p>Le menu interactif s'affichera et vous pourrez naviguer avec les chiffres proposés.</p>

<h4>Fonctions possibles :</h4>

1) Rechercher et afficher des questions
2) Créer un examen (GIFT))
3) Générer un fichier VCard
4) Vérifier la qualité d'un examen
5) Visualiser le profil d'un examen (générer un fichier HTML)
6) Simuler la passation d'un examen
7) Comparer un profil d'examen
8) Aide / Informations
9) Gérer les informations personnelles
0) Retourner au login

<h2>📔 Différences avec le CDC</h2> 

<p align="left"><strong>SPEC F2</strong>: Pour une navigation plus simple, on sélectionne les questions par unité, puis par page puis par numéro.
  <br><strong>SPEC F5</strong>: Pour une meilleure visibilité, la présentation statistique est différente.
  <br><strong>SPEC F7</strong>: Pour une meilleure visibilité, la présentation statistique est différente.
</p>



