// ==================== КОНФИГУРАЦИЯ ====================
const SHEET_ID = '1A0NOB0Rbx-u-gg6gaKTR1mMbZGwJHUzV9b63o9sqr3w';
const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbzGlbCH723vhj7W9RrzZyoDFUww40vLxEAnpfRqSsRjD5w1ft5K2wSerc63uaMclrWmYg/exec';

// Цели по умолчанию
const DEFAULT_GOALS = { 
  kcal: 2800, 
  protein: 160, 
  carbs: 350, 
  fat: 80, 
  water: 2500, 
  targetWeight: 82 
};

// Текущие цели (загружаются из localStorage)
let GOALS = { ...DEFAULT_GOALS };

// Глобальные данные
let appData = { foods: [], weights: [], water: [], measures: [] };
let charts = {};

// Категории замеров
const MEASURE_CATEGORIES = [
  {key:'date', name:'Дата', isDate:true},
  {key:'age', name:'Возраст', unit:'лет'},
  {key:'weight', name:'Вес', unit:'кг'},
  {key:'calfL', name:'Икра Л', unit:'см'},
  {key:'calfR', name:'Икра П', unit:'см'},
  {key:'thighL', name:'Бедро Л', unit:'см'},
  {key:'thighR', name:'Бедро П', unit:'см'},
  {key:'waist', name:'Талия', unit:'см'},
  {key:'hips', name:'Бедра', unit:'см'},
  {key:'chest', name:'Грудь', unit:'см'},
  {key:'shoulders', name:'Плечи', unit:'см'},
  {key:'bicepL', name:'Бицепс Л', unit:'см'},
  {key:'bicepR', name:'Бицепс П', unit:'см'},
  {key:'neck', name:'Шея', unit:'см'}
];
