import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import fs from "node:fs/promises";
import path from "node:path";

export default async function menuLogin(rl = null) {

    let ownRl = false;
    if (!rl) {
        rl = readline.createInterface({ input, output, terminal: true });
        ownRl = true;
    }

    try {
        console.log("\n---------------------------------------------------\n");
        console.log("LOGIN");
        const id = await rl.question("Identifiant : ");
        const password = await rl.question("Mot de passe : ");

        const data = await fs.readFile(path.join(process.cwd(), "actions", "enseignant.json"), "utf-8");
        const enseignants = JSON.parse(data);

        const user = enseignants.find(e => e.id === id && e.password === password);

        if (user) {
            console.log(`\nConnexion réussie ! Bienvenue ${user.prenom} ${user.nom}.`);
            return user.role;
        } else {
            console.log("\nIdentifiant ou mot de passe incorrect.");
            return null;
        }
    } finally {
        if (ownRl && rl) {
            rl.close();
        }
    }
}