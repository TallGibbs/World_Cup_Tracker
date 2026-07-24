# Roadmap: from Men's 2026 daily tracker to hybrid archive + 2027 tracker

Status as of **July 23, 2026**.

The FIFA Men's World Cup 2026 is complete (Spain beat Argentina 1-0 in the final
at MetLife Stadium on July 19; England beat France 6-4 in the third-place
play-off on July 18). The daily live-tracking mission is over.

**The decision, already made and not up for re-litigation here:** the site becomes
a **hybrid** - a permanent recap/archive of Men's WC 2026 plus a live
countdown/preview for the **FIFA Women's World Cup 2027 in Brazil** - on the
**same repo**, at the **same domain**, with the **same validator/snapshot
pipeline**, running **weekly instead of daily**. Once the 2027 draw and match
schedule are published, the same pipeline pivots to full live tracking of that
tournament.

This document is the action list. Each weekly run should read it, do the phase
work that is due, and tick items off.

---

## How the machine works (what any future run must not break)

- **`data.js` is the only data file.** It defines one `const WC = {...}` object.
  All three pages load it with the exact tag `<script src="/data.js"></script>`
  and render from it. `validate.mjs` fails any page that drops that tag.
- **Pages:** `world_cup_tracker.html` (served at `/`), `today.html` (`/today`),
  `bracket.html` (`/bracket`). Each is self-contained HTML + inline CSS + inline
  JS, sharing an identical `:root` variable block, sticky nav, and `.wrap`
  container. There is no build step and no framework.
- **`scripts/validate.mjs` is the commit gate.** It parses `WC` out of `data.js`
  by brace-matching (not by importing), then checks table math, freshness
  against a target date in US Eastern, fixture completeness, hygiene (no emojis,
  no placeholder tokens), and full bracket integrity. It must print
  `ALL CHECKS PASSED`. **Never weaken a check to go green.**
- **`scripts/snapshot.mjs`** inlines the current `data.js` into
  `world_cup_tracker.html` and `bracket.html` and writes dated, self-contained
  copies under `snapshots/`. Snapshots are frozen: they do not re-read `data.js`.
- **Cloudflare Pages** serves the repo root as-is with continuous deployment from
  `main`. `_redirects` contains exactly one rule, `/ -> /world_cup_tracker.html`
  (status 200). Pages resolves every other clean URL natively. **Do not add a
  `/today -> /today.html` rule** - Pages canonicalises `.html` back to the clean
  URL and that pair loops forever. A commit on `main` is a deploy.

---

## Phase 0 - freeze the men's tournament, stand up the hybrid (THIS PHASE)

Goal: after Phase 0 the site is honest and self-maintaining at a weekly cadence,
with nothing left that claims a live men's tournament.

| # | Item | Status |
|---|---|---|
| 0.1 | Rewrite `CLAUDE.md` for the weekly recap + countdown mission (replaces the daily live-tracking routine) | done |
| 0.2 | Add `WC.recap` (2026 result, podium, our teams' finishes, archive links) to `data.js` | done |
| 0.3 | Add `WC.next` (the 2027 countdown target and its sourcing note) to `data.js` | done |
| 0.4 | Retarget the hero countdown to `WC.next.iso` by **reusing `tickCountdown()`** - no new countdown JS | done |
| 0.5 | Add a "Tournament recap" / archive section to `world_cup_tracker.html` in the existing CSS idiom | done |
| 0.6 | Rebrand nav brand and `<title>`s from "Men's World Cup 2026" to the dual framing | done |
| 0.7 | Fix the stale repo name `TallGibbs/2026_Mens_World_Cup_Tracker` in `docs/DEPLOY.md` | done |
| 0.8 | Rewrite `README.md` for the hybrid mission and weekly cadence | done |
| 0.9 | Teach `validate.mjs` about `WC.next` / `WC.recap`, and generalise the hard-coded `"Men's"` check to "must name an edition explicitly" | done |
| 0.10 | Fix stale copy that the completed tournament turned into falsehoods (see "Copy bugs" below) | done |
| 0.11 | **Owner action:** change the Claude Code web scheduler trigger from daily to weekly | pending - owner only |
| 0.12 | **Owner action:** confirm the live site renders the countdown correctly after deploy | pending - owner only |

### Copy bugs the pivot has to fix (found by audit, all live right now)

These are not cosmetic - each one states something false on the live site now that
the tournament is over:

- **`world_cup_tracker.html:618`** - `g.started ? 'Matchday 1 complete' : ...`.
  All 12 groups have `started:true` and none carries a `note`, so **every final
  group card is labelled "Matchday 1 complete"**. Fixed by deriving the label
  from the rows' `pld`.
- **`world_cup_tracker.html:402/405`** - the best-third-placed section still says
  "provisional, as things stand" and "the cutoff can still swing on the final
  group matchday". Nothing can swing; the groups are final.
- **`world_cup_tracker.html:707`** - the cut-line label reads "Top 8 advance
  (provisional)". Those eight teams advanced two weeks ago.
- **`world_cup_tracker.html:409`** - the footer describes qualification in the
  present tense.
- **`world_cup_tracker.html:497`** - the dead `mode:'done'` hero branch reads
  "Group stage wrapped up. Check the knockout bracket for what comes next." This
  is the string the 2027 countdown replaces.

### Why the countdown could not be a data-only change

Worth recording, because `CLAUDE.md` previously forbade the routine from touching
the pages at all. The countdown had **no target-date field**: `pickHero()` derives
it entirely from featured-team fixtures, and with all 17 fixtures `status:"final"`
it returns `{mode:'done'}` and `tickCountdown()` is never called. The alternative -
synthesising a fake `upcoming` fixture on a featured team - would have required a
`preview` array to satisfy `validate.mjs:135`, and `renderHero()` would then have
rendered a stale **2026** group table directly under a **2027** countdown
(`heroGroupTable`, tracker:455-481). So `WC.next` plus a rewritten `mode:'done'`
branch is the correct shape, and `tickCountdown()` itself is reused verbatim.

### The countdown target (and why it is what it is)

There is no published match schedule for 2027 yet, so there is no real opening
kickoff time to count down to. Two independent structured sources agree on the
tournament window:

- **Wikidata `Q64979822`** - `P580` (start time) `+2027-06-24`, `P582` (end time)
  `+2027-07-25`, `P17` (country) `Q155` (Brazil). Retrieved 2026-07-23.
- **Wikipedia `2027 FIFA Women's World Cup` infobox** - `dates = 24 June - 25
  July`, `country = Brazil`, `num_teams = 32`, `venues = 8`.

The repo's usual Tier 1-3 structured sources have nothing: ESPN's `fifa.wwc`
league API still reports its latest season as **2023**, and football-data.org /
api-football have no 2027 competition. That was checked, not assumed.

So `WC.next.iso` is set to **`2027-06-24T00:00:00-03:00`** - the start of opening
day in Brazil (BRT) - and the page labels it as the tournament opening, not a
kickoff. **This is a deliberate, labelled approximation, not an invented
kickoff time.** Replace it with the real opening-match time the moment FIFA
publishes the schedule (see Phase 1.1).

### Qualifying-window research (2026-07-24)

A deep-research pass, cross-checked against the ESPN structured API directly,
established the road to Brazil and the data-source picture (feeds the `/today`
Road-to-2027 page and Phase 1):

- **32 slots:** 29 direct (UEFA 11, AFC 6, CAF 4, CONCACAF 4, CONMEBOL 3 incl.
  host Brazil, OFC 1) + 3 via a 10-team inter-confederation play-off (prelim
  Nov-Dec 2026, final Feb 2027). Brazil is the only automatic qualifier.
- **In-window qualifying is concentrated Oct 2026-Feb 2027**, then a quiet
  Mar-Jun 2027 run-in. Key windows: UEFA play-offs 9-13 Oct and late Nov-early
  Dec 2026; CONCACAF W Championship knockouts 27 Nov-5 Dec 2026; the
  inter-confederation play-offs. **Final draw expected Dec 2026, not yet
  officially scheduled** - so no group bracket exists to build until then.
- **Featured nations' women's routes:** USA -> CONCACAF W Championship (Nov-Dec
  2026); England & Netherlands -> UEFA qualifiers (league phase done Jun 2026,
  play-offs Oct-Dec 2026).
- **Data feasibility (the constraint on any live view):** ESPN's site API carries
  the UEFA women's qualifiers (`fifa.wworldq.uefa`, league 20649) and the
  `concacaf.womens.championship` (league 18969) - so **all three featured
  nations' routes are available** from a free structured source, parsed the same
  way as the men's data. football-data.org and API-Football carry **no** women's
  WC qualifiers. AFC/CAF/CONMEBOL/OFC women's qualifier slugs were not found on
  ESPN, so an all-six-confederation live view is not currently guaranteed. Full
  detail is in the `wwc2027-data-sources` memory.

---

## Phase 1 - after the 2027 draw (expected late 2026)

Trigger: FIFA publishes the 2027 group draw and match schedule. Until then, every
weekly run is a light-touch refresh (see "The weekly run" in `CLAUDE.md`).

| # | Item |
|---|---|
| 1.1 | Replace `WC.next.iso` with the real opening-match kickoff, venue and broadcaster; drop the "provisional" wording |
| 1.2 | Archive the men's data: move `WC.groups` / `WC.groupsFinal` / `WC.bracket` / `WC.teams` into an archive shape (see "Cutover design" below) and rebuild them for 2027 |
| 1.3 | Rebuild `WC.meta` for the women's tournament (`tournament`, `host`, `stage`, `phase: "group"`, `where`, `standNote`) |
| 1.4 | Choose the new featured teams for `WC.teams` (USA, Netherlands and England all qualify as women's sides too - confirm with the owner) |
| 1.5 | Rebuild `WC.today` for live matchdays; restore `/today` to its real job by flipping `WC.today.mode` back to `"games"` (the `renderGames()` path is preserved) |
| 1.6 | *Started (2026-07-24):* `WC.bracket` is now an **empty pre-draw 2027 women's tree** (32 teams -> Round of 16, `"pending": true`), the desktop renderer is generalized to the R16-first format, and `validate.mjs` accepts a pending bracket. Remaining for Phase 1: set `pending:false`, resolve the group descriptors into the drawn teams, and add the real schedule (iso/venue/tv) once the December 2026 draw and match calendar are published |
| 1.7 | Confirm which structured source carries the 2027 tournament (ESPN `fifa.wwc` should light up once the season exists) and update the tier list in `CLAUDE.md` |
| 1.8 | Decide the cadence for the tournament itself - daily during June-July 2027, weekly the rest of the time |
| 1.9 | **Repoint the fetch scripts.** They are hard-coded to the men's competition, not merely to 2026: `scripts/fetch_results.sh:42` `competitions/WC`, `:55` `soccer/fifa.world`; `scripts/preflight.sh:44` `fifa.world`, `:48` `league=1`. The women's equivalents are `fifa.wwc` and a different api-football league id |
| 1.10 | **Fix the bracket empty state before it is needed.** `bracket.html:460` writes its "bracket opens" card into `#bracket-mirror`, but `.bracket-mirror{display:none}` under the 720px query - so with no bracket data the page renders **nothing at all on a phone**. A "2027 bracket not yet drawn" state hits this immediately |
| 1.11 | Repopulate `WC.today.kits`. It is `{}` today and is the **only** colour source for `bracket.html` (`kitFor`, `:451`), so every card on the live bracket page currently renders the grey `var(--hairline-strong)` fallback. The dated snapshots taken during the tournament are unaffected |
| 1.12 | Consider a render smoke test. `validate.mjs` never executes the pages, so dropping a top-level key passes green while the live front page throws on load (`world_cup_tracker.html:426` `DATA.teams.map(...)` is unguarded). This is the single largest blind spot in the pipeline |

### Cutover design (decide before writing code in Phase 1)

The men's data must stay renderable after the pivot. Two candidate shapes:

- **(A) Keep the archive in a frozen snapshot only.** `data.js` becomes purely
  2027; the men's tournament survives as
  `/snapshots/world_cup_tracker_2026-07-22.html` and its bracket twin, linked
  from the recap block. Cheapest, and it is already true today.
- **(B) Namespace the archive inside `WC`.** e.g. `WC.archive = { "mens-2026":
  { meta, groups, bracket, teams } }`, with the live keys holding 2027. Lets the
  live page render a rich recap block from real data forever, at the cost of a
  bigger `data.js` and a validator that has to check two shapes.

**Recommendation: (A), with the recap block reading the small `WC.recap` summary
object added in Phase 0.** It keeps `data.js` and the validator single-shaped,
and the snapshots already are a perfect, self-contained archive. Revisit only if
the owner wants the full 2026 tables live on the site after the 2027 pivot.

---

## Open questions

These need an owner decision, or a fact that does not exist yet. Each weekly run
should re-check whether any has become answerable.

1. **Exact 2027 opening kickoff.** Only the tournament window (24 Jun - 25 Jul
   2027) is known. Resolved by Phase 1.1 when the schedule drops.
   *Interim answer:* count down to the start of opening day in Brazil, labelled
   as such.

2. **Should the validator's freshness checks relax for a weekly cadence?**
   `WC.meta.updated` and `WC.today.date` must currently equal the target date
   exactly, so running the validator on a non-run day reports `[FAIL]`.
   *Recommendation: do not relax it.* A 7-day tolerance would let a run silently
   skip the refresh - exactly the failure mode the check exists to catch. Pass
   the run date explicitly instead: `node scripts/validate.mjs 2026-07-30`. The
   `SessionStart` pre-flight already warns that a stale report is expected before
   a refresh. **Owner call.**

3. **Should the match-math checks relax in countdown mode?** *No, and nothing
   needs to change.* The men's tables and bracket are complete and internally
   consistent, so every table-math, bracket-resolution and advancement check
   keeps passing unchanged - they become archive-integrity checks that would
   catch accidental corruption of the frozen record. Keep them on.

4. **How to brand a site spanning two tournaments.** *Implemented in Phase 0:*
   the nav brand becomes tournament-agnostic ("World Cup Tracker"), while
   `WC.meta.tournament` still names the archived men's event (it describes the
   archived data, and that is correct) and `WC.next.tournament` names the women's
   2027 one. The validator now requires **both** to name their edition
   explicitly ("Men's" or "Women's"), which preserves the original intent of the
   old hard-coded check - the site must never be ambiguous about which edition a
   number belongs to. **Open:** does the owner want a distinct accent colour or
   visual treatment for the 2027 side of the page? Currently it reuses the
   existing gold-on-navy hero.

5. **What happens to `/today` during the interim?** *Resolved (Phase 0.5,
   2026-07-24):* `/today` is repurposed into a **"Road to 2027"** page - featured
   nations' qualifying routes, a dated qualifying calendar, and the 32-slot
   allocation - rendered from a new `WC.roadTo2027` object. The switch is a single
   field, `WC.today.mode` (`"roadmap"` now, `"games"` for live tournament play);
   `renderGames()` is left fully intact, so the live Today's Games feature returns
   with one field change. The `/today` nav label and page title on all three pages
   follow the mode automatically. See `CLAUDE.md` "The `/today` page: two modes,
   one toggle".

6. **What happens to `/bracket` during the interim?** *Keep it, unchanged.* It is
   the single best artifact of the 2026 archive and it renders complete, final
   data. Only its `<title>` and nav label pick up the "2026" qualifier.

7. **Snapshot cadence in the interim.** Weekly snapshots of an essentially
   unchanging page would add ~52 near-identical files per year on top of today's
   39 tracker + 28 bracket snapshots. **Open:** *recommendation* - keep running
   `snapshot.mjs` every run (it is idempotent for a given date and keeps the
   pipeline exercised), but revisit if `snapshots/` becomes unwieldy before
   2027. An alternative is to snapshot only when `data.js` changed materially.

8. **Should the frozen men's tracker get a stable vanity URL** such as `/2026`?
   *Not done in Phase 0, deliberately.* It would mean a second `_redirects` rule,
   and `_redirects` is the one file that can take the whole site down. The recap
   block links directly to the known-good snapshot URLs instead. **Open:** if the
   owner wants `/2026`, add `/2026 /snapshots/world_cup_tracker_2026-07-22.html
   200` in a standalone commit and verify the deploy immediately.

9. **Push notification step.** `CLAUDE.md` still describes an optional
   spoiler-free push ping. With no live matches there is nothing to spoil.
   *Recommendation:* keep the step but let the interim message simply report that
   the countdown was refreshed. **Owner call** on whether weekly pings are wanted
   at all.

---

## Archive anchors (do not break these URLs)

- Frozen men's 2026 tracker: `/snapshots/world_cup_tracker_2026-07-22.html`
- Frozen men's 2026 bracket: `/snapshots/world_cup_bracket_2026-07-22.html`
- Full dated history: `/snapshots/` (tracker from 2026-06-15, bracket from
  2026-06-26)

`2026-07-22` is the last snapshot written while the pages were still pure
men's-2026, which makes it the cleanest archive anchor. Later snapshots are
hybrid pages and are not a substitute.
