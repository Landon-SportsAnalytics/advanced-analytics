import sqlite3
import json
from datetime import datetime

DB_PATH = "mlb_picker.db"


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db():
    conn = get_db()
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS games (
            game_pk         INTEGER PRIMARY KEY,
            game_date       TEXT NOT NULL,
            game_time_utc   TEXT NOT NULL,
            venue_name      TEXT NOT NULL,
            status          TEXT NOT NULL,
            away_team_id    INTEGER NOT NULL,
            away_team_name  TEXT NOT NULL,
            away_team_abbr  TEXT NOT NULL,
            away_wins       INTEGER NOT NULL DEFAULT 0,
            away_losses     INTEGER NOT NULL DEFAULT 0,
            away_pitcher    TEXT,
            away_score      INTEGER,
            home_team_id    INTEGER NOT NULL,
            home_team_name  TEXT NOT NULL,
            home_team_abbr  TEXT NOT NULL,
            home_wins       INTEGER NOT NULL DEFAULT 0,
            home_losses     INTEGER NOT NULL DEFAULT 0,
            home_pitcher    TEXT,
            home_score      INTEGER,
            last_updated    TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS picks (
            id                  INTEGER PRIMARY KEY AUTOINCREMENT,
            game_pk             INTEGER NOT NULL UNIQUE,
            game_date           TEXT NOT NULL,
            picked_team_id      INTEGER NOT NULL,
            picked_team_name    TEXT NOT NULL,
            result              TEXT,
            created_at          TEXT NOT NULL,
            FOREIGN KEY (game_pk) REFERENCES games(game_pk)
        );

        CREATE TABLE IF NOT EXISTS venues (
            venue_id        INTEGER PRIMARY KEY,
            venue_name      TEXT,
            left_line       INTEGER,
            left_center     INTEGER,
            center          INTEGER,
            right_center    INTEGER,
            right_line      INTEGER,
            roof_type       TEXT,
            turf_type       TEXT
        );
    """)
    conn.commit()
    conn.close()
    migrate_db()


def migrate_db():
    """Add new columns to existing tables without dropping data."""
    new_columns = [
        ("venue_id",          "INTEGER"),
        ("away_pitcher_id",   "INTEGER"),
        ("home_pitcher_id",   "INTEGER"),
        ("away_pitcher_wins",   "INTEGER"),
        ("away_pitcher_losses", "INTEGER"),
        ("away_pitcher_era",    "TEXT"),
        ("home_pitcher_wins",   "INTEGER"),
        ("home_pitcher_losses", "INTEGER"),
        ("home_pitcher_era",    "TEXT"),
        ("away_lineup",         "TEXT"),
        ("home_lineup",         "TEXT"),
    ]
    conn = get_db()
    for col_name, col_type in new_columns:
        try:
            conn.execute(f"ALTER TABLE games ADD COLUMN {col_name} {col_type}")
        except Exception:
            pass  # column already exists
    conn.commit()
    conn.close()


# ---------------------------------------------------------------------------
# Games
# ---------------------------------------------------------------------------

def upsert_games(games_list):
    """Insert or update game rows. Does NOT overwrite pitcher stats or lineups
    (those columns are managed by dedicated update functions)."""
    conn = get_db()
    now = datetime.utcnow().isoformat()
    for g in games_list:
        conn.execute("""
            INSERT INTO games (
                game_pk, game_date, game_time_utc, venue_name, status,
                away_team_id, away_team_name, away_team_abbr, away_wins, away_losses,
                away_pitcher, away_pitcher_id, away_score,
                home_team_id, home_team_name, home_team_abbr, home_wins, home_losses,
                home_pitcher, home_pitcher_id, home_score,
                venue_id, last_updated
            ) VALUES (
                :game_pk, :game_date, :game_time_utc, :venue_name, :status,
                :away_team_id, :away_team_name, :away_team_abbr, :away_wins, :away_losses,
                :away_pitcher, :away_pitcher_id, :away_score,
                :home_team_id, :home_team_name, :home_team_abbr, :home_wins, :home_losses,
                :home_pitcher, :home_pitcher_id, :home_score,
                :venue_id, :last_updated
            )
            ON CONFLICT(game_pk) DO UPDATE SET
                status         = excluded.status,
                away_wins      = excluded.away_wins,
                away_losses    = excluded.away_losses,
                away_pitcher   = excluded.away_pitcher,
                away_pitcher_id = excluded.away_pitcher_id,
                away_score     = excluded.away_score,
                home_wins      = excluded.home_wins,
                home_losses    = excluded.home_losses,
                home_pitcher   = excluded.home_pitcher,
                home_pitcher_id = excluded.home_pitcher_id,
                home_score     = excluded.home_score,
                last_updated   = excluded.last_updated
        """, {**g, "last_updated": now})
    conn.commit()
    conn.close()


def get_games_for_date(date_str):
    conn = get_db()
    rows = conn.execute(
        "SELECT * FROM games WHERE game_date = ? ORDER BY game_time_utc",
        (date_str,)
    ).fetchall()
    conn.close()
    return rows


def get_game(game_pk):
    conn = get_db()
    row = conn.execute("SELECT * FROM games WHERE game_pk = ?", (game_pk,)).fetchone()
    conn.close()
    return row


def get_games_needing_pitcher_stats(date_str):
    """Return games where a pitcher ID is known but ERA hasn't been fetched yet."""
    conn = get_db()
    rows = conn.execute("""
        SELECT game_pk,
               away_pitcher_id, away_pitcher_era,
               home_pitcher_id, home_pitcher_era
        FROM games
        WHERE game_date = ?
          AND (
            (away_pitcher_id IS NOT NULL AND away_pitcher_era IS NULL) OR
            (home_pitcher_id IS NOT NULL AND home_pitcher_era IS NULL)
          )
    """, (date_str,)).fetchall()
    conn.close()
    return rows


def update_game_pitcher_stats(game_pk, away_stats, home_stats):
    """Update pitcher stats columns for one game."""
    conn = get_db()
    if away_stats:
        conn.execute("""
            UPDATE games SET
                away_pitcher_wins   = ?,
                away_pitcher_losses = ?,
                away_pitcher_era    = ?
            WHERE game_pk = ?
        """, (away_stats.get("wins"), away_stats.get("losses"),
              away_stats.get("era"), game_pk))
    if home_stats:
        conn.execute("""
            UPDATE games SET
                home_pitcher_wins   = ?,
                home_pitcher_losses = ?,
                home_pitcher_era    = ?
            WHERE game_pk = ?
        """, (home_stats.get("wins"), home_stats.get("losses"),
              home_stats.get("era"), game_pk))
    conn.commit()
    conn.close()


def update_game_lineups(game_pk, away_lineup, home_lineup):
    """Store lineups as JSON text."""
    conn = get_db()
    conn.execute("""
        UPDATE games SET
            away_lineup = ?,
            home_lineup = ?
        WHERE game_pk = ?
    """, (
        json.dumps(away_lineup) if away_lineup else None,
        json.dumps(home_lineup) if home_lineup else None,
        game_pk
    ))
    conn.commit()
    conn.close()


def get_games_needing_lineups(date_str):
    """Return games where lineups haven't been fetched and the game is not in Preview."""
    conn = get_db()
    rows = conn.execute("""
        SELECT game_pk, status
        FROM games
        WHERE game_date = ?
          AND away_lineup IS NULL
          AND status != 'Preview'
    """, (date_str,)).fetchall()
    conn.close()
    return rows


# ---------------------------------------------------------------------------
# Venues
# ---------------------------------------------------------------------------

def upsert_venue(venue_dict):
    conn = get_db()
    conn.execute("""
        INSERT OR REPLACE INTO venues
            (venue_id, venue_name, left_line, left_center, center,
             right_center, right_line, roof_type, turf_type)
        VALUES
            (:venue_id, :venue_name, :left_line, :left_center, :center,
             :right_center, :right_line, :roof_type, :turf_type)
    """, venue_dict)
    conn.commit()
    conn.close()


def get_venue(venue_id):
    if not venue_id:
        return None
    conn = get_db()
    row = conn.execute("SELECT * FROM venues WHERE venue_id = ?", (venue_id,)).fetchone()
    conn.close()
    return row


def get_venues_missing(venue_ids):
    """Return subset of venue_ids not yet in the venues table."""
    if not venue_ids:
        return []
    conn = get_db()
    placeholders = ",".join("?" * len(venue_ids))
    existing = {r[0] for r in conn.execute(
        f"SELECT venue_id FROM venues WHERE venue_id IN ({placeholders})",
        list(venue_ids)
    ).fetchall()}
    conn.close()
    return [vid for vid in venue_ids if vid not in existing]


# ---------------------------------------------------------------------------
# Picks
# ---------------------------------------------------------------------------

def get_pick_for_game(game_pk):
    conn = get_db()
    row = conn.execute("SELECT * FROM picks WHERE game_pk = ?", (game_pk,)).fetchone()
    conn.close()
    return row


def get_picks_for_date(date_str):
    conn = get_db()
    rows = conn.execute("SELECT * FROM picks WHERE game_date = ?", (date_str,)).fetchall()
    conn.close()
    return rows


def insert_pick(game_pk, game_date, picked_team_id, picked_team_name):
    conn = get_db()
    conn.execute("""
        INSERT INTO picks (game_pk, game_date, picked_team_id, picked_team_name, result, created_at)
        VALUES (?, ?, ?, ?, NULL, ?)
    """, (game_pk, game_date, picked_team_id, picked_team_name,
          datetime.utcnow().isoformat()))
    conn.commit()
    conn.close()


def delete_pick(game_pk):
    conn = get_db()
    conn.execute("DELETE FROM picks WHERE game_pk = ? AND result IS NULL", (game_pk,))
    conn.commit()
    conn.close()


def update_pick_result(game_pk, result):
    conn = get_db()
    conn.execute("UPDATE picks SET result = ? WHERE game_pk = ?", (result, game_pk))
    conn.commit()
    conn.close()


def get_season_record():
    conn = get_db()
    rows = conn.execute(
        "SELECT result, COUNT(*) as cnt FROM picks WHERE result IS NOT NULL GROUP BY result"
    ).fetchall()
    conn.close()
    record = {"W": 0, "L": 0, "P": 0}
    for row in rows:
        if row["result"] in record:
            record[row["result"]] = row["cnt"]
    record["total"] = sum(record.values())
    record["pending"] = _get_pending_count()
    return record


def _get_pending_count():
    conn = get_db()
    cnt = conn.execute(
        "SELECT COUNT(*) FROM picks WHERE result IS NULL"
    ).fetchone()[0]
    conn.close()
    return cnt


def get_all_picks_with_games():
    conn = get_db()
    rows = conn.execute("""
        SELECT
            p.id, p.game_date, p.picked_team_id, p.picked_team_name, p.result, p.created_at,
            g.game_pk, g.away_team_name, g.away_team_abbr, g.away_wins, g.away_losses,
            g.home_team_name, g.home_team_abbr, g.home_wins, g.home_losses,
            g.away_score, g.home_score, g.status, g.venue_name
        FROM picks p
        JOIN games g ON p.game_pk = g.game_pk
        ORDER BY p.game_date DESC, p.id DESC
    """).fetchall()
    conn.close()
    return rows


def is_stale(date_str):
    """Returns True if games for date_str should be re-fetched from API."""
    conn = get_db()
    rows = conn.execute(
        "SELECT status, last_updated FROM games WHERE game_date = ?", (date_str,)
    ).fetchall()
    conn.close()
    if not rows:
        return True
    if all(r["status"] == "Final" for r in rows):
        return False
    oldest = min(r["last_updated"] for r in rows)
    age_seconds = (datetime.utcnow() - datetime.fromisoformat(oldest)).total_seconds()
    return age_seconds > 900
