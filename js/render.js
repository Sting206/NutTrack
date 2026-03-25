// ==================== ОТРИСОВКА UI ====================

function renderDashboardAndHistory() {
  let dailyAll = aggregateByDay(appData.foods);
  let waterByDay = getWaterByDay(appData.water);
  let { filtered: lastWeekDaily, dates: lastWeekDates } = getLastNDays(dailyAll, 7);
  let today = getTodayFormatted();
  let todayData = dailyAll[today] || { kcal: 0, protein: 0, carbs: 0, fat: 0 };
  let todayWater = waterByDay[today] || 0;
  
  let rem = { 
    kcal: GOALS.kcal - todayData.kcal, 
    protein: GOALS.protein - todayData.protein, 
    carbs: GOALS.carbs - todayData.carbs, 
    fat: GOALS.fat - todayData.fat, 
    water: GOALS.water - todayWater 
  };
  let remHtml = '';
  for (let [k, v] of Object.entries(rem)) {
    let rounded = Math.round(v);
    let cls = rounded >= 0 ? (rounded < 50 ? 'warning' : 'positive') : 'negative';
    remHtml += `<div class="remaining-item"><div class="remaining-value ${cls}">${rounded >= 0 ? rounded : `-${Math.abs(rounded)}`}</div><div class="remaining-label">${k === 'kcal' ? 'ккал' : k === 'protein' ? '🥩 белок г' : k === 'carbs' ? '🍚 углеводы г' : k === 'fat' ? '🧈 жиры г' : '💧 вода мл'}</div></div>`;
  }
  document.getElementById('remaining-items').innerHTML = remHtml;

  let weekLabels = [...lastWeekDates].reverse();
  let kcalData = weekLabels.map(d => lastWeekDaily[d]?.kcal || 0);
  let protData = weekLabels.map(d => lastWeekDaily[d]?.protein || 0);
  let carbsData = weekLabels.map(d => lastWeekDaily[d]?.carbs || 0);
  let fatData = weekLabels.map(d => lastWeekDaily[d]?.fat || 0);
  
  if (charts.nutrients) charts.nutrients.destroy();
  let nCtx = document.getElementById('nutrientsChart')?.getContext('2d');
  if (nCtx && weekLabels.length) {
    charts.nutrients = new Chart(nCtx, {
      type: 'bar', 
      data: { 
        labels: weekLabels, 
        datasets: [
          { label: 'Ккал', data: kcalData, backgroundColor: '#F1C800', borderRadius: 6, yAxisID: 'yKcal' },
          { label: 'Белок г', data: protData, backgroundColor: '#F16D00', borderRadius: 6, yAxisID: 'yGrams' },
          { label: 'Углеводы г', data: carbsData, backgroundColor: '#5af5c8', borderRadius: 6, yAxisID: 'yGrams' },
          { label: 'Жиры г', data: fatData, backgroundColor: '#ff6b6b', borderRadius: 6, yAxisID: 'yGrams' }
        ] 
      }, 
      options: { 
        responsive: true, 
        maintainAspectRatio: false, 
        scales: { 
          yKcal: { min: 0, max: 4000, position: 'left', ticks: { color: '#F1C800' } }, 
          yGrams: { min: 0, max: 500, position: 'right', ticks: { color: '#5af5c8' } } 
        } 
      }
    });
  }

  let avgWater = lastWeekDates.reduce((s, d) => s + (waterByDay[d] || 0), 0) / (lastWeekDates.length || 1);
  document.getElementById('water-summary').innerHTML = `
    <div class="water-card"><div class="water-value">${Math.round(todayWater)} мл</div><div>сегодня / ${GOALS.water} мл</div><div class="bar-track"><div class="bar-fill water" style="width:${Math.min(100, todayWater / GOALS.water * 100)}%"></div></div></div>
    <div class="water-card"><div class="water-value">${Math.round(avgWater)} мл</div><div>среднее за 7 дней</div></div>`;

  let weekDaysHtml = '';
  lastWeekDates.forEach((date, i) => {
    let day = lastWeekDaily[date];
    if (!day) return;
    let kcalP = (day.kcal / GOALS.kcal) * 100;
    let protP = (day.protein / GOALS.protein) * 100;
    let carbsP = (day.carbs / GOALS.carbs) * 100;
    let fatP = (day.fat / GOALS.fat) * 100;
    weekDaysHtml += `<div class="day-block"><div class="accordion ${i === 0 ? 'open' : ''}" id="dash-day-${date.replace(/\./g, '-')}"><div class="accordion-header" onclick="toggle('dash-day-${date.replace(/\./g, '-')}')"><div class="day-label">${date}</div><div class="accordion-summary"><div class="summary-macro"><div class="summary-val kcal">${Math.round(day.kcal)}</div><div class="summary-label">ккал</div></div><div class="summary-macro"><div class="summary-val protein">${Math.round(day.protein)}</div><div class="summary-label">🥩 г</div></div><div class="summary-macro"><div class="summary-val carbs">${Math.round(day.carbs)}</div><div class="summary-label">🍚 г</div></div><div class="summary-macro"><div class="summary-val fat">${Math.round(day.fat)}</div><div class="summary-label">🧈 г</div></div></div><div class="accordion-bars"><div class="bar-row"><div class="bar-label">🔥</div><div class="bar-track-main"><div class="bar-fill kcal" style="width:${Math.min(100, kcalP)}%"></div></div><div class="bar-pct" style="color: ${kcalP > 100 ? 'var(--danger)' : 'var(--muted)'}">${kcalP.toFixed(0)}%</div></div><div class="bar-row"><div class="bar-label">🥩</div><div class="bar-track-main"><div class="bar-fill protein" style="width:${Math.min(100, protP)}%"></div></div><div class="bar-pct" style="color: ${protP > 100 ? 'var(--danger)' : 'var(--muted)'}">${protP.toFixed(0)}%</div></div><div class="bar-row"><div class="bar-label">🍚</div><div class="bar-track-main"><div class="bar-fill carbs" style="width:${Math.min(100, carbsP)}%"></div></div><div class="bar-pct" style="color: ${carbsP > 100 ? 'var(--danger)' : 'var(--muted)'}">${carbsP.toFixed(0)}%</div></div><div class="bar-row"><div class="bar-label">🧈</div><div class="bar-track-main"><div class="bar-fill fat" style="width:${Math.min(100, fatP)}%"></div></div><div class="bar-pct" style="color: ${fatP > 100 ? 'var(--danger)' : 'var(--muted)'}">${fatP.toFixed(0)}%</div></div></div><div class="accordion-chevron">▾</div></div><div class="accordion-body"><div class="accordion-inner">${day.meals.map(m => `<div class="meal-card"><div class="meal-type">${m.mealType}</div><div class="meal-desc"><strong>${m.description}</strong></div><div class="meal-macros"><div class="macro"><div class="macro-val kcal">${Math.round(m.kcal)}</div><div class="macro-label">ккал</div></div><div class="macro"><div class="macro-val protein">${Math.round(m.protein)}</div><div class="macro-label">🥩</div></div><div class="macro"><div class="macro-val carbs">${Math.round(m.carbs)}</div><div class="macro-label">🍚</div></div><div class="macro"><div class="macro-val fat">${Math.round(m.fat)}</div><div class="macro-label">🧈</div></div></div></div>`).join('')}</div></div></div></div>`;
  });
  document.getElementById('week-days').innerHTML = weekDaysHtml || '<div class="empty-state">Нет записей за последнюю неделю</div>';

  let allDates = Object.keys(dailyAll).sort((a,b) => dateToSortValue(b) - dateToSortValue(a));
  let fullHtml = '';
  allDates.forEach(date => {
    let day = dailyAll[date];
    let kcalP = (day.kcal / GOALS.kcal) * 100;
    let protP = (day.protein / GOALS.protein) * 100;
    let carbsP = (day.carbs / GOALS.carbs) * 100;
    let fatP = (day.fat / GOALS.fat) * 100;
    fullHtml += `<div class="day-block"><div class="accordion" id="day-${date.replace(/\./g, '-')}"><div class="accordion-header" onclick="toggle('day-${date.replace(/\./g, '-')}')"><div class="day-label">${date}</div><div class="accordion-summary"><div class="summary-macro"><div class="summary-val kcal">${Math.round(day.kcal)}</div><div class="summary-label">ккал</div></div><div class="summary-macro"><div class="summary-val protein">${Math.round(day.protein)}</div><div class="summary-label">🥩 г</div></div><div class="summary-macro"><div class="summary-val carbs">${Math.round(day.carbs)}</div><div class="summary-label">🍚 г</div></div><div class="summary-macro"><div class="summary-val fat">${Math.round(day.fat)}</div><div class="summary-label">🧈 г</div></div></div><div class="accordion-bars"><div class="bar-row"><div class="bar-label">🔥</div><div class="bar-track-main"><div class="bar-fill kcal" style="width:${Math.min(100, kcalP)}%"></div></div><div class="bar-pct" style="color: ${kcalP > 100 ? 'var(--danger)' : 'var(--muted)'}">${kcalP.toFixed(0)}%</div></div><div class="bar-row"><div class="bar-label">🥩</div><div class="bar-track-main"><div class="bar-fill protein" style="width:${Math.min(100, protP)}%"></div></div><div class="bar-pct" style="color: ${protP > 100 ? 'var(--danger)' : 'var(--muted)'}">${protP.toFixed(0)}%</div></div><div class="bar-row"><div class="bar-label">🍚</div><div class="bar-track-main"><div class="bar-fill carbs" style="width:${Math.min(100, carbsP)}%"></div></div><div class="bar-pct" style="color: ${carbsP > 100 ? 'var(--danger)' : 'var(--muted)'}">${carbsP.toFixed(0)}%</div></div><div class="bar-row"><div class="bar-label">🧈</div><div class="bar-track-main"><div class="bar-fill fat" style="width:${Math.min(100, fatP)}%"></div></div><div class="bar-pct" style="color: ${fatP > 100 ? 'var(--danger)' : 'var(--muted)'}">${fatP.toFixed(0)}%</div></div></div><div class="accordion-chevron">▾</div></div><div class="accordion-body"><div class="accordion-inner">${day.meals.map(m => `<div class="meal-card"><div class="meal-type">${m.mealType}</div><div class="meal-desc"><strong>${m.description}</strong></div><div class="meal-macros"><div class="macro"><div class="macro-val kcal">${Math.round(m.kcal)}</div><div class="macro-label">ккал</div></div><div class="macro"><div class="macro-val protein">${Math.round(m.protein)}</div><div class="macro-label">🥩</div></div><div class="macro"><div class="macro-val carbs">${Math.round(m.carbs)}</div><div class="macro-label">🍚</div></div><div class="macro"><div class="macro-val fat">${Math.round(m.fat)}</div><div class="macro-label">🧈</div></div></div></div>`).join('')}</div></div></div></div>`;
  });
  document.getElementById('history-days').innerHTML = fullHtml || '<div class="empty-state">Нет записей о еде</div>';
  document.getElementById('lastUpdate').innerHTML = `📅 Обновлено: ${new Date().toLocaleTimeString()}`;
}

function renderMeasuresTable() {
  // Статистика веса
  if (appData.weights.length) {
    let currentWeight = appData.weights[appData.weights.length - 1].weight;
    let startWeight = appData.weights[0].weight;
    let change = (currentWeight - startWeight).toFixed(1);
    let targetDiff = (GOALS.targetWeight - currentWeight).toFixed(1);
    document.getElementById('weight-stats').innerHTML = `
      <div class="weight-stat-card"><div class="weight-stat-value">${currentWeight.toFixed(1)} кг</div><div>текущий вес</div></div>
      <div class="weight-stat-card"><div class="weight-stat-value">${change > 0 ? '+' + change : change} кг</div><div>изменение</div></div>
      <div class="weight-stat-card"><div class="weight-stat-value">${targetDiff > 0 ? 'осталось ' + targetDiff : 'перебор ' + Math.abs(targetDiff)} кг</div><div>до цели ${GOALS.targetWeight} кг</div></div>
    `;
  } else {
    document.getElementById('weight-stats').innerHTML = '<div class="weight-stat-card">Нет данных о весе</div>';
  }

  // График веса
  let weightsSorted = [...appData.weights].sort((a, b) => dateToSortValue(a.date) - dateToSortValue(b.date));
  if (charts.weight) charts.weight.destroy();
  let wCtx = document.getElementById('weightChart')?.getContext('2d');
  if (wCtx && weightsSorted.length) {
    charts.weight = new Chart(wCtx, {
      type: 'line', 
      data: { 
        labels: weightsSorted.map(w => w.date), 
        datasets: [
          { label: 'Вес (кг)', data: weightsSorted.map(w => w.weight), borderColor: '#F1C800', tension: 0.3, fill: false, pointBackgroundColor: '#F1C800', pointRadius: 5 }, 
          { label: `Цель ${GOALS.targetWeight} кг`, data: Array(weightsSorted.length).fill(GOALS.targetWeight), borderColor: '#F16D00', borderDash: [5, 5], pointRadius: 0 }
        ] 
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#fff' } } } }
    });
  }

  // Проверка наличия данных замеров
  if (!appData.measures || !appData.measures.length) {
    document.getElementById('measures-table').innerHTML = '<thead> <th>Параметр</th> </thead><tbody> <td colspan="10">Нет данных. Добавьте первый замер </tbody>';
    return;
  }
  
  // Сортировка от старых к новым
  let sortedAsc = [...appData.measures].sort((a, b) => dateToSortValue(a.date) - dateToSortValue(b.date));
  
  // Формирование таблицы
  let html = '<thead><tr><th>Параметр</th>';
  sortedAsc.forEach(m => {
    html += `<th>${m.date}</th>`;
  });
  html += '</tr></thead><tbody>';
  
  // Список параметров для отображения
  const measureParams = [
    { key: 'age', name: 'Возраст', unit: 'лет' },
    { key: 'weight', name: 'Вес', unit: 'кг' },
    { key: 'calfL', name: 'Икра Л', unit: 'см' },
    { key: 'calfR', name: 'Икра П', unit: 'см' },
    { key: 'thighL', name: 'Бедро Л', unit: 'см' },
    { key: 'thighR', name: 'Бедро П', unit: 'см' },
    { key: 'waist', name: 'Талия', unit: 'см' },
    { key: 'hips', name: 'Бедра', unit: 'см' },
    { key: 'chest', name: 'Грудь', unit: 'см' },
    { key: 'shoulders', name: 'Плечи', unit: 'см' },
    { key: 'bicepL', name: 'Бицепс Л', unit: 'см' },
    { key: 'bicepR', name: 'Бицепс П', unit: 'см' },
    { key: 'neck', name: 'Шея', unit: 'см' }
  ];
  
  for (let param of measureParams) {
    html += `<tr><td style="text-align:left; font-weight:500;">${param.name}, ${param.unit}</td>`;
    
    sortedAsc.forEach((m, idx) => {
      let val = m[param.key];
      let prev = idx > 0 ? sortedAsc[idx - 1][param.key] : null;
      let delta = '';
      
      // Расчет изменения
      if (prev !== null && val !== 0 && prev !== 0 && val !== prev && !isNaN(val) && !isNaN(prev)) {
        let d = val - prev;
        let arrow = d > 0 ? '▲' : '▼';
        delta = `<span class="measure-delta ${d > 0 ? 'up' : 'down'}">${arrow}${Math.abs(d).toFixed(1)}</span>`;
      }
      
      let displayVal = (val === 0 || isNaN(val)) ? '—' : val.toFixed(1);
      html += `<td>${displayVal} ${delta}</td>`;
    });
    html += '</tr>';
  }
  
  html += '</tbody>';
  document.getElementById('measures-table').innerHTML = html;
}

function renderMeasureFormFields() {
  let html = '<div class="form-group"><label>Дата</label><input type="date" id="measure-date"></div>';
  const measureParams = [
    { key: 'age', name: 'Возраст', unit: 'лет' },
    { key: 'weight', name: 'Вес', unit: 'кг' },
    { key: 'calfL', name: 'Икра Л', unit: 'см' },
    { key: 'calfR', name: 'Икра П', unit: 'см' },
    { key: 'thighL', name: 'Бедро Л', unit: 'см' },
    { key: 'thighR', name: 'Бедро П', unit: 'см' },
    { key: 'waist', name: 'Талия', unit: 'см' },
    { key: 'hips', name: 'Бедра', unit: 'см' },
    { key: 'chest', name: 'Грудь', unit: 'см' },
    { key: 'shoulders', name: 'Плечи', unit: 'см' },
    { key: 'bicepL', name: 'Бицепс Л', unit: 'см' },
    { key: 'bicepR', name: 'Бицепс П', unit: 'см' },
    { key: 'neck', name: 'Шея', unit: 'см' }
  ];
  
  for (let param of measureParams) {
    html += `<div class="form-group"><label>${param.name} (${param.unit})</label><input type="number" id="measure-${param.key}" step="0.1"></div>`;
  }
  document.getElementById('measure-fields').innerHTML = html;
  let measureDate = document.getElementById('measure-date');
  if (measureDate) measureDate.value = new Date().toISOString().split('T')[0];
}
