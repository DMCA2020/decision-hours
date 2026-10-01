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
  let sound = store('wa.sound') !== '0';  // on by default
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
  const defaultSub = G.subtitle || others.map((k) => memberLabel(k)).concat('את/ה').join(', ');
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
  downBtn.addEventListener('click', () => {
    if (typeof lazy !== 'undefined' && lazy.on) { toBottom(true); return; }
    follow = true; downBtn.hidden = true; unread = 0; badge.textContent = ''; toBottom(true);
  });

  function place(el, opts = {}) {
    if (opts.k != null) el.dataset.k = opts.k;
    if (opts.quiet) { feed.appendChild(el); return; }
    const stick = opts.force || nearBottom();
    feed.appendChild(el);
    // keep the DOM light on long sessions (not when the whole chat is shown)
    if (!G.revealAfter) while (feed.children.length > 220) feed.firstElementChild.remove();
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
    if (step.from) row.dataset.from = step.from;

    let inner = '';
    const showSender = !out && first && !privateChat;
    const b = document.createElement('div');
    b.className = 'bubble';

    if (step.type === 'video') {
      // WhatsApp-style video message: poster frame, play button, duration; plays inline
      b.classList.add('img', 'vid');
      if (!step.text || PLAIN) b.classList.add('nocap');
      inner = (showSender ? senderHTML(step.from) : '') +
        (step.reply ? quoteHTML(step.reply) : '') +
        `<div class="vbox"><video preload="none" playsinline ${step.poster ? `poster="${esc(step.poster)}"` : ''} src="${esc(step.src)}"></video>` +
        `<span class="vplay">${ICON.play}</span><span class="vdur">${ICON.cam || ''}${esc(step.dur || '')}</span></div>` +
        (step.text && !PLAIN ? `<div class="cap body">${linkify(step.text)}<span class="spacer"></span></div>` : '') +
        metaHTML(time, out);
    } else if (step.type === 'voice') b.classList.add('vn');
    if (step.type === 'video') { /* built above */ } else if (step.type === 'image') {
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
    const vbox = b.querySelector('.vbox');
    if (vbox) vbox.addEventListener('click', (e) => {
      e.stopPropagation();
      const v = vbox.querySelector('video');
      if (v.paused) { if (current) current.pause(); document.querySelectorAll('.vbox video').forEach((o) => o !== v && o.pause()); v.controls = true; v.play().catch(() => {}); vbox.classList.add('on'); }
      else v.pause();
    });
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
  let typingRow = null, typingAlso = [];
  function showTyping(from, kind) {
    const m = G.members[from];
    const verb = kind === 'voice'
      ? (m.g === 'm' ? 'מקליט הודעה קולית…' : 'מקליטה הודעה קולית…')
      : (m.g === 'm' ? 'מקליד…' : 'מקלידה…');
    if (typingAlso.length) {
      const names = [from, ...typingAlso].map(memberLabel);
      setSub(`${names.slice(0, -1).join(', ')} ו${names[names.length - 1]} מקלידים…`, true);
    } else setSub(`${memberLabel(from)} ${verb}`, true);
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

  /* ---------- sound: WhatsApp-like message sounds, synthesized (no original sound files) ---------- */
  let actx = null;
  function ctx() {
    if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)();
    if (actx.state === 'suspended') actx.resume();
    return actx;
  }
  // message sound: recorded file chosen by the user (sfx/msg.mp3), decoded once for instant playback
  let sfxBuf = null;
  async function loadSfx() {
    try {
      const r = await fetch(G.sfx || 'sfx/msg.mp3');
      sfxBuf = await ctx().decodeAudioData(await r.arrayBuffer());
    } catch (e) { /* no audio */ }
  }
  function blip() {
    if (!sound || !unlocked || !sfxBuf) return;
    // stay quiet while a voice message or video is playing
    if (current && !current.paused) return;
    if ([...document.querySelectorAll('.vbox video')].some((v) => !v.paused)) return;
    try {
      const c = ctx(), src = c.createBufferSource(), g = c.createGain();
      src.buffer = sfxBuf; g.gain.value = .7;
      src.connect(g).connect(c.destination);
      src.start();
    } catch (e) { /* no audio */ }
  }
  // browsers allow sound only after the first user gesture
  let unlocked = false;
  const hint = document.createElement('button');
  hint.className = 'sndhint'; hint.textContent = '🔊 הקישו להפעלת צלילים';
  function unlock() {
    if (unlocked) return;
    unlocked = true;
    try { ctx(); loadSfx(); } catch (e) { /* no audio */ }
    hint.remove();
    removeEventListener('pointerdown', unlock, true); removeEventListener('keydown', unlock, true);
  }
  addEventListener('pointerdown', unlock, true); addEventListener('keydown', unlock, true);
  if (sound) document.querySelector('.screen').appendChild(hint);

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
      case 'skip': place(chip('skip', '⏱ ' + esc(step.text)), opts); return;
      case 'system': place(chip('sys', fmt(step.text)), opts); return;
      case 'react': react(step.to, step.from, step.emoji); return;
      case 'vote': vote(step.to, step.from, step.option); return;
      case 'edit': editMsg(step.to, step.text); return;
      case 'delete': deleteMsg(step.to); return;
    }
    const prevFrom = lastFrom;  // sound only on the first of several messages in a row from the same sender
    const row = bubble(step, time);
    place(row, opts);
    if (opts.history && step.from === 'me') readTicksNow(row);
    if (!opts.history && step.from !== prevFrom) blip(step.from === 'me' ? 'out' : (step.type === 'voice' || step.type === 'video' || step.type === 'image') ? 'media' : 'in');
  }

  const MSG_TYPES = new Set([undefined, 'image', 'voice', 'poll', 'video']);

  async function play(token, from = 0) {
    let loop = 0;
    while (token === runToken) {
      let lastMin = null, day = 0, shown = 0;
      for (const scene of G.scenes) {
        for (let si = from; si < scene.length; si++) {
          const step = scene[si];
          if (token !== runToken) return;
          const isMsg = MSG_TYPES.has(step.type) && step.from;
          // G.interval: fixed rhythm, one new message every N ms (typing included)
          let total = G.interval;
          if (G.pacing === 'drama') {
            // drama: fixed rhythm (G.interval), plus time-jump chips after long silences
            if (step.type === 'date') { day = /6 ב/.test(step.text) ? 0 : 1; lastMin = null; }
            const mm = /^(\d\d):(\d\d)$/.exec(step.time || '');
            if (isMsg && mm) {
              const now = day * 1440 + (+mm[1]) * 60 + (+mm[2]);
              const d = lastMin == null ? 5 : Math.max(0, now - lastMin);
              if (lastMin != null && d >= 45) {
                applyStep({ type: 'skip', text: step.time }, step.time);
              }
              lastMin = now;
            }
          }
          const typingFor = total ? Math.round(total * 0.6) : null;
          const gap = total
            ? (isMsg ? total - (step.from !== 'me' ? typingFor : 0) : 0)
            : (step.wait != null ? step.wait : 1500 + Math.random() * 2500);
          await sleep(gap);
          if (token !== runToken) return;
          if (MSG_TYPES.has(step.type) && step.from && step.from !== 'me') {
            // several people writing at the same minute: show them typing together
            const also = [];
            if (G.pacing === 'drama') {
              for (let j = si + 1; j < scene.length && also.length < 2; j++) {
                const n = scene[j];
                if (!(MSG_TYPES.has(n.type) && n.from) || n.time !== step.time) break;
                if (n.from !== step.from && n.from !== 'me' && !also.includes(n.from)) also.push(n.from);
              }
            }
            typingAlso = also;
            const kind = step.type === 'voice' ? 'voice' : 'text';
            let dur = kind === 'voice' ? 2600 : Math.min(G.typingMax || 5200, Math.max(1100, (step.text || '').length * 55));
            if (step.type === 'image') dur = 1800;
            if (total) dur = typingFor;
            showTyping(step.from, kind);
            await sleep(dur);
            if (token !== runToken) return;
            hideTyping();
          }
          // ids repeat when scenes loop; keep them unique per loop
          const s = loop ? relabel(step, loop) : step;
          applyStep(s, s.time || nowHM(), { k: si });
          if (G.revealAfter && isMsg && ++shown >= G.revealAfter) { revealRest(token, scene, si + 1, lastMin, day); return; }
        }
      }
      loop++;
      from = 0;
      await sleep(9000);
      if (G.loop === 'restart') { if (token === runToken) start(); return; }
      if (token === runToken) applyStep({ type: 'date', text: 'היום' }, nowHM());
    }
  }
  // after the live start: WhatsApp-style "unread messages" bar, then infinite scroll down (~30 at a time)
  const lazy = { on: false };
  const sentinel = document.createElement('div');
  sentinel.className = 'sentinel';
  // as the reader nears the end, messages drip in one after another (each with its pop-in), not in a batch
  let near = false, dripT = null;
  function drip() {
    dripT = null;
    if (!near || !lazy.on || paused) return;
    loadMore(1);
    dripT = setTimeout(drip, 140);
  }
  const io = 'IntersectionObserver' in window ? new IntersectionObserver((en) => {
    near = en.some((x) => x.isIntersecting);
    if (near && !dripT) drip();
  }, { root: chat, rootMargin: '0px 0px 250px 0px' }) : null;
  function remainingMsgs() {
    let n = 0;
    for (let j = lazy.i; j < lazy.scene.length; j++) if (MSG_TYPES.has(lazy.scene[j].type) && lazy.scene[j].from) n++;
    return n;
  }
  function revealRest(token, scene, from, lastMin, day) {
    Object.assign(lazy, { on: true, token, scene, i: from, lastMin, day });
    hideTyping(); setSub(defaultSub, false);
    const left = remainingMsgs();
    if (left) place(chip('unread', `${left.toLocaleString('he-IL')} הודעות שלא נקראו`), { quiet: true });
    feed.appendChild(sentinel);
    if (io) io.observe(sentinel); else loadMore(60);
  }
  function loadMore(n) {
    if (!lazy.on || lazy.token !== runToken) return;
    const { scene } = lazy;
    let added = 0;
    while (lazy.i < scene.length && added < n) {
      const st = scene[lazy.i];
      if (G.pacing === 'drama') {
        if (st.type === 'date') { lazy.day = /6 ב/.test(st.text) ? 0 : 1; lazy.lastMin = null; }
        const mm = /^(\d\d):(\d\d)$/.exec(st.time || '');
        if (mm && MSG_TYPES.has(st.type) && st.from) {
          const now = lazy.day * 1440 + (+mm[1]) * 60 + (+mm[2]);
          if (lazy.lastMin != null && now - lazy.lastMin >= 45) applyStep({ type: 'skip', text: st.time }, st.time, { quiet: true, history: true });
          lazy.lastMin = now;
        }
      }
      applyStep(st, st.time || '', { quiet: true, history: true, k: lazy.i });
      if (MSG_TYPES.has(st.type) && st.from) added++;
      lazy.i++;
    }
    feed.appendChild(sentinel);  // keep the trigger at the end
    const left = remainingMsgs();
    badge.textContent = left ? (left > 999 ? '999+' : left) : '';
    if (lazy.i >= scene.length) { lazy.on = false; if (io) io.unobserve(sentinel); sentinel.remove(); }
  }
  // load until message k exists (for jump-to-hour), a chunk per frame so it never freezes
  function loadUntil(k, done) {
    (function step() {
      if (!lazy.on || feed.querySelector(`[data-k="${k}"]`)) return done();
      loadMore(60);
      setTimeout(step, 0);
    })();
  }

  function relabel(step, loop) {
    const s = Object.assign({}, step);
    ['id', 'reply', 'to'].forEach((k) => { if (s[k] && s[k] !== '__last') s[k] = s[k] + '#' + loop; });
    return s;
  }

  // jump to an hour: show the hours that have messages; picking one replays the chat from there
  function openJump() {
    // hours per day, in order; each button jumps to the first message of that hour on that day
    const steps = G.scenes[0] || [];
    const marks = [];
    const hd = [...G.history].reverse().find((s) => s.type === 'date');
    let day = hd ? hd.text.split(',')[0] : '', seen = new Set();
    steps.forEach((st, k) => {
      if (st.type === 'date') { day = st.text.split(',')[0]; return; }
      const h = (/^(\d\d):/.exec(st.time || '') || [])[1];
      if (h && !seen.has(day + h)) { seen.add(day + h); marks.push({ day, h, k }); }
    });
    const days = [...new Set(marks.map((m) => m.day))];
    openSheet('<h3>קפיצה לשעה</h3>' + days.map((d) => `<h4>${esc(d)}</h4><div class="hours">` +
      marks.filter((m) => m.day === d).map((m) => `<button data-k="${m.k}">${m.h}:00</button>`).join('') + '</div>').join(''));
    sheetBody.querySelectorAll('.hours button').forEach((b) => b.addEventListener('click', () => {
      closeSheet();
      const k = +b.dataset.k;
      const go = () => { const el = feed.querySelector(`[data-k="${k}"]`); if (el) el.scrollIntoView({ block: 'start', behavior: 'smooth' }); };
      if (feed.querySelector(`[data-k="${k}"]`)) return go();
      if (lazy.on && k >= lazy.i) return loadUntil(k, go);   // further down: load up to it, then scroll
      startAt = k; paused = false; start();
    }));
  }
  let startAt = 0;

  /* ---------- chats list, contact cards, private chats (like WhatsApp) ---------- */
  let privateChat = false, inMain = true, savedMain = null;
  const ALL = () => G.history.concat(G.scenes[0] || []);
  const isVictim = (id) => /^(nova_|res_)/.test(id || '');
  const isMsg = (st) => MSG_TYPES.has(st.type) && st.from;
  const roleOf = (id) => (G.roles || {})[id] || (isVictim(id) ? '' : '');
  function filtered(pred, chips) {
    // keep date chips only when a matching message follows before the next date
    const out = []; let pendingDate = null;
    for (const st of ALL()) {
      if (st.type === 'date') { pendingDate = st; continue; }
      if (isMsg(st) ? pred(st) : (chips && chips(st))) {
        if (pendingDate) { out.push(pendingDate); pendingDate = null; }
        out.push(st);
      }
    }
    return out;
  }
  const CHATS = {
    sec: { name: 'הדרג הביטחוני', avatar: '🛡️', bg: '#37474f', list: () => filtered((st) => !isVictim(st.from)) },
    vic: { name: 'קורבנות 7 באוקטובר', avatar: '🕯️', bg: '#263238', list: () => filtered((st) => isVictim(st.from), (st) => /^S0[123]$/.test(st.id || '')) },
  };
  function setHeader(name, avatarHtml, bg, sub) {
    $('#groupName').textContent = name;
    gav.style.background = bg || '#dfe5e7';
    gav.innerHTML = avatarHtml;
    setSub(sub, false);
  }
  function saveMain() {
    if (!inMain) return;
    const frag = document.createDocumentFragment();
    while (feed.firstChild) frag.appendChild(feed.firstChild);
    savedMain = { frag, lazy: { ...lazy }, top: chat.scrollTop };
    inMain = false;
  }
  function openList(title, avatarHtml, bg, sub, list, opts = {}) {
    saveMain();
    runToken++; hideTyping(true);
    if (io) io.unobserve(sentinel);
    feed.innerHTML = ''; lastFrom = null; unread = 0; badge.textContent = '';
    privateChat = !!opts.private;
    root.classList.toggle('private', privateChat);
    setHeader(title, avatarHtml, bg, sub);
    Object.assign(lazy, { on: true, token: runToken, scene: list, i: 0, lastMin: null, day: 0 });
    feed.appendChild(sentinel);
    loadMore(25);
    if (io) io.observe(sentinel);
    chat.scrollTop = 0;
  }
  function openChat(key) {
    const c = CHATS[key]; const list = c.list();
    const people = new Set(list.filter(isMsg).map((s) => s.from));
    openList(c.name, `<span>${c.avatar}</span>`, c.bg, `${people.size} משתתפים`, list);
  }
  function openPrivate(id) {
    if (isVictim(id)) return openChat('vic');
    const m = G.members[id];
    const list = filtered((st) => st.from === id);
    openList(m.name, avatarHTML(id), m.color, roleOf(id) || 'לחצו כאן לפרטי איש הקשר', list, { private: true });
    privateId = id;
  }
  let privateId = null;
  function backToMain() {
    if (inMain) return;
    runToken++;
    if (io) io.unobserve(sentinel);
    privateChat = false; root.classList.remove('private'); privateId = null;
    feed.innerHTML = '';
    inMain = true;
    $('#groupName').textContent = G.name;
    gav.style.background = G.avatarBg || '#dfe5e7';
    gav.innerHTML = G.avatar ? `<span>${G.avatar}</span>` : ICON.group;
    setSub(defaultSub, false);
    if (savedMain && savedMain.lazy.on) {
      feed.appendChild(savedMain.frag);
      Object.assign(lazy, savedMain.lazy, { token: runToken });
      feed.appendChild(sentinel);
      if (io) io.observe(sentinel);
      chat.scrollTop = savedMain.top;
    } else start();
  }
  // contact card
  function openContact(id) {
    const m = G.members[id]; if (!m) return;
    const n = ALL().filter((st) => st.from === id && isMsg(st)).length;
    const vic = isVictim(id);
    openSheet(`<div class="contact"><div class="cav" style="background:${m.color}">${avatarHTML(id)}</div>
      <h3>${esc(m.name)}</h3><p class="crole">${esc(roleOf(id) || (vic ? 'קורבנות 7 באוקטובר' : 'הדרג הביטחוני'))}</p>
      <p class="ccount">${n.toLocaleString('he-IL')} הודעות</p>
      <button class="cmsg" data-id="${esc(id)}">💬 ${vic ? 'לצ׳אט קורבנות 7 באוקטובר' : 'הודעה'}</button></div>`);
    sheetBody.querySelector('.cmsg').addEventListener('click', () => { closeSheet(); openPrivate(id); });
  }
  feed.addEventListener('click', (e) => {
    const hit = e.target.closest('.av, .sender');
    if (!hit) return;
    const row = hit.closest('.row');
    if (!row || !row.dataset.from || row.classList.contains('typing')) return;
    e.stopPropagation();
    openContact(row.dataset.from);
  }, true);
  // chats list (back arrow)
  const chats = document.createElement('div');
  chats.className = 'chats'; chats.hidden = true;
  document.querySelector('.screen').appendChild(chats);
  function lastOf(list) { const m = [...list].reverse().find(isMsg); return m ? (m.text || m.transcript || (m.type === 'video' ? '🎥 סרטון' : m.type === 'image' ? '📷 תמונה' : m.type === 'voice' ? '🎤 הודעה קולית' : '')).slice(0, 60) : ''; }
  function openChats() {
    const sec = [...new Set(ALL().filter((s) => isMsg(s) && !isVictim(s.from)).map((s) => s.from))]
      .map((id) => ({ id, n: ALL().filter((s) => s.from === id).length })).sort((a, b) => b.n - a.n);
    const row = (key, name, av, bg, sub, extra = '') => `<button class="chatrow" data-key="${esc(key)}"><span class="cav" style="background:${bg}">${av}</span><span class="cbody"><b>${esc(name)}</b><small>${esc(sub)}</small></span>${extra}</button>`;
    chats.innerHTML = `<div class="chats-head"><button class="icon chats-back" aria-label="סגירה"><svg viewBox="0 0 24 24"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg></button><b>צ׳אטים</b></div><div class="chats-list">` +
      row('main', G.name, `<span>${G.avatar || ''}</span>`, G.avatarBg, 'הקבוצה המלאה') +
      row('sec', CHATS.sec.name, '<span>🛡️</span>', CHATS.sec.bg, lastOf(CHATS.sec.list())) +
      row('vic', CHATS.vic.name, '<span>🕯️</span>', CHATS.vic.bg, lastOf(CHATS.vic.list())) +
      '<div class="chats-sec">אנשי קשר</div>' +
      sec.map(({ id, n }) => row('m:' + id, G.members[id].name, avatarHTML(id), G.members[id].color, roleOf(id) || `${n} הודעות`)).join('') + '</div>';
    chats.hidden = false;
    chats.querySelector('.chats-back').addEventListener('click', () => { chats.hidden = true; });
    chats.querySelectorAll('.chatrow').forEach((b) => b.addEventListener('click', () => {
      chats.hidden = true;
      const k = b.dataset.key;
      if (k === 'main') backToMain(); else if (k.startsWith('m:')) openPrivate(k.slice(2)); else openChat(k);
    }));
  }
  document.querySelector('.topbar .back').addEventListener('click', (e) => { e.stopPropagation(); openChats(); });
  // header tap in a private chat opens that contact
  document.querySelector('.gtitle').addEventListener('click', (e) => {
    if (privateId) { e.stopImmediatePropagation(); openContact(privateId); }
  }, true);


  function start() {
    runToken++;
    hideTyping();
    feed.innerHTML = '';
    byId.clear(); lastFrom = null; lastId = null; unread = 0; badge.textContent = '';
    lazy.on = false; if (io) io.unobserve(sentinel);
    const ctxSteps = (G.scenes[0] || []).slice(0, startAt);
    if (startAt > 0) {
      // jumped to an hour: show the date and the last messages before it, then play on
      const lastDate = [...ctxSteps].reverse().find((s) => s.type === 'date');
      G.history.filter((s) => s.type === 'lock').forEach((st) => applyStep(st, '', { history: true, force: true, instant: true, noCount: true }));
      if (lastDate) applyStep(lastDate, '', { history: true, force: true, instant: true, noCount: true });
      ctxSteps.slice(-25).filter((s) => s.type !== 'date').forEach((st) => applyStep(st, st.time || '', { history: true, force: true, instant: true, noCount: true }));
    } else {
      G.history.forEach((st) => applyStep(st, st.time || '', { history: true, force: true, instant: true, noCount: true }));
    }
    requestAnimationFrame(() => toBottom(false));
    play(runToken, startAt);
    startAt = 0;
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

  // header tap opens the group details, like WhatsApp's group info
  document.querySelector('.gtitle').addEventListener('click', () => G.about && openSheet(G.about));

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
    if (act === 'sound') { sound = !sound; store('wa.sound', sound ? '1' : '0'); $('#soundLbl').textContent = sound ? 'פעיל' : 'כבוי'; if (!sound) hint.remove(); blip('in'); }
    if (act === 'pause') { paused = !paused; b.textContent = paused ? 'המשך' : 'השהיה'; }
    if (act === 'restart') { paused = false; start(); }
    if (act === 'jump') openJump();
  });

  start();
})();
