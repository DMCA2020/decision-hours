(function () {
  const G = window.GROUP;
  const $ = (s) => document.querySelector(s);
  const chat = $('#chat'), feed = $('#feed'), sub = $('#groupSub');
  const input = $('#input'), sendBtn = $('#sendBtn'), downBtn = $('#downBtn'), badge = $('#downBadge');
  const params = new URLSearchParams(location.search);
  const root = document.documentElement;

  const ICON = {
    dbl: '<svg class="tick" viewBox="0 0 16 11"><path d="M11.07.65l-.53-.41a.38.38 0 0 0-.53.07L4.47 7.42a.33.33 0 0 1-.5.03L1.87 5.39a.38.38 0 0 0-.54.01l-.44.45a.38.38 0 0 0 .01.53l3.38 3.3c.15.15.37.13.5-.03L11.14 1.2a.38.38 0 0 0-.07-.55zm4.26 0l-.53-.41a.38.38 0 0 0-.53.07L8.73 7.42a.33.33 0 0 1-.5.03l-.3-.28-.97 1.24 1.35 1.32c.15.15.37.13.5-.03L15.4 1.2a.38.38 0 0 0-.07-.55z"/></svg>',
    one: '<svg class="tick" viewBox="0 0 16 11"><path d="M11.07.65l-.53-.41a.38.38 0 0 0-.53.07L4.47 7.42a.33.33 0 0 1-.5.03L1.87 5.39a.38.38 0 0 0-.54.01l-.44.45a.38.38 0 0 0 .01.53l3.38 3.3c.15.15.37.13.5-.03L11.14 1.2a.38.38 0 0 0-.07-.55z"/></svg>',
    clock: '<svg class="tick pending" viewBox="0 0 16 16"><path d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zm0 11.7A5.2 5.2 0 1 1 8 2.8a5.2 5.2 0 0 1 0 10.4zM8.6 4.5H7.4v4l3.2 1.9.6-1-2.6-1.5z"/></svg>',
    ban: '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM4 12c0-4.42 3.58-8 8-8 1.85 0 3.55.63 4.9 1.69L5.69 16.9A7.902 7.902 0 0 1 4 12zm8 8c-1.85 0-3.55-.63-4.9-1.69L18.31 7.1A7.902 7.902 0 0 1 20 12c0 4.42-3.58 8-8 8z"/></svg>',
    play: '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>',
    pause: '<svg viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>',
    mic: '<svg viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/></svg>',
    lock: '<svg viewBox="0 0 24 24"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>',
    poll: '<svg viewBox="0 0 24 24" width="14" height="14"><path d="M3 5h2v14H3zm4 6h2v8H7zm4-4h2v12h-2zm4 8h2v4h-2z"/></svg>',
    group: '<svg viewBox="0 0 24 24" width="24" height="24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>'
  };

  /* ---------- settings ---------- */
  const THEMES = ['gradient', 'classic', 'dark'];
  let theme = params.get('theme') || store('wa.theme') || 'gradient';
  let speed = parseFloat(params.get('speed')) || 1;
  let sound = store('wa.sound') === '1';
  let paused = false;
  if (params.get('frame') === '0') root.classList.add('noframe');
  applyTheme();

  function store(k, v) {
    try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; }
  }
  function applyTheme() {
    root.dataset.theme = theme;
    const meta = document.querySelector('meta[name=theme-color]');
    meta.content = theme === 'dark' ? '#1f2c34' : '#008069';
  }

  /* ---------- doodle wallpaper ---------- */
  (function doodle() {
    const s = '#000';
    const shapes = [
      `<path d="M20 30c0-8 12-8 12 0 0-8 12-8 12 0 0 8-12 14-12 14s-12-6-12-14z"/>`,
      `<circle cx="100" cy="30" r="12"/><path d="M94 28h1M105 28h1M95 35q5 4 10 0"/>`,
      `<rect x="160" y="18" width="30" height="22" rx="6"/><path d="M168 40l-4 8 10-8"/>`,
      `<path d="M230 20l5 10 11 2-8 8 2 11-10-5-10 5 2-11-8-8 11-2z"/>`,
      `<path d="M30 110h26v18H30zM36 110v-6h14v6M43 116v6"/>`,
      `<path d="M100 100q10-14 20 0t20 0"/><path d="M100 120q10-14 20 0t20 0"/>`,
      `<circle cx="190" cy="115" r="14"/><path d="M190 101v28M176 115h28"/>`,
      `<path d="M232 100h24l-4 30h-16zM236 100q8-10 16 0"/>`,
      `<path d="M20 200q15-25 30 0zM35 200v14"/>`,
      `<path d="M95 190l18 12-18 12z"/><circle cx="104" cy="202" r="18"/>`,
      `<path d="M165 215l10-28 10 28M169 205h12"/>`,
      `<path d="M228 196a14 14 0 1 0 28 0 14 14 0 1 0-28 0M242 182v-6M242 216v6"/>`
    ];
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="280" height="250" viewBox="0 0 280 250"><g fill="none" stroke="${s}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${shapes.join('')}</g></svg>`;
    root.style.setProperty('--doodle', `url("data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}")`);
  })();

  /* ---------- header ---------- */
  const PLAIN = !!G.plain;
  if (PLAIN) root.classList.add('plain');
  $('#groupName').textContent = G.name;
  document.title = G.name;
  const gav = $('#groupAvatar');
  gav.style.background = G.avatarBg || '#dfe5e7';
  gav.innerHTML = G.avatar ? `<span>${G.avatar}</span>` : ICON.group;
  const others = Object.keys(G.members).filter((k) => k !== 'me');
  const defaultSub = others.map((k) => memberLabel(k)).concat('את/ה').join(', ');
  setSub(defaultSub, false);

  function memberLabel(id) {
    const m = G.members[id];
    return m.phone ? m.phone : m.name.replace(/\s*\(.*\)/, '').replace(/, \d+$/, '');
  }
  function setSub(text, live) {
    sub.textContent = text;
    sub.classList.toggle('live', !!live);
  }

  /* ---------- clock ---------- */
  const pad = (n) => String(n).padStart(2, '0');
  const nowHM = () => { const d = new Date(); return `${pad(d.getHours())}:${pad(d.getMinutes())}`; };
  function tickClock() { $('#sbTime').textContent = nowHM(); }
  tickClock(); setInterval(tickClock, 15000);

  /* ---------- state ---------- */
  const byId = new Map();      // id -> { el, step, reacts:{emoji:Set}, votes }
  let lastFrom = null;         // sender of previous bubble (for grouping + tails)
  let lastId = null;
  let unread = 0;
  let autoId = 0;

  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  // phone numbers stay left-to-right inside Hebrew text
  // phone numbers and time ranges ("03:12 / 03:15–03:50") stay left-to-right inside Hebrew text
  const fmt = (s) => esc(s).replace(/\d{1,2}:\d{2}(?:\s*[–\/-]\s*\d{1,2}:\d{2})+|\+?\d[\d\s-]{6,}\d/g, (n) => `<bdi dir="ltr">${n}</bdi>`);
  const linkify = (s) => fmt(s).replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>');
  const isJumbo = (s) => {
    if (!s) return false;
    const t = s.replace(/\s/g, '');
    if (!/^[\p{Extended_Pictographic}‍️\u{1F3FB}-\u{1F3FF}]+$/u.test(t)) return false;
    return [...new Intl.Segmenter('he', { granularity: 'grapheme' }).segment(t)].length <= 3;
  };
  const avatarHTML = (id) => {
    const m = G.members[id];
    if (m.candle) return '🕯️';
    return m.img ? `<img src="${esc(m.img)}" alt="">` : esc(initials(id));
  };
  const initials = (id) => {
    const m = G.members[id];
    return (m.name || '?').replace(/[~()]/g, '').trim().charAt(0);
  };

  /* ---------- scrolling ---------- */
  let follow = true;            // false once the viewer scrolls up to read
  let userAt = 0;               // last time the viewer touched the scroll
  const atBottom = () => chat.scrollHeight - chat.scrollTop - chat.clientHeight < 60;
  const nearBottom = () => follow;
  function toBottom(smooth) {
    chat.scrollTo({ top: chat.scrollHeight, behavior: smooth ? 'smooth' : 'auto' });
  }
  chat.addEventListener('scroll', () => {
    if (atBottom()) follow = true;
    else if (performance.now() - userAt < 1200) follow = false;
    downBtn.hidden = follow;
    if (follow) { unread = 0; badge.textContent = ''; }
  });
  ['wheel', 'touchmove', 'pointerdown', 'keydown'].forEach((ev) =>
    chat.addEventListener(ev, () => { userAt = performance.now(); }, { passive: true }));
  downBtn.addEventListener('click', () => { follow = true; downBtn.hidden = true; unread = 0; badge.textContent = ''; toBottom(true); });

  function place(el, opts = {}) {
    const stick = opts.force || nearBottom();
    feed.appendChild(el);
    // keep the DOM light on long sessions
    while (feed.children.length > 220) feed.firstElementChild.remove();
    if (stick) requestAnimationFrame(() => toBottom(false));
    else if (!opts.noCount) { unread++; badge.textContent = unread; downBtn.hidden = false; }
  }

  /* ---------- builders ---------- */
  function chip(cls, html) {
    const d = document.createElement('div');
    d.className = 'chip ' + cls;
    d.innerHTML = html;
    lastFrom = null;
    return d;
  }

  function senderHTML(id) {
    const m = G.members[id];
    if (m.phone) return `<div class="sender" style="color:${m.color}"><span><bdi dir="ltr">${esc(m.phone)}</bdi></span><span class="ph">~ ${esc(m.name)}</span></div>`;
    return `<div class="sender" style="color:${m.color}"><bdi>${esc(m.name)}</bdi></div>`;
  }

  function quoteHTML(refId) {
    const r = byId.get(refId);
    if (!r) return '';
    const s = r.step, m = G.members[s.from];
    let t = s.text || '';
    if (s.type === 'image') t = '📷 ' + (s.text || 'תמונה');
    if (s.type === 'voice') t = '🎤 הודעה קולית (' + s.dur + ')';
    if (s.type === 'poll') t = '📊 ' + s.q;
    if (r.deleted) t = 'ההודעה נמחקה';
    const name = s.from === 'me' ? 'את/ה' : (m.phone ? m.phone : m.name);
    return `<span class="quote" data-ref="${esc(refId)}" style="--qc:${m.color}"><div class="qn">${fmt(name)}</div><div class="qt">${esc(t)}</div></span>`;
  }

  function metaHTML(time, out, edited, tag) {
    return `<span class="meta">${tag ? `<span class="ed">${esc(tag)}</span>` : ''}${edited ? '<span class="ed">נערכה</span>' : ''}<span class="t">${time}</span>${out ? `<span class="tk">${ICON.clock}</span>` : ''}</span>`;
  }

  function bubble(step, time) {
    const out = step.from === 'me';
    const first = step.from !== lastFrom || step.forceFirst;
    const m = G.members[step.from];
    const row = document.createElement('div');
    row.className = `row ${out ? 'out' : 'in'}${first ? ' first' : ''}`;
    const id = step.id || ('m' + (++autoId));
    row.dataset.id = id;

    let inner = '';
    const showSender = !out && first;
    const b = document.createElement('div');
    b.className = 'bubble';

    if (step.type === 'voice') b.classList.add('vn');
    if (step.type === 'image') {
      b.classList.add('img');
      if (!step.text) b.classList.add('nocap');
      inner = (showSender ? senderHTML(step.from) : '') +
        (step.reply ? quoteHTML(step.reply) : '') +
        `<img src="${esc(step.src)}" alt="" loading="lazy">` +
        (step.text ? `<div class="cap body">${linkify(step.text)}<span class="spacer"></span></div>` : '') +
        metaHTML(time, out);
    } else if (step.type === 'voice') {
      const bars = Array.from({ length: 34 }, (_, i) => `<b style="height:${Math.round(4 + Math.abs(Math.sin(i * 1.7 + id.length)) * 18 + Math.random() * 5)}px"></b>`).join('');
      inner = (showSender ? senderHTML(step.from) : '') +
        `<div class="voice"><span class="play">${ICON.play}</span><span class="wave">${bars}</span>` +
        `<span class="vav" style="background:${m.color}">${avatarHTML(step.from)}<i>${ICON.mic}</i></span></div>` +
        `<span class="dur">${esc(step.dur || '0:12')}</span>` +
        (step.transcript ? `<div class="vt">${step.note && !PLAIN ? `<div class="tnote">🕒 ${fmt(step.note)}</div>` : ''}<div class="vtt" dir="auto">${linkify(step.transcript)}</div>` +
          (step.sources && !PLAIN ? `<div class="srcs">${step.sources.map((s) => `<a href="${esc(s.url)}" target="_blank" rel="noopener">▶︎ ${esc(s.label)} ↗</a>`).join('')}</div>` : '') + '</div>' : '') +
        metaHTML(time, out);
      if (step.info) b.classList.add('rich');
    } else if (step.type === 'poll') {
      inner = (showSender ? senderHTML(step.from) : '') +
        `<div class="poll"><div class="q">${esc(step.q)}</div><div class="hint">${ICON.poll} בחירת אפשרות אחת</div>` +
        step.options.map((o, i) => `<div class="opt" data-i="${i}"><div class="ol"><span class="rd"></span><span class="ot">${esc(o)}</span><span class="oc"></span></div><div class="bar"><i></i></div></div>`).join('') +
        `<div class="view">הצגת הצבעות</div></div>` + metaHTML(time, out);
    } else {
      const jumbo = !step.reply && isJumbo(step.text);
      if (jumbo) b.classList.add('jumbo');
      if (PLAIN) {
        inner = (showSender ? senderHTML(step.from) : '') +
          (step.reply ? quoteHTML(step.reply) : '') +
          `<span class="body" dir="auto">${linkify(step.text || '')}</span><span class="spacer"></span>` +
          metaHTML(time, out);
        if (step.info) b.classList.add('tap');
      } else
      inner = (showSender ? senderHTML(step.from) : '') +
        (step.reply ? quoteHTML(step.reply) : '') +
        (step.memorial ? `<div class="memorial">🕯️ ${esc(step.memorial)}</div>` : '') +
        (step.note ? `<div class="tnote">🕒 ${fmt(step.note)}</div>` : '') +
        `<span class="body" dir="auto">${linkify(step.text || '')}</span>` +
        (step.decision ? `<div class="decision"><b>החלטה / הנחיה:</b> ${linkify(step.decision)}</div>` : '') +
        (step.quotes ? (step.quotesNote ? `<div class="qnote">${esc(step.quotesNote)}</div>` : '') + step.quotes.map((q) => `<blockquote class="pq"><span>${esc(q.label)}</span>״${esc(q.text)}״</blockquote>`).join('') : '') +
        (step.sources && step.sources.length ? `<div class="srcs">${step.sources.slice(0, 2).map((s) => `<a href="${esc(s.url)}" target="_blank" rel="noopener">📄 ${esc(s.label)} ↗</a>`).join('')}${step.sources.length > 2 ? `<span class="more">+${step.sources.length - 2} מקורות</span>` : ''}</div>` : '') +
        (step.info ? '' : '<span class="spacer"></span>') +
        metaHTML(time, out, false, step.tag);
      if (step.info && !PLAIN) b.classList.add('rich');
      if (step.memorial && !PLAIN) b.classList.add('real');
    }
    b.innerHTML = inner;

    if (!out) {
      const av = document.createElement('div');
      av.className = 'av';
      av.style.background = m.color;
      av.innerHTML = avatarHTML(step.from);
      row.appendChild(av);
    }
    row.appendChild(b);

    const rec = { el: row, step, reacts: new Map(), votes: new Map() };
    byId.set(id, rec);
    lastFrom = step.from;
    lastId = id;

    // interactions
    b.querySelectorAll('.quote').forEach((q) => q.addEventListener('click', () => jumpTo(q.dataset.ref)));
    const play = b.querySelector('.play');
    if (play) play.addEventListener('click', (e) => { e.stopPropagation(); playVoice(b, step.dur, step.audio); });
    if (step.audio) bindSeek(b, step.audio);
    b.querySelectorAll('.opt').forEach((o) => o.addEventListener('click', () => vote(id, 'me', +o.dataset.i)));
    b.addEventListener('dblclick', () => react(id, 'me', '❤️'));
    if (step.info) b.addEventListener('click', (e) => { if (!e.target.closest('a')) openInfo(step); });

    if (out) runTicks(row);
    return row;
  }

  function runTicks(row) {
    const tk = () => row.querySelector('.tk');
    const d = (ms) => ms / Math.max(speed, .25);
    setTimeout(() => { if (tk()) tk().innerHTML = ICON.one; }, d(700));
    setTimeout(() => { if (tk()) tk().innerHTML = ICON.dbl; }, d(1600));
    setTimeout(() => { if (tk()) { tk().innerHTML = ICON.dbl; tk().firstChild.classList.add('read'); } }, d(4200 + Math.random() * 4000));
  }
  function readTicksNow(row) {
    const tk = row.querySelector('.tk');
    if (tk) { tk.innerHTML = ICON.dbl; tk.firstChild.classList.add('read'); }
  }

  function jumpTo(id) {
    const r = byId.get(id);
    if (!r || !r.el.isConnected) return;
    r.el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    r.el.classList.remove('flash'); void r.el.offsetWidth; r.el.classList.add('flash');
  }

  function playVoice(b, dur, src) {
    if (src) return playAudio(b, src);
    if (b.dataset.playing) return;
    b.dataset.playing = '1';
    const btn = b.querySelector('.play'), bars = [...b.querySelectorAll('.wave b')];
    const [mm, ss] = (dur || '0:10').split(':').map(Number);
    const total = Math.min((mm * 60 + ss) * 1000, 12000);
    btn.innerHTML = ICON.pause;
    const t0 = performance.now();
    (function f(t) {
      const p = Math.min((t - t0) / total, 1);
      bars.forEach((x, i) => x.classList.toggle('on', i / bars.length < p));
      if (p < 1) requestAnimationFrame(f);
      else { btn.innerHTML = ICON.play; delete b.dataset.playing; bars.forEach((x) => x.classList.remove('on')); }
    })(t0);
  }

  // real audio clip: one player at a time, waveform + knob follow playback, drag/tap to seek
  let current = null;
  const fmtT = (t) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;
  function paint(b, reset) {
    const au = b._audio, bars = [...b.querySelectorAll('.wave b')], durEl = b.querySelector('.dur'), knob = b.querySelector('.knob');
    const p = au && au.duration ? au.currentTime / au.duration : 0;
    bars.forEach((x, i) => x.classList.toggle('on', i / bars.length < p));
    if (knob) knob.style.right = `calc(${(p * 100).toFixed(2)}% - 6px)`;
    if (durEl && au && au.duration) durEl.textContent = fmtT(reset ? au.duration : au.currentTime);
  }
  function ensureAudio(b, src) {
    if (b._audio) return b._audio;
    const btn = b.querySelector('.play');
    b._audio = new Audio(src);
    b._audio.preload = 'metadata';
    b._audio.addEventListener('timeupdate', () => paint(b));
    b._audio.addEventListener('ended', () => { btn.innerHTML = ICON.play; b._audio.currentTime = 0; paint(b, true); current = null; });
    b._audio.addEventListener('pause', () => { btn.innerHTML = ICON.play; });
    b._audio.addEventListener('play', () => { btn.innerHTML = ICON.pause; });
    return b._audio;
  }
  function bindSeek(b, src) {
    const wave = b.querySelector('.wave');
    if (!wave || !src) return;
    const knob = document.createElement('i');
    knob.className = 'knob';
    wave.appendChild(knob);
    const seekTo = (e) => {
      const au = ensureAudio(b, src), r = wave.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (r.right - e.clientX) / r.width)); // RTL: progress grows right to left
      const go = () => { au.currentTime = p * au.duration; paint(b); };
      au.duration ? go() : au.addEventListener('loadedmetadata', go, { once: true });
    };
    wave.addEventListener('pointerdown', (e) => {
      e.preventDefault(); e.stopPropagation();
      wave.setPointerCapture(e.pointerId); b.classList.add('seeking'); seekTo(e);
      const mv = (ev) => seekTo(ev);
      const up = () => { b.classList.remove('seeking'); wave.removeEventListener('pointermove', mv); wave.removeEventListener('pointerup', up); wave.removeEventListener('pointercancel', up); };
      wave.addEventListener('pointermove', mv); wave.addEventListener('pointerup', up); wave.addEventListener('pointercancel', up);
    });
    wave.addEventListener('click', (e) => e.stopPropagation());
  }
  function playAudio(b, src) {
    const au = ensureAudio(b, src);
    if (!au.paused) { au.pause(); return; }
    if (current && current !== au) current.pause();
    current = au;
    au.play().catch(() => {});
  }

  function react(id, from, emoji) {
    const r = byId.get(id === '__last' ? lastId : id);
    if (!r) return;
    // one reaction per member, like the real app
    for (const set of r.reacts.values()) set.delete(from);
    if (!r.reacts.has(emoji)) r.reacts.set(emoji, new Set());
    r.reacts.get(emoji).add(from);
    const b = r.el.querySelector('.bubble');
    let pill = b.querySelector('.reacts');
    if (!pill) { pill = document.createElement('div'); pill.className = 'reacts'; b.appendChild(pill); }
    const entries = [...r.reacts.entries()].filter(([, s]) => s.size).sort((a, c) => c[1].size - a[1].size);
    const count = entries.reduce((n, [, s]) => n + s.size, 0);
    pill.innerHTML = entries.slice(0, 3).map(([e]) => `<span>${e}</span>`).join('') + (count > 1 ? `<span class="rc">${count}</span>` : '');
    pill.style.animation = 'none'; void pill.offsetWidth; pill.style.animation = '';
    const stick = nearBottom();
    r.el.classList.add('has-react');
    if (stick) toBottom(false);
    if (r.step.from === 'me') readTicksNow(r.el);
  }

  function vote(pollId, from, option) {
    const r = byId.get(pollId);
    if (!r) return;
    r.votes.set(from, option);
    const counts = r.step.options.map(() => 0);
    for (const v of r.votes.values()) counts[v]++;
    const max = Math.max(1, ...counts);
    r.el.querySelectorAll('.opt').forEach((o, i) => {
      o.querySelector('.oc').textContent = counts[i] || '';
      o.querySelector('.bar i').style.width = (counts[i] / max * 100) + '%';
      o.classList.toggle('mine', r.votes.get('me') === i);
    });
  }

  function editMsg(id, text) {
    const r = byId.get(id);
    if (!r) return;
    r.step = Object.assign({}, r.step, { text });
    const body = r.el.querySelector('.body');
    if (body) body.innerHTML = linkify(text);
    const meta = r.el.querySelector('.meta');
    if (meta && !meta.querySelector('.ed')) meta.insertAdjacentHTML('afterbegin', '<span class="ed">נערכה</span>');
    r.el.classList.add('edited');
  }

  function deleteMsg(id) {
    const r = byId.get(id);
    if (!r) return;
    r.deleted = true;
    const b = r.el.querySelector('.bubble');
    const sender = b.querySelector('.sender');
    const time = b.querySelector('.meta .t').textContent;
    b.className = 'bubble';
    r.el.classList.add('deleted');
    b.innerHTML = (sender ? sender.outerHTML : '') +
      `<span class="body">${ICON.ban}${r.step.from === 'me' ? 'מחקת את ההודעה הזו' : 'ההודעה הזו נמחקה'}</span><span class="spacer"></span>` +
      `<span class="meta"><span class="t">${time}</span></span>`;
  }

  /* ---------- typing indicator ---------- */
  let typingRow = null;
  function showTyping(from, kind) {
    const m = G.members[from];
    const verb = kind === 'voice'
      ? (m.g === 'm' ? 'מקליט הודעה קולית…' : 'מקליטה הודעה קולית…')
      : (m.g === 'm' ? 'מקליד…' : 'מקלידה…');
    setSub(`${memberLabel(from)} ${verb}`, true);
    hideTyping(true);
    const first = from !== lastFrom;
    typingRow = document.createElement('div');
    typingRow.className = `row in typing${first ? ' first' : ''}`;
    typingRow.innerHTML = `<div class="av" style="background:${m.color}">${avatarHTML(from)}</div>` +
      `<div class="bubble">${first ? senderHTML(from) : ''}${kind === 'voice' ? `<div class="dots" style="color:#e53935">🎤 <i></i><i></i><i></i></div>` : '<div class="dots"><i></i><i></i><i></i></div>'}</div>`;
    const stick = nearBottom();
    feed.appendChild(typingRow);
    if (stick) toBottom(false);
  }
  function hideTyping(keepSub) {
    if (typingRow) { typingRow.remove(); typingRow = null; }
    if (!keepSub) setSub(defaultSub, false);
  }

  /* ---------- sound ---------- */
  let actx = null;
  function blip(out) {
    if (!sound) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      const o = actx.createOscillator(), g = actx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(out ? 880 : 660, actx.currentTime);
      o.frequency.exponentialRampToValueAtTime(out ? 1320 : 990, actx.currentTime + .08);
      g.gain.setValueAtTime(.0001, actx.currentTime);
      g.gain.exponentialRampToValueAtTime(.12, actx.currentTime + .01);
      g.gain.exponentialRampToValueAtTime(.0001, actx.currentTime + .18);
      o.connect(g).connect(actx.destination);
      o.start(); o.stop(actx.currentTime + .2);
    } catch (e) { /* no audio */ }
  }

  /* ---------- player ---------- */
  const sleep = (ms) => new Promise((res) => {
    const end = () => res();
    const tick = () => { if (paused) return setTimeout(tick, 250); setTimeout(end, ms / speed); };
    tick();
  });
  let runToken = 0;

  function applyStep(step, time, opts = {}) {
    switch (step.type) {
      case 'lock':
        place(chip('lock', G.lockText ? `${ICON.lock}${esc(G.lockText)}` : `${ICON.lock}ההודעות והשיחות מוצפנות מקצה לקצה. אף אחד מחוץ לצ'אט הזה, גם לא WhatsApp, לא יכול לקרוא אותן או להאזין להן.`), opts);
        return;
      case 'date': place(chip('date', esc(step.text)), opts); return;
      case 'system': place(chip('sys', fmt(step.text)), opts); return;
      case 'react': react(step.to, step.from, step.emoji); return;
      case 'vote': vote(step.to, step.from, step.option); return;
      case 'edit': editMsg(step.to, step.text); return;
      case 'delete': deleteMsg(step.to); return;
    }
    const row = bubble(step, time);
    place(row, opts);
    if (opts.history && step.from === 'me') readTicksNow(row);
    if (!opts.history) blip(step.from === 'me');
  }

  const MSG_TYPES = new Set([undefined, 'image', 'voice', 'poll']);

  async function play(token) {
    let loop = 0;
    while (token === runToken) {
      for (const scene of G.scenes) {
        for (const step of scene) {
          if (token !== runToken) return;
          // G.interval: fixed rhythm, one new message every N ms (typing included)
          const isMsg = MSG_TYPES.has(step.type) && step.from;
          const typingFor = G.interval ? Math.round(G.interval * 0.6) : null;
          const gap = G.interval
            ? (isMsg ? G.interval - (step.from !== 'me' ? typingFor : 0) : 0)
            : (step.wait != null ? step.wait : 1500 + Math.random() * 2500);
          await sleep(gap);
          if (token !== runToken) return;
          if (MSG_TYPES.has(step.type) && step.from && step.from !== 'me') {
            const kind = step.type === 'voice' ? 'voice' : 'text';
            let dur = kind === 'voice' ? 2600 : Math.min(G.typingMax || 5200, Math.max(1100, (step.text || '').length * 55));
            if (step.type === 'image') dur = 1800;
            if (G.interval) dur = typingFor;
            showTyping(step.from, kind);
            await sleep(dur);
            if (token !== runToken) return;
            hideTyping();
          }
          // ids repeat when scenes loop; keep them unique per loop
          const s = loop ? relabel(step, loop) : step;
          applyStep(s, s.time || nowHM());
        }
      }
      loop++;
      await sleep(9000);
      if (G.loop === 'restart') { if (token === runToken) start(); return; }
      if (token === runToken) applyStep({ type: 'date', text: 'היום' }, nowHM());
    }
  }
  function relabel(step, loop) {
    const s = Object.assign({}, step);
    ['id', 'reply', 'to'].forEach((k) => { if (s[k] && s[k] !== '__last') s[k] = s[k] + '#' + loop; });
    return s;
  }

  function start() {
    runToken++;
    hideTyping();
    feed.innerHTML = '';
    byId.clear(); lastFrom = null; lastId = null; unread = 0; badge.textContent = '';
    G.history.forEach((st) => applyStep(st, st.time || '', { history: true, force: true, instant: true, noCount: true }));
    requestAnimationFrame(() => toBottom(false));
    play(runToken);
  }

  /* ---------- info sheet ---------- */
  const sheet = $('#sheet'), sheetBody = $('#sheetBody');
  function openSheet(html) {
    sheetBody.innerHTML = html;
    sheet.hidden = false;
    sheetBody.scrollTop = 0;
  }
  function closeSheet() { sheet.hidden = true; }
  sheet.addEventListener('click', (e) => { if (e.target === sheet || e.target.closest('.sheet-close')) closeSheet(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeSheet(); });
  function openInfo(step) {
    const i = step.info, m = G.members[step.from];
    const row = (k, v) => v ? `<div class="kv"><dt>${k}</dt><dd>${linkify(v)}</dd></div>` : '';
    openSheet(
      `<div class="sh-head"><span class="av sh-av" style="background:${m.color}">${avatarHTML(step.from)}</span><div><b>${esc(m.name)}</b><small>${esc(step.id)} · ${esc(step.kind || '')}</small></div></div>` +
      `<dl>${row('שעה', i.time)}${row('משתתפים', i.people)}${row('מה נאמר / קרה', i.event)}${row('החלטה / הנחיה', i.decision)}${row('הערה', step.note || i.note)}${row('גורל', step.memorial || i.memorial)}${row('סוג התיעוד', i.doc)}</dl>` +
      `<h4>מקורות</h4><ul class="srclist">${(step.sources || []).map((s) => `<li><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.label)} ↗</a><small>${esc(new URL(s.url).hostname)}</small></li>`).join('')}</ul>`
    );
  }
  if (G.pinned) {
    const pin = $('#pinned');
    pin.hidden = false;
    $('#pinnedText').textContent = G.pinned;
    pin.addEventListener('click', () => G.about && openSheet(G.about));
  }
  if (G.readOnly) {
    document.querySelector('.composer').hidden = true;
    const ro = $('#readonly');
    ro.hidden = false;
    ro.textContent = G.readOnly;
    ro.addEventListener('click', () => G.about && openSheet(G.about));
  }

  /* ---------- composer ---------- */
  const composer = document.querySelector('.composer');
  input.addEventListener('input', () => {
    const has = input.value.trim().length > 0;
    sendBtn.classList.toggle('has', has);
    composer.classList.toggle('typing-on', has);
  });
  function send() {
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    input.dispatchEvent(new Event('input'));
    follow = true;
    applyStep({ from: 'me', text }, nowHM(), { force: true });
    const myId = lastId;
    // a real-feeling answer: someone reads, maybe reacts, maybe replies
    const pool = G.autoReplies || [];
    if (!pool.length) return;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    setTimeout(async () => {
      if (Math.random() < .45) { react(myId, pick.from, ['👍', '❤️', '😂', '🙏'][Math.floor(Math.random() * 4)]); return; }
      showTyping(pick.from, 'text');
      await sleep(1600);
      hideTyping();
      applyStep(Object.assign({}, pick, { reply: Math.random() < .5 ? myId : undefined }), nowHM());
    }, 1800 + Math.random() * 2500);
  }
  sendBtn.addEventListener('click', () => { input.value.trim() ? send() : input.focus(); });
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); send(); } });

  /* ---------- menu ---------- */
  const menu = $('#menu');
  $('#menuBtn').addEventListener('click', (e) => { e.stopPropagation(); menu.hidden = !menu.hidden; });
  document.addEventListener('click', () => { menu.hidden = true; });
  const SPEEDS = [1, 2, 4, .5];
  $('#speedLbl').textContent = 'x' + speed;
  $('#soundLbl').textContent = sound ? 'פעיל' : 'כבוי';
  menu.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    const act = b.dataset.act;
    if (act === 'theme') { theme = THEMES[(THEMES.indexOf(theme) + 1) % THEMES.length]; store('wa.theme', theme); applyTheme(); }
    if (act === 'speed') { speed = SPEEDS[(SPEEDS.indexOf(speed) + 1) % SPEEDS.length] || 1; $('#speedLbl').textContent = 'x' + speed; }
    if (act === 'sound') { sound = !sound; store('wa.sound', sound ? '1' : '0'); $('#soundLbl').textContent = sound ? 'פעיל' : 'כבוי'; blip(false); }
    if (act === 'pause') { paused = !paused; b.textContent = paused ? 'המשך' : 'השהיה'; }
    if (act === 'restart') { paused = false; start(); }
  });

  start();
})();
