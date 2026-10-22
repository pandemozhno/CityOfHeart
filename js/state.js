// ── Состояние игры + сохранение ──

let state = {};

function initState() {
  state = {
    cycle: 1,
    maxCycles: 7,
    baraka: 3,
    straightPath: 0,
    ap: START_AP,
    hand: [],
    played: [],
    quarters: { razum: 0, gnev: 0, zhelanie: 0, voobrazhenie: 0 },
    currentTemptation: null,
    lastResult: null,
    phase: 'temptation',
    log: []
  };
  for (let i = 0; i < START_HAND; i++) drawCard(false);
  startCycle();
}

function drawCard(log = false) {
  if (state.hand.length >= HAND_LIMIT) return false;

  // Умная выдача: если какого-то цвета нет в руке — тянем именно его
  let pool = VIRTUES;
  const counts = { razum: 0, gnev: 0, zhelanie: 0, voobrazhenie: 0 };
  state.hand.forEach(c => counts[c.quarter]++);
  const missing = Object.keys(counts).filter(q => counts[q] === 0);
  if (missing.length > 0) {
    const pick = missing[Math.floor(Math.random() * missing.length)];
    pool = VIRTUES.filter(v => v.quarter === pick);
  }

  const v = pool[Math.floor(Math.random() * pool.length)];
  state.hand.push({ ...v, uid: Date.now() + Math.random() });
  if (log) addLog(`Получена добродетель: ${v.name}`, 'neutral');
  return true;
}

function addLog(text, type = 'neutral') {
  state.log.unshift({ text, type });
  if (state.log.length > 50) state.log.pop();
}

function rand(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ── Сохранение/загрузка ──
function saveGame() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({ version: SAVE_VERSION, state }));
  } catch (e) { /* private mode / quota */ }
}

function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return false;
    const data = JSON.parse(raw);
    if (!data || data.version !== SAVE_VERSION || !data.state) return false;
    state = data.state;
    return true;
  } catch (e) { return false; }
}

function hasSavedGame() {
  try { return !!localStorage.getItem(SAVE_KEY); } catch (e) { return false; }
}

function clearSave() {
  try { localStorage.removeItem(SAVE_KEY); } catch (e) {}
}