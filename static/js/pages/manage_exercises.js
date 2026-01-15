// ===== グローバル変数 =====
let exercisesData = [];
let currentCategoryId = null;
let currentExerciseId = null;

// ===== 初期化 =====
document.addEventListener('DOMContentLoaded', async () => {
  await loadExercises();
  renderCategories();
  setupEventListeners();
  setupStickyHeader(); // スティッキーヘッダーの初期化
});

// ===== スティッキーヘッダー処理 =====
function setupStickyHeader() {
  const siteHeader = document.getElementById('site-header');
  const pageHeader = document.querySelector('.page-header');

  // 必要な要素がなければ何もしない
  if (!siteHeader || !pageHeader) return;

  // サイトヘッダーのクラス属性の変更を監視するオブザーバーを作成
  // スクロールイベントよりも効率的
  const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
          if (mutation.attributeName === 'class') {
              // 'is-hidden'クラスの有無に基づいてtopの位置を動的に変更
              const isHidden = siteHeader.classList.contains('is-hidden');
              pageHeader.style.top = isHidden ? '0px' : '72px';
          }
      });
  });

  // オブザーバーを開始
  observer.observe(siteHeader, { attributes: true });

  // ページ読み込み時の初期状態を設定
  const isInitiallyHidden = siteHeader.classList.contains('is-hidden');
  pageHeader.style.top = isInitiallyHidden ? '0px' : '72px';
}

// ===== イベントリスナー設定 =====
function setupEventListeners() {
  // 部位追加ボタン（将来実装）
  document.getElementById('addCategoryBtn').addEventListener('click', () => {
    showToast('部位の追加機能は今後実装予定です');
  });
  
  // 種目追加モーダル
  document.getElementById('closeAddExerciseModal').addEventListener('click', closeAddExerciseModal);
  document.getElementById('submitAddExercise').addEventListener('click', submitAddExercise);
  
  // 種目編集モーダル
  document.getElementById('closeEditExerciseModal').addEventListener('click', closeEditExerciseModal);
  document.getElementById('submitEditExercise').addEventListener('click', submitEditExercise);
  document.getElementById('submitDeleteExercise').addEventListener('click', submitDeleteExercise);
  
  // モーダル背景クリックで閉じる
  document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
    backdrop.addEventListener('click', (e) => {
      if (e.target === e.currentTarget) {
        closeAllModals();
      }
    });
  });
}

// ===== データ読み込み =====
async function loadExercises() {
  try {
    const response = await fetch('/api/exercises');
    exercisesData = await response.json();
  } catch (error) {
    console.error('Error loading exercises:', error);
    showToast('種目データの読み込みに失敗しました');
  }
}

// ===== カテゴリと種目の描画 =====
function renderCategories() {
  const container = document.getElementById('categoriesContainer');
  container.innerHTML = '';
  
  exercisesData.forEach(category => {
    const section = createCategorySection(category);
    container.appendChild(section);
  });
}

function createCategorySection(category) {
  const section = document.createElement('div');
  section.className = 'category-section';
  
  // カテゴリヘッダー
  const header = document.createElement('div');
  header.className = 'category-header';
  
  header.innerHTML = `
    <div class="category-name">${category.category}</div>
  `;
  
  section.appendChild(header);
  
  // 種目リスト
  const listContainer = document.createElement('div');
  listContainer.className = 'exercise-list';
  
  category.exercises.forEach(exercise => {
    const item = createExerciseItem(exercise, category.category_id);
    listContainer.appendChild(item);
  });
  
  section.appendChild(listContainer);
  
  // 種目追加ボタン
  const addBtn = document.createElement('button');
  addBtn.className = 'add-exercise-btn';
  addBtn.innerHTML = '<span>＋</span> 種目を追加';
  addBtn.addEventListener('click', () => openAddExerciseModal(category.category_id));
  section.appendChild(addBtn);
  
  return section;
}

function createExerciseItem(exercise, categoryId) {
  const item = document.createElement('div');
  item.className = 'exercise-item';
  
  const isSystem = exercise.user_id === null;
  const isRecommended = exercise.is_recommended;
  
  let badges = '';
  if (isSystem) {
    badges += '<span class="exercise-badge system">システム</span>';
  }
  if (isRecommended) {
    badges += '<span class="exercise-badge">推奨</span>';
  }
  
  item.innerHTML = `
    <div class="exercise-info">
      <div class="exercise-name">${exercise.name}</div>
      <div class="exercise-meta">
        ${badges}
        ${exercise.last_date ? `<span>最終: ${calculateDaysAgo(exercise.last_date)}</span>` : ''}
      </div>
    </div>
    <div class="exercise-actions">
      ${!isSystem ? `
        <button class="edit-btn" data-id="${exercise.id}" title="編集">✏️</button>
        <button class="delete-btn" data-id="${exercise.id}" title="削除">🗑️</button>
      ` : '<span style="color: #9ca3af; font-size: 0.8rem;">編集不可</span>'}
    </div>
  `;
  
  // 編集ボタン
  const editBtn = item.querySelector('.edit-btn');
  if (editBtn) {
    editBtn.addEventListener('click', () => openEditExerciseModal(exercise));
  }
  
  // 削除ボタン
  const deleteBtn = item.querySelector('.delete-btn');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', () => confirmDeleteExercise(exercise.id, exercise.name));
  }
  
  return item;
}

// ===== 種目追加モーダル =====
function openAddExerciseModal(categoryId) {
  currentCategoryId = categoryId;
  document.getElementById('newExerciseName').value = '';
  document.getElementById('addExerciseModal').setAttribute('aria-hidden', 'false');
}

function closeAddExerciseModal() {
  document.getElementById('addExerciseModal').setAttribute('aria-hidden', 'true');
  currentCategoryId = null;
}

async function submitAddExercise() {
  const name = document.getElementById('newExerciseName').value.trim();
  
  if (!name) {
    showToast('種目名を入力してください');
    return;
  }
  
  try {
    const response = await fetch('/api/add_exercise', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category_id: currentCategoryId,
        name: name
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      showToast(data.error || '追加に失敗しました');
      return;
    }
    
    showToast('種目を追加しました');
    closeAddExerciseModal();
    await loadExercises();
    renderCategories();
    
  } catch (error) {
    console.error('Error adding exercise:', error);
    showToast('追加に失敗しました');
  }
}

// ===== 種目編集モーダル =====
function openEditExerciseModal(exercise) {
  currentExerciseId = exercise.id;
  document.getElementById('editExerciseName').value = exercise.name;
  document.getElementById('editExerciseModal').setAttribute('aria-hidden', 'false');
}

function closeEditExerciseModal() {
  document.getElementById('editExerciseModal').setAttribute('aria-hidden', 'true');
  currentExerciseId = null;
}

async function submitEditExercise() {
  const name = document.getElementById('editExerciseName').value.trim();
  
  if (!name) {
    showToast('種目名を入力してください');
    return;
  }
  
  try {
    const response = await fetch('/api/edit_exercise', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: currentExerciseId,
        name: name
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      showToast(data.error || '更新に失敗しました');
      return;
    }
    
    showToast('種目を更新しました');
    closeEditExerciseModal();
    await loadExercises();
    renderCategories();
    
  } catch (error) {
    console.error('Error editing exercise:', error);
    showToast('更新に失敗しました');
  }
}

// ===== 種目削除 =====
function confirmDeleteExercise(exerciseId, exerciseName) {
  if (!confirm(`「${exerciseName}」を削除しますか？\n関連するトレーニング記録も全て削除されます。`)) {
    return;
  }
  
  deleteExercise(exerciseId);
}

async function submitDeleteExercise() {
  if (!confirm('この種目を削除しますか？\n関連するトレーニング記録も全て削除されます。')) {
    return;
  }
  
  await deleteExercise(currentExerciseId);
  closeEditExerciseModal();
}

async function deleteExercise(exerciseId) {
  try {
    const response = await fetch('/api/delete_exercise', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: exerciseId })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      showToast(data.error || '削除に失敗しました');
      return;
    }
    
    showToast('種目を削除しました');
    await loadExercises();
    renderCategories();
    
  } catch (error) {
    console.error('Error deleting exercise:', error);
    showToast('削除に失敗しました');
  }
}

// ===== ユーティリティ関数 =====
function closeAllModals() {
  closeAddExerciseModal();
  closeEditExerciseModal();
}

function calculateDaysAgo(dateStr) {
  const date = new Date(dateStr);
  const today = new Date();
  const diff = Math.floor((today - date) / (1000 * 60 * 60 * 24));
  
  if (diff === 0) return '今日';
  if (diff === 1) return '1日前';
  return `${diff}日前`;
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