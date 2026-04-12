function handleUpload(file, type) {
  const reader = new FileReader();
  reader.onload = function(e) {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: 'array' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);

    if (type === 'overall') {
      cyclingData.overall = rows.map((r, i) => ({
        pos: i + 1,
        name: r.name,
        team: r.team,
        time: r.time
      }));
      document.getElementById('overall-rankings').innerHTML = buildLeaderboard(cyclingData.overall, { statLabel: 'Time', statKey: 'time' });
    } else if (type === 'oneday') {
      cyclingData.oneDay = rows.map((r, i) => ({
        pos: i + 1,
        name: r.name,
        team: r.team,
        points: r.points
      }));
      document.getElementById('oneday-rankings').innerHTML = buildLeaderboard(cyclingData.oneDay, { statLabel: 'Points', statKey: 'points' });
    } else if (type === 'stage') {
      cyclingData.stage = rows.map((r, i) => ({
        pos: i + 1,
        name: r.name,
        team: r.team,
        wins: r.wins
      }));
      document.getElementById('stage-rankings').innerHTML = buildLeaderboard(cyclingData.stage, { statLabel: 'Wins', statKey: 'wins' });
    } else if (type === 'vam') {
      cyclingData.vam = rows.map((r, i) => ({
        pos: i + 1,
        name: r.name,
        team: r.team,
        vam: r.vam
      }));
      document.getElementById('vam-rankings').innerHTML = buildLeaderboard(cyclingData.vam, { statLabel: 'VAM', statKey: 'vam' });
    } else if (type === 'wkg') {
      cyclingData.wkg = rows.map((r, i) => ({
        pos: i + 1,
        name: r.name,
        team: r.team,
        wkg: r.wkg
      }));
      document.getElementById('wkg-rankings').innerHTML = buildLeaderboard(cyclingData.wkg, { statLabel: 'W/kg', statKey: 'wkg' });
    } else if (type === 'calendar') {
      cyclingData.calendar = rows.map(r => ({
        date: r.date,
        race: r.race,
        category: r.category,
        status: r.status
      }));
      document.getElementById('calendar').innerHTML = buildCalendar();
    }
  };
  reader.readAsArrayBuffer(file);
}