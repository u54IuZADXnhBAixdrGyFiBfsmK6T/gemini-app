import { showToast, calculateDaysAgo, setupModal, initSmoothScrolling } from '../shared/utils.js';

// ===== グローバル変数 =====
let exercisesData = [];
let currentCategoryId = null;
let currentExerciseId = null;

// ===== 初期化 =====
document.addEventListener('DOMContentLoaded', async () => {
    initSmoothScrolling();

    // モーダル設定
    setupModal('addExerciseModal', null, 'closeAddExerciseModal');
    // 編集モーダル
    setupModal('editExerciseModal', null, 'closeEditExerciseModal');
    
    // 種目追加・編集・削除の実行ボタン
    const submitAddBtn = document.getElementById('submitAddExercise');
    if (submitAddBtn) submitAddBtn.addEventListener('click', submitAddExercise);

    const submitEditBtn = document.getElementById('submitEditExercise');
    if (submitEditBtn) submitEditBtn.addEventListener('click', submitEditExercise);

    const submitDeleteBtn = document.getElementById('submitDeleteExercise');
    if (submitDeleteBtn) submitDeleteBtn.addEventListener('click', submitDeleteExercise);

    // データ読み込み
    await loadExercises();
    setupStickyHeader();
    
    // 部位追加ボタン（将来用）
    const addCategoryBtn = document.getElementById('addCategoryBtn');
    if (addCategoryBtn) {
        addCategoryBtn.addEventListener('click', () => {
             showToast('部位の追加機能は今後実装予定です', 'error');
        });
    }
});

// ===== API通信・データ読み込み =====

async function loadExercises() {
    try {
        const response = await fetch('/api/exercises');
        if (!response.ok) throw new Error('Network response was not ok');
        
        exercisesData = await response.json();
        renderCategories();
    } catch (error) {
        console.error('Error loading exercises:', error);
        showToast('種目データの読み込みに失敗しました', 'error');
    }
}

// ===== 表示ロジック =====

function renderCategories() {
    const container = document.getElementById('categoriesContainer');
    if (!container) return;

    container.innerHTML = '';

    // exercisesData はカテゴリごとのオブジェクトの配列と想定
    exercisesData.forEach(category => {
        const section = document.createElement('div');
        section.className = 'category-section';

        // カテゴリヘッダー
        const header = document.createElement('div');
        header.className = 'category-header';
        header.innerHTML = `<div class="category-name">${category.category}</div>`;
        section.appendChild(header);

        // 種目リスト
        const list = document.createElement('div');
        list.className = 'exercise-list';

        category.exercises.forEach(ex => {
            const item = createExerciseItem(ex);
            list.appendChild(item);
        });
        section.appendChild(list);

        // 「種目を追加」ボタン（このカテゴリ専用）
        const addBtn = document.createElement('button');
        addBtn.className = 'add-exercise-btn';
        addBtn.innerHTML = '<span>＋</span> 種目を追加';
        addBtn.addEventListener('click', () => openAddModal(category.category_id));
        section.appendChild(addBtn);

        container.appendChild(section);
    });
}

function createExerciseItem(exercise) {
    const item = document.createElement('div');
    item.className = 'exercise-item';
    
    const isSystem = exercise.user_id === null;
    const isRecommended = exercise.is_recommended;
    
    let badges = '';
    if (isSystem) badges += '<span class="exercise-badge system">システム</span>';
    if (isRecommended) badges += '<span class="exercise-badge">推奨</span>';

    // 日付計算は utils.js の calculateDaysAgo を使用
    const lastLog = exercise.last_date ? `<span>最終: ${calculateDaysAgo(exercise.last_date)}</span>` : '';

    item.innerHTML = `
        <div class="exercise-info">
            <div class="exercise-name">${exercise.name}</div>
            <div class="exercise-meta">
                ${badges}
                ${lastLog}
            </div>
        </div>
        <div class="exercise-actions">
            ${!isSystem ? `
                <button class="edit-btn" title="編集">✏️</button>
                <button class="delete-btn" title="削除">🗑️</button>
            ` : '<span style="color: #9ca3af; font-size: 0.8rem;">編集不可</span>'}
        </div>
    `;

    // イベントリスナー設定
    if (!isSystem) {
        const editBtn = item.querySelector('.edit-btn');
        if (editBtn) editBtn.addEventListener('click', () => openEditModal(exercise));

        const deleteBtn = item.querySelector('.delete-btn');
        if (deleteBtn) deleteBtn.addEventListener('click', () => confirmDelete(exercise));
    }

    return item;
}

// ===== 追加・編集・削除ロジック =====

function openAddModal(categoryId) {
    currentCategoryId = categoryId;
    const input = document.getElementById('newExerciseName');
    if (input) input.value = '';
    document.getElementById('addExerciseModal').setAttribute('aria-hidden', 'false');
}

async function submitAddExercise() {
    const nameInput = document.getElementById('newExerciseName');
    const name = nameInput.value.trim();

    if (!name) {
        showToast('種目名を入力してください', 'error');
        return;
    }

    try {
        const response = await fetch('/api/add_exercise', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ category_id: currentCategoryId, name: name })
        });

        const data = await response.json();

        if (response.ok) {
            showToast('種目を追加しました');
            document.getElementById('addExerciseModal').setAttribute('aria-hidden', 'true');
            await loadExercises();
        } else {
            showToast(data.error || '追加に失敗しました', 'error');
        }
    } catch (error) {
        showToast('通信エラーが発生しました', 'error');
    }
}

function openEditModal(exercise) {
    currentExerciseId = exercise.id;
    const input = document.getElementById('editExerciseName');
    if (input) input.value = exercise.name;
    document.getElementById('editExerciseModal').setAttribute('aria-hidden', 'false');
}

async function submitEditExercise() {
    const nameInput = document.getElementById('editExerciseName');
    const name = nameInput.value.trim();

    if (!currentExerciseId || !name) return;

    try {
        // 修正: エンドポイントを /api/edit_exercise にしました
        const response = await fetch('/api/edit_exercise', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: currentExerciseId, name: name })
        });

        if (response.ok) {
            showToast('更新しました');
            document.getElementById('editExerciseModal').setAttribute('aria-hidden', 'true');
            await loadExercises();
        } else {
            showToast('更新に失敗しました', 'error');
        }
    } catch (error) {
        showToast('エラーが発生しました', 'error');
    }
}

function confirmDelete(exercise) {
    if (!confirm(`「${exercise.name}」を削除しますか？\n関連するトレーニング記録も全て削除されます。`)) {
        return;
    }
    currentExerciseId = exercise.id; // 削除対象IDをセット
    submitDeleteExercise(); // 削除実行
}

async function submitDeleteExercise() {
    if (!currentExerciseId) return;
    
    // 編集モーダルが開いていれば閉じる
    document.getElementById('editExerciseModal').setAttribute('aria-hidden', 'true');

    try {
        const response = await fetch('/api/delete_exercise', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: currentExerciseId })
        });

        if (response.ok) {
            showToast('削除しました');
            await loadExercises();
        } else {
            showToast('削除に失敗しました', 'error');
        }
    } catch (error) {
        showToast('エラーが発生しました', 'error');
    }
}

// ===== スティッキーヘッダー処理 =====
function setupStickyHeader() {
    const siteHeader = document.getElementById('site-header');
    const pageHeader = document.querySelector('.page-header');
  
    if (!siteHeader || !pageHeader) return;
  
    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            if (mutation.attributeName === 'class') {
                const isHidden = siteHeader.classList.contains('is-hidden');
                pageHeader.style.top = isHidden ? '0px' : '72px';
            }
        });
    });
  
    observer.observe(siteHeader, { attributes: true });
    
    // 初期状態の設定
    const isInitiallyHidden = siteHeader.classList.contains('is-hidden');
    pageHeader.style.top = isInitiallyHidden ? '0px' : '72px';
}