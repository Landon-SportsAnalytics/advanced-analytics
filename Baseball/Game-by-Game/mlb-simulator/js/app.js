/* ═══════════════════════════════════════════════════════
   MLB SEASON SIMULATOR — UI CONTROLLER
   ═══════════════════════════════════════════════════════ */

// ────────────────────────────────────────────────────────
// GLOBALS
// ────────────────────────────────────────────────────────
let watchGameState = null;   // current watch-game session
let autoPlayTimer  = null;   // setInterval handle for auto-play
let mcRunning      = false;  // prevent double MC run
let wasAutoPlaying = false;  // true if autoplay was running when last game ended

// Per-team rotation index for Watch Game (persists across games within a session)
const watchRotIdx = {};  // keyed by team id

// ────────────────────────────────────────────────────────
// TAB NAVIGATION
// ────────────────────────────────────────────────────────
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(s => s.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.tab).classList.add('active');
  });
});

// ────────────────────────────────────────────────────────
// POPULATE TEAM SELECTORS
// ────────────────────────────────────────────────────────
function populateTeamDropdowns() {
  const makeOptions = (selectEl, defaultIdx) => {
    MLB_TEAMS.forEach((t, i) => {
      const opt = document.createElement('option');
      opt.value = i;
      opt.textContent = `${t.city} ${t.name.split(' ').pop()} (${t.id})`;
      if (i === defaultIdx) opt.selected = true;
      selectEl.appendChild(opt);
    });
  };

  makeOptions(document.getElementById('awayTeamSelect'), 0);   // Yankees
  makeOptions(document.getElementById('homeTeamSelect'), 17);  // Dodgers

  // Team browser
  const browseSelect = document.getElementById('teamBrowseSelect');
  MLB_TEAMS.forEach((t, i) => {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = `${t.name} (${t.id})`;
    browseSelect.appendChild(opt);
  });
  browseSelect.addEventListener('change', () => renderTeamProfile(MLB_TEAMS[browseSelect.value]));
  renderTeamProfile(MLB_TEAMS[0]);
}

// ────────────────────────────────────────────────────────
// WATCH GAME — SETUP
// ────────────────────────────────────────────────────────
document.getElementById('startGameBtn').addEventListener('click', () => {
  const homeIdx = parseInt(document.getElementById('homeTeamSelect').value);
  const awayIdx = parseInt(document.getElementById('awayTeamSelect').value);
  if (homeIdx === awayIdx) { alert('Home and Away teams must be different.'); return; }

  const home = MLB_TEAMS[homeIdx];
  const away = MLB_TEAMS[awayIdx];

  // Get (or initialize) rotation index for each team in Watch Game mode
  if (watchRotIdx[home.id] === undefined) watchRotIdx[home.id] = 0;
  if (watchRotIdx[away.id] === undefined) watchRotIdx[away.id] = 0;

  // Simulate game WITH play-by-play, passing explicit rotation slots
  const result = simulateGame(home, away, {
    fast: false,
    withPlays: true,
    homeRotIdx: watchRotIdx[home.id],
    awayRotIdx: watchRotIdx[away.id],
  });

  // Advance rotation for next time these teams play
  watchRotIdx[home.id] = (watchRotIdx[home.id] + 1) % home.rotation.length;
  watchRotIdx[away.id] = (watchRotIdx[away.id] + 1) % away.rotation.length;

  // Set up watch state
  watchGameState = {
    result,
    playIndex: 0,
    homeScore: 0,
    awayScore: 0,
    homeHits: 0,
    awayHits: 0,
    inningScores: {
      home: Array(9).fill(null),
      away: Array(9).fill(null),
    },
    currentInning: 1,
    currentHalf: 'top',
    currentOuts: 0,
    bases: 0,
  };

  // Show game display
  document.getElementById('gameDisplay').style.display = 'block';

  // Set team labels
  document.getElementById('awayTeamLabel').textContent = away.id;
  document.getElementById('homeTeamLabel').textContent = home.id;
  document.getElementById('awayLineupHeader').textContent = `${away.name} Lineup`;
  document.getElementById('homeLineupHeader').textContent = `${home.name} Lineup`;

  // Clear scoreboard
  clearScoreboard();
  updateDiamond(0);
  updateOuts(0);
  document.getElementById('inningLabel').textContent = 'Top 1st';
  clearPlayLog();
  renderLineups(away, home);
  // Use the actual starters selected for this game (from rotation index)
  const homeStarterForGame = home.rotation[result.homeRotIdx % home.rotation.length];
  const awayStarterForGame = away.rotation[result.awayRotIdx % away.rotation.length];
  updateMatchupCard(
    away.lineup[0],
    homeStarterForGame,
    home.bullpen_pitcher,
    0
  );
  highlightLineup('away', 0);
  highlightLineup('home', -1);

  // Enable controls
  document.getElementById('stepBtn').disabled = false;
  document.getElementById('autoBtn').disabled = false;
  document.getElementById('speedSelect').disabled = false;

  addPlayEntry('▶ Play Ball!', 'inning-header');

  // If autoplay was running when the last game ended, resume it automatically
  if (wasAutoPlaying) {
    wasAutoPlaying = false;
    document.getElementById('autoBtn').click();
  }
});

// ────────────────────────────────────────────────────────
// WATCH GAME — STEP / AUTO PLAY
// ────────────────────────────────────────────────────────
document.getElementById('stepBtn').addEventListener('click', stepPlay);
document.getElementById('autoBtn').addEventListener('click', () => {
  const btn = document.getElementById('autoBtn');
  if (autoPlayTimer) {
    // Manual pause — user explicitly stopped, don't resume on next game
    wasAutoPlaying = false;
    clearInterval(autoPlayTimer);
    autoPlayTimer = null;
    btn.textContent = 'Auto Play';
    btn.classList.remove('playing');
  } else {
    btn.textContent = '⏸ Pause';
    btn.classList.add('playing');
    const speed = parseInt(document.getElementById('speedSelect').value);
    autoPlayTimer = setInterval(() => {
      const done = stepPlay();
      if (done) {
        // Game ended naturally during autoplay — remember this
        wasAutoPlaying = true;
        clearInterval(autoPlayTimer);
        autoPlayTimer = null;
        btn.textContent = 'Auto Play';
        btn.classList.remove('playing');
      }
    }, speed);
  }
});

function stepPlay() {
  if (!watchGameState) return true;
  const { result, playIndex } = watchGameState;
  if (playIndex >= result.plays.length) return true;

  const play = result.plays[playIndex];
  watchGameState.playIndex++;

  processPlay(play);

  if (play.type === 'game-over') {
    document.getElementById('stepBtn').disabled = true;
    document.getElementById('autoBtn').disabled = true;
    return true;
  }
  return false;
}

function processPlay(play) {
  if (!play) return;

  // ── Inning header ──
  if (play.type === 'inning-header') {
    addPlayEntry(play.text, 'inning-header');
    watchGameState.currentInning  = play.inning;
    watchGameState.currentHalf    = play.half;
    watchGameState.bases          = 0;
    watchGameState.currentOuts    = 0;
    watchGameState._inningWritten = false; // reset guard for each half-inning
    updateDiamond(0);
    updateOuts(0);

    const label = `${play.half === 'top' ? 'Top' : 'Bot'} ${ordinal(play.inning)}`;
    document.getElementById('inningLabel').textContent = label;

    // Highlight scoreboard inning column
    highlightInningColumn(play.inning);
    return;
  }

  // ── Game over ──
  if (play.type === 'game-over') {
    addPlayEntry(play.text, 'game-over');
    return;
  }

  // ── Normal at-bat play ──
  const isHome = watchGameState.currentHalf === 'bottom';
  const homeTeam = watchGameState.result.homeTeam;
  const awayTeam = watchGameState.result.awayTeam;

  // Update scores
  if (play.runs > 0) {
    if (isHome) {
      watchGameState.homeScore += play.runs;
      document.getElementById('homeR').textContent = watchGameState.homeScore;
    } else {
      watchGameState.awayScore += play.runs;
      document.getElementById('awayR').textContent = watchGameState.awayScore;
    }
  }

  // Update hits
  const isHit = [AB_1B, AB_2B, AB_3B, AB_HR].includes(play.result);
  if (isHit) {
    if (isHome) {
      watchGameState.homeHits++;
      document.getElementById('homeH').textContent = watchGameState.homeHits;
    } else {
      watchGameState.awayHits++;
      document.getElementById('awayH').textContent = watchGameState.awayHits;
    }
  }

  // Update outs and bases
  watchGameState.currentOuts = Math.min(play.outs, 3);
  watchGameState.bases       = play.bases || 0;
  updateOuts(watchGameState.currentOuts);
  updateDiamond(watchGameState.bases);

  // Update inning score cell when half inning ends (3 outs)
  // Use the pre-computed per-inning run totals from the game result
  if (watchGameState.currentOuts === 3 && !watchGameState._inningWritten) {
    watchGameState._inningWritten = true; // guard: only write once per half-inning
    const inning = watchGameState.currentInning;
    if (inning >= 1 && inning <= 9) {
      const runs = isHome
        ? (watchGameState.result.homeInningRuns[inning - 1] ?? 0)
        : (watchGameState.result.awayInningRuns[inning - 1] ?? 0);
      const cellId = isHome ? `h${inning}` : `a${inning}`;
      const cell = document.getElementById(cellId);
      if (cell && cell.textContent === '') cell.textContent = runs;
    }
  }

  // Update matchup card
  const battingTeam  = isHome ? homeTeam : awayTeam;
  const pitchingTeam = isHome ? awayTeam : homeTeam;

  // Find current batter in lineup
  const lineup = battingTeam.lineup;
  const batterObj = lineup.find(p => p.name === play.batter) || lineup[0];

  // Use the rotation slot stored in the game result — not the live team object
  const gameResult = watchGameState.result;
  const pitRotIdx = isHome ? gameResult.awayRotIdx : gameResult.homeRotIdx;
  const pitcherObj = pitchingTeam.rotation[pitRotIdx % pitchingTeam.rotation.length];

  updateMatchupCard(batterObj, pitcherObj, pitchingTeam.bullpen_pitcher, 0);

  // Highlight lineup row
  const lineupIdx = lineup.indexOf(batterObj);
  highlightLineup(isHome ? 'home' : 'away', lineupIdx);

  // Log the play
  let cssClass = '';
  if (play.result === AB_HR) cssClass = 'home-run';
  else if (play.result === AB_K) cssClass = 'strikeout';
  else if (play.runs > 0) cssClass = 'run-scored';
  addPlayEntry(play.description, cssClass);
}

// ────────────────────────────────────────────────────────
// SCOREBOARD HELPERS
// ────────────────────────────────────────────────────────
function clearScoreboard() {
  for (let i = 1; i <= 9; i++) {
    const a = document.getElementById(`a${i}`);
    const h = document.getElementById(`h${i}`);
    if (a) a.textContent = '';
    if (h) h.textContent = '';
    if (a) a.className = '';
    if (h) h.className = '';
  }
  document.getElementById('awayR').textContent = '0';
  document.getElementById('awayH').textContent = '0';
  document.getElementById('homeR').textContent = '0';
  document.getElementById('homeH').textContent = '0';
}

function highlightInningColumn(inning) {
  // Remove old highlight
  document.querySelectorAll('.inning-active').forEach(el => el.classList.remove('inning-active'));
  const a = document.getElementById(`a${inning}`);
  const h = document.getElementById(`h${inning}`);
  if (a) a.classList.add('inning-active');
  if (h) h.classList.add('inning-active');
}

// ────────────────────────────────────────────────────────
// DIAMOND DISPLAY
// ────────────────────────────────────────────────────────
function updateDiamond(bases) {
  document.getElementById('base1').classList.toggle('occupied', !!(bases & BASE_1B));
  document.getElementById('base2').classList.toggle('occupied', !!(bases & BASE_2B));
  document.getElementById('base3').classList.toggle('occupied', !!(bases & BASE_3B));
}

function updateOuts(outs) {
  for (let i = 1; i <= 3; i++) {
    document.getElementById(`out${i}`).classList.toggle('active', i <= outs);
  }
}

// ────────────────────────────────────────────────────────
// LINEUP DISPLAY
// ────────────────────────────────────────────────────────
function renderLineups(awayTeam, homeTeam) {
  function renderList(listEl, lineup) {
    listEl.innerHTML = '';
    lineup.forEach((player, i) => {
      const li = document.createElement('li');
      li.dataset.idx = i;
      li.innerHTML = `<span class="ln-pos">${player.pos}</span>${player.name}`;
      listEl.appendChild(li);
    });
  }
  renderList(document.getElementById('awayLineupList'), awayTeam.lineup);
  renderList(document.getElementById('homeLineupList'), homeTeam.lineup);
}

function highlightLineup(side, idx) {
  const listEl = document.getElementById(side === 'away' ? 'awayLineupList' : 'homeLineupList');
  listEl.querySelectorAll('li').forEach(li => {
    li.classList.toggle('batting-now', parseInt(li.dataset.idx) === idx);
  });
}

// ────────────────────────────────────────────────────────
// MATCHUP CARD
// ────────────────────────────────────────────────────────
function updateMatchupCard(batter, pitcher, bullpen, pitchCount) {
  if (batter) {
    document.getElementById('batterName').textContent = batter.name;
    document.getElementById('batterPos').textContent  = batter.pos;
    const avg = batter.babip ? `.${Math.round(batter.babip * 1000)}` : '.300';
    const hrPct = batter.hr_pa ? `${(batter.hr_pa * 100).toFixed(1)}% HR` : '';
    document.getElementById('batterStats').textContent =
      `BB%: ${(batter.bb_pct * 100).toFixed(1)}  K%: ${(batter.k_pct * 100).toFixed(1)}  BABIP: ${avg}  ${hrPct}`;
  }
  if (pitcher) {
    document.getElementById('pitcherName').textContent = pitcher.name;
    document.getElementById('pitcherStats').textContent =
      `ERA: ${pitcher.era}  K/9: ${pitcher.k9}  BB/9: ${pitcher.bb9}`;
    document.getElementById('pitchCount').textContent = `Pitches: ${pitchCount}`;
  }
}

// ────────────────────────────────────────────────────────
// PLAY BY PLAY LOG
// ────────────────────────────────────────────────────────
function addPlayEntry(text, cssClass = '') {
  const log = document.getElementById('playLog');
  const div = document.createElement('div');
  div.className = `play-entry ${cssClass}`;
  div.textContent = text;
  log.appendChild(div);
  log.scrollTop = log.scrollHeight;
}

function clearPlayLog() {
  document.getElementById('playLog').innerHTML = '';
}

// ────────────────────────────────────────────────────────
// SINGLE SEASON STANDINGS
// ────────────────────────────────────────────────────────
document.getElementById('simSingleBtn').addEventListener('click', () => {
  document.getElementById('standingsSeason').textContent = 'Simulating...';
  // Defer to next tick so the UI updates
  setTimeout(() => {
    const teams = MLB_TEAMS.map(t => ({ ...t })); // shallow copy to preserve original
    const standings = simulateSeason(MLB_TEAMS);
    renderStandingsDisplay(standings);
    document.getElementById('standingsSeason').textContent = '2025 Season';
  }, 10);
});

function renderStandingsDisplay(standings) {
  const container = document.getElementById('standingsDisplay');
  const DIVISION_ORDER = [
    'AL East', 'AL Central', 'AL West',
    'NL East', 'NL Central', 'NL West',
  ];

  container.innerHTML = '<div class="standings-grid"></div>';
  const grid = container.querySelector('.standings-grid');

  DIVISION_ORDER.forEach(divName => {
    const divData = standings[divName];
    if (!divData) return;

    const divEl = document.createElement('div');
    divEl.className = 'standings-division';

    const rows = divData.map((entry, i) => {
      let rowClass = '';
      if (i === 0) rowClass = 'playoff-spot';
      else if (i <= 2) rowClass = 'wildcard-spot'; // rough WC indication
      const pctStr = entry.pct.toFixed(3).replace(/^0/, '');
      return `<tr class="${rowClass}">
        <td>${entry.name}</td>
        <td>${entry.w}</td>
        <td>${entry.l}</td>
        <td class="pct-col">${pctStr}</td>
        <td class="gb-col">${entry.gb}</td>
        <td>${entry.rs}–${entry.ra}</td>
      </tr>`;
    }).join('');

    divEl.innerHTML = `
      <div class="division-title">${divName}</div>
      <table class="standings-table">
        <thead>
          <tr>
            <th>Team</th><th>W</th><th>L</th><th>PCT</th><th>GB</th><th>R</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>`;
    grid.appendChild(divEl);
  });
}

// ────────────────────────────────────────────────────────
// MONTE CARLO
// ────────────────────────────────────────────────────────
let mcResults = null;
let mcLeagueView = 'AL';

document.getElementById('runMCBtn').addEventListener('click', async () => {
  if (mcRunning) return;
  mcRunning = true;

  const N = parseInt(document.getElementById('simCount').value);
  document.getElementById('mcProgress').style.display = 'block';
  document.getElementById('mcResults').style.display   = 'none';
  document.getElementById('runMCBtn').disabled          = true;

  mcResults = await runMonteCarlo(MLB_TEAMS, N, pct => {
    document.getElementById('progressFill').style.width = `${Math.round(pct * 100)}%`;
    document.getElementById('progressText').textContent =
      `Simulating season ${Math.round(pct * N)} / ${N}...`;
  });

  document.getElementById('mcProgress').style.display = 'none';
  document.getElementById('mcResults').style.display   = 'block';
  document.getElementById('runMCBtn').disabled          = false;
  mcRunning = false;

  renderMCResults(mcResults, mcLeagueView);
});

// League tab switching for MC results
document.querySelectorAll('.results-tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.results-tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    mcLeagueView = btn.dataset.league;
    if (mcResults) renderMCResults(mcResults, mcLeagueView);
  });
});

function renderMCResults(results, league) {
  const container = document.getElementById('mcTable');
  container.innerHTML = '';

  const DIVISIONS = league === 'AL'
    ? ['AL East', 'AL Central', 'AL West']
    : ['NL East', 'NL Central', 'NL West'];

  DIVISIONS.forEach(divName => {
    const divTeams = results
      .filter(r => r.division === divName)
      .sort((a, b) => b.playoffPct - a.playoffPct);

    const rows = divTeams.map(r => {
      const playoff = (r.playoffPct * 100).toFixed(1);
      const div     = (r.divTitlePct * 100).toFixed(1);
      const ws      = (r.wsWinPct * 100).toFixed(1);
      const avgW    = r.avgWins.toFixed(1);

      const playoffBar = Math.round(r.playoffPct * 100);
      const divBar     = Math.round(r.divTitlePct * 100);
      const wsBar      = Math.round(r.wsWinPct * 100);

      return `<tr>
        <td>
          <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${r.color};margin-right:8px;vertical-align:middle"></span>
          ${r.name}
        </td>
        <td>${avgW}<br><span class="win-range">${r.minWins}–${r.maxWins}</span></td>
        <td class="bar-cell">
          <div class="pct-bar-wrap">
            <div class="pct-bar" style="width:${divBar}px"></div>
            <span class="pct-num">${div}%</span>
          </div>
        </td>
        <td class="bar-cell">
          <div class="pct-bar-wrap">
            <div class="pct-bar div" style="width:${playoffBar}px"></div>
            <span class="pct-num">${playoff}%</span>
          </div>
        </td>
        <td class="bar-cell">
          <div class="pct-bar-wrap">
            <div class="pct-bar ws" style="width:${Math.min(wsBar * 3, 100)}px"></div>
            <span class="pct-num">${ws}%</span>
          </div>
        </td>
      </tr>`;
    }).join('');

    const section = document.createElement('div');
    section.className = 'mc-division';
    section.innerHTML = `
      <div class="mc-division-title">${divName}</div>
      <table class="mc-table">
        <thead>
          <tr>
            <th>Team</th>
            <th>Avg W (range)</th>
            <th>Div Title %</th>
            <th>Playoff %</th>
            <th>WS Win %</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>`;
    container.appendChild(section);
  });
}

// ────────────────────────────────────────────────────────
// TEAMS BROWSER
// ────────────────────────────────────────────────────────
function renderTeamProfile(team) {
  const container = document.getElementById('teamDisplay');

  const lineupRows = team.lineup.map((p, i) => {
    const avg = p.babip ? p.babip.toFixed(3).replace(/^0/, '') : '.300';
    const hr  = p.hr_pa ? (p.hr_pa * 100).toFixed(1) : '0.0';
    return `<tr>
      <td>${i + 1}. <span class="pos-tag">${p.pos}</span>${p.name}</td>
      <td>${(p.bb_pct * 100).toFixed(1)}%</td>
      <td>${(p.k_pct * 100).toFixed(1)}%</td>
      <td>${avg}</td>
      <td>${hr}%</td>
      <td>${p.spd || 5}/10</td>
    </tr>`;
  }).join('');

  const rotationRows = team.rotation.map((p, i) => {
    return `<tr>
      <td>${i + 1}. ${p.name}</td>
      <td>${p.era}</td>
      <td>${p.k9}</td>
      <td>${p.bb9}</td>
      <td>${p.hr9}</td>
      <td>${p.stamina} IP</td>
    </tr>`;
  }).join('');

  const bp = team.bullpen;

  container.innerHTML = `
    <div class="team-profile">
      <div class="team-profile-header">
        <div class="team-color-bar" style="background:${team.color}"></div>
        <div>
          <div class="team-name-display">${team.name}</div>
          <div class="team-meta">${team.division} · ${team.league}</div>
        </div>
      </div>

      <div class="profile-card">
        <div class="profile-card-title">Batting Lineup</div>
        <table class="profile-table">
          <thead>
            <tr><th>Player</th><th>BB%</th><th>K%</th><th>BABIP</th><th>HR/PA</th><th>Spd</th></tr>
          </thead>
          <tbody>${lineupRows}</tbody>
        </table>
      </div>

      <div class="profile-card">
        <div class="profile-card-title">Starting Rotation</div>
        <table class="profile-table">
          <thead>
            <tr><th>Pitcher</th><th>ERA</th><th>K/9</th><th>BB/9</th><th>HR/9</th><th>Stamina</th></tr>
          </thead>
          <tbody>
            ${rotationRows}
            <tr style="opacity:0.6">
              <td>Bullpen (aggregate)</td>
              <td>${bp.era}</td>
              <td>${bp.k9}</td>
              <td>${bp.bb9}</td>
              <td>${bp.hr9}</td>
              <td>—</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>`;
}

// ────────────────────────────────────────────────────────
// INIT
// ────────────────────────────────────────────────────────
populateTeamDropdowns();
