import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import fs from "node:fs/promises";
import path from "node:path";
import inquirer from "inquirer";
import ajoutAccount from "./actions/ajoutAccount.js";
import { colors } from "./utils/colors.js";

export default async function menuLogin(rl = null) {

    let ownRl = false;
    if (!rl) {
        rl = readline.createInterface({ input, output, terminal: true });
        ownRl = true;
    }

    try {
        while (true) {
            try {
                console.log("\n---------------------------------------------------\n");
                console.log("LOGIN");
                console.log("1) Se connecter");
                console.log("2) Créer un compte");
                console.log("0) Quitter");
                const choice = await rl.question("\nChoix > ");

                if (choice === '1') {
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

                    let data;
                    try {
                        data = await fs.readFile(path.join(process.cwd(), "actions", "account.json"), "utf-8");
                    } catch (readErr) {
                        if (readErr.code === 'ENOENT') {
                            console.error(`${colors.red}\nErreur : Fichier de comptes introuvable (actions/account.json).${colors.reset}`);
                            console.error("Veuillez contacter l'administrateur ou créer un nouveau compte si possible.");
                            continue;
                        } else {
                            throw readErr;
                        }
                    }

                    const enseignants = JSON.parse(data);

                    const user = enseignants.find(e => e.id === id && e.password === password.password);


                    if (user) {
                        console.log(`${colors.green}\nConnexion réussie ! Bienvenue ${user.prenom} ${user.nom}.${colors.reset}`);
                        return user;
                    } else {
                        console.log(`${colors.red}\nIdentifiant ou mot de passe incorrect.${colors.reset}`);
                        continue;
                    }
                }
                else if (choice === '2') {
                    await ajoutAccount(rl);
                    continue;
                }
                else if (choice === '0') {
                    console.log("Vous avez quitté le logiciel.");
                    rl.close();
                    process.exit(0);
                }
            } catch (err) {
                console.error("Erreur lors de la connexion :", err);
            }
        }
    } finally {
        if (ownRl && rl) {
            rl.close();
        }
    }
}
