/* ═══════════════════════════════════════════════════════
   MLB SEASON SIMULATOR — TEAM & PLAYER DATA
   Stats based on 2025 season rosters
   ═══════════════════════════════════════════════════════ */

const LEAGUE = {
  bb_pct:   0.083,
  k_pct:    0.228,
  hr_pa:    0.029,
  babip:    0.297,
  d_frac:   0.240,   // fraction of non-HR hits that are doubles
  t_frac:   0.025,   // fraction of non-HR hits that are triples
  era:      4.33,
  k9:       8.70,
  bb9:      3.10,
  hr9:      1.10,
  hbp_pct:  0.010,
  PA_PER_9: 38,      // avg batters faced per 9 innings
};

/* ─────────────────────────────────────────
   TEAM DATA  (batter fields per PA)
   bb_pct  = walk %     k_pct  = strikeout %
   babip   = BABIP      hr_pa  = HR / PA
   d_frac  = 2B / (non-HR hits)
   t_frac  = 3B / (non-HR hits)
   spd     = speed 1-10
   ─────────────────────────────────────────
   pitcher fields (per 9 innings)
   k9 bb9 hr9 era stamina(innings)
   ───────────────────────────────────────── */

const MLB_TEAMS = [

  // ═══════════════ AL EAST ═══════════════

  {
    id: 'NYY', name: 'New York Yankees', city: 'New York', league: 'AL', division: 'AL East',
    color: '#003087', accentColor: '#E4002C',
    lineup: [
      { name: 'Aaron Judge',       pos: 'RF', bb_pct:.165, k_pct:.240, babip:.335, hr_pa:.072, d_frac:.24, t_frac:.01, spd:4 },
      { name: 'Paul Goldschmidt',  pos: '1B', bb_pct:.120, k_pct:.225, babip:.305, hr_pa:.035, d_frac:.27, t_frac:.01, spd:5 },
      { name: 'Giancarlo Stanton', pos: 'DH', bb_pct:.098, k_pct:.298, babip:.308, hr_pa:.058, d_frac:.22, t_frac:.01, spd:3 },
      { name: 'Cody Bellinger',    pos: 'CF', bb_pct:.095, k_pct:.235, babip:.298, hr_pa:.030, d_frac:.26, t_frac:.03, spd:7 },
      { name: 'Anthony Volpe',     pos: 'SS', bb_pct:.068, k_pct:.232, babip:.292, hr_pa:.031, d_frac:.22, t_frac:.04, spd:8 },
      { name: 'Austin Wells',      pos: 'C',  bb_pct:.082, k_pct:.265, babip:.302, hr_pa:.038, d_frac:.23, t_frac:.01, spd:4 },
      { name: 'Jazz Chisholm Jr.', pos: '3B', bb_pct:.072, k_pct:.255, babip:.305, hr_pa:.035, d_frac:.24, t_frac:.04, spd:8 },
      { name: 'Trent Grisham',     pos: 'LF', bb_pct:.098, k_pct:.258, babip:.298, hr_pa:.022, d_frac:.24, t_frac:.03, spd:6 },
      { name: 'Jon Berti',         pos: '2B', bb_pct:.068, k_pct:.215, babip:.295, hr_pa:.012, d_frac:.20, t_frac:.05, spd:9 },
    ],
    rotation: [
      { name: 'Gerrit Cole',    k9:11.8, bb9:2.0, hr9:0.95, era:3.41, stamina:7 },
      { name: 'Max Fried',      k9: 9.5, bb9:2.5, hr9:0.80, era:3.25, stamina:7 },
      { name: 'Clarke Schmidt', k9: 9.2, bb9:2.8, hr9:1.10, era:4.18, stamina:6 },
      { name: 'Marcus Stroman', k9: 7.8, bb9:2.5, hr9:0.95, era:4.06, stamina:6 },
      { name: 'Nestor Cortés',  k9: 9.0, bb9:2.2, hr9:1.05, era:4.22, stamina:6 },
    ],
    bullpen: { k9:9.2, bb9:3.2, hr9:1.05, era:3.85 },
  },

  {
    id: 'BAL', name: 'Baltimore Orioles', city: 'Baltimore', league: 'AL', division: 'AL East',
    color: '#DF4601', accentColor: '#000000',
    lineup: [
      { name: 'Gunnar Henderson',   pos: 'SS', bb_pct:.095, k_pct:.225, babip:.320, hr_pa:.048, d_frac:.25, t_frac:.02, spd:7 },
      { name: 'Adley Rutschman',    pos: 'C',  bb_pct:.130, k_pct:.195, babip:.295, hr_pa:.030, d_frac:.28, t_frac:.01, spd:5 },
      { name: 'Ryan Mountcastle',   pos: '1B', bb_pct:.055, k_pct:.245, babip:.288, hr_pa:.040, d_frac:.23, t_frac:.01, spd:4 },
      { name: 'Cedric Mullins',     pos: 'CF', bb_pct:.075, k_pct:.195, babip:.312, hr_pa:.025, d_frac:.26, t_frac:.04, spd:8 },
      { name: 'Jackson Holliday',   pos: '2B', bb_pct:.082, k_pct:.238, babip:.298, hr_pa:.020, d_frac:.25, t_frac:.04, spd:7 },
      { name: 'Jordan Westburg',    pos: '3B', bb_pct:.065, k_pct:.220, babip:.302, hr_pa:.032, d_frac:.28, t_frac:.03, spd:6 },
      { name: 'Colton Cowser',      pos: 'LF', bb_pct:.085, k_pct:.248, babip:.310, hr_pa:.030, d_frac:.25, t_frac:.03, spd:7 },
      { name: 'Tyler O\'Neill',     pos: 'RF', bb_pct:.078, k_pct:.278, babip:.295, hr_pa:.040, d_frac:.22, t_frac:.02, spd:7 },
      { name: 'Ramon Urias',        pos: 'DH', bb_pct:.065, k_pct:.210, babip:.278, hr_pa:.025, d_frac:.22, t_frac:.02, spd:5 },
    ],
    rotation: [
      { name: 'Grayson Rodriguez',   k9:10.2, bb9:3.2, hr9:1.10, era:4.00, stamina:6 },
      { name: 'Kyle Bradish',        k9: 9.8, bb9:2.5, hr9:0.85, era:3.76, stamina:6 },
      { name: 'Cade Povich',         k9: 9.0, bb9:2.8, hr9:1.00, era:4.10, stamina:6 },
      { name: 'Albert Suárez',       k9: 7.5, bb9:2.2, hr9:1.00, era:3.88, stamina:6 },
      { name: 'Dean Kremer',         k9: 8.0, bb9:2.8, hr9:1.20, era:4.50, stamina:6 },
    ],
    bullpen: { k9:9.0, bb9:3.2, hr9:1.10, era:4.00 },
  },

  {
    id: 'BOS', name: 'Boston Red Sox', city: 'Boston', league: 'AL', division: 'AL East',
    color: '#BD3039', accentColor: '#0C2340',
    lineup: [
      { name: 'Jarren Duran',     pos: 'CF', bb_pct:.080, k_pct:.195, babip:.348, hr_pa:.028, d_frac:.28, t_frac:.04, spd:8 },
      { name: 'Rafael Devers',    pos: 'DH', bb_pct:.085, k_pct:.210, babip:.295, hr_pa:.042, d_frac:.28, t_frac:.01, spd:4 },
      { name: 'Alex Bregman',     pos: '3B', bb_pct:.122, k_pct:.135, babip:.295, hr_pa:.030, d_frac:.28, t_frac:.01, spd:5 },
      { name: 'Triston Casas',    pos: '1B', bb_pct:.120, k_pct:.272, babip:.310, hr_pa:.045, d_frac:.25, t_frac:.01, spd:4 },
      { name: 'Masataka Yoshida', pos: 'LF', bb_pct:.090, k_pct:.098, babip:.320, hr_pa:.025, d_frac:.30, t_frac:.02, spd:4 },
      { name: 'Tyler O\'Neill',   pos: 'RF', bb_pct:.078, k_pct:.278, babip:.295, hr_pa:.040, d_frac:.22, t_frac:.02, spd:7 },
      { name: 'Ceddanne Rafaela', pos: 'CF', bb_pct:.040, k_pct:.225, babip:.305, hr_pa:.018, d_frac:.22, t_frac:.05, spd:9 },
      { name: 'Connor Wong',      pos: 'C',  bb_pct:.062, k_pct:.258, babip:.298, hr_pa:.028, d_frac:.23, t_frac:.02, spd:6 },
      { name: 'David Hamilton',   pos: 'SS', bb_pct:.065, k_pct:.220, babip:.295, hr_pa:.018, d_frac:.22, t_frac:.04, spd:8 },
    ],
    rotation: [
      { name: 'Garrett Crochet', k9:12.5, bb9:3.2, hr9:0.85, era:3.58, stamina:6 },
      { name: 'Brayan Bello',    k9: 9.2, bb9:2.8, hr9:1.05, era:3.90, stamina:6 },
      { name: 'Kutter Crawford', k9: 9.5, bb9:3.2, hr9:1.15, era:4.45, stamina:6 },
      { name: 'Tanner Houck',    k9: 8.8, bb9:3.0, hr9:0.95, era:4.07, stamina:6 },
      { name: 'Walker Buehler',  k9: 9.5, bb9:2.8, hr9:1.05, era:4.20, stamina:6 },
    ],
    bullpen: { k9:8.8, bb9:3.5, hr9:1.15, era:4.25 },
  },

  {
    id: 'TOR', name: 'Toronto Blue Jays', city: 'Toronto', league: 'AL', division: 'AL East',
    color: '#134A8E', accentColor: '#E8291C',
    lineup: [
      { name: 'Vladimir Guerrero', pos: '1B', bb_pct:.095, k_pct:.175, babip:.310, hr_pa:.045, d_frac:.26, t_frac:.01, spd:4 },
      { name: 'Anthony Santander', pos: 'RF', bb_pct:.088, k_pct:.240, babip:.285, hr_pa:.052, d_frac:.22, t_frac:.01, spd:4 },
      { name: 'Bo Bichette',       pos: 'SS', bb_pct:.065, k_pct:.185, babip:.315, hr_pa:.032, d_frac:.26, t_frac:.03, spd:7 },
      { name: 'Daulton Varsho',    pos: 'CF', bb_pct:.095, k_pct:.238, babip:.290, hr_pa:.035, d_frac:.25, t_frac:.03, spd:8 },
      { name: 'Alejandro Kirk',    pos: 'C',  bb_pct:.105, k_pct:.135, babip:.298, hr_pa:.025, d_frac:.25, t_frac:.01, spd:2 },
      { name: 'Davis Schneider',   pos: 'DH', bb_pct:.092, k_pct:.278, babip:.308, hr_pa:.042, d_frac:.24, t_frac:.02, spd:5 },
      { name: 'Spencer Horwitz',   pos: 'LF', bb_pct:.105, k_pct:.195, babip:.305, hr_pa:.018, d_frac:.27, t_frac:.02, spd:5 },
      { name: 'Isiah Kiner-Falefa',pos: '3B', bb_pct:.065, k_pct:.168, babip:.305, hr_pa:.012, d_frac:.22, t_frac:.05, spd:8 },
      { name: 'Ernie Clement',     pos: '2B', bb_pct:.055, k_pct:.185, babip:.278, hr_pa:.015, d_frac:.22, t_frac:.03, spd:6 },
    ],
    rotation: [
      { name: 'Kevin Gausman',  k9:10.8, bb9:2.2, hr9:0.95, era:3.60, stamina:7 },
      { name: 'José Berríos',   k9: 8.5, bb9:2.8, hr9:1.15, era:4.30, stamina:6 },
      { name: 'Chris Bassitt',  k9: 8.0, bb9:2.5, hr9:1.10, era:4.80, stamina:6 },
      { name: 'Yusei Kikuchi',  k9: 9.5, bb9:3.0, hr9:1.25, era:4.55, stamina:6 },
      { name: 'Bowden Francis', k9: 9.0, bb9:2.8, hr9:1.20, era:4.40, stamina:6 },
    ],
    bullpen: { k9:8.5, bb9:3.5, hr9:1.20, era:4.30 },
  },

  {
    id: 'TB', name: 'Tampa Bay Rays', city: 'St. Petersburg', league: 'AL', division: 'AL East',
    color: '#092C5C', accentColor: '#8FBCE6',
    lineup: [
      { name: 'Yandy Díaz',    pos: '1B', bb_pct:.110, k_pct:.125, babip:.308, hr_pa:.022, d_frac:.32, t_frac:.02, spd:5 },
      { name: 'Brandon Lowe',  pos: '2B', bb_pct:.095, k_pct:.250, babip:.295, hr_pa:.038, d_frac:.26, t_frac:.02, spd:6 },
      { name: 'Isaac Paredes', pos: '3B', bb_pct:.110, k_pct:.195, babip:.290, hr_pa:.042, d_frac:.24, t_frac:.01, spd:4 },
      { name: 'Richie Palacios',pos:'LF', bb_pct:.070, k_pct:.200, babip:.300, hr_pa:.015, d_frac:.25, t_frac:.04, spd:6 },
      { name: 'Harold Ramírez', pos:'RF', bb_pct:.055, k_pct:.158, babip:.312, hr_pa:.020, d_frac:.28, t_frac:.02, spd:5 },
      { name: 'Josh Lowe',     pos: 'CF', bb_pct:.085, k_pct:.260, babip:.315, hr_pa:.028, d_frac:.25, t_frac:.04, spd:7 },
      { name: 'José Siri',     pos: 'DH', bb_pct:.042, k_pct:.308, babip:.320, hr_pa:.030, d_frac:.22, t_frac:.05, spd:9 },
      { name: 'Ben Rortvedt',  pos: 'C',  bb_pct:.080, k_pct:.238, babip:.278, hr_pa:.020, d_frac:.22, t_frac:.01, spd:4 },
      { name: 'Amed Rosario',  pos: 'SS', bb_pct:.045, k_pct:.168, babip:.308, hr_pa:.015, d_frac:.24, t_frac:.04, spd:7 },
    ],
    rotation: [
      { name: 'Zach Eflin',   k9: 8.5, bb9:1.8, hr9:1.10, era:3.99, stamina:6 },
      { name: 'Shane Baz',    k9:10.0, bb9:2.8, hr9:1.00, era:3.80, stamina:6 },
      { name: 'Taj Bradley',  k9:10.2, bb9:3.0, hr9:1.05, era:4.10, stamina:6 },
      { name: 'Aaron Civale', k9: 7.5, bb9:2.5, hr9:1.10, era:4.60, stamina:6 },
      { name: 'Ryan Pepiot',  k9: 9.0, bb9:3.0, hr9:0.90, era:4.20, stamina:6 },
    ],
    bullpen: { k9:9.5, bb9:3.5, hr9:1.05, era:3.90 },
  },

  // ═══════════════ AL CENTRAL ═══════════════

  {
    id: 'CLE', name: 'Cleveland Guardians', city: 'Cleveland', league: 'AL', division: 'AL Central',
    color: '#00385D', accentColor: '#E31937',
    lineup: [
      { name: 'Steven Kwan',    pos: 'LF', bb_pct:.105, k_pct:.112, babip:.352, hr_pa:.015, d_frac:.28, t_frac:.03, spd:8 },
      { name: 'José Ramírez',   pos: '3B', bb_pct:.095, k_pct:.135, babip:.305, hr_pa:.050, d_frac:.28, t_frac:.03, spd:7 },
      { name: 'Josh Naylor',    pos: '1B', bb_pct:.080, k_pct:.178, babip:.298, hr_pa:.038, d_frac:.25, t_frac:.02, spd:4 },
      { name: 'Lane Thomas',    pos: 'CF', bb_pct:.075, k_pct:.235, babip:.305, hr_pa:.032, d_frac:.24, t_frac:.03, spd:7 },
      { name: 'David Fry',      pos: 'C',  bb_pct:.085, k_pct:.218, babip:.302, hr_pa:.035, d_frac:.25, t_frac:.01, spd:5 },
      { name: 'Bo Naylor',      pos: 'DH', bb_pct:.088, k_pct:.258, babip:.295, hr_pa:.028, d_frac:.24, t_frac:.02, spd:6 },
      { name: 'Tyler Freeman',  pos: '2B', bb_pct:.060, k_pct:.160, babip:.325, hr_pa:.012, d_frac:.24, t_frac:.05, spd:8 },
      { name: 'Gabriel Arias',  pos: 'SS', bb_pct:.040, k_pct:.238, babip:.285, hr_pa:.020, d_frac:.22, t_frac:.03, spd:6 },
      { name: 'Will Brennan',   pos: 'RF', bb_pct:.060, k_pct:.175, babip:.308, hr_pa:.018, d_frac:.26, t_frac:.03, spd:6 },
    ],
    rotation: [
      { name: 'Tanner Bibee',    k9: 9.8, bb9:2.5, hr9:1.00, era:3.60, stamina:6 },
      { name: 'Ben Lively',      k9: 8.2, bb9:1.8, hr9:1.05, era:3.90, stamina:6 },
      { name: 'Logan Allen',     k9: 9.0, bb9:3.0, hr9:0.95, era:4.00, stamina:6 },
      { name: 'Gavin Williams',  k9:10.2, bb9:3.5, hr9:1.05, era:4.20, stamina:6 },
      { name: 'Matthew Boyd',    k9: 8.5, bb9:2.8, hr9:1.10, era:4.20, stamina:6 },
    ],
    bullpen: { k9:9.5, bb9:3.0, hr9:0.95, era:3.75 },
  },

  {
    id: 'DET', name: 'Detroit Tigers', city: 'Detroit', league: 'AL', division: 'AL Central',
    color: '#0C2340', accentColor: '#FA4616',
    lineup: [
      { name: 'Riley Greene',    pos: 'LF', bb_pct:.095, k_pct:.235, babip:.325, hr_pa:.030, d_frac:.28, t_frac:.04, spd:8 },
      { name: 'Spencer Torkelson',pos:'1B',bb_pct:.105, k_pct:.260, babip:.290, hr_pa:.038, d_frac:.24, t_frac:.01, spd:4 },
      { name: 'Kerry Carpenter',  pos:'RF', bb_pct:.080, k_pct:.248, babip:.305, hr_pa:.040, d_frac:.25, t_frac:.02, spd:5 },
      { name: 'Mark Canha',       pos:'DH', bb_pct:.108, k_pct:.215, babip:.295, hr_pa:.022, d_frac:.26, t_frac:.03, spd:5 },
      { name: 'Colt Keith',       pos:'2B', bb_pct:.078, k_pct:.228, babip:.310, hr_pa:.025, d_frac:.28, t_frac:.03, spd:6 },
      { name: 'Matt Vierling',    pos:'CF', bb_pct:.065, k_pct:.218, babip:.305, hr_pa:.022, d_frac:.24, t_frac:.03, spd:7 },
      { name: 'Javier Báez',      pos:'SS', bb_pct:.042, k_pct:.295, babip:.288, hr_pa:.030, d_frac:.22, t_frac:.03, spd:7 },
      { name: 'Jake Rogers',      pos:'C',  bb_pct:.068, k_pct:.288, babip:.278, hr_pa:.025, d_frac:.20, t_frac:.01, spd:4 },
      { name: 'Andy Ibáñez',      pos:'3B', bb_pct:.075, k_pct:.195, babip:.285, hr_pa:.020, d_frac:.24, t_frac:.02, spd:5 },
    ],
    rotation: [
      { name: 'Tarik Skubal',  k9:11.8, bb9:1.6, hr9:0.90, era:2.39, stamina:7 },
      { name: 'Jack Flaherty', k9:10.2, bb9:2.8, hr9:0.85, era:3.17, stamina:6 },
      { name: 'Reese Olson',   k9: 9.5, bb9:2.5, hr9:1.05, era:3.80, stamina:6 },
      { name: 'Kenta Maeda',   k9: 8.8, bb9:2.5, hr9:1.10, era:4.20, stamina:6 },
      { name: 'Alex Faedo',    k9: 8.5, bb9:2.8, hr9:1.20, era:4.50, stamina:6 },
    ],
    bullpen: { k9:9.0, bb9:3.2, hr9:1.05, era:3.90 },
  },

  {
    id: 'MIN', name: 'Minnesota Twins', city: 'Minneapolis', league: 'AL', division: 'AL Central',
    color: '#002B5C', accentColor: '#D31145',
    lineup: [
      { name: 'Byron Buxton',    pos: 'CF', bb_pct:.065, k_pct:.285, babip:.328, hr_pa:.048, d_frac:.22, t_frac:.04, spd:9 },
      { name: 'Carlos Correa',   pos: 'SS', bb_pct:.108, k_pct:.165, babip:.295, hr_pa:.038, d_frac:.26, t_frac:.01, spd:5 },
      { name: 'Max Kepler',      pos: 'RF', bb_pct:.105, k_pct:.225, babip:.288, hr_pa:.038, d_frac:.26, t_frac:.02, spd:6 },
      { name: 'Ryan Jeffers',    pos: 'C',  bb_pct:.085, k_pct:.228, babip:.295, hr_pa:.038, d_frac:.25, t_frac:.01, spd:4 },
      { name: 'Royce Lewis',     pos: '3B', bb_pct:.075, k_pct:.248, babip:.318, hr_pa:.038, d_frac:.27, t_frac:.03, spd:7 },
      { name: 'Trevor Larnach',  pos: 'LF', bb_pct:.095, k_pct:.252, babip:.305, hr_pa:.032, d_frac:.25, t_frac:.02, spd:5 },
      { name: 'Jose Miranda',    pos: 'DH', bb_pct:.062, k_pct:.215, babip:.290, hr_pa:.028, d_frac:.25, t_frac:.02, spd:5 },
      { name: 'Willi Castro',    pos: '2B', bb_pct:.065, k_pct:.225, babip:.308, hr_pa:.020, d_frac:.24, t_frac:.04, spd:7 },
      { name: 'Alex Kirilloff',  pos: '1B', bb_pct:.085, k_pct:.210, babip:.308, hr_pa:.025, d_frac:.28, t_frac:.02, spd:5 },
    ],
    rotation: [
      { name: 'Pablo López',     k9:10.2, bb9:2.2, hr9:0.90, era:3.43, stamina:7 },
      { name: 'Joe Ryan',        k9: 9.5, bb9:2.0, hr9:1.15, era:3.71, stamina:6 },
      { name: 'Bailey Ober',     k9: 9.8, bb9:1.8, hr9:1.10, era:3.85, stamina:6 },
      { name: 'Chris Paddack',   k9: 8.5, bb9:2.5, hr9:1.05, era:4.15, stamina:6 },
      { name: 'Louie Varland',   k9: 8.0, bb9:3.0, hr9:1.20, era:4.50, stamina:6 },
    ],
    bullpen: { k9:8.8, bb9:3.2, hr9:1.10, era:4.05 },
  },

  {
    id: 'CWS', name: 'Chicago White Sox', city: 'Chicago', league: 'AL', division: 'AL Central',
    color: '#27251F', accentColor: '#C4CED4',
    lineup: [
      { name: 'Luis Robert Jr.', pos: 'CF', bb_pct:.050, k_pct:.298, babip:.320, hr_pa:.048, d_frac:.22, t_frac:.04, spd:8 },
      { name: 'Andrew Vaughn',   pos: '1B', bb_pct:.068, k_pct:.215, babip:.292, hr_pa:.032, d_frac:.24, t_frac:.01, spd:4 },
      { name: 'Oscar Colas',     pos: 'DH', bb_pct:.050, k_pct:.258, babip:.270, hr_pa:.025, d_frac:.22, t_frac:.02, spd:5 },
      { name: 'Lenyn Sosa',      pos: '2B', bb_pct:.042, k_pct:.245, babip:.278, hr_pa:.020, d_frac:.22, t_frac:.02, spd:5 },
      { name: 'Tommy Pham',      pos: 'LF', bb_pct:.090, k_pct:.235, babip:.285, hr_pa:.020, d_frac:.23, t_frac:.03, spd:6 },
      { name: 'Paul DeJong',     pos: 'SS', bb_pct:.072, k_pct:.262, babip:.278, hr_pa:.028, d_frac:.22, t_frac:.02, spd:5 },
      { name: 'Korey Lee',       pos: 'C',  bb_pct:.058, k_pct:.258, babip:.285, hr_pa:.025, d_frac:.22, t_frac:.02, spd:5 },
      { name: 'Nicky López',     pos: '3B', bb_pct:.060, k_pct:.178, babip:.280, hr_pa:.010, d_frac:.20, t_frac:.04, spd:7 },
      { name: 'Gavin Sheets',    pos: 'RF', bb_pct:.065, k_pct:.248, babip:.278, hr_pa:.022, d_frac:.24, t_frac:.01, spd:4 },
    ],
    rotation: [
      { name: 'Sean Burke',      k9: 9.0, bb9:3.5, hr9:1.10, era:4.50, stamina:6 },
      { name: 'Erick Fedde',     k9: 7.5, bb9:2.8, hr9:1.20, era:4.87, stamina:6 },
      { name: 'Chris Flexen',    k9: 6.5, bb9:3.5, hr9:1.40, era:5.90, stamina:5 },
      { name: 'Jonathan Cannon', k9: 7.5, bb9:3.0, hr9:1.30, era:5.00, stamina:5 },
      { name: 'Davis Martin',    k9: 7.0, bb9:3.2, hr9:1.35, era:5.20, stamina:5 },
    ],
    bullpen: { k9:7.5, bb9:4.0, hr9:1.50, era:5.30 },
  },

  {
    id: 'KC', name: 'Kansas City Royals', city: 'Kansas City', league: 'AL', division: 'AL Central',
    color: '#004687', accentColor: '#C09A5B',
    lineup: [
      { name: 'Bobby Witt Jr.',      pos: 'SS', bb_pct:.065, k_pct:.185, babip:.330, hr_pa:.040, d_frac:.26, t_frac:.04, spd:9 },
      { name: 'Vinnie Pasquantino', pos: '1B', bb_pct:.100, k_pct:.195, babip:.310, hr_pa:.030, d_frac:.28, t_frac:.01, spd:4 },
      { name: 'Salvador Pérez',     pos: 'C',  bb_pct:.045, k_pct:.195, babip:.285, hr_pa:.038, d_frac:.22, t_frac:.01, spd:3 },
      { name: 'MJ Melendez',        pos: 'DH', bb_pct:.090, k_pct:.255, babip:.295, hr_pa:.035, d_frac:.24, t_frac:.02, spd:5 },
      { name: 'Hunter Renfroe',     pos: 'RF', bb_pct:.080, k_pct:.258, babip:.278, hr_pa:.040, d_frac:.22, t_frac:.01, spd:4 },
      { name: 'Michael Massey',     pos: '2B', bb_pct:.065, k_pct:.218, babip:.298, hr_pa:.022, d_frac:.26, t_frac:.03, spd:6 },
      { name: 'Maikel Garcia',      pos: '3B', bb_pct:.060, k_pct:.215, babip:.305, hr_pa:.015, d_frac:.23, t_frac:.05, spd:8 },
      { name: 'Drew Waters',        pos: 'LF', bb_pct:.075, k_pct:.265, babip:.302, hr_pa:.025, d_frac:.22, t_frac:.04, spd:8 },
      { name: 'Dairon Blanco',      pos: 'CF', bb_pct:.058, k_pct:.262, babip:.308, hr_pa:.018, d_frac:.20, t_frac:.05, spd:9 },
    ],
    rotation: [
      { name: 'Seth Lugo',      k9: 8.5, bb9:1.8, hr9:0.85, era:3.00, stamina:7 },
      { name: 'Cole Ragans',    k9:11.5, bb9:3.0, hr9:0.90, era:3.14, stamina:6 },
      { name: 'Brady Singer',   k9: 8.8, bb9:2.5, hr9:1.00, era:3.68, stamina:6 },
      { name: 'Michael Wacha', k9: 8.0, bb9:2.5, hr9:1.05, era:4.10, stamina:6 },
      { name: 'Kris Bubic',     k9: 7.5, bb9:3.0, hr9:1.15, era:4.50, stamina:6 },
    ],
    bullpen: { k9:9.2, bb9:3.2, hr9:1.00, era:3.85 },
  },

  // ═══════════════ AL WEST ═══════════════

  {
    id: 'HOU', name: 'Houston Astros', city: 'Houston', league: 'AL', division: 'AL West',
    color: '#002D62', accentColor: '#EB6E1F',
    lineup: [
      { name: 'José Altuve',    pos: '2B', bb_pct:.090, k_pct:.115, babip:.322, hr_pa:.032, d_frac:.26, t_frac:.03, spd:7 },
      { name: 'Yordan Álvarez', pos: 'DH', bb_pct:.120, k_pct:.198, babip:.325, hr_pa:.055, d_frac:.28, t_frac:.01, spd:4 },
      { name: 'Yainer Díaz',    pos: 'C',  bb_pct:.062, k_pct:.198, babip:.302, hr_pa:.035, d_frac:.25, t_frac:.01, spd:4 },
      { name: 'Jeremy Peña',    pos: 'SS', bb_pct:.058, k_pct:.225, babip:.295, hr_pa:.028, d_frac:.24, t_frac:.03, spd:7 },
      { name: 'Isaac Paredes',  pos: '3B', bb_pct:.110, k_pct:.195, babip:.290, hr_pa:.042, d_frac:.24, t_frac:.01, spd:4 },
      { name: 'Cam Smith',      pos: 'RF', bb_pct:.080, k_pct:.245, babip:.305, hr_pa:.025, d_frac:.25, t_frac:.02, spd:6 },
      { name: 'Mauricio Dubón', pos: 'CF', bb_pct:.055, k_pct:.195, babip:.298, hr_pa:.018, d_frac:.24, t_frac:.04, spd:7 },
      { name: 'Jake Meyers',    pos: 'LF', bb_pct:.065, k_pct:.238, babip:.298, hr_pa:.022, d_frac:.23, t_frac:.04, spd:7 },
      { name: 'Jon Singleton',  pos: '1B', bb_pct:.108, k_pct:.295, babip:.290, hr_pa:.030, d_frac:.22, t_frac:.01, spd:4 },
    ],
    rotation: [
      { name: 'Framber Valdez',  k9: 9.2, bb9:2.5, hr9:0.55, era:2.91, stamina:7 },
      { name: 'Justin Verlander',k9: 9.0, bb9:2.0, hr9:1.00, era:3.50, stamina:7 },
      { name: 'Hunter Brown',    k9:10.5, bb9:2.8, hr9:0.90, era:3.68, stamina:6 },
      { name: 'Ronel Blanco',    k9: 9.5, bb9:3.0, hr9:0.80, era:3.55, stamina:6 },
      { name: 'José Urquidy',    k9: 8.0, bb9:2.5, hr9:1.20, era:4.40, stamina:6 },
    ],
    bullpen: { k9:9.5, bb9:3.0, hr9:0.95, era:3.70 },
  },

  {
    id: 'TEX', name: 'Texas Rangers', city: 'Arlington', league: 'AL', division: 'AL West',
    color: '#003278', accentColor: '#C0111F',
    lineup: [
      { name: 'Marcus Semien',   pos: '2B', bb_pct:.090, k_pct:.158, babip:.295, hr_pa:.032, d_frac:.26, t_frac:.03, spd:6 },
      { name: 'Corey Seager',    pos: 'SS', bb_pct:.095, k_pct:.165, babip:.310, hr_pa:.042, d_frac:.28, t_frac:.01, spd:5 },
      { name: 'Adolis García',   pos: 'RF', bb_pct:.065, k_pct:.265, babip:.305, hr_pa:.042, d_frac:.23, t_frac:.03, spd:7 },
      { name: 'Nathaniel Lowe',  pos: '1B', bb_pct:.112, k_pct:.178, babip:.310, hr_pa:.025, d_frac:.30, t_frac:.02, spd:5 },
      { name: 'Josh Jung',       pos: '3B', bb_pct:.075, k_pct:.242, babip:.298, hr_pa:.035, d_frac:.25, t_frac:.02, spd:6 },
      { name: 'Wyatt Langford',  pos: 'LF', bb_pct:.085, k_pct:.258, babip:.318, hr_pa:.028, d_frac:.26, t_frac:.04, spd:8 },
      { name: 'Jonah Heim',      pos: 'C',  bb_pct:.065, k_pct:.238, babip:.285, hr_pa:.025, d_frac:.24, t_frac:.01, spd:4 },
      { name: 'Leody Taveras',   pos: 'CF', bb_pct:.065, k_pct:.228, babip:.305, hr_pa:.018, d_frac:.22, t_frac:.05, spd:9 },
      { name: 'Travis Jankowski',pos: 'DH', bb_pct:.088, k_pct:.205, babip:.308, hr_pa:.012, d_frac:.22, t_frac:.05, spd:8 },
    ],
    rotation: [
      { name: 'Jacob deGrom',     k9:12.0, bb9:2.0, hr9:0.75, era:2.80, stamina:6 },
      { name: 'Nathan Eovaldi',   k9: 8.5, bb9:2.2, hr9:1.05, era:3.82, stamina:6 },
      { name: 'Cody Bradford',    k9: 8.8, bb9:2.5, hr9:1.15, era:4.20, stamina:6 },
      { name: 'Andrew Heaney',    k9:10.5, bb9:3.2, hr9:1.50, era:5.00, stamina:6 },
      { name: 'Jon Gray',         k9: 7.5, bb9:2.8, hr9:1.20, era:4.80, stamina:6 },
    ],
    bullpen: { k9:8.8, bb9:3.2, hr9:1.15, era:4.10 },
  },

  {
    id: 'SEA', name: 'Seattle Mariners', city: 'Seattle', league: 'AL', division: 'AL West',
    color: '#0C2C56', accentColor: '#005C5C',
    lineup: [
      { name: 'Julio Rodríguez', pos: 'CF', bb_pct:.085, k_pct:.255, babip:.328, hr_pa:.038, d_frac:.25, t_frac:.04, spd:8 },
      { name: 'Cal Raleigh',     pos: 'C',  bb_pct:.095, k_pct:.248, babip:.290, hr_pa:.050, d_frac:.23, t_frac:.01, spd:4 },
      { name: 'Mitch Garver',    pos: 'DH', bb_pct:.105, k_pct:.238, babip:.295, hr_pa:.042, d_frac:.24, t_frac:.01, spd:3 },
      { name: 'Josh Rojas',      pos: '3B', bb_pct:.085, k_pct:.225, babip:.285, hr_pa:.012, d_frac:.24, t_frac:.04, spd:7 },
      { name: 'JP Crawford',     pos: 'SS', bb_pct:.100, k_pct:.188, babip:.290, hr_pa:.018, d_frac:.26, t_frac:.03, spd:6 },
      { name: 'Dylan Moore',     pos: '2B', bb_pct:.105, k_pct:.282, babip:.295, hr_pa:.030, d_frac:.22, t_frac:.04, spd:7 },
      { name: 'Luke Raley',      pos: 'LF', bb_pct:.095, k_pct:.272, babip:.298, hr_pa:.035, d_frac:.23, t_frac:.03, spd:6 },
      { name: 'Randy Arozarena', pos: 'RF', bb_pct:.090, k_pct:.252, babip:.310, hr_pa:.035, d_frac:.24, t_frac:.03, spd:7 },
      { name: 'Ty France',       pos: '1B', bb_pct:.085, k_pct:.165, babip:.295, hr_pa:.022, d_frac:.28, t_frac:.01, spd:4 },
    ],
    rotation: [
      { name: 'Luis Castillo',   k9:10.0, bb9:2.5, hr9:0.85, era:3.29, stamina:7 },
      { name: 'Logan Gilbert',   k9:10.8, bb9:2.0, hr9:0.95, era:3.23, stamina:7 },
      { name: 'George Kirby',    k9: 9.5, bb9:1.2, hr9:1.05, era:3.64, stamina:6 },
      { name: 'Bryan Woo',       k9: 9.8, bb9:2.2, hr9:0.90, era:3.78, stamina:6 },
      { name: 'Emerson Hancock', k9: 8.5, bb9:3.0, hr9:1.10, era:4.25, stamina:6 },
    ],
    bullpen: { k9:9.0, bb9:3.0, hr9:1.00, era:3.80 },
  },

  {
    id: 'LAA', name: 'Los Angeles Angels', city: 'Anaheim', league: 'AL', division: 'AL West',
    color: '#003263', accentColor: '#BA0021',
    lineup: [
      { name: 'Mike Trout',      pos: 'CF', bb_pct:.130, k_pct:.218, babip:.315, hr_pa:.065, d_frac:.25, t_frac:.02, spd:6 },
      { name: 'Taylor Ward',     pos: 'RF', bb_pct:.098, k_pct:.228, babip:.298, hr_pa:.035, d_frac:.25, t_frac:.02, spd:5 },
      { name: 'Nolan Schanuel',  pos: '1B', bb_pct:.112, k_pct:.198, babip:.298, hr_pa:.018, d_frac:.26, t_frac:.01, spd:5 },
      { name: 'Jo Adell',        pos: 'LF', bb_pct:.068, k_pct:.285, babip:.308, hr_pa:.035, d_frac:.23, t_frac:.04, spd:7 },
      { name: 'Logan O\'Hoppe',  pos: 'C',  bb_pct:.075, k_pct:.235, babip:.298, hr_pa:.032, d_frac:.24, t_frac:.01, spd:4 },
      { name: 'Zach Neto',       pos: 'SS', bb_pct:.072, k_pct:.258, babip:.295, hr_pa:.025, d_frac:.23, t_frac:.03, spd:7 },
      { name: 'Luis Rengifo',    pos: '2B', bb_pct:.072, k_pct:.218, babip:.305, hr_pa:.022, d_frac:.26, t_frac:.04, spd:7 },
      { name: 'Mickey Moniak',   pos: 'DH', bb_pct:.058, k_pct:.248, babip:.295, hr_pa:.025, d_frac:.23, t_frac:.03, spd:7 },
      { name: 'Anthony Rendon',  pos: '3B', bb_pct:.090, k_pct:.185, babip:.285, hr_pa:.028, d_frac:.27, t_frac:.01, spd:4 },
    ],
    rotation: [
      { name: 'Tyler Anderson',   k9: 8.2, bb9:2.8, hr9:1.20, era:4.50, stamina:6 },
      { name: 'Reid Detmers',     k9: 9.5, bb9:3.5, hr9:1.30, era:4.67, stamina:6 },
      { name: 'Patrick Sandoval', k9: 9.0, bb9:3.5, hr9:1.10, era:4.80, stamina:6 },
      { name: 'Griffin Canning',  k9: 8.0, bb9:3.0, hr9:1.25, era:4.90, stamina:6 },
      { name: 'José Suarez',      k9: 7.5, bb9:3.5, hr9:1.30, era:5.10, stamina:5 },
    ],
    bullpen: { k9:8.5, bb9:3.8, hr9:1.25, era:4.50 },
  },

  {
    id: 'OAK', name: 'Oakland Athletics', city: 'Sacramento', league: 'AL', division: 'AL West',
    color: '#003831', accentColor: '#EFB21E',
    lineup: [
      { name: 'Brent Rooker',    pos: 'DH', bb_pct:.100, k_pct:.285, babip:.295, hr_pa:.052, d_frac:.22, t_frac:.01, spd:3 },
      { name: 'Lawrence Butler', pos: 'CF', bb_pct:.065, k_pct:.278, babip:.310, hr_pa:.038, d_frac:.23, t_frac:.04, spd:7 },
      { name: 'Shea Langeliers', pos: 'C',  bb_pct:.075, k_pct:.298, babip:.285, hr_pa:.042, d_frac:.22, t_frac:.01, spd:4 },
      { name: 'Zack Gelof',      pos: '2B', bb_pct:.085, k_pct:.268, babip:.305, hr_pa:.032, d_frac:.24, t_frac:.03, spd:7 },
      { name: 'Ryan Noda',       pos: '1B', bb_pct:.130, k_pct:.295, babip:.295, hr_pa:.028, d_frac:.22, t_frac:.01, spd:4 },
      { name: 'Colt Thomas',     pos: 'RF', bb_pct:.075, k_pct:.265, babip:.290, hr_pa:.020, d_frac:.22, t_frac:.03, spd:6 },
      { name: 'Tyler Soderstrom',pos: '3B', bb_pct:.075, k_pct:.265, babip:.295, hr_pa:.028, d_frac:.24, t_frac:.02, spd:5 },
      { name: 'Esteury Ruiz',    pos: 'LF', bb_pct:.068, k_pct:.285, babip:.310, hr_pa:.012, d_frac:.18, t_frac:.06, spd:10},
      { name: 'Darell Hernaiz',  pos: 'SS', bb_pct:.048, k_pct:.238, babip:.290, hr_pa:.015, d_frac:.22, t_frac:.03, spd:7 },
    ],
    rotation: [
      { name: 'Paul Blackburn', k9: 7.5, bb9:2.5, hr9:1.20, era:4.85, stamina:6 },
      { name: 'JP Sears',       k9: 7.5, bb9:2.5, hr9:1.35, era:5.00, stamina:6 },
      { name: 'Kyle Muller',    k9: 9.0, bb9:4.2, hr9:1.05, era:4.95, stamina:5 },
      { name: 'Mitch Spence',   k9: 8.0, bb9:3.2, hr9:1.25, era:5.15, stamina:5 },
      { name: 'Hogan Harris',   k9: 7.0, bb9:4.0, hr9:1.30, era:5.40, stamina:5 },
    ],
    bullpen: { k9:8.0, bb9:4.0, hr9:1.40, era:5.20 },
  },

  // ═══════════════ NL EAST ═══════════════

  {
    id: 'PHI', name: 'Philadelphia Phillies', city: 'Philadelphia', league: 'NL', division: 'NL East',
    color: '#E81828', accentColor: '#002D72',
    lineup: [
      { name: 'Kyle Schwarber',   pos: 'LF', bb_pct:.125, k_pct:.298, babip:.295, hr_pa:.058, d_frac:.22, t_frac:.02, spd:4 },
      { name: 'Trea Turner',      pos: 'SS', bb_pct:.075, k_pct:.178, babip:.325, hr_pa:.030, d_frac:.26, t_frac:.05, spd:8 },
      { name: 'Bryce Harper',     pos: '1B', bb_pct:.130, k_pct:.200, babip:.325, hr_pa:.050, d_frac:.28, t_frac:.01, spd:5 },
      { name: 'Nick Castellanos', pos: 'RF', bb_pct:.078, k_pct:.195, babip:.308, hr_pa:.032, d_frac:.30, t_frac:.02, spd:5 },
      { name: 'JT Realmuto',      pos: 'C',  bb_pct:.075, k_pct:.218, babip:.295, hr_pa:.030, d_frac:.26, t_frac:.02, spd:6 },
      { name: 'Alec Bohm',        pos: '3B', bb_pct:.065, k_pct:.168, babip:.318, hr_pa:.022, d_frac:.30, t_frac:.02, spd:5 },
      { name: 'Bryson Stott',     pos: '2B', bb_pct:.075, k_pct:.188, babip:.305, hr_pa:.022, d_frac:.26, t_frac:.04, spd:7 },
      { name: 'Brandon Marsh',    pos: 'CF', bb_pct:.088, k_pct:.268, babip:.318, hr_pa:.022, d_frac:.25, t_frac:.04, spd:7 },
      { name: 'Johan Rojas',      pos: 'DH', bb_pct:.048, k_pct:.242, babip:.305, hr_pa:.010, d_frac:.22, t_frac:.05, spd:9 },
    ],
    rotation: [
      { name: 'Zack Wheeler',       k9:10.5, bb9:2.0, hr9:0.85, era:2.57, stamina:7 },
      { name: 'Aaron Nola',         k9: 9.5, bb9:2.2, hr9:0.95, era:3.52, stamina:7 },
      { name: 'Cristopher Sánchez', k9: 8.5, bb9:2.8, hr9:0.75, era:3.44, stamina:6 },
      { name: 'Ranger Suárez',      k9: 8.8, bb9:3.0, hr9:0.85, era:3.33, stamina:6 },
      { name: 'Taijuan Walker',     k9: 8.0, bb9:2.8, hr9:1.20, era:4.50, stamina:6 },
    ],
    bullpen: { k9:9.5, bb9:3.0, hr9:0.95, era:3.60 },
  },

  {
    id: 'ATL', name: 'Atlanta Braves', city: 'Atlanta', league: 'NL', division: 'NL East',
    color: '#CE1141', accentColor: '#13274F',
    lineup: [
      { name: 'Ronald Acuña Jr.', pos: 'RF', bb_pct:.100, k_pct:.165, babip:.335, hr_pa:.045, d_frac:.26, t_frac:.03, spd:9 },
      { name: 'Ozzie Albies',     pos: '2B', bb_pct:.070, k_pct:.188, babip:.308, hr_pa:.038, d_frac:.28, t_frac:.04, spd:8 },
      { name: 'Matt Olson',       pos: '1B', bb_pct:.115, k_pct:.248, babip:.305, hr_pa:.052, d_frac:.25, t_frac:.01, spd:4 },
      { name: 'Marcell Ozuna',    pos: 'DH', bb_pct:.082, k_pct:.225, babip:.298, hr_pa:.048, d_frac:.25, t_frac:.01, spd:4 },
      { name: 'Austin Riley',     pos: '3B', bb_pct:.082, k_pct:.245, babip:.298, hr_pa:.045, d_frac:.26, t_frac:.01, spd:5 },
      { name: 'Sean Murphy',      pos: 'C',  bb_pct:.095, k_pct:.228, babip:.290, hr_pa:.028, d_frac:.24, t_frac:.01, spd:4 },
      { name: 'Michael Harris II',pos: 'CF', bb_pct:.068, k_pct:.235, babip:.318, hr_pa:.025, d_frac:.25, t_frac:.04, spd:8 },
      { name: 'Orlando Arcia',    pos: 'SS', bb_pct:.070, k_pct:.198, babip:.290, hr_pa:.025, d_frac:.24, t_frac:.02, spd:6 },
      { name: 'Adam Duvall',      pos: 'LF', bb_pct:.068, k_pct:.268, babip:.280, hr_pa:.038, d_frac:.22, t_frac:.02, spd:5 },
    ],
    rotation: [
      { name: 'Spencer Strider',     k9:14.5, bb9:2.0, hr9:0.80, era:3.00, stamina:6 },
      { name: 'Chris Sale',          k9:11.0, bb9:2.2, hr9:0.90, era:3.25, stamina:6 },
      { name: 'Reynaldo López',      k9:10.5, bb9:2.5, hr9:0.90, era:2.58, stamina:6 },
      { name: 'Grant Holmes',        k9: 9.0, bb9:3.2, hr9:1.00, era:4.10, stamina:6 },
      { name: 'AJ Smith-Shawver',    k9: 9.2, bb9:3.5, hr9:1.10, era:4.20, stamina:6 },
    ],
    bullpen: { k9:10.0, bb9:3.0, hr9:0.90, era:3.50 },
  },

  {
    id: 'NYM', name: 'New York Mets', city: 'New York', league: 'NL', division: 'NL East',
    color: '#002D72', accentColor: '#FF5910',
    lineup: [
      { name: 'Juan Soto',         pos: 'RF', bb_pct:.183, k_pct:.174, babip:.350, hr_pa:.048, d_frac:.28, t_frac:.02, spd:6 },
      { name: 'Francisco Lindor',  pos: 'SS', bb_pct:.088, k_pct:.155, babip:.305, hr_pa:.038, d_frac:.27, t_frac:.03, spd:7 },
      { name: 'Pete Alonso',       pos: '1B', bb_pct:.105, k_pct:.255, babip:.295, hr_pa:.052, d_frac:.23, t_frac:.01, spd:3 },
      { name: 'Mark Vientos',      pos: '3B', bb_pct:.075, k_pct:.245, babip:.298, hr_pa:.042, d_frac:.24, t_frac:.02, spd:5 },
      { name: 'Brandon Nimmo',     pos: 'LF', bb_pct:.115, k_pct:.205, babip:.308, hr_pa:.020, d_frac:.26, t_frac:.03, spd:5 },
      { name: 'Jeff McNeil',       pos: '2B', bb_pct:.075, k_pct:.118, babip:.338, hr_pa:.012, d_frac:.28, t_frac:.03, spd:7 },
      { name: 'Tyrone Taylor',     pos: 'CF', bb_pct:.065, k_pct:.238, babip:.295, hr_pa:.025, d_frac:.22, t_frac:.03, spd:7 },
      { name: 'Francisco Álvarez', pos: 'C',  bb_pct:.082, k_pct:.278, babip:.290, hr_pa:.038, d_frac:.23, t_frac:.01, spd:4 },
      { name: 'DJ Stewart',        pos: 'DH', bb_pct:.108, k_pct:.275, babip:.295, hr_pa:.035, d_frac:.23, t_frac:.02, spd:4 },
    ],
    rotation: [
      { name: 'Sean Manaea',    k9:10.0, bb9:2.5, hr9:1.05, era:3.47, stamina:6 },
      { name: 'Clay Holmes',    k9: 9.5, bb9:3.0, hr9:0.80, era:3.50, stamina:6 },
      { name: 'Luis Severino',  k9: 9.5, bb9:2.8, hr9:1.15, era:3.91, stamina:6 },
      { name: 'David Peterson', k9: 8.5, bb9:3.0, hr9:1.00, era:3.98, stamina:6 },
      { name: 'Tylor Megill',   k9: 9.0, bb9:3.5, hr9:1.25, era:4.50, stamina:6 },
    ],
    bullpen: { k9:9.5, bb9:3.2, hr9:1.05, era:3.85 },
  },

  {
    id: 'WSH', name: 'Washington Nationals', city: 'Washington DC', league: 'NL', division: 'NL East',
    color: '#AB0003', accentColor: '#14225A',
    lineup: [
      { name: 'CJ Abrams',         pos: 'SS', bb_pct:.070, k_pct:.235, babip:.322, hr_pa:.025, d_frac:.24, t_frac:.05, spd:9 },
      { name: 'Joey Meneses',      pos: '1B', bb_pct:.055, k_pct:.200, babip:.295, hr_pa:.030, d_frac:.25, t_frac:.01, spd:4 },
      { name: 'Keibert Ruiz',      pos: 'C',  bb_pct:.065, k_pct:.155, babip:.295, hr_pa:.018, d_frac:.28, t_frac:.02, spd:4 },
      { name: 'Trey Lipscomb',     pos: '3B', bb_pct:.055, k_pct:.248, babip:.290, hr_pa:.020, d_frac:.24, t_frac:.03, spd:6 },
      { name: 'James Wood',        pos: 'RF', bb_pct:.085, k_pct:.275, babip:.330, hr_pa:.030, d_frac:.25, t_frac:.04, spd:8 },
      { name: 'Alex Call',         pos: 'CF', bb_pct:.085, k_pct:.245, babip:.298, hr_pa:.018, d_frac:.22, t_frac:.04, spd:7 },
      { name: 'Ildemaro Vargas',   pos: '2B', bb_pct:.048, k_pct:.198, babip:.285, hr_pa:.015, d_frac:.22, t_frac:.03, spd:6 },
      { name: 'Stone Garrett',     pos: 'LF', bb_pct:.058, k_pct:.265, babip:.295, hr_pa:.028, d_frac:.22, t_frac:.02, spd:6 },
      { name: 'Juan Yepez',        pos: 'DH', bb_pct:.058, k_pct:.255, babip:.282, hr_pa:.025, d_frac:.22, t_frac:.01, spd:4 },
    ],
    rotation: [
      { name: 'MacKenzie Gore',  k9:10.5, bb9:3.5, hr9:1.00, era:3.80, stamina:6 },
      { name: 'Jake Irvin',      k9: 7.5, bb9:2.8, hr9:1.30, era:4.62, stamina:6 },
      { name: 'Trevor Williams', k9: 8.0, bb9:2.5, hr9:1.25, era:4.30, stamina:6 },
      { name: 'DJ Herz',         k9: 9.0, bb9:3.8, hr9:1.15, era:4.50, stamina:6 },
      { name: 'Patrick Corbin',  k9: 7.0, bb9:3.8, hr9:1.50, era:5.59, stamina:5 },
    ],
    bullpen: { k9:8.0, bb9:3.8, hr9:1.30, era:4.80 },
  },

  {
    id: 'MIA', name: 'Miami Marlins', city: 'Miami', league: 'NL', division: 'NL East',
    color: '#00A3E0', accentColor: '#EF3340',
    lineup: [
      { name: 'Kyle Stowers',      pos: 'CF', bb_pct:.075, k_pct:.272, babip:.295, hr_pa:.025, d_frac:.23, t_frac:.03, spd:6 },
      { name: 'Vidal Bruján',      pos: '2B', bb_pct:.065, k_pct:.215, babip:.290, hr_pa:.015, d_frac:.22, t_frac:.05, spd:9 },
      { name: 'Jorge Soler',       pos: 'DH', bb_pct:.112, k_pct:.278, babip:.285, hr_pa:.042, d_frac:.22, t_frac:.01, spd:4 },
      { name: 'Jake Burger',       pos: '3B', bb_pct:.062, k_pct:.268, babip:.285, hr_pa:.042, d_frac:.22, t_frac:.01, spd:4 },
      { name: 'Bryan De La Cruz',  pos: 'RF', bb_pct:.062, k_pct:.245, babip:.305, hr_pa:.022, d_frac:.24, t_frac:.03, spd:6 },
      { name: 'Xavier Edwards',    pos: 'SS', bb_pct:.075, k_pct:.138, babip:.335, hr_pa:.005, d_frac:.24, t_frac:.04, spd:8 },
      { name: 'Nick Fortes',       pos: 'C',  bb_pct:.055, k_pct:.248, babip:.278, hr_pa:.020, d_frac:.22, t_frac:.01, spd:4 },
      { name: 'JJ Bleday',         pos: 'LF', bb_pct:.098, k_pct:.268, babip:.285, hr_pa:.025, d_frac:.22, t_frac:.02, spd:5 },
      { name: 'Connor Norby',      pos: '1B', bb_pct:.068, k_pct:.262, babip:.295, hr_pa:.022, d_frac:.23, t_frac:.03, spd:6 },
    ],
    rotation: [
      { name: 'Jesus Luzardo',   k9:10.5, bb9:3.5, hr9:1.00, era:3.59, stamina:6 },
      { name: 'Trevor Rogers',   k9: 8.5, bb9:3.5, hr9:1.10, era:4.50, stamina:6 },
      { name: 'Edward Cabrera',  k9:10.5, bb9:4.0, hr9:0.80, era:3.68, stamina:6 },
      { name: 'Braxton Garrett', k9: 9.0, bb9:3.0, hr9:0.90, era:3.65, stamina:6 },
      { name: 'Ryan Weathers',   k9: 8.0, bb9:3.5, hr9:1.20, era:4.50, stamina:6 },
    ],
    bullpen: { k9:9.5, bb9:3.5, hr9:0.95, era:3.70 },
  },

  // ═══════════════ NL CENTRAL ═══════════════

  {
    id: 'MIL', name: 'Milwaukee Brewers', city: 'Milwaukee', league: 'NL', division: 'NL Central',
    color: '#12284B', accentColor: '#B6922E',
    lineup: [
      { name: 'Sal Frelick',       pos: 'CF', bb_pct:.070, k_pct:.148, babip:.325, hr_pa:.010, d_frac:.26, t_frac:.05, spd:8 },
      { name: 'Jackson Chourio',   pos: 'LF', bb_pct:.058, k_pct:.248, babip:.312, hr_pa:.025, d_frac:.25, t_frac:.04, spd:8 },
      { name: 'Christian Yelich',  pos: 'DH', bb_pct:.100, k_pct:.232, babip:.315, hr_pa:.032, d_frac:.28, t_frac:.03, spd:7 },
      { name: 'Rhys Hoskins',      pos: '1B', bb_pct:.108, k_pct:.255, babip:.295, hr_pa:.042, d_frac:.24, t_frac:.01, spd:4 },
      { name: 'Willy Adames',      pos: 'SS', bb_pct:.095, k_pct:.262, babip:.295, hr_pa:.040, d_frac:.25, t_frac:.02, spd:6 },
      { name: 'William Contreras', pos: 'C',  bb_pct:.082, k_pct:.218, babip:.310, hr_pa:.032, d_frac:.26, t_frac:.02, spd:5 },
      { name: 'Joey Wiemer',        pos: 'RF', bb_pct:.072, k_pct:.298, babip:.295, hr_pa:.030, d_frac:.22, t_frac:.03, spd:7 },
      { name: 'Brice Turang',       pos: '2B', bb_pct:.080, k_pct:.208, babip:.305, hr_pa:.015, d_frac:.24, t_frac:.04, spd:8 },
      { name: 'Andruw Monasterio',  pos: '3B', bb_pct:.060, k_pct:.195, babip:.295, hr_pa:.012, d_frac:.22, t_frac:.04, spd:7 },
    ],
    rotation: [
      { name: 'Freddy Peralta', k9:10.8, bb9:2.5, hr9:1.05, era:3.65, stamina:6 },
      { name: 'Colin Rea',      k9: 8.0, bb9:2.5, hr9:1.10, era:4.00, stamina:6 },
      { name: 'Wade Miley',     k9: 7.0, bb9:3.0, hr9:0.90, era:3.90, stamina:6 },
      { name: 'Tobias Myers',   k9: 8.5, bb9:2.8, hr9:1.15, era:4.20, stamina:6 },
      { name: 'Brandon Woodruff',k9:10.5,bb9:2.5, hr9:0.85, era:3.05, stamina:6 },
    ],
    bullpen: { k9:10.0, bb9:3.2, hr9:1.00, era:3.75 },
  },

  {
    id: 'CHC', name: 'Chicago Cubs', city: 'Chicago', league: 'NL', division: 'NL Central',
    color: '#0E3386', accentColor: '#CC3433',
    lineup: [
      { name: 'Kyle Tucker',      pos: 'RF', bb_pct:.108, k_pct:.195, babip:.310, hr_pa:.042, d_frac:.30, t_frac:.02, spd:7 },
      { name: 'Nico Hoerner',     pos: '2B', bb_pct:.075, k_pct:.108, babip:.318, hr_pa:.010, d_frac:.26, t_frac:.04, spd:7 },
      { name: 'Ian Happ',         pos: 'LF', bb_pct:.115, k_pct:.238, babip:.305, hr_pa:.035, d_frac:.27, t_frac:.02, spd:6 },
      { name: 'Seiya Suzuki',     pos: 'CF', bb_pct:.095, k_pct:.218, babip:.315, hr_pa:.032, d_frac:.27, t_frac:.02, spd:6 },
      { name: 'Dansby Swanson',   pos: 'SS', bb_pct:.085, k_pct:.265, babip:.295, hr_pa:.030, d_frac:.24, t_frac:.03, spd:7 },
      { name: 'Michael Busch',    pos: '1B', bb_pct:.095, k_pct:.255, babip:.305, hr_pa:.038, d_frac:.25, t_frac:.02, spd:5 },
      { name: 'Christopher Morel',pos: '3B', bb_pct:.072, k_pct:.298, babip:.295, hr_pa:.038, d_frac:.23, t_frac:.03, spd:7 },
      { name: 'Miguel Amaya',     pos: 'C',  bb_pct:.088, k_pct:.258, babip:.285, hr_pa:.022, d_frac:.23, t_frac:.01, spd:4 },
      { name: 'Patrick Wisdom',   pos: 'DH', bb_pct:.095, k_pct:.355, babip:.285, hr_pa:.045, d_frac:.20, t_frac:.02, spd:4 },
    ],
    rotation: [
      { name: 'Shota Imanaga',   k9:10.5, bb9:1.5, hr9:0.80, era:2.91, stamina:6 },
      { name: 'Justin Steele',   k9: 9.5, bb9:3.0, hr9:0.70, era:3.42, stamina:6 },
      { name: 'Kyle Hendricks',  k9: 7.0, bb9:2.2, hr9:1.15, era:4.80, stamina:6 },
      { name: 'Jameson Taillon', k9: 8.5, bb9:2.5, hr9:1.25, era:4.95, stamina:6 },
      { name: 'Hayden Wesneski', k9: 8.8, bb9:3.0, hr9:1.20, era:4.50, stamina:6 },
    ],
    bullpen: { k9:9.0, bb9:3.5, hr9:1.10, era:4.10 },
  },

  {
    id: 'STL', name: 'St. Louis Cardinals', city: 'St. Louis', league: 'NL', division: 'NL Central',
    color: '#C41E3A', accentColor: '#0C2340',
    lineup: [
      { name: 'Masyn Winn',      pos: 'SS', bb_pct:.058, k_pct:.195, babip:.312, hr_pa:.018, d_frac:.24, t_frac:.04, spd:8 },
      { name: 'Nolan Arenado',   pos: '3B', bb_pct:.075, k_pct:.175, babip:.295, hr_pa:.038, d_frac:.26, t_frac:.01, spd:5 },
      { name: 'Luken Baker',     pos: '1B', bb_pct:.090, k_pct:.258, babip:.295, hr_pa:.030, d_frac:.24, t_frac:.01, spd:3 },
      { name: 'Lars Nootbaar',   pos: 'RF', bb_pct:.095, k_pct:.225, babip:.315, hr_pa:.025, d_frac:.27, t_frac:.03, spd:7 },
      { name: 'Willson Contreras',pos:'C',  bb_pct:.088, k_pct:.225, babip:.295, hr_pa:.030, d_frac:.25, t_frac:.01, spd:5 },
      { name: 'Jordan Walker',   pos: 'DH', bb_pct:.072, k_pct:.255, babip:.308, hr_pa:.025, d_frac:.24, t_frac:.03, spd:7 },
      { name: 'Nolan Gorman',    pos: '2B', bb_pct:.085, k_pct:.285, babip:.292, hr_pa:.042, d_frac:.23, t_frac:.02, spd:5 },
      { name: 'Victor Scott II', pos: 'CF', bb_pct:.052, k_pct:.275, babip:.318, hr_pa:.012, d_frac:.18, t_frac:.07, spd:10},
      { name: 'Brendan Donovan', pos: 'LF', bb_pct:.090, k_pct:.178, babip:.310, hr_pa:.018, d_frac:.26, t_frac:.03, spd:6 },
    ],
    rotation: [
      { name: 'Sonny Gray',        k9: 9.5, bb9:2.2, hr9:0.80, era:3.32, stamina:6 },
      { name: 'Miles Mikolas',     k9: 7.5, bb9:2.2, hr9:1.15, era:4.42, stamina:7 },
      { name: 'Kyle Gibson',       k9: 7.0, bb9:2.8, hr9:1.20, era:4.80, stamina:6 },
      { name: 'Matthew Liberatore',k9: 8.5, bb9:3.2, hr9:1.05, era:4.30, stamina:6 },
      { name: 'Lance Lynn',        k9: 7.5, bb9:3.5, hr9:1.30, era:4.90, stamina:6 },
    ],
    bullpen: { k9:8.8, bb9:3.5, hr9:1.15, era:4.20 },
  },

  {
    id: 'CIN', name: 'Cincinnati Reds', city: 'Cincinnati', league: 'NL', division: 'NL Central',
    color: '#C6011F', accentColor: '#000000',
    lineup: [
      { name: 'Elly De La Cruz',  pos: 'SS', bb_pct:.072, k_pct:.318, babip:.335, hr_pa:.042, d_frac:.24, t_frac:.06, spd:10},
      { name: 'Jonathan India',   pos: '2B', bb_pct:.105, k_pct:.242, babip:.305, hr_pa:.025, d_frac:.26, t_frac:.03, spd:7 },
      { name: 'Tyler Stephenson', pos: 'C',  bb_pct:.085, k_pct:.178, babip:.310, hr_pa:.022, d_frac:.28, t_frac:.02, spd:4 },
      { name: 'Spencer Steer',    pos: '3B', bb_pct:.085, k_pct:.238, babip:.298, hr_pa:.035, d_frac:.26, t_frac:.03, spd:5 },
      { name: 'TJ Friedl',        pos: 'CF', bb_pct:.082, k_pct:.225, babip:.325, hr_pa:.022, d_frac:.28, t_frac:.04, spd:8 },
      { name: 'Jake Fraley',      pos: 'LF', bb_pct:.108, k_pct:.245, babip:.302, hr_pa:.025, d_frac:.24, t_frac:.03, spd:7 },
      { name: 'Jeimer Candelario',pos: '1B', bb_pct:.085, k_pct:.228, babip:.292, hr_pa:.025, d_frac:.27, t_frac:.02, spd:5 },
      { name: 'Stuart Fairchild', pos: 'RF', bb_pct:.075, k_pct:.255, babip:.305, hr_pa:.020, d_frac:.24, t_frac:.04, spd:7 },
      { name: 'Will Benson',      pos: 'DH', bb_pct:.092, k_pct:.285, babip:.295, hr_pa:.030, d_frac:.22, t_frac:.03, spd:7 },
    ],
    rotation: [
      { name: 'Hunter Greene', k9:12.5, bb9:3.0, hr9:1.10, era:3.51, stamina:6 },
      { name: 'Nick Lodolo',   k9: 9.8, bb9:3.0, hr9:1.05, era:3.85, stamina:6 },
      { name: 'Andrew Abbott', k9:11.0, bb9:3.5, hr9:1.15, era:4.25, stamina:6 },
      { name: 'Graham Ashcraft',k9:7.5, bb9:3.0, hr9:0.85, era:4.00, stamina:6 },
      { name: 'Frankie Montas', k9: 8.0, bb9:3.2, hr9:1.20, era:4.60, stamina:6 },
    ],
    bullpen: { k9:9.5, bb9:3.5, hr9:1.05, era:3.80 },
  },

  {
    id: 'PIT', name: 'Pittsburgh Pirates', city: 'Pittsburgh', league: 'NL', division: 'NL Central',
    color: '#27251F', accentColor: '#FDB827',
    lineup: [
      { name: 'Ji Hwan Bae',      pos: 'CF', bb_pct:.062, k_pct:.238, babip:.318, hr_pa:.008, d_frac:.22, t_frac:.07, spd:9 },
      { name: 'Bryan Reynolds',   pos: 'LF', bb_pct:.095, k_pct:.225, babip:.318, hr_pa:.028, d_frac:.28, t_frac:.03, spd:7 },
      { name: 'Oneil Cruz',       pos: 'SS', bb_pct:.075, k_pct:.305, babip:.318, hr_pa:.038, d_frac:.24, t_frac:.05, spd:8 },
      { name: 'Connor Joe',       pos: '1B', bb_pct:.100, k_pct:.245, babip:.298, hr_pa:.022, d_frac:.25, t_frac:.03, spd:5 },
      { name: 'Ke\'Bryan Hayes',  pos: '3B', bb_pct:.082, k_pct:.205, babip:.298, hr_pa:.015, d_frac:.28, t_frac:.03, spd:7 },
      { name: 'Rowdy Tellez',     pos: 'DH', bb_pct:.098, k_pct:.248, babip:.285, hr_pa:.032, d_frac:.22, t_frac:.01, spd:3 },
      { name: 'Henry Davis',      pos: 'C',  bb_pct:.088, k_pct:.278, babip:.295, hr_pa:.025, d_frac:.22, t_frac:.02, spd:5 },
      { name: 'Nick Gonzales',    pos: '2B', bb_pct:.072, k_pct:.238, babip:.295, hr_pa:.022, d_frac:.24, t_frac:.04, spd:6 },
      { name: 'Jared Triolo',     pos: 'RF', bb_pct:.065, k_pct:.245, babip:.290, hr_pa:.020, d_frac:.24, t_frac:.03, spd:6 },
    ],
    rotation: [
      { name: 'Paul Skenes',    k9:11.5, bb9:2.5, hr9:0.65, era:1.96, stamina:6 },
      { name: 'Mitch Keller',   k9: 9.0, bb9:2.5, hr9:1.10, era:4.21, stamina:6 },
      { name: 'Luis L. Ortiz',  k9: 9.0, bb9:3.0, hr9:1.05, era:4.10, stamina:6 },
      { name: 'Marco Gonzales', k9: 7.5, bb9:2.5, hr9:1.15, era:4.50, stamina:6 },
      { name: 'Bailey Falter',  k9: 7.0, bb9:3.0, hr9:1.25, era:4.80, stamina:6 },
    ],
    bullpen: { k9:9.0, bb9:3.5, hr9:1.10, era:4.00 },
  },

  // ═══════════════ NL WEST ═══════════════

  {
    id: 'LAD', name: 'Los Angeles Dodgers', city: 'Los Angeles', league: 'NL', division: 'NL West',
    color: '#005A9C', accentColor: '#EF3E42',
    lineup: [
      { name: 'Mookie Betts',   pos: 'CF', bb_pct:.110, k_pct:.140, babip:.340, hr_pa:.040, d_frac:.27, t_frac:.02, spd:7 },
      { name: 'Freddie Freeman',pos: '1B', bb_pct:.118, k_pct:.142, babip:.312, hr_pa:.032, d_frac:.30, t_frac:.01, spd:6 },
      { name: 'Shohei Ohtani',  pos: 'DH', bb_pct:.145, k_pct:.225, babip:.320, hr_pa:.065, d_frac:.26, t_frac:.02, spd:7 },
      { name: 'Will Smith',     pos: 'C',  bb_pct:.108, k_pct:.195, babip:.305, hr_pa:.038, d_frac:.26, t_frac:.01, spd:5 },
      { name: 'Teoscar Hernandez',pos:'RF',bb_pct:.082, k_pct:.245, babip:.308, hr_pa:.042, d_frac:.25, t_frac:.02, spd:6 },
      { name: 'Max Muncy',      pos: '3B', bb_pct:.135, k_pct:.255, babip:.295, hr_pa:.048, d_frac:.23, t_frac:.01, spd:4 },
      { name: 'Gavin Lux',      pos: '2B', bb_pct:.085, k_pct:.205, babip:.308, hr_pa:.020, d_frac:.26, t_frac:.03, spd:7 },
      { name: 'Andy Pages',     pos: 'LF', bb_pct:.082, k_pct:.262, babip:.305, hr_pa:.030, d_frac:.24, t_frac:.03, spd:6 },
      { name: 'Miguel Rojas',   pos: 'SS', bb_pct:.068, k_pct:.178, babip:.285, hr_pa:.015, d_frac:.24, t_frac:.02, spd:6 },
    ],
    rotation: [
      { name: 'Yoshinobu Yamamoto', k9:11.5, bb9:2.0, hr9:0.75, era:3.00, stamina:6 },
      { name: 'Roki Sasaki',        k9:11.0, bb9:2.5, hr9:0.80, era:3.15, stamina:6 },
      { name: 'Tyler Glasnow',      k9:12.8, bb9:2.8, hr9:0.90, era:3.49, stamina:6 },
      { name: 'Jack Flaherty',      k9:10.2, bb9:2.8, hr9:0.85, era:3.17, stamina:6 },
      { name: 'Gavin Stone',        k9: 9.0, bb9:3.0, hr9:1.05, era:4.00, stamina:6 },
    ],
    bullpen: { k9:10.5, bb9:3.0, hr9:0.90, era:3.40 },
  },

  {
    id: 'ARI', name: 'Arizona Diamondbacks', city: 'Phoenix', league: 'NL', division: 'NL West',
    color: '#A71930', accentColor: '#E3D4AD',
    lineup: [
      { name: 'Corbin Carroll',     pos: 'LF', bb_pct:.095, k_pct:.218, babip:.315, hr_pa:.022, d_frac:.26, t_frac:.05, spd:9 },
      { name: 'Ketel Marte',        pos: '2B', bb_pct:.095, k_pct:.172, babip:.330, hr_pa:.038, d_frac:.30, t_frac:.04, spd:7 },
      { name: 'Christian Walker',   pos: '1B', bb_pct:.100, k_pct:.225, babip:.298, hr_pa:.038, d_frac:.25, t_frac:.01, spd:5 },
      { name: 'Lourdes Gurriel Jr.',pos: 'RF', bb_pct:.062, k_pct:.185, babip:.308, hr_pa:.025, d_frac:.28, t_frac:.02, spd:6 },
      { name: 'Gabriel Moreno',     pos: 'C',  bb_pct:.065, k_pct:.145, babip:.312, hr_pa:.018, d_frac:.28, t_frac:.02, spd:5 },
      { name: 'Pavin Smith',        pos: 'DH', bb_pct:.085, k_pct:.218, babip:.290, hr_pa:.022, d_frac:.25, t_frac:.02, spd:5 },
      { name: 'Kevin Newman',       pos: 'SS', bb_pct:.055, k_pct:.175, babip:.298, hr_pa:.012, d_frac:.24, t_frac:.04, spd:7 },
      { name: 'Alek Thomas',        pos: 'CF', bb_pct:.068, k_pct:.215, babip:.308, hr_pa:.018, d_frac:.25, t_frac:.04, spd:8 },
      { name: 'Eugenio Suárez',     pos: '3B', bb_pct:.088, k_pct:.265, babip:.285, hr_pa:.040, d_frac:.22, t_frac:.02, spd:4 },
    ],
    rotation: [
      { name: 'Corbin Burnes',      k9:10.5, bb9:2.2, hr9:0.70, era:2.92, stamina:7 },
      { name: 'Zac Gallen',         k9: 9.5, bb9:2.2, hr9:0.80, era:3.47, stamina:7 },
      { name: 'Merrill Kelly',      k9: 8.5, bb9:2.2, hr9:1.05, era:3.68, stamina:7 },
      { name: 'Brandon Pfaadt',     k9: 9.5, bb9:2.8, hr9:1.10, era:4.00, stamina:6 },
      { name: 'Eduardo Rodríguez',  k9: 8.5, bb9:3.0, hr9:1.00, era:4.10, stamina:6 },
    ],
    bullpen: { k9:9.5, bb9:3.2, hr9:1.00, era:3.65 },
  },

  {
    id: 'SD', name: 'San Diego Padres', city: 'San Diego', league: 'NL', division: 'NL West',
    color: '#2F241D', accentColor: '#FEC325',
    lineup: [
      { name: 'Fernando Tatis Jr.',pos: 'RF', bb_pct:.088, k_pct:.245, babip:.318, hr_pa:.045, d_frac:.24, t_frac:.03, spd:8 },
      { name: 'Manny Machado',     pos: '3B', bb_pct:.095, k_pct:.185, babip:.305, hr_pa:.035, d_frac:.26, t_frac:.01, spd:5 },
      { name: 'Fernando Tatis Jr.',pos: 'RF', bb_pct:.090, k_pct:.248, babip:.315, hr_pa:.042, d_frac:.24, t_frac:.04, spd:8 },
      { name: 'Jackson Merrill',   pos: 'CF', bb_pct:.068, k_pct:.225, babip:.318, hr_pa:.025, d_frac:.27, t_frac:.04, spd:7 },
      { name: 'Jake Cronenworth',  pos: '1B', bb_pct:.090, k_pct:.178, babip:.295, hr_pa:.020, d_frac:.28, t_frac:.02, spd:6 },
      { name: 'Kyle Higashioka',   pos: 'C',  bb_pct:.055, k_pct:.248, babip:.278, hr_pa:.025, d_frac:.20, t_frac:.01, spd:4 },
      { name: 'Xander Bogaerts',   pos: 'SS', bb_pct:.095, k_pct:.198, babip:.302, hr_pa:.025, d_frac:.28, t_frac:.02, spd:5 },
      { name: 'Jurickson Profar',  pos: 'LF', bb_pct:.105, k_pct:.215, babip:.298, hr_pa:.020, d_frac:.26, t_frac:.03, spd:6 },
      { name: 'Eguy Rosario',      pos: '2B', bb_pct:.055, k_pct:.235, babip:.295, hr_pa:.015, d_frac:.22, t_frac:.04, spd:7 },
    ],
    rotation: [
      { name: 'Dylan Cease',   k9:11.2, bb9:3.2, hr9:0.90, era:3.47, stamina:6 },
      { name: 'Yu Darvish',    k9: 9.5, bb9:2.2, hr9:1.00, era:3.77, stamina:6 },
      { name: 'Michael King',  k9:10.5, bb9:2.5, hr9:0.90, era:2.95, stamina:6 },
      { name: 'Joe Musgrove',  k9: 9.5, bb9:2.5, hr9:0.95, era:3.55, stamina:7 },
      { name: 'Matt Waldron',  k9: 7.5, bb9:2.8, hr9:1.20, era:4.50, stamina:6 },
    ],
    bullpen: { k9:10.0, bb9:3.0, hr9:1.00, era:3.65 },
  },

  {
    id: 'SF', name: 'San Francisco Giants', city: 'San Francisco', league: 'NL', division: 'NL West',
    color: '#FD5A1E', accentColor: '#27251F',
    lineup: [
      { name: 'Willy Adames',      pos: 'SS', bb_pct:.095, k_pct:.262, babip:.295, hr_pa:.040, d_frac:.25, t_frac:.02, spd:6 },
      { name: 'Matt Chapman',      pos: '3B', bb_pct:.105, k_pct:.228, babip:.298, hr_pa:.035, d_frac:.26, t_frac:.02, spd:6 },
      { name: 'LaMonte Wade Jr.', pos: '1B', bb_pct:.115, k_pct:.225, babip:.302, hr_pa:.025, d_frac:.26, t_frac:.02, spd:5 },
      { name: 'Tyler Fitzgerald',  pos: 'CF', bb_pct:.075, k_pct:.228, babip:.315, hr_pa:.028, d_frac:.25, t_frac:.04, spd:7 },
      { name: 'Patrick Bailey',    pos: 'C',  bb_pct:.072, k_pct:.242, babip:.280, hr_pa:.015, d_frac:.24, t_frac:.02, spd:5 },
      { name: 'Wilmer Flores',     pos: 'DH', bb_pct:.082, k_pct:.175, babip:.288, hr_pa:.025, d_frac:.25, t_frac:.01, spd:3 },
      { name: 'Thairo Estrada',    pos: '2B', bb_pct:.068, k_pct:.195, babip:.305, hr_pa:.022, d_frac:.26, t_frac:.04, spd:7 },
      { name: 'Luis Matos',        pos: 'LF', bb_pct:.062, k_pct:.238, babip:.305, hr_pa:.018, d_frac:.23, t_frac:.05, spd:8 },
      { name: 'Mike Yastrzemski', pos: 'RF', bb_pct:.095, k_pct:.228, babip:.298, hr_pa:.025, d_frac:.26, t_frac:.03, spd:6 },
    ],
    rotation: [
      { name: 'Logan Webb',    k9: 8.5, bb9:2.2, hr9:0.80, era:3.25, stamina:7 },
      { name: 'Kyle Harrison', k9: 9.5, bb9:3.5, hr9:0.90, era:4.02, stamina:6 },
      { name: 'Robbie Ray',    k9:10.5, bb9:3.8, hr9:1.15, era:4.60, stamina:6 },
      { name: 'Jordan Hicks',  k9: 8.0, bb9:3.5, hr9:0.95, era:4.10, stamina:6 },
      { name: 'Justin Verlander',k9:9.0, bb9:2.0, hr9:1.00, era:3.50, stamina:7 },
    ],
    bullpen: { k9:9.0, bb9:3.5, hr9:1.10, era:4.00 },
  },

  {
    id: 'COL', name: 'Colorado Rockies', city: 'Denver', league: 'NL', division: 'NL West',
    color: '#33006F', accentColor: '#C4CED4',
    lineup: [
      { name: 'Brenton Doyle',   pos: 'CF', bb_pct:.065, k_pct:.298, babip:.312, hr_pa:.025, d_frac:.25, t_frac:.06, spd:9 },
      { name: 'Ezequiel Tovar',  pos: 'SS', bb_pct:.055, k_pct:.225, babip:.298, hr_pa:.025, d_frac:.26, t_frac:.04, spd:7 },
      { name: 'Ryan McMahon',    pos: '3B', bb_pct:.088, k_pct:.245, babip:.308, hr_pa:.032, d_frac:.26, t_frac:.02, spd:6 },
      { name: 'Kris Bryant',     pos: 'DH', bb_pct:.095, k_pct:.245, babip:.295, hr_pa:.030, d_frac:.26, t_frac:.02, spd:5 },
      { name: 'Elehuris Montero',pos: '1B', bb_pct:.065, k_pct:.268, babip:.295, hr_pa:.030, d_frac:.23, t_frac:.01, spd:4 },
      { name: 'Charlie Blackmon',pos: 'RF', bb_pct:.082, k_pct:.195, babip:.305, hr_pa:.018, d_frac:.28, t_frac:.03, spd:5 },
      { name: 'Brendan Rodgers', pos: '2B', bb_pct:.062, k_pct:.218, babip:.298, hr_pa:.022, d_frac:.27, t_frac:.02, spd:5 },
      { name: 'Elias Díaz',      pos: 'C',  bb_pct:.065, k_pct:.218, babip:.285, hr_pa:.025, d_frac:.23, t_frac:.01, spd:4 },
      { name: 'Jake Cave',       pos: 'LF', bb_pct:.072, k_pct:.258, babip:.288, hr_pa:.020, d_frac:.22, t_frac:.03, spd:6 },
    ],
    rotation: [
      { name: 'Kyle Freeland',     k9: 7.0, bb9:3.2, hr9:1.20, era:5.10, stamina:6 },
      { name: 'Cal Quantrill',     k9: 7.5, bb9:2.8, hr9:1.20, era:4.90, stamina:6 },
      { name: 'Austin Gomber',     k9: 7.5, bb9:3.5, hr9:1.35, era:5.50, stamina:5 },
      { name: 'Ryan Feltner',      k9: 8.0, bb9:3.5, hr9:1.40, era:5.70, stamina:5 },
      { name: 'Antonio Senzatela', k9: 6.5, bb9:3.0, hr9:1.30, era:5.20, stamina:6 },
    ],
    bullpen: { k9:8.0, bb9:4.0, hr9:1.40, era:5.40 },
  },

];

/* ─────────────────────────────────────────────────────────
   Derived stats: compute pitcher per-PA rates from per-9
   ───────────────────────────────────────────────────────── */
(function initData() {
  MLB_TEAMS.forEach(team => {
    team.rotation.forEach(p => {
      p.k_pa  = p.k9  / LEAGUE.PA_PER_9;
      p.bb_pa = p.bb9 / LEAGUE.PA_PER_9;
      p.hr_pa = p.hr9 / LEAGUE.PA_PER_9;
      p.babip = p.babip || LEAGUE.babip;
    });
    const bp = team.bullpen;
    bp.k_pa  = bp.k9  / LEAGUE.PA_PER_9;
    bp.bb_pa = bp.bb9 / LEAGUE.PA_PER_9;
    bp.hr_pa = bp.hr9 / LEAGUE.PA_PER_9;
    bp.babip = bp.babip || LEAGUE.babip;
    bp.name  = bp.name || 'Bullpen';
    bp.era   = bp.era || 4.33;
    team.bullpen_pitcher = { name: 'Bullpen', ...bp };
  });
})();
