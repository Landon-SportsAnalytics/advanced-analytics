import json
from flask import Flask, render_template, redirect, url_for, request, flash
from datetime import date, datetime, timedelta
import database
import mlb_api
import field_svg

app = Flask(__name__)
app.secret_key = "mlb-picker-local"

database.init_db()


@app.template_filter("local_time")
def local_time_filter(utc_str):
    return mlb_api.utc_to_local(utc_str)


@app.template_filter("win_pct")
def win_pct_filter(record):
    if not record["total"]:
        return ".000"
    pct = record["W"] / record["total"]
    return f"{pct:.3f}".lstrip("0") or ".000"


@app.template_filter("from_json")
def from_json_filter(s):
    if not s:
        return []
    try:
        return json.loads(s)
    except (ValueError, TypeError):
        return []


@app.context_processor
def inject_globals():
    today = date.today()
    week_dates = []
    for i in range(7):
        d = today + timedelta(days=i)
        # %#d strips leading zero on Windows; %-d on Linux
        try:
            label = d.strftime("%a %-d")
        except ValueError:
            label = d.strftime("%a %#d")
        week_dates.append({"date": d.isoformat(), "label": label})
    return {
        "season_record": database.get_season_record(),
        "week_dates": week_dates,
        "today_iso": today.isoformat(),
    }


# ---------------------------------------------------------------------------
# GET / — today's games
# ---------------------------------------------------------------------------
@app.route("/")
def index():
    today = date.today().isoformat()
    return _games_for_date(today, is_today=True)


# ---------------------------------------------------------------------------
# GET /games/<date> — any date (read-only for past dates)
# ---------------------------------------------------------------------------
@app.route("/games/<game_date>")
def games_on_date(game_date):
    try:
        datetime.strptime(game_date, "%Y-%m-%d")
    except ValueError:
        flash("Invalid date format.", "error")
        return redirect(url_for("index"))
    today = date.today().isoformat()
    return _games_for_date(game_date, is_today=(game_date == today))


def _games_for_date(game_date, is_today):
    # 1. Refresh game cache if stale
    if database.is_stale(game_date):
        games_data = mlb_api.fetch_games(game_date)
        if games_data:
            database.upsert_games(games_data)
            _enrich_games(games_data, game_date)

    # 2. Load games from DB
    games = database.get_games_for_date(game_date)

    # 3. Re-check lineups for games that are now Live/Final but have no lineup yet
    if games:
        _try_fetch_lineups(game_date)

    # 4. Reload games after enrichment (stats/lineups may have been written)
    games = database.get_games_for_date(game_date)

    # 5. Build venue + SVG dicts keyed by game_pk
    venues = {}
    svgs = {}
    for g in games:
        vid = g["venue_id"] if "venue_id" in g.keys() else None
        if vid and vid not in venues:
            row = database.get_venue(vid)
            if row:
                venues[vid] = row
        if vid and vid in venues:
            v = venues[vid]
            svgs[g["game_pk"]] = field_svg.generate_field_svg(
                left_line=v["left_line"] or 330,
                left_center=v["left_center"] or 375,
                center=v["center"] or 400,
                right_center=v["right_center"] or 375,
                right_line=v["right_line"] or 330,
                roof_type=v["roof_type"],
                turf_type=v["turf_type"],
            )
        else:
            # Render with defaults if venue info not yet available
            svgs[g["game_pk"]] = field_svg.generate_field_svg()

    picks = database.get_picks_for_date(game_date)
    picks_by_game_pk = {p["game_pk"]: p for p in picks}

    return render_template(
        "index.html",
        games=games,
        picks_by_game_pk=picks_by_game_pk,
        venues=venues,
        svgs=svgs,
        game_date=game_date,
        is_today=is_today,
    )


def _enrich_games(games_data, game_date):
    """After upserting games: fetch venue info and pitcher stats for any that are missing."""
    # Venues
    venue_ids = {g["venue_id"] for g in games_data if g.get("venue_id")}
    missing = database.get_venues_missing(venue_ids)
    for vid in missing:
        info = mlb_api.fetch_venue_info(vid)
        if info:
            database.upsert_venue(info)

    # Pitcher stats
    season = game_date[:4]
    needing = database.get_games_needing_pitcher_stats(game_date)
    for row in needing:
        away_id = row["away_pitcher_id"] if row["away_pitcher_era"] is None else None
        home_id = row["home_pitcher_id"] if row["home_pitcher_era"] is None else None
        away_stats = mlb_api.fetch_pitcher_stats(away_id, season) if away_id else None
        home_stats = mlb_api.fetch_pitcher_stats(home_id, season) if home_id else None
        if away_stats or home_stats:
            database.update_game_pitcher_stats(row["game_pk"], away_stats, home_stats)


def _try_fetch_lineups(game_date):
    """Attempt to fetch lineups for games that are Live/Final but have no lineup yet."""
    needing = database.get_games_needing_lineups(game_date)
    for row in needing:
        lineups = mlb_api.fetch_lineups(row["game_pk"])
        if lineups:
            database.update_game_lineups(
                row["game_pk"],
                lineups.get("away"),
                lineups.get("home"),
            )


# ---------------------------------------------------------------------------
# POST /pick
# ---------------------------------------------------------------------------
@app.route("/pick", methods=["POST"])
def pick():
    try:
        game_pk = int(request.form["game_pk"])
        picked_team_id = int(request.form["picked_team_id"])
    except (KeyError, ValueError):
        flash("Invalid pick submission.", "error")
        return redirect(url_for("index"))

    game = database.get_game(game_pk)
    if not game:
        flash("Game not found.", "error")
        return redirect(url_for("index"))

    if game["status"] == "Final":
        flash("That game is already final — no pick allowed.", "error")
        return redirect(url_for("index"))

    anchor = request.form.get("anchor", "")
    game_date = request.form.get("game_date", "")
    today = date.today().isoformat()

    def back_url():
        base = url_for("index") if game_date == today else url_for("games_on_date", game_date=game_date)
        return base + (f"#{anchor}" if anchor else "")

    existing = database.get_pick_for_game(game_pk)
    if existing:
        flash(f"You already picked {existing['picked_team_name']} for that game.", "warning")
        return redirect(back_url())

    if picked_team_id == game["away_team_id"]:
        picked_team_name = game["away_team_name"]
    elif picked_team_id == game["home_team_id"]:
        picked_team_name = game["home_team_name"]
    else:
        flash("Unknown team selection.", "error")
        return redirect(back_url())

    database.insert_pick(game_pk, game["game_date"], picked_team_id, picked_team_name)
    flash(f"Pick saved: {picked_team_name}", "success")
    return redirect(back_url())


# ---------------------------------------------------------------------------
# POST /unpick
# ---------------------------------------------------------------------------
@app.route("/unpick", methods=["POST"])
def unpick():
    anchor = request.form.get("anchor", "")
    game_date = request.form.get("game_date", "")
    today = date.today().isoformat()

    def back_url():
        base = url_for("index") if game_date == today else url_for("games_on_date", game_date=game_date)
        return base + (f"#{anchor}" if anchor else "")

    try:
        game_pk = int(request.form["game_pk"])
    except (KeyError, ValueError):
        flash("Invalid request.", "error")
        return redirect(url_for("index"))

    game = database.get_game(game_pk)
    if not game or game["status"] == "Final":
        flash("Cannot undo a pick for a final game.", "error")
        return redirect(back_url())

    existing = database.get_pick_for_game(game_pk)
    if not existing or existing["result"] is not None:
        flash("No pending pick to undo.", "warning")
        return redirect(back_url())

    database.delete_pick(game_pk)
    flash("Pick removed.", "info")
    return redirect(back_url())


# ---------------------------------------------------------------------------
# POST /update-results
# ---------------------------------------------------------------------------
@app.route("/update-results", methods=["POST"])
def update_results():
    today = date.today().isoformat()
    games_data = mlb_api.fetch_games(today)
    if not games_data:
        flash("Could not reach MLB API. Try again later.", "error")
        return redirect(url_for("index"))

    database.upsert_games(games_data)
    _enrich_games(games_data, today)
    _try_fetch_lineups(today)

    pending_picks = [p for p in database.get_picks_for_date(today) if p["result"] is None]
    updated = 0
    for p in pending_picks:
        game = database.get_game(p["game_pk"])
        if not game or game["status"] != "Final":
            continue
        if game["away_score"] is None or game["home_score"] is None:
            continue

        if p["picked_team_id"] == game["away_team_id"]:
            picked_score, opp_score = game["away_score"], game["home_score"]
        else:
            picked_score, opp_score = game["home_score"], game["away_score"]

        result = "W" if picked_score > opp_score else ("L" if picked_score < opp_score else "P")
        database.update_pick_result(p["game_pk"], result)
        updated += 1

    if updated:
        flash(f"Updated {updated} result{'s' if updated != 1 else ''}.", "success")
    else:
        flash("No new results to update.", "info")
    return redirect(url_for("index"))


# ---------------------------------------------------------------------------
# GET /history
# ---------------------------------------------------------------------------
@app.route("/history")
def history():
    record = database.get_season_record()
    picks = database.get_all_picks_with_games()
    return render_template("history.html", record=record, picks=picks)


if __name__ == "__main__":
    app.run(debug=True, port=5000)
