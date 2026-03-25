// ==================== РАБОТА С API ====================
async function loadSheetAsCSV(sheetName) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    const callbackName = 'callback_' + Date.now();
    
    window[callbackName] = function(data) {
      delete window[callbackName];
      document.body.removeChild(script);
      
      // Преобразуем JSON в CSV
      if (data && data.table && data.table.rows) {
        const rows = data.table.rows.map(row => 
          row.c.map(cell => cell ? cell.v : '')
        );
        resolve(rows);
      } else {
        reject(new Error('Неверный формат данных'));
      }
    };
    
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}&callback=${callbackName}`;
    script.src = url;
    document.body.appendChild(script);
    
    setTimeout(() => {
      if (window[callbackName]) {
        delete window[callbackName];
        reject(new Error('Timeout'));
      }
    }, 10000);
  });
}

function submitFood() {
  let dateInput = document.getElementById('food-date').value;
  if (!dateInput) return showMessage('food-message', 'Выберите дату', 'error');
  let desc = document.getElementById('food-desc').value;
  if (!desc) return showMessage('food-message', 'Введите описание', 'error');
  let kcal = parseFloat(document.getElementById('food-kcal').value) || 0,
      prot = parseFloat(document.getElementById('food-protein').value) || 0,
      carbs = parseFloat(document.getElementById('food-carbs').value) || 0,
      fat = parseFloat(document.getElementById('food-fat').value) || 0;
  let date = formatDate(dateInput);
  let meal = document.getElementById('meal-type').value;
  appData.foods.push({ date, mealType: meal, description: desc, kcal, protein: prot, carbs, fat });
  postToSheet('food', { date: dateInput, mealType: meal, description: desc, kcal, protein: prot, carbs, fat });
  showMessage('food-message', '✅ Добавлено!', 'success');
  document.getElementById('food-desc').value = '';
  ['food-kcal', 'food-protein', 'food-carbs', 'food-fat'].forEach(id => { let el = document.getElementById(id); if (el) el.value = ''; });
  loadAllData();
}

function submitWater() {
  let dateInput = document.getElementById('water-date').value;
  if (!dateInput) return showMessage('water-message', 'Выберите дату', 'error');
  let amount = parseFloat(document.getElementById('water-amount').value);
  if (!amount) return showMessage('water-message', 'Введите объём воды', 'error');
  let date = formatDate(dateInput);
  appData.water.push({ date, amount });
  postToSheet('water', { date: dateInput, amount });
  showMessage('water-message', '✅ Вода добавлена', 'success');
  document.getElementById('water-amount').value = '';
  loadAllData();
}

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
  loadAllData();
}
