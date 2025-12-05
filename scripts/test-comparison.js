import comparerProfils from '../actions/comparerProfils.js';
import path from 'path';

// Mock readline to simulate user input
const mockRl = {
    question: async (q) => {
        console.log(`[MockInput] Question: ${q}`);
        // Simulate selecting the first exam (index 1 -> '1')
        if (q.includes('Numéro du fichier')) return '1'; 
        return '';
    },
    close: () => console.log('[MockInput] Closed')
};

console.log('--- TEST: Lancement de comparerProfils ---');
comparerProfils(mockRl);
