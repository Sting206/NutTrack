// ==================== РАБОТА С API ====================

// Загрузка листа как CSV
async function loadSheetAsCSV(sheetName) {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`${sheetName}: ${resp.status}`);
  return parseCSV(await resp.text());
}

// Отправка данных в Google Sheets
async function postToSheet(action, data) {
  try {
    const formData = new URLSearchParams();
    formData.append('action', action);
    for (let [key, val] of Object.entries(data)) {
      if (val !== undefined && val !== null && val !== '') formData.append(key, val);
    }
    const response = await fetch(WEB_APP_URL, { method: 'POST', body: formData });
    const result = await response.text();
    return result === 'OK' || result.includes('success');
  } catch (e) {
    console.error('Ошибка отправки:', e);
    return false;
  }
}
