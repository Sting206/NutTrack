// ==================== ОТРИСОВКА UI ====================

// Отрисовка дашборда и истории
function renderDashboardAndHistory() {
  let dailyAll = aggregateByDay(appData.foods);
  let waterByDay = getWaterByDay(appData.water);
  let { filtered: lastWeekDaily, dates: lastWeekDates } = getLastNDays(dailyAll, 7);
  let today = getTodayFormatted();
  let todayData = dailyAll[today] || { kcal: 0, protein: 0, carbs: 0, fat: 0 };
  let todayWater = waterByDay[today] || 0;
  
  // Осталось на сегодня
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

  // График нутриентов
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

  // Водный баланс
  let avgWater = lastWeekDates.reduce((s, d) => s + (waterByDay[d] || 0), 0) / (lastWeekDates.length || 1);
  document.getElementById('water-summary').innerHTML = `
    <div class="water-card"><div class="water-value">${Math.round(todayWater)} мл</div><div>сегодня / ${GOALS.water} мл</div><div class="bar-track"><div class="bar-fill water" style="width:${Math.min(100, todayWater / GOALS.water * 100)}%"></div></div></div>
    <div class="water-card"><div class="water-value">${Math.round(avgWater)} мл</div><div>среднее за 7 дней</div></div>`;

  // Недельные дни
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

  // Вся история
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

// Отрисовка таблицы замеров
function renderMeasuresTable() {
  if (appData.weights.length) {
    let currentWeight = appData.weights[appData.weights.length - 1].weight;
    let startWeight = appData.weights[0].weight;
    let change = (currentWeight - startWeight).toFixed(1);
    let targetDiff = (GOALS.targetWeight - currentWeight).toFixed(1);
    document.getElementById('weight-stats').innerHTML = `
      <div class="weight-stat-card"><div class="weight-stat-value">${currentWeight.toFixed(1)} кг</div><div>текущий вес</div></div>
      <div class="weight-stat-card"><div class="weight-stat-value">${change > 0 ? '+' + change : change} кг</div><div>изменение</div></div>
      <div class="weight-stat-card"><div class="weight-stat-value">${targetDiff > 0 ? 'осталось ' + target
