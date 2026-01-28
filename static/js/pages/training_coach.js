// training_coach.js - AI生成Tips統合版

// タブ切り替え機能とイベントリスナー
document.addEventListener('DOMContentLoaded', () => {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const output = document.getElementById('output');

    // タブ切り替え
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.dataset.tab;

            // アクティブ状態をリセット
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            // 選択されたタブをアクティブに
            btn.classList.add('active');
            document.getElementById(`${targetTab}-tab`).classList.add('active');

            // 出力をリセット
            output.innerHTML = '✨ 情報を入力して、AIに相談してください';
        });
    });

    // 痛みレベルスライダー
    const painLevel = document.getElementById('pain-level');
    const painValue = document.getElementById('pain-value');
    if (painLevel && painValue) {
        painLevel.addEventListener('input', (e) => {
            painValue.textContent = e.target.value;
        });
    }

    // メニュー提案ボタン
    document.getElementById('suggest-exercises-btn').addEventListener('click', suggestExercises);

    // フォーム改善ボタン
    document.getElementById('improve-form-btn').addEventListener('click', improveForm);

    // 怪我対応ボタン
    document.getElementById('injury-recovery-btn').addEventListener('click', injuryRecovery);

    // プログラム設計ボタン
    document.getElementById('design-program-btn').addEventListener('click', designProgram);

    // 記録分析ボタン
    document.getElementById('analyze-history-btn').addEventListener('click', analyzeHistory);

    // 期間選択ボタン
    const periodBtns = document.querySelectorAll('.period-btn');
    periodBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            periodBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
});

// ========================================
// AI生成Tips管理クラス
// ========================================
class AITipsManager {
    constructor() {
        this.tips = [];
        this.currentIndex = 0;
        this.tipsInterval = null;
    }

    async fetchTips(contextData) {
        try {
            const response = await fetch('/api/training/generate-tips', {
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
                // フォールバック
                this.tips = [
                    '💡 筋肥大には8-12レップが最適です',
                    '💡 トレーニング後48時間は筋合成が活発',
                    '💡 睡眠不足は筋合成を30%低下させます'
                ];
            }
        } catch (error) {
            console.error('Tips取得エラー:', error);
            // エラー時のフォールバック
            this.tips = [
                '💡 正しいフォームが最も重要です',
                '💡 休息も立派なトレーニングの一部',
                '💡 継続が何よりの力です'
            ];
        }
    }

    start() {
        if (this.tips.length === 0) return;

        // 初回表示
        this.updateTipsDisplay();

        // 5秒ごとに更新
        this.tipsInterval = setInterval(() => {
            this.currentIndex = (this.currentIndex + 1) % this.tips.length;
            this.updateTipsDisplay();
        }, 5000);
    }

    updateTipsDisplay() {
        const tipsElement = document.querySelector('.loading-tips');
        if (tipsElement && this.tips[this.currentIndex]) {
            // フェードアウト → 更新 → フェードイン
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
// ローディング表示管理クラス
// ========================================
class LoadingManager {
    constructor() {
        this.messages = [
            '⏳ あなたの目標を分析中...',
            '💪 最適な種目を選定中...',
            '📊 セット数とレップ数を計算中...',
            '✅ プログラム作成完了間近...'
        ];
        this.currentMessageIndex = 0;
        this.messageInterval = null;
        this.tipsManager = new AITipsManager();
    }

    async show(outputElement, contextData) {
        // ローディングHTML作成
        const loadingHTML = `
            <div class="ai-loading-container">
                <div class="loading-pulse"></div>
                <p class="loading-message">⏳ データを準備中...</p>
                <div class="loading-tips">💡 Tips を読み込み中...</div>
            </div>
        `;
        
        outputElement.innerHTML = loadingHTML;

        // AI生成Tipsを取得
        await this.tipsManager.fetchTips(contextData);

        // メッセージ更新開始
        this.startMessageRotation();

        // Tips表示開始
        this.tipsManager.start();
    }

    startMessageRotation() {
        // 初回表示
        this.updateMessage();

        // 3秒ごとにメッセージ更新
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
// メニュー提案機能（Tips統合版）
// ========================================
async function suggestExercises() {
    const targetMuscle = document.getElementById('target-muscle').value;
    const trainingLevel = document.getElementById('training-level').value;
    const equipment = document.getElementById('equipment').value;
    const goals = document.getElementById('ex-goals').value;
    const output = document.getElementById('output');
    const btn = document.getElementById('suggest-exercises-btn');

    // バリデーション
    if (!equipment.trim() || !goals.trim()) {
        output.innerHTML = '❌ すべての項目を入力してください';
        return;
    }

    btn.disabled = true;

    // ローディング管理インスタンス作成
    const loadingManager = new LoadingManager();

    // コンテキストデータ準備
    const contextData = {
        target_muscle: targetMuscle,
        training_level: trainingLevel,
        goals: goals
    };

    // ローディング表示開始（Tips自動取得・表示）
    await loadingManager.show(output, contextData);

    try {
        const response = await fetch('/api/training/suggest-exercises', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                target_muscle: targetMuscle,
                training_level: trainingLevel,
                equipment: equipment,
                goals: goals
            })
        });

        const data = await response.json();

        // ローディング停止
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
// 記録分析機能（Tips統合版）
// ========================================
async function analyzeHistory() {
    const activePeriodBtn = document.querySelector('.period-btn.active');
    const periodDays = activePeriodBtn ? activePeriodBtn.dataset.days : '7';
    const output = document.getElementById('output');
    const btn = document.getElementById('analyze-history-btn');

    btn.disabled = true;

    const loadingManager = new LoadingManager();
    loadingManager.messages = [
        '📊 過去のデータを収集中...',
        '🔍 パターンを分析中...',
        '💡 改善点を特定中...',
        '✅ レポート作成完了間近...'
    ];

    // 汎用的なコンテキスト
    const contextData = {
        target_muscle: '全身',
        training_level: '中級者',
        goals: 'データ分析と改善'
    };

    await loadingManager.show(output, contextData);

    try {
        const response = await fetch('/api/training/analyze-history', {
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
// フォーム改善機能（Tips統合版）
// ========================================
async function improveForm() {
    const exerciseName = document.getElementById('exercise-name').value;
    const issue = document.getElementById('form-issue').value;
    const experience = document.getElementById('form-experience').value;
    const output = document.getElementById('output');
    const btn = document.getElementById('improve-form-btn');

    if (!exerciseName.trim() || !issue.trim()) {
        output.innerHTML = '❌ 種目名と悩みを入力してください';
        return;
    }

    btn.disabled = true;

    const loadingManager = new LoadingManager();
    loadingManager.messages = [
        '🔍 フォームを分析中...',
        '💡 改善点を特定中...',
        '📝 アドバイスを作成中...',
        '✅ もうすぐ完成です...'
    ];

    const contextData = {
        target_muscle: exerciseName,
        training_level: experience,
        goals: 'フォーム改善'
    };

    await loadingManager.show(output, contextData);

    try {
        const response = await fetch('/api/training/improve-form', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                exercise_name: exerciseName,
                issue: issue,
                experience: experience
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
// 怪我対応機能（Tips統合版）
// ========================================
async function injuryRecovery() {
    const injuryLocation = document.getElementById('injury-location').value;
    const symptoms = document.getElementById('symptoms').value;
    const painLevel = document.getElementById('pain-level').value;
    const occurrence = document.getElementById('occurrence').value;
    const output = document.getElementById('output');
    const btn = document.getElementById('injury-recovery-btn');

    if (!symptoms.trim() || !occurrence.trim()) {
        output.innerHTML = '❌ 症状と発生状況を入力してください';
        return;
    }

    btn.disabled = true;

    const loadingManager = new LoadingManager();
    loadingManager.messages = [
        '🩹 症状を分析中...',
        '📋 リハビリ計画を設計中...',
        '💊 対策を検討中...',
        '✅ 計画が完成しました...'
    ];

    const contextData = {
        target_muscle: injuryLocation,
        training_level: '初心者',
        goals: 'リハビリと回復'
    };

    await loadingManager.show(output, contextData);

    try {
        const response = await fetch('/api/training/injury-recovery', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                injury_location: injuryLocation,
                symptoms: symptoms,
                pain_level: painLevel,
                occurrence: occurrence
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
// プログラム設計機能（Tips統合版）
// ========================================
async function designProgram() {
    const goal = document.getElementById('program-goal').value;
    const frequency = document.getElementById('frequency').value;
    const level = document.getElementById('program-level').value;
    const availableTime = document.getElementById('available-time').value;
    const limitations = document.getElementById('limitations').value;
    const output = document.getElementById('output');
    const btn = document.getElementById('design-program-btn');

    btn.disabled = true;

    const loadingManager = new LoadingManager();
    loadingManager.messages = [
        '📅 スケジュールを設計中...',
        '💪 種目を選定中...',
        '⚖️ ボリュームを調整中...',
        '✅ プログラム完成間近...'
    ];

    const contextData = {
        target_muscle: '全身',
        training_level: level,
        goals: goal
    };

    await loadingManager.show(output, contextData);

    try {
        const response = await fetch('/api/training/design-program', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                goal: goal,
                frequency: frequency,
                level: level,
                available_time: availableTime,
                limitations: limitations
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