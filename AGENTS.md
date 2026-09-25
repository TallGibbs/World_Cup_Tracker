# World Cup Tracker - Routine Instructions

## Repository purpose

The site is currently a **hybrid**:

- a permanent **recap/archive of the FIFA Men's World Cup 2026** (complete -
  Spain beat Argentina 1-0 in the final at MetLife Stadium on July 19, 2026;
  England beat France 6-4 in the third-place play-off on July 18), and
- a live **countdown to the next major FIFA event**, the **Women's World Cup
  2027 in Brazil** (June 24 to July 25, 2027).

Once the 2027 draw and match schedule are published, this same pipeline pivots to
full live tracking of that tournament. **`docs/ROADMAP.md` is the phased plan and
the list of open questions - read it at the start of every run.**

All tournament data lives in one file, `data.js` (the `WC` object) - the single
source of truth. Three pages render from it:

- `world_cup_tracker.html` (served at `/`) - the front page. In hybrid mode it
  shows the 2026 recap, the frozen archive links, the final group tables, and a
  live countdown to the next tournament. It uses `WC` as its `DATA`.
- `today.html` (served at `/today`) - "Today's Games". Lists the fixtures on the
  current date with a preview and the relevant group's standings before kickoff.
  It uses `WC.today` for the day's games and derives each standings table from
  the shared `WC.groups`, so the two pages can never disagree. **Between
  tournaments it correctly renders an empty "no matches" card.**
- `bracket.html` (served at `/bracket`) - the knockout tree, rendered from
  `WC.bracket`. It currently holds the complete, final 2026 bracket.

The site is updated by a **weekly** scheduled Claude Code routine.

## Cadence: WEEKLY

The routine used to run daily, because a tournament was in progress. It is now
**weekly**: there are no live results to record until the 2027 tournament begins.
The actual trigger lives in the Claude Code web scheduler and only the repository
owner can change it; this file records the intended cadence.

**Current trigger: weekly, Mondays at ~4:50 AM** (set by the owner on
2026-07-24). So the tracker refreshes once a week, on Monday. A consequence:
`node scripts/validate.mjs` run on any other day reports a stale-date `[FAIL]` by
design (see "Validating on a non-run day" below) - that is expected between
Monday runs, not a problem.

When the 2027 tournament starts, revisit this (see `docs/ROADMAP.md` item 1.8) -
daily during June-July 2027, weekly the rest of the year.

The prompt text the scheduler fires is recorded in `docs/SCHEDULED_PROMPT.md`.
It deliberately delegates to this file rather than restating the routine, so
that changing the routine means editing `CLAUDE.md` and nothing else. If a run
ever meets a scheduler instruction that contradicts this file, **this file
wins** - follow it, and report the stale instruction in the run's notification.

## Scheduled routine: weekly tracker update

Each run of this routine must follow these steps in order:

1. Run the pre-flight `bash scripts/preflight.sh` (it also runs automatically as
   a `SessionStart` hook). It confirms the toolchain and prints a data health
   snapshot. Then read `docs/ROADMAP.md` and confirm today's date.
2. Read `data.js` as the baseline.
3. **Check whether any open question in `docs/ROADMAP.md` has become
   answerable** - above all, whether FIFA has published the 2027 draw or match
   schedule. If it has, that promotes the run from a light-touch refresh to
   Phase 1 work. Verify via the structured sources below, never via a search
   summary.
4. Update `data.js` only (the pages' layout, CSS, and JS must not change unless a
   phase of the roadmap explicitly calls for it):
   - `WC.meta.updated` - set to today's date.
   - `WC.today.date` - set to today in long form; keep `games` as `[]` and refresh
     `schedNote` while there are no fixtures.
   - `WC.next` - the countdown target. Confirm it is still correct and still in
     the future. Replace the provisional opening-day anchor with the real
     opening-match kickoff as soon as the schedule exists.
   - `WC.recap`, `WC.groups`, `WC.groupsFinal`, `WC.teams`, `WC.bracket` - these
     are the **frozen 2026 archive**. Do not edit them except to correct a
     genuine error. They are not stale; they are final.
5. **Validate.** Run `node scripts/validate.mjs`. It must print
   `ALL CHECKS PASSED` before you continue. If it prints any `[FAIL]`, fix
   `data.js` and re-run until clean - **never edit the validator to silence a
   check.** The **Validation** section below lists what it enforces.
6. Save dated, self-contained snapshots: `node scripts/snapshot.mjs`. All dated
   copies live in `snapshots/`; never write them to the repository root.
7. Commit every changed file to the development branch that is checked out at the
   start of the run, with a message such as `Update tracker for <date>`.
8. Push that branch with `git push -u origin <branch-name>`.
9. Open a pull request into `main` (reuse one if the harness already opened it),
   then merge it yourself without waiting for human review: if it is still a
   draft, mark it ready, then squash-merge into `main` using the GitHub merge
   tool with `merge_method: "squash"`. Verify the merge succeeded. Branch cleanup
   is handled by the repository's "Automatically delete head branches" setting;
   if that is off, attempt the delete but treat failure as non-fatal (the managed
   cloud git proxy returns HTTP 403 for `git push origin --delete`). **This
   self-merge is explicitly authorised.**
10. If a push-notification tool is available, send a short ping that the tracker
    has been refreshed. Between tournaments there are no results to spoil, so it
    may simply say the countdown was refreshed. If no such tool is available,
    skip this step silently and do not error.

Run every week even if nothing has changed: still set `WC.meta.updated` and
`WC.today.date` to today, run `node scripts/validate.mjs` until it prints
`ALL CHECKS PASSED`, run `node scripts/snapshot.mjs`, and commit.

### Validating on a non-run day

`validate.mjs` checks freshness against **today** by default, so on the six days
between weekly runs it will report `[FAIL]` on `WC.meta.updated` and
`WC.today.date`. That is expected and is not a bug - the check exists so a run
can never silently skip its refresh. To inspect the data on an off day, pass the
last run's date explicitly:

```
node scripts/validate.mjs 2026-07-30
```

## Branch and merge policy

Each run works on the development branch checked out at the start of the run,
pushes it, opens (or reuses) a pull request into `main`, and squash-merges that
pull request itself. The routine does not wait for human review. `main` keeps one
squashed commit per run.

## Authorisation

The routine is explicitly authorised to open a pull request and squash-merge it
into `main` itself, without human review or approval. This is intentional.

## Hosting

The tracker is hosted on **Cloudflare Pages** at
**https://worldcup.youmissedit.org/** (a subdomain of `youmissedit.org`; the apex
and `www` are unrelated and stay on Google Sites). The Pages project is connected
to this GitHub repo (`TallGibbs/World_Cup_Tracker`) with **continuous deployment
from `main`**, so the routine does not deploy anything itself: once a run's commit
lands on `main`, Cloudflare Pages rebuilds and the live site reflects it within a
minute or two.

There is no build step - Cloudflare publishes the repo root as-is. `_redirects`
contains exactly **one** rule, `/` -> `/world_cup_tracker.html` (status `200`),
because the front page is not named `index.html`. Every other clean URL (`/today`,
`/bracket`, `/snapshots/...`) is resolved natively by Pages with no rule at all.

**Do not add a `/today -> /today.html` rule** (or the `/bracket` equivalent):
Pages canonicalises `.html` back to the clean URL, so such a rule creates an
infinite redirect loop. `_redirects` is the one file that can take the whole site
down - change it only in a standalone commit, and verify the deploy immediately.

Setup and DNS details live in `docs/DEPLOY.md`.

(The site previously ran on Netlify; it was migrated because Netlify's free plan
caps usage at 300 credits/month and bills ~15 credits per production deploy, so a
once-a-day deploy cadence exhausted the free credits and paused the site.
Cloudflare Pages' free tier has no bandwidth cap and allows 500 builds/month.)

## Data sourcing

All match results and standings must come from **structured data parsed
directly** - never from a model-written summary. This section is binding; it
exists because a run once recorded a fabricated scoreline (USA 2-1 Australia)
that a search-result summary invented for a match that had not been played.

The committed helper `scripts/fetch_results.sh [YYYY-MM-DD]` fetches the day's
fixtures and prints them straight from JSON. Use it as the default entry point;
the tiers below document what it queries and how to fall back by hand.

**Note for the interim:** `fetch_results.sh` and `preflight.sh` are pinned to the
**men's** competition - `competitions/WC` and the ESPN slug `fifa.world`
(`fetch_results.sh:42,55`; `preflight.sh:44,48`, plus api-football `league=1`).
The women's equivalents (`fifa.wwc` and a different league id) must be swapped in
as part of Phase 1. Until then these scripts will correctly report no fixtures.

### Hard rules (these override convenience)

- **Never** treat an AI-generated summary as a source of fact. Specifically:
  - The `WebSearch` tool's prose answer/summary is **not** a source. Use
    `WebSearch` only to discover URLs, then go to the data itself.
  - `WebFetch` runs the page through a small model to answer your prompt, so its
    answer is also a summary. Do not mark a fixture `final` on the strength of a
    `WebFetch` answer alone. `WebFetch` is acceptable only as the Tier 4 last
    resort below, and only when the page's own factual content is unambiguous.
  - Prefer JSON endpoints you parse yourself (via `curl` + `jq` in Bash) so no
    model sits between the source and the data.
- **Completion guard for `status:"final"`.** Mark a fixture `final` only when
  BOTH hold: (a) a Tier 1-3 structured source reports the match as completed
  (status FINISHED / "post" / FT-AET-PEN), AND (b) its scheduled kickoff is at
  least ~2.5 hours before the real current time. If kickoff has not yet passed,
  the fixture stays `upcoming` no matter what any source claims.
- **Cross-check before recording.** A result is only recorded when at least one
  structured source confirms it; if you must fall back to Tier 4, require two
  independent sources to agree on the same scoreline before writing it.
- After building standings, re-verify every group's goal differences sum to zero
  (a fabricated or mis-keyed result usually breaks this).

### Schedule and fixture facts (not results)

Tournament *dates* - an opening day, a draw date, a venue list - are not match
results, and before a tournament exists no Tier 1-3 sports API carries them. For
these, and **only** these, structured reference data is acceptable: prefer
machine-readable endpoints such as **Wikidata**
(`https://www.wikidata.org/wiki/Special:EntityData/<QID>.json`, reading the actual
`P580`/`P582` claims rather than any prose), cross-checked against a second
independent source. Record what you used in the relevant `source` field, and
label anything provisional as provisional. This is how `WC.next.iso` was set; see
`docs/ROADMAP.md`. **This exemption never extends to scores, results, or
standings.**

### Tiered source order (work top-down; stop at the first that yields the data)

1. **football-data.org (structured JSON, official-grade).** Use when the
   `FOOTBALL_DATA_API_KEY` environment variable is set. Parse JSON directly:
   ```
   curl -s -H "X-Auth-Token: $FOOTBALL_DATA_API_KEY" \
     "https://api.football-data.org/v4/competitions/WC/matches?dateFrom=YYYY-MM-DD&dateTo=YYYY-MM-DD"
   curl -s -H "X-Auth-Token: $FOOTBALL_DATA_API_KEY" \
     "https://api.football-data.org/v4/competitions/WC/standings"
   ```
   Only `status == "FINISHED"` counts as played; read `score.fullTime.home/away`.
2. **ESPN site API (structured JSON, no auth).** Reliable fallback needing no
   key - confirmed reachable and parseable from the run environment:
   ```
   curl -s "https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=YYYYMMDD"
   ```
   Read `events[].competitions[].status.type.state`: only `"post"` with
   `completed:true` counts; scores are in `competitors[].score`. (Use `fifa.wwc`
   for the women's tournament - as of 2026-07-23 its latest season is still 2023,
   so it carries nothing for 2027 yet.)
3. **api-football.com (structured JSON, RapidAPI/API-Sports).** Use when the
   `API_FOOTBALL_KEY` environment variable is set:
   ```
   curl -s -H "x-apisports-key: $API_FOOTBALL_KEY" \
     "https://v3.football.api-sports.io/fixtures?league=1&season=2026&date=YYYY-MM-DD"
   ```
   Only `fixture.status.short` in `FT`/`AET`/`PEN` counts as played.
4. **Direct page fetch (last resort).** Only if Tiers 1-3 are all unavailable.
   Fetch an authoritative results page (FIFA.com, ESPN scoreboard, official
   confederation pages) and read the page's own factual scoreline - not a
   model's paraphrase. Apply the completion guard and the two-source cross-check
   above before recording anything.

If no source confirms a match has finished, leave that fixture `upcoming` and its
group at the prior matchday's standings, then still complete the rest of the run
(refresh `meta.updated`, save the dated snapshot, commit). A stale-but-true file
is always preferable to a fresh-but-invented one.

Note on environment: as of this writing neither `FOOTBALL_DATA_API_KEY` nor
`API_FOOTBALL_KEY` is set in the run environment, so Tier 2 (ESPN, no auth) is
the active primary source.

Source-outage warning (observed 2026-06-27): the session's egress policy can block
the sports-data hosts. When that happens every tier returns a gateway
`403`/`connect_rejected` (check `curl -sS "$HTTPS_PROXY/__agentproxy/status"`), and
with no API key set the routine has **no permitted structured source at all**.
`scripts/preflight.sh` probes reachability and prints a `BLOCKED`/`WARNING` banner
so this can never be silent. If you see it: do **not** fill results or bracket
slots from a web search or any AI summary (that is the exact prohibited path).
Hold the data stale, still refresh `meta.updated`/`WC.today`, note the outage in
the run, and restore a source (set an API key, or have the egress allowlist
re-opened for `site.api.espn.com` / `api.football-data.org` /
`v3.football.api-sports.io`) before recording any new result.

## Data rules

- `WC.meta.updated` must be set to today's date (e.g. "July 30, 2026").
- `WC.today.date` must be set to today in long form (e.g. "Thursday, July 30, 2026").
- Every group's goal differences must sum to zero before committing.
- No placeholder values may remain in `data.js` (including the literal "TBD" -
  the validator rejects it).
- Do not use emojis anywhere in `data.js` or the pages.
- Do not change the visual design or the controls. The countdown *mechanism*
  (`tickCountdown`) must not be rewritten - retarget it through data
  (`WC.next.iso`) instead.
- **A tournament name must always say which edition it is.** `WC.meta.tournament`
  and `WC.next.tournament` must each contain "Men's" or "Women's". The site now
  spans two editions, so an unqualified "FIFA World Cup 2027" is ambiguous about
  whose numbers are on screen. The validator enforces this. (This replaces the
  old rule that the site must always say "Men's".)
- `WC.meta` describes the **archived** tournament; `WC.next` describes the one
  being counted down to. Keep them straight.
- Before committing, `node scripts/validate.mjs` must print `ALL CHECKS PASSED`.

## Validation (`scripts/validate.mjs`)

`scripts/validate.mjs` is the mechanical gate for every run. It reads the `WC`
object from `data.js` and exits non-zero if anything is off. Run it after editing
the data and before committing:

```
node scripts/validate.mjs            # checks today's date in Eastern Time
node scripts/validate.mjs 2026-07-30 # or check a specific date
```

It must print `ALL CHECKS PASSED`. What it enforces:

- **Table math, per group:** exactly four teams, goal differences sum to zero,
  `pld = w + d + l`, `pts = 3*w + d`, `gd = gf - ga`, total wins equal total
  losses, draws and matches-played are even, and no negative values. Against the
  frozen 2026 tables these are archive-integrity checks - they would catch
  accidental corruption of the final record, so they stay on.
- **Freshness:** `WC.meta.updated` and `WC.today.date` are the target date, and
  every `WC.today.games[].iso` is dated that day. This is the check that catches
  a Today's Games list that was not refreshed.
- **Fixtures:** each featured `final` fixture carries integer scores; each
  `upcoming` fixture carries a `preview` of at least two forward-looking bullets;
  every `WC.today.games[]` entry has all its fields plus at least two `bullets`,
  and its two teams appear in that group's table.
- **Countdown target (`WC.next`, when present):** every field is populated, the
  tournament name states its edition, there are at least two bullets, and `iso`
  parses, **is a real calendar date** (V8 silently rolls "2027-06-31" over to
  July 1, which would shift the countdown by a day without any error), and **is
  still in the future** (a target in the past would send `tickCountdown` into a
  re-render loop).
- **Recap (`WC.recap`, when present):** required fields are populated, every
  podium team is a real team from a group table, every `ourTeams` entry names one
  of `WC.teams`, and **every archive `href` resolves to a file that actually
  exists in the repository** - this is what stops a dead link to a frozen
  snapshot.
- **`/today` mode (`WC.today.mode`, `WC.roadTo2027`):** `mode` must be `"games"`
  or `"roadmap"`; `"roadmap"` requires `WC.roadTo2027`, whose `heading`/`intro`/
  `source` must be populated, with a `timeline` of >=2 entries and a non-empty
  `featured` array.
- **Hygiene:** every tournament name states its edition, and there are no emojis
  or placeholder tokens in the data.
- **Bracket resolution (gated on `WC.bracket`):** round sizes, integer scores,
  penalties only on level scores, winner/score agreement, advancement into the
  exact `feedsInto`/`feedsSide` slot, no team twice in a round, and the
  resolution gate that forces a knockout slot to be filled the moment its feeder
  is decided - a `Winner/Runner-up Group X` slot as soon as that group is
  complete, and the best-third-placed slots once all twelve groups are complete.
  This is the check that catches a knowable opponent left as a placeholder.

Cross-page agreement needs no check: both pages render from the same `WC.groups`,
so their standings cannot disagree.

If a check fails, fix `data.js` - **never weaken the validator to go green.** The
one legitimate reason to edit it is when the *data model itself* changes (as in
the Phase 0 pivot, when the hard-coded "Men's" check became an
edition-must-be-explicit check, and `WC.next`/`WC.recap` gained checks of their
own). Record any such change in `docs/ROADMAP.md`.

**Known gap:** the validator never executes the pages, so removing a top-level key
that a page dereferences unguarded (e.g. `WC.teams` at
`world_cup_tracker.html:426`) passes green while the live front page throws on
load. See `docs/ROADMAP.md` item 1.12.

At the very start of each run, also run the pre-flight `bash scripts/preflight.sh`.
It confirms the toolchain (node, jq, curl) is present and prints a data health
snapshot via the validator. It is registered as a `SessionStart` hook in
`.claude/settings.json`, so it runs automatically at the start of every Claude
Code session on this repo.

## Hero "Next up" card

The hero's card is the site's live element. It has two modes, chosen
automatically by `pickHero()`:

- **During a tournament** - it shows the chronologically next featured fixture
  with `status:"upcoming"`, counts down to that fixture's `date`, and renders the
  relevant group's standings plus a **What to watch** list built from the
  fixture's `preview` array.
- **Between tournaments** - when no featured fixture is `upcoming`, it counts
  down to `WC.next.iso` instead and renders `WC.next.bullets`. **This is the
  current mode.** The countdown function itself (`tickCountdown`) is shared and
  unchanged between the two.

`preview` must be **forward-looking - never a recap of a game already played**.
Add it to every fixture with `status:"upcoming"`; finished fixtures do not need
one. Example:

```js
{opp:"Australia", when:"Fri Jun 19, 3:00 PM ET", date:"2026-06-19T15:00:00-04:00",
 venue:"Lumen Field, Seattle", tv:"FOX", status:"upcoming",
 preview:[
   "A win sends the USA into the Round of 32 with a match to spare.",
   "Both teams won their openers, so first place in Group D is on the line."
 ]}
```

Write 2-3 concise bullets about what is **still to come**: what a result would
mean (qualification or seeding math), team form heading in, and confirmed
availability news for *that upcoming* match. Phrase everything in the future
tense. Do NOT restate the score, scorers, or events of a previous game in
`preview`. Past-game recaps belong only in `WC.teams[].note` (shown on the team
cards lower down), which is a separate, backward-looking field. Keep the two
distinct: `note` = what just happened to the team; `preview` = what to watch in
the next fixture.

## The `/today` page: two modes, one toggle

`today.html` has two renderers, chosen by a single field, **`WC.today.mode`**:

- **`"games"`** (or the field absent) - the live **Today's Games** feature:
  every match on the current date, with previews and standings. This is the
  tournament-time behaviour, described below.
- **`"roadmap"`** - the between-tournaments **Road to 2027** page, rendered from
  `WC.roadTo2027` (featured nations' qualifying routes, a qualifying calendar,
  and the slot allocation). **This is the current mode.**

`renderGames()` and `renderRoadmap()` both live in `today.html` and neither
touches the other's markup, so **flipping `WC.today.mode` is the only change
needed to switch** - no code edit. The `/today` nav label on all three pages and
the page `<title>` follow the mode automatically (they read `WC.today.mode`, with
a static "Today's Games" fallback).

**To bring the live Today's Games feature back when the 2027 tournament starts:**
set `WC.today.mode` to `"games"` (or remove the field) and populate
`WC.today.games` / `date` / `stageLabel` / `schedNote` / `kits` as below. You may
leave `WC.roadTo2027` in place (dormant) or delete it. Nothing else changes.

While in `"roadmap"` mode, keep `WC.roadTo2027` current each run: refresh the
qualifying calendar as windows pass, and once a featured nation's fate is known
from a structured source (ESPN carries the UEFA qualifiers as `fifa.wworldq.uefa`
and the `concacaf.womens.championship`), update its `featured` entry. Still
refresh `WC.today.date` to today every run - the freshness check applies in both
modes.

### Today's Games mode (`WC.today`)

`today.html` lists every match being played on the **current date** and must be
refreshed each run so it never shows a past day's fixtures. Edit the `WC.today`
object in `data.js`; the page layout, CSS, and JS stay identical.

- `date` - long form of today, e.g. "Thursday, July 30, 2026".
- `stageLabel` - the tournament stage, or "Between tournaments".
- `schedNote` - one line summarising the day.
- `tz` - the standing Eastern-Time/broadcast note.
- `kits` - a hex colour for each team appearing today (used for the colour bars).
  **Note:** this map is also the only colour source for `bracket.html`, so while
  it is empty every bracket card renders the grey fallback (see
  `docs/ROADMAP.md` item 1.11).
- `games[]` - one entry per match kicking off today, in time order. Each has
  `group`, `stage`, `home`, `away`, `kick` (ET label), `iso` (ISO time with the
  ET offset - drives the live/next-up badge), `venue`, `tv`, `stream`, and a
  `bullets` array of 2-3 forward-looking notes.

The standings mini-table under each game is derived automatically from
`WC.groups` (the group the match belongs to), so there is **no** separate
standings copy to maintain on this page. The `updated` line reuses
`WC.meta.updated`.

If no matches are scheduled on the current date, set `WC.today.games` to an empty
array (the page renders a tidy "no matches today" card) and still refresh `date`
and `schedNote`. **That is the current, correct state.**

## Knockout bracket (`WC.bracket`)

`bracket.html` renders the knockout tree from `WC.bracket`. Each match slot has a
descriptor (`home`/`away`, e.g. `"Winner Group D"`) and a resolved team
(`homeTeam`/`awayTeam`, `null` until known), plus `status`, `hs`/`as`/`pens`/
`winner`, and `feedsInto`/`feedsSide` linking it to the next round.

**Current state: an empty, pre-draw 2027 women's bracket.** `WC.bracket` now
holds the 32-team knockout shape (Round of 16 -> Quarter-finals -> Semi-finals ->
Final, plus the third-place play-off) with `"pending": true`. Every slot is a
group descriptor with `homeTeam`/`awayTeam` `null`, every match `upcoming`, and no
`iso`/`venue`/`tv` (the draw is December 2026 and the schedule is unpublished).
While a bracket is `pending` the validator relaxes the per-match schedule
requirement but still enforces the tree structure, the wiring, and that every slot
is empty. `bracket.html`'s desktop tree renderer derives its columns from whichever
rounds are present, so it draws this Round-of-16-first tree as well as a men's
Round-of-32 tree - no renderer change is needed to switch formats. The hero note is
read from `WC.bracket.note`. The finished **men's 2026 bracket is preserved in the
dated snapshots** (`snapshots/world_cup_bracket_2026-07-22.html`, linked from the
recap); do not resurrect it into live `data.js`.

**When the December 2026 draw and schedule land (Phase 1):** set `pending:false`,
resolve each group descriptor into the drawn team, and add each match's real
`iso`/`venue`/`tv`. Then the instructions below (written for the men's run) apply
again - with the women's round keys (`r16` is the first round; there is no `r32`,
and no best-third-placed slots, since only the top two of each group advance):

- **Resolve every slot whose feeder is now decided** (and only from the same
  structured tier sources used for the tracker - never from a web/AI summary):
  - A `Winner Group X` / `Runner-up Group X` slot: fill it the moment Group X is
    complete (all four teams have played 3).
  - A knockout-fed slot (`Winner R16-1`, ...): fill it with the feeding match's
    `winner` the moment that match is `final`.
- **Record finished knockout matches:** set `status:"final"`, integer `hs`/`as`,
  `winner`, and (only when the 90/120-minute score was level) a `pens` string
  like `"4-3"`. The same completion guard as group games applies. Then make sure
  the winner is keyed into its `feedsInto` slot.
- Update `WC.bracket.source` to name the structured source and retrieval date.

`node scripts/validate.mjs` enforces this mechanically: it fails if a slot whose
group is complete is empty or wrong, and it checks the winner/score/penalty/
advancement math. A knowable opponent left blank will not pass silently.
