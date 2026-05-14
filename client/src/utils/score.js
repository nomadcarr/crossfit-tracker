export const parseTime = (str) => {
  if (!str) return null;
  const p = str.split(':').map(Number);
  if (p.length === 2) return p[0] * 60 + p[1];
  if (p.length === 3) return p[0] * 3600 + p[1] * 60 + p[2];
  return null;
};

export const parseRoundsReps = (str) => {
  if (!str) return null;
  const m = str.match(/^(\d+)\+(\d+)$/);
  if (m) return parseInt(m[1]) * 1000 + parseInt(m[2]);
  return parseFloat(str) || null;
};

export const getScoreValue = (score, scoreType) => {
  if (!score) return null;
  switch (scoreType) {
    case 'time': return parseTime(score);
    case 'rounds_reps': return parseRoundsReps(score);
    default: return parseFloat(score) || null;
  }
};

export const formatScore = (score, scoreType) => {
  if (!score) return '—';
  if (scoreType === 'weight') return `${score} кг`;
  if (scoreType === 'reps') return `${score} реп`;
  return score;
};

export const scorePlaceholder = (scoreType) => {
  switch (scoreType) {
    case 'time': return 'мм:сс  (пр. 12:34)';
    case 'rounds_reps': return 'кръгове+реп  (пр. 5+12)';
    case 'reps': return 'репове  (пр. 87)';
    case 'weight': return 'кг  (пр. 100)';
    default: return 'резултат';
  }
};

export const scoreLabel = (scoreType) => {
  switch (scoreType) {
    case 'time': return 'Време';
    case 'rounds_reps': return 'Кръгове + Реп';
    case 'reps': return 'Репове';
    case 'weight': return 'Тегло (кг)';
    default: return 'Резултат';
  }
};
