import readline from "node:readline/promises";
import {stdin as input, stdout as output} from "node:process";
import path from "node:path";
import fs from "node:fs/promises";

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

    } finally {
        if (ownRl && rl) rl.close();
    }
}