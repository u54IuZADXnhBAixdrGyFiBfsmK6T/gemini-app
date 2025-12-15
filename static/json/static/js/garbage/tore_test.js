// data: 部位ごとに種目と説明、大まかな実践例を用意
const DATA = [
  // chest
  {
    id: "ch-01", part: "chest", name: "バーベルベンチプレス", equipment: "バーベル", level: "中級",
    desc: "大胸筋の総合的な筋力向上に最もポピュラー。肩甲骨を寄せて胸を張る。",
    practice: "ウォームアップ 2セット→メイン 6-8回×3-5セット(高重量)/レスト90~150秒。フォーム重視で胸で押す感覚を保つ。"
  },
  {
    id: "ch-02", part: "chest", name: "インクラインダンベルプレス", equipment: "ダンベル", level: "中級",
    desc: "上部大胸筋を強化。角度は30~45度が目安。",
    practice: "8-12回×3セット。ダンベルは左右独立でコアの安定も意識。"
  },
  {
    id: "ch-03", part: "chest", name: "デクラインベンチプレス", equipment: "バーベル", level: "上級",
    desc: "下部大胸筋を重点的に刺激。腰や肩の負担に注意。",
    practice: "6-10回×3セット。補助があると安全。"
  },
  {
    id: "ch-04", part: "chest", name: "ダンベルフライ", equipment: "ダンベル", level: "初中級",
    desc: "胸をストレッチさせて外側を効かせる。",
    practice: "10-15回×3セット。肘は軽く曲げ、高重量での反動は禁止。"
  },
  {
    id: "ch-05", part: "chest", name: "ケーブルクロスオーバー", equipment: "ケーブル", level: "初中級",
    desc: "収縮を感じやすく、フィニッシャーに最適。",
    practice: "12-20回×3セット。収縮で胸を締める意識。"
  },
  {
    id: "ch-06", part: "chest", name: "プッシュアップ(腕立て伏せ)", equipment: "自重", level: "初級",
    desc: "器具不要で胸・三頭を負荷。バリエーション多数。",
    practice: "15-30回×3セット(筋持久向上)/足上げやハンズで負荷調整。"
  },
  {
    id: "ch-07", part: "chest", name: "ダンベルプルオーバー", equipment: "ダンベル", level: "中級",
    desc: "胸と広背筋のつながりを使い、胸郭の拡張にも寄与。",
    practice: "10-12回×3セット。胸の伸長と収縮を意識。"
  },
  {
    id: "ch-08", part: "chest", name: "ペックデックフライ", equipment: "マシン", level: "初中級",
    desc: "フォームが安定しやすいフライ系マシン。",
    practice: "10-15回×3セット。収縮を感じてゆっくり戻す。"
  },
  {
    id: "ch-09", part: "chest", target: "middle", name: "スミスマシンベンチプレス", equipment: "スミスマシン", level: "初中級",
    desc: "軌道が固定され、安全に高重量を扱える。プレス動作に集中しやすい。",
    practice: "8–12回×3–4セット。ラックアップ時に胸を張る意識を維持。"
  },
  {
    id: "ch-10", part: "chest", target: "upper", name: "ケーブルアッパーチェストフライ", equipment: "ケーブル", level: "中級",
    desc: "下から上にケーブルを引き上げ、上部大胸筋を集中して収縮させる。",
    practice: "12–15回×3セット。フィニッシュで胸上部をしっかり絞る。"
  },
  {
    id: "ch-11", part: "chest", target: "lower", name: "ディップス（チェスト）", equipment: "ディップス台/自重", level: "中級",
    desc: "上半身を前傾させて行うことで、大胸筋下部に強い刺激を与える。",
    practice: "8–12回×3セット。難しい場合はアシストを付ける。"
  },

  // shoulder
  {
    id: "sh-01", part: "shoulder", name: "ショルダープレス(バーベル/ダンベル)", equipment: "バーベル/ダンベル", level: "中級",
    desc: "三角筋を全体的に鍛えるビッグムーブ。腰を反らないように注意。",
    practice: "6-10回×3-4セット。体幹と肩甲骨の安定を重視。"
  },
  {
    id: "sh-02", part: "shoulder", name: "サイドレイズ", equipment: "ダンベル", level: "初級",
    desc: "三角筋中部をターゲット。軽重量でフォーム重視。",
    practice: "12-20回×3セット。反動を使わない。"
  },
  {
    id: "sh-03", part: "shoulder", name: "フロントレイズ", equipment: "ダンベル/プレート", level: "初級",
    desc: "三角筋前部を刺激。プレスの補助にも。",
    practice: "10-15回×3セット。肩甲骨の位置を固定して動作。"
  },
  {
    id: "sh-04", part: "shoulder", name: "リアレイズ(ベントオーバー)", equipment: "ダンベル", level: "中級",
    desc: "肩後部(後部三角筋)を鍛える。姿勢保持が重要。",
    practice: "12-15回×3セット。上背部の収縮を感じる。"
  },
  {
    id: "sh-05", part: "shoulder", name: "アーノルドプレス", equipment: "ダンベル", level: "中級",
    desc: "回旋動作を含むため可動域が広く効きやすい。",
    practice: "8-12回×3セット。コントロールを優先。"
  },
  {
    id: "sh-06", part: "shoulder", name: "フェイスプル", equipment: "ケーブル", level: "中級",
    desc: "肩後部と肩甲骨周りの安定に有効。姿勢改善にも貢献。",
    practice: "12-20回×3セット。肘を高めに引く。"
  },
  {
    id: "sh-07", part: "shoulder", name: "シュラッグ", equipment: "バーベル/ダンベル", level: "初中級",
    desc: "僧帽筋上部を強化。動作はシンプルだが重量管理重要。",
    practice: "8-15回×3セット。肩を引き上げ、コントロールして降ろす。"
  },
  {
    id: "sh-08", part: "shoulder", name: "ケーブルリアデルトフライ", equipment: "ケーブル", level: "中級",
    desc: "後部三角筋を狙った安定した刺激。",
    practice: "12-18回×3セット。上半身のブレを抑える。"
  },
  {
    id: "sh-09", part: "shoulder", target: "side", name: "アップライトロー", equipment: "バーベル/ケーブル", level: "中級",
    desc: "三角筋中部と僧帽筋上部を強化。肩への負担軽減のため、肘を肩より高く上げすぎない。",
    practice: "10–15回×3セット。バーを顎の高さまで引く。"
  },
  {
    id: "sh-10", part: "shoulder", target: "front", name: "ダンベルフロントプレス", equipment: "ダンベル", level: "中級",
    desc: "三角筋前部をターゲット。ダンベルを水平に保持し、コントロールして押し上げる。",
    practice: "8–12回×3セット。三角筋前部の収縮を感じる。"
  },
  {
    id: "sh-11", part: "shoulder", target: "rear", name: "ライイング・リアレイズ", equipment: "ダンベル", level: "中級",
    desc: "ベンチにうつ伏せになり、体幹を固定して後部三角筋を単独で追い込む。",
    practice: "12–15回×3セット。小指側から上げる意識。"
  },

  // back
  {
    id: "ba-01", part: "back", name: "デッドリフト", equipment: "バーベル", level: "上級",
    desc: "全身性のハイパワー種目。背中・臀部・ハムに強い刺激。",
    practice: "3-6回×3-5セット(高重量)/フォーム徹底。"
  },
  {
    id: "ba-02", part: "back", name: "チンニング(懸垂)", equipment: "自重/バー", level: "中級",
    desc: "広背筋を中心に上背部の厚みを作る。",
    practice: "できる回数で3-5セット。ネガティブやアシストで調整。"
  },
  {
    id: "ba-03", part: "back", name: "ラットプルダウン", equipment: "マシン", level: "初中級",
    desc: "懸垂が難しい場合の代替。フォームの意識が重要。",
    practice: "8-12回×3セット。肘を下に引くイメージ。"
  },
  {
    id: "ba-04", part: "back", name: "バーベルローイング", equipment: "バーベル", level: "中級",
    desc: "中背部に負荷を与える引き種目。腰の角度に注意。",
    practice: "6-10回×3セット。肩甲骨を寄せる感覚で。"
  },
  {
    id: "ba-05", part: "back", name: "ワンアームダンベルロー", equipment: "ダンベル", level: "中級",
    desc: "左右のバランスと可動域を改善。",
    practice: "8-12回×3セット(片側ずつ)。コアで姿勢を支える。"
  },
  {
    id: "ba-06", part: "back", name: "Tバーロー", equipment: "Tバー", level: "中級",
    desc: "厚み付けに効果的な引き種目。",
    practice: "6-10回×3セット。胸を張り引く。"
  },
  {
    id: "ba-07", part: "back", name: "シーテッドロー(ケーブル)", equipment: "ケーブル", level: "中級",
    desc: "肩甲骨の収縮を意識しやすい。",
    practice: "8-12回×3セット。引き切ってキープすると効果大。"
  },
  {
    id: "ba-08", part: "back", name: "プルオーバー(ケーブル/ダンベル)", equipment: "ダンベル/ケーブル", level: "初中級",
    desc: "胸と背中の両方に効く補助種目。",
    practice: "10-15回×3セット。胸郭を引き伸ばす感覚。"
  },
  {
    id: "ba-09", part: "back", name: "ルーマニアンデッドリフト", equipment: "バーベル", level: "中級",
    desc: "ハムと下背部を狙う背面種目。",
    practice: "6-12回×3セット。背筋を伸ばしたまま股関節で折る。"
  },
  {
    id: "ba-10", part: "back", target: "width", name: "パラレルグリッププルダウン", equipment: "マシン", level: "中級",
    desc: "手のひらを向き合わせたグリップで、広背筋の下部・外側への刺激を高める。",
    practice: "8–12回×3セット。胸を張り、肘を下方に引き切る。"
  },
  {
    id: "ba-11", part: "back", target: "thickness", name: "ハーフデッドリフト", equipment: "バーベル", level: "上級",
    desc: "高重量を扱いやすく、上背部（僧帽筋・広背筋上部）の厚みを作るのに特化。",
    practice: "5–8回×3セット。腰を丸めずに引く。"
  },
  {
    id: "ba-12", part: "back", target: "thickness", name: "ダンベルシュラッグ", equipment: "ダンベル", level: "初中級",
    desc: "僧帽筋上部を強化。バーベルよりも可動域を大きく取れる。",
    practice: "10–15回×3セット。肩を真上に持ち上げ、ゆっくり戻す。"
  },
  {
    id: "ba-13", part: "back", target: "width", name: "ストレートアームプルダウン", equipment: "ケーブル", level: "初級",
    desc: "肘を曲げず、広背筋の収縮のみでウェイトを引くアイソレーション種目。",
    practice: "12–18回×3セット。背中のストレッチを意識。"
  },

  // arms (biceps/triceps)
  {
    id: "ar-01", part: "arms", name: "バーベルカール", equipment: "バーベル", level: "初中級",
    desc: "二頭筋の基本。肘を動かさずに巻き上げる。",
    practice: "8-12回×3セット。反動を抑える。"
  },
  {
    id: "ar-02", part: "arms", name: "ダンベルハンマーカール", equipment: "ダンベル", level: "初中級",
    desc: "腕橈骨筋と二頭短頭を両方刺激。",
    practice: "10-12回×3セット。中間位で握る。"
  },
  {
    id: "ar-03", part: "arms", name: "プリーチャーカール", equipment: "プリーチャー台/バーベル", level: "中級",
    desc: "上腕二頭筋のアイソレーションに最適。",
    practice: "8-12回×3セット。フォームで収縮を最大化。"
  },
  {
    id: "ar-04", part: "arms", name: "ケーブルカール", equipment: "ケーブル", level: "初中級",
    desc: "テンションが一定で収縮を感じやすい。",
    practice: "12-15回×3セット。ゆっくり戻す。"
  },
  {
    id: "ar-05", part: "arms", name: "トライセプスプレスダウン", equipment: "ケーブル", level: "初中級",
    desc: "三頭筋のベーシック。肘を固定して押し下げる。",
    practice: "10-15回×3セット。肩を使わない。"
  },
  {
    id: "ar-06", part: "arms", name: "ダンベルキックバック", equipment: "ダンベル", level: "中級",
    desc: "三頭筋のアイソレーション。肘を伸ばし切る。",
    practice: "10-15回×3セット。上体を安定させる。"
  },
  {
    id: "ar-07", part: "arms", name: "ナローベンチプレス", equipment: "バーベル", level: "中級",
    desc: "胸寄りの三頭筋と上腕三頭筋を同時に使う。",
    practice: "6-10回×3セット。肩の負荷に注意。"
  },
  {
    id: "ar-08", part: "arms", name: "ライイングトライセプスエクステンション(スカルクラッシャー)", equipment: "バーベル/ダンベル", level: "中級",
    desc: "三頭筋長頭を強く刺激。",
    practice: "8-12回×3セット。肘の位置を固定。"
  },
  {
    id: "ar-09", part: "arms", target: "biceps", name: "コンセントレーションカール", equipment: "ダンベル", level: "中級",
    desc: "肘を固定することで、二頭筋を単独で最大限に収縮させる。",
    practice: "8–12回×3セット（片側）。ネガティブ動作を意識。"
  },
  {
    id: "ar-10", part: "arms", target: "triceps", name: "オーバーヘッドトライセプスエクステンション", equipment: "ダンベル/ケーブル", level: "中級",
    desc: "三頭筋の長頭（上腕の裏側、付け根部分）を強くストレッチし、太くする。",
    practice: "10–15回×3セット。肘を頭の横に固定。"
  },
  {
    id: "ar-11", part: "arms", target: "biceps", name: "リバースカール", equipment: "バーベル/EZバー", level: "初中級",
    desc: "順手（オーバーハンド）で行い、主に前腕（腕の表側）と上腕二頭筋を鍛える。",
    practice: "10–15回×3セット。手首を過度に曲げない。"
  },

  // legs
  {
    id: "le-01", part: "legs", name: "バックスクワット", equipment: "バーベル", level: "中級",
    desc: "下半身の基本。深さと膝軌道に注意。",
    practice: "5-8回×3-5セット(強度高め)/フォーム第一。"
  },
  {
    id: "le-02", part: "legs", name: "フロントスクワット", equipment: "バーベル", level: "中級",
    desc: "大腿四頭筋により直接的に効かせられる。",
    practice: "6-10回×3セット。体幹の保持が鍵。"
  },
  {
    id: "le-03", part: "legs", name: "レッグプレス", equipment: "マシン", level: "初中級",
    desc: "スクワットの代替、プレートで負荷調整が楽。",
    practice: "8-15回×3セット。膝の位置に注意。"
  },
  {
    id: "le-04", part: "legs", name: "ブルガリアンスクワット", equipment: "ダンベル", level: "中級",
    desc: "片脚ずつ負荷をかけることで左右差を改善。",
    practice: "8-12回×3セット(片側)。バランス重視。"
  },
  {
    id: "le-05", part: "legs", name: "ルーマニアンデッドリフト", equipment: "バーベル", level: "中級",
    desc: "ハムと臀部をターゲットにしたヒンジ動作。",
    practice: "6-12回×3セット。膝は軽く曲げる。"
  },
  {
    id: "le-06", part: "legs", name: "レッグエクステンション", equipment: "マシン", level: "初級",
    desc: "大腿四頭筋のアイソレーション。",
    practice: "12-15回×3セット。膝の負担に注意。"
  },
  {
    id: "le-07", part: "legs", name: "レッグカール", equipment: "マシン", level: "初級",
    desc: "ハムストリングを集中して鍛える。",
    practice: "10-15回×3セット。ゆっくり戻す。"
  },
  {
    id: "le-08", part: "legs", name: "カーフレイズ", equipment: "自重/マシン", level: "初級",
    desc: "ふくらはぎの強化。反動を抑えること。",
    practice: "15-25回×3セット。フルレンジ。"
  },
  {
    id: "le-09", part: "legs", name: "ヒップスラスト", equipment: "バーベル", level: "中級",
    desc: "臀部の筋肥大に極めて有効。",
    practice: "8-12回×3セット。腰を過伸展しない。"
  },
  {
    id: "le-10", part: "legs", name: "ハックスクワット", equipment: "マシン", level: "中級",
    desc: "四頭筋の強化に向くマシン種目。",
    practice: "8-12回×3セット。足幅と深さを調整。"
  },
  {
    id: "le-12", part: "legs", target: "quads", name: "ランジ", equipment: "自重/ダンベル", level: "初中級",
    desc: "片脚ずつ行うため、左右差の改善や体幹安定能力も向上する。",
    practice: "10–12回×3セット（片側）。前膝が足首より前に出ないように注意。"
  },
  {
    id: "le-13", part: "legs", target: "calves", name: "シーテッドカーフレイズ", equipment: "マシン", level: "初級",
    desc: "座って行うことで、ヒラメ筋（下腿の横幅）をメインに強化する。",
    practice: "15–25回×3セット。最大伸展と収縮を意識。"
  },

  // abs
  {
    id: "ab-01", part: "abs", name: "クランチ", equipment: "自重", level: "初級",
    desc: "腹直筋上部の基本的収縮種目。",
    practice: "15-25回×3セット。首を無理に引かない。"
  },
  {
    id: "ab-02", part: "abs", name: "レッグレイズ", equipment: "自重", level: "中級",
    desc: "下腹部への高負荷。腰を浮かせないこと。",
    practice: "10-20回×3セット。腹筋の収縮を意識。"
  },
  {
    id: "ab-03", part: "abs", name: "プランク", equipment: "自重", level: "初級",
    desc: "コアの等尺性トレーニング。姿勢維持に有効。",
    practice: "30-90秒×3セット。フォーム維持が最重要。"
  },
  {
    id: "ab-04", part: "abs", name: "アブローラー", equipment: "器具", level: "中級",
    desc: "腹直筋と体幹を強烈に刺激する。",
    practice: "8-15回×3セット。腰を落とさない。"
  },
  {
    id: "ab-05", part: "abs", name: "ロシアンツイスト", equipment: "自重/プレート", level: "初中級",
    desc: "胸と体幹の回旋系を鍛える。",
    practice: "20回(左右合計)×3セット。腰を過度に捻らない。"
  },
  {
    id: "ab-06", part: "abs", target: "front", name: "ハンギングレッグレイズ", equipment: "鉄棒/器具", level: "上級",
    desc: "ぶら下がりながら行う最難関の腹筋種目。下腹部への刺激が極めて高い。",
    practice: "できる回数で3セット。膝を曲げて行うと負荷を軽減できる。"
  },
  {
    id: "ab-07", part: "abs", target: "side", name: "サイドプランク", equipment: "自重", level: "初級",
    desc: "横向きで行う体幹種目。腹斜筋や側面の安定性を高める。",
    practice: "30–60秒キープ×3セット（片側）。腰が落ちないよう一直線を維持。"
  },
];

// DOM refs
const main = document.getElementById('main');
const searchInput = document.getElementById('search');
const jumpTo = document.getElementById('jumpTo');
const toggleFavView = document.getElementById('toggleFavView');
const modal = document.getElementById('detailModal');
const modalBody = document.getElementById('modalBody');
const modalClose = document.getElementById('modalClose');

const PARTS = [
  { key: 'chest', title: '胸', subtitle: '大胸筋を中心に押す動作' },
  { key: 'shoulder', title: '肩', subtitle: '三角筋(前・中・後)を分けて鍛える' },
  { key: 'back', title: '背中', subtitle: '引く動作で厚みと幅を作る' },
  { key: 'arms', title: '腕', subtitle: '上腕二頭・三頭を分離して強化' },
  { key: 'legs', title: '足', subtitle: '下半身の基本と補助種目' },
  { key: 'abs', title: '腹', subtitle: '体幹と姿勢保持を強化' }
];

const FAV_KEY = 'tp_favs_v2';

// 初期描画:部位ごとのセクションを作り、全カードを表示
function initialRender() {
  main.innerHTML = '';
  PARTS.forEach(part => {
    const section = document.createElement('section');
    section.className = 'part-section';
    section.id = `part-${part.key}`;
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
      <div class="grid" data-part-grid="${part.key}"></div>
    `;
    main.appendChild(section);
  });
  renderAllCards(DATA);
  updatePartCounts();
}

// 指定データでカード群を描画(部位ごとにグリッドへ)
function renderAllCards(list) {
  // 空のグリッドをクリア
  document.querySelectorAll('[data-part-grid]').forEach(g => g.innerHTML = '');
  // 部位ごとにカードを追加
  PARTS.forEach(part => {
    const grid = document.querySelector(`[data-part-grid="${part.key}"]`);
    const items = list.filter(i => i.part === part.key);
    if (items.length === 0) {
      grid.innerHTML = `<div class="empty">該当する種目はありません。</div>`;
      return;
    }
    items.forEach(item => grid.appendChild(createCard(item)));
  });
}

// カード要素を生成
function createCard(item) {
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
    <p class="card-desc">${escapeHtml(item.desc)}</p>
    <div class="card-footer">
      <button class="small-btn" data-action="detail" data-id="${item.id}">詳細</button>
      <button class="small-btn" data-action="addprogram" data-id="${item.id}">プログラムに追加</button>
    </div>
  `;
  // ボタンイベント
  card.querySelector('[data-action="detail"]').addEventListener('click', () => openModal(item.id));
  card.querySelector('[data-action="addprogram"]').addEventListener('click', () => showTempMsg('(ダミー)プログラムに追加しました'));
  card.querySelector('.fav-btn').addEventListener('click', (e) => {
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
  modalBody.innerHTML = `
    <h3 style="margin:0 0 6px">${escapeHtml(item.name)}</h3>
    <div class="meta-list">
      <div class="meta-item">${mapPart(item.part)}</div>
      <div class="meta-item">${escapeHtml(item.level)}</div>
      <div class="meta-item">${escapeHtml(item.equipment)}</div>
    </div>
    <p class="hint">${escapeHtml(item.desc)}</p>
    <hr class="soft" />
    <h4 style="margin:6px 0">実践例(目安)</h4>
    <p class="hint">${escapeHtml(item.practice)}</p>
    <div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap">
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
  // フォーカス簡易管理
  document.getElementById('modalClose').focus();
  updateFavUI();
}
function closeModal() { modal.setAttribute('aria-hidden', 'true'); }

// 検索・フィルタ処理(検索文字列が空なら全表示)
function applySearch() {
  const q = searchInput.value.trim().toLowerCase();
  const favView = isFavView();
  let list = DATA.slice();
  if (favView) {
    const favs = getFavorites();
    list = list.filter(i => favs.includes(i.id));
  }
  if (q) {
    list = list.filter(i => {
      return (i.name + ' ' + i.desc + ' ' + i.equipment + ' ' + i.practice).toLowerCase().includes(q);
    });
  }
  // 部位ごとに再描画(空の部位は empty 表示)
  renderAllCards(list);
  updatePartCounts(list);
  updateFavUI();
}

// 部位へジャンプ(選択するとそのセクションにスクロール)
jumpTo.addEventListener('change', () => {
  const v = jumpTo.value;
  if (v === 'all') {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // 全て表示状態;検索はそのまま維持
    applySearch();
    return;
  }
  const el = document.getElementById(`part-${v}`);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
});

// お気に入りビュー切替
toggleFavView.addEventListener('click', () => {
  const now = isFavView();
  setFavView(!now);
  toggleFavView.textContent = !now ? '全てを表示' : 'お気に入りを表示';
  applySearch();
});

// favorites: localStorage 管理
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
function isFavView() { return localStorage.getItem('tp_fav_view') === '1'; }
function setFavView(b) { localStorage.setItem('tp_fav_view', b ? '1' : '0'); }

// UI 更新:カードの☆表示を更新&モーダル内ボタン
function updateFavUI() {
  const favs = getFavorites();
  document.querySelectorAll('.fav-btn').forEach(btn => {
    const id = btn.dataset.id;
    const on = favs.includes(id);
    btn.textContent = on ? '★' : '☆';
    btn.classList.toggle('fav-on', on);
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
  });
  // モーダル内ボタン
  const modalFav = document.getElementById('modalFavBtn');
  if (modalFav) {
    const title = modalBody.querySelector('h3')?.textContent || '';
    const item = DATA.find(d => d.name === title);
    if (item) modalFav.textContent = getFavorites().includes(item.id) ? '★ お気に入り' : '☆ お気に入り';
  }
}

// 部位ごとの件数を更新(フィルタ後の件数表示)
function updatePartCounts(filteredList) {
  const list = filteredList || DATA;
  PARTS.forEach(p => {
    const cnt = list.filter(i => i.part === p.key).length;
    const el = document.querySelector(`.part-count[data-part="${p.key}"]`);
    if (el) el.textContent = cnt ? `${cnt} 種目` : '0 種目';
  });
}

// シンプルな一時メッセージ
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
function escapeHtml(s) { return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
function mapPart(key) { const p = PARTS.find(x => x.key === key); return p ? p.title : key; }

// モーダルの閉じるボタン
modalClose.addEventListener('click', closeModal);
modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

// 検索イベント(デバウンス)
function debounce(fn, wait = 200) {
  let t;
  return function (...a) { clearTimeout(t); t = setTimeout(() => fn.apply(this, a), wait); };
}
searchInput.addEventListener('input', debounce(applySearch, 180));

// 初期化
(function () {
  // 初期ビュー設定ボタン文字列
  toggleFavView.textContent = isFavView() ? '全てを表示' : 'お気に入りを表示';
  initialRender();
  updateFavUI();


  //以下がai作成コード
  const hash = window.location.hash; // 例: "#chest"
  if (hash) {
    // "#chest" から "#" を取り除いて "chest" にする
    const key = hash.replace('#', '');

    // 生成されたIDは "part-chest" の形式なので、それに合わせる
    const targetId = 'part-' + key;
    const targetElement = document.getElementById(targetId);

    if (targetElement) {
      // 描画直後だと動作が不安定な場合があるため、わずかに遅らせてスクロール実行
      setTimeout(() => {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }
})();
