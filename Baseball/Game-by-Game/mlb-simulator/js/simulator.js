/* ═══════════════════════════════════════════════════════
   MLB SEASON SIMULATOR — CORE SIMULATION ENGINE
   ═══════════════════════════════════════════════════════ */

// ─── AT-BAT RESULT CONSTANTS ───
const AB_K    = 'K';
const AB_BB   = 'BB';
const AB_HBP  = 'HBP';
const AB_HR   = 'HR';
const AB_1B   = '1B';
const AB_2B   = '2B';
const AB_3B   = '3B';
const AB_OUT  = 'OUT';
const AB_GIDP = 'GIDP';

// ─── BASE STATE (bitmask) ───
// bit 0 (1) = runner on 1B, bit 1 (2) = 2B, bit 2 (4) = 3B
const BASE_1B = 1, BASE_2B = 2, BASE_3B = 4;

// ────────────────────────────────────────────────────────
// MATH HELPERS
// ────────────────────────────────────────────────────────
function clamp(val, lo, hi) { return Math.max(lo, Math.min(hi, val)); }

function comb(n, k) {
  if (k < 0 || k > n) return 0;
  if (k === 0 || k === n) return 1;
  let r = 1;
  for (let i = 0; i < k; i++) r = r * (n - i) / (i + 1);
  return r;
}

// Probability of winning a best-of-(2*needed-1) series, given single-game win prob p
function seriesWinProb(p, needed) {
  let prob = 0;
  for (let losses = 0; losses < needed; losses++) {
    prob += comb(needed - 1 + losses, losses) * Math.pow(p, needed) * Math.pow(1 - p, losses);
  }
  return clamp(prob, 0, 1);
}

// ────────────────────────────────────────────────────────
// AT-BAT PROBABILITY COMPUTATION
// Uses log5-style multiplicative blend: combined = batter * pitcher / league
// ────────────────────────────────────────────────────────
function computeAtBatProbs(batter, pitcher) {
  const LG = LEAGUE;

  // Log5 blend
  let k  = batter.k_pct * pitcher.k_pa  / LG.k_pct;
  let bb = batter.bb_pct * pitcher.bb_pa / LG.bb_pct;
  let hr = batter.hr_pa  * pitcher.hr_pa / LG.hr_pa;
  const hbp = batter.hbp_pct || LG.hbp_pct;

  // Clamp extremes
  k  = clamp(k,  0.04, 0.55);
  bb = clamp(bb, 0.02, 0.22);
  hr = clamp(hr, 0.004, 0.12);

  // Ball-in-play probability
  let bip = 1 - bb - k - hbp - hr;
  if (bip < 0.05) {
    const excess = 0.05 - bip;
    k -= excess * 0.6;
    hr -= excess * 0.4;
    bip = 0.05;
  }

  // Hits on balls in play (pitcher's BABIP control is minimal — use batter BABIP)
  const babip = batter.babip;
  const nonHrHits = bip * babip;

  // Distribute hits by type
  const d_frac = clamp(batter.d_frac, 0, 0.5);
  const t_frac = clamp(batter.t_frac, 0, 0.15);
  const d = nonHrHits * d_frac;
  const t = nonHrHits * t_frac;
  const s = nonHrHits * (1 - d_frac - t_frac);
  const out = bip - nonHrHits;

  return { bb, hbp, k, hr, s, d, t, out: Math.max(0, out) };
}

// ────────────────────────────────────────────────────────
// ROLL AT-BAT OUTCOME
// Returns a string result code
// ────────────────────────────────────────────────────────
function rollAtBat(probs, bases, outs) {
  const r = Math.random();
  let cum = probs.bb;
  if (r < cum) return AB_BB;
  cum += probs.hbp;
  if (r < cum) return AB_HBP;
  cum += probs.k;
  if (r < cum) return AB_K;
  cum += probs.hr;
  if (r < cum) return AB_HR;
  cum += probs.s;
  if (r < cum) return AB_1B;
  cum += probs.d;
  if (r < cum) return AB_2B;
  cum += probs.t;
  if (r < cum) return AB_3B;

  // Ball in play — out type
  // GIDP: ground ball double play when runner on 1B and <2 outs
  if (outs < 2 && (bases & BASE_1B) && Math.random() < 0.115) return AB_GIDP;
  return AB_OUT;
}

// ────────────────────────────────────────────────────────
// BASERUNNER ADVANCEMENT
// Returns { newBases, runs, outsAdded }
// ────────────────────────────────────────────────────────
function advanceRunners(bases, result, batter, outs) {
  const r1 = (bases & BASE_1B) !== 0;
  const r2 = (bases & BASE_2B) !== 0;
  const r3 = (bases & BASE_3B) !== 0;
  const spd = batter ? (batter.spd || 5) : 5;
  let newBases = 0;
  let runs = 0;

  switch (result) {

    case AB_HR:
      runs = (r1 ? 1 : 0) + (r2 ? 1 : 0) + (r3 ? 1 : 0) + 1;
      // newBases = 0 (all cleared)
      break;

    case AB_3B:
      runs = (r1 ? 1 : 0) + (r2 ? 1 : 0) + (r3 ? 1 : 0);
      newBases = BASE_3B; // batter at 3B
      break;

    case AB_2B:
      if (r3) runs++;
      if (r2) runs++;
      if (r1) {
        // Score from 1B on a double: speed-dependent (~40% base + spd bonus)
        const scoreProb = 0.35 + (spd - 5) * 0.06;
        if (Math.random() < scoreProb) runs++;
        else newBases |= BASE_3B; // stops at 3rd
      }
      newBases |= BASE_2B; // batter at 2B
      break;

    case AB_1B:
      if (r3) runs++;
      if (r2) {
        // Advance from 2B on single: usually score
        const scoreProb = 0.60 + (spd - 5) * 0.05;
        if (Math.random() < scoreProb) runs++;
        else newBases |= BASE_3B;
      }
      if (r1) newBases |= BASE_2B; // R1 advances to 2B
      newBases |= BASE_1B; // batter at 1B
      break;

    case AB_BB:
    case AB_HBP: {
      // Force advance chain
      newBases = BASE_1B; // batter always gets 1B
      if (r1) {
        newBases |= BASE_2B; // R1 forced to 2B
        if (r2) {
          newBases |= BASE_3B; // R2 forced to 3B
          if (r3) runs++;    // R3 forced home
        } else {
          if (r3) newBases |= BASE_3B; // R3 not forced, stays
        }
      } else {
        if (r2) newBases |= BASE_2B; // R2 stays (no force)
        if (r3) newBases |= BASE_3B; // R3 stays
      }
      break;
    }

    case AB_GIDP:
      // 2 outs recorded: R1 out at 2B, batter out at 1B
      // R3 scores, R2 advances to 3B
      if (r3) runs++;
      if (r2) newBases |= BASE_3B;
      return { newBases, runs, outsAdded: 2 };

    case AB_OUT:
      // Standard out — runners generally don't advance
      // Sacrifice fly exception: R3 with <2 outs
      if (r3 && outs < 2) {
        const sfProb = 0.30 + (spd - 5) * 0.02; // speed helps with tag-up
        if (Math.random() < sfProb) {
          runs++;
          // Other runners stay
          if (r1) newBases |= BASE_1B;
          if (r2) newBases |= BASE_2B;
          break;
        }
      }
      // R2 might advance to 3B on ground ball
      if (r2 && !r3 && Math.random() < 0.15) {
        newBases |= BASE_3B;
        if (r1) newBases |= BASE_1B;
      } else {
        newBases = bases; // no change
      }
      break;

    case AB_K:
      newBases = bases; // no change on strikeout
      break;

    default:
      newBases = bases;
  }

  return { newBases, runs, outsAdded: 1 };
}

// ────────────────────────────────────────────────────────
// PLAY DESCRIPTION GENERATOR (for Watch Game mode)
// ────────────────────────────────────────────────────────
const PLAY_TEMPLATES = {
  [AB_K]: [
    'strikes out swinging', 'called out on strikes', 'chases a breaking ball for strike three',
    'fans on a slider', 'goes down on a fastball at the knees',
  ],
  [AB_BB]: [
    'draws a walk', 'earns a free pass', 'works the count full and walks',
    'takes ball four for a walk', 'gets a walk on 6 pitches',
  ],
  [AB_HBP]: [
    'is hit by a pitch', 'takes a fastball off the elbow', 'hit by an inside breaking ball',
  ],
  [AB_HR]: [
    '🚀 GONE! A solo blast to left!', '💥 HOME RUN! Crushed to deep center!',
    '⚡ LAUNCHES one over the right field wall!', '🔥 BOMBS one into the upper deck!',
    '🎆 TOWERING home run to left-center!',
  ],
  [AB_1B]: [
    'singles to left', 'lines a single up the middle', 'pokes one the other way for a single',
    'slaps a hit to right', 'legs out an infield single', 'bloops a single into shallow left',
  ],
  [AB_2B]: [
    'rips a double into the corner', 'doubles to the gap', 'laces a double down the line',
    'two-bagger into left-center', 'drives one off the wall for a double',
  ],
  [AB_3B]: [
    'legs it out for a triple!', 'drives it to the warning track for a triple!',
    'smacks a triple down the right field line!',
  ],
  [AB_OUT]: [
    'grounds out to short', 'flies out to center', 'lines out to second',
    'pops up to the first baseman', 'grounds to third, thrown out at first',
    'flies out to left', 'bounces to the second baseman for the out',
  ],
  [AB_GIDP]: [
    'bounces into an inning-ending double play', 'hits into a 6-4-3 double play',
    'grounds into a twin killing — inning over',
  ],
};

function getPlayDescription(result, batter, pitcher, runs, rbi) {
  const templates = PLAY_TEMPLATES[result] || ['makes an out'];
  let base = templates[Math.floor(Math.random() * templates.length)];
  let desc = '';

  if (result === AB_HR) {
    const tag = rbi > 1 ? `${rbi}-run ` : rbi === 1 ? 'solo ' : '';
    const tpl = base.replace('A solo blast', `A ${tag}blast`).replace('HOME RUN!', `${tag.toUpperCase()}HOME RUN!`);
    desc = `${batter.name} — ${tpl}${rbi > 1 ? ` (${rbi} RBI)` : ''}`;
  } else {
    desc = `${batter.name} ${base}`;
    if (runs > 0) {
      desc += `, scoring ${runs === 1 ? 'a run' : runs + ' runs'}`;
    }
  }
  return desc;
}

// ────────────────────────────────────────────────────────
// SIMULATE HALF-INNING
// Returns { runs, hits, nextLineupPos, plays (optional), pitchesUsed }
// opts: { fast, walkoff, awayScore, homeScore }
// ────────────────────────────────────────────────────────
function simulateHalfInning(lineup, lineupPos, pitcher, opts = {}) {
  let outs = 0;
  let bases = 0;
  let runs = 0;
  let hits = 0;
  let pitchesUsed = 0;
  const plays = [];

  while (outs < 3) {
    const batter = lineup[lineupPos % 9];
    lineupPos = (lineupPos + 1) % 9;

    const probs = computeAtBatProbs(batter, pitcher);
    const result = rollAtBat(probs, bases, outs);
    const isHit = result === AB_1B || result === AB_2B || result === AB_3B || result === AB_HR;
    if (isHit) hits++;

    const { newBases, runs: runScored, outsAdded } = advanceRunners(bases, result, batter, outs);

    // Rough pitch count per at-bat
    if (!opts.fast) {
      const basePitches = result === AB_K || result === AB_BB ? 5 : 3;
      pitchesUsed += basePitches + Math.floor(Math.random() * 3);
    }

    bases = newBases;
    runs += runScored;

    // Walk-off check (bottom of 9th+)
    if (opts.walkoff && (opts.homeScore + runs) > opts.awayScore) {
      if (!opts.fast) {
        const desc = getPlayDescription(result, batter, pitcher, runScored, runScored);
        plays.push({ result, batter: batter.name, pitcher: pitcher.name,
          description: desc, runs: runScored, rbi: runScored, bases, outs,
          inningEnded: true, walkoff: true });
      }
      outs = 3;
      break;
    }

    outs += outsAdded;

    if (!opts.fast) {
      const desc = getPlayDescription(result, batter, pitcher, runScored, runScored);
      plays.push({ result, batter: batter.name, pos: batter.pos, pitcher: pitcher.name,
        description: desc, runs: runScored, rbi: runScored,
        bases, outs: Math.min(outs, 3) });
    }
  }

  return {
    runs, hits,
    nextLineupPos: lineupPos % 9,
    plays,
    pitchesUsed: opts.fast ? (outs * 4 + runs * 2) : pitchesUsed,
  };
}

// ────────────────────────────────────────────────────────
// SIMULATE GAME
// opts: { fast: bool, withPlays: bool }
// Returns full game result object
// ────────────────────────────────────────────────────────
function simulateGame(homeTeam, awayTeam, opts = {}) {
  const fast = opts.fast || false;

  // Select starting pitchers from rotation
  // opts.homeRotIdx / opts.awayRotIdx allow callers to pass explicit rotation slots
  const homeRotIdx = opts.homeRotIdx !== undefined ? opts.homeRotIdx : (homeTeam._rotIdx || 0);
  const awayRotIdx = opts.awayRotIdx !== undefined ? opts.awayRotIdx : (awayTeam._rotIdx || 0);
  const homeSP = homeTeam.rotation[homeRotIdx % homeTeam.rotation.length];
  const awaySP = awayTeam.rotation[awayRotIdx % awayTeam.rotation.length];

  // Mutable pitcher state (outsRetired, pitchCount)
  const homePitcher = { ...homeSP, outsRetired: 0, pitchCount: 0, isBullpen: false };
  const awayPitcher = { ...awaySP, outsRetired: 0, pitchCount: 0, isBullpen: false };
  const homeBullpen = { ...homeTeam.bullpen_pitcher, outsRetired: 0, pitchCount: 0, isBullpen: true };
  const awayBullpen = { ...awayTeam.bullpen_pitcher, outsRetired: 0, pitchCount: 0, isBullpen: true };

  let homeScore = 0, awayScore = 0;
  let homeHits = 0, awayHits = 0;
  const homeInningRuns = [], awayInningRuns = [];
  let homeLineupPos = 0, awayLineupPos = 0;

  const allPlays = []; // for watch game mode

  for (let inning = 1; inning <= 18; inning++) {
    // ── TOP HALF (away bats) ──
    // Determine which pitcher the home team is using
    const homeCurrentPitcher = (!homePitcher.isBullpen && homePitcher.outsRetired >= homeSP.stamina * 3)
      ? homeBullpen : homePitcher;

    if (!fast && opts.withPlays) {
      allPlays.push({ type: 'inning-header', text: `▶ Top of the ${ordinal(inning)}`, half: 'top', inning });
    }

    const topResult = simulateHalfInning(
      awayTeam.lineup, awayLineupPos, homeCurrentPitcher,
      { fast }
    );

    awayScore += topResult.runs;
    awayHits  += topResult.hits;
    awayInningRuns.push(topResult.runs);
    awayLineupPos = topResult.nextLineupPos;
    homeCurrentPitcher.outsRetired += 3;
    homeCurrentPitcher.pitchCount  += topResult.pitchesUsed;

    if (!fast && opts.withPlays && topResult.plays.length) {
      topResult.plays.forEach(p => allPlays.push({ ...p, half: 'top', inning,
        awayScore, homeScore }));
    }

    // ── BOTTOM HALF (home bats) ──
    const awayCurrentPitcher = (!awayPitcher.isBullpen && awayPitcher.outsRetired >= awaySP.stamina * 3)
      ? awayBullpen : awayPitcher;

    // Don't play bottom of 9th+ if home is already winning
    if (inning >= 9 && homeScore > awayScore) {
      homeInningRuns.push(undefined); // game over, no bottom inning
      break;
    }

    if (!fast && opts.withPlays) {
      allPlays.push({ type: 'inning-header', text: `▶ Bottom of the ${ordinal(inning)}`, half: 'bottom', inning });
    }

    const bottomResult = simulateHalfInning(
      homeTeam.lineup, homeLineupPos, awayCurrentPitcher,
      {
        fast,
        walkoff: inning >= 9,
        awayScore,
        homeScore,
      }
    );

    homeScore += bottomResult.runs;
    homeHits  += bottomResult.hits;
    homeInningRuns.push(bottomResult.runs);
    homeLineupPos = bottomResult.nextLineupPos;
    awayCurrentPitcher.outsRetired += 3;
    awayCurrentPitcher.pitchCount  += bottomResult.pitchesUsed;

    if (!fast && opts.withPlays && bottomResult.plays.length) {
      bottomResult.plays.forEach(p => allPlays.push({ ...p, half: 'bottom', inning,
        awayScore, homeScore }));
    }

    // ── GAME OVER CHECK ──
    if (inning >= 9 && homeScore !== awayScore) break;
  }

  const winner = homeScore > awayScore ? 'home' : 'away';

  if (!fast && opts.withPlays) {
    const winTeam  = winner === 'home' ? homeTeam.name : awayTeam.name;
    const loseTeam = winner === 'home' ? awayTeam.name : homeTeam.name;
    const ws = winner === 'home' ? homeScore : awayScore;
    const ls = winner === 'home' ? awayScore : homeScore;
    allPlays.push({ type: 'game-over',
      text: `🏆 Final: ${winTeam} ${ws}, ${loseTeam} ${ls}` });
  }

  return {
    homeTeam, awayTeam,
    homeScore, awayScore,
    homeHits, awayHits,
    homeInningRuns, awayInningRuns,
    winner,
    plays: allPlays,
    homeSP: homeSP.name,
    awaySP: awaySP.name,
    homeRotIdx,
    awayRotIdx,
  };
}

function ordinal(n) {
  const s = ['th','st','nd','rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

// ────────────────────────────────────────────────────────
// SCHEDULE GENERATION
// Creates a ~2430-game schedule (each team plays ~162)
// ────────────────────────────────────────────────────────
function generateSchedule(teams) {
  const games = [];

  // Index teams by division and league
  const byDiv = {};
  const byLeague = { AL: [], NL: [] };
  teams.forEach(t => {
    (byDiv[t.division] = byDiv[t.division] || []).push(t);
    byLeague[t.league].push(t);
  });

  // ── Division games: 19 per pair ──
  Object.values(byDiv).forEach(div => {
    for (let i = 0; i < div.length; i++) {
      for (let j = i + 1; j < div.length; j++) {
        for (let g = 0; g < 19; g++) {
          // Alternate home team
          games.push(g % 2 === 0
            ? { home: div[i], away: div[j] }
            : { home: div[j], away: div[i] });
        }
      }
    }
  });

  // ── Same league, cross-division: 7 per pair ──
  ['AL', 'NL'].forEach(lg => {
    const lgTeams = byLeague[lg];
    for (let i = 0; i < lgTeams.length; i++) {
      for (let j = i + 1; j < lgTeams.length; j++) {
        if (lgTeams[i].division === lgTeams[j].division) continue;
        for (let g = 0; g < 7; g++) {
          games.push(g < 4
            ? { home: lgTeams[i], away: lgTeams[j] }
            : { home: lgTeams[j], away: lgTeams[i] });
        }
      }
    }
  });

  // ── Interleague: every AL-NL pair once, plus extras ──
  const alTeams = byLeague['AL'];
  const nlTeams = byLeague['NL'];
  alTeams.forEach((alT, i) => {
    nlTeams.forEach((nlT, j) => {
      // Home alternates
      games.push((i + j) % 2 === 0
        ? { home: alT, away: nlT }
        : { home: nlT, away: alT });
    });
    // 1 extra game per AL team (paired with the same-index NL team)
    const extra = nlTeams[i % nlTeams.length];
    games.push(i % 2 === 0
      ? { home: alT, away: extra }
      : { home: extra, away: alT });
  });

  // Fisher-Yates shuffle
  for (let i = games.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = games[i]; games[i] = games[j]; games[j] = tmp;
  }

  return games;
}

// ────────────────────────────────────────────────────────
// SIMULATE FULL SEASON
// Returns standings object
// ────────────────────────────────────────────────────────
function simulateSeason(teams) {
  // Reset team records
  teams.forEach(t => {
    t._w = 0; t._l = 0; t._rs = 0; t._ra = 0; t._rotIdx = 0;
  });

  const schedule = generateSchedule(teams);

  for (const game of schedule) {
    const result = simulateGame(game.home, game.away, { fast: true });

    if (result.homeScore > result.awayScore) {
      game.home._w++;
      game.away._l++;
    } else {
      game.away._w++;
      game.home._l++;
    }

    game.home._rs += result.homeScore;
    game.home._ra += result.awayScore;
    game.away._rs += result.awayScore;
    game.away._ra += result.homeScore;

    // Rotate pitching staff
    game.home._rotIdx = (game.home._rotIdx + 1) % 5;
    game.away._rotIdx = (game.away._rotIdx + 1) % 5;
  }

  return buildStandings(teams);
}

// ────────────────────────────────────────────────────────
// BUILD STANDINGS FROM TEAM RECORDS
// ────────────────────────────────────────────────────────
function buildStandings(teams) {
  const divisions = {};

  teams.forEach(t => {
    (divisions[t.division] = divisions[t.division] || []).push({
      team: t,
      id:   t.id,
      name: t.name,
      abbr: t.id,
      division: t.division,
      league: t.league,
      w: t._w || 0,
      l: t._l || 0,
      rs: t._rs || 0,
      ra: t._ra || 0,
    });
  });

  const DIVISION_ORDER = [
    'AL East', 'AL Central', 'AL West',
    'NL East', 'NL Central', 'NL West',
  ];

  const result = {};
  DIVISION_ORDER.forEach(div => {
    if (!divisions[div]) return;
    const sorted = divisions[div].sort((a, b) => {
      const pctA = a.w / (a.w + a.l || 1);
      const pctB = b.w / (b.w + b.l || 1);
      return pctB - pctA;
    });
    const leader = sorted[0];
    result[div] = sorted.map((entry, i) => ({
      ...entry,
      pct: (entry.w / Math.max(entry.w + entry.l, 1)),
      gb: i === 0 ? '-' : ((leader.w - entry.w + entry.l - leader.l) / 2).toFixed(1),
    }));
  });

  return result;
}

// ────────────────────────────────────────────────────────
// SIMULATE PLAYOFFS
// Takes standings, returns playoff results
// ────────────────────────────────────────────────────────
function simulatePlayoffs(standings) {
  // Collect teams from each league
  const alTeams = [
    ...standings['AL East'],
    ...standings['AL Central'],
    ...standings['AL West'],
  ];
  const nlTeams = [
    ...standings['NL East'],
    ...standings['NL Central'],
    ...standings['NL West'],
  ];

  // Get division winners and wild cards
  function getPlayoffField(divTeams) {
    // Mark division winners
    const eastWinner   = divTeams.slice(0,5)[0];
    const centralWinner= divTeams.slice(5,10)[0];
    const westWinner   = divTeams.slice(10,15)[0];
    const divWinners   = [eastWinner, centralWinner, westWinner];

    // Remaining teams sorted by wins for wild card
    const rest = divTeams.filter(t => !divWinners.includes(t))
      .sort((a, b) => b.w - a.w);

    const wildcards = rest.slice(0, 3);

    // Seed: best overall record gets 1, etc.
    const field = [...divWinners, ...wildcards].sort((a, b) => b.w - a.w);
    return { field, divWinners };
  }

  // Simulate a series: returns winner probabilistically
  function simSeries(a, b) {
    const totalW = a.w + b.w;
    if (totalW === 0) return Math.random() < 0.5 ? a : b;
    const pA = clamp(a.w / totalW, 0.15, 0.85);
    return Math.random() < pA ? a : b;
  }

  const { field: alField } = getPlayoffField(alTeams);
  const { field: nlField } = getPlayoffField(nlTeams);

  // AL Bracket: 1 vs 4/5 winner, 2 vs 3/6 winner
  // Wild card round (3 vs 6, 4 vs 5):
  const alWc1 = simSeries(alField[3], alField[4]); // seeds 4 vs 5
  const alWc2 = simSeries(alField[2], alField[5]); // seeds 3 vs 6
  // Division Series:
  const alDs1 = simSeries(alField[0], alWc1);
  const alDs2 = simSeries(alField[1], alWc2);
  // Championship Series:
  const alChamp = simSeries(alDs1, alDs2);

  const nlWc1 = simSeries(nlField[3], nlField[4]);
  const nlWc2 = simSeries(nlField[2], nlField[5]);
  const nlDs1 = simSeries(nlField[0], nlWc1);
  const nlDs2 = simSeries(nlField[1], nlWc2);
  const nlChamp = simSeries(nlDs1, nlDs2);

  // World Series
  const wsWinner = simSeries(alChamp, nlChamp);

  return {
    alPlayoffTeams: alField,
    nlPlayoffTeams: nlField,
    alChampion: alChamp,
    nlChampion: nlChamp,
    worldSeriesWinner: wsWinner,
  };
}

// ────────────────────────────────────────────────────────
// MONTE CARLO ORCHESTRATOR
// Runs N season simulations and returns aggregated results
// progressCallback(pct 0-1) called periodically
// ────────────────────────────────────────────────────────
async function runMonteCarlo(teams, N, progressCallback) {
  // Initialize accumulators
  const acc = {};
  teams.forEach(t => {
    acc[t.id] = {
      id: t.id,
      name: t.name,
      abbr: t.id,
      division: t.division,
      league: t.league,
      color: t.color,
      wins: [],
      divTitles: 0,
      playoffs: 0,
      wsAppear: 0,
      wsWins: 0,
    };
  });

  const CHUNK = 5; // yield to browser every 5 sims

  for (let sim = 0; sim < N; sim++) {
    // Simulate one full season
    const standings = simulateSeason(teams);
    const playoffs  = simulatePlayoffs(standings);

    // Record wins per team
    Object.values(standings).forEach(divEntries => {
      divEntries.forEach(entry => {
        acc[entry.id].wins.push(entry.w);
      });
    });

    // Mark division winners (first team in each division)
    Object.values(standings).forEach(divEntries => {
      if (divEntries.length > 0) {
        acc[divEntries[0].id].divTitles++;
      }
    });

    // Playoff teams
    [...playoffs.alPlayoffTeams, ...playoffs.nlPlayoffTeams].forEach(t => {
      if (acc[t.id]) acc[t.id].playoffs++;
    });

    // WS appearances
    if (acc[playoffs.alChampion.id]) acc[playoffs.alChampion.id].wsAppear++;
    if (acc[playoffs.nlChampion.id]) acc[playoffs.nlChampion.id].wsAppear++;

    // WS winner
    if (acc[playoffs.worldSeriesWinner.id]) acc[playoffs.worldSeriesWinner.id].wsWins++;

    // Yield to browser periodically
    if ((sim + 1) % CHUNK === 0 || sim === N - 1) {
      progressCallback((sim + 1) / N);
      await new Promise(r => setTimeout(r, 0));
    }
  }

  // Aggregate results
  return Object.values(acc).map(a => {
    const winsArr = a.wins;
    const avgWins = winsArr.length ? winsArr.reduce((s, v) => s + v, 0) / winsArr.length : 81;
    const minWins = winsArr.length ? Math.min(...winsArr) : 0;
    const maxWins = winsArr.length ? Math.max(...winsArr) : 162;
    return {
      ...a,
      avgWins: Math.round(avgWins * 10) / 10,
      minWins,
      maxWins,
      divTitlePct: a.divTitles / N,
      playoffPct: a.playoffs / N,
      wsAppearPct: a.wsAppear / N,
      wsWinPct: a.wsWins / N,
    };
  });
}
