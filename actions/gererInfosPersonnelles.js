import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import path from "node:path";
import fs from "node:fs/promises";
import { colors } from '../utils/colors.js';

export default async function gererInfosPersonnelles(rl = null, userId = null) {
    console.log("\n[actions] Gestion des informations personnelles...");

    if (!userId) {
        console.log(`${colors.red}Erreur: Aucun utilisateur connecté.${colors.reset}`);
        return;
    }

    let ownRl = false;
    if (!rl) {
        rl = readline.createInterface({ input, output });
        ownRl = true;
    }

    try {
        const jsonFile = path.join(process.cwd(), "actions", "account.json");
        const data = await fs.readFile(jsonFile, "utf-8");
        let accounts = JSON.parse(data);

        const userIndex = accounts.findIndex(acc => acc.id === userId);
        if (userIndex === -1) {
            console.log(`${colors.red}Utilisateur introuvable.${colors.reset}`);
            return;
        }

        const user = accounts[userIndex];

        console.log("\n=== Vos informations personnelles ===");
        console.log(`ID: ${user.id}`);
        console.log(`Rôle: ${user.role}`);
        console.log(`Nom: ${user.nom}`);
        console.log(`Prénom: ${user.prenom}`);
        console.log(`Email: ${user.email}`);
        console.log(`Téléphone: ${user.telephone}`);
        console.log(`Adresse: ${user.adresse.rue}, ${user.adresse.ville}, ${user.adresse.region} ${user.adresse.codePostal}`);

        console.log("\n=== Options ===");
        console.log("1) Modifier mes informations");
        console.log("2) Supprimer mon compte");
        console.log("0) Retour");

        const choice = await rl.question("\nChoix > ");

        if (choice === "1") {
            // Modifier les informations
            console.log("\n--- Modification des informations ---");
            console.log("Laissez vide pour conserver la valeur actuelle");

            const newPassword = await rl.question(`Mot de passe (actuel: ****) : `);
            const newPrenom = await rl.question(`Prénom (actuel: ${user.prenom}) : `);
            const newNom = await rl.question(`Nom (actuel: ${user.nom}) : `);
            const newEmail = await rl.question(`Email (actuel: ${user.email}) : `);
            const newTelephone = await rl.question(`Téléphone (actuel: ${user.telephone}) : `);
            const newRue = await rl.question(`Rue (actuel: ${user.adresse.rue}) : `);
            const newVille = await rl.question(`Ville (actuel: ${user.adresse.ville}) : `);
            const newRegion = await rl.question(`Région (actuel: ${user.adresse.region}) : `);
            const newCodePostal = await rl.question(`Code postal (actuel: ${user.adresse.codePostal}) : `);

            const confirmation = await rl.question(`\n${colors.yellow}Confirmer la modification ? (o/n) : ${colors.reset}`);
            
            if (confirmation.toLowerCase() === 'o' || confirmation.toLowerCase() === 'oui') {
                // Mettre à jour les champs modifiés
                if (newPassword.trim()) user.password = newPassword.trim();
                if (newPrenom.trim()) user.prenom = newPrenom.trim();
                if (newNom.trim()) user.nom = newNom.trim();
                if (newEmail.trim()) user.email = newEmail.trim();
                if (newTelephone.trim()) user.telephone = newTelephone.trim();
                if (newRue.trim()) user.adresse.rue = newRue.trim();
                if (newVille.trim()) user.adresse.ville = newVille.trim();
                if (newRegion.trim()) user.adresse.region = newRegion.trim();
                if (newCodePostal.trim()) user.adresse.codePostal = newCodePostal.trim();

                accounts[userIndex] = user;
                await fs.writeFile(jsonFile, JSON.stringify(accounts, null, 2), "utf8");
                
                console.log(`${colors.green}\nVos informations ont été mises à jour avec succès.${colors.reset}`);
            } else {
                console.log(`${colors.yellow}\nModification annulée.${colors.reset}`);
            }

        } else if (choice === "2") {
            // Supprimer le compte
            console.log(`\n${colors.red}ATTENTION: Cette action est irréversible !${colors.reset}`);
            const confirmation = await rl.question(`Êtes-vous sûr de vouloir supprimer votre compte ? (o/n) : `);
            
            if (confirmation.toLowerCase() === 'o' || confirmation.toLowerCase() === 'oui') {
                const doubleConfirmation = await rl.question(`${colors.red}Dernière confirmation - Tapez votre ID "${userId}" pour confirmer : ${colors.reset}`);
                
                if (doubleConfirmation === userId) {
                    accounts.splice(userIndex, 1);
                    await fs.writeFile(jsonFile, JSON.stringify(accounts, null, 2), "utf8");
                    
                    console.log(`${colors.green}\nVotre compte a été supprimé avec succès.${colors.reset}`);
                    console.log("Vous allez être déconnecté...");
                    
                    // Retourner un signal pour déconnecter l'utilisateur
                    return "ACCOUNT_DELETED";
                } else {
                    console.log(`${colors.yellow}\nSuppression annulée - ID incorrect.${colors.reset}`);
                }
            } else {
                console.log(`${colors.yellow}\nSuppression annulée.${colors.reset}`);
            }
        }

    } catch (err) {
        console.error(`${colors.red}Erreur lors de la gestion des informations :${colors.reset}`, err);
    } finally {
        if (ownRl && rl) {
            rl.close();
        }
    }
}
