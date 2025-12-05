export function calculateExamStats(questions) {
  function isLikelyInstruction(q) {
    if (!q || !q.text) return false;
    const noAnswers = Array.isArray(q.answers) && q.answers.length === 0;
    if (!noAnswers) return false;
    const txt = (q.text || '').toLowerCase();
    const title = (q.title || '').toLowerCase();
    const keywords = ['complete', 'completez', 'complète', 'consigne', 'instruction', 'instructions', 'look carefully', 'read carefully', 'fill in', 'fill the', 'choose the', 'select the', 'complete the sentences', 'complete the text'];
    const containsKeyword = keywords.some(k => txt.includes(k) || title.includes(k));
    const tooLong = txt.length > 30;
    return containsKeyword || tooLong;
  }

  const filtered = [];
  for (let i = 0; i < questions.length; i++) {
    if (isLikelyInstruction(questions[i])) continue;
    filtered.push(questions[i]);
  }

  const stats = {
    total: filtered.length,
    types: {}
  };

  filtered.forEach(q => {
    stats.types[q.type] = (stats.types[q.type] || 0) + 1;
  });

  return stats;
}

export const typeMapping = {
  'multiplechoice': 'QCM',
  'truefalse': 'V/F',
  'matching': 'Association',
  'cloze': 'Mot manquant',
  'text': 'Ouverte',
  'unknown': 'Inconnu'
};

export const colorMapping = {
  'Association': '#4c78a8',
  'Mot manquant': '#e45756',
  'Numérique': '#59a14f',
  'Ouverte': '#eeca3b',
  'QCM': '#b07aa1',
  'V/F': '#ff9da7',
  'Inconnu': '#bab0ac'
};
