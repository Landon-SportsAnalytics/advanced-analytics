let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

function buildLeaderboard(data, columns) {
  return `
    <table style="width:100%; border-collapse: collapse; font-size: 14px;">
      <thead>
        <tr style="border-bottom: 2px solid #e94560;">
          <th style="text-align:left; padding: 8px 4px; color: #1a1a2e;">Pos</th>
          <th style="text-align:left; padding: 8px 4px; color: #1a1a2e;">Rider</th>
          <th style="text-align:left; padding: 8px 4px; color: #1a1a2e;">Team</th>
          <th style="text-align:right; padding: 8px 4px; color: #1a1a2e;">${columns.statLabel}</th>
        </tr>
      </thead>
      <tbody>
        ${data.map((row, i) => `
          <tr style="border-bottom: 0.5px solid #e0e0e0; background: ${i % 2 === 0 ? '#fff' : '#f9f9f9'}">
            <td style="padding: 8px 4px; font-weight: 600; color: #e94560;">${row.pos}</td>
            <td style="padding: 8px 4px; font-weight: 500;">${row.name}</td>
            <td style="padding: 8px 4px; color: #666; font-size: 13px;">${row.team}</td>
            <td style="padding: 8px 4px; text-align:right; font-weight: 600;">${row[columns.statKey]}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    <div style="text-align:right; margin-top:10px;">
      <a href="rankings.html?type=${columns.rankingType}" style="font-size:13px; color:#e94560; text-decoration:none; font-weight:600;">View full rankings &#8594;</a>
    </div>
  `;
}

function buildCalendar() {
  const month = currentMonth;
  const year = currentYear;
  const now = new Date();

  const monthNames = ["January","February","March","April","May","June",
    "July","August","September","October","November","December"];

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayDate = now.getDate();

  const raceMap = {};
  cyclingData.calendar.forEach(event => {
    const parseDate = (str) => {
        const [y, m, d] = str.split('-').map(Number);
        return new Date(y, m - 1, d);
    };
    const start = parseDate(event.date);
    const end = parseDate(event.endDate);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      if (d.getMonth() === month && d.getFullYear() === year) {
        const day = d.getDate();
        if (!raceMap[day]) raceMap[day] = [];
        raceMap[day].push(event);
      }
    }
  });

  const isPast = (day) => {
    const date = new Date(year, month, day);
    return date < new Date(now.getFullYear(), now.getMonth(), now.getDate());
  };

  let html = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
        <button onclick="prevMonth()" style="background:#1a1a2e; color:white; border:none; border-radius:6px; padding:6px 14px; cursor:pointer; font-size:16px;">&#8592;</button>
        <h3 style="margin:0; color:#1a1a2e;">${monthNames[month]} ${year}</h3>
        <button onclick="nextMonth()" style="background:#1a1a2e; color:white; border:none; border-radius:6px; padding:6px 14px; cursor:pointer; font-size:16px;">&#8594;</button>
    </div>
    <div style="display:flex; flex-wrap:wrap; gap:8px; margin-bottom:16px;">
        ${Object.entries(classColors).map(([cls, color]) => `
        <span style="display:inline-flex; align-items:center; gap:4px; font-size:12px; color:#333;">
        <span style="width:12px; height:12px; border-radius:2px; background:${color}; display:inline-block; border:0.5px solid #ccc;"></span>
        ${cls}
        </span>
    `).join('')}
    </div>
    <table style="width:100%; border-collapse:collapse; font-size:13px;">
      <thead>
        <tr>
          ${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d =>
            `<th style="padding:6px; text-align:center; color:#666; font-weight:500;">${d}</th>`
          ).join('')}
        </tr>
      </thead>
      <tbody>
  `;

  let day = 1;
  for (let week = 0; week < 6; week++) {
    if (day > daysInMonth) break;
    html += '<tr>';
    for (let dow = 0; dow < 7; dow++) {
      if ((week === 0 && dow < firstDay) || day > daysInMonth) {
        html += '<td style="padding:4px; height:80px;"></td>';
      } else {
        const events = raceMap[day] || [];
        const isToday = day === todayDate;
        const past = isPast(day);
        html += `
          <td style="padding:4px; height:80px; vertical-align:top; border:0.5px solid #e0e0e0;">
            <div style="font-weight:${isToday ? '700' : '400'}; color:${isToday ? '#e5cc66' : '#333'}; font-size:12px; margin-bottom:2px;">${day}</div>
            ${events.slice(0, 2).map(event => `
              <div style="background:${classColors[event.category] || '#888'}; opacity:${past ? '0.5' : '1'}; color:white; border-radius:3px; padding:2px 4px; font-size:10px; line-height:1.3; margin-bottom:2px; overflow:hidden; white-space:nowrap; text-overflow:ellipsis;" title="${event.race}">${event.race}</div>
            `).join('')}
            ${events.length > 2 ? `<div style="font-size:10px; color:#666;">+${events.length - 2} more</div>` : ''}
          </td>
        `;
        day++;
      }
    }
    html += '</tr>';
  }

  html += '</tbody></table>';
  return html;
}

function prevMonth() {
  currentMonth--;
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }
  document.getElementById('calendar').innerHTML = buildCalendar();
}

function nextMonth() {
  currentMonth++;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  document.getElementById('calendar').innerHTML = buildCalendar();
}

// ─────────────────────────────────────────────────────────────
// CSV data loader
// To update rankings: replace the files in Cycling/data/ and push to GitHub.
// CSV format: pos,name,team,points  (header row required)
// ─────────────────────────────────────────────────────────────
function parseCSV(text) {
  const lines = text.trim().split('\n').map(line => {
    const cells = [];
    let cur = '', inQuote = false;
    for (const ch of line) {
      if (ch === '"') { inQuote = !inQuote; }
      else if (ch === ',' && !inQuote) { cells.push(cur.trim()); cur = ''; }
      else { cur += ch; }
    }
    cells.push(cur.trim());
    return cells;
  });
  const headers = lines[0].map(h => h.replace(/"/g, '').toLowerCase());
  return lines.slice(1)
    .filter(cells => cells.some(c => c))
    .map(cells => Object.fromEntries(headers.map((h, i) => [h, (cells[i] || '').replace(/"/g, '')])));
}

async function fetchCSV(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Could not load ${path}`);
  return parseCSV(await res.text());
}

function toRankingRows(rows, statKey) {
  return rows.map(r => ({ pos: r.pos, name: r.name, team: r.team, [statKey]: r[statKey] || '—' }));
}

function renderAll(data) {
  document.getElementById('overall-rankings').innerHTML = buildLeaderboard(data.overall, { statLabel: 'Points', statKey: 'points', rankingType: 'overall' });
  document.getElementById('oneday-rankings').innerHTML  = buildLeaderboard(data.oneDay,  { statLabel: 'Points', statKey: 'points', rankingType: 'oneday'  });
  document.getElementById('stage-rankings').innerHTML   = buildLeaderboard(data.stage,   { statLabel: 'Points', statKey: 'points', rankingType: 'stage'   });
  document.getElementById('vam-rankings').innerHTML     = buildLeaderboard(data.vam,     { statLabel: 'VAM',    statKey: 'vam',    rankingType: 'vam'     });
  document.getElementById('wkg-rankings').innerHTML     = buildLeaderboard(data.wkg,     { statLabel: 'W/kg',   statKey: 'wkg',    rankingType: 'wkg'     });
  document.getElementById('calendar').innerHTML = buildCalendar();
}

async function init() {
  try {
    const [overall, oneDay, stage, vam, wkg] = await Promise.all([
      fetchCSV('data/overall.csv'),
      fetchCSV('data/oneday.csv'),
      fetchCSV('data/stage.csv'),
      fetchCSV('data/vam.csv'),
      fetchCSV('data/wkg.csv'),
    ]);
    renderAll({
      overall: toRankingRows(overall, 'points'),
      oneDay:  toRankingRows(oneDay,  'points'),
      stage:   toRankingRows(stage,   'points'),
      vam:     toRankingRows(vam,     'vam'),
      wkg:     toRankingRows(wkg,     'wkg'),
    });
  } catch (e) {
    console.warn('CSV load failed — using local data.js fallback:', e);
    renderAll(cyclingData);
  }
}

init();