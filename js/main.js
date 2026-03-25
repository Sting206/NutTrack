// ==================== ГЛАВНЫЙ ФАЙЛ ====================

async function loadAllData() {
  loadSavedGoals();
  const weekDaysDiv = document.getElementById('week-days');
  if (weekDaysDiv) weekDaysDiv.innerHTML = '<div class="loading">Загрузка...</div>';
  
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
    console.error('Ошибка загрузки:', e);
    if (weekDaysDiv) {
      weekDaysDiv.innerHTML = '<div class="empty-state">⚠️ Ошибка загрузки. Проверьте:<br>1. Таблица опубликована (Файл → Поделиться → Доступ для всех)<br>2. ID таблицы правильный<br>3. Есть листы: Питание, Вода, Замеры</div>';
    }
  }
}

function switchMainTab(tab) {
  document.querySelectorAll('.main-tab').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
  const activeTab = document.querySelector(`.main-tab[data-tab="${tab}"]`);
  if (activeTab) activeTab.classList.add('active');
  const activeContent = document.getElementById(`${tab}-tab`);
  if (activeContent) activeContent.classList.add('active');
  if (tab === 'measures') renderMeasuresTable();
}

function switchAddTab(type) {
  document.querySelectorAll('.form-tab').forEach(btn => btn.classList.remove('active'));
  const foodPanel = document.getElementById('food-panel');
  const waterPanel = document.getElementById('water-panel');
  if (foodPanel) foodPanel.style.display = 'none';
  if (waterPanel) waterPanel.style.display = 'none';
  if (type === 'food') {
    const activeTab = document.querySelector('.form-tab[data-add="food"]');
    if (activeTab) activeTab.classList.add('active');
    if (foodPanel) foodPanel.style.display = 'block';
  } else {
    const activeTab = document.querySelector('.form-tab[data-add="water"]');
    if (activeTab) activeTab.classList.add('active');
    if (waterPanel) waterPanel.style.display = 'block';
  }
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
  setDefaultDates();
  setupNumberInputs();
  renderMeasureFormFields();
  loadAllData();
  
  const refreshBtn = document.getElementById('refreshBtn');
  if (refreshBtn) refreshBtn.addEventListener('click', loadAllData);
  
  const goalsBtn = document.getElementById('goalsBtn');
  if (goalsBtn) goalsBtn.addEventListener('click', showGoalSettings);
  
  const submitFoodBtn = document.getElementById('submitFoodBtn');
  if (submitFoodBtn) submitFoodBtn.addEventListener('click', submitFood);
  
  const submitWaterBtn = document.getElementById('submitWaterBtn');
  if (submitWaterBtn) submitWaterBtn.addEventListener('click', submitWater);
  
  const submitMeasureBtn = document.getElementById('submitMeasureBtn');
  if (submitMeasureBtn) submitMeasureBtn.addEventListener('click', submitMeasure);
  
  const saveGoalsBtn = document.getElementById('saveGoalsBtn');
  if (saveGoalsBtn) saveGoalsBtn.addEventListener('click', saveGoals);
  
  const closeModalBtn = document.getElementById('closeModalBtn');
  if (closeModalBtn) closeModalBtn.addEventListener('click', closeGoalModal);
  
  const cancelModalBtn = document.getElementById('cancelModalBtn');
  if (cancelModalBtn) cancelModalBtn.addEventListener('click', closeGoalModal);
  
  document.querySelectorAll('.main-tab').forEach(btn => {
    btn.addEventListener('click', () => switchMainTab(btn.dataset.tab));
  });
  
  document.querySelectorAll('.form-tab').forEach(btn => {
    btn.addEventListener('click', () => switchAddTab(btn.dataset.add));
  });
  
  window.onclick = function(event) {
    const modal = document.getElementById('goalModal');
    if (event.target === modal) closeGoalModal();
  };
});
