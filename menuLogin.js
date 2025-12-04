import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import fs from "node:fs/promises";
import path from "node:path";
import inquirer from "inquirer";
import ajoutAccount from "./actions/ajoutAccount.js";

export default async function menuLogin(rl = null) {

    let ownRl = false;
    if (!rl) {
        rl = readline.createInterface({ input, output, terminal: true });
        ownRl = true;
    }

    try {
        console.log("\n---------------------------------------------------\n");
        console.log("LOGIN");
        console.log("1) Se connecter");
        console.log("2) Créer un compte");
        console.log("0) Quitter");
        const choice = await rl.question("\nChoix > ");

        if (choice.toLowerCase() === '1') {
            const id = await rl.question("Identifiant : ");
            rl.pause();
            const question = [
                {
                    type: "password",
                    name: "password",
                    message: "Mot de passe : ",
                    mask: '*',
                }
            ];

            const password = await inquirer.prompt(question);
            rl.resume();
            const data = await fs.readFile(path.join(process.cwd(), "actions", "account.json"), "utf-8");
            const enseignants = JSON.parse(data);

            const user = enseignants.find(e => e.id === id && e.password === password.password);


            if (user) {
                console.log(`\nConnexion réussie ! Bienvenue ${user.prenom} ${user.nom}.`);
                return user.role;
            } else {
                console.log("\nIdentifiant ou mot de passe incorrect.");
                return menuLogin(rl);
            }
        }
        else if (choice.toLowerCase() === '2') {
            await ajoutAccount(rl);
            return menuLogin(rl);
        }
        else if (choice.toLowerCase() === '0') {
            console.log("Vous avez quitté le logiciel.");
            rl.close();
            process.exit(0);
        }
    } catch (err) {
        console.error("Erreur lors de la connexion :", err);
    } finally {
        if (ownRl && rl) {
            rl.close();
        }
    }
}