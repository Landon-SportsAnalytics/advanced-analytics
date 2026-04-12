const raceColors = {
  'Triple Crown':  '#FFD700',
  'Breeders Cup':  '#520095',
  'Royal Ascot':   '#CC0000',
  'Cheltenham':    '#4169E1',
  'Dubai':         '#E57373',
  'Saudi Cup':     '#DAA520',
  'Melbourne Cup': '#FF6B35',
  'Group 1':       '#1B5E20',
  'Group 2':       '#66BB6A',
  'Grade 1':       '#8B0000',
  'Grade 2':       '#C0392B',
  'Grade 3':       '#2980B9',
  'Listed':        '#7F8C8D',
  'Japan':         '#D63384'
};

const horseRacingData = {
  alltimeSpeed: [
    { pos: 1, name: "—", team: "—", speed: "—" },
    { pos: 2, name: "—", team: "—", speed: "—" },
    { pos: 3, name: "—", team: "—", speed: "—" },
    { pos: 4, name: "—", team: "—", speed: "—" },
    { pos: 5, name: "—", team: "—", speed: "—" }
  ],
  speed2026: [
    { pos: 1, name: "—", team: "—", speed: "—" },
    { pos: 2, name: "—", team: "—", speed: "—" },
    { pos: 3, name: "—", team: "—", speed: "—" },
    { pos: 4, name: "—", team: "—", speed: "—" },
    { pos: 5, name: "—", team: "—", speed: "—" }
  ],
  derbyQual: [
    { pos: 1, name: "—", team: "—", points: "—" },
    { pos: 2, name: "—", team: "—", points: "—" },
    { pos: 3, name: "—", team: "—", points: "—" },
    { pos: 4, name: "—", team: "—", points: "—" },
    { pos: 5, name: "—", team: "—", points: "—" }
  ],
  calendar: [
    // ── September 2025 ──
    { race: "Iroquois",                        date: "2025-09-13", endDate: "2025-09-13", category: "Grade 3"      },
    { race: "Beresford Stakes",                date: "2025-09-27", endDate: "2025-09-27", category: "Group 2"      },
    { race: "Royal Lodge Stakes",              date: "2025-09-27", endDate: "2025-09-27", category: "Group 2"      },
    // ── October 2025 ──
    { race: "Champagne Stakes",                date: "2025-10-04", endDate: "2025-10-04", category: "Grade 1"      },
    { race: "American Pharoah Stakes",         date: "2025-10-04", endDate: "2025-10-04", category: "Grade 1"      },
    { race: "Breeders' Futurity",              date: "2025-10-04", endDate: "2025-10-04", category: "Grade 1"      },
    { race: "Prix Jean-Luc Lagardère",         date: "2025-10-05", endDate: "2025-10-05", category: "Group 1"      },
    { race: "Street Sense Stakes",             date: "2025-10-26", endDate: "2025-10-26", category: "Grade 3"      },
    { race: "Futurity Trophy",                 date: "2025-10-25", endDate: "2025-10-25", category: "Group 1"      },
    { race: "Breeders' Cup Juvenile",          date: "2025-10-31", endDate: "2025-10-31", category: "Grade 1"      },
    // ── November 2025 ──
    { race: "Kentucky Jockey Club",            date: "2025-11-29", endDate: "2025-11-29", category: "Grade 2"      },
    { race: "Cattleya Stakes",                 date: "2025-11-29", endDate: "2025-11-29", category: "Japan"         },
    // ── December 2025 ──
    { race: "Remsen Stakes",                   date: "2025-12-06", endDate: "2025-12-06", category: "Grade 2"      },
    { race: "Los Alamitos Futurity",           date: "2025-12-13", endDate: "2025-12-13", category: "Grade 2"      },
    { race: "Zen-Nippon Nisai Yushun",         date: "2025-12-17", endDate: "2025-12-17", category: "Japan"         },
    { race: "Gun Runner Stakes",               date: "2025-12-20", endDate: "2025-12-20", category: "Listed"        },
    { race: "Springboard Mile",                date: "2025-12-20", endDate: "2025-12-20", category: "Listed"        },
    // ── January 2026 ──
    { race: "Jerome Stakes",                   date: "2026-01-03", endDate: "2026-01-03", category: "Listed"        },
    { race: "Smarty Jones Stakes",             date: "2026-01-03", endDate: "2026-01-03", category: "Listed"        },
    { race: "Pegasus World Cup",               date: "2026-01-24", endDate: "2026-01-24", category: "Grade 1"       },
    { race: "UAE 2000 Guineas",                date: "2026-01-23", endDate: "2026-01-23", category: "Dubai"         },
    { race: "Lecomte Stakes",                  date: "2026-01-17", endDate: "2026-01-17", category: "Grade 3"       },
    { race: "Holy Bull Stakes",                date: "2026-01-31", endDate: "2026-01-31", category: "Grade 3"       },
    // ── February 2026 ──
    { race: "Saudi Cup",                       date: "2026-02-13", endDate: "2026-02-15", category: "Saudi Cup"     },
    { race: "Saudi Derby",                     date: "2026-02-14", endDate: "2026-02-14", category: "Saudi Cup"     },
    { race: "Risen Star Stakes",               date: "2026-02-14", endDate: "2026-02-14", category: "Grade 2"       },
    { race: "Withers Stakes",                  date: "2026-02-06", endDate: "2026-02-06", category: "Listed"        },
    { race: "Southwest Stakes",                date: "2026-02-06", endDate: "2026-02-06", category: "Grade 3"       },
    { race: "Sam F. Davis Stakes",             date: "2026-02-07", endDate: "2026-02-07", category: "Listed"        },
    { race: "Robert B. Lewis Stakes",          date: "2026-02-07", endDate: "2026-02-07", category: "Grade 3"       },
    { race: "Sunland Park Derby",              date: "2026-02-15", endDate: "2026-02-15", category: "Listed"        },
    { race: "Dubai Road to the KY Derby",      date: "2026-02-20", endDate: "2026-02-20", category: "Dubai"         },
    { race: "John Battaglia Memorial",         date: "2026-02-21", endDate: "2026-02-21", category: "Listed"        },
    { race: "Hyacinth Stakes",                 date: "2026-02-22", endDate: "2026-02-22", category: "Japan"         },
    { race: "European Road to the KY Derby",   date: "2026-02-25", endDate: "2026-02-25", category: "Listed"        },
    { race: "Patton Stakes",                   date: "2026-02-27", endDate: "2026-02-27", category: "Group 2"       },
    { race: "Gotham Stakes",                   date: "2026-02-28", endDate: "2026-02-28", category: "Grade 3"       },
    { race: "Fountain of Youth Stakes",        date: "2026-02-28", endDate: "2026-02-28", category: "Grade 2"       },
    // ── March 2026 ──
    { race: "Cheltenham Festival",             date: "2026-03-10", endDate: "2026-03-13", category: "Cheltenham"    },
    { race: "Rebel Stakes",                    date: "2026-03-01", endDate: "2026-03-01", category: "Grade 2"       },
    { race: "Tampa Bay Derby",                 date: "2026-03-07", endDate: "2026-03-07", category: "Grade 3"       },
    { race: "San Felipe Stakes",               date: "2026-03-07", endDate: "2026-03-07", category: "Grade 2"       },
    { race: "Virginia Derby",                  date: "2026-03-14", endDate: "2026-03-14", category: "Listed"        },
    { race: "Jeff Ruby Steaks",                date: "2026-03-21", endDate: "2026-03-21", category: "Grade 3"       },
    { race: "Louisiana Derby",                 date: "2026-03-21", endDate: "2026-03-21", category: "Grade 2"       },
    { race: "Florida Derby",                   date: "2026-03-28", endDate: "2026-03-28", category: "Grade 1"       },
    { race: "Arkansas Derby",                  date: "2026-03-28", endDate: "2026-03-28", category: "Grade 1"       },
    { race: "UAE Derby",                       date: "2026-03-28", endDate: "2026-03-28", category: "Dubai"         },
    { race: "Dubai World Cup",                 date: "2026-03-28", endDate: "2026-03-28", category: "Dubai"         },
    { race: "Fukuryu Stakes",                  date: "2026-03-28", endDate: "2026-03-28", category: "Japan"         },
    { race: "Ulster National",                 date: "2026-03-29", endDate: "2026-03-29", category: "Grade 1"       },
    // ── April 2026 ──
    { race: "Blue Grass Stakes",               date: "2026-04-04", endDate: "2026-04-04", category: "Grade 1"       },
    { race: "Wood Memorial",                   date: "2026-04-04", endDate: "2026-04-04", category: "Grade 2"       },
    { race: "Santa Anita Derby",               date: "2026-04-04", endDate: "2026-04-04", category: "Grade 1"       },
    { race: "Grand National Festival",         date: "2026-04-09", endDate: "2026-04-11", category: "Grade 1"       },
    { race: "Lexington Stakes",                date: "2026-04-11", endDate: "2026-04-11", category: "Grade 3"       },
    { race: "Scottish Grand National",         date: "2026-04-17", endDate: "2026-04-18", category: "Grade 1"       },
    { race: "Bet365 Jump Finale",              date: "2026-04-25", endDate: "2026-04-25", category: "Grade 2"       },
    // ── May 2026 ──
    { race: "Kentucky Derby",                  date: "2026-05-02", endDate: "2026-05-02", category: "Triple Crown"  },
    { race: "Preakness Stakes",                date: "2026-05-16", endDate: "2026-05-16", category: "Triple Crown"  },
    // ── June 2026 ──
    { race: "Epsom Derby",                     date: "2026-06-05", endDate: "2026-06-06", category: "Group 1"       },
    { race: "Belmont Stakes",                  date: "2026-06-06", endDate: "2026-06-06", category: "Triple Crown"  },
    { race: "Royal Ascot",                     date: "2026-06-16", endDate: "2026-06-20", category: "Royal Ascot"   },
    // ── July 2026 ──
    { race: "Old Newton Cup Day",              date: "2026-07-04", endDate: "2026-07-04", category: "Group 2"       },
    { race: "July Festival at Newmarket",      date: "2026-07-09", endDate: "2026-07-11", category: "Group 1"       },
    { race: "Summer Plate Ladies Day",         date: "2026-07-18", endDate: "2026-07-18", category: "Listed"        },
    { race: "King George Weekend",             date: "2026-07-24", endDate: "2026-07-25", category: "Group 1"       },
    { race: "Qatar Goodwood Festival",         date: "2026-07-28", endDate: "2026-08-01", category: "Group 1"       },
    // ── August 2026 ──
    { race: "York Ebor Festival",              date: "2026-08-19", endDate: "2026-08-22", category: "Group 1"       },
    { race: "Sandown Park BetMGM 80s Day",     date: "2026-08-29", endDate: "2026-08-29", category: "Listed"        },
    // ── September 2026 ──
    { race: "Betfair Sprint Cup",              date: "2026-09-05", endDate: "2026-09-05", category: "Group 1"       },
    { race: "St Leger Festival",               date: "2026-09-10", endDate: "2026-09-13", category: "Group 1"       },
    // ── October 2026 ──
    { race: "Qatar Prix de l'Arc de Triomphe", date: "2026-10-03", endDate: "2026-10-04", category: "Group 1"       },
    { race: "Dubai Future Champions",          date: "2026-10-09", endDate: "2026-10-10", category: "Group 1"       },
    { race: "The Everest",                     date: "2026-10-17", endDate: "2026-10-17", category: "Grade 1"       },
    { race: "Breeders' Cup",                   date: "2026-10-30", endDate: "2026-10-31", category: "Breeders Cup"  },
    { race: "Melbourne Cup Carnival",          date: "2026-10-31", endDate: "2026-11-07", category: "Melbourne Cup" },
    // ── November 2026 ──
    { race: "Melbourne Cup Day",               date: "2026-11-03", endDate: "2026-11-03", category: "Melbourne Cup" },
    // ── December 2026 ──
    { race: "Betfair Tingle Creek Festival",   date: "2026-12-04", endDate: "2026-12-05", category: "Grade 1"       },
    { race: "Boxing Day Racing at Aintree",    date: "2026-12-26", endDate: "2026-12-26", category: "Grade 1"       },
    { race: "Boxing Day Racing at Wincanton",  date: "2026-12-26", endDate: "2026-12-26", category: "Listed"        },
    { race: "Coral Welsh Grand National",      date: "2026-12-27", endDate: "2026-12-27", category: "Grade 1"       }
  ]
};
