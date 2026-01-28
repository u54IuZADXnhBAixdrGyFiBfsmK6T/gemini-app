document.addEventListener('DOMContentLoaded', () => {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const output = document.getElementById('output');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.dataset.tab;

            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            document.getElementById(`${targetTab}-tab`).classList.add('active');

            output.innerHTML = '✨ 情報を入力して、AIに質問してください';
        });
    });

    document.getElementById('calc-pfc-btn').addEventListener('click', calculatePFC);

    document.getElementById('suggest-meals-btn').addEventListener('click', suggestMeals);

    document.getElementById('consultation-btn').addEventListener('click', consultation);

    document.getElementById('analyze-meal-history-btn').addEventListener('click', analyzeMealHistory);

    const periodBtns = document.querySelectorAll('.period-btn');
    periodBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            periodBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
});

// PFC計算機能
async function calculatePFC() {
    const height = document.getElementById('pfc-height').value;
    const weight = document.getElementById('pfc-weight').value;
    const age = document.getElementById('pfc-age').value;
    const gender = document.getElementById('pfc-gender').value;
    const activityLevel = document.getElementById('pfc-activity').value;
    const goal = document.getElementById('pfc-goal').value;
    const output = document.getElementById('output');
    const btn = document.getElementById('calc-pfc-btn');

    if (!height || !weight || !age) {
        output.innerHTML = '❌ 身長・体重・年齢を入力してください';
        return;
    }

    output.innerHTML = '<p class="loading">🤔 AIがPFCを計算しています...</p>';
    btn.disabled = true;

    try {
        const response = await fetch('/api/nutrition/calculate-pfc', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                height,
                weight,
                age,
                gender,
                activity_level: activityLevel,
                goal
            })
        });

        const data = await response.json();

        if (response.ok) {
            output.innerHTML = marked.parse(data.result);
        } else {
            output.innerHTML = `❌ エラーが発生しました: ${data.error || '不明なエラー'}`;
        }
    } catch (error) {
        console.error('Fetch Error:', error);
        output.innerHTML = `❌ 通信エラーが発生しました: ${error.message}`;
    } finally {
        btn.disabled = false;
    }
}

// 食事記録分析機能
async function analyzeMealHistory() {
    const activePeriodBtn = document.querySelector('.period-btn.active');
    const periodDays = activePeriodBtn ? activePeriodBtn.dataset.days : '7';
    const output = document.getElementById('output');
    const btn = document.getElementById('analyze-meal-history-btn');

    output.innerHTML = '<p class="loading">📊 AIが食事記録を分析しています...</p>';
    btn.disabled = true;

    try {
        const response = await fetch('/api/nutrition/analyze-history', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                period_days: periodDays,
                user_id: 1  // ほかユーザーはみてい
            })
        });

        const data = await response.json();

        if (response.ok) {
            output.innerHTML = marked.parse(data.result);
        } else {
            output.innerHTML = `❌ エラーが発生しました: ${data.error || '不明なエラー'}`;
        }
    } catch (error) {
        console.error('Fetch Error:', error);
        output.innerHTML = `❌ 通信エラーが発生しました: ${error.message}`;
    } finally {
        btn.disabled = false;
    }
}

// 食事提案機能
async function suggestMeals() {
    const protein = document.getElementById('meal-protein').value;
    const fat = document.getElementById('meal-fat').value;
    const carbs = document.getElementById('meal-carbs').value;
    const mealsCount = document.getElementById('meal-count').value;
    const restrictions = document.getElementById('meal-restrictions').value;
    const output = document.getElementById('output');
    const btn = document.getElementById('suggest-meals-btn');

    if (!protein || !fat || !carbs) {
        output.innerHTML = '❌ タンパク質・脂質・炭水化物の目標値を入力してください';
        return;
    }

    output.innerHTML = '<p class="loading">🍽️ AIが献立を作成しています...</p>';
    btn.disabled = true;

    try {
        const response = await fetch('/api/nutrition/suggest-meals', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                protein,
                fat,
                carbs,
                meals_count: mealsCount,
                dietary_restrictions: restrictions
            })
        });

        const data = await response.json();

        if (response.ok) {
            output.innerHTML = marked.parse(data.result);
        } else {
            output.innerHTML = `❌ エラーが発生しました: ${data.error || '不明なエラー'}`;
        }
    } catch (error) {
        console.error('Fetch Error:', error);
        output.innerHTML = `❌ 通信エラーが発生しました: ${error.message}`;
    } finally {
        btn.disabled = false;
    }
}

// 栄養相談機能
async function consultation() {
    const concern = document.getElementById('concern').value;
    const userInfo = document.getElementById('user-info').value;
    const output = document.getElementById('output');
    const btn = document.getElementById('consultation-btn');

    if (!concern.trim()) {
        output.innerHTML = '❌ 相談内容を入力してください';
        return;
    }

    output.innerHTML = '<p class="loading">💬 AIが回答を考えています...</p>';
    btn.disabled = true;

    try {
        const response = await fetch('/api/nutrition/consultation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                concern,
                user_info: userInfo
            })
        });

        const data = await response.json();

        if (response.ok) {
            output.innerHTML = marked.parse(data.result);
        } else {
            output.innerHTML = `❌ エラーが発生しました: ${data.error || '不明なエラー'}`;
        }
    } catch (error) {
        console.error('Fetch Error:', error);
        output.innerHTML = `❌ 通信エラーが発生しました: ${error.message}`;
    } finally {
        btn.disabled = false;
    }
}