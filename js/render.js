// ── Отрисовка интерфейса ──

function renderAll() {
  renderStats();
  renderCity();
  renderTemptation();
  renderActions();
  renderHand();
  renderLog();
  saveGame();
}

function renderStats() {
  document.getElementById('cycleDisplay').textContent = `${Math.min(state.cycle, state.maxCycles)} / ${state.maxCycles}`;
  document.getElementById('barakaDisplay').textContent = state.baraka;
  document.getElementById('apDisplay').textContent = `${state.ap} / ${START_AP}`;
  const p = state.straightPath;
  const txt = p > 0 ? '+' + p : (p < 0 ? String(p) : '0');
  document.getElementById('pathDisplay').textContent = txt;
  document.getElementById('pathValue').textContent = txt;
  document.getElementById('pathValue').className = 'path-value' + (p < 0 ? ' negative' : '');
  const fill = document.getElementById('pathFill');
  fill.style.width = (Math.abs(p) / 7 * 50) + '%';
  fill.className = 'path-fill ' + (p >= 0 ? 'positive' : 'negative');
  document.getElementById('heart').className = 'heart' + (p < 0 ? ' dark' : '');
}

function renderCity() {
  document.querySelectorAll('.quarter').forEach(q => q.classList.remove('targeted'));
  if (state.currentTemptation && state.phase === 'temptation') {
    const q = document.querySelector(`.quarter[data-q="${state.currentTemptation.quarter}"]`);
    if (q) q.classList.add('targeted');
  }
  Object.keys(state.quarters).forEach(q => {
    const cont = document.querySelector(`[data-tokens="${q}"]`);
    cont.innerHTML = '';
    for (let i = 0; i < state.quarters[q]; i++) {
      const t = document.createElement('div');
      t.className = 'token';
      t.dataset.q = q;
      cont.appendChild(t);
    }
  });
}

function renderTemptation() {
  const panel = document.getElementById('temptationPanel');

  if (state.phase === 'over') { panel.innerHTML = `<div class="no-temptation">Игра завершена</div>`; return; }

  if (state.phase === 'resolved' && state.lastResult) {
    const r = state.lastResult;
    const border = r.success
      ? (r.outcome === 'exact' ? 'var(--gold-dim)' : 'var(--text-dim)')
      : 'var(--blood)';
    const text = r.outcome === 'fail'
      ? 'Искушение проникло в город...'
      : r.outcome === 'exact'
        ? 'Атака отбита. Сердце спокойно.'
        : 'Отбито с перебором — гордыня коснулась сердца.';
    const textColor = r.outcome === 'fail'
      ? 'var(--blood-bright)'
      : r.outcome === 'exact'
        ? 'var(--gold-bright)'
        : 'var(--text-dim)';
    panel.innerHTML = `
      <div class="temptation-card" style="border-color:${border}">
        <div class="arabic" style="color:${r.success ? 'var(--gold)' : 'var(--blood-bright)'}">${r.temptation.arabic}</div>
        <div class="name">${r.temptation.name}</div>
        <div class="desc">${r.defense} ✦ против ${r.temptation.power}</div>
      </div>
      <div style="text-align:center;padding:12px;color:${textColor};font-style:italic">${text}</div>
    `;
    return;
  }

  if (!state.currentTemptation) { panel.innerHTML = `<div class="no-temptation">—</div>`; return; }

  const t = state.currentTemptation;
  const color = QUARTER_COLORS[t.quarter];
  const defense = state.played.reduce((s, c) => s + effectiveLight(c, t.quarter), 0);
  const needMin = t.power;
  const needMax = t.power + 1;
  const isExact = defense >= needMin && defense <= needMax;
  const isPride = defense > needMax;

  const valueClass = isExact ? 'sufficient' : (isPride ? 'pride' : '');
  const hint = isExact
    ? '<div class="ready-msg">✦ Точно! Можно отражать ✦</div>'
    : isPride
      ? '<div class="ready-msg" style="color:var(--text-dim)">◈ Перебор — гордыня (только +1 карта)</div>'
      : `<div class="ready-msg" style="color:var(--blood-bright)">Нужно ${needMin}–${needMax} ✦</div>`;

  panel.innerHTML = `
    <div class="temptation-card">
      <div class="arabic">${t.arabic}</div>
      <div class="name">${t.name}</div>
      <div class="desc">${t.desc}</div>
      <div class="power">
        Цель: <span style="color:${color.hex}">${QUARTER_NAMES[t.quarter]}</span>
        <span class="color-swatch" style="background:${color.hex}"></span>
      </div>
      <div class="power" style="margin-top:4px">
        Точный диапазон: <strong style="color:${color.hex}">${needMin}–${needMax}</strong> ✦
      </div>
    </div>
    <div class="defense-pool">
      <div class="label">Защита (${color.name})</div>
      <div class="value ${valueClass}">${defense} ✦</div>
    </div>
    ${hint}
  `;
}

function renderActions() {
  const box = document.getElementById('actions');
  box.innerHTML = '';
  if (state.phase === 'over') return;

  if (state.phase === 'resolved') {
    const b = document.createElement('button');
    b.className = 'btn primary';
    b.innerHTML = state.cycle >= state.maxCycles ? 'Завершить игру' : 'Следующий цикл →';
    b.onclick = nextCycle;
    box.appendChild(b);
    return;
  }

  const attackBtn = document.createElement('button');
  attackBtn.className = 'btn primary';
  attackBtn.innerHTML = 'Отразить атаку ✦';
  attackBtn.onclick = resolveTemptation;
  box.appendChild(attackBtn);

  const helpBtn = document.createElement('button');
  helpBtn.className = 'btn';
  helpBtn.disabled = state.baraka < 2 || state.ap < AP_ACTION;
  helpBtn.innerHTML = `Помочь ближнему <span class="cost">2 ✧ · ${AP_ACTION} ОД</span>`;
  helpBtn.onclick = helpNeighbor;
  box.appendChild(helpBtn);

  const zikrBtn = document.createElement('button');
  zikrBtn.className = 'btn';
  zikrBtn.disabled = state.baraka < 1 || state.hand.length === 0 || state.ap < AP_ACTION;
  zikrBtn.innerHTML = `Зикр <span class="cost">1 ✧ · ${AP_ACTION} ОД + карта</span>`;
  zikrBtn.onclick = performZikr;
  box.appendChild(zikrBtn);

  const karinBtn = document.createElement('button');
  karinBtn.className = 'btn';
  karinBtn.disabled = state.baraka < 2 || state.ap < AP_ACTION;
  karinBtn.innerHTML = `Борьба с Карином <span class="cost">2 ✧ · ${AP_ACTION} ОД</span>`;
  karinBtn.onclick = fightKarin;
  box.appendChild(karinBtn);
}

function renderHand() {
  const hand = document.getElementById('hand');
  hand.innerHTML = '';

  const targetQ = state.currentTemptation && state.phase === 'temptation'
    ? state.currentTemptation.quarter : null;

  state.hand.forEach(c => {
    const el = document.createElement('div');
    el.className = 'virtue-card';
    el.dataset.q = c.quarter;

    const matches = !targetQ || c.quarter === targetQ;

    el.innerHTML = `
      <div class="v-arabic">${c.arabic}</div>
      <div class="v-name">${c.name}</div>
      <div class="v-light">${c.light}</div>
    `;

    if (targetQ && !matches) {
      el.classList.add('not-matching');
      const pen = document.createElement('div');
      pen.className = 'v-penalty';
      pen.textContent = '−1';
      el.appendChild(pen);
    }

    el.onclick = () => playCard(c.uid);
    const canPlay = state.phase === 'temptation' && state.ap >= AP_CARD;
    el.style.pointerEvents = canPlay ? 'auto' : 'none';
    el.style.opacity = canPlay ? '1' : '0.4';
    hand.appendChild(el);
  });

  state.played.forEach(c => {
    const el = document.createElement('div');
    el.className = 'virtue-card played';
    el.dataset.q = c.quarter;

    const matches = !targetQ || c.quarter === targetQ;
    const eff = effectiveLight(c, targetQ);

    let lightHtml = `${eff}`;
    if (!matches && eff !== c.light) {
      lightHtml = `${eff}<span class="v-base">${c.light}</span>`;
    }

    el.innerHTML = `
      <div class="v-arabic">${c.arabic}</div>
      <div class="v-name">${c.name}</div>
      <div class="v-light">${lightHtml}</div>
    `;

    el.onclick = () => unplayCard(c.uid);
    hand.appendChild(el);
  });

  if (state.hand.length === 0 && state.played.length === 0) {
    hand.innerHTML = '<div style="color:var(--text-dim);font-style:italic;padding:16px">— Рука пуста —</div>';
  }

  if (state.phase === 'temptation' && state.currentTemptation) {
    const colorName = QUARTER_COLORS[state.currentTemptation.quarter].name;
    document.getElementById('handLabel').textContent =
      `Добродетели (${state.hand.length}/${HAND_LIMIT}) · ОД: ${state.ap} · нужен цвет: ${colorName}`;
  } else {
    document.getElementById('handLabel').textContent =
      `Добродетели (${state.hand.length}/${HAND_LIMIT}) · ОД: ${state.ap}`;
  }
}

function renderLog() {
  const log = document.getElementById('log');
  log.innerHTML = '';
  state.log.slice(0, 20).forEach(e => {
    const div = document.createElement('div');
    div.className = 'log-entry ' + e.type;
    div.textContent = e.text;
    log.appendChild(div);
  });
}