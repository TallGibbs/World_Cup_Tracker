/*
 * data.js - the single source of truth for the World Cup tracker.
 *
 * The site is currently a HYBRID: a frozen recap/archive of the Men's World Cup
 * 2026 (complete - Spain beat Argentina 1-0 in the final on July 19, 2026) plus
 * a live countdown to the next major FIFA event, the Women's World Cup 2027 in
 * Brazil. See docs/ROADMAP.md for the phased plan.
 *
 * All three pages load this file (as a classic <script>, before their render
 * script), so the tournament data lives in exactly ONE place:
 *   - world_cup_tracker.html uses WC as its DATA (meta, recap, next, teams, groups)
 *   - today.html uses WC.today for the day's games and derives each game's
 *     standings table from the shared WC.groups - there is no second copy.
 *   - bracket.html renders WC.bracket.
 *
 * The weekly routine edits ONLY this file's data. After editing, run
 * "node scripts/validate.mjs" (must pass) and "node scripts/snapshot.mjs".
 * See AGENTS.md.
 *
 * Shape:
 *   meta        - tournament/meta strings for the ARCHIVED tournament, incl.
 *                 updated (the run date)
 *   next        - the forward-looking countdown target (Women's WC 2027)
 *   recap       - how the archived tournament finished, plus archive links
 *   teams       - featured teams (USA, Netherlands, England) + their fixtures
 *   groups      - all 12 groups with standings rows (GD must sum to zero per group)
 *   groupsFinal - the frozen final group tables
 *   today       - the Today's Games page: date, stageLabel, tz, schedNote, kits, games
 *   bracket     - the knockout tree
 */
const WC = {
  "meta": {
    "tournament": "FIFA Men's World Cup 2026",
    "host": "Hosted across the USA, Canada and Mexico",
    "stage": "Champions",
    "phase": "final",
    "where": "Spain are the FIFA World Cup 2026 champions, beating holders Argentina 1-0 in the final at MetLife Stadium, New Jersey, on Jul 19. England took third place, beating France 6-4 in the play-off in Miami Gardens on Jul 18. The tournament is complete.",
    "standNote": "Final group tables - all 12 groups. Our teams' groups are pinned to the top.",
    "updated": "September 21, 2026"
  },
  "next": {
    "tournament": "FIFA Women's World Cup 2027",
    "label": "Counting down to",
    "eventLabel": "Opening day",
    "iso": "2027-06-24T00:00:00-03:00",
    "when": "Thursday, June 24, 2027",
    "window": "June 24 to July 25, 2027",
    "venue": "Eight host cities across Brazil",
    "note": "The match schedule and kickoff times are not published yet, so this counts down to the start of opening day in Brazil, not to a kickoff. It will be repointed at the real opening match once FIFA publishes the schedule.",
    "bullets": [
      "Thirty-two teams, the second and last edition at that size before the tournament expands to forty-eight in 2031.",
      "Eight host cities - Belo Horizonte, Brasilia, Fortaleza, Porto Alegre, Recife, Rio de Janeiro, Salvador and Sao Paulo - all of them 2014 World Cup venues.",
      "Spain arrive as holders, having won their first women's title in 2023.",
      "Group tables, matchday pages and a knockout bracket return to this site once the draw is made."
    ],
    "source": "Wikidata Q64979822 (P580 start time 2027-06-24, P582 end time 2027-07-25, P17 country Brazil), cross-checked against the Wikipedia infobox for the 2027 FIFA Women's World Cup (dates 24 June to 25 July, 32 teams, 8 venues). Retrieved 2026-07-23 and re-checked 2026-09-21 with the claims unchanged. ESPN's fifa.wwc API still reports 2023 as its latest season and returns nothing for June 2027, so as of 2026-09-21 no Tier 1-3 structured source carries the 2027 match schedule yet."
  },
  "recap": {
    "headline": "Spain are world champions",
    "line": "Forty-eight teams, twelve groups and one hundred and four matches across the USA, Canada and Mexico. Spain won it, Argentina fell one game short of retaining it, and England came home with bronze.",
    "podium": [
      {
        "place": "Champions",
        "team": "Spain",
        "detail": "Beat Argentina 1-0 in the final at MetLife Stadium, East Rutherford, on July 19."
      },
      {
        "place": "Runners-up",
        "team": "Argentina",
        "detail": "The holders reached a second straight final, beating England 2-1 in the semi-final in Atlanta."
      },
      {
        "place": "Third",
        "team": "England",
        "detail": "Beat France 6-4 in the third-place play-off in Miami Gardens on July 18."
      },
      {
        "place": "Fourth",
        "team": "France",
        "detail": "Won Group I with a perfect nine points, then lost 2-0 to Spain in the semi-final in Arlington."
      }
    ],
    "ourTeams": [
      {
        "team": "USA",
        "finish": "Round of 16",
        "detail": "Topped Group D and beat Bosnia and Herzegovina 2-0 in the Round of 32, before Belgium won 4-1 in Seattle."
      },
      {
        "team": "Netherlands",
        "finish": "Round of 32",
        "detail": "Won Group F on seven points, then drew 1-1 with Morocco and went out 3-2 on penalties in Guadalupe."
      },
      {
        "team": "England",
        "finish": "Third place",
        "detail": "Won Group L, knocked out Mexico and Norway, lost the semi-final to Argentina, then took bronze from France."
      }
    ],
    "archive": [
      {
        "label": "Frozen 2026 tracker",
        "href": "/snapshots/world_cup_tracker_2026-07-22.html",
        "detail": "The matchday companion exactly as it stood at the end of the tournament."
      },
      {
        "label": "Frozen 2026 bracket",
        "href": "/snapshots/world_cup_bracket_2026-07-22.html",
        "detail": "The complete knockout tree, Round of 32 through the final."
      }
    ],
    "source": "Built from this file's own groupsFinal and bracket, both recorded from structured sources during the tournament."
  },
  "teams": [
    {
      "name": "USA",
      "group": "D",
      "kit": "linear-gradient(90deg,var(--usa-a),var(--usa-b))",
      "fixtures": [
        {
          "opp": "Paraguay",
          "when": "Fri Jun 12, 9:00 PM ET",
          "date": "2026-06-12T21:00:00-04:00",
          "venue": "SoFi Stadium, Los Angeles",
          "tv": "FOX",
          "status": "final",
          "us": 4,
          "them": 1
        },
        {
          "opp": "Australia",
          "when": "Fri Jun 19, 3:00 PM ET",
          "date": "2026-06-19T15:00:00-04:00",
          "venue": "Lumen Field, Seattle",
          "tv": "FOX",
          "status": "final",
          "us": 2,
          "them": 0
        },
        {
          "opp": "Turkiye",
          "when": "Thu Jun 25, 10:00 PM ET",
          "date": "2026-06-25T22:00:00-04:00",
          "venue": "SoFi Stadium, Los Angeles",
          "tv": "FOX",
          "status": "final",
          "us": 2,
          "them": 3
        },
        {
          "opp": "Bosnia and Herzegovina",
          "when": "Wed Jul 1, 8:00 PM ET",
          "date": "2026-07-01T20:00:00-04:00",
          "venue": "Levi's Stadium, Santa Clara",
          "tv": "FOX",
          "status": "final",
          "us": 2,
          "them": 0
        },
        {
          "opp": "Belgium",
          "when": "Mon Jul 6, 8:00 PM ET",
          "date": "2026-07-06T20:00:00-04:00",
          "venue": "Lumen Field, Seattle",
          "tv": "FOX",
          "status": "final",
          "us": 1,
          "them": 4
        }
      ],
      "note": "The USA are out. After topping Group D and beating Bosnia and Herzegovina in the Round of 32, the hosts were beaten 4-1 by Belgium in the Round of 16 at Lumen Field, ending their run in the last 16."
    },
    {
      "name": "Netherlands",
      "group": "F",
      "kit": "var(--ned-a)",
      "fixtures": [
        {
          "opp": "Japan",
          "when": "Sun Jun 14, 4:00 PM ET",
          "date": "2026-06-14T16:00:00-04:00",
          "venue": "AT&T Stadium, Arlington",
          "tv": "FOX",
          "status": "final",
          "us": 2,
          "them": 2
        },
        {
          "opp": "Sweden",
          "when": "Sat Jun 20, 1:00 PM ET",
          "date": "2026-06-20T13:00:00-04:00",
          "venue": "NRG Stadium, Houston",
          "tv": "FOX",
          "status": "final",
          "us": 5,
          "them": 1
        },
        {
          "opp": "Tunisia",
          "when": "Thu Jun 25, 7:00 PM ET",
          "date": "2026-06-25T19:00:00-04:00",
          "venue": "Arrowhead Stadium, Kansas City",
          "tv": "FS1",
          "status": "final",
          "us": 3,
          "them": 1
        },
        {
          "opp": "Morocco",
          "when": "Mon Jun 29, 9:00 PM ET",
          "date": "2026-06-29T21:00:00-04:00",
          "venue": "Estadio BBVA, Guadalupe",
          "tv": "FOX",
          "status": "final",
          "us": 1,
          "them": 1
        }
      ],
      "note": "The Netherlands are out. After a 1-1 draw with Morocco in the Round of 32, the Dutch lost 3-2 on penalties at Estadio BBVA and are eliminated. Their tournament ends after topping Group F on seven points."
    },
    {
      "name": "England",
      "group": "L",
      "kit": "linear-gradient(90deg,var(--eng-a),var(--eng-b))",
      "fixtures": [
        {
          "opp": "Croatia",
          "when": "Wed Jun 17, 4:00 PM ET",
          "date": "2026-06-17T16:00:00-04:00",
          "venue": "AT&T Stadium, Arlington",
          "tv": "FOX / ITV1",
          "status": "final",
          "us": 4,
          "them": 2
        },
        {
          "opp": "Ghana",
          "when": "Tue Jun 23, 4:00 PM ET",
          "date": "2026-06-23T16:00:00-04:00",
          "venue": "Gillette Stadium, Foxborough",
          "tv": "FOX / BBC One",
          "status": "final",
          "us": 0,
          "them": 0
        },
        {
          "opp": "Panama",
          "when": "Sat Jun 27, 5:00 PM ET",
          "date": "2026-06-27T17:00:00-04:00",
          "venue": "MetLife Stadium, East Rutherford",
          "tv": "FOX / ITV1",
          "status": "final",
          "us": 2,
          "them": 0
        },
        {
          "opp": "DR Congo",
          "when": "Wed Jul 1, 12:00 PM ET",
          "date": "2026-07-01T12:00:00-04:00",
          "venue": "Mercedes-Benz Stadium, Atlanta",
          "tv": "FOX / ITV1",
          "status": "final",
          "us": 2,
          "them": 1
        },
        {
          "opp": "Mexico",
          "when": "Sun Jul 5, 8:00 PM ET",
          "date": "2026-07-05T20:00:00-04:00",
          "venue": "Estadio Banorte, Mexico City",
          "tv": "FOX / ITV1",
          "status": "final",
          "us": 3,
          "them": 2
        },
        {
          "opp": "Norway",
          "when": "Sat Jul 11, 5:00 PM ET",
          "date": "2026-07-11T17:00:00-04:00",
          "venue": "Hard Rock Stadium, Miami Gardens",
          "tv": "FOX / ITV1",
          "status": "final",
          "us": 2,
          "them": 1
        },
        {
          "opp": "Argentina",
          "when": "Wed Jul 15, 3:00 PM ET",
          "date": "2026-07-15T15:00:00-04:00",
          "venue": "Mercedes-Benz Stadium, Atlanta",
          "tv": "FOX / ITV1",
          "status": "final",
          "us": 1,
          "them": 2
        },
        {
          "opp": "France",
          "when": "Sat Jul 18, 5:00 PM ET",
          "date": "2026-07-18T17:00:00-04:00",
          "venue": "Hard Rock Stadium, Miami Gardens",
          "tv": "FOX / ITV1",
          "status": "final",
          "us": 6,
          "them": 4
        }
      ],
      "note": "England finished third. After losing the semi-final 2-1 to holders Argentina, Tuchel's side beat France 6-4 in the third-place play-off in Miami Gardens on July 18 to take the bronze medals."
    }
  ],
  "groups": [
    {
      "id": "A",
      "started": true,
      "rows": [
        {
          "team": "Mexico",
          "pld": 3,
          "w": 3,
          "d": 0,
          "l": 0,
          "gf": 6,
          "ga": 0,
          "gd": 6,
          "pts": 9
        },
        {
          "team": "South Africa",
          "pld": 3,
          "w": 1,
          "d": 1,
          "l": 1,
          "gf": 2,
          "ga": 3,
          "gd": -1,
          "pts": 4
        },
        {
          "team": "South Korea",
          "pld": 3,
          "w": 1,
          "d": 0,
          "l": 2,
          "gf": 2,
          "ga": 3,
          "gd": -1,
          "pts": 3
        },
        {
          "team": "Czechia",
          "pld": 3,
          "w": 0,
          "d": 1,
          "l": 2,
          "gf": 2,
          "ga": 6,
          "gd": -4,
          "pts": 1
        }
      ]
    },
    {
      "id": "B",
      "started": true,
      "rows": [
        {
          "team": "Switzerland",
          "pld": 3,
          "w": 2,
          "d": 1,
          "l": 0,
          "gf": 7,
          "ga": 3,
          "gd": 4,
          "pts": 7
        },
        {
          "team": "Canada",
          "pld": 3,
          "w": 1,
          "d": 1,
          "l": 1,
          "gf": 8,
          "ga": 3,
          "gd": 5,
          "pts": 4
        },
        {
          "team": "Bosnia and Herzegovina",
          "pld": 3,
          "w": 1,
          "d": 1,
          "l": 1,
          "gf": 5,
          "ga": 6,
          "gd": -1,
          "pts": 4
        },
        {
          "team": "Qatar",
          "pld": 3,
          "w": 0,
          "d": 1,
          "l": 2,
          "gf": 2,
          "ga": 10,
          "gd": -8,
          "pts": 1
        }
      ]
    },
    {
      "id": "C",
      "started": true,
      "rows": [
        {
          "team": "Brazil",
          "pld": 3,
          "w": 2,
          "d": 1,
          "l": 0,
          "gf": 7,
          "ga": 1,
          "gd": 6,
          "pts": 7
        },
        {
          "team": "Morocco",
          "pld": 3,
          "w": 2,
          "d": 1,
          "l": 0,
          "gf": 6,
          "ga": 3,
          "gd": 3,
          "pts": 7
        },
        {
          "team": "Scotland",
          "pld": 3,
          "w": 1,
          "d": 0,
          "l": 2,
          "gf": 1,
          "ga": 4,
          "gd": -3,
          "pts": 3
        },
        {
          "team": "Haiti",
          "pld": 3,
          "w": 0,
          "d": 0,
          "l": 3,
          "gf": 2,
          "ga": 8,
          "gd": -6,
          "pts": 0
        }
      ]
    },
    {
      "id": "D",
      "started": true,
      "rows": [
        {
          "team": "USA",
          "pld": 3,
          "w": 2,
          "d": 0,
          "l": 1,
          "gf": 8,
          "ga": 4,
          "gd": 4,
          "pts": 6
        },
        {
          "team": "Australia",
          "pld": 3,
          "w": 1,
          "d": 1,
          "l": 1,
          "gf": 2,
          "ga": 2,
          "gd": 0,
          "pts": 4
        },
        {
          "team": "Paraguay",
          "pld": 3,
          "w": 1,
          "d": 1,
          "l": 1,
          "gf": 2,
          "ga": 4,
          "gd": -2,
          "pts": 4
        },
        {
          "team": "Turkiye",
          "pld": 3,
          "w": 1,
          "d": 0,
          "l": 2,
          "gf": 3,
          "ga": 5,
          "gd": -2,
          "pts": 3
        }
      ]
    },
    {
      "id": "E",
      "started": true,
      "rows": [
        {
          "team": "Germany",
          "pld": 3,
          "w": 2,
          "d": 0,
          "l": 1,
          "gf": 10,
          "ga": 4,
          "gd": 6,
          "pts": 6
        },
        {
          "team": "Ivory Coast",
          "pld": 3,
          "w": 2,
          "d": 0,
          "l": 1,
          "gf": 4,
          "ga": 2,
          "gd": 2,
          "pts": 6
        },
        {
          "team": "Ecuador",
          "pld": 3,
          "w": 1,
          "d": 1,
          "l": 1,
          "gf": 2,
          "ga": 2,
          "gd": 0,
          "pts": 4
        },
        {
          "team": "Curacao",
          "pld": 3,
          "w": 0,
          "d": 1,
          "l": 2,
          "gf": 1,
          "ga": 9,
          "gd": -8,
          "pts": 1
        }
      ]
    },
    {
      "id": "F",
      "started": true,
      "rows": [
        {
          "team": "Netherlands",
          "pld": 3,
          "w": 2,
          "d": 1,
          "l": 0,
          "gf": 10,
          "ga": 4,
          "gd": 6,
          "pts": 7
        },
        {
          "team": "Japan",
          "pld": 3,
          "w": 1,
          "d": 2,
          "l": 0,
          "gf": 7,
          "ga": 3,
          "gd": 4,
          "pts": 5
        },
        {
          "team": "Sweden",
          "pld": 3,
          "w": 1,
          "d": 1,
          "l": 1,
          "gf": 7,
          "ga": 7,
          "gd": 0,
          "pts": 4
        },
        {
          "team": "Tunisia",
          "pld": 3,
          "w": 0,
          "d": 0,
          "l": 3,
          "gf": 2,
          "ga": 12,
          "gd": -10,
          "pts": 0
        }
      ]
    },
    {
      "id": "G",
      "started": true,
      "rows": [
        {
          "team": "Belgium",
          "pld": 3,
          "w": 1,
          "d": 2,
          "l": 0,
          "gf": 6,
          "ga": 2,
          "gd": 4,
          "pts": 5
        },
        {
          "team": "Egypt",
          "pld": 3,
          "w": 1,
          "d": 2,
          "l": 0,
          "gf": 5,
          "ga": 3,
          "gd": 2,
          "pts": 5
        },
        {
          "team": "Iran",
          "pld": 3,
          "w": 0,
          "d": 3,
          "l": 0,
          "gf": 3,
          "ga": 3,
          "gd": 0,
          "pts": 3
        },
        {
          "team": "New Zealand",
          "pld": 3,
          "w": 0,
          "d": 1,
          "l": 2,
          "gf": 4,
          "ga": 10,
          "gd": -6,
          "pts": 1
        }
      ]
    },
    {
      "id": "H",
      "started": true,
      "rows": [
        {
          "team": "Spain",
          "pld": 3,
          "w": 2,
          "d": 1,
          "l": 0,
          "gf": 5,
          "ga": 0,
          "gd": 5,
          "pts": 7
        },
        {
          "team": "Cape Verde",
          "pld": 3,
          "w": 0,
          "d": 3,
          "l": 0,
          "gf": 2,
          "ga": 2,
          "gd": 0,
          "pts": 3
        },
        {
          "team": "Uruguay",
          "pld": 3,
          "w": 0,
          "d": 2,
          "l": 1,
          "gf": 3,
          "ga": 4,
          "gd": -1,
          "pts": 2
        },
        {
          "team": "Saudi Arabia",
          "pld": 3,
          "w": 0,
          "d": 2,
          "l": 1,
          "gf": 1,
          "ga": 5,
          "gd": -4,
          "pts": 2
        }
      ]
    },
    {
      "id": "I",
      "started": true,
      "rows": [
        {
          "team": "France",
          "pld": 3,
          "w": 3,
          "d": 0,
          "l": 0,
          "gf": 10,
          "ga": 2,
          "gd": 8,
          "pts": 9
        },
        {
          "team": "Norway",
          "pld": 3,
          "w": 2,
          "d": 0,
          "l": 1,
          "gf": 8,
          "ga": 7,
          "gd": 1,
          "pts": 6
        },
        {
          "team": "Senegal",
          "pld": 3,
          "w": 1,
          "d": 0,
          "l": 2,
          "gf": 8,
          "ga": 6,
          "gd": 2,
          "pts": 3
        },
        {
          "team": "Iraq",
          "pld": 3,
          "w": 0,
          "d": 0,
          "l": 3,
          "gf": 1,
          "ga": 12,
          "gd": -11,
          "pts": 0
        }
      ]
    },
    {
      "id": "J",
      "started": true,
      "rows": [
        {
          "team": "Argentina",
          "pld": 3,
          "w": 3,
          "d": 0,
          "l": 0,
          "gf": 8,
          "ga": 1,
          "gd": 7,
          "pts": 9
        },
        {
          "team": "Austria",
          "pld": 3,
          "w": 1,
          "d": 1,
          "l": 1,
          "gf": 6,
          "ga": 6,
          "gd": 0,
          "pts": 4
        },
        {
          "team": "Algeria",
          "pld": 3,
          "w": 1,
          "d": 1,
          "l": 1,
          "gf": 5,
          "ga": 7,
          "gd": -2,
          "pts": 4
        },
        {
          "team": "Jordan",
          "pld": 3,
          "w": 0,
          "d": 0,
          "l": 3,
          "gf": 3,
          "ga": 8,
          "gd": -5,
          "pts": 0
        }
      ]
    },
    {
      "id": "K",
      "started": true,
      "rows": [
        {
          "team": "Colombia",
          "pld": 3,
          "w": 2,
          "d": 1,
          "l": 0,
          "gf": 4,
          "ga": 1,
          "gd": 3,
          "pts": 7
        },
        {
          "team": "Portugal",
          "pld": 3,
          "w": 1,
          "d": 2,
          "l": 0,
          "gf": 6,
          "ga": 1,
          "gd": 5,
          "pts": 5
        },
        {
          "team": "DR Congo",
          "pld": 3,
          "w": 1,
          "d": 1,
          "l": 1,
          "gf": 4,
          "ga": 3,
          "gd": 1,
          "pts": 4
        },
        {
          "team": "Uzbekistan",
          "pld": 3,
          "w": 0,
          "d": 0,
          "l": 3,
          "gf": 2,
          "ga": 11,
          "gd": -9,
          "pts": 0
        }
      ]
    },
    {
      "id": "L",
      "started": true,
      "rows": [
        {
          "team": "England",
          "pld": 3,
          "w": 2,
          "d": 1,
          "l": 0,
          "gf": 6,
          "ga": 2,
          "gd": 4,
          "pts": 7
        },
        {
          "team": "Croatia",
          "pld": 3,
          "w": 2,
          "d": 0,
          "l": 1,
          "gf": 5,
          "ga": 5,
          "gd": 0,
          "pts": 6
        },
        {
          "team": "Ghana",
          "pld": 3,
          "w": 1,
          "d": 1,
          "l": 1,
          "gf": 2,
          "ga": 2,
          "gd": 0,
          "pts": 4
        },
        {
          "team": "Panama",
          "pld": 3,
          "w": 0,
          "d": 0,
          "l": 3,
          "gf": 0,
          "ga": 4,
          "gd": -4,
          "pts": 0
        }
      ]
    }
  ],
  "groupsFinal": [
    {
      "id": "A",
      "started": true,
      "rows": [
        {
          "team": "Mexico",
          "pld": 3,
          "w": 3,
          "d": 0,
          "l": 0,
          "gf": 6,
          "ga": 0,
          "gd": 6,
          "pts": 9
        },
        {
          "team": "South Africa",
          "pld": 3,
          "w": 1,
          "d": 1,
          "l": 1,
          "gf": 2,
          "ga": 3,
          "gd": -1,
          "pts": 4
        },
        {
          "team": "South Korea",
          "pld": 3,
          "w": 1,
          "d": 0,
          "l": 2,
          "gf": 2,
          "ga": 3,
          "gd": -1,
          "pts": 3
        },
        {
          "team": "Czechia",
          "pld": 3,
          "w": 0,
          "d": 1,
          "l": 2,
          "gf": 2,
          "ga": 6,
          "gd": -4,
          "pts": 1
        }
      ]
    },
    {
      "id": "B",
      "started": true,
      "rows": [
        {
          "team": "Switzerland",
          "pld": 3,
          "w": 2,
          "d": 1,
          "l": 0,
          "gf": 7,
          "ga": 3,
          "gd": 4,
          "pts": 7
        },
        {
          "team": "Canada",
          "pld": 3,
          "w": 1,
          "d": 1,
          "l": 1,
          "gf": 8,
          "ga": 3,
          "gd": 5,
          "pts": 4
        },
        {
          "team": "Bosnia and Herzegovina",
          "pld": 3,
          "w": 1,
          "d": 1,
          "l": 1,
          "gf": 5,
          "ga": 6,
          "gd": -1,
          "pts": 4
        },
        {
          "team": "Qatar",
          "pld": 3,
          "w": 0,
          "d": 1,
          "l": 2,
          "gf": 2,
          "ga": 10,
          "gd": -8,
          "pts": 1
        }
      ]
    },
    {
      "id": "C",
      "started": true,
      "rows": [
        {
          "team": "Brazil",
          "pld": 3,
          "w": 2,
          "d": 1,
          "l": 0,
          "gf": 7,
          "ga": 1,
          "gd": 6,
          "pts": 7
        },
        {
          "team": "Morocco",
          "pld": 3,
          "w": 2,
          "d": 1,
          "l": 0,
          "gf": 6,
          "ga": 3,
          "gd": 3,
          "pts": 7
        },
        {
          "team": "Scotland",
          "pld": 3,
          "w": 1,
          "d": 0,
          "l": 2,
          "gf": 1,
          "ga": 4,
          "gd": -3,
          "pts": 3
        },
        {
          "team": "Haiti",
          "pld": 3,
          "w": 0,
          "d": 0,
          "l": 3,
          "gf": 2,
          "ga": 8,
          "gd": -6,
          "pts": 0
        }
      ]
    },
    {
      "id": "D",
      "started": true,
      "rows": [
        {
          "team": "USA",
          "pld": 3,
          "w": 2,
          "d": 0,
          "l": 1,
          "gf": 8,
          "ga": 4,
          "gd": 4,
          "pts": 6
        },
        {
          "team": "Australia",
          "pld": 3,
          "w": 1,
          "d": 1,
          "l": 1,
          "gf": 2,
          "ga": 2,
          "gd": 0,
          "pts": 4
        },
        {
          "team": "Paraguay",
          "pld": 3,
          "w": 1,
          "d": 1,
          "l": 1,
          "gf": 2,
          "ga": 4,
          "gd": -2,
          "pts": 4
        },
        {
          "team": "Turkiye",
          "pld": 3,
          "w": 1,
          "d": 0,
          "l": 2,
          "gf": 3,
          "ga": 5,
          "gd": -2,
          "pts": 3
        }
      ]
    },
    {
      "id": "E",
      "started": true,
      "rows": [
        {
          "team": "Germany",
          "pld": 3,
          "w": 2,
          "d": 0,
          "l": 1,
          "gf": 10,
          "ga": 4,
          "gd": 6,
          "pts": 6
        },
        {
          "team": "Ivory Coast",
          "pld": 3,
          "w": 2,
          "d": 0,
          "l": 1,
          "gf": 4,
          "ga": 2,
          "gd": 2,
          "pts": 6
        },
        {
          "team": "Ecuador",
          "pld": 3,
          "w": 1,
          "d": 1,
          "l": 1,
          "gf": 2,
          "ga": 2,
          "gd": 0,
          "pts": 4
        },
        {
          "team": "Curacao",
          "pld": 3,
          "w": 0,
          "d": 1,
          "l": 2,
          "gf": 1,
          "ga": 9,
          "gd": -8,
          "pts": 1
        }
      ]
    },
    {
      "id": "F",
      "started": true,
      "rows": [
        {
          "team": "Netherlands",
          "pld": 3,
          "w": 2,
          "d": 1,
          "l": 0,
          "gf": 10,
          "ga": 4,
          "gd": 6,
          "pts": 7
        },
        {
          "team": "Japan",
          "pld": 3,
          "w": 1,
          "d": 2,
          "l": 0,
          "gf": 7,
          "ga": 3,
          "gd": 4,
          "pts": 5
        },
        {
          "team": "Sweden",
          "pld": 3,
          "w": 1,
          "d": 1,
          "l": 1,
          "gf": 7,
          "ga": 7,
          "gd": 0,
          "pts": 4
        },
        {
          "team": "Tunisia",
          "pld": 3,
          "w": 0,
          "d": 0,
          "l": 3,
          "gf": 2,
          "ga": 12,
          "gd": -10,
          "pts": 0
        }
      ]
    },
    {
      "id": "G",
      "started": true,
      "rows": [
        {
          "team": "Belgium",
          "pld": 3,
          "w": 1,
          "d": 2,
          "l": 0,
          "gf": 6,
          "ga": 2,
          "gd": 4,
          "pts": 5
        },
        {
          "team": "Egypt",
          "pld": 3,
          "w": 1,
          "d": 2,
          "l": 0,
          "gf": 5,
          "ga": 3,
          "gd": 2,
          "pts": 5
        },
        {
          "team": "Iran",
          "pld": 3,
          "w": 0,
          "d": 3,
          "l": 0,
          "gf": 3,
          "ga": 3,
          "gd": 0,
          "pts": 3
        },
        {
          "team": "New Zealand",
          "pld": 3,
          "w": 0,
          "d": 1,
          "l": 2,
          "gf": 4,
          "ga": 10,
          "gd": -6,
          "pts": 1
        }
      ]
    },
    {
      "id": "H",
      "started": true,
      "rows": [
        {
          "team": "Spain",
          "pld": 3,
          "w": 2,
          "d": 1,
          "l": 0,
          "gf": 5,
          "ga": 0,
          "gd": 5,
          "pts": 7
        },
        {
          "team": "Cape Verde",
          "pld": 3,
          "w": 0,
          "d": 3,
          "l": 0,
          "gf": 2,
          "ga": 2,
          "gd": 0,
          "pts": 3
        },
        {
          "team": "Uruguay",
          "pld": 3,
          "w": 0,
          "d": 2,
          "l": 1,
          "gf": 3,
          "ga": 4,
          "gd": -1,
          "pts": 2
        },
        {
          "team": "Saudi Arabia",
          "pld": 3,
          "w": 0,
          "d": 2,
          "l": 1,
          "gf": 1,
          "ga": 5,
          "gd": -4,
          "pts": 2
        }
      ]
    },
    {
      "id": "I",
      "started": true,
      "rows": [
        {
          "team": "France",
          "pld": 3,
          "w": 3,
          "d": 0,
          "l": 0,
          "gf": 10,
          "ga": 2,
          "gd": 8,
          "pts": 9
        },
        {
          "team": "Norway",
          "pld": 3,
          "w": 2,
          "d": 0,
          "l": 1,
          "gf": 8,
          "ga": 7,
          "gd": 1,
          "pts": 6
        },
        {
          "team": "Senegal",
          "pld": 3,
          "w": 1,
          "d": 0,
          "l": 2,
          "gf": 8,
          "ga": 6,
          "gd": 2,
          "pts": 3
        },
        {
          "team": "Iraq",
          "pld": 3,
          "w": 0,
          "d": 0,
          "l": 3,
          "gf": 1,
          "ga": 12,
          "gd": -11,
          "pts": 0
        }
      ]
    },
    {
      "id": "J",
      "started": true,
      "rows": [
        {
          "team": "Argentina",
          "pld": 3,
          "w": 3,
          "d": 0,
          "l": 0,
          "gf": 8,
          "ga": 1,
          "gd": 7,
          "pts": 9
        },
        {
          "team": "Austria",
          "pld": 3,
          "w": 1,
          "d": 1,
          "l": 1,
          "gf": 6,
          "ga": 6,
          "gd": 0,
          "pts": 4
        },
        {
          "team": "Algeria",
          "pld": 3,
          "w": 1,
          "d": 1,
          "l": 1,
          "gf": 5,
          "ga": 7,
          "gd": -2,
          "pts": 4
        },
        {
          "team": "Jordan",
          "pld": 3,
          "w": 0,
          "d": 0,
          "l": 3,
          "gf": 3,
          "ga": 8,
          "gd": -5,
          "pts": 0
        }
      ]
    },
    {
      "id": "K",
      "started": true,
      "rows": [
        {
          "team": "Colombia",
          "pld": 3,
          "w": 2,
          "d": 1,
          "l": 0,
          "gf": 4,
          "ga": 1,
          "gd": 3,
          "pts": 7
        },
        {
          "team": "Portugal",
          "pld": 3,
          "w": 1,
          "d": 2,
          "l": 0,
          "gf": 6,
          "ga": 1,
          "gd": 5,
          "pts": 5
        },
        {
          "team": "DR Congo",
          "pld": 3,
          "w": 1,
          "d": 1,
          "l": 1,
          "gf": 4,
          "ga": 3,
          "gd": 1,
          "pts": 4
        },
        {
          "team": "Uzbekistan",
          "pld": 3,
          "w": 0,
          "d": 0,
          "l": 3,
          "gf": 2,
          "ga": 11,
          "gd": -9,
          "pts": 0
        }
      ]
    },
    {
      "id": "L",
      "started": true,
      "rows": [
        {
          "team": "England",
          "pld": 3,
          "w": 2,
          "d": 1,
          "l": 0,
          "gf": 6,
          "ga": 2,
          "gd": 4,
          "pts": 7
        },
        {
          "team": "Croatia",
          "pld": 3,
          "w": 2,
          "d": 0,
          "l": 1,
          "gf": 5,
          "ga": 5,
          "gd": 0,
          "pts": 6
        },
        {
          "team": "Ghana",
          "pld": 3,
          "w": 1,
          "d": 1,
          "l": 1,
          "gf": 2,
          "ga": 2,
          "gd": 0,
          "pts": 4
        },
        {
          "team": "Panama",
          "pld": 3,
          "w": 0,
          "d": 0,
          "l": 3,
          "gf": 0,
          "ga": 4,
          "gd": -4,
          "pts": 0
        }
      ]
    }
  ],
  "today": {
    "mode": "roadmap",
    "date": "Monday, September 21, 2026",
    "stageLabel": "Between tournaments",
    "tz": "Kickoff times are listed in Eastern Time (ET) whenever there are matches to list. There are none until the Women's World Cup opens in Brazil on June 24, 2027.",
    "schedNote": "No matches. The Men's World Cup 2026 finished on July 19 and the next tournament is the Women's World Cup, which opens in Brazil on June 24, 2027. The next competitive date for a featured nation is October 9, now about two and a half weeks off, when England and the Netherlands start their European play-off ties away from home; the USA wait until November 27. The Road to 2027 below has the ties and their kickoff times. This page refreshes weekly and will fill up again once the tournament schedule is published.",
    "kits": {},
    "games": []
  },
  "roadTo2027": {
    "heading": "The Road to Brazil 2027",
    "tag": "Women's World Cup",
    "intro": "The next FIFA World Cup is the women's tournament, and it opens in Brazil on June 24, 2027 - thirty-two teams, eight groups, and hosts Brazil already through. Between now and then, a qualifying race decides who joins them. This page follows that road.",
    "draw": "The group-stage draw is expected in December 2026 and has not been officially scheduled, so there is no bracket to show yet. Until the draw, the story is qualification.",
    "featured": [
      {
        "team": "USA",
        "color": "#0A3161",
        "confed": "CONCACAF",
        "route": "2026 Concacaf W Championship",
        "detail": "Not yet qualified, and the draw is now made: the USA host El Salvador in the quarter-finals on Nov 27, 8:30 PM ET. Win it and they are through to Brazil; lose it and they drop into the Dec 2 play-in, 3:00 PM ET, for a place in the inter-confederation play-off."
      },
      {
        "team": "England",
        "color": "#CE1124",
        "confed": "UEFA",
        "route": "European play-offs",
        "detail": "England were drawn against Greece in the first round of the European play-offs - away on Oct 9 at 12:30 PM ET, home on Oct 13 at 2:30 PM ET. Winning the tie carries them into the second round, where the last European places are settled."
      },
      {
        "team": "Netherlands",
        "color": "#F36C21",
        "confed": "UEFA",
        "route": "European play-offs",
        "detail": "The Netherlands drew Hungary in that same first round - away on Oct 9 at 2:00 PM ET, home on Oct 13 at 2:45 PM ET. The winner goes through to the second round in the closing weeks of the year, whose pairings and dates are still unpublished."
      }
    ],
    "timeline": [
      {"window": "Jul - Aug 2026", "event": "CAF WAFCON", "detail": "Africa's qualifying tournament decides the CAF places, and its window has now closed. No structured source available to this pipeline carries WAFCON, so the African qualifiers are not listed here.", "featured": false},
      {"window": "Oct 9 - 13, 2026", "event": "UEFA play-offs, round 1", "detail": "Two legs each, and the ties are drawn: England play Greece and the Netherlands play Hungary, away first.", "featured": true},
      {"window": "Nov 27 - Dec 5, 2026", "event": "Concacaf W Championship", "detail": "The USA's route: quarter-finals Nov 27-28 (USA vs El Salvador, Nov 27 at 8:30 PM ET), semi-finals Dec 1, a play-in Dec 2, the final Dec 5. Quarter-final winners go straight to Brazil.", "featured": true},
      {"window": "Oct 19 - Dec 30, 2026", "event": "UEFA play-offs, round 2", "detail": "Europe's remaining direct places and a play-off berth are settled. The pairings follow round one and no fixtures are published yet.", "featured": true},
      {"window": "Nov 2026 - Feb 2027", "event": "Inter-confederation play-off", "detail": "Ten teams across two phases contest the final three World Cup places.", "featured": false},
      {"window": "Dec 2026 (expected)", "event": "Final draw", "detail": "Groups are drawn; the knockout bracket can be built once this happens.", "featured": false},
      {"window": "Jun 24, 2027", "event": "Brazil 2027 kicks off", "detail": "The opening match of the tournament.", "featured": false}
    ],
    "slots": {
      "note": "Twenty-nine places are decided directly by the six confederations; the last three go to the winners of a ten-team inter-confederation play-off. Brazil take one of CONMEBOL's places as hosts.",
      "rows": [
        {"confed": "UEFA (Europe)", "direct": "11 direct", "po": "+1 to play-off"},
        {"confed": "AFC (Asia)", "direct": "6 direct", "po": "+2 to play-off"},
        {"confed": "CAF (Africa)", "direct": "4 direct", "po": "+2 to play-off"},
        {"confed": "CONCACAF (N. America)", "direct": "4 direct", "po": "+2 to play-off"},
        {"confed": "CONMEBOL (S. America)", "direct": "3 direct, incl. Brazil", "po": "+2 to play-off"},
        {"confed": "OFC (Oceania)", "direct": "1 direct", "po": "+1 to play-off"}
      ]
    },
    "liveNote": "Live fixtures and results will appear here as each qualifying window arrives, from the same structured sources the tracker uses.",
    "source": "Qualifying fixtures and calendars read directly from the ESPN structured API: the UEFA qualifiers (fifa.wworldq.uefa - the Oct 9 and Oct 13 first-leg and second-leg ties) and the Concacaf W Championship (concacaf.womens.championship - quarter-finals Nov 27-28, semi-finals Dec 1, play-in Dec 2, third-place match and final Dec 5). Retrieved 2026-07-27 and re-checked 2026-09-21, with all sixteen first-round ties unchanged and their kickoff times read from the feed (England at Greece Oct 9, 16:30 UTC at the Pankritio Stadium, and the return Oct 13, 18:30 UTC at the King Power Stadium; Netherlands at Hungary Oct 9, 18:00 UTC at the Pancho Arena, and the return Oct 13, 18:45 UTC at the Koning Willem II Stadion - the Dutch return leg was listed here as 2:00 PM ET before and is corrected to 2:45 PM ET from the feed), the full Concacaf knockout list confirmed (four quarter-finals on Nov 27-28, the USA hosting El Salvador at 01:30 UTC on Nov 28, which is Nov 27 at 8:30 PM ET; semi-finals Dec 1, play-in Dec 2, third-place match and final Dec 5, all at 20:00 UTC), and the UEFA second-round pairings still unpublished - a query across Oct 14 to Mar 31 returns no fixtures outside the first round. No structured source available to this pipeline carries AFC, CAF, CONMEBOL or OFC women's qualifying, so those windows are listed from published calendars only."
  },
  "bracket": {
    "pending": true,
    "source": "Standard 32-team knockout structure for the 2027 FIFA Women's World Cup (eight groups, the top two of each reach the Round of 16). Slots show the group positions; teams, kickoff times and venues are filled in after the December 2026 final draw and the FIFA match schedule. Structure recorded 2026-07-24.",
    "note": "The 2027 FIFA Women's World Cup knockout bracket. Thirty-two teams, eight groups; the top two of each reach the Round of 16. The draw is in December 2026 - until then the bracket shows its shape, from the Round of 16 to the Final.",
    "rounds": [
      {
        "key": "r16",
        "label": "Round of 16",
        "matches": [
          {
            "id": "R16-1",
            "home": "Winner Group A",
            "away": "Runner-up Group B",
            "homeTeam": null,
            "awayTeam": null,
            "status": "upcoming",
            "feedsInto": "QF-1",
            "feedsSide": "home"
          },
          {
            "id": "R16-2",
            "home": "Winner Group C",
            "away": "Runner-up Group D",
            "homeTeam": null,
            "awayTeam": null,
            "status": "upcoming",
            "feedsInto": "QF-1",
            "feedsSide": "away"
          },
          {
            "id": "R16-3",
            "home": "Winner Group E",
            "away": "Runner-up Group F",
            "homeTeam": null,
            "awayTeam": null,
            "status": "upcoming",
            "feedsInto": "QF-2",
            "feedsSide": "home"
          },
          {
            "id": "R16-4",
            "home": "Winner Group G",
            "away": "Runner-up Group H",
            "homeTeam": null,
            "awayTeam": null,
            "status": "upcoming",
            "feedsInto": "QF-2",
            "feedsSide": "away"
          },
          {
            "id": "R16-5",
            "home": "Winner Group B",
            "away": "Runner-up Group A",
            "homeTeam": null,
            "awayTeam": null,
            "status": "upcoming",
            "feedsInto": "QF-3",
            "feedsSide": "home"
          },
          {
            "id": "R16-6",
            "home": "Winner Group D",
            "away": "Runner-up Group C",
            "homeTeam": null,
            "awayTeam": null,
            "status": "upcoming",
            "feedsInto": "QF-3",
            "feedsSide": "away"
          },
          {
            "id": "R16-7",
            "home": "Winner Group F",
            "away": "Runner-up Group E",
            "homeTeam": null,
            "awayTeam": null,
            "status": "upcoming",
            "feedsInto": "QF-4",
            "feedsSide": "home"
          },
          {
            "id": "R16-8",
            "home": "Winner Group H",
            "away": "Runner-up Group G",
            "homeTeam": null,
            "awayTeam": null,
            "status": "upcoming",
            "feedsInto": "QF-4",
            "feedsSide": "away"
          }
        ]
      },
      {
        "key": "qf",
        "label": "Quarter-finals",
        "matches": [
          {
            "id": "QF-1",
            "home": "Winner R16-1",
            "away": "Winner R16-2",
            "homeTeam": null,
            "awayTeam": null,
            "status": "upcoming",
            "feedsInto": "SF-1",
            "feedsSide": "home"
          },
          {
            "id": "QF-2",
            "home": "Winner R16-3",
            "away": "Winner R16-4",
            "homeTeam": null,
            "awayTeam": null,
            "status": "upcoming",
            "feedsInto": "SF-1",
            "feedsSide": "away"
          },
          {
            "id": "QF-3",
            "home": "Winner R16-5",
            "away": "Winner R16-6",
            "homeTeam": null,
            "awayTeam": null,
            "status": "upcoming",
            "feedsInto": "SF-2",
            "feedsSide": "home"
          },
          {
            "id": "QF-4",
            "home": "Winner R16-7",
            "away": "Winner R16-8",
            "homeTeam": null,
            "awayTeam": null,
            "status": "upcoming",
            "feedsInto": "SF-2",
            "feedsSide": "away"
          }
        ]
      },
      {
        "key": "sf",
        "label": "Semi-finals",
        "matches": [
          {
            "id": "SF-1",
            "home": "Winner QF-1",
            "away": "Winner QF-2",
            "homeTeam": null,
            "awayTeam": null,
            "status": "upcoming",
            "feedsInto": "F-1",
            "feedsSide": "home"
          },
          {
            "id": "SF-2",
            "home": "Winner QF-3",
            "away": "Winner QF-4",
            "homeTeam": null,
            "awayTeam": null,
            "status": "upcoming",
            "feedsInto": "F-1",
            "feedsSide": "away"
          }
        ]
      },
      {
        "key": "third",
        "label": "Third-place play-off",
        "matches": [
          {
            "id": "TP-1",
            "home": "Loser SF-1",
            "away": "Loser SF-2",
            "homeTeam": null,
            "awayTeam": null,
            "status": "upcoming",
            "feedsInto": null,
            "feedsSide": null
          }
        ]
      },
      {
        "key": "final",
        "label": "Final",
        "matches": [
          {
            "id": "F-1",
            "home": "Winner SF-1",
            "away": "Winner SF-2",
            "homeTeam": null,
            "awayTeam": null,
            "status": "upcoming",
            "feedsInto": null,
            "feedsSide": null
          }
        ]
      }
    ]
  }
};
