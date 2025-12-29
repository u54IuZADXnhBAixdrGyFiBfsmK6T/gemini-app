// ===== グローバル変数 =====
let currentDate = new Date();
let selectedDate = new Date();
let currentExerciseId = null;
let exercisesData = [];
let workoutDates = [];
let weeklyStats = [];

// ===== 初期化 =====
document.addEventListener('DOMContentLoaded', async () => {
  await loadExercises();
  updateCalendar();
  await loadMonthlyStats();
  await loadYearlyStats();
  await loadWeeklyStats();
  await loadDailyLog();
  setupEventListeners();
});

// ===== イベントリスナー設定 =====
function setupEventListeners() {
  // カレンダーナビゲーション
  document.getElementById('prevMonth').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    updateCalendar();
    loadMonthlyStats();
  });
  
  document.getElementById('nextMonth').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    updateCalendar();
    loadMonthlyStats();
  });
  
  // 種目追加ボタン
  document.getElementById('addTrainingBtn').addEventListener('click', openExerciseModal);
  document.getElementById('fabBtn').addEventListener('click', openExerciseModal);
  
  // モーダル閉じる
  document.getElementById('closeExerciseModal').addEventListener('click', closeExerciseModal);
  document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
    backdrop.addEventListener('click', (e) => {
      if (e.target === e.currentTarget) {
        closeAllModals();
      }
    });
  });
  
  // セット入力モーダル
  document.getElementById('completeBtn').addEventListener('click', closeSetInputModal);
  document.getElementById('videoBtn').addEventListener('click', () => {
    const exerciseName = document.getElementById('exerciseName').textContent;
    showToast(`「${exerciseName}」の動画を検索中...`);
  });
  
  // セット追加ボタン
  document.getElementById('addSetBtn').addEventListener('click', addNewSet);
}

// ===== カレンダー関連 =====
function updateCalendar() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  // ヘッダー更新
  document.getElementById('calendarMonth').textContent = new Date(year, month).toLocaleDateString('en-US', { month: 'long' });
  document.getElementById('calendarYear').textContent = year;
  
  // カレンダー描画
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
  
  // トレーニング済み日付を読み込む
  loadWorkoutDates(year, month + 1);
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
  
  // 今日かどうか
  const today = new Date();
  if (date.toDateString() === today.toDateString()) {
    dayElement.classList.add('today');
  }
  
  // 選択中かどうか
  if (date.toDateString() === selectedDate.toDateString()) {
    dayElement.classList.add('selected');
  }
  
  // クリックイベント
  dayElement.addEventListener('click', () => {
    selectedDate = date;
    updateCalendar();
    loadDailyLog();
  });
  
  return dayElement;
}

async function loadWorkoutDates(year, month) {
  try {
    const response = await fetch(`/api/workout_dates?year=${year}&month=${month}`);
    const data = await response.json();
    workoutDates = data.dates || [];
    
    // カレンダーにハイライトを追加
    const dayElements = document.querySelectorAll('.calendar-day:not(.other-month)');
    dayElements.forEach((el, index) => {
      const day = parseInt(el.textContent);
      if (workoutDates.includes(day)) {
        el.classList.add('has-workout');
      }
    });
  } catch (error) {
    console.error('Error loading workout dates:', error);
  }
}

async function loadMonthlyStats() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;
  
  try {
    const response = await fetch(`/api/monthly_stats?year=${year}&month=${month}`);
    const data = await response.json();
    
    document.getElementById('monthlyDaysDisplay').textContent = `${data.monthly_days} days`;
  } catch (error) {
    console.error('Error loading monthly stats:', error);
  }
}

async function loadYearlyStats() {
  const year = currentDate.getFullYear();
  
  try {
    const response = await fetch(`/api/yearly_stats?year=${year}`);
    const data = await response.json();
    
    document.getElementById('yearlyDaysDisplay').textContent = `${data.total_days} days`;
  } catch (error) {
    console.error('Error loading yearly stats:', error);
  }
}

// ===== 週間統計とグラフ =====
async function loadWeeklyStats() {
  try {
    const response = await fetch('/api/weekly_stats');
    weeklyStats = await response.json();
    
    renderWeeklyGraph();
  } catch (error) {
    console.error('Error loading weekly stats:', error);
    showToast('週間統計の読み込みに失敗しました');
  }
}

function renderWeeklyGraph() {
  const container = document.getElementById('weeklyGraphContainer');
  container.innerHTML = '';
  
  if (weeklyStats.length === 0) {
    container.innerHTML = '<div style="text-align:center;color:#9ca3af;padding:20px;">データがありません</div>';
    return;
  }
  
  // APIから取得した配列の順序を逆にする
  const reversedWeeklyStats = [...weeklyStats].reverse();

  // 最大値を取得（グラフの横幅計算用）
  const maxVolume = Math.max(...reversedWeeklyStats.map(w => w.total_volume));
  
  // 今週の総負荷量を表示
  const currentWeek = reversedWeeklyStats.find(w => w.is_current);
  if (currentWeek) {
    document.getElementById('currentWeekVolume').textContent = `${currentWeek.total_volume.toLocaleString()} kg`;
  }
  
  // グラフバーを生成
  reversedWeeklyStats.forEach((week, index) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'graph-bar-wrapper';
    
    const weekLabel = index === 0 ? '今週' : `${index}週前`;
    const percentage = maxVolume > 0 ? (week.total_volume / maxVolume * 100) : 0;
    
    wrapper.innerHTML = `
      <div class="graph-bar-label">
        <span class="graph-bar-label-week">${weekLabel}</span>
        <span class="graph-bar-label-volume">${week.total_volume.toLocaleString()} kg</span>
      </div>
      <div class="graph-bar-bg">
        <div class="graph-bar-fill ${week.is_current ? 'current-week' : ''}" style="width: ${percentage}%"></div>
      </div>
    `;
    
    container.appendChild(wrapper);
  });
}

// ===== 種目データ読み込み =====
async function loadExercises() {
  try {
    const response = await fetch('/api/exercises');
    exercisesData = await response.json();
  } catch (error) {
    console.error('Error loading exercises:', error);
    showToast('種目データの読み込みに失敗しました');
  }
}

// ===== 日別ログ読み込み =====
async function loadDailyLog() {
  const dateStr = formatDate(selectedDate);
  
  try {
    const response = await fetch(`/api/daily_log?date=${dateStr}`);
    const data = await response.json();
    
    renderExerciseCards(data);
  } catch (error) {
    console.error('Error loading daily log:', error);
    showToast('トレーニングデータの読み込みに失敗しました');
  }
}

function renderExerciseCards(data) {
  const container = document.getElementById('exerciseCardsContainer');
  container.innerHTML = '';
  
  if (Object.keys(data).length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">💪</div>
        <div class="empty-state-text">この日のトレーニング記録はありません</div>
      </div>
    `;
    return;
  }
  
  Object.entries(data).forEach(([exerciseName, exerciseData]) => {
    const card = createExerciseCard(exerciseName, exerciseData);
    container.appendChild(card);
  });
}

function createExerciseCard(exerciseName, exerciseData) {
  const card = document.createElement('div');
  card.className = 'exercise-card';
  
  const maxRM = exerciseData.max_rm ? `Max RM: ${exerciseData.max_rm.toFixed(1)}kg` : 'Max RM: -';
  
  card.innerHTML = `
    <div class="card-header">
      <div class="card-header-left">
        <div class="exercise-name">${exerciseName}</div>
        <div class="max-rm">${maxRM}</div>
      </div>
      <div class="card-header-right">
        <button class="card-header-btn edit-btn" data-exercise-id="${exerciseData.exercise_id}">✏️</button>
      </div>
    </div>
    <div class="card-body" data-exercise-id="${exerciseData.exercise_id}"></div>
  `;
  
  const cardBody = card.querySelector('.card-body');
  
  exerciseData.sets.forEach((set, index) => {
    const setRow = createSetRow(set, index);
    cardBody.appendChild(setRow);
  });
  
  // 編集ボタン
  card.querySelector('.edit-btn').addEventListener('click', () => {
    openSetInputModal(exerciseData.exercise_id, exerciseName, exerciseData.sets);
  });
  
  return card;
}

function createSetRow(set, index) {
  const row = document.createElement('div');
  row.className = 'set-row';
  row.dataset.setId = set.id;
  
  const rmDisplay = set.rm ? `RM ${set.rm.toFixed(1)}` : 'RM -';
  
  row.innerHTML = `
    <div class="set-number">${set.set}</div>
    <div class="set-info">
      <span class="set-weight-reps">${set.weight}kg × ${set.reps}回</span>
      <span class="set-rm">${rmDisplay}</span>
    </div>
    <div class="delete-action">🗑️</div>
  `;
  
  // スワイプ削除の実装
  setupSwipeDelete(row);
  
  return row;
}

// ===== スワイプ削除機能 =====
function setupSwipeDelete(row) {
  let startX = 0;
  let currentX = 0;
  let isSwiping = false;
  
  row.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    isSwiping = true;
    row.classList.add('swiping');
  }, { passive: true });
  
  row.addEventListener('touchmove', (e) => {
    if (!isSwiping) return;
    
    currentX = e.touches[0].clientX;
    const diff = startX - currentX;
    
    if (diff > 0 && diff < 100) {
      row.style.transform = `translateX(-${diff}px)`;
    }
  }, { passive: true });
  
  row.addEventListener('touchend', async () => {
    if (!isSwiping) return;
    
    const diff = startX - currentX;
    
    if (diff > 100) {
      row.classList.add('show-delete');
      row.style.transform = 'translateX(-80px)';
      
      const deleteBtn = row.querySelector('.delete-action');
      deleteBtn.style.pointerEvents = 'auto';
      
      deleteBtn.addEventListener('click', async () => {
        const setId = row.dataset.setId;
        await deleteSet(setId);
        row.style.transform = 'translateX(-100%)';
        row.style.opacity = '0';
        setTimeout(() => {
          row.remove();
          renumberSets(row.parentElement);
        }, 300);
      }, { once: true });
    } else {
      row.style.transform = 'translateX(0)';
      row.classList.remove('show-delete');
    }
    
    isSwiping = false;
    row.classList.remove('swiping');
  });
  
  // マウス操作
  let isMouseDown = false;
  
  row.addEventListener('mousedown', (e) => {
    startX = e.clientX;
    isMouseDown = true;
    row.classList.add('swiping');
  });
  
  document.addEventListener('mousemove', (e) => {
    if (!isMouseDown) return;
    
    currentX = e.clientX;
    const diff = startX - currentX;
    
    if (diff > 0 && diff < 100) {
      row.style.transform = `translateX(-${diff}px)`;
    }
  });
  
  document.addEventListener('mouseup', async () => {
    if (!isMouseDown) return;
    
    const diff = startX - currentX;
    
    if (diff > 100) {
      row.classList.add('show-delete');
      row.style.transform = 'translateX(-80px)';
      
      const deleteBtn = row.querySelector('.delete-action');
      deleteBtn.style.pointerEvents = 'auto';
      
      deleteBtn.addEventListener('click', async () => {
        const setId = row.dataset.setId;
        await deleteSet(setId);
        row.style.transform = 'translateX(-100%)';
        row.style.opacity = '0';
        setTimeout(() => {
          row.remove();
          renumberSets(row.parentElement);
        }, 300);
      }, { once: true });
    } else {
      row.style.transform = 'translateX(0)';
      row.classList.remove('show-delete');
    }
    
    isMouseDown = false;
    row.classList.remove('swiping');
  });
}

function renumberSets(container) {
  const rows = container.querySelectorAll('.set-row');
  rows.forEach((row, index) => {
    const setNumber = row.querySelector('.set-number');
    if (setNumber) {
      setNumber.textContent = index + 1;
    }
  });
}

async function deleteSet(setId) {
  try {
    const response = await fetch('/api/delete_set', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: setId })
    });
    
    if (!response.ok) throw new Error('削除に失敗しました');
    
    showToast('セットを削除しました');
    await loadDailyLog();
    await loadMonthlyStats();
    await loadYearlyStats();
    await loadWeeklyStats();
    await loadWorkoutDates(currentDate.getFullYear(), currentDate.getMonth() + 1);
  } catch (error) {
    console.error('Error deleting set:', error);
    showToast('削除に失敗しました');
  }
}

// ===== 種目選択モーダル =====
function openExerciseModal() {
  const modal = document.getElementById('exerciseModal');
  const list = document.getElementById('exerciseList');
  list.innerHTML = '';
  
  exercisesData.forEach(category => {
    const section = document.createElement('div');
    section.className = 'category-section';
    
    // 赤いヘッダー
    const header = document.createElement('div');
    header.className = 'category-header';
    
    let lastModified = null;
    category.exercises.forEach(ex => {
      if (ex.last_date) {
        const date = new Date(ex.last_date);
        if (!lastModified || date > lastModified) {
          lastModified = date;
        }
      }
    });
    
    const lastModifiedText = lastModified 
      ? `(Last modified: ${calculateDaysAgo(lastModified.toISOString().split('T')[0])})`
      : '';
    
    header.innerHTML = `
      <span>${category.category}</span>
      <span class="category-last-modified">${lastModifiedText}</span>
    `;
    section.appendChild(header);
    
    // 種目リスト
    category.exercises.forEach(exercise => {
      const item = document.createElement('div');
      item.className = 'exercise-item';
      
      const lastText = exercise.last_date 
        ? `Last: ${calculateDaysAgo(exercise.last_date)}`
        : '';
      
      item.innerHTML = `
        <div class="exercise-item-name">${exercise.name}</div>
        <div class="exercise-item-last">${lastText}</div>
      `;
      
      item.addEventListener('click', () => {
        closeExerciseModal();
        openSetInputModal(exercise.id, exercise.name);
      });
      
      section.appendChild(item);
    });
    
    // 種目追加ボタン
    const addBtn = document.createElement('button');
    addBtn.className = 'add-exercise-btn';
    addBtn.textContent = '種目を追加';
    addBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      window.location.href = '/manage_exercises';
    });
    section.appendChild(addBtn);
    
    list.appendChild(section);
  });
  
  modal.setAttribute('aria-hidden', 'false');
}

function closeExerciseModal() {
  document.getElementById('exerciseModal').setAttribute('aria-hidden', 'true');
}

function calculateDaysAgo(dateStr) {
  const date = new Date(dateStr);
  const today = new Date();
  const diff = Math.floor((today - date) / (1000 * 60 * 60 * 24));
  
  if (diff === 0) return '今日';
  if (diff === 1) return '1日前';
  return `${diff}日前`;
}

// ===== セット入力モーダル =====
function openSetInputModal(exerciseId, exerciseName, existingSets = []) {
  currentExerciseId = exerciseId;
  
  document.getElementById('exerciseName').textContent = exerciseName;
  
  const tbody = document.getElementById('setsTableBody');
  tbody.innerHTML = '';
  
  if (existingSets.length > 0) {
    existingSets.forEach((set, index) => {
      addSetRow(index + 1, set.weight, set.reps, set.rm);
    });
  } else {
    addSetRow(1);
  }
  
  document.getElementById('setInputModal').setAttribute('aria-hidden', 'false');
}

function closeSetInputModal() {
  document.getElementById('setInputModal').setAttribute('aria-hidden', 'true');
  loadDailyLog();
  loadMonthlyStats();
  loadYearlyStats();
  loadWeeklyStats();
  loadWorkoutDates(currentDate.getFullYear(), currentDate.getMonth() + 1);
}

function closeAllModals() {
  closeExerciseModal();
  closeSetInputModal();
}

function addSetRow(setNumber, weight = '', reps = '', rm = '') {
  const tbody = document.getElementById('setsTableBody');
  const row = document.createElement('tr');
  
  const lbs = weight ? (weight * 2.204).toFixed(1) : '';
  const rmValue = rm || '';
  
  row.innerHTML = `
    <td><strong>${setNumber}</strong></td>
    <td>
      <input type="number" 
             class="input-weight" 
             data-set="${setNumber}" 
             value="${weight}" 
             placeholder="0" 
             step="0.5" 
             min="0">
    </td>
    <td>
      <input type="text" 
             class="input-lbs" 
             value="${lbs}" 
             disabled>
    </td>
    <td>
      <input type="number" 
             class="input-reps" 
             data-set="${setNumber}" 
             value="${reps}" 
             placeholder="0" 
             step="1" 
             min="0">
    </td>
    <td>
      <input type="text" 
             class="input-rm" 
             value="${rmValue}" 
             disabled>
    </td>
    <td>
      <button class="delete-set-btn" data-set="${setNumber}">🗑️</button>
    </td>
  `;
  
  tbody.appendChild(row);
  
  const weightInput = row.querySelector('.input-weight');
  const repsInput = row.querySelector('.input-reps');
  const lbsInput = row.querySelector('.input-lbs');
  const rmInput = row.querySelector('.input-rm');
  
  weightInput.addEventListener('blur', () => {
    const weight = parseFloat(weightInput.value) || 0;
    lbsInput.value = weight ? (weight * 2.204).toFixed(1) : '';
    autoSaveSet(setNumber, weightInput, repsInput, rmInput);
  });
  
  weightInput.addEventListener('input', () => {
    const weight = parseFloat(weightInput.value) || 0;
    lbsInput.value = weight ? (weight * 2.204).toFixed(1) : '';
  });
  
  repsInput.addEventListener('blur', () => {
    autoSaveSet(setNumber, weightInput, repsInput, rmInput);
  });
  
  row.querySelector('.delete-set-btn').addEventListener('click', () => {
    row.remove();
    renumberModalSets();
  });
}

function addNewSet() {
  const tbody = document.getElementById('setsTableBody');
  const setCount = tbody.querySelectorAll('tr').length;
  addSetRow(setCount + 1);
}

function renumberModalSets() {
  const tbody = document.getElementById('setsTableBody');
  const rows = tbody.querySelectorAll('tr');
  
  rows.forEach((row, index) => {
    const setNumber = index + 1;
    row.querySelector('td:first-child strong').textContent = setNumber;
    row.querySelectorAll('input').forEach(input => {
      if (input.dataset.set) {
        input.dataset.set = setNumber;
      }
    });
    row.querySelector('.delete-set-btn').dataset.set = setNumber;
  });
}

// ===== オートセーブ機能 =====
async function autoSaveSet(setNumber, weightInput, repsInput, rmInput) {
  const weight = parseFloat(weightInput.value) || 0;
  const reps = parseInt(repsInput.value) || 0;
  
  if (weight === 0 && reps === 0) return;
  
  const dateStr = formatDate(selectedDate);
  
  try {
    const response = await fetch('/api/save_set', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date: dateStr,
        exercise_id: currentExerciseId,
        set_number: setNumber,
        weight: weight,
        reps: reps
      })
    });
    
    const data = await response.json();
    
    if (data.calculated_rm) {
      rmInput.value = data.calculated_rm.toFixed(1);
    }
    
    weightInput.style.backgroundColor = '#dcfce7';
    repsInput.style.backgroundColor = '#dcfce7';
    setTimeout(() => {
      weightInput.style.backgroundColor = '';
      repsInput.style.backgroundColor = '';
    }, 500);
    
  } catch (error) {
    console.error('Error auto-saving set:', error);
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