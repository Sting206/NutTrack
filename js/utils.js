// ==================== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ====================

// Форматирование даты в DD.MM.YYYY
function formatDate(dateStr) {
  if (!dateStr) return '';
  let d = new Date(dateStr);
  if (!isNaN(d.getTime())) {
    return `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1).toString().padStart(2, '0')}.${d.getFullYear()}`;
  }
  let parts = dateStr.split(/[.\/]/);
  if (parts.length === 2) {
    let year = new Date().getFullYear();
    return `${parts[0].padStart(2, '0')}.${parts[1].padStart(2, '0')}.${year}`;
  }
  if (parts.length === 3) return `${parts[0].padStart(2, '0')}.${parts[1].padStart(2, '0')}.${parts[2]}`;
  return dateStr;
}

// Преобразование даты в число для сортировки (YYYYMMDD)
function dateToSortValue(dateStr) {
  if (!dateStr) return 0;
  let parts = dateStr.split('.');
  if (parts.length === 3) {
    return parseInt(parts[2] + parts[1].padStart(2,'0') + parts[0].padStart(2,'0'));
  }
  return 0;
}

// Получить сегодняшнюю дату в формате DD.MM.YYYY
function getTodayFormatted() {
  let d = new Date();
  return `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1).toString().padStart(2, '0')}.${d.getFullYear()}`;
}

// Показать сообщение
function showMessage(elId, text, type) {
  let el = document.getElementById(elId);
  if (el) { 
    el.textContent = text; 
    el.className = type === 'error' ? 'error-message' : 'success-message'; 
    setTimeout(() => { if(el) el.textContent = ''; }, 4000); 
  }
}

// Переключение аккордеона
function toggle(id) { 
  let el = document.getElementById(id); 
  if (el) el.classList.toggle('open'); 
}

// Парсинг числа с запятой
function parseNumber(value) {
  if (!value || value === '—' || value === '-' || value === '') return 0;
  let str = String(value).trim().replace(',', '.');
  let num = parseFloat(str);
  return isNaN(num) ? 0 : num;
}

// Агрегация данных по дням
function aggregateByDay(foods) {
  let daily = {};
  foods.forEach(f => {
    if (!daily[f.date]) daily[f.date] = { kcal: 0, protein: 0, carbs: 0, fat: 0, meals: [] };
    daily[f.date].kcal += f.kcal;
    daily[f.date].protein += f.protein;
    daily[f.date].carbs += f.carbs;
    daily[f.date].fat += f.fat;
    daily[f.date].meals.push(f);
  });
  return daily;
}

// Получить воду по дням
function getWaterByDay(water) {
  let w = {};
  water.forEach(wd => { w[wd.date] = (w[wd.date] || 0) + wd.amount; });
  return w;
}

// Получить последние N дней
function getLastNDays(dailyData, n = 7) {
  let dates = Object.keys(dailyData).sort((a,b) => dateToSortValue(b) - dateToSortValue(a));
  let lastDates = dates.slice(0, n);
  let filtered = {};
  lastDates.forEach(d => { filtered[d] = dailyData[d]; });
  return { filtered, dates: lastDates };
}
