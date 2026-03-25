// ==================== ГЛАВНЫЙ ФАЙЛ ====================
async function loadAllData() {
  document.getElementById('week-days').innerHTML = '<div class="loading">Загрузка...</div>';
  try {
    let [food, water, measures] = await Promise.all([
      loadSheetAsCSV('Питание').catch(() => []),
      loadSheetAsCSV('Вода').catch(() => []),
      loadSheetAsCSV('Замеры').catch(() => [])
    ]);
    
    appData.foods = parseFoodData(food);
    appData.water = parseWaterData(water);
    appData.measures = parseMeasuresData(measures);
    appData.weights = appData.measures.filter(m => m.weight > 0).map(m => ({ date: m.date, weight: m.weight }));
    appData.weights.sort((a, b) => dateToSortValue(a.date) - dateToSortValue(b.date));
    renderDashboardAndHistory();
    renderMeasuresTable();
  } catch (e) {
    console.error(e);
    document.getElementById('week-days').innerHTML = '<div class="empty-state">Ошибка загрузки. Проверьте ID таблицы и что она опубликована.</div>';
  }
}

function switchMainTab(tab) {
  document.querySelectorAll('.main-tab').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
  document.querySelector(`.main-tab[onclick="switchMainTab('${tab}')"]`).classList.add('active');
  document.getElementById(`${tab}-tab`).classList.add('active');
  if (tab === 'measures') renderMeasuresTable();
}

function switchAddTab(type) {
  document.querySelectorAll('.form-tab').forEach(btn => btn.classList.remove('active'));
  document.getElementById('food-panel').style.display = 'none';
  document.getElementById('water-panel').style.display = 'none';
  if (type === 'food') {
    document.querySelector('.form-tab:first-child').classList.add('active');
    document.getElementById('food-panel').style.display = 'block';
  } else {
    document.querySelector('.form-tab:last-child').classList.add('active');
    document.getElementById('water-panel').style.display = 'block';
  }
}

function setDefaultDates() {
  let today = new Date().toISOString().split('T')[0];
  ['food-date', 'water-date'].forEach(id => { let el = document.getElementById(id); if (el) el.value = today; });
}

// Инициализация
setDefaultDates();
renderMeasureFormFields();
loadAllData();
