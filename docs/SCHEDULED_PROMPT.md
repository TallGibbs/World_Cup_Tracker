# The scheduled prompt

This file records the **prompt text that invokes the weekly tracker routine**,
so that the instruction which actually starts each run is version controlled
alongside the code it drives.

The prompt itself lives in the **Claude Code web scheduler**, not in this
repository. Only the repository owner can change it. This file is the
authoritative copy of what it *should* say; if the two ever drift apart, the
scheduler is what runs and this file is what was intended - see "When they
drift" below.

**Current trigger: weekly, Mondays at ~4:50 AM.** Updated by the owner on
2026-07-27.

---

## The prompt

```
Run the weekly World Cup Tracker update for this repository.

CLAUDE.md in the repository root is the authoritative, up-to-date specification
of this routine. Read it at the start of every run and follow it exactly. Where
anything in this prompt disagrees with CLAUDE.md, CLAUDE.md wins - it is version
controlled alongside the code and this prompt is not. Do not ask me to resolve
such a conflict; just follow CLAUDE.md and mention the discrepancy in your
notification so I can fix this prompt.

Context: the site is a hybrid - a frozen archive of the FIFA Men's World Cup
2026 plus a live countdown to the FIFA Women's World Cup 2027 in Brazil. It runs
weekly, not daily. All tournament data lives in data.js (the WC object); the
three pages render from it. docs/ROADMAP.md is the phased plan and the list of
open questions.

Each run, in order:

1. Run "bash scripts/preflight.sh", read docs/ROADMAP.md, and confirm today's
   actual date. Use the real current date as "today" throughout.
2. Read data.js as your baseline.
3. Check whether any open question in docs/ROADMAP.md has become answerable -
   above all, whether FIFA has published the 2027 draw or match schedule. If it
   has, this run is promoted from a light-touch refresh to the Phase 1 work
   described in the roadmap. Verify via the structured sources named in
   CLAUDE.md, never via a search summary.
4. Update data.js only. Do not change page layout, CSS, or JS unless a roadmap
   phase explicitly calls for it. At minimum refresh WC.meta.updated and
   WC.today.date to today, keep WC.next correct and still in the future, and
   keep WC.roadTo2027 current as qualifying windows pass. The 2026 archive
   (WC.recap, WC.groups, WC.groupsFinal, WC.teams, WC.bracket) is frozen -
   change it only to correct a genuine error.
5. Obey the Data sourcing section of CLAUDE.md without exception. Every result
   must come from structured data you parsed yourself. An AI-written summary -
   including the WebSearch answer and the WebFetch answer - is never a source of
   fact. If no permitted source is reachable, hold the data stale, say so, and
   still complete the rest of the run. A stale-but-true file always beats a
   fresh-but-invented one.
6. Run "node scripts/validate.mjs". It must print ALL CHECKS PASSED before you
   continue. If it fails, fix data.js and re-run. Never edit the validator to
   silence a check.
7. Run "node scripts/snapshot.mjs" to write the dated snapshots into snapshots/.
   Never write dated copies to the repository root.
8. Commit every changed file to the development branch checked out at the start
   of the run, with a message like "Update tracker for <date>". Push it with
   "git push -u origin <branch-name>".
9. Open a pull request into main, or reuse one the harness already opened. Then
   merge it yourself without waiting for review: mark it ready if it is a draft,
   then squash-merge into main. Verify the merge succeeded. This self-merge is
   explicitly authorised. Merging to main is the deploy - Cloudflare Pages
   rebuilds from main automatically.
10. Send a short push notification reporting what changed. If nothing material
    changed, say the countdown was refreshed. Flag anything that needs me
    personally - a blocked data source, a stale instruction, an owner decision
    waiting in the roadmap. If no notification tool is available, skip this step
    silently.

Run every week even when nothing has changed: still refresh the dates, still
validate, still snapshot, still commit.
```

---

## Why the prompt is thin

The prompt deliberately **delegates to `CLAUDE.md` instead of restating it**.
That is the whole design, and it is a direct response to how the previous prompt
failed (below).

A scheduler prompt is the one instruction in this system that **cannot be
updated by a run**. Anything it hard-codes - a filename, a branch, a cadence, a
tournament - is frozen at the moment it was written, while the repository keeps
moving. So the prompt carries only what the scheduler alone can supply (start
the run, which repo, how often) and points at in-repo documents for everything
that might change:

| Concern | Lives in |
|---|---|
| What the routine does, step by step | `CLAUDE.md` |
| What phase the project is in, and what is still open | `docs/ROADMAP.md` |
| Which data sources are permitted, and in what order | `CLAUDE.md` (Data sourcing) |
| What "valid" means | `scripts/validate.mjs` |
| How the site is served and deployed | `docs/DEPLOY.md` |

Three things the prompt notably does **not** name:

- **A target file.** It says `data.js`, the single source of truth, and leaves
  the page mechanics to the scripts. The old prompt named
  `world_cup_tracker.html` and became wrong the moment the data was extracted
  into `data.js`.
- **A branch.** The harness checks out a development branch per run, so the
  prompt says "the development branch checked out at the start of the run". The
  old prompt hard-coded `main`.
- **A tournament state.** It says "the 2026 archive is frozen" and defers the
  2027 cutover to the roadmap phases, so the pivot needs no scheduler edit.

## When they drift

The prompt's second paragraph is a **conflict-resolution rule**, and it matters
more than it looks:

> Where anything in this prompt disagrees with CLAUDE.md, CLAUDE.md wins [...]
> Do not ask me to resolve such a conflict; just follow CLAUDE.md and mention
> the discrepancy in your notification so I can fix this prompt.

Without it, a run that meets a stale instruction has only bad options: follow it
and corrupt the repository, or stop and wait for an owner who is asleep - the
routine fires at ~4:50 AM precisely because nobody is watching. With it, drift
degrades safely: the run does the right thing and reports the stale text, and
the owner fixes the prompt at leisure.

**If you change the routine, change `CLAUDE.md` first.** The prompt should only
need editing when the *scheduling* changes - a different cadence, a different
repository, a different notification policy.

## History

- **Until 2026-07-27** the scheduler still held the original **daily 2026**
  prompt, written when the men's tournament was live. By July it instructed each
  run to edit `world_cup_tracker.html` directly, write a dated copy
  (`world_cup_tracker_YYYY-MM-DD.html`) to the **repository root**, push
  **straight to `main` with no pull request**, and treat the men's group tables
  as live data to be refreshed. Every one of those had been superseded: by
  `data.js`, by `scripts/snapshot.mjs` writing into `snapshots/`, by the
  branch-and-self-merge policy, and by the Phase 0 pivot that froze the 2026
  archive.

  The runs had been quietly resolving that conflict in favour of `CLAUDE.md`
  each week and flagging it in their notifications. The 2026-07-27 run flagged
  it again with the full list of divergences.

- **2026-07-27** the owner replaced the scheduler prompt with the text above,
  and this file was added so the next drift is visible in the diff rather than
  only in a notification.
