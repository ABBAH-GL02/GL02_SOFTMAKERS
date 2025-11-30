import readline from "node:readline/promises";
import {stdin as input, stdout as output} from "node:process";
import path from "node:path";
import fs from "node:fs/promises";
import vCardJS from "vcards-js";

export default async function genererVCard(rl = null) {
    console.log("\n[actions] Génération d'un vCard...");

    let ownRl = false;
    if (!rl){
        rl = readline.createInterface({ input, output });
        ownRl = true;
    }

    try {
        const jsonFile = path.join(process.cwd(), "enseignants.json");

        let enseignants = [];
        try {
            const raw = await fs.readFile(jsonFile, "utf8");
            enseignants = JSON.parse(raw);
        } catch (err) {
            console.error("Erreur lors de la lecture du fichier :", err.message);
            return;
        }

        if(enseignants.length === 0){
            console.log("Aucun enseignant est trouvé dans le dossier courant.");
            return;
        }

        console.log("\n Enseignants disponibles : \n");
        enseignants.forEach((e, i) =>
            console.log(`${i + 1}) ${e.id}`)
        );

        console.log("\n Options : " +
            "\n- Tapez un numéro pour générer le fichier vCard de l'enseignant sélectionné" +
            "\n- Tapez a pour ajouter un enseignant au fichier" +
            "\n- Tapez 'q' pour quitter");

        const choice = await rl.question("\n Votre choix :");

        if (choice.toLowerCase() === 'q'){
            console.log("Vous quittez ce choix");
            return;
        }

        if (choice.toLowerCase() === 'a'){
            console.log("\n Ajout d'un enseignant : \n");

            const id = await rl.question("Identifiant de l'enseignant : ");
            const prenom = await rl.question("Prenom de l'enseignant : ");
            const nom = await rl.question("Nom de l'enseignant : ");
            const email = await rl.question("Email de l'enseignant : ");
            const telephone = await rl.question("Telephone de l'enseignant : ");
            const rue = await rl.question("Rue de l'enseignant : ");
            const ville = await rl.question("Ville de l'enseignant : ");
            const region = await rl.question("Region de l'enseignant : ");
            const codePostal = await rl.question("Code postal de l'enseignant : ");

            const newEnseignant = {
                id,
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

            enseignants.push(newEnseignant);

            await fs.writeFile(jsonFile, JSON.stringify(enseignants, null, 2), "utf8");

            console.log("\n Le nouvel enseignant est enregistré");
            return;
        }

        const index = parseInt(choice, 10) - 1;

        if (!(index >= 0 && index < enseignants.length)){
            console.log("Choix invalide.");
        }

        const selected = enseignants[index];
        console.log(`\n Enseignant choisi : ${selected.nom}, ${selected.prenom}`);

        const v = vCardJS();
        v.version = "4.0";
        v.firstName = selected.prenom;
        v.lastName = selected.nom;
        v.email = selected.email;
        v.cellPhone = selected.telephone;
        v.homeAddress.street = selected.adresse.rue;
        v.homeAddress.city = selected.adresse.ville;
        v.homeAddress.countryRegion = selected.adresse.region;
        v.homeAddress.postalCode = selected.adresse.codePostal;

        const dir = path.join(process.cwd(), "vcards");
        await fs.mkdir(dir, {recursive: true});
        const filePath = path.join(dir, `${selected.prenom}_${selected.nom}.vcf`);

        v.saveToFile(filePath);
        console.log(`\n Fichier enregistré dans ${filePath}`);

    } finally {
        if (ownRl && rl) rl.close();
    }
}