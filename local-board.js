(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const KEY = 'danaiwa.tier10.scores.v1';
  const NAME = 'danaiwa.tier10.name.v1';
  const clean = value => String(value || '').replace(/[\x00-\x1f\x7f]/g, '').trim().slice(0, 12);
  const name = () => clean(localStorage.getItem(NAME)) || '默认用户';
  function scores() {
    try { const rows = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(rows) ? rows : []; }
    catch { return []; }
  }
  function paintName() {
    $('nickInput').value = clean(localStorage.getItem(NAME));
    $('myNameLabel').textContent = name();
  }
  function refresh() {
    const rows = scores().sort((a, b) => b.s - a.s || b.t - a.t);
    const list = $('boardList');
    list.replaceChildren();
    rows.forEach((row, i) => {
      const line = document.createElement('div');
      line.className = 'board-row';
      const rank = document.createElement('span'); rank.className = 'board-rank'; rank.textContent = i + 1;
      const player = document.createElement('span'); player.className = 'board-name'; player.textContent = row.n;
      const score = document.createElement('span'); score.className = 'board-score'; score.textContent = row.s;
      line.append(rank, player, score); list.append(line);
    });
    if (!rows.length) list.textContent = '还没有成绩，先玩一局吧';
    return Promise.resolve(rows);
  }
  function open() {
    paintName(); refresh(); $('boardModal').classList.add('show'); $('boardModal').setAttribute('aria-hidden', 'false');
  }
  function close() { $('boardModal').classList.remove('show'); $('boardModal').setAttribute('aria-hidden', 'true'); }
  function setName(value) { localStorage.setItem(NAME, clean(value)); paintName(); }
  function onGameOver(value) {
    const score = Number(value);
    paintName(); $('submitBtn').hidden = true;
    $('submitBox').style.display = score > 0 ? '' : 'none';
    if (!(score > 0) || !Number.isFinite(score)) return;
    const rows = scores(); rows.push({ n: name(), s: score, t: Date.now() });
    localStorage.setItem(KEY, JSON.stringify(rows.slice(-20)));
    $('submitMsg').textContent = '成绩已保存在此设备 ✓'; refresh();
  }
  $('boardBtn').addEventListener('click', open);
  $('boardBtn2').addEventListener('click', open);
  $('editNameBtn').addEventListener('click', () => { open(); $('nickInput').focus(); });
  $('boardClose').addEventListener('click', close);
  $('boardRefresh').addEventListener('click', refresh);
  $('nickInput').addEventListener('change', event => setName(event.target.value));
  $('nickInput').addEventListener('keydown', event => { if (event.key === 'Enter') { setName(event.target.value); event.target.blur(); } });
  $('boardModal').addEventListener('click', event => { if (event.target === $('boardModal')) close(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') close(); });
  window.DanaiwaBoard = { onGameOver, open, close, refresh, setName, hasName: () => !!clean(localStorage.getItem(NAME)) };
})();
