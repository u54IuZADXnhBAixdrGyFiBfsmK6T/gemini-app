import { showToast, formatDate, calculateDaysAgo, setupModal, initSmoothScrolling } from '../shared/utils.js';
import { Calendar } from '../shared/calendar.js';

// ===== グローバル変数 =====
let calendar;
let currentExerciseId = null;
let exercisesData = [];
let weeklyStats = [];
let staticExercisesData = [];
const STATIC_JSON_FILES = [
  '/static/json/chest.json', 
  '/static/json/shoulder.json', 
  '/static/json/back.json', 
  '/static/json/arms.json', 
  '/static/json/legs.json', 
  '/static/json/abs.json'
];

// ===== 初期化 =====
document.addEventListener('DOMContentLoaded', async () => {
    initSmoothScrolling();

    // カレンダー初期化
    calendar = new Calendar('calendarDays', {
        onDateSelect: (date) => loadDailyLog(date),
        onMonthChange: (year, month) => {
            loadWorkoutDates(year, month);
            loadMonthlyStats(year, month);
        }
    });

    // モーダル設定
    setupModal('exerciseModal', 'addTrainingBtn', 'closeExerciseModal');
    setupModal('exerciseModal', 'fabBtn', null);
    setupModal('setInputModal', null, null);

    // イベントリスナー
    setupEventListeners();

    // データ読み込み
    await loadExercises();
    loadStaticExercises();
    
    // 初期表示データのロード
    const today = new Date();
    loadWorkoutDates(today.getFullYear(), today.getMonth() + 1);
    loadMonthlyStats(today.getFullYear(), today.getMonth() + 1);
    loadYearlyStats(today.getFullYear());
    loadWeeklyStats();
    loadDailyLog(today);
});

// ===== イベントリスナー =====
function setupEventListeners() {
    // カレンダー操作
    document.getElementById('prevMonth').addEventListener('click', () => calendar.changeMonth(-1));
    document.getElementById('nextMonth').addEventListener('click', () => calendar.changeMonth(1));

    // セット入力モーダル内のボタン
    document.getElementById('completeBtn').addEventListener('click', closeSetInputModal);
    document.getElementById('addSetBtn').addEventListener('click', addNewSet);
    
    // 動画検索ボタン
    document.getElementById('videoBtn').addEventListener('click', searchVideo);
}

// ===== データ読み込み系 =====

async function loadWorkoutDates(year, month) {
    try {
        const response = await fetch(`/api/workout_dates?year=${year}&month=${month}`);
        const data = await response.json();
        calendar.setMarkedDates(data.dates || []);
    } catch (error) {
        console.error('Error:', error);
    }
}

async function loadDailyLog(date) {
    const dateStr = formatDate(date);
    try {
        const response = await fetch(`/api/daily_log?date=${dateStr}`);
        const data = await response.json();
        renderExerciseCards(data);
    } catch (error) {
        showToast('データの読み込みに失敗しました', 'error');
    }
}

async function loadMonthlyStats(year, month) {
    try {
        const response = await fetch(`/api/monthly_stats?year=${year}&month=${month}`);
        const data = await response.json();
        document.getElementById('monthlyDaysDisplay').textContent = `${data.monthly_days} days`;
    } catch (error) {
        console.error('Error:', error);
    }
}

async function loadYearlyStats(year) {
    try {
        const response = await fetch(`/api/yearly_stats?year=${year}`);
        const data = await response.json();
        document.getElementById('yearlyDaysDisplay').textContent = `${data.total_days} days`;
    } catch (error) {
        console.error('Error:', error);
    }
}

async function loadWeeklyStats() {
    try {
        const response = await fetch('/api/weekly_stats');
        weeklyStats = await response.json();
        renderWeeklyGraph();
    } catch (error) {
        console.error('Error:', error);
    }
}

// ===== UI描画系 =====

function renderWeeklyGraph() {
    const container = document.getElementById('weeklyGraphContainer');
    container.innerHTML = '';
    
    if (weeklyStats.length === 0) {
        container.innerHTML = '<div style="text-align:center;color:#9ca3af;padding:20px;">データがありません</div>';
        return;
    }
    
    const reversedStats = [...weeklyStats].reverse();
    const maxVolume = Math.max(...reversedStats.map(w => w.total_volume));
    
    const currentWeek = reversedStats.find(w => w.is_current);
    if (currentWeek) {
        document.getElementById('currentWeekVolume').textContent = `${currentWeek.total_volume.toLocaleString()} kg`;
    }
    
    reversedStats.forEach((week, index) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'graph-bar-wrapper';
        const label = index === 0 ? '今週' : `${index}週前`;
        const percent = maxVolume > 0 ? (week.total_volume / maxVolume * 100) : 0;
        
        wrapper.innerHTML = `
            <div class="graph-bar-label">
                <span class="graph-bar-label-week">${label}</span>
                <span class="graph-bar-label-volume">${week.total_volume.toLocaleString()} kg</span>
            </div>
            <div class="graph-bar-bg">
                <div class="graph-bar-fill ${week.is_current ? 'current-week' : ''}" style="width: ${percent}%"></div>
            </div>
        `;
        container.appendChild(wrapper);
    });
}

function renderExerciseCards(data) {
    const container = document.getElementById('exerciseCardsContainer');
    container.innerHTML = '';
    
    if (!data || Object.keys(data).length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-text">この日のトレーニング記録はありません</div>
                <div class="empty-state-subtext">＋ボタンから追加してください</div>
            </div>`;
        return;
    }
    
    Object.entries(data).forEach(([name, exData]) => {
        const card = document.createElement('div');
        card.className = 'exercise-card';
        const maxRM = exData.max_rm ? `Max RM: ${exData.max_rm.toFixed(1)}kg` : 'Max RM: -';
        
        card.innerHTML = `
            <div class="card-header">
                <div class="card-header-left">
                    <div class="exercise-name">${name}</div>
                    <div class="max-rm">${maxRM}</div>
                </div>
                <div class="card-header-right">
                    <button class="card-header-btn delete-exercise-btn">
                        <span class="delete-icon">✕</span>
                    </button>
                </div>
            </div>
            <div class="card-body"></div>
        `;
        
        const cardBody = card.querySelector('.card-body');
        exData.sets.forEach((set, i) => {
            cardBody.appendChild(createSetRow(set, i + 1));
        });
        
        // 削除ボタン
        card.querySelector('.delete-exercise-btn').addEventListener('click', async (e) => {
            e.stopPropagation();
            if (confirm(`${name}の全セットを削除しますか？`)) {
                await deleteExercise(exData.exercise_id);
            }
        });

        // カード全体クリックで編集
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.delete-exercise-btn')) {
                openSetInputModal(exData.exercise_id, name, exData.sets);
            }
        });
        
        container.appendChild(card);
    });
}

async function deleteExercise(exerciseId) {
    const dateStr = formatDate(calendar.getSelectedDate());
    try {
        const response = await fetch('/api/delete_exercise_sets', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                date: dateStr, 
                exercise_id: exerciseId 
            })
        });
        if (response.ok) {
            showToast('削除しました');
            loadDailyLog(calendar.getSelectedDate());
            loadWeeklyStats();
            const d = calendar.currentDate;
            loadWorkoutDates(d.getFullYear(), d.getMonth() + 1);
        }
    } catch (e) {
        showToast('削除に失敗しました', 'error');
    }
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
    
    setupSwipeDelete(row, async () => {
        await deleteSet(set.id);
        row.remove();
    });
    
    return row;
}

// ===== セット入力・保存ロジック =====

function openSetInputModal(exerciseId, exerciseName, existingSets = []) {
    currentExerciseId = exerciseId;
    document.getElementById('exerciseName').textContent = exerciseName;
    const tbody = document.getElementById('setsTableBody');
    tbody.innerHTML = '';
    
    if (existingSets.length > 0) {
        existingSets.forEach((set, i) => addSetRow(i + 1, set.weight, set.reps, set.rm));
    } else {
        addSetRow(1);
    }
    
    document.getElementById('setInputModal').setAttribute('aria-hidden', 'false');
}

function closeSetInputModal() {
    document.getElementById('setInputModal').setAttribute('aria-hidden', 'true');
    const date = calendar.getSelectedDate();
    loadDailyLog(date);
    loadWeeklyStats();
    const d = calendar.currentDate;
    loadWorkoutDates(d.getFullYear(), d.getMonth() + 1);
}

function addSetRow(setNumber, weight = '', reps = '', rm = '') {
    const tbody = document.getElementById('setsTableBody');
    const row = document.createElement('tr');
    const lbs = weight ? (weight * 2.204).toFixed(1) : '';
    
    row.innerHTML = `
        <td><strong>${setNumber}</strong></td>
        <td><input type="number" class="input-weight" value="${weight}" placeholder="0" step="0.5"></td>
        <td><input type="text" class="input-lbs" value="${lbs}" disabled></td>
        <td><input type="number" class="input-reps" value="${reps}" placeholder="0" step="1"></td>
        <td><input type="text" class="input-rm" value="${rm}" disabled></td>
        <td><button class="delete-set-btn">🗑️</button></td>
    `;
    
    tbody.appendChild(row);
    
    const weightInput = row.querySelector('.input-weight');
    const repsInput = row.querySelector('.input-reps');
    const lbsInput = row.querySelector('.input-lbs');
    const rmInput = row.querySelector('.input-rm');
    
    const autoSave = () => autoSaveSet(setNumber, weightInput, repsInput, rmInput);
    weightInput.addEventListener('blur', autoSave);
    repsInput.addEventListener('blur', autoSave);
    
    weightInput.addEventListener('input', () => {
        const val = parseFloat(weightInput.value);
        lbsInput.value = val ? (val * 2.204).toFixed(1) : '';
    });
    
    row.querySelector('.delete-set-btn').addEventListener('click', () => {
        row.remove();
        renumberModalSets();
    });
}

function addNewSet() {
    const count = document.getElementById('setsTableBody').querySelectorAll('tr').length;
    addSetRow(count + 1);
}

function renumberModalSets() {
    document.querySelectorAll('#setsTableBody tr').forEach((row, i) => {
        row.querySelector('td:first-child strong').textContent = i + 1;
    });
}

async function autoSaveSet(setNumber, wInput, rInput, rmInput) {
    const weight = parseFloat(wInput.value) || 0;
    const reps = parseInt(rInput.value) || 0;
    if (weight === 0 && reps === 0) return;

    try {
        const response = await fetch('/api/save_set', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                date: formatDate(calendar.getSelectedDate()),
                exercise_id: currentExerciseId,
                set_number: setNumber,
                weight, reps
            })
        });
        const data = await response.json();
        if (data.calculated_rm) rmInput.value = data.calculated_rm.toFixed(1);
        
        wInput.style.backgroundColor = '#dcfce7';
        setTimeout(() => wInput.style.backgroundColor = '', 500);
    } catch (e) {
        showToast('保存に失敗しました', 'error');
    }
}

async function deleteSet(setId) {
    try {
        await fetch('/api/delete_set', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({id: setId})
        });
        showToast('セットを削除しました');
    } catch(e) {
        showToast('削除失敗', 'error');
    }
}

// ===== その他ヘルパー =====

async function loadExercises() {
    try {
        const res = await fetch('/api/exercises');
        exercisesData = await res.json();
        renderExerciseList();
    } catch(e) { console.error(e); }
}

async function loadStaticExercises() {
    try {
        const promises = STATIC_JSON_FILES.map(f => fetch(f).then(r => r.ok ? r.json() : []));
        const results = await Promise.all(promises);
        staticExercisesData = results.flat();
    } catch(e) {}
}

function renderExerciseList() {
    const list = document.getElementById('exerciseList');
    list.innerHTML = '';
    
    exercisesData.forEach(cat => {
        const section = document.createElement('div');
        section.className = 'category-section';
        section.innerHTML = `<div class="category-header"><span>${cat.category}</span></div>`;
        
        cat.exercises.forEach(ex => {
            const item = document.createElement('div');
            item.className = 'exercise-item';
            item.textContent = ex.name;
            item.addEventListener('click', () => {
                document.getElementById('exerciseModal').setAttribute('aria-hidden', 'true');
                openSetInputModal(ex.id, ex.name);
            });
            section.appendChild(item);
        });
        list.appendChild(section);
    });
}

function searchVideo() {
    const name = document.getElementById('exerciseName').textContent.trim();
    let found = staticExercisesData.find(d => d.name === name) ||
                staticExercisesData.find(d => d.name.includes(name)) ||
                staticExercisesData.find(d => name.includes(d.name));
                
    if (found && found.youtube_url) {
        window.open(found.youtube_url, '_blank');
    } else {
        showToast(`「${name}」の動画は見つかりませんでした`, 'error');
    }
}

function setupSwipeDelete(element, onDelete) {
    let startX = 0;
    element.addEventListener('touchstart', e => startX = e.touches[0].clientX);
    element.addEventListener('touchmove', e => {
        const diff = startX - e.touches[0].clientX;
        if (diff > 0 && diff < 100) element.style.transform = `translateX(-${diff}px)`;
    });
    element.addEventListener('touchend', e => {
        const diff = startX - e.changedTouches[0].clientX;
        if (diff > 80) {
            if(confirm('削除しますか?')) onDelete();
            else element.style.transform = 'translateX(0)';
        } else {
            element.style.transform = 'translateX(0)';
        }
    });
}