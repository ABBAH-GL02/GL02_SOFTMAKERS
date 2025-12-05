/**
 * Fichier centralisé pour la gestion des couleurs d'affichage dans le terminal
 * Utilise les codes ANSI pour colorer les sorties console
 */

// Codes de couleur ANSI
const colors = {
  // Réinitialisation
  reset: '\x1b[0m',
  
  // Couleurs de base
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  
  // Couleurs brillantes
  brightBlack: '\x1b[90m',
  brightRed: '\x1b[91m',
  brightGreen: '\x1b[92m',
  brightYellow: '\x1b[93m',
  brightBlue: '\x1b[94m',
  brightMagenta: '\x1b[95m',
  brightCyan: '\x1b[96m',
  brightWhite: '\x1b[97m',
  
  // Styles de texte
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  italic: '\x1b[3m',
  underscore: '\x1b[4m',
  blink: '\x1b[5m',
  reverse: '\x1b[7m',
  hidden: '\x1b[8m'
};

/**
 * Fonction utilitaire pour colorer un texte
 * @param {string} text - Le texte à colorer
 * @param {string} color - La couleur à appliquer (clé de l'objet colors)
 * @returns {string} - Le texte coloré avec reset automatique
 */
function colorize(text, color) {
  if (!colors[color]) {
    console.warn(`Couleur "${color}" non reconnue. Texte non coloré.`);
    return text;
  }
  return `${colors[color]}${text}${colors.reset}`;
}

/**
 * Fonctions de commodité pour les couleurs les plus utilisées
 */
const utils = {
  error: (text) => colorize(text, 'red'),
  success: (text) => colorize(text, 'green'),
  warning: (text) => colorize(text, 'yellow'),
  info: (text) => colorize(text, 'blue'),
  hint: (text) => colorize(text, 'cyan'),
  
  // Alias pour compatibilité
  red: (text) => colorize(text, 'red'),
  green: (text) => colorize(text, 'green'),
  yellow: (text) => colorize(text, 'yellow'),
  blue: (text) => colorize(text, 'blue'),
  cyan: (text) => colorize(text, 'cyan'),
  magenta: (text) => colorize(text, 'magenta')
};

// Export des couleurs brutes et des utilitaires
export { colors, colorize, utils };
export default colors;
