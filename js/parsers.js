// ==================== ПАРСЕРЫ ДАННЫХ ====================

// Парсинг CSV
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

// Парсинг данных питания
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

// Парсинг данных воды
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

// Парсинг данных замеров
function parseMeasuresData(rows) {
  if (!rows || rows.length < 2) return [];
  let out = [];
  
  for (let i = 1; i < rows.length; i++) {
    let r = rows[i];
    // Проверяем, что есть дата и это не пустая строка
    if (!r[0] || r[0].trim() === '' || r[0] === 'Дата') continue;
    
    // Проверяем, что это не заголовок или мусор
    let dateStr = r[0].trim();
    if (dateStr.includes('ПЛЕЧИ') || dateStr.includes('БИЦЕТС') || dateStr.includes('ШЕЯ')) continue;
    
    out.push({
      date: formatDate(dateStr),
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
  
  // Удаляем дубликаты и сортируем
  let unique = [];
  let dates = new Set();
  for (let m of out) {
    if (!dates.has(m.date)) {
      dates.add(m.date);
      unique.push(m);
    }
  }
  
  return unique.sort((a, b) => dateToSortValue(a.date) - dateToSortValue(b.date));
}
