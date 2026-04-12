# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the App

```bash
pip install -r requirements.txt   # first time only
python app.py                      # starts at http://localhost:5000
```

## Architecture

Flask web app with SQLite persistence. No build step — plain HTML/CSS, server-side Jinja2 templates.

| File | Role |
|------|------|
| `app.py` | Flask routes, startup, Jinja2 filters/context processor, enrichment orchestration |
| `database.py` | SQLite schema, `init_db()` + `migrate_db()`, all query helpers |
| `mlb_api.py` | MLB Stats API fetch + response parsing (games, pitcher stats, venues, lineups) |
| `field_svg.py` | Generates SVG baseball field illustrations from venue dimensions |
| `templates/base.html` | Shared layout, all CSS (embedded `<style>`) |
| `templates/index.html` | Today's games page with week tabs |
| `templates/history.html` | Season record + pick history table |
| `templates/partials/game_card.html` | Per-game card — matchup, pitcher stats, pick form, lineups, field SVG |
| `mlb_picker.db` | Auto-created SQLite database |

## Routes

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/` | Today's games with pick buttons |
| POST | `/pick` | Submit a pick (`game_pk`, `picked_team_id` form fields) |
| GET | `/history` | Season record + all past picks |
| POST | `/update-results` | Re-fetch completed game scores, mark picks W/L/P |
| GET | `/games/<YYYY-MM-DD>` | Any date, read-only for past dates |

## Data Model

**`games`** — cached MLB API data. `INSERT … ON CONFLICT DO UPDATE` preserves pitcher stats and lineups (those columns are only written by dedicated `update_game_*` functions, never by `upsert_games`).

Key columns: `venue_id`, `away/home_pitcher_id`, `away/home_pitcher_wins/losses/era`, `away/home_lineup` (JSON text).

**`picks`** — one row per game (`UNIQUE` on `game_pk`). `result`: NULL=pending, "W", "L", "P".

**`venues`** — cached field dimensions fetched once per venue. Never re-fetched.

## Enrichment flow (called after every game upsert)

1. **Venues**: `get_venues_missing()` → `fetch_venue_info(venue_id)` → `upsert_venue()`
2. **Pitcher stats**: `get_games_needing_pitcher_stats()` → `fetch_pitcher_stats(person_id, season)` → `update_game_pitcher_stats()`
3. **Lineups**: `get_games_needing_lineups()` (non-Preview games with null lineups) → `fetch_lineups(game_pk)` → `update_game_lineups()`

Lineups are also re-attempted on every `POST /update-results`.

## MLB API

Free, no auth. Base URL: `https://statsapi.mlb.com/api/v1`

Key endpoints:
- Schedule: `GET /schedule?sportId=1&date=YYYY-MM-DD&hydrate=probablePitcher,linescore,decisions,team`
- Pitcher stats: `GET /people/{id}/stats?stats=season&group=pitching&season=YYYY`
- Venue: `GET /venues/{id}?hydrate=fieldInfo` — returns `fieldInfo.{leftLine,leftCenter,center,rightCenter,rightLine,roofType,turfType}`
- Lineups: `GET /game/{gamePk}/lineups` (falls back to `/game/{gamePk}/boxscore` if empty)

Quirks:
- `probablePitcher` key is **absent** (not null) when TBD
- `gameDate` is UTC — converted via `local_time` Jinja2 filter (use `.lstrip("0")` not `%-I`)
- Windows `strftime`: use `%#d` for no-leading-zero day (not `%-d`)
- `battingOrder` from API is `100/200/.../900` (position × 100) — sort numerically

## Schema migrations

New columns are added via `migrate_db()` using `ALTER TABLE … ADD COLUMN` wrapped in `try/except` (SQLite doesn't support `IF NOT EXISTS` for ALTER TABLE). Called automatically in `init_db()`.

## Season record

Computed on every request via `database.get_season_record()` and injected into all templates by `@app.context_processor`. The `week_dates` list (today + 6 days) is also injected globally.

## Field SVG

`field_svg.generate_field_svg(left_line, left_center, center, right_center, right_line, roof_type, turf_type)` returns an SVG string. Coordinates: scale=0.5px/ft, home plate at (155, 268), wall drawn as catmull-rom bezier through 5 points (LF/LC/CF/RC/RF at −45°/−22.5°/0°/+22.5°/+45°). SVGs are pre-rendered in `app.py` into a `svgs` dict keyed by `game_pk` and passed to templates.
