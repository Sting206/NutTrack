// ==================== ПАРСЕРЫ ДАННЫХ ====================
function parseCSV(csv) {
  let rows = [], lines = csv.split('\n');
  for (let line of lines) {
    if (!line.trim()) continue;
    let row = [], inQuotes = false, cell = '';
    for (let ch of line) {
      if (ch === '"') inQuotes = !inQuotes;
      else if (ch === ',' && !inQuotes) { row.push(cell.trim()); cell = ''; }
      else cell += ch;
    }
    row.push(cell.trim());
    rows.push(row.map(c => c.replace(/^"|"$/g, '')));
  }
  return rows;
}

function parseFoodData(rows) {
  if (rows.length < 2) return [];
  let h = rows[0].map(s => s.toLowerCase());
  let di = h.findIndex(i => i.includes('дата'));
  let mi = h.findIndex(i => i.includes('прием'));
  let de = h.findIndex(i => i.includes('описание'));
  let ki = h.findIndex(i => i === 'ккал');
  let pi = h.findIndex(i => i === 'белок');
  let ci = h.findIndex(i => i === 'углеводы');
  let fi = h.findIndex(i => i === 'жиры');
  let out = [];
  for (let i = 1; i < rows.length; i++) {
    let r = rows[i];
    if (!r[di]) continue;
    out.push({
      date: formatDate(r[di]),
      mealType: r[mi] ? r[mi].toLowerCase() : 'доп',
      description: r[de] || '—',
      kcal: parseNumber(r[ki]),
      protein: parseNumber(r[pi]),
      carbs: parseNumber(r[ci]),
      fat: parseNumber(r[fi])
    });
  }
  return out;
}

function parseWaterData(rows) {
  if (rows.length < 2) return [];
  let h = rows[0].map(s => s.toLowerCase());
  let di = h.findIndex(i => i.includes('дата'));
  let ai = h.findIndex(i => i.includes('мл') || i.includes('вода'));
  let out = [];
  for (let i = 1; i < rows.length; i++) {
    let r = rows[i];
    let a = parseNumber(r[ai]);
    if (r[di] && a > 0) out.push({ date: formatDate(r[di]), amount: a });
  }
  return out;
}

function parseMeasuresData(rows) {
  if (rows.length < 2) return [];
  let out = [];
  for (let i = 1; i < rows.length; i++) {
    let r = rows[i];
    if (!r[0] || r[0].trim() === '') continue;
    out.push({
      date: formatDate(r[0]),
      age: parseNumber(r[1]),
      weight: parseNumber(r[2]),
      calfL: parseNumber(r[3]),
      calfR: parseNumber(r[4]),
      thighL: parseNumber(r[5]),
      thighR: parseNumber(r[6]),
      waist: parseNumber(r[7]),
      hips: parseNumber(r[8]),
      chest: parseNumber(r[9]),
      shoulders: parseNumber(r[10]),
      bicepL: parseNumber(r[11]),
      bicepR: parseNumber(r[12]),
      neck: parseNumber(r[13])
    });
  }
  return out.sort((a, b) => dateToSortValue(a.date) - dateToSortValue(b.date));
}
