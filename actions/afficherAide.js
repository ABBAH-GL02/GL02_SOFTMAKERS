import { colors } from '../utils/colors.js';

export default async function afficherAide() {
  console.log(`
=== MESSAGE D'AIDE ===

Si vous êtes sur l'aide, c'est que vous avez probablement tapé une commande inconnue.

Notre menu utilise principalement les numéros entre 0 et 9 (et la lettre q pour 'quitter').

Vérifiez que vous avez bien tapé un numéro et non une lettre ou un symbole.

--- Fonctionnement des couleurs ---
${colors.green}VERT${colors.reset} : Messages de succès ou de validation
${colors.red}ROUGE${colors.reset} : Messages d'erreur ou aucune réponse trouvée
${colors.blue}BLEU${colors.reset} : Aide pour taper une requête ou exemples
`);
};


