
/**
 * Vérifie si le nom/prénom est valide.
 * Pas de caractères spéciaux : < > * ? " / \ : , ; .
 * @param {string} name 
 * @returns {boolean}
 */
export function isValidName(name) {
    if (!name || name.trim() === '') return false;
    // Regex : Ne contient aucun des caractères interdits
    // On interdit aussi \ (backslash) car problématique pour les fichiers aussi sur Windows
    const forbidden = /[<>*?"/\\:,;.]/;
    return !forbidden.test(name);
}

/**
 * Vérifie si l'email est valide (format standard).
 * @param {string} email 
 * @returns {boolean}
 */
export function isValidEmail(email) {
    // Regex simple pour email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Vérifie si le numéro de téléphone est valide.
 * Chiffres, +, -, (, ), espaces autorisés.
 * @param {string} phone 
 * @returns {boolean}
 */
export function isValidPhone(phone) {
    if (!phone || phone.trim() === '') return false;
    // Doit contenir au moins un chiffre, et seulement des caractères autorisés
    const phoneRegex = /^[0-9+\-()\s]+$/;
    return phoneRegex.test(phone) && /\d/.test(phone);
}
