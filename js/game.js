// ── Игровая логика ──

function startCycle() {
  state.played = [];
  state.lastResult = null;
  state.ap = START_AP;
  for (let i = 0; i < CARD_PER_CYCLE; i++) drawCard(false);
  // Страховка: рука пуста — один бесплатный добор
  if (state.hand.length === 0) {
    drawCard(false);
    addLog('Рука пуста — дарован один бесплатный добор', 'neutral');
  }
  const t = rand(TEMPTATIONS);
  state.currentTemptation = t;
  state.phase = 'temptation';
  addLog(`— Цикл ${state.cycle} —`, 'gold');
  addLog(`Искушение: ${t.name} атакует ${QUARTER_NAMES[t.quarter]} (сила ${t.power})`, 'bad');
  renderAll();
}

function resolveTemptation() {
  if (state.phase !== 'temptation') return;
  const t = state.currentTemptation;
  const defense = state.played.reduce((s, c) => s + effectiveLight(c, t.quarter), 0);
  const needMin = t.power;
  const needMax = t.power + 1;

  let outcome;
  if (defense < needMin) outcome = 'fail';
  else if (defense <= needMax) outcome = 'exact';
  else outcome = 'pride';

  if (outcome === 'fail') {
    state.straightPath -= 1;
    state.quarters[t.quarter] = Math.min(3, state.quarters[t.quarter] + 1);
    addLog(`✗ Пробито: ${t.name} (${defense} ✦ против ${needMin}–${needMax}) — −1 Прямой Путь`, 'bad');
  } else if (outcome === 'exact') {
    state.baraka += 1;
    for (let i = 0; i < CARD_ON_SUCCESS; i++) drawCard(false);
    addLog(`✓ Точно отбито: ${t.name} (${defense} ✦) — +1 Барака, +${CARD_ON_SUCCESS} карта`, 'good');
  } else {
    drawCard(false);
    addLog(`◈ Гордыня: ${t.name} отбито с перебором (${defense} ✦) — только +1 карта, без Бараки`, 'neutral');
  }

  state.lastResult = { success: outcome !== 'fail', outcome, temptation: t, defense };
  state.played = [];
  state.phase = 'resolved';

  if (checkEnd()) return;
  renderAll();
}

function nextCycle() {
  if (state.phase === 'over') return;
  state.cycle++;
  if (state.cycle > state.maxCycles) { checkEnd(); return; }
  startCycle();
}

function checkEnd() {
  if (state.straightPath <= -7) { endGame(false, 'Сердце омрачено. Прямой Путь потерян.'); return true; }
  if (state.straightPath >= 7)  { endGame(true,  'Сердце озарено. Достигнут покой души.'); return true; }
  if (state.cycle > state.maxCycles) {
    if (state.straightPath >= -3) endGame(true,  'Ты прошёл семь циклов, сохранив сердце.');
    else                          endGame(false, 'Семь циклов прошли, но сердце помрачилось.');
    return true;
  }
  return false;
}

function endGame(won, text) {
  state.phase = 'over';
  renderAll();
  const oc = document.getElementById('overlayContent');
  oc.innerHTML = `
    <div class="arabic-big">${won ? 'سلام' : 'ظلمة'}</div>
    <h2 class="${won ? '' : 'loss'}">${won ? 'Победа' : 'Поражение'}</h2>
    <p style="text-align:center">${text}</p>
    <p style="color:var(--text-dim);font-size:.9rem;text-align:center">Прямой Путь: ${state.straightPath > 0 ? '+' : ''}${state.straightPath}</p>
    <button class="btn primary" onclick="restart()">Начать заново</button>
  `;
  document.getElementById('overlay').classList.remove('hidden');
}

function restart() {
  document.getElementById('overlay').classList.add('hidden');
  clearSave();
  initState();
}

function playCard(uid) {
  if (state.phase !== 'temptation') return;
  if (state.ap < AP_CARD) return;
  const idx = state.hand.findIndex(c => c.uid === uid);
  if (idx === -1) return;
  state.ap -= AP_CARD;
  state.played.push(state.hand.splice(idx, 1)[0]);
  renderAll();
}

function unplayCard(uid) {
  if (state.phase !== 'temptation') return;
  const idx = state.played.findIndex(c => c.uid === uid);
  if (idx === -1) return;
  if (state.hand.length >= HAND_LIMIT) return;
  state.ap += AP_CARD;
  state.hand.push(state.played.splice(idx, 1)[0]);
  renderAll();
}

function helpNeighbor() {
  if (state.phase !== 'temptation' || state.baraka < 2 || state.ap < AP_ACTION) return;
  state.ap -= AP_ACTION;
  state.baraka -= 2;
  state.straightPath += 1;
  drawCard(false);
  addLog('Помощь ближнему: +1 Прямой Путь, +1 карта', 'good');
  if (checkEnd()) return;
  renderAll();
}

function performZikr() {
  if (state.phase !== 'temptation' || state.baraka < 1 || state.hand.length === 0 || state.ap < AP_ACTION) return;
  state.ap -= AP_ACTION;
  state.baraka -= 1;
  const idx = Math.floor(Math.random() * state.hand.length);
  const lost = state.hand.splice(idx, 1)[0];
  const withTokens = Object.keys(state.quarters).filter(q => state.quarters[q] > 0);
  if (withTokens.length > 0) {
    const q = rand(withTokens);
    state.quarters[q]--;
    addLog(`Зикр: тень убрана из «${QUARTER_NAMES[q]}» (сброшена «${lost.name}»)`, 'good');
  } else {
    state.straightPath += 1;
    addLog(`Зикр: сердце просветлело (+1)`, 'good');
  }
  if (checkEnd()) return;
  renderAll();
}

function fightKarin() {
  if (state.phase !== 'temptation' || state.baraka < 2 || state.ap < AP_ACTION) return;
  state.ap -= AP_ACTION;
  state.baraka -= 2;
  const roll = Math.floor(Math.random() * 6) + 1;
  if (roll >= 4) {
    state.straightPath += 1;
    addLog(`Борьба с Карином: выпало ${roll} — победа! +1 Прямой Путь`, 'good');
  } else {
    addLog(`Борьба с Карином: выпало ${roll} — Карин ранил душу`, 'bad');
  }
  if (checkEnd()) return;
  renderAll();
}

function showHelp() {
  const oc = document.getElementById('overlayContent');
  oc.innerHTML = `
    <h2>Как играть</h2>
    <ul>
      <li><b>1.</b> Сверху появилось <b>искушение</b> — у него есть <b>точный диапазон</b> силы и цвет врат.</li>
      <li><b>2.</b> Цвет важен: карта того же цвета даёт <b>полную силу</b>, другого — <b>−1</b>.</li>
      <li><b>3.</b> <b>ОД (очки действия):</b> ${START_AP} за цикл. Карта = ${AP_CARD} ОД, полезные действия = ${AP_ACTION} ОД.</li>
      <li><b>4.</b> <b>Точность:</b> недобор — провал. Попадание в диапазон (Сила или Сила+1) — полная награда (+1 Барака, +${CARD_ON_SUCCESS} карта). Перебор на 2+ — <b>гордыня</b>: только +1 карта, без Бараки.</li>
      <li><b>5.</b> Всего <b>7 циклов</b>. Победа — Прямой Путь не ниже −3. Досрочно: +7 (озарение) или −7 (поражение).</li>
    </ul>
    <button class="btn primary" onclick="document.getElementById('overlay').classList.add('hidden')">Понятно</button>
  `;
  document.getElementById('overlay').classList.remove('hidden');
}