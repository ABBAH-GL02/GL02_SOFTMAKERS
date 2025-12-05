import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import path from "node:path";
import fs from "node:fs/promises";
import vCardJS from "vcards-js";
import ajoutAccount from "./ajoutAccount.js";
import { colors } from '../utils/colors.js';

export default async function genererVCard(rl = null) {
    console.log("\n[actions] Génération d'un vCard...");

    let ownRl = false;
    if (!rl) {
        rl = readline.createInterface({ input, output });
        ownRl = true;
    }

    try {
        const jsonFile = path.join(process.cwd(), "actions", "account.json");

        let enseignants = [];
        try {
            const raw = await fs.readFile(jsonFile, "utf8");
            enseignants = JSON.parse(raw);
        } catch (err) {
            console.error("Erreur lors de la lecture du fichier :", err.message);
            return;
        }

        enseignants = enseignants.filter(e => e.role === "enseignant");

        if (enseignants.length === 0) {
            console.log("Aucun enseignant est trouvé dans le dossier courant.");
            return;
        }

        console.log("\n Enseignants disponibles : \n");
        enseignants.forEach((e, i) =>
            console.log(`${i + 1}) ${e.prenom} ${e.nom}`)
        );

        console.log("\n Options : " +
            "\n- Tapez un numéro pour générer le fichier vCard de l'enseignant sélectionné" +
            "\n- Tapez a pour ajouter un enseignant au fichier" +
            "\n- Tapez 'q' pour quitter");

        const choice = await rl.question("\n Votre choix :");

        if (choice.toLowerCase() === 'q') {
            console.log("Vous quittez ce choix");
            return;
        }

        if (choice.toLowerCase() === 'a') {
            await ajoutAccount(rl);
            return;
        }

        const index = parseInt(choice, 10) - 1;

        if (!(index >= 0 && index < enseignants.length)) {
            console.log(`${colors.red}Choix invalide.${colors.reset} Tapez 7 pour l'aide (enseignant) ou 3 pour l'aide (étudiant).`);
        }

        const selected = enseignants[index];
        console.log(`\n Enseignant choisi : ${selected.nom}, ${selected.prenom}`);

        const v = vCardJS();
        v.version = "4.0";
        v.firstName = selected.prenom;
        v.lastName = selected.nom;
        v.email = selected.email;
        v.role = selected.role;
        v.cellPhone = selected.telephone;
        v.homeAddress.street = selected.adresse.rue;
        v.homeAddress.city = selected.adresse.ville;
        v.homeAddress.countryRegion = selected.adresse.region;
        v.homeAddress.postalCode = selected.adresse.codePostal;

        const dir = path.join(process.cwd(), "vcards");
        await fs.mkdir(dir, { recursive: true });
        const filePath = path.join(dir, `${selected.prenom}_${selected.nom}.vcf`);

        v.saveToFile(filePath);
        console.log(`\n Fichier enregistré dans ${filePath}`);

    } finally {
        if (ownRl && rl) rl.close();
    }
}