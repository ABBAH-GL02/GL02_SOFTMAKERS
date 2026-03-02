import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import path from "node:path";
import fs from "node:fs/promises";
import { colors } from '../utils/colors.js';

import { isValidName, isValidEmail, isValidPhone } from '../utils/validators.js';

export default async function ajoutAccount(rl = null) {
    console.log("\n Ajout d'un compte : \n");

    let ownRl = false;
    if (!rl) {
        rl = readline.createInterface({ input, output });
        ownRl = true;
    }

    try {
        const jsonFile = path.join(process.cwd(), "actions", "account.json");

        let accounts = [];
        try {
            const data = await fs.readFile(jsonFile, "utf-8");
            accounts = JSON.parse(data);
        } catch (readErr) {
            // Si le fichier n'existe pas, on part d'une liste vide (ou on pourrait gérer l'erreur autrement)
            if (readErr.code !== 'ENOENT') {
                throw readErr;
            }
        }

        const id = await rl.question("Identifiant : ");
        const password = await rl.question("Mot de passe : ");
        const role = await demanderRole(rl);

        let prenom;
        while (true) {
            prenom = await rl.question("Prenom : ");
            if (isValidName(prenom)) break;
            console.log(`${colors.red}Prénom invalide. Caractères interdits : < > * ? " / \\ : , ; .${colors.reset}`);
        }

        let nom;
        while (true) {
            nom = await rl.question("Nom : ");
            if (isValidName(nom)) break;
            console.log(`${colors.red}Nom invalide. Caractères interdits : < > * ? " / \\ : , ; .${colors.reset}`);
        }

        let email;
        while (true) {
            email = await rl.question("Email : ");
            if (isValidEmail(email)) break;
            console.log(`${colors.red}Email invalide. Format attendu : exemple@domaine.com${colors.reset}`);
        }

        let telephone;
        while (true) {
            telephone = await rl.question("Telephone : ");
            if (isValidPhone(telephone)) break;
            console.log(`${colors.red}Téléphone invalide. Utilisez uniquement des chiffres, espaces, +, -, (, ).${colors.reset}`);
        }

        const rue = await rl.question("Rue : ");
        const ville = await rl.question("Ville : ");
        const region = await rl.question("Region : ");
        const codePostal = await rl.question("Code postal : ");

        const newAccount = {
            id,
            password,
            role,
            prenom,
            nom,
            email,
            telephone,
            adresse: {
                rue,
                ville,
                region,
                codePostal
            }
        };

        accounts.push(newAccount);

        await fs.writeFile(jsonFile, JSON.stringify(accounts, null, 2), "utf8");

        console.log("\n Le nouveau compte est enregistré");
        if (role === "enseignant") {
            console.log(`${colors.blue}Vous devrez retaper "1" si vous souhaitez générer le fichier VCard du nouvel enseignant enregistré.${colors.reset}`);
        }
    } catch (err) {
        console.error(`${colors.red}Erreur lors de l'ajout du compte :${colors.reset}`, err);
    } finally {
        if (ownRl && rl) {
            rl.close();
        }
    }
}

async function demanderRole(rl) {
    while (true) {
        const role = await rl.question(`Role 1 : enseignant / Rôle 2 : etudiant) :\n${colors.blue}(taper "1" si vous êtes enseignant, taper "2" si vous êtes étudiant)${colors.reset} `);
        if (role === "1") {
            return "enseignant";
        }
        else if (role === "2") {
            return "etudiant";
        }
        else {
            console.log(`${colors.red}Veuillez entrer un nombre valide. 1 pour enseignant | 2 pour étudiant.${colors.reset}`);
        }
    }
}