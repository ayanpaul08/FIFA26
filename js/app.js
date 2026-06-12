// ============================================================
//  app.js — Shared utilities
// ============================================================

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000; // +5:30

function toIST(utcStr) {
  const d = new Date(utcStr);
  return new Date(d.getTime() + IST_OFFSET_MS);
}

function formatIST(utcStr) {
  const ist = toIST(utcStr);
  const opts = { weekday:'short', day:'numeric', month:'short', hour:'2-digit', minute:'2-digit', hour12:true, timeZone:'UTC' };
  return ist.toLocaleString('en-IN', opts) + ' IST';
}

function formatISTDate(utcStr) {
  const ist = toIST(utcStr);
  return ist.toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric', timeZone:'UTC' });
}

function formatISTTime(utcStr) {
  const ist = toIST(utcStr);
  return ist.toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit', hour12:true, timeZone:'UTC' });
}

function getISTMidnight(offsetDays = 0) {
  const now = new Date();
  const istNow = new Date(now.getTime() + IST_OFFSET_MS);
  const y = istNow.getUTCFullYear();
  const m = istNow.getUTCMonth();
  const d = istNow.getUTCDate() + offsetDays;
  return new Date(Date.UTC(y, m, d, 0, 0, 0) - IST_OFFSET_MS);
}

function isTodayIST(utcStr) {
  const t = new Date(utcStr).getTime();
  const s = getISTMidnight(0).getTime();
  const e = getISTMidnight(1).getTime();
  return t >= s && t < e;
}

function isUpcoming(utcStr) {
  return new Date(utcStr) > new Date();
}

// Countdown to UTC kickoff
function countdown(utcStr) {
  const diff = new Date(utcStr) - new Date();
  if (diff <= 0) return null;
  const days  = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins  = Math.floor((diff % 3600000) / 60000);
  const secs  = Math.floor((diff % 60000) / 1000);
  return { days, hours, mins, secs };
}

// ============================================================
//  STANDINGS ENGINE
// ============================================================
function computeStandings(groupId, matches) {
  const teams = {};
  const initTeam = (tid) => {
    if (!teams[tid]) teams[tid] = { id: tid, gp:0, w:0, d:0, l:0, gf:0, ga:0, pts:0 };
  };

  matches
    .filter(m => m.grp === groupId && m.st !== 'NS')
    .forEach(m => {
      initTeam(m.home); initTeam(m.away);
      const h = teams[m.home], a = teams[m.away];
      h.gp++; a.gp++;
      h.gf += m.hs; h.ga += m.as;
      a.gf += m.as; a.ga += m.hs;
      if (m.hs > m.as) { h.w++; h.pts += 3; a.l++; }
      else if (m.hs < m.as) { a.w++; a.pts += 3; h.l++; }
      else { h.d++; a.d++; h.pts++; a.pts++; }
    });

  // Include teams with 0 played too
  matches.filter(m => m.grp === groupId).forEach(m => {
    initTeam(m.home); initTeam(m.away);
  });

  return Object.values(teams).sort((a, b) =>
    b.pts - a.pts || (b.gf - b.ga) - (a.gf - a.ga) || b.gf - a.gf
  );
}

// ============================================================
//  COUNTDOWN DOM RENDERER
// ============================================================
function startCountdown(el, utcStr) {
  const update = () => {
    const c = countdown(utcStr);
    if (!c) { el.innerHTML = `<span class="cd-live">LIVE / ENDED</span>`; return; }
    el.innerHTML =
      `<span class="cd-seg"><span class="cd-num">${String(c.days).padStart(2,'0')}</span><span class="cd-lbl">D</span></span>` +
      `<span class="cd-sep">:</span>` +
      `<span class="cd-seg"><span class="cd-num">${String(c.hours).padStart(2,'0')}</span><span class="cd-lbl">H</span></span>` +
      `<span class="cd-sep">:</span>` +
      `<span class="cd-seg"><span class="cd-num">${String(c.mins).padStart(2,'0')}</span><span class="cd-lbl">M</span></span>` +
      `<span class="cd-sep">:</span>` +
      `<span class="cd-seg"><span class="cd-num">${String(c.secs).padStart(2,'0')}</span><span class="cd-lbl">S</span></span>`;
  };
  update();
  return setInterval(update, 1000);
}

// Team link helper
function teamLink(tid) {
  const t = TEAMS[tid];
  return `<a href="team.html?team=${tid}" class="team-link">${t.flag} ${t.name}</a>`;
}

// Flag span
function flagSpan(tid) {
  const t = TEAMS[tid];
  return `<span title="${t.name}">${t.flag}</span>`;
}
