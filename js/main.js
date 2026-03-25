// ==================== ГЛАВНЫЙ ФАЙЛ ====================

// Загрузка всех данных
async function loadAllData() {
  loadSavedGoals();
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
    document.getElementById('week-days').innerHTML = '<div class="empty-state">⚠️ Ошибка загрузки. Проверьте:<br>1. Таблица опубликована (Файл → Поделиться → Доступ для всех)<br>2. ID таблицы правильный<br>3. Есть листы: Питание, Вода, Замеры</div>';
  }
}

// Переключение главных вкладок
function switchMainTab(tab) {
  document.querySelectorAll('.main-tab').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
  document.querySelector(`.main-tab[data-tab="${tab}"]`).classList.add('active');
  document.getElementById(`${tab}-tab`).classList.add('active');
  if (tab === 'measures') renderMeasuresTable();
}

// Переключение вкладок добавления
function switchAddTab(type) {
  document.querySelectorAll('.form-tab').forEach(btn => btn.classList.remove('active'));
  document.getElementById('food-panel').style.display = 'none';
  document.getElementById('water-panel').style.display = 'none';
  if (type === 'food') {
    document.querySelector('.form-tab[data-add="food"]').classList.add('active');
    document.getElementById('food-panel').style.display = 'block';
  } else {
    document.querySelector('.form-tab[data-add="water"]').classList.add('active');
    document.getElementById('water-panel').style.display = 'block';
  }
}

// ==================== ИНИЦИАЛИЗАЦИЯ ====================
document.addEventListener('DOMContentLoaded', () => {
  // Установка дат
  setDefaultDates();
  
  // Настройка ввода чисел
  setupNumberInputs();
  
  // Отрисовка полей замеров
  renderMeasureFormFields();
  
  // Загрузка данных
  loadAllData();
  
  // Обработчики кнопок
  document.getElementById('refreshBtn')?.addEventListener('click', loadAllData);
  document.getElementById('goalsBtn')?.addEventListener('click', showGoalSettings);
  document.getElementById('submitFoodBtn')?.addEventListener('click', submitFood);
  document.getElementById('submitWaterBtn')?.addEventListener('click', submitWater);
  document.getElementById('submitMeasureBtn')?.addEventListener('click', submitMeasure);
  document.getElementById('saveGoalsBtn')?.addEventListener('click', saveGoals);
  document.getElementById('closeModalBtn')?.addEventListener('click', closeGoalModal);
  document.getElementById('cancelModalBtn')?.addEventListener('click', closeGoalModal);
  
  // Обработчики вкладок
  document.querySelectorAll('.main-tab').forEach(btn => {
    btn.addEventListener('click', () => switchMainTab(btn.dataset.tab));
  });
  document.querySelectorAll('.form-tab').forEach(btn => {
    btn.addEventListener('click', () => switchAddTab(btn.dataset.add));
  });
  
  // Закрытие модального окна по клику вне
  window.onclick = function(event) {
    const modal = document.getElementById('goalModal');
    if (event.target === modal) closeGoalModal();
  };
});
