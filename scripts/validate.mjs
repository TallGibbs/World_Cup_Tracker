#!/usr/bin/env node
/*
 * scripts/validate.mjs - mechanical guardrail for the daily tracker routine.
 *
 * Since the single-source refactor, ALL tournament data lives in data.js as one
 * `WC` object ({ meta, teams, groups, today }). Both pages render from it, so
 * the two pages can no longer disagree by construction. This validator parses
 * WC and checks it for internal consistency and freshness for a target date. It
 * changes nothing; it only reports.
 *
 * The routine MUST run this and see "ALL CHECKS PASSED" before committing. If a
 * check fails, fix data.js - never edit this validator just to go green.
 *
 * Usage:
 *   node scripts/validate.mjs [YYYY-MM-DD]   (defaults to today, US Eastern)
 *
 * Exit codes: 0 = all checks pass, 1 = at least one failure, 2 = bad invocation.
 */

import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
const warnings = [];
const fail = (m) => errors.push(m);
const warn = (m) => warnings.push(m);

/* ---------- target date (Eastern Time) ---------- */
const TZ = 'America/New_York';
const argDate = process.argv[2];
const etTodayYMD = () =>
  new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
const targetYMD = argDate || etTodayYMD();
if (!/^\d{4}-\d{2}-\d{2}$/.test(targetYMD)) {
  console.error(`Invalid date argument: "${targetYMD}" (expected YYYY-MM-DD)`);
  process.exit(2);
}
const targetNoon = new Date(`${targetYMD}T12:00:00-04:00`);
const fmt = (opts) => new Intl.DateTimeFormat('en-US', { timeZone: TZ, ...opts }).format(targetNoon);
const expectedShort = fmt({ month: 'long', day: 'numeric', year: 'numeric' });
const expectedLong = fmt({ weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
const norm = (s) => String(s == null ? '' : s).replace(/\s+/g, ' ').trim();

/* V8 silently rolls an out-of-range ISO day over ("2027-06-31" parses as July 1)
   instead of rejecting it, so Number.isNaN alone would let a typo shift a
   countdown target by a day. Check the calendar fields round-trip. */
function isRealCalendarDate(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(iso || ''));
  if (!m) return false;
  const [, y, mo, d] = m.map(Number);
  const probe = new Date(Date.UTC(y, mo - 1, d));
  return probe.getUTCFullYear() === y && probe.getUTCMonth() === mo - 1 && probe.getUTCDate() === d;
}

/* ---------- pull a top-level `const NAME = {...}` object literal ---------- */
function extractObject(src, name) {
  const at = src.indexOf('const ' + name);
  if (at < 0) throw new Error(`could not find "const ${name}"`);
  const start = src.indexOf('{', src.indexOf('=', at));
  if (start < 0) throw new Error(`no opening brace after "const ${name}"`);
  let depth = 0, str = null, esc = false, i = start;
  for (; i < src.length; i++) {
    const c = src[i];
    if (str) { if (esc) esc = false; else if (c === '\\') esc = true; else if (c === str) str = null; continue; }
    if (c === '"' || c === "'" || c === '`') { str = c; continue; }
    if (c === '{') depth++;
    else if (c === '}') { depth--; if (depth === 0) { i++; break; } }
  }
  return Function('"use strict"; return (' + src.slice(start, i) + ');')();
}

/* ---------- raw-text scans ---------- */
const EMOJI = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}️]/u;
const PLACEHOLDER = /\b(TBD|TODO|FIXME|PLACEHOLDER|Lorem ipsum|XXXX?)\b/i;
const PHASES = ['group', 'r32', 'r16', 'qf', 'sf', 'final', 'done'];
const EDITION = /(men's|women's)/i;   // a tournament name must say which edition it is
const ROUND_KEYS = ['r32', 'r16', 'qf', 'sf', 'third', 'final']; // a today-game's `stage` set to one of these marks it knockout
function scanEmoji(label, text) { if (text && EMOJI.test(text)) fail(`${label}: contains an emoji character (none allowed)`); }
function scanPlaceholder(label, obj) { if (obj) { const m = JSON.stringify(obj).match(PLACEHOLDER); if (m) fail(`${label}: contains placeholder token "${m[0]}"`); } }

/* ---------- group-table invariants ---------- */
function checkGroupRows(id, rows) {
  if (!Array.isArray(rows) || rows.length !== 4) { fail(`Group ${id}: expected 4 rows, got ${rows && rows.length}`); return; }
  let sgd = 0, sw = 0, sl = 0, sd = 0, spld = 0, sgf = 0, sga = 0;
  for (const r of rows) {
    for (const k of ['pld', 'w', 'd', 'l', 'gd', 'gf', 'ga', 'pts']) if (typeof r[k] !== 'number' || Number.isNaN(r[k])) fail(`Group ${id} / ${r.team}: ${k} is not a number`);
    if (r.pld < 0 || r.w < 0 || r.d < 0 || r.l < 0 || r.pts < 0) fail(`Group ${id} / ${r.team}: negative value`);
    if (r.gf < 0 || r.ga < 0) fail(`Group ${id} / ${r.team}: negative gf/ga (gf=${r.gf}, ga=${r.ga})`);
    if (r.pld !== r.w + r.d + r.l) fail(`Group ${id} / ${r.team}: pld(${r.pld}) != w+d+l(${r.w + r.d + r.l})`);
    if (r.pts !== 3 * r.w + r.d) fail(`Group ${id} / ${r.team}: pts(${r.pts}) != 3w+d(${3 * r.w + r.d})`);
    if (r.gd !== r.gf - r.ga) fail(`Group ${id} / ${r.team}: gd(${r.gd}) != gf-ga(${r.gf - r.ga})`);
    sgd += r.gd; sw += r.w; sl += r.l; sd += r.d; spld += r.pld; sgf += r.gf; sga += r.ga;
  }
  if (sgd !== 0) fail(`Group ${id}: goal differences sum to ${sgd}, not 0`);
  if (sgf !== sga) fail(`Group ${id}: total gf(${sgf}) != total ga(${sga})`);
  if (sw !== sl) fail(`Group ${id}: total wins(${sw}) != total losses(${sl})`);
  if (sd % 2 !== 0) fail(`Group ${id}: total draws(${sd}) is odd (each draw is shared by two teams)`);
  if (spld % 2 !== 0) fail(`Group ${id}: total matches played(${spld}) is odd`);
}

/* ---------- load the single source ---------- */
let dataSrc, trackerSrc, todaySrc, bracketSrc, WC;
try { dataSrc = readFileSync(join(root, 'data.js'), 'utf8'); } catch (e) { fail('cannot read data.js: ' + e.message); }
try { trackerSrc = readFileSync(join(root, 'world_cup_tracker.html'), 'utf8'); } catch (e) { fail('cannot read world_cup_tracker.html: ' + e.message); }
try { todaySrc = readFileSync(join(root, 'today.html'), 'utf8'); } catch (e) { fail('cannot read today.html: ' + e.message); }
try { bracketSrc = readFileSync(join(root, 'bracket.html'), 'utf8'); } catch (e) { /* optional until created */ }
try { if (dataSrc) WC = extractObject(dataSrc, 'WC'); } catch (e) { fail('parse WC from data.js: ' + e.message); }

scanEmoji('data.js', dataSrc);
scanEmoji('world_cup_tracker.html', trackerSrc);
scanEmoji('today.html', todaySrc);
scanEmoji('bracket.html', bracketSrc);
scanPlaceholder('data.js (WC)', WC);

/* every page must actually load the shared data file */
if (trackerSrc && !/<script src="\/data\.js"><\/script>/.test(trackerSrc)) fail('world_cup_tracker.html does not load /data.js');
if (todaySrc && !/<script src="\/data\.js"><\/script>/.test(todaySrc)) fail('today.html does not load /data.js');
if (bracketSrc && !/<script src="\/data\.js"><\/script>/.test(bracketSrc)) fail('bracket.html does not load /data.js');

/* ---------- WC checks ---------- */
const byId = {};
if (WC) {
  if (!WC.meta) fail('WC.meta is missing');
  else {
    // The site now spans editions (a frozen men's archive plus a women's
    // countdown), so "must say Men's" is wrong. The invariant that actually
    // matters is unchanged: a tournament name must never be ambiguous about
    // WHICH edition its numbers belong to.
    if (!EDITION.test(WC.meta.tournament || '')) fail(`WC.meta.tournament must name its edition explicitly ("Men's" or "Women's") - got "${WC.meta.tournament}"`);
    if (norm(WC.meta.updated) !== norm(expectedShort)) fail(`WC.meta.updated = "${WC.meta.updated}", expected today "${expectedShort}"`);
    if (WC.meta.phase != null && !PHASES.includes(WC.meta.phase)) fail(`WC.meta.phase must be one of ${PHASES.join('|')} (got "${WC.meta.phase}")`);
  }
  const PHASE = (WC.meta && WC.meta.phase) || 'group';

  for (const g of (WC.groups || [])) { byId[g.id] = g; checkGroupRows(g.id, g.rows || []); }

  // Every team name that appears in a group table - used to reject a recap or a
  // bracket slot that names a team the tournament never had.
  const knownTeamNames = new Set();
  for (const g of (WC.groupsFinal || WC.groups || [])) for (const r of (g.rows || [])) knownTeamNames.add(r.team);

  // Index every bracket slot by id (empty until WC.bracket exists - Phase 1).
  const bracketById = {};
  if (WC.bracket && Array.isArray(WC.bracket.rounds))
    for (const rd of WC.bracket.rounds) for (const m of (rd.matches || [])) bracketById[m.id] = m;

  for (const t of (WC.teams || [])) {
    const g = byId[t.group];
    if (!g) fail(`team ${t.name}: group ${t.group} not found in WC.groups`);
    else if (!(g.rows || []).some((r) => r.team === t.name)) fail(`team ${t.name} not present in its Group ${t.group} rows`);
    for (const f of (t.fixtures || [])) {
      if (f.status !== 'final' && f.status !== 'upcoming') fail(`${t.name} v ${f.opp}: status must be "final" or "upcoming" (got "${f.status}")`);
      if (f.status === 'final' && (!Number.isInteger(f.us) || !Number.isInteger(f.them) || f.us < 0 || f.them < 0)) fail(`${t.name} v ${f.opp}: a final fixture needs integer us/them scores`);
      if (f.status === 'upcoming' && (!Array.isArray(f.preview) || f.preview.length < 2)) fail(`${t.name} v ${f.opp}: an upcoming fixture needs a "preview" array of >=2 forward-looking bullets`);
    }
  }

  /* ---------- WC.next: the forward countdown target (hybrid/off-season mode) ----------
     Optional - absent during a live tournament, when the hero counts down to a
     featured fixture instead. When present it drives the hero countdown, so a
     target that does not parse (or has already passed) would silently render
     "NaN" or send tickCountdown into a re-render loop. Both are checked. */
  if (WC.next) {
    const n = WC.next;
    for (const k of ['tournament', 'label', 'eventLabel', 'iso', 'when', 'venue', 'note', 'source'])
      if (typeof n[k] !== 'string' || !n[k].trim()) fail(`WC.next: missing or empty "${k}"`);
    if (!EDITION.test(n.tournament || ''))
      fail(`WC.next.tournament must name its edition explicitly ("Men's" or "Women's") - got "${n.tournament}"`);
    if (!Array.isArray(n.bullets) || n.bullets.length < 2)
      fail('WC.next: needs a "bullets" array of >=2 forward-looking entries');
    const nextAt = +new Date(n.iso);
    if (Number.isNaN(nextAt)) fail(`WC.next.iso "${n.iso}" is not a valid date - the countdown would render NaN`);
    else if (!isRealCalendarDate(n.iso)) fail(`WC.next.iso "${n.iso}" is not a real calendar date (the day does not exist in that month)`);
    else if (nextAt <= +targetNoon) fail(`WC.next.iso "${n.iso}" is not in the future as of ${targetYMD} - retarget it or remove WC.next`);
  }

  /* ---------- WC.recap: how the archived tournament finished ----------
     Optional. Its archive links are the only route to the frozen snapshots, so
     every href is resolved against the working tree - a dead archive link is
     the failure this check exists to prevent. */
  if (WC.recap) {
    const r = WC.recap;
    for (const k of ['headline', 'line', 'source'])
      if (typeof r[k] !== 'string' || !r[k].trim()) fail(`WC.recap: missing or empty "${k}"`);

    if (!Array.isArray(r.podium) || !r.podium.length) fail('WC.recap.podium must be a non-empty array');
    else r.podium.forEach((p, i) => {
      for (const k of ['place', 'team', 'detail']) if (!p[k]) fail(`WC.recap.podium[${i}]: missing "${k}"`);
      if (p.team && !knownTeamNames.has(p.team)) fail(`WC.recap.podium[${i}]: team "${p.team}" is not in any group table`);
    });

    if (!Array.isArray(r.ourTeams)) fail('WC.recap.ourTeams must be an array');
    else r.ourTeams.forEach((t, i) => {
      for (const k of ['team', 'finish', 'detail']) if (!t[k]) fail(`WC.recap.ourTeams[${i}]: missing "${k}"`);
      if (t.team && !(WC.teams || []).some((x) => x.name === t.team))
        fail(`WC.recap.ourTeams[${i}]: team "${t.team}" is not one of WC.teams`);
    });

    if (!Array.isArray(r.archive) || !r.archive.length) fail('WC.recap.archive must be a non-empty array');
    else r.archive.forEach((a, i) => {
      for (const k of ['label', 'href', 'detail']) if (!a[k]) fail(`WC.recap.archive[${i}]: missing "${k}"`);
      if (!a.href) return;
      if (!a.href.startsWith('/')) { fail(`WC.recap.archive[${i}]: href "${a.href}" must be a site-root path starting with "/"`); return; }
      if (!existsSync(join(root, a.href.replace(/^\//, ''))))
        fail(`WC.recap.archive[${i}]: href "${a.href}" does not exist in the repository - dead archive link`);
    });
  }

  /* ---------- WC.today.mode + WC.roadTo2027 (interim /today repurpose) ----------
     A single field, WC.today.mode, toggles the /today page between its live
     "games" renderer and the between-tournaments "roadmap" renderer. Absent or
     "games" is the live default; "roadmap" requires WC.roadTo2027 to exist. */
  const todayMode = (WC.today && WC.today.mode) || 'games';
  if (WC.today && WC.today.mode != null && todayMode !== 'games' && todayMode !== 'roadmap')
    fail(`WC.today.mode must be "games" or "roadmap" (got "${WC.today.mode}")`);
  if (todayMode === 'roadmap' && !WC.roadTo2027)
    fail('WC.today.mode is "roadmap" but WC.roadTo2027 is missing');
  if (WC.roadTo2027) {
    const rm = WC.roadTo2027;
    for (const k of ['heading', 'intro', 'source']) if (typeof rm[k] !== 'string' || !rm[k].trim()) fail(`WC.roadTo2027: missing or empty "${k}"`);
    if (!Array.isArray(rm.timeline) || rm.timeline.length < 2) fail('WC.roadTo2027.timeline must be an array of >=2 entries');
    else rm.timeline.forEach((t, i) => { for (const k of ['window', 'event']) if (!t[k]) fail(`WC.roadTo2027.timeline[${i}]: missing "${k}"`); });
    if (!Array.isArray(rm.featured) || !rm.featured.length) fail('WC.roadTo2027.featured must be a non-empty array');
    else rm.featured.forEach((f, i) => { for (const k of ['team', 'detail']) if (!f[k]) fail(`WC.roadTo2027.featured[${i}]: missing "${k}"`); });
    if (rm.slots && !Array.isArray(rm.slots.rows)) fail('WC.roadTo2027.slots.rows must be an array when slots is present');
  }

  /* Today's Games */
  const today = WC.today || {};
  if (norm(today.date) !== norm(expectedLong)) fail(`WC.today.date = "${today.date}", expected today "${expectedLong}"`);
  (today.games || []).forEach((gm, idx) => {
    const tag = `today game #${idx + 1} (${gm.home} v ${gm.away})`;

    // Knockout when the stage is a knockout round key, or when phase is past group and there is no single group.
    // (Group-stage games use a descriptive `stage` label like "Group I - Matchday 3", never a round key.)
    const isKo = ROUND_KEYS.includes(gm.stage) || (PHASE !== 'group' && !gm.group);
    const requiredKeys = isKo
      ? ['home', 'away', 'kick', 'iso', 'venue', 'tv', 'stream', 'bracketId']   // knockout: no group; link to bracket slot
      : ['group', 'home', 'away', 'kick', 'iso', 'venue', 'tv', 'stream'];      // group: unchanged
    for (const k of requiredKeys) if (!gm[k]) fail(`${tag}: missing "${k}"`);
    if (isKo && gm.group) fail(`${tag}: knockout game should not carry a single "group"`);

    if (!Array.isArray(gm.bullets) || gm.bullets.length < 2) fail(`${tag}: needs a "bullets" array of >=2 entries`);

    if (gm.iso) {
      if (Number.isNaN(+new Date(gm.iso))) fail(`${tag}: iso "${gm.iso}" is not a valid date`);
      else if (gm.iso.slice(0, 10) !== targetYMD) fail(`${tag}: iso date ${gm.iso.slice(0, 10)} is not today (${targetYMD}) - stale fixture`);
    }

    // Group-stage both-teams-in-group check: UNCHANGED; already guarded by gm.group, so it self-skips for knockout.
    if (gm.group) {
      const g = byId[gm.group];
      if (!g) fail(`${tag}: group ${gm.group} is not one of WC.groups`);
      else for (const side of [gm.home, gm.away]) if (!(g.rows || []).some((r) => r.team === side)) fail(`${tag}: ${side} is not in Group ${gm.group}`);
    }

    // Knockout linkage: today-game must reference a real bracket slot whose resolved teams agree.
    // Short-circuits while WC.bracket is absent (Phase 0); activates once the bracket exists (Phase 1).
    if (isKo && gm.bracketId && WC.bracket) {
      const node = bracketById[gm.bracketId];
      if (!node) fail(`${tag}: bracketId "${gm.bracketId}" is not in WC.bracket`);
      else {
        if (node.homeTeam && gm.home !== node.homeTeam) fail(`${tag}: home "${gm.home}" disagrees with bracket slot ${gm.bracketId} (homeTeam "${node.homeTeam}")`);
        if (node.awayTeam && gm.away !== node.awayTeam) fail(`${tag}: away "${gm.away}" disagrees with bracket slot ${gm.bracketId} (awayTeam "${node.awayTeam}")`);
      }
    }
  });

  /* ---------- Bracket + groupsFinal integrity (gated on WC.bracket) ---------- */
  if (WC.bracket) {
    const knownTeams = new Set();
    for (const g of (WC.groupsFinal || WC.groups || [])) for (const r of (g.rows || [])) knownTeams.add(r.team);

    // A "pending" bracket is the pre-draw shape of a future tournament: the tree
    // structure and slot descriptors exist, but no teams are drawn and no match
    // schedule is published, so per-match iso/venue/tv are not yet required and
    // every slot must be empty and upcoming. (Used for the empty 2027 women's
    // bracket shown between tournaments.)
    const bracketPending = WC.bracket.pending === true;
    if (WC.bracket.pending != null && typeof WC.bracket.pending !== 'boolean')
      fail('WC.bracket.pending must be a boolean when present');

    if (typeof WC.bracket.source !== 'string' || !WC.bracket.source.trim())
      fail('WC.bracket.source must be a non-empty named structured source string');
    if (!Array.isArray(WC.bracket.rounds)) fail('WC.bracket.rounds must be an array');

    const ROUND_SIZE = { r32: 16, r16: 8, qf: 4, sf: 2, third: 1, final: 1 };
    const seenIds = new Set();
    for (const rd of (WC.bracket.rounds || [])) {
      const exp = ROUND_SIZE[rd.key];
      if (exp == null) fail(`WC.bracket: unknown round key "${rd.key}"`);
      else if (!Array.isArray(rd.matches) || rd.matches.length !== exp)
        fail(`WC.bracket round "${rd.key}": expected ${exp} matches, got ${rd.matches && rd.matches.length}`);

      for (const m of (rd.matches || [])) {
        if (!m.id) { fail(`WC.bracket round "${rd.key}": a match is missing "id"`); continue; }
        if (seenIds.has(m.id)) fail(`WC.bracket: duplicate match id "${m.id}"`);
        seenIds.add(m.id);

        const reqKeys = bracketPending
          ? ['home', 'away', 'status']                              // pre-draw: no schedule yet
          : ['home', 'away', 'iso', 'venue', 'tv', 'status'];
        for (const k of reqKeys)
          if (m[k] == null || m[k] === '') fail(`WC.bracket ${m.id}: missing "${k}"`);
        if (m.status !== 'upcoming' && m.status !== 'final')
          fail(`WC.bracket ${m.id}: status must be "upcoming" or "final" (got "${m.status}")`);

        if (bracketPending) {
          if (m.status !== 'upcoming')
            fail(`WC.bracket ${m.id}: a pending bracket holds only upcoming matches (got "${m.status}")`);
          if ((m.homeTeam != null && m.homeTeam !== '') || (m.awayTeam != null && m.awayTeam !== ''))
            fail(`WC.bracket ${m.id}: a pending bracket must have empty homeTeam/awayTeam (the draw has not been made)`);
        }

        for (const side of ['homeTeam', 'awayTeam'])
          if (m[side] != null && m[side] !== '' && !knownTeams.has(m[side]))
            fail(`WC.bracket ${m.id}: ${side} "${m[side]}" is not a known tournament team`);

        if (m.status === 'final') {
          if (!Number.isInteger(m.hs) || !Number.isInteger(m.as) || m.hs < 0 || m.as < 0)
            fail(`WC.bracket ${m.id}: a final match needs integer hs/as >= 0`);
          if (!m.homeTeam || !m.awayTeam)
            fail(`WC.bracket ${m.id}: a final match must have both teams resolved`);
          if (m.winner !== m.homeTeam && m.winner !== m.awayTeam)
            fail(`WC.bracket ${m.id}: winner "${m.winner}" must equal homeTeam or awayTeam`);
          if (Number.isInteger(m.hs) && Number.isInteger(m.as)) {
            if (m.hs === m.as) {
              if (!/^\d+-\d+$/.test(m.pens || '')) fail(`WC.bracket ${m.id}: level score ${m.hs}-${m.as} must record a penalty result "X-Y" in "pens"`);
              else {
                const [ph, pa] = m.pens.split('-').map(Number);
                if (ph === pa) fail(`WC.bracket ${m.id}: penalties cannot be level (${m.pens})`);
                else if (m.winner !== (ph > pa ? m.homeTeam : m.awayTeam)) fail(`WC.bracket ${m.id}: winner "${m.winner}" disagrees with penalties ${m.pens}`);
              }
            } else {
              if (m.pens) fail(`WC.bracket ${m.id}: non-level score ${m.hs}-${m.as} must not record penalties`);
              if (m.winner !== (m.hs > m.as ? m.homeTeam : m.awayTeam)) fail(`WC.bracket ${m.id}: winner "${m.winner}" disagrees with score ${m.hs}-${m.as}`);
            }
          }
        } else {
          if (m.hs != null || m.as != null || m.winner != null || m.pens != null)
            fail(`WC.bracket ${m.id}: an upcoming match must not carry hs/as/winner/pens`);
        }
      }
    }

    // No resolved team appears twice within one round.
    for (const rd of (WC.bracket.rounds || [])) {
      const seenInRound = new Set();
      for (const m of (rd.matches || [])) for (const side of [m.homeTeam, m.awayTeam]) {
        if (!side) continue;
        if (seenInRound.has(side)) fail(`WC.bracket round "${rd.key}": team "${side}" appears more than once`);
        seenInRound.add(side);
      }
    }

    // Advancement: a final winner must occupy the EXACT feedsSide of its feedsInto slot.
    for (const rd of (WC.bracket.rounds || [])) for (const m of (rd.matches || [])) {
      if (!m.feedsInto) continue;
      const nxt = bracketById[m.feedsInto];
      if (!nxt) { fail(`WC.bracket ${m.id}: feedsInto "${m.feedsInto}" is not a known slot id`); continue; }
      if (m.feedsSide !== 'home' && m.feedsSide !== 'away') { fail(`WC.bracket ${m.id}: feedsSide must be "home" or "away"`); continue; }
      if (m.status === 'final' && m.winner) {
        const slot = m.feedsSide === 'home' ? nxt.homeTeam : nxt.awayTeam;
        if (slot !== m.winner) fail(`WC.bracket ${m.id}: winner "${m.winner}" not keyed into ${m.feedsInto}.${m.feedsSide} (found "${slot}")`);
      }
    }

    // Resolution gate: a knockout slot must be filled the moment its feeder is
    // decided, so a knowable opponent can never sit empty (the "USA vs unknown"
    // class of failure). Group-fed slots ("Winner/Runner-up Group X") resolve as
    // soon as that group is complete; the best-third-placed slots resolve only
    // once ALL twelve groups are complete (the FIFA combination table needs the
    // full set of qualified third-placed teams), and the slot must then hold an
    // actual third-placed team. Knockout-fed slots are already forced to fill by
    // the advancement check above.
    const liveGroups = WC.groupsFinal || WC.groups || [];
    const gInfo = {};
    const thirds = new Set();
    let allGroupsComplete = liveGroups.length === 12;
    for (const g of liveGroups) {
      const rows = g.rows || [];
      const complete = rows.length === 4 && rows.every(r => r.pld === 3);
      if (!complete) allGroupsComplete = false;
      gInfo[g.id] = { complete, winner: rows[0] && rows[0].team, runner: rows[1] && rows[1].team };
      if (complete && rows[2]) thirds.add(rows[2].team);
    }
    const r32 = (WC.bracket.rounds || []).find(r => r.key === 'r32');
    for (const m of ((r32 && r32.matches) || [])) {
      for (const side of ['home', 'away']) {
        const label = m[side] || '';
        const teamKey = side + 'Team';
        const cur = m[teamKey];
        const empty = cur == null || cur === '';
        let mm;
        if ((mm = /^Winner Group ([A-L])$/.exec(label))) {
          const g = gInfo[mm[1]];
          if (g && g.complete) {
            if (empty) fail(`WC.bracket ${m.id}: ${teamKey} is empty but Group ${mm[1]} is complete - resolve it to the winner "${g.winner}"`);
            else if (cur !== g.winner) fail(`WC.bracket ${m.id}: ${teamKey} "${cur}" should be Group ${mm[1]} winner "${g.winner}"`);
          }
        } else if ((mm = /^Runner-up Group ([A-L])$/.exec(label))) {
          const g = gInfo[mm[1]];
          if (g && g.complete) {
            if (empty) fail(`WC.bracket ${m.id}: ${teamKey} is empty but Group ${mm[1]} is complete - resolve it to the runner-up "${g.runner}"`);
            else if (cur !== g.runner) fail(`WC.bracket ${m.id}: ${teamKey} "${cur}" should be Group ${mm[1]} runner-up "${g.runner}"`);
          }
        } else if (/\b3rd\b|third/i.test(label)) {
          if (allGroupsComplete) {
            if (empty) fail(`WC.bracket ${m.id}: ${teamKey} is a best-third-placed slot but all twelve groups are complete - resolve it to the qualified third-placed team`);
            else if (!thirds.has(cur)) fail(`WC.bracket ${m.id}: ${teamKey} "${cur}" is not a third-placed team of any group`);
          }
        }
      }
    }
  }

  // Phase consistency: once past group, the frozen final table must exist.
  if (PHASE !== 'group' && !WC.groupsFinal) fail(`WC.meta.phase is "${PHASE}" but WC.groupsFinal is missing`);

  // groupsFinal table math + all rows pld:3.
  if (WC.groupsFinal) for (const g of WC.groupsFinal) {
    checkGroupRows('FINAL ' + g.id, g.rows || []);
    for (const r of (g.rows || [])) if (r.pld !== 3) fail(`WC.groupsFinal ${g.id} / ${r.team}: pld is ${r.pld}, expected 3`);
  }
}

/* ---------- report ---------- */
console.log(`World Cup data validation - target date ${targetYMD} (${expectedLong})`);
console.log(`  WC.meta.updated: ${WC && WC.meta ? WC.meta.updated : '?'}`);
console.log(`  WC.today.date:   ${WC && WC.today ? WC.today.date : '?'}`);
console.log('');
if (warnings.length) { console.log(`WARNINGS (${warnings.length}):`); for (const w of warnings) console.log('  [WARN] ' + w); console.log(''); }
if (errors.length) {
  console.log(`FAILED - ${errors.length} problem(s) must be fixed before committing:`);
  for (const e of errors) console.log('  [FAIL] ' + e);
  process.exit(1);
}
console.log('ALL CHECKS PASSED');
process.exit(0);
