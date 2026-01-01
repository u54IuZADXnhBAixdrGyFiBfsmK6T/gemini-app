// ===== グローバル変数 =====
let currentDate = new Date();
let selectedDate = new Date();
let mealDates = [];
let userGoal = {
  target_calories: 2000,
  target_protein: 150,
  target_fat: 60,
  target_carbs: 250
};

// ===== 初期化 =====
document.addEventListener('DOMContentLoaded', async () => {
  await loadUserGoal();
  updateCalendar();
  await loadDailyMeals();
  await loadDailyPFC();
  setupEventListeners();
});

// ===== イベントリスナー設定 =====
function setupEventListeners() {
  // カレンダーナビゲーション
  document.getElementById('prevMonth').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    updateCalendar();
  });
  
  document.getElementById('nextMonth').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    updateCalendar();
  });
  
  // 食事追加ボタン
  document.getElementById('addMealBtn').addEventListener('click', openMealModal);
  document.getElementById('fabBtn').addEventListener('click', openMealModal);
  
  // モーダル閉じる
  document.getElementById('closeMealModal').addEventListener('click', closeMealModal);
  document.querySelector('.modal-backdrop').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) {
      closeMealModal();
    }
  });
  
  // 食事送信
  document.getElementById('submitMeal').addEventListener('click', submitMeal);
  
  // PFC入力時にカロリー計算
  ['proteinInput', 'fatInput', 'carbsInput'].forEach(id => {
    document.getElementById(id).addEventListener('input', calculateCalories);
  });
}

// ===== カレンダー関連 =====
function updateCalendar() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  document.getElementById('calendarMonth').textContent = new Date(year, month).toLocaleDateString('en-US', { month: 'long' });
  document.getElementById('calendarYear').textContent = year;
  
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const prevLastDay = new Date(year, month, 0);
  
  const firstDayOfWeek = firstDay.getDay();
  const lastDate = lastDay.getDate();
  const prevLastDate = prevLastDay.getDate();
  
  const calendarDays = document.getElementById('calendarDays');
  calendarDays.innerHTML = '';
  
  // 前月の日付
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const day = prevLastDate - i;
    const dayElement = createDayElement(day, true);
    calendarDays.appendChild(dayElement);
  }
  
  // 当月の日付
  for (let day = 1; day <= lastDate; day++) {
    const dayElement = createDayElement(day, false);
    calendarDays.appendChild(dayElement);
  }
  
  // 次月の日付
  const totalCells = calendarDays.children.length;
  const remainingCells = 42 - totalCells;
  for (let day = 1; day <= remainingCells; day++) {
    const dayElement = createDayElement(day, true);
    calendarDays.appendChild(dayElement);
  }
  
  loadMealDates(year, month + 1);
}

function createDayElement(day, isOtherMonth) {
  const dayElement = document.createElement('div');
  dayElement.className = 'calendar-day';
  dayElement.textContent = day;
  
  if (isOtherMonth) {
    dayElement.classList.add('other-month');
    return dayElement;
  }
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const date = new Date(year, month, day);
  
  const today = new Date();
  if (date.toDateString() === today.toDateString()) {
    dayElement.classList.add('today');
  }
  
  if (date.toDateString() === selectedDate.toDateString()) {
    dayElement.classList.add('selected');
  }
  
  dayElement.addEventListener('click', () => {
    selectedDate = date;
    updateCalendar();
    loadDailyMeals();
    loadDailyPFC();
  });
  
  return dayElement;
}

async function loadMealDates(year, month) {
  try {
    const response = await fetch(`/api/meal_dates?year=${year}&month=${month}`);
    const data = await response.json();
    mealDates = data.dates || [];
    
    const dayElements = document.querySelectorAll('.calendar-day:not(.other-month)');
    dayElements.forEach((el) => {
      const day = parseInt(el.textContent);
      if (mealDates.includes(day)) {
        el.classList.add('has-meal');
      }
    });
  } catch (error) {
    console.error('Error loading meal dates:', error);
  }
}

// ===== ユーザー目標読み込み =====
async function loadUserGoal() {
  try {
    const response = await fetch('/api/user_goal');
    userGoal = await response.json();
    
    document.getElementById('targetCalories').textContent = `${userGoal.target_calories} kcal`;
  } catch (error) {
    console.error('Error loading user goal:', error);
  }
}

// ===== 日別食事記録読み込み =====
async function loadDailyMeals() {
  const dateStr = formatDate(selectedDate);
  
  try {
    const response = await fetch(`/api/daily_meals?date=${dateStr}`);
    const meals = await response.json();
    
    renderMealCards(meals);
  } catch (error) {
    console.error('Error loading meals:', error);
    showToast('食事データの読み込みに失敗しました');
  }
}

function renderMealCards(meals) {
  const container = document.getElementById('mealsContainer');
  container.innerHTML = '';
  
  if (meals.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🍽️</div>
        <div class="empty-state-text">この日の食事記録はありません</div>
      </div>
    `;
    return;
  }
  
  meals.forEach(meal => {
    const card = createMealCard(meal);
    container.appendChild(card);
  });
}

function createMealCard(meal) {
  const card = document.createElement('div');
  card.className = 'meal-card';
  
  card.innerHTML = `
    <div class="meal-header">
      <div class="meal-name">${meal.meal_name}</div>
      <button class="delete-meal-btn" data-id="${meal.id}">🗑️</button>
    </div>
    <div class="meal-pfc">
      <div class="pfc-item">
        <span class="pfc-item-label">P</span>
        <span class="pfc-item-value" style="color: var(--protein-color);">${meal.protein}g</span>
      </div>
      <div class="pfc-item">
        <span class="pfc-item-label">F</span>
        <span class="pfc-item-value" style="color: var(--fat-color);">${meal.fat}g</span>
      </div>
      <div class="pfc-item">
        <span class="pfc-item-label">C</span>
        <span class="pfc-item-value" style="color: var(--carbs-color);">${meal.carbs}g</span>
      </div>
      <div class="pfc-item">
        <span class="pfc-item-label">Cal</span>
        <span class="pfc-item-value" style="color: var(--calories-color);">${meal.calories} kcal</span>
      </div>
    </div>
  `;
  
  // 削除ボタン
  card.querySelector('.delete-meal-btn').addEventListener('click', async () => {
    if (!confirm('この食事を削除しますか？')) return;
    
    await deleteMeal(meal.id);
  });
  
  return card;
}

async function deleteMeal(mealId) {
  try {
    const response = await fetch('/api/delete_meal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: mealId })
    });
    
    if (!response.ok) throw new Error('削除に失敗しました');
    
    showToast('食事を削除しました');
    await loadDailyMeals();
    await loadDailyPFC();
    await loadMealDates(currentDate.getFullYear(), currentDate.getMonth() + 1);
  } catch (error) {
    console.error('Error deleting meal:', error);
    showToast('削除に失敗しました');
  }
}

// ===== 日別PFC合計読み込み =====
async function loadDailyPFC() {
  const dateStr = formatDate(selectedDate);
  
  try {
    const response = await fetch(`/api/daily_pfc?date=${dateStr}`);
    const pfc = await response.json();
    
    updatePFCDisplay(pfc);
  } catch (error) {
    console.error('Error loading PFC:', error);
  }
}

function updatePFCDisplay(pfc) {
  // 今日のカロリー表示
  document.getElementById('todayCalories').textContent = `${pfc.calories || 0} kcal`;
  
  // PFC値表示
  document.getElementById('proteinValue').textContent = `${pfc.protein || 0}g`;
  document.getElementById('fatValue').textContent = `${pfc.fat || 0}g`;
  document.getElementById('carbsValue').textContent = `${pfc.carbs || 0}g`;
  document.getElementById('caloriesValue').textContent = `${pfc.calories || 0} kcal`;
  
  // グラフバーの幅計算
  const proteinPercent = (pfc.protein / userGoal.target_protein) * 100;
  const fatPercent = (pfc.fat / userGoal.target_fat) * 100;
  const carbsPercent = (pfc.carbs / userGoal.target_carbs) * 100;
  const caloriesPercent = (pfc.calories / userGoal.target_calories) * 100;
  
  document.getElementById('proteinBar').style.width = `${Math.min(proteinPercent, 100)}%`;
  document.getElementById('fatBar').style.width = `${Math.min(fatPercent, 100)}%`;
  document.getElementById('carbsBar').style.width = `${Math.min(carbsPercent, 100)}%`;
  document.getElementById('caloriesBar').style.width = `${Math.min(caloriesPercent, 100)}%`;
}

// ===== 食事入力モーダル =====
function openMealModal() {
  document.getElementById('mealName').value = '';
  document.getElementById('proteinInput').value = '';
  document.getElementById('fatInput').value = '';
  document.getElementById('carbsInput').value = '';
  document.getElementById('calculatedCalories').textContent = '0';
  
  document.getElementById('mealInputModal').setAttribute('aria-hidden', 'false');
}

function closeMealModal() {
  document.getElementById('mealInputModal').setAttribute('aria-hidden', 'true');
}

function calculateCalories() {
  const protein = parseFloat(document.getElementById('proteinInput').value) || 0;
  const fat = parseFloat(document.getElementById('fatInput').value) || 0;
  const carbs = parseFloat(document.getElementById('carbsInput').value) || 0;
  
  // P=4kcal/g, F=9kcal/g, C=4kcal/g
  const calories = (protein * 4) + (fat * 9) + (carbs * 4);
  
  document.getElementById('calculatedCalories').textContent = Math.round(calories);
}

async function submitMeal() {
  const mealName = document.getElementById('mealName').value.trim();
  const protein = parseFloat(document.getElementById('proteinInput').value) || 0;
  const fat = parseFloat(document.getElementById('fatInput').value) || 0;
  const carbs = parseFloat(document.getElementById('carbsInput').value) || 0;
  
  if (!mealName) {
    showToast('食事名を入力してください');
    return;
  }
  
  if (protein === 0 && fat === 0 && carbs === 0) {
    showToast('PFCの値を入力してください');
    return;
  }
  
  const dateStr = formatDate(selectedDate);
  
  try {
    const response = await fetch('/api/save_meal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date: dateStr,
        meal_name: mealName,
        protein: protein,
        fat: fat,
        carbs: carbs
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      showToast(data.error || '保存に失敗しました');
      return;
    }
    
    showToast('食事を追加しました');
    closeMealModal();
    await loadDailyMeals();
    await loadDailyPFC();
    await loadMealDates(currentDate.getFullYear(), currentDate.getMonth() + 1);
    
  } catch (error) {
    console.error('Error saving meal:', error);
    showToast('保存に失敗しました');
  }
}

// ===== ユーティリティ関数 =====
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function showToast(message) {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(120%)';
    setTimeout(() => toast.remove(), 300);
  }, 2000);
}