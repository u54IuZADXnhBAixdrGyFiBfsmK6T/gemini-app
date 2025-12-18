// データを保持するグローバル変数
let DATA = []; 
// 部位ごとのJSONファイル名リスト
const JSON_FILES = [
  'static/json/chest.json', 
  'static/json/shoulder.json', 
  'static/json/back.json', 
  'static/json/arms.json', 
  'static/json/legs.json', 
  'static/json/abs.json'
];

// すべてのJSONファイルを非同期で読み込み、DATAに結合する
async function loadAllData() {
  try {
    const fetchPromises = JSON_FILES.map(file => fetch(file).then(res => {
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status} for ${file}`);
      return res.json();
    }));
    
    // 全てのPromiseが解決するのを待つ
    const allDataArrays = await Promise.all(fetchPromises);
    
    // 配列を結合してDATAに格納
    DATA = allDataArrays.flat(); // .flat()で配列の配列をフラットにする
    
    console.log(`データをロードしました。合計: ${DATA.length} 種目`);
    return true;
  } catch (error) {
    console.error("データのロードに失敗しました:", error);
    // 失敗した場合は処理を続行しないか、空のDATAで初期化
    DATA = [];
    return false;
  }
}

// DOM refs
const main = document.getElementById('main');
const searchInput = document.getElementById('search');
const jumpTo = document.getElementById('jumpTo');
const toggleFavView = document.getElementById('toggleFavView');
const modal = document.getElementById('detailModal');
const modalBody = document.getElementById('modalBody');
const modalClose = document.getElementById('modalClose');

// PARTS定義：ここに zones（サブカテゴリー）を追加
const PARTS = [
  { 
    key: 'chest', title: '胸', subtitle: '',
    zones: [
      { key: 'middle', label: '中部・全体（ベース）' },
      { key: 'upper', label: '上部（鎖骨側）' },
      { key: 'lower', label: '下部（腹側・輪郭）' }
    ]
  },
  { 
    key: 'shoulder', title: '肩', subtitle: '',
    zones: [
      { key: 'overall', label: '全体・プレス系' },
      { key: 'front', label: '前部（フロント）' },
      { key: 'side', label: '中部（サイド）' },
      { key: 'rear', label: '後部（リア）' }
    ]
  },
  { 
    key: 'back', title: '背中', subtitle: '',
    zones: [
      { key: 'width', label: '広背筋（広がり）' },
      { key: 'thickness', label: '僧帽筋・中背部（厚み）' },
      { key: 'low', label: '下背部・全体' }
    ]
  },
  { 
    key: 'arms', title: '腕', subtitle: '',
    zones: [
      { key: 'biceps', label: '上腕二頭筋（力こぶ）' },
      { key: 'triceps', label: '上腕三頭筋（二の腕）' },
      {key: 'forearms', label: '前腕（肘から手首）' }
    ]
  },
  { 
    key: 'legs', title: '足', subtitle: '',
    zones: [
      { key: 'overall', label: '全体・スクワット系' },
      { key: 'quads', label: '大腿四頭筋（前もも）' },
      { key: 'hams', label: 'ハム・臀部（裏もも・尻）' },
      { key: 'calves', label: 'ふくらはぎ' }
    ]
  },
  { 
    key: 'abs', title: '腹', subtitle: '',
    zones: [
      { key: 'front', label: '腹直筋（シックスパック）' },
      { key: 'side', label: '腹斜筋（くびれ・横腹）' },
      { key: 'core', label: '体幹・コア' }
    ]
  }
];

const FAV_KEY = 'tp_favs_v2';

// 初期描画：部位ごとのセクション枠を作る
function initialRender(){
  main.innerHTML = '';
  PARTS.forEach(part=>{
    const section = document.createElement('section');
    section.className = 'part-section';
    section.id = `part-${part.key}`;
    
    // ヘッダー部分
    section.innerHTML = `
      <div class="part-header">
        <div>
          <h2 class="part-title">${part.title}</h2>
          <div class="part-sub">${part.subtitle}</div>
        </div>
        <div class="part-controls">
          <small class="part-count" data-part="${part.key}"></small>
        </div>
      </div>
      <div class="part-content-area" data-part-area="${part.key}"></div>
    `;
    main.appendChild(section);
  });
  
  // カードを描画
  renderAllCards(DATA);
}

// 指定データでカード群を描画（サブカテゴリーごとにグリッドを分ける）
function renderAllCards(list){
  PARTS.forEach(part => {
    // 各部位の表示エリアを取得
    const area = document.querySelector(`[data-part-area="${part.key}"]`);
    if(!area) return;
    area.innerHTML = ''; // 一旦クリア

    // この部位に属するデータを抽出
    const partItems = list.filter(i => i.part === part.key);
    
    // データが無い場合
    if(partItems.length === 0){
      area.innerHTML = `<div class="empty">該当する種目はありません。</div>`;
      // 件数更新（0件）
      updatePartCountDisplay(part.key, 0);
      return;
    }

    // ゾーン（サブカテゴリー）ごとにループして表示
    let hasOutput = false;
    part.zones.forEach(zone => {
      // そのゾーンに該当するアイテム
      const zoneItems = partItems.filter(i => i.target === zone.key);
      
      if(zoneItems.length > 0){
        hasOutput = true;
        
        const zoneGroup = document.createElement('div');
        zoneGroup.className = 'zone-group';

        // 小見出し作成
        const subHeader = document.createElement('h3');
        subHeader.className = 'zone-title';
        subHeader.textContent = zone.label;
        zoneGroup.appendChild(subHeader);

        // グリッド作成
        const grid = document.createElement('div');
        grid.className = 'grid';
        
        zoneItems.forEach(item => {
          grid.appendChild(createCard(item));
        });
        zoneGroup.appendChild(grid);
        
        area.appendChild(zoneGroup);
      }
    });

    // 万が一、ゾーン定義漏れなどで表示されなかったアイテムがある場合（その他）
    // （今回はDATAを完璧に作っているので起きないはずですが、安全策として）
    const handledIds = [];
    part.zones.forEach(z => {
      partItems.filter(i => i.target === z.key).forEach(i => handledIds.push(i.id));
    });
    const others = partItems.filter(i => !handledIds.includes(i.id));
    
    if(others.length > 0){
        const subHeader = document.createElement('h3');
        subHeader.style.fontSize = '0.95rem';
        subHeader.style.margin = '16px 0 8px 4px';
        subHeader.textContent = 'その他';
        area.appendChild(subHeader);
        const grid = document.createElement('div');
        grid.className = 'grid';
        others.forEach(item => grid.appendChild(createCard(item)));
        area.appendChild(grid);
    }

    // 件数更新
    updatePartCountDisplay(part.key, partItems.length);
  });
}

function updatePartCountDisplay(partKey, count){
  const el = document.querySelector(`.part-count[data-part="${partKey}"]`);
  if(el) el.textContent = count ? `${count} 種目` : '0 種目';
}

// カード要素を生成
function createCard(item){
  const card = document.createElement('article');
  card.className = 'card';
  card.dataset.id = item.id;
  card.innerHTML = `
    <div class="card-head">
      <div>
        <h3 class="card-title">${escapeHtml(item.name)}</h3>
        <div class="card-meta">${escapeHtml(item.level)} • ${escapeHtml(item.equipment)}</div>
      </div>
      <div>
        <button class="fav-btn" aria-label="お気に入り" data-id="${item.id}">☆</button>
      </div>
    </div>
    <p class="card-desc">${escapeHtml(item.summary || item.desc)}</p>
    <div class="card-footer">
      <button class="small-btn" data-action="detail" data-id="${item.id}">詳細</button>
      <button class="small-btn" data-action="addprogram" data-id="${item.id}">youtubeで見る</button>
    </div>
  `;
  // ボタンイベント
  card.querySelector('[data-action="detail"]').addEventListener('click', ()=> openModal(item.id));
  card.querySelector('[data-action="addprogram"]').addEventListener('click', ()=> showTempMsg('（ダミー）YouTube動画リンクを追加する処理）'));
  card.querySelector('.fav-btn').addEventListener('click', (e)=> {
    const id = e.currentTarget.dataset.id;
    toggleFav(id);
    updateFavUI();
  });
  return card;
}

// モーダルを開く
// training.js の openModal 関数全体をこのブロックに置き換える
function openModal(id){
  const item = DATA.find(d => d.id === id);
  if(!item) return;

  // 部位表示用のマッピング
  const p = PARTS.find(x => x.key === item.part);
  const z = p ? p.zones.find(z => z.key === item.target) : null;
  const partLabel = p ? p.title : item.part;
  const zoneLabel = z ? z.label : '';

  // --- Start of new logic ---
  // 種目説明を整形する関数
  // 各【キーワード】セクションを detail-block としてグループ化する
  const descHtml = escapeHtml(item.desc);
  let descriptionArray = descHtml.split(/【([^】]+)】/g);
  let formattedDesc = '';

  // 最初のキーワードの前にテキストがあればそれを表示
  if (descriptionArray[0] && descriptionArray[0].trim() !== '') {
    const introSentences = descriptionArray[0].split('\n').filter(s => s.trim() !== '');
    introSentences.forEach(s => {
      formattedDesc += `<p class="desc-text-intro">${s.trim()}</p>`;
    });
  }

  // キーワードと内容をループしてブロックを生成
  for (let i = 1; i < descriptionArray.length; i += 2) {
    const keyword = descriptionArray[i];
    const content = descriptionArray[i + 1];

    if (!keyword) continue;

    let blockClass = 'detail-block';
    let headerClass = 'key-highlight';

    if (keyword === 'フォームの極意') {
      blockClass += ' form-block';
      headerClass += ' key-highlight-form';
    } else if (keyword === '注意点') {
      blockClass += ' caution-block';
      headerClass += ' key-highlight-caution';
    }

    formattedDesc += `<div class="${blockClass}">`;
    formattedDesc += `  <h4 class="${headerClass}">【${keyword}】</h4>`;

    if (content && content.trim() !== '') {
      const sentences = content.split('\n').filter(s => s.trim() !== '');
      formattedDesc += `<div class="block-content">`;
      sentences.forEach(s => {
        formattedDesc += `<p>${s.trim()}</p>`;
      });
      formattedDesc += `</div>`;
    }
    
    formattedDesc += `</div>`;
  }
  // --- End of new logic ---

  modalBody.innerHTML = `
    <h3 class="modal-title-custom">${escapeHtml(item.name)}</h3>
    <div class="meta-list">
      <div class="meta-item">${partLabel}${zoneLabel ? ` (${zoneLabel})` : ''}</div>
      <div class="meta-item">${escapeHtml(item.level)}</div>
      <div class="meta-item">${escapeHtml(item.equipment)}</div>
    </div>
    
    <div class="description-area">
      ${formattedDesc}
    </div>

    <div class="detail-block practice-block">
      <h4 class="practice-heading key-highlight">実践例（目安）</h4>
      <div class="block-content">
        <p>${escapeHtml(item.practice)}</p>
      </div>
    </div>
    
    <div class="modal-footer-controls">
      <button id="modalFavBtn" class="small-btn">☆ お気に入り</button>
      <button id="modalCloseBtn" class="small-btn">閉じる</button>
    </div>
  `;
  document.getElementById('modalFavBtn').addEventListener('click', ()=>{
    toggleFav(id);
    updateFavUI();
  });
  document.getElementById('modalCloseBtn').addEventListener('click', closeModal);
  modal.setAttribute('aria-hidden','false');
  document.getElementById('modalClose').focus();
  updateFavUI();
}

// モーダルを閉じる関数（前回の修正で削除された可能性あり）
function closeModal(){ 
  modal.setAttribute('aria-hidden','true'); 
}

// 検索・フィルタ処理 (applySearch) を再定義/再配置
function applySearch(){
  const q = searchInput.value.trim().toLowerCase();
  const favView = isFavView();
  let list = DATA.slice();
  if(favView){
    const favs = getFavorites();
    list = list.filter(i => favs.includes(i.id));
  }
  if(q){
    list = list.filter(i => {
      return (i.name + ' ' + i.desc + ' ' + i.equipment + ' ' + i.practice).toLowerCase().includes(q);
    });
  }
  renderAllCards(list);
  updateFavUI();
}

// 部位へジャンプ
jumpTo.addEventListener('change', ()=> {
  const v = jumpTo.value;
  if(v === 'all'){
    window.scrollTo({ top: 0, behavior: 'smooth' });
    applySearch();
    return;
  }
  const el = document.getElementById(`part-${v}`);
  if(el){
    const headerHeight = 72;
    const bodyRect = document.body.getBoundingClientRect().top;
    const elRect = el.getBoundingClientRect().top;
    // 20pxほど余裕を持たせてスクロール
    const scrollPosition = elRect - bodyRect - headerHeight - 20; 
    window.scrollTo({ top: scrollPosition, behavior: 'smooth' });
  }
});

// お気に入りビュー切替
toggleFavView.addEventListener('click', ()=> {
  const now = isFavView();
  setFavView(!now);
  toggleFavView.textContent = !now ? '全てを表示' : 'お気に入りを表示';
  applySearch();
});

// localStorage
function getFavorites(){
  try{ return JSON.parse(localStorage.getItem(FAV_KEY) || '[]'); } catch { return [] }
}
function setFavorites(arr){ localStorage.setItem(FAV_KEY, JSON.stringify(arr)); }
function toggleFav(id){
  const favs = getFavorites();
  const idx = favs.indexOf(id);
  if(idx === -1) favs.push(id);
  else favs.splice(idx,1);
  setFavorites(favs);
  showTempMsg('お気に入りを更新しました');
}
function isFavView(){ return localStorage.getItem('tp_fav_view') === '1'; }
function setFavView(b){ localStorage.setItem('tp_fav_view', b ? '1' : '0'); }

// UI更新
function updateFavUI(){
  const favs = getFavorites();
  document.querySelectorAll('.fav-btn').forEach(btn=>{
    const id = btn.dataset.id;
    const on = favs.includes(id);
    btn.textContent = on ? '★' : '☆';
    btn.classList.toggle('fav-on', on);
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
  });
  const modalFav = document.getElementById('modalFavBtn');
  if(modalFav){
    const title = modalBody.querySelector('h3')?.textContent || '';
    const item = DATA.find(d => d.name === title);
    if(item) modalFav.textContent = getFavorites().includes(item.id) ? '★ お気に入り' : '☆ お気に入り';
  }
}

// 一時メッセージ
function showTempMsg(text){
  const el = document.createElement('div');
  el.style.position='fixed'; el.style.right='16px'; el.style.bottom='20px';
  el.style.background='rgba(10,20,40,0.9)'; el.style.color='#fff'; el.style.padding='10px 14px';
  el.style.borderRadius='10px'; el.style.boxShadow='0 8px 24px rgba(2,6,23,.4)'; el.style.zIndex=9999;
  el.textContent = text;
  document.body.appendChild(el);
  setTimeout(()=> el.remove(),1400);
}

// ユーティリティ
function escapeHtml(s){ return String(s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

// モーダル閉じるイベント
modalClose.addEventListener('click', closeModal);
modal.addEventListener('click', (e)=> { if(e.target === modal) closeModal(); });
document.addEventListener('keydown', (e)=> { if(e.key === 'Escape') closeModal(); });

// 検索デバウンス
function debounce(fn, wait=200){
  let t;
  return function(...a){ clearTimeout(t); t = setTimeout(()=> fn.apply(this,a), wait); };
}
searchInput.addEventListener('input', debounce(applySearch, 180));


// 初期化
(async function(){ // 変更点: async を追加
  toggleFavView.textContent = isFavView() ? '全てを表示' : 'お気に入りを表示';
  
  // 変更点: loadAllDataを await で呼び出す
  const success = await loadAllData(); 
  
  if(success) {
    initialRender();
    updateFavUI();
    
    // URLハッシュスクロール
    const hash = window.location.hash; 
    if(hash) {
      const key = hash.replace('#', '');
      const targetId = 'part-' + key;
      const targetElement = document.getElementById(targetId);
      if(targetElement) {
        // CSSの scroll-margin-top が効かないブラウザ向けに、JavaScriptでスクロールを調整
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
      // ロード失敗時のエラー表示など
      main.innerHTML = `<div style="text-align:center; padding: 40px;">トレーニングデータの読み込みに失敗しました。ファイルパスを確認してください。</div>`;
  }
})(); // 変更点: 自己実行関数を閉じる