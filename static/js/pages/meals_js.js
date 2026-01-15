let DATA = [];
const JSON_FILES = [
  'static/json/meals_balance.json',
  'static/json/meals_cut.json',
  'static/json/meals_bulk.json'
];

// すべてのJSONファイルを非同期で読み込み、DATAに結合する
async function loadAllData() {
  try {
    const fetchPromises = JSON_FILES.map(file => fetch(file).then(res => {
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status} for ${file}`);
      return res.json();
    }));

    const allDataArrays = await Promise.all(fetchPromises);

    // 配列を結合してDATAに格納
    DATA = allDataArrays.flat();

    console.log(`データをロードしました。合計: ${DATA.length} メニュー`);
    return true;
  } catch (error) {
    console.error("データのロードに失敗しました:", error);
    DATA = [];
    return false;
  }
}

const main = document.getElementById('main');
const searchInput = document.getElementById('search');
const toggleFavView = document.getElementById('toggleFavView');
const modal = document.getElementById('detailModal');
const modalBody = document.getElementById('modalBody');
const modalClose = document.getElementById('modalClose');
const categoryJumpList = document.getElementById('categoryJumpList');
const filterCategory = document.getElementById('filterCategory');
const filterSubcategory = document.getElementById('filterSubcategory');

// カテゴリー定義
const CATEGORIES = [
  {
    key: 'balance',
    title: 'バランス',
    subtitle: '',
    subcategories: [
      { key: 'meal', label: '通常の食事' },
      { key: 'dessert', label: 'デザート' }
    ]
  },
  {
    key: 'cut',
    title: '減量',
    subtitle: '',
    subcategories: [
      { key: 'meal', label: '通常の食事' },
      { key: 'dessert', label: 'デザート' }
    ]
  },
  {
    key: 'bulk',
    title: '増量',
    subtitle: '',
    subcategories: [
      { key: 'meal', label: '通常の食事' },
      { key: 'dessert', label: 'デザート' }
    ]
  }
];

const FAV_KEY = 'mp_favs_v1';

// カテゴリージャンプリストを生成
function createCategoryJumpList() {
  const list = document.createElement('ul');
  CATEGORIES.forEach(cat => {
    const item = document.createElement('li');
    item.innerHTML = `<a href="#category-${cat.key}" data-jump-to="${cat.key}">${cat.title}</a>`;
    list.appendChild(item);
  });
  categoryJumpList.appendChild(list);

  categoryJumpList.addEventListener('click', (e) => {
    e.preventDefault();
    const target = e.target.closest('a');
    if (target && target.dataset.jumpTo) {
      const catKey = target.dataset.jumpTo;
      const el = document.getElementById(`category-${catKey}`);
      if (el) {
        const headerHeight = 72;
        const bodyRect = document.body.getBoundingClientRect().top;
        const elRect = el.getBoundingClientRect().top;
        const scrollPosition = elRect - bodyRect - headerHeight - 20;
        window.scrollTo({ top: scrollPosition, behavior: 'smooth' });
      }
    }
  });
}

// フィルターの選択肢を動的に生成
function populateFilters() {
  CATEGORIES.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat.key;
    option.textContent = cat.title;
    filterCategory.appendChild(option);
  });

  const subcategories = [
    { key: 'meal', label: '通常の食事' },
    { key: 'dessert', label: 'デザート' }
  ];

  subcategories.forEach(sub => {
    const option = document.createElement('option');
    option.value = sub.key;
    option.textContent = sub.label;
    filterSubcategory.appendChild(option);
  });
}

// 初期描画:カテゴリーごとのセクション枠を作る
function initialRender() {
  main.innerHTML = '';
  CATEGORIES.forEach(cat => {
    const section = document.createElement('section');
    section.className = 'category-section';
    section.id = `category-${cat.key}`;

    section.innerHTML = `
      <div class="category-header">
        <div>
          <h2 class="category-title">
            ${cat.title}
            <span class="category-badge ${cat.key}">${cat.title}</span>
          </h2>
          <div class="category-sub">${cat.subtitle}</div>
        </div>
        <div class="category-controls">
          <small class="category-count" data-category="${cat.key}"></small>
        </div>
      </div>
      <div class="category-content-area" data-category-area="${cat.key}"></div>
    `;
    main.appendChild(section);
  });

  renderAllCards(DATA);
}

// 指定データでカード群を描画(サブカテゴリーごとにグリッドを分ける)
function renderAllCards(list) {
  CATEGORIES.forEach(cat => {
    const area = document.querySelector(`[data-category-area="${cat.key}"]`);
    if (!area) return;
    area.innerHTML = '';

    const catItems = list.filter(i => i.category === cat.key);

    if (catItems.length === 0) {
      area.innerHTML = `<div class="empty">該当するメニューはありません。</div>`;
      updateCategoryCountDisplay(cat.key, 0);
      return;
    }

    let hasOutput = false;
    cat.subcategories.forEach(sub => {
      const subItems = catItems.filter(i => i.subcategory === sub.key);

      if (subItems.length > 0) {
        hasOutput = true;

        const subGroup = document.createElement('div');
        subGroup.className = 'subcategory-group';

        const subHeader = document.createElement('h3');
        subHeader.className = 'subcategory-title';
        subHeader.textContent = sub.label;
        subGroup.appendChild(subHeader);

        const grid = document.createElement('div');
        grid.className = 'grid';

        subItems.forEach(item => {
          grid.appendChild(createCard(item));
        });
        subGroup.appendChild(grid);

        area.appendChild(subGroup);
      }
    });

    updateCategoryCountDisplay(cat.key, catItems.length);
  });
}

function updateCategoryCountDisplay(catKey, count) {
  const el = document.querySelector(`.category-count[data-category="${catKey}"]`);
  if (el) el.textContent = count ? `${count} メニュー` : '0 メニュー';
}

// カード要素を生成
function createCard(item) {
  const card = document.createElement('article');
  card.className = 'card';
  card.dataset.id = item.id;

  card.innerHTML = `
    <div class="card-head">
      <div style="flex: 1;">
        <h3 class="card-title">${escapeHtml(item.name)}</h3>
        <div class="card-pfc">
          <span class="pfc-item protein">P: ${item.protein}g</span>
          <span class="pfc-item fat">F: ${item.fat}g</span>
          <span class="pfc-item carb">C: ${item.carb}g</span>
          <span class="pfc-item calories">${item.calories}kcal</span>
        </div>
      </div>
      <div>
        <button class="fav-btn" aria-label="お気に入り" data-id="${item.id}">☆</button>
      </div>
    </div>
    <p class="card-desc">${escapeHtml(item.summary)}</p>
    <div class="card-footer">
      <button class="small-btn" data-action="detail" data-id="${item.id}">詳細を見る</button>
    </div>
  `;

  card.addEventListener('click', () => {
    openModal(item.id);
  });

  card.querySelector('.fav-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    const id = e.currentTarget.dataset.id;
    toggleFav(id);
    updateFavUI();
  });

  return card;
}

// モーダルを開く
function openModal(id) {
  const item = DATA.find(d => d.id === id);
  if (!item) return;

  const cat = CATEGORIES.find(x => x.key === item.category);
  const sub = cat ? cat.subcategories.find(s => s.key === item.subcategory) : null;
  const catLabel = cat ? cat.title : item.category;
  const subLabel = sub ? sub.label : '';

  modalBody.innerHTML = `
    <h3 class="modal-title-custom">${escapeHtml(item.name)}</h3>
    <div class="modal-pfc">
      <div class="modal-pfc-item protein">タンパク質: ${item.protein}g</div>
      <div class="modal-pfc-item fat">脂質: ${item.fat}g</div>
      <div class="modal-pfc-item carb">炭水化物: ${item.carb}g</div>
      <div class="modal-pfc-item calories">カロリー: ${item.calories}kcal</div>
    </div>
    
    <div class="description-area">
      <p style="color: #64748b; margin-bottom: 16px;">${escapeHtml(item.summary)}</p>
    </div>

    <div class="detail-block ingredients-block">
      <h4 class="block-heading ingredients-heading">必要な食材</h4>
      <div class="block-content">
        <ul class="ingredients-list">
          ${item.ingredients.map(ing => `<li>${escapeHtml(ing)}</li>`).join('')}
        </ul>
      </div>
    </div>

    <div class="detail-block cooking-block">
      <h4 class="block-heading cooking-heading">調理方法</h4>
      <div class="block-content">
        <div class="cooking-steps">${escapeHtml(item.cooking_method)}</div>
      </div>
    </div>

    <div class="detail-block info-block">
      <h4 class="block-heading info-heading">調理時間</h4>
      <div class="block-content">
        <p>${escapeHtml(item.cooking_time)}</p>
      </div>
    </div>
    
    <div class="modal-footer-controls">
      <button id="modalFavBtn" class="small-btn">☆ お気に入り</button>
      <button id="modalCloseBtn" class="small-btn">閉じる</button>
    </div>
  `;

  document.getElementById('modalFavBtn').addEventListener('click', () => {
    toggleFav(id);
    updateFavUI();
  });
  document.getElementById('modalCloseBtn').addEventListener('click', closeModal);
  modal.setAttribute('aria-hidden', 'false');
  document.getElementById('modalClose').focus();
  updateFavUI();
}

function closeModal() {
  modal.setAttribute('aria-hidden', 'true');
}

// 検索・フィルタ処理
function applySearch() {
  const q = searchInput.value.trim().toLowerCase();
  const category = filterCategory.value;
  const subcategory = filterSubcategory.value;
  const favView = isFavView();

  let list = DATA.slice();

  // 1. お気に入りフィルタ
  if (favView) {
    const favs = getFavorites();
    list = list.filter(i => favs.includes(i.id));
  }

  // 2. キーワードフィルタ
  if (q) {
    list = list.filter(i => {
      const searchText = [
        i.name,
        i.summary,
        i.cooking_method,
        ...i.ingredients
      ].join(' ').toLowerCase();
      return searchText.includes(q);
    });
  }

  // 3. カテゴリーフィルタ
  if (category !== 'all') {
    list = list.filter(i => i.category === category);
  }

  // 4. サブカテゴリーフィルタ
  if (subcategory !== 'all') {
    list = list.filter(i => i.subcategory === subcategory);
  }

  renderAllCards(list);
  updateFavUI();
}

// お気に入りビュー切替
toggleFavView.addEventListener('click', () => {
  const now = isFavView();
  setFavView(!now);
  toggleFavView.textContent = !now ? '全てを表示' : 'お気に入りを表示';
  applySearch();
});

// localStorage
function getFavorites() {
  try { return JSON.parse(localStorage.getItem(FAV_KEY) || '[]'); } catch { return [] }
}
function setFavorites(arr) { localStorage.setItem(FAV_KEY, JSON.stringify(arr)); }
function toggleFav(id) {
  const favs = getFavorites();
  const idx = favs.indexOf(id);
  if (idx === -1) favs.push(id);
  else favs.splice(idx, 1);
  setFavorites(favs);
  showTempMsg('お気に入りを更新しました');
}
function isFavView() { return localStorage.getItem('mp_fav_view') === '1'; }
function setFavView(b) { localStorage.setItem('mp_fav_view', b ? '1' : '0'); }

// UI更新
function updateFavUI() {
  const favs = getFavorites();
  document.querySelectorAll('.fav-btn').forEach(btn => {
    const id = btn.dataset.id;
    const on = favs.includes(id);
    btn.textContent = on ? '★' : '☆';
    btn.classList.toggle('fav-on', on);
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
  });
  const modalFav = document.getElementById('modalFavBtn');
  if (modalFav) {
    const title = modalBody.querySelector('h3')?.textContent || '';
    const item = DATA.find(d => d.name === title);
    if (item) modalFav.textContent = getFavorites().includes(item.id) ? '★ お気に入り' : '☆ お気に入り';
  }
}

// 一時メッセージ
function showTempMsg(text) {
  const el = document.createElement('div');
  el.style.position = 'fixed'; el.style.right = '16px'; el.style.bottom = '20px';
  el.style.background = 'rgba(10,20,40,0.9)'; el.style.color = '#fff'; el.style.padding = '10px 14px';
  el.style.borderRadius = '10px'; el.style.boxShadow = '0 8px 24px rgba(2,6,23,.4)'; el.style.zIndex = 9999;
  el.textContent = text;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1400);
}

// ユーティリティ
function escapeHtml(s) { 
  return String(s).replace(/[&<>'"`]/g, c => ({ 
    '&': '&amp;', '<': '&lt;', '>': '&gt;', 
    '"': '&quot;', "'": '&#39;', '`': '&#96;' 
  }[c])); 
}

// モーダル閉じるイベント
modalClose.addEventListener('click', closeModal);
modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

// 検索デバウンス
function debounce(fn, wait = 200) {
  let t;
  return function (...a) { clearTimeout(t); t = setTimeout(() => fn.apply(this, a), wait); };
}

// 初期化処理
(async function () {
  toggleFavView.textContent = isFavView() ? '全てを表示' : 'お気に入りを表示';

  const success = await loadAllData();

  if (success) {
    initialRender();
    createCategoryJumpList();
    populateFilters();
    updateFavUI();

    searchInput.addEventListener('input', debounce(applySearch, 180));
    filterCategory.addEventListener('change', applySearch);
    filterSubcategory.addEventListener('change', applySearch);

    const hash = window.location.hash;
    if (hash) {
      const key = hash.replace('#', '');
      const targetId = 'category-' + key;
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        const headerHeight = 72;
        const bodyRect = document.body.getBoundingClientRect().top;
        const elRect = targetElement.getBoundingClientRect().top;
        const scrollPosition = elRect - bodyRect - headerHeight - 10;

        setTimeout(() => {
          window.scrollTo({ top: scrollPosition, behavior: 'smooth' });
        }, 100);
      }
    }
  } else {
    main.innerHTML = `<div style="text-align:center; padding: 40px;">メニューデータの読み込みに失敗しました。ファイルパスを確認してください。</div>`;
  }
})();