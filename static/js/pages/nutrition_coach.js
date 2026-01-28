// nutrition_coach.js - AI生成Tips統合版

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

// ========================================
// AI生成Tips管理クラス（栄養版）
// ========================================
class NutritionTipsManager {
    constructor() {
        this.tips = [];
        this.currentIndex = 0;
        this.tipsInterval = null;
    }

    async fetchTips(contextData) {
        try {
            const response = await fetch('/api/nutrition/generate-tips', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(contextData)
            });

            const data = await response.json();
            
            if (data.success && data.tips && data.tips.length > 0) {
                this.tips = data.tips;
            } else {
                this.tips = [
                    '💡 タンパク質は体重×2gを目安に',
                    '💡 炭水化物はトレーニング前後に集中',
                    '💡 良質な脂質は1日50-70gが目安'
                ];
            }
        } catch (error) {
            console.error('Tips取得エラー:', error);
            this.tips = [
                '💡 水分は体重×30mlが1日の目安',
                '💡 食事は1日3-5回に分けると効果的',
                '💡 野菜は毎食350g以上が理想'
            ];
        }
    }

    start() {
        if (this.tips.length === 0) return;

        this.updateTipsDisplay();

        this.tipsInterval = setInterval(() => {
            this.currentIndex = (this.currentIndex + 1) % this.tips.length;
            this.updateTipsDisplay();
        }, 5000);
    }

    updateTipsDisplay() {
        const tipsElement = document.querySelector('.loading-tips');
        if (tipsElement && this.tips[this.currentIndex]) {
            tipsElement.style.opacity = '0';
            
            setTimeout(() => {
                tipsElement.textContent = this.tips[this.currentIndex];
                tipsElement.style.opacity = '1';
            }, 300);
        }
    }

    stop() {
        if (this.tipsInterval) {
            clearInterval(this.tipsInterval);
            this.tipsInterval = null;
        }
    }
}

// ========================================
// ローディング表示管理クラス（栄養版）
// ========================================
class NutritionLoadingManager {
    constructor() {
        this.messages = [
            '⏳ データを分析中...',
            '🧮 計算を実行中...',
            '🎯 最適化しています...',
            '✅ もうすぐ完成です...'
        ];
        this.currentMessageIndex = 0;
        this.messageInterval = null;
        this.tipsManager = new NutritionTipsManager();
    }

    async show(outputElement, contextData) {
        const loadingHTML = `
            <div class="ai-loading-container">
                <div class="loading-pulse"></div>
                <p class="loading-message">⏳ データを準備中...</p>
                <div class="loading-tips">💡 Tips を読み込み中...</div>
            </div>
        `;
        
        outputElement.innerHTML = loadingHTML;

        await this.tipsManager.fetchTips(contextData);
        this.startMessageRotation();
        this.tipsManager.start();
    }

    startMessageRotation() {
        this.updateMessage();

        this.messageInterval = setInterval(() => {
            this.currentMessageIndex = (this.currentMessageIndex + 1) % this.messages.length;
            this.updateMessage();
        }, 3000);
    }

    updateMessage() {
        const messageElement = document.querySelector('.loading-message');
        if (messageElement) {
            messageElement.textContent = this.messages[this.currentMessageIndex];
        }
    }

    hide() {
        if (this.messageInterval) {
            clearInterval(this.messageInterval);
            this.messageInterval = null;
        }
        this.tipsManager.stop();
    }
}

// ========================================
// PFC計算機能（Tips統合版）
// ========================================
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

    btn.disabled = true;

    const loadingManager = new NutritionLoadingManager();
    loadingManager.messages = [
        '🔍 基礎代謝量を計算中...',
        '⚖️ 活動量係数を適用中...',
        '🎯 PFCバランスを最適化中...',
        '✅ 計算が完了しました...'
    ];

    const contextData = {
        goal: goal,
        activity_level: activityLevel
    };

    await loadingManager.show(output, contextData);

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

        loadingManager.hide();

        if (response.ok) {
            output.innerHTML = marked.parse(data.result);
        } else {
            output.innerHTML = `❌ エラーが発生しました: ${data.error || '不明なエラー'}`;
        }
    } catch (error) {
        console.error('Fetch Error:', error);
        loadingManager.hide();
        output.innerHTML = `❌ 通信エラーが発生しました: ${error.message}`;
    } finally {
        btn.disabled = false;
    }
}

// ========================================
// 食事記録分析機能（Tips統合版）
// ========================================
async function analyzeMealHistory() {
    const activePeriodBtn = document.querySelector('.period-btn.active');
    const periodDays = activePeriodBtn ? activePeriodBtn.dataset.days : '7';
    const output = document.getElementById('output');
    const btn = document.getElementById('analyze-meal-history-btn');

    btn.disabled = true;

    const loadingManager = new NutritionLoadingManager();
    loadingManager.messages = [
        '📊 食事データを収集中...',
        '🔍 栄養バランスを分析中...',
        '💡 改善点を特定中...',
        '✅ レポート作成完了...'
    ];

    const contextData = {
        goal: 'データ分析',
        activity_level: '中程度の運動'
    };

    await loadingManager.show(output, contextData);

    try {
        const response = await fetch('/api/nutrition/analyze-history', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                period_days: periodDays,
                user_id: 1
            })
        });

        const data = await response.json();

        loadingManager.hide();

        if (response.ok) {
            output.innerHTML = marked.parse(data.result);
        } else {
            output.innerHTML = `❌ エラーが発生しました: ${data.error || '不明なエラー'}`;
        }
    } catch (error) {
        console.error('Fetch Error:', error);
        loadingManager.hide();
        output.innerHTML = `❌ 通信エラーが発生しました: ${error.message}`;
    } finally {
        btn.disabled = false;
    }
}

// ========================================
// 食事提案機能（Tips統合版）
// ========================================
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

    btn.disabled = true;

    const loadingManager = new NutritionLoadingManager();
    loadingManager.messages = [
        '🍽️ 食材を選定中...',
        '⚖️ 栄養バランスを調整中...',
        '📝 献立を作成中...',
        '✅ 完成しました...'
    ];

    const contextData = {
        goal: '献立作成',
        activity_level: 'カスタムPFC'
    };

    await loadingManager.show(output, contextData);

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

        loadingManager.hide();

        if (response.ok) {
            output.innerHTML = marked.parse(data.result);
        } else {
            output.innerHTML = `❌ エラーが発生しました: ${data.error || '不明なエラー'}`;
        }
    } catch (error) {
        console.error('Fetch Error:', error);
        loadingManager.hide();
        output.innerHTML = `❌ 通信エラーが発生しました: ${error.message}`;
    } finally {
        btn.disabled = false;
    }
}

// ========================================
// 栄養相談機能（Tips統合版）
// ========================================
async function consultation() {
    const concern = document.getElementById('concern').value;
    const userInfo = document.getElementById('user-info').value;
    const output = document.getElementById('output');
    const btn = document.getElementById('consultation-btn');

    if (!concern.trim()) {
        output.innerHTML = '❌ 相談内容を入力してください';
        return;
    }

    btn.disabled = true;

    const loadingManager = new NutritionLoadingManager();
    loadingManager.messages = [
        '💬 相談内容を分析中...',
        '📚 最適なアドバイスを検索中...',
        '✍️ 回答を作成中...',
        '✅ もうすぐ完成です...'
    ];

    const contextData = {
        goal: '栄養相談',
        activity_level: '一般'
    };

    await loadingManager.show(output, contextData);

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

        loadingManager.hide();

        if (response.ok) {
            output.innerHTML = marked.parse(data.result);
        } else {
            output.innerHTML = `❌ エラーが発生しました: ${data.error || '不明なエラー'}`;
        }
    } catch (error) {
        console.error('Fetch Error:', error);
        loadingManager.hide();
        output.innerHTML = `❌ 通信エラーが発生しました: ${error.message}`;
    } finally {
        btn.disabled = false;
    }
}