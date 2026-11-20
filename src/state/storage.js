const STORAGE_KEY = 'futbol-quiz-records-v1';

const EMPTY = {
  quick: 0,
  infinite: 0,
};

export function loadRecords() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...EMPTY };
    const parsed = JSON.parse(raw);
    return {
      quick: Number(parsed.quick) || 0,
      infinite: Number(parsed.infinite) || 0,
    };
  } catch {
    return { ...EMPTY };
  }
}

/** @returns {{ isNewRecord: boolean, previous: number, records: { quick: number, infinite: number } }} */
export function saveScore(mode, score) {
  const records = loadRecords();
  const key = mode === 'quick' ? 'quick' : 'infinite';
  const previous = records[key];
  const isNewRecord = score > previous;
  if (isNewRecord) {
    records[key] = score;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch {
      // ignore quota / private mode
    }
  }
  return { isNewRecord, previous, records };
}
