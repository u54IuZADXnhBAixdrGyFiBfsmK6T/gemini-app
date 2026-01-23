import { showToast, formatDate, setupModal, initSmoothScrolling } from '../shared/utils.js';
import { Calendar } from '../shared/calendar.js';

// ===== グローバル変数 =====
let calendar;
let currentEditingMealId = null;

// デフォルトの目標値
let userGoal = {
    target_calories: 2000,
    target_protein: 150,
    target_fat: 60,
    target_carbs: 250
};

// ===== 初期化 =====
document.addEventListener('DOMContentLoaded', async () => {
    initSmoothScrolling();

    // カレンダー初期化
    calendar = new Calendar('calendarDays', {
        onDateSelect: (date) => {
            loadDailyMeals(date);
            loadDailyPFC(date);
        },
        onMonthChange: (year, month) => {
            loadMealDates(year, month);
        }
    });

    // モーダル設定
    setupModal('mealModal', 'addMealBtn', 'closeMealModal'); 
    setupModal('mealModal', 'fabBtn', null); 
    setupModal('settingsModal', null, 'closeSettingsModal');

    // イベントリスナー設定
    setupEventListeners();

    // データ読み込み
    await loadUserGoal();
    
    // 今日のデータを表示
    const today = new Date();
    loadDailyMeals(today);
    loadDailyPFC(today);
    loadMealDates(today.getFullYear(), today.getMonth() + 1);
});

// ===== イベントリスナー =====
function setupEventListeners() {
    // 1. カレンダー操作
    const prevBtn = document.getElementById('prevMonth');
    const nextBtn = document.getElementById('nextMonth');
    if (prevBtn) prevBtn.addEventListener('click', () => calendar.changeMonth(-1));
    if (nextBtn) nextBtn.addEventListener('click', () => calendar.changeMonth(1));

    // 2. 目標設定画面を開くボタン
    const openSettingsBtn = document.getElementById('openSettingsBtn');
    if (openSettingsBtn) {
        openSettingsBtn.addEventListener('click', openSettingsModal);
    }

    // 3. 保存ボタン
    const saveMealBtn = document.getElementById('saveMealBtn');
    if (saveMealBtn) saveMealBtn.addEventListener('click', saveMeal);

    const saveSettingsBtn = document.getElementById('saveSettingsBtn');
    if (saveSettingsBtn) saveSettingsBtn.addEventListener('click', saveSettings);

    // 4. 自動計算（食事入力時）
    ['proteinInput', 'fatInput', 'carbsInput'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', calculateCaloriesForMeal);
    });

    // 5. 自動計算（目標設定時）
    ['targetProteinInput', 'targetFatInput', 'targetCarbsInput'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', calculateCaloriesForSettings);
    });
}

// ===== 計算ロジック =====
function calculateCaloriesForMeal() {
    const p = parseFloat(document.getElementById('proteinInput').value) || 0;
    const f = parseFloat(document.getElementById('fatInput').value) || 0;
    const c = parseFloat(document.getElementById('carbsInput').value) || 0;
    const cal = (p * 4) + (f * 9) + (c * 4);
    
    const calInput = document.getElementById('caloriesInput');
    if (calInput) calInput.value = Math.round(cal);
}

function calculateCaloriesForSettings() {
    const p = parseFloat(document.getElementById('targetProteinInput').value) || 0;
    const f = parseFloat(document.getElementById('targetFatInput').value) || 0;
    const c = parseFloat(document.getElementById('targetCarbsInput').value) || 0;
    const total = (p * 4) + (f * 9) + (c * 4);
    
    const display = document.getElementById('calculatedTargetCalories');
    if (display) display.textContent = `${Math.round(total)} kcal`;
}

// ===== API通信 =====

// 目標データの読み込み
async function loadUserGoal() {
    try {
        const response = await fetch('/api/user_goal');
        if (response.ok) {
            const data = await response.json();
            if (data && typeof data.target_calories !== 'undefined') {
                userGoal = data;
                updateGoalDisplay();
            }
        }
    } catch (e) {
        console.error('目標設定の読み込みエラー:', e);
    }
}

// 目標設定の保存
async function saveSettings() {
    const p = parseFloat(document.getElementById('targetProteinInput').value) || 0;
    const f = parseFloat(document.getElementById('targetFatInput').value) || 0;
    const c = parseFloat(document.getElementById('targetCarbsInput').value) || 0;
    
    const totalCal = (p * 4) + (f * 9) + (c * 4);

    const newGoal = {
        target_protein: p,
        target_fat: f,
        target_carbs: c,
        target_calories: totalCal
    };

    try {
        const response = await fetch('/api/user_goal', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newGoal)
        });

        if (response.ok) {
            showToast('目標設定を保存しました');
            userGoal = { ...userGoal, ...newGoal };
            updateGoalDisplay();
            document.getElementById('settingsModal').setAttribute('aria-hidden', 'true');
            
            loadDailyPFC(calendar.getSelectedDate());
        } else {
            showToast('保存に失敗しました', 'error');
        }
    } catch (error) {
        showToast('通信エラーが発生しました', 'error');
    }
}

// 食事データの読み込み
async function loadDailyMeals(date) {
    const dateStr = formatDate(date);
    try {
        const response = await fetch(`/api/daily_meals?date=${dateStr}`);
        if (!response.ok) throw new Error('API Error');
        const meals = await response.json();
        renderMeals(meals);
    } catch (error) {
        renderMeals([]); 
    }
}

// PFCデータの読み込み
async function loadDailyPFC(date) {
    const dateStr = formatDate(date);
    try {
        const response = await fetch(`/api/daily_pfc?date=${dateStr}`);
        if (!response.ok) return;
        const data = await response.json();
        updatePFCGraph(data);
    } catch (error) {
        console.error(error);
    }
}

// 月別の食事記録日を読み込み
async function loadMealDates(year, month) {
    try {
        const response = await fetch(`/api/meal_dates?year=${year}&month=${month}`);
        const data = await response.json();
        const dates = data.dates || [];
        calendar.setMarkedDates(dates);
    } catch (error) {
        console.error('Error loading meal dates:', error);
    }
}

// 食事の保存
async function saveMeal() {
    const nameInput = document.getElementById('mealNameInput');
    
    const mealData = {
        date: formatDate(calendar.getSelectedDate()),
        meal_name: nameInput.value.trim(),
        protein: parseFloat(document.getElementById('proteinInput').value) || 0,
        fat: parseFloat(document.getElementById('fatInput').value) || 0,
        carbs: parseFloat(document.getElementById('carbsInput').value) || 0,
        calories: parseFloat(document.getElementById('caloriesInput').value) || 0
    };

    if (!mealData.meal_name) {
        showToast('メニュー名を入力してください', 'error');
        return;
    }

    const isEditing = currentEditingMealId !== null;
    const url = isEditing ? '/api/update_meal' : '/api/save_meal';
    
    if (isEditing) {
        mealData.id = currentEditingMealId;
    }

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(mealData)
        });

        if (response.ok) {
            showToast(isEditing ? '更新しました' : '保存しました');
            document.getElementById('mealModal').setAttribute('aria-hidden', 'true');
            
            // フォームクリア
            nameInput.value = '';
            document.getElementById('proteinInput').value = '';
            document.getElementById('fatInput').value = '';
            document.getElementById('carbsInput').value = '';
            document.getElementById('caloriesInput').value = '';
            currentEditingMealId = null;

            // リロード
            const selectedDate = calendar.getSelectedDate();
            loadDailyMeals(selectedDate);
            loadDailyPFC(selectedDate);
            loadMealDates(selectedDate.getFullYear(), selectedDate.getMonth() + 1);
        } else {
            showToast('保存に失敗しました', 'error');
        }
    } catch (error) {
        showToast('通信エラー', 'error');
    }
}

// 食事の削除
async function deleteMeal(id) {
    if (!confirm('削除しますか？')) return;
    try {
        const response = await fetch('/api/delete_meal', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        });
        if (response.ok) {
            showToast('削除しました');
            const selectedDate = calendar.getSelectedDate();
            loadDailyMeals(selectedDate);
            loadDailyPFC(selectedDate);
            loadMealDates(selectedDate.getFullYear(), selectedDate.getMonth() + 1);
        }
    } catch (e) {
        showToast('エラー', 'error');
    }
}

// ===== UI描画 =====

/* renderMeals関数を以下のように書き換えてください */

function renderMeals(meals) {
    const container = document.getElementById('mealsContainer');
    container.innerHTML = '';

    if (!meals || meals.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-text">この日の食事記録はありません</div>
                <div class="empty-state-subtext">＋ボタンから追加してください</div>
            </div>`;
        return;
    }

    meals.forEach(meal => {
        const card = document.createElement('div');
        card.className = 'meal-card';
        
        // ヘッダーのカラム幅に合わせて要素を配置
        card.innerHTML = `
            <div class="meal-info-row">
                <div class="meal-name">${meal.meal_name}</div>
                <div class="meal-stats-row">
                    <span class="stat-box p-val">${Math.round(meal.protein)}</span>
                    <span class="stat-box f-val">${Math.round(meal.fat)}</span>
                    <span class="stat-box c-val">${Math.round(meal.carbs)}</span>
                    <span class="stat-box cal-val">${Math.round(meal.calories)}</span>
                </div>
            </div>
            <button class="meal-delete-btn" data-id="${meal.id}">×</button>
        `;
        
        // 削除ボタンイベント
        const deleteBtn = card.querySelector('.meal-delete-btn');
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteMeal(meal.id);
        });

        // カード全体クリックで編集
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.meal-delete-btn')) {
                openEditModal(meal);
            }
        });

        container.appendChild(card);
    });
}

function openEditModal(meal) {
    currentEditingMealId = meal.id;
    document.getElementById('mealNameInput').value = meal.meal_name;
    document.getElementById('proteinInput').value = meal.protein;
    document.getElementById('fatInput').value = meal.fat;
    document.getElementById('carbsInput').value = meal.carbs;
    document.getElementById('caloriesInput').value = meal.calories;
    document.getElementById('mealModal').setAttribute('aria-hidden', 'false');
}

function openSettingsModal() {
    document.getElementById('targetProteinInput').value = userGoal.target_protein;
    document.getElementById('targetFatInput').value = userGoal.target_fat;
    document.getElementById('targetCarbsInput').value = userGoal.target_carbs;
    calculateCaloriesForSettings();
    
    document.getElementById('settingsModal').setAttribute('aria-hidden', 'false');
}

function updateGoalDisplay() {
    setText('targetCalories', `${Math.round(userGoal.target_calories)} kcal`);
    setText('proteinTarget', Math.round(userGoal.target_protein));
    setText('fatTarget', Math.round(userGoal.target_fat));
    setText('carbsTarget', Math.round(userGoal.target_carbs));
    setText('caloriesTarget', Math.round(userGoal.target_calories));
}

function updatePFCGraph(data) {
    const p = data.protein || 0;
    const f = data.fat || 0;
    const c = data.carbs || 0;
    const cal = data.calories || 0;

    setText('proteinValue', Math.round(p));
    setText('fatValue', Math.round(f));
    setText('carbsValue', Math.round(c));
    setText('caloriesValue', Math.round(cal));
    setText('todayCalories', `${Math.round(cal)} kcal`);

    setBarWidth('proteinBar', p, userGoal.target_protein);
    setBarWidth('fatBar', f, userGoal.target_fat);
    setBarWidth('carbsBar', c, userGoal.target_carbs);
    setBarWidth('caloriesBar', cal, userGoal.target_calories);
}

function setText(id, text) {
    const el = document.getElementById(id);
    if(el) el.textContent = text;
}

function setBarWidth(id, current, target) {
    const el = document.getElementById(id);
    if(el && target > 0) {
        const pct = Math.min((current / target) * 100, 100);
        el.style.width = `${pct}%`;
    } else if (el) {
        el.style.width = '0%';
    }
}