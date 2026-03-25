// ==================== ОБРАБОТКА ФОРМ ====================

// Отправка еды
function submitFood() {
  let dateInput = document.getElementById('food-date').value;
  if (!dateInput) return showMessage('food-message', 'Выберите дату', 'error');
  let desc = document.getElementById('food-desc').value;
  if (!desc) return showMessage('food-message', 'Введите описание', 'error');
  let kcal = parseFloat(document.getElementById('food-kcal').value.replace(',', '.')) || 0,
      prot = parseFloat(document.getElementById('food-protein').value.replace(',', '.')) || 0,
      carbs = parseFloat(document.getElementById('food-carbs').value.replace(',', '.')) || 0,
      fat = parseFloat(document.getElementById('food-fat').value.replace(',', '.')) || 0;
  let date = formatDate(dateInput);
  let meal = document.getElementById('meal-type').value;
  
  appData.foods.push({ date, mealType: meal, description: desc, kcal, protein: prot, carbs, fat });
  postToSheet('food', { date: dateInput, mealType: meal, description: desc, kcal, protein: prot, carbs, fat });
  showMessage('food-message', '✅ Добавлено!', 'success');
  
  document.getElementById('food-desc').value = '';
  ['food-kcal', 'food-protein', 'food-carbs', 'food-fat'].forEach(id => { 
    let el = document.getElementById(id); 
    if (el) el.value = ''; 
  });
  loadAllData();
}

// Отправка воды
function submitWater() {
  let dateInput = document.getElementById('water-date').value;
  if (!dateInput) return showMessage('water-message', 'Выберите дату', 'error');
  let amount = parseFloat(document.getElementById('water-amount').value.replace(',', '.')) || 0;
  if (!amount) return showMessage('water-message', 'Введите объём воды', 'error');
  let date = formatDate(dateInput);
  
  appData.water.push({ date, amount });
  postToSheet('water', { date: dateInput, amount });
  showMessage('water-message', '✅ Вода добавлена', 'success');
  document.getElementById('water-amount').value = '';
  loadAllData();
}

// Отправка замера
function submitMeasure() {
  let dateInput = document.getElementById('measure-date')?.value;
  if (!dateInput) return showMessage('measure-message', 'Выберите дату', 'error');
  let date = formatDate(dateInput);
  let m = { date };
  
  for (let cat of MEASURE_CATEGORIES) {
    if (cat.key === 'date') continue;
    let val = parseFloat(document.getElementById(`measure-${cat.key}`)?.value);
    if (!isNaN(val) && val !== 0) m[cat.key] = val;
  }
  
  appData.measures.push(m);
  appData.measures.sort((a, b) => dateToSortValue(a.date) - dateToSortValue(b.date));
  
  if (m.weight && m.weight > 0) {
    appData.weights.push({ date, weight: m.weight });
    appData.weights.sort((a, b) => dateToSortValue(a.date) - dateToSortValue(b.date));
  }
  
  postToSheet('measure', { date: dateInput, ...m });
  showMessage('measure-message', '✅ Замер добавлен', 'success');
  renderMeasuresTable();
  loadAllData();
}

// Настройка ввода чисел
function setupNumberInputs() {
  const numberInputs = ['food-kcal', 'food-protein', 'food-carbs', 'food-fat', 'water-amount'];
  numberInputs.forEach(id => {
    const input = document.getElementById(id);
    if (input) {
      input.addEventListener('input', function(e) {
        this.value = this.value.replace(/[^\d.,]/g, '');
        this.value = this.value.replace(',', '.');
        const parts = this.value.split('.');
        if (parts.length > 2) this.value = parts[0] + '.' + parts.slice(1).join('');
      });
    }
  });
}

// Установка дат по умолчанию
function setDefaultDates() {
  let today = new Date().toISOString().split('T')[0];
  ['food-date', 'water-date'].forEach(id => { 
    let el = document.getElementById(id); 
    if (el) el.value = today; 
  });
}
