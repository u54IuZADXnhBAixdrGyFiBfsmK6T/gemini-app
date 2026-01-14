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
});

// メニュー提案機能
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

    // ローディング表示
    output.innerHTML = '<p class="loading">💪 AIがトレーニングメニューを作成しています...</p>';
    btn.disabled = true;

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

// フォーム改善機能
async function improveForm() {
    const exerciseName = document.getElementById('exercise-name').value;
    const issue = document.getElementById('form-issue').value;
    const experience = document.getElementById('form-experience').value;
    const output = document.getElementById('output');
    const btn = document.getElementById('improve-form-btn');

    // バリデーション
    if (!exerciseName.trim() || !issue.trim()) {
        output.innerHTML = '❌ 種目名と悩みを入力してください';
        return;
    }

    // ローディング表示
    output.innerHTML = '<p class="loading">🔧 AIがフォーム改善策を分析しています...</p>';
    btn.disabled = true;

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

// 怪我対応機能
async function injuryRecovery() {
    const injuryLocation = document.getElementById('injury-location').value;
    const symptoms = document.getElementById('symptoms').value;
    const painLevel = document.getElementById('pain-level').value;
    const occurrence = document.getElementById('occurrence').value;
    const output = document.getElementById('output');
    const btn = document.getElementById('injury-recovery-btn');

    // バリデーション
    if (!symptoms.trim() || !occurrence.trim()) {
        output.innerHTML = '❌ 症状と発生状況を入力してください';
        return;
    }

    // ローディング表示
    output.innerHTML = '<p class="loading">🩹 AIがリハビリ計画を作成しています...</p>';
    btn.disabled = true;

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

// プログラム設計機能
async function designProgram() {
    const goal = document.getElementById('program-goal').value;
    const frequency = document.getElementById('frequency').value;
    const level = document.getElementById('program-level').value;
    const availableTime = document.getElementById('available-time').value;
    const limitations = document.getElementById('limitations').value;
    const output = document.getElementById('output');
    const btn = document.getElementById('design-program-btn');

    // ローディング表示
    output.innerHTML = '<p class="loading">📅 AIがあなた専用プログラムを設計しています...</p>';
    btn.disabled = true;

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