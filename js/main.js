// ── Точка входа ──
(function () {
  if (hasSavedGame() && loadGame()) {
    const oc = document.getElementById('overlayContent');
    oc.innerHTML = `
      <h2>Продолжить игру?</h2>
      <p style="text-align:center">Найдено сохранение: цикл ${state.cycle} / ${state.maxCycles}</p>
      <div style="display:flex;gap:8px;justify-content:center;margin-top:12px;flex-wrap:wrap">
        <button class="btn primary" id="btn-continue">Продолжить</button>
        <button class="btn" id="btn-new">Новая игра</button>
      </div>
    `;
    document.getElementById('overlay').classList.remove('hidden');

    document.getElementById('btn-continue').onclick = () => {
      document.getElementById('overlay').classList.add('hidden');
      renderAll();
    };
    document.getElementById('btn-new').onclick = () => {
      document.getElementById('overlay').classList.add('hidden');
      clearSave();
      initState();
    };
  } else {
    initState();
  }
})();