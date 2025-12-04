import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import path from "node:path";
import fs from "node:fs/promises";

export default async function ajoutAccount(rl = null) {
    console.log("\n Ajout d'un compte : \n");

    let ownRl = false;
    if (!rl) {
        rl = readline.createInterface({ input, output });
        ownRl = true;
    }

    try {
        const jsonFile = path.join(process.cwd(), "actions", "account.json");
        const data = await fs.readFile(jsonFile, "utf-8");
        const accounts = JSON.parse(data);

        const id = await rl.question("Identifiant : ");
        const password = await rl.question("Mot de passe : ");
        const role = await demanderRole(rl);
        const prenom = await rl.question("Prenom : ");
        const nom = await rl.question("Nom : ");
        const email = await rl.question("Email : ");
        const telephone = await rl.question("Telephone : ");
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

        console.log("\n Le nouvel compte est enregistré");
    } catch (err) {
        console.error("Erreur lors de l'ajout du compte :", err);
    } finally {
        if (ownRl && rl) {
            rl.close();
        }
    }
}

async function demanderRole(rl){
    while (true){
        const role = await rl.question("Role 1 : enseignant / Rôle 2 : etudiant) : ");
        if (role === "1"){
            return "enseignant";
        }
        else if (role === "2"){
            return "etudiant";
        }
        else{
            console.log("Veuillez entrer un nombre valide. 1 pour enseignant | 2 pour étudiant.");
        }
    }
}