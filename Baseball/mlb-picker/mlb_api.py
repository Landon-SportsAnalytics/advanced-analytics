import requests
from datetime import datetime

BASE_URL = "https://statsapi.mlb.com/api/v1"
HYDRATIONS = "probablePitcher,linescore,decisions,team"


def fetch_games(date_str):
    """Fetch and parse all MLB games for a given date (YYYY-MM-DD)."""
    url = f"{BASE_URL}/schedule"
    params = {"sportId": 1, "date": date_str, "hydrate": HYDRATIONS}
    try:
        resp = requests.get(url, params=params, timeout=10)
        resp.raise_for_status()
        data = resp.json()
    except requests.RequestException:
        return []

    games = []
    for date_entry in data.get("dates", []):
        for game in date_entry.get("games", []):
            parsed = _parse_game(game, date_str)
            if parsed:
                games.append(parsed)
    return games


def _parse_game(game, game_date):
    """Parse a single game object from the MLB API schedule response."""
    try:
        game_pk = game["gamePk"]
        game_time_utc = game.get("gameDate", "")
        venue = game.get("venue", {})
        venue_name = venue.get("name", "Unknown Venue")
        venue_id = venue.get("id")
        status = game.get("status", {}).get("abstractGameState", "Preview")

        teams = game.get("teams", {})
        away = teams.get("away", {})
        home = teams.get("home", {})
        away_team = away.get("team", {})
        home_team = home.get("team", {})
        away_record = away.get("leagueRecord", {})
        home_record = home.get("leagueRecord", {})

        away_prob = away.get("probablePitcher", {})
        home_prob = home.get("probablePitcher", {})

        return {
            "game_pk": game_pk,
            "game_date": game_date,
            "game_time_utc": game_time_utc,
            "venue_name": venue_name,
            "venue_id": venue_id,
            "status": status,
            "away_team_id": away_team.get("id"),
            "away_team_name": away_team.get("name", ""),
            "away_team_abbr": away_team.get("abbreviation", ""),
            "away_wins": away_record.get("wins", 0),
            "away_losses": away_record.get("losses", 0),
            "away_pitcher": away_prob.get("fullName"),
            "away_pitcher_id": away_prob.get("id"),
            "away_score": away.get("score"),
            "home_team_id": home_team.get("id"),
            "home_team_name": home_team.get("name", ""),
            "home_team_abbr": home_team.get("abbreviation", ""),
            "home_wins": home_record.get("wins", 0),
            "home_losses": home_record.get("losses", 0),
            "home_pitcher": home_prob.get("fullName"),
            "home_pitcher_id": home_prob.get("id"),
            "home_score": home.get("score"),
        }
    except (KeyError, TypeError):
        return None


def fetch_pitcher_stats(person_id, season):
    """Fetch season pitching stats for a player. Returns dict or None."""
    if not person_id:
        return None
    url = f"{BASE_URL}/people/{person_id}/stats"
    params = {"stats": "season", "group": "pitching", "season": season}
    try:
        resp = requests.get(url, params=params, timeout=8)
        resp.raise_for_status()
        data = resp.json()
        splits = data["stats"][0]["splits"]
        if not splits:
            return None
        stat = splits[0]["stat"]
        return {
            "era": stat.get("era", "-.--"),
            "wins": stat.get("wins", 0),
            "losses": stat.get("losses", 0),
        }
    except (requests.RequestException, KeyError, IndexError):
        return None


def fetch_venue_info(venue_id):
    """Fetch field dimensions for a venue. Returns dict or None."""
    if not venue_id:
        return None
    url = f"{BASE_URL}/venues/{venue_id}"
    params = {"hydrate": "fieldInfo"}
    try:
        resp = requests.get(url, params=params, timeout=8)
        resp.raise_for_status()
        data = resp.json()
        venue = data["venues"][0]
        fi = venue.get("fieldInfo", {})
        if not fi:
            return None
        return {
            "venue_id": venue_id,
            "venue_name": venue.get("name", ""),
            "left_line":    fi.get("leftLine"),
            "left_center":  fi.get("leftCenter"),
            "center":       fi.get("center"),
            "right_center": fi.get("rightCenter"),
            "right_line":   fi.get("rightLine"),
            "roof_type":    fi.get("roofType"),
            "turf_type":    fi.get("turfType"),
        }
    except (requests.RequestException, KeyError, IndexError):
        return None


def fetch_lineups(game_pk):
    """Fetch batting lineups for a game. Returns {"away": [...], "home": [...]} or None."""
    # Try the dedicated lineups endpoint first
    result = _fetch_from_lineups_endpoint(game_pk)
    if result:
        return result
    # Fall back to boxscore (works for Live/Final games)
    return _fetch_from_boxscore(game_pk)


def _fetch_from_lineups_endpoint(game_pk):
    url = f"{BASE_URL}/game/{game_pk}/lineups"
    try:
        resp = requests.get(url, timeout=8)
        resp.raise_for_status()
        data = resp.json()
        away_raw = data.get("awayPlayers") or data.get("away", {}).get("players", [])
        home_raw = data.get("homePlayers") or data.get("home", {}).get("players", [])
        if not away_raw and not home_raw:
            return None
        return {
            "away": _parse_lineup_list(away_raw),
            "home": _parse_lineup_list(home_raw),
        }
    except (requests.RequestException, KeyError, ValueError):
        return None


def _fetch_from_boxscore(game_pk):
    url = f"{BASE_URL}/game/{game_pk}/boxscore"
    try:
        resp = requests.get(url, timeout=8)
        resp.raise_for_status()
        data = resp.json()
        teams = data.get("teams", {})

        def parse_side(side_data):
            order = side_data.get("battingOrder", [])
            players = side_data.get("players", {})
            if not order:
                return []
            result = []
            for pid in order:
                key = f"ID{pid}"
                p = players.get(key, {})
                person = p.get("person", {})
                pos = p.get("position", {})
                result.append({
                    "name": person.get("fullName", "Unknown"),
                    "position": pos.get("abbreviation", ""),
                })
            return result

        away = parse_side(teams.get("away", {}))
        home = parse_side(teams.get("home", {}))
        if not away and not home:
            return None
        return {"away": away, "home": home}
    except (requests.RequestException, KeyError):
        return None


def _parse_lineup_list(players):
    """Sort players by battingOrder (100/200/…) and return [{name, position}]."""
    sortable = []
    for p in players:
        order = p.get("battingOrder") or p.get("battingOrderId") or 9999
        name = p.get("fullName") or p.get("person", {}).get("fullName", "Unknown")
        pos = (p.get("primaryPosition") or p.get("position") or {}).get("abbreviation", "")
        sortable.append((int(order), name, pos))
    sortable.sort()
    return [{"name": name, "position": pos} for _, name, pos in sortable]


def utc_to_local(utc_str):
    """Convert a UTC ISO datetime string to local time for display."""
    if not utc_str:
        return ""
    try:
        utc_str_clean = utc_str.replace("Z", "+00:00")
        dt_utc = datetime.fromisoformat(utc_str_clean)
        dt_local = dt_utc.astimezone()
        return dt_local.strftime("%I:%M %p").lstrip("0")
    except (ValueError, OSError):
        return utc_str


if __name__ == "__main__":
    from datetime import date
    today = date.today().isoformat()
    games = fetch_games(today)
    print(f"Found {len(games)} games on {today}")
    for g in games:
        print(f"  {g['away_team_abbr']} (P:{g['away_pitcher_id']}) @ "
              f"{g['home_team_abbr']} (P:{g['home_pitcher_id']}) "
              f"- {g['status']} venue:{g['venue_id']}")
