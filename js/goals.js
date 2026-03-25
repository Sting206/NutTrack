// ==================== УПРАВЛЕНИЕ ЦЕЛЯМИ ====================

// Показать модальное окно настроек
function showGoalSettings() {
  const modal = document.getElementById('goalModal');
  if (modal) {
    document.getElementById('targetKcal').value = GOALS.kcal;
    document.getElementById('targetProtein').value = GOALS.protein;
    document.getElementById('targetCarbs').value = GOALS.carbs;
    document.getElementById('targetFat').value = GOALS.fat;
    document.getElementById('targetWater').value = GOALS.water;
    document.getElementById('targetWeight').value = GOALS.targetWeight;
    modal.style.display = 'block';
  }
}

// Закрыть модальное окно
function closeGoalModal() {
  const modal = document.getElementById('goalModal');
  if (modal) modal.style.display = 'none';
}

// Сохранить цели
function saveGoals() {
  GOALS.kcal = parseInt(document.getElementById('targetKcal').value) || DEFAULT_GOALS.kcal;
  GOALS.protein = parseInt(document.getElementById('targetProtein').value) || DEFAULT_GOALS.protein;
  GOALS.carbs = parseInt(document.getElementById('targetCarbs').value) || DEFAULT_GOALS.carbs;
  GOALS.fat = parseInt(document.getElementById('targetFat').value) || DEFAULT_GOALS.fat;
  GOALS.water = parseInt(document.getElementById('targetWater').value) || DEFAULT_GOALS.water;
  GOALS.targetWeight = parseFloat(document.getElementById('targetWeight').value) || DEFAULT_GOALS.targetWeight;
  
  localStorage.setItem('userGoals', JSON.stringify(GOALS));
  updateGoalsDisplay();
  renderDashboardAndHistory();
  renderMeasuresTable();
  closeGoalModal();
  showMessage('food-message', '✅ Цели сохранены!', 'success');
}

// Обновить отображение целей в шапке
function updateGoalsDisplay() {
  const goalsHeader = document.querySelector('.goals-header');
  if (goalsHeader) {
    goalsHeader.innerHTML = `<strong>Цели в день</strong><br>🔥 ${GOALS.kcal} ккал &nbsp;|&nbsp; 💪 ${GOALS.protein}г белка &nbsp;|&nbsp; 🌾 ${GOALS.carbs}г углеводов &nbsp;|&nbsp; 🥑 ${GOALS.fat}г жиров &nbsp;|&nbsp; 💧 ${GOALS.water/1000}л воды`;
  }
}

// Загрузить сохраненные цели
function loadSavedGoals() {
  const savedGoals = localStorage.getItem('userGoals');
  if (savedGoals) {
    const parsed = JSON.parse(savedGoals);
    GOALS.kcal = parsed.kcal || DEFAULT_GOALS.kcal;
    GOALS.protein = parsed.protein || DEFAULT_GOALS.protein;
    GOALS.carbs = parsed.carbs || DEFAULT_GOALS.carbs;
    GOALS.fat = parsed.fat || DEFAULT_GOALS.fat;
    GOALS.water = parsed.water || DEFAULT_GOALS.water;
    GOALS.targetWeight = parsed.targetWeight || DEFAULT_GOALS.targetWeight;
    updateGoalsDisplay();
  }
}
