// data: 部位(part)に加え、ターゲット(target)を追加して細分化
const DATA = [
  // --- CHEST (胸) ---
  { id: "ch-01", part:"chest", target:"middle", name:"バーベルベンチプレス", equipment:"バーベル", level:"中級",
    desc:"大胸筋の総合的な筋力向上に最もポピュラー。肩甲骨を寄せて胸を張る。", 
    practice:"ウォームアップ 2セット→メイン 6–8回×3–5セット（高重量）"},
  { id: "ch-02", part:"chest", target:"upper", name:"インクラインダンベルプレス", equipment:"ダンベル", level:"中級",
    desc:"上部大胸筋を強化。角度は30〜45度が目安。", 
    practice:"8–12回×3セット。ダンベルは左右独立でコアの安定も意識。"},
  { id: "ch-03", part:"chest", target:"lower", name:"デクラインベンチプレス", equipment:"バーベル", level:"上級",
    desc:"下部大胸筋を重点的に刺激。腰や肩の負担に注意。", 
    practice:"6–10回×3セット。補助があると安全。"},
  { id: "ch-04", part:"chest", target:"middle", name:"ダンベルフライ", equipment:"ダンベル", level:"初中級",
    desc:"胸をストレッチさせて外側を効かせる。", 
    practice:"10–15回×3セット。肘は軽く曲げ、高重量での反動は禁止。"},
  { id: "ch-05", part:"chest", target:"lower", name:"ケーブルクロスオーバー", equipment:"ケーブル", level:"初中級",
    desc:"収縮を感じやすく、フィニッシャーに最適。下部・内側狙い。", 
    practice:"12–20回×3セット。収縮で胸を締める意識。"},
  { id: "ch-06", part:"chest", target:"middle", name:"プッシュアップ（腕立て伏せ）", equipment:"自重", level:"初級",
    desc:"器具不要で胸・三頭を負荷。バリエーション多数。", 
    practice:"15–30回×3セット（筋持久向上）。"},
  { id: "ch-07", part:"chest", target:"upper", name:"ダンベルプルオーバー", equipment:"ダンベル", level:"中級",
    desc:"胸と広背筋のつながりを使い、胸郭の拡張にも寄与。", 
    practice:"10–12回×3セット。胸の伸長と収縮を意識。"},
  { id: "ch-08", part:"chest", target:"middle", name:"ペックデックフライ", equipment:"マシン", level:"初中級",
    desc:"フォームが安定しやすいフライ系マシン。", 
    practice:"10–15回×3セット。収縮を感じてゆっくり戻す。"},
    { id: "ch-09", part:"chest", target:"middle", name:"スミスマシンベンチプレス", equipment:"スミスマシン", level:"初中級",
    desc:"軌道が固定され、安全に高重量を扱える。プレス動作に集中しやすい。", 
    practice:"8–12回×3–4セット。ラックアップ時に胸を張る意識を維持。"},
  { id: "ch-10", part:"chest", target:"upper", name:"ケーブルアッパーチェストフライ", equipment:"ケーブル", level:"中級",
    desc:"下から上にケーブルを引き上げ、上部大胸筋を集中して収縮させる。", 
    practice:"12–15回×3セット。フィニッシュで胸上部をしっかり絞る。"},
  { id: "ch-11", part:"chest", target:"lower", name:"ディップス（チェスト）", equipment:"ディップス台/自重", level:"中級",
    desc:"上半身を前傾させて行うことで、大胸筋下部に強い刺激を与える。", 
    practice:"8–12回×3セット。難しい場合はアシストを付ける。"},

  // --- SHOULDER (肩) ---
  { id: "sh-01", part:"shoulder", target:"overall", name:"ショルダープレス", equipment:"バーベル/ダンベル", level:"中級",
    desc:"三角筋全体（特に前部・中部）を鍛えるビッグムーブ。", 
    practice:"6–10回×3–4セット。体幹と肩甲骨の安定を重視。"},
  { id: "sh-02", part:"shoulder", target:"side", name:"サイドレイズ", equipment:"ダンベル", level:"初級",
    desc:"三角筋中部をターゲット。肩幅を作る。", 
    practice:"12–15回×3セット。反動を使わない。"},
  { id: "sh-10", part:"shoulder", target:"side", name:"ケーブルサイドレイズ", equipment:"ケーブル", level:"初級",
    desc:"サイドレイズに近いが、ケーブルを使用することにより負荷が抜けづらく、三角筋中部に持続的な刺激を与える。", 
    practice:"10–15回×3セット。片手ずつ行い、僧帽筋に負荷を逃がさないように注意。"},
  { id: "sh-03", part:"shoulder", target:"front", name:"フロントレイズ", equipment:"ダンベル/プレート", level:"初級",
    desc:"三角筋前部を刺激。プレスの補助にも。", 
    practice:"10–15回×3セット。肩甲骨の位置を固定して動作。"},
  { id: "sh-04", part:"shoulder", target:"rear", name:"リアレイズ（ベントオーバー）", equipment:"ダンベル", level:"中級",
    desc:"肩後部（後部三角筋）を鍛える。姿勢保持が重要。", 
    practice:"12–15回×3セット。上背部の収縮を感じる。"},
  { id: "sh-05", part:"shoulder", target:"overall", name:"アーノルドプレス", equipment:"ダンベル", level:"中級",
    desc:"回旋動作を含むため可動域が広く、前部・中部に効く。", 
    practice:"8–12回×3セット。コントロールを優先。"},
  { id: "sh-06", part:"shoulder", target:"rear", name:"フェイスプル", equipment:"ケーブル", level:"中級",
    desc:"肩後部と肩甲骨周りの安定に有効。姿勢改善にも貢献。", 
    practice:"12–20回×3セット。肘を高めに引く。"},
  { id: "sh-07", part:"shoulder", target:"overall", name:"シュラッグ", equipment:"バーベル/ダンベル", level:"初中級",
    desc:"僧帽筋上部を強化。首周りの厚みを作る。", 
    practice:"8–15回×3セット。肩を引き上げ、コントロールして降ろす。"},
  { id: "sh-08", part:"shoulder", target:"rear", name:"ケーブルリアデルトフライ", equipment:"ケーブル", level:"中級",
    desc:"後部三角筋を狙った安定した刺激。", 
    practice:"12–18回×3セット。上半身のブレを抑える。"},
    { id: "sh-09", part:"shoulder", target:"side", name:"アップライトロー", equipment:"バーベル/ケーブル", level:"中級",
    desc:"三角筋中部と僧帽筋上部を強化。肩への負担軽減のため、肘を肩より高く上げすぎない。", 
    practice:"10–15回×3セット。バーを顎の高さまで引く。"},

  // --- BACK (背中) ---
  { id: "ba-01", part:"back", target:"low", name:"デッドリフト", equipment:"バーベル", level:"上級",
    desc:"全身性のハイパワー種目。背中全体・下背部に強い刺激。", 
    practice:"3–6回×3–5セット（高重量）／フォーム徹底。"},
  { id: "ba-02", part:"back", target:"width", name:"チンニング（懸垂）", equipment:"自重/バー", level:"中級",
    desc:"広背筋を中心に上背部の「幅」を作る。", 
    practice:"できる回数で3–5セット。ネガティブやアシストで調整。"},
  { id: "ba-03", part:"back", target:"width", name:"ラットプルダウン", equipment:"マシン", level:"初中級",
    desc:"懸垂が難しい場合の代替。背中の広がりを作る。", 
    practice:"8–12回×3セット。肘を下に引くイメージ。"},
  { id: "ba-04", part:"back", target:"thickness", name:"バーベルローイング", equipment:"バーベル", level:"中級",
    desc:"中背部（僧帽筋・広背筋）の「厚み」を作る。", 
    practice:"6–10回×3セット。肩甲骨を寄せる感覚で。"},
  { id: "ba-05", part:"back", target:"thickness", name:"ワンアームダンベルロー", equipment:"ダンベル", level:"中級",
    desc:"片側ずつ行うことで可動域を広く取れる。", 
    practice:"8–12回×3セット（片側ずつ）。コアで姿勢を支える。"},
  { id: "ba-06", part:"back", target:"thickness", name:"Tバーロー", equipment:"Tバー", level:"中級",
    desc:"厚み付けに効果的な引き種目。", 
    practice:"6–10回×3セット。胸を張り引く。"},
  { id: "ba-07", part:"back", target:"thickness", name:"シーテッドロー", equipment:"ケーブル", level:"中級",
    desc:"肩甲骨の収縮（厚み）を意識しやすい。", 
    practice:"8–12回×3セット。引き切ってキープすると効果大。"},
  { id: "ba-08", part:"back", target:"width", name:"プルオーバー", equipment:"ダンベル/ケーブル", level:"初中級",
    desc:"広背筋をストレッチさせる種目。", 
    practice:"10–15回×3セット。胸郭を引き伸ばす感覚。"},
  { id: "ba-09", part:"back", target:"low", name:"ルーマニアンデッドリフト", equipment:"バーベル", level:"中級",
    desc:"脊柱起立筋とハムストリングを狙う背面種目。", 
    practice:"6–12回×3セット。背筋を伸ばしたまま股関節で折る。"},
  { id: "ba-10", part:"back", target:"width", name:"パラレルグリッププルダウン", equipment:"マシン", level:"中級",
    desc:"手のひらを向き合わせたグリップで、広背筋の下部・外側への刺激を高める。", 
    practice:"8–12回×3セット。胸を張り、肘を下方に引き切る。"},
  { id: "ba-11", part:"back", target:"thickness", name:"ハーフデッドリフト", equipment:"バーベル", level:"上級",
    desc:"高重量を扱いやすく、上背部（僧帽筋・広背筋上部）の厚みを作るのに特化。", 
    practice:"5–8回×3セット。腰を丸めずに引く。"},
  { id: "ba-12", part:"back", target:"thickness", name:"ダンベルシュラッグ", equipment:"ダンベル", level:"初中級",
    desc:"僧帽筋上部を強化。バーベルよりも可動域を大きく取れる。", 
    practice:"10–15回×3セット。肩を真上に持ち上げ、ゆっくり戻す。"},
  { id: "ba-13", part:"back", target:"width", name:"ストレートアームプルダウン", equipment:"ケーブル", level:"初級",
    desc:"肘を曲げず、広背筋の収縮のみでウェイトを引くアイソレーション種目。", 
    practice:"12–18回×3セット。背中のストレッチを意識。"},

  // --- ARMS (腕) ---
  { id: "ar-01", part:"arms", target:"biceps", name:"バーベルカール", equipment:"バーベル", level:"初中級",
    desc:"上腕二頭筋（力こぶ）の基本。", 
    practice:"8–12回×3セット。肘を動かさずに巻き上げる。"},
  { id: "ar-02", part:"arms", target:"biceps", name:"ダンベルハンマーカール", equipment:"ダンベル", level:"初中級",
    desc:"腕橈骨筋と二頭短頭を刺激。腕の厚みを作る。", 
    practice:"10–12回×3セット。中間位で握る。"},
  { id: "ar-03", part:"arms", target:"biceps", name:"プリーチャーカール", equipment:"プリーチャー台", level:"中級",
    desc:"二頭筋をストレッチさせにくい状態で収縮させる。", 
    practice:"8–12回×3セット。フォームで収縮を最大化。"},
  { id: "ar-04", part:"arms", target:"biceps", name:"ケーブルカール", equipment:"ケーブル", level:"初中級",
    desc:"動作中ずっと負荷が抜けにくい。", 
    practice:"12–15回×3セット。ゆっくり戻す。"},
  { id: "ar-05", part:"arms", target:"triceps", name:"トライセプスプレスダウン", equipment:"ケーブル", level:"初中級",
    desc:"上腕三頭筋（二の腕）の基本。", 
    practice:"10–15回×3セット。肘を固定して押し下げる。"},
  { id: "ar-06", part:"arms", target:"triceps", name:"ダンベルキックバック", equipment:"ダンベル", level:"中級",
    desc:"三頭筋の収縮を強く感じる種目。", 
    practice:"10–15回×3セット。上体を安定させる。"},
  { id: "ar-07", part:"arms", target:"triceps", name:"ナローベンチプレス", equipment:"バーベル", level:"中級",
    desc:"高重量を扱える三頭筋種目。", 
    practice:"6–10回×3セット。手幅を狭くして行う。"},
  { id: "ar-08", part:"arms", target:"triceps", name:"スカルクラッシャー", equipment:"バーベル", level:"中級",
    desc:"三頭筋長頭を強く刺激し、腕を太くする。", 
    practice:"8–12回×3セット。肘の位置を固定。"},
  { id: "ar-09", part:"arms", target:"biceps", name:"コンセントレーションカール", equipment:"ダンベル", level:"中級",
    desc:"肘を固定することで、二頭筋を単独で最大限に収縮させる。", 
    practice:"8–12回×3セット（片側）。ネガティブ動作を意識。"},
  { id: "ar-10", part:"arms", target:"triceps", name:"オーバーヘッドトライセプスエクステンション", equipment:"ダンベル/ケーブル", level:"中級",
    desc:"三頭筋の長頭（上腕の裏側、付け根部分）を強くストレッチし、太くする。", 
    practice:"10–15回×3セット。肘を頭の横に固定。"},
  { id: "ar-11", part:"arms", target:"biceps", name:"リバースカール", equipment:"バーベル/EZバー", level:"初中級",
    desc:"順手（オーバーハンド）で行い、主に前腕（腕の表側）と上腕二頭筋を鍛える。", 
    practice:"10–15回×3セット。手首を過度に曲げない。"},

  // --- LEGS (足) ---
  { id: "le-01", part:"legs", target:"overall", name:"バックスクワット", equipment:"バーベル", level:"中級",
    desc:"下半身全体の王様種目。", 
    practice:"5–8回×3–5セット（強度高め）／フォーム第一。"},
  { id: "le-02", part:"legs", target:"quads", name:"フロントスクワット", equipment:"バーベル", level:"中級",
    desc:"大腿四頭筋（前もも）によりフォーカス。", 
    practice:"6–10回×3セット。体幹の保持が鍵。"},
  { id: "le-03", part:"legs", target:"overall", name:"レッグプレス", equipment:"マシン", level:"初中級",
    desc:"高重量を安全に扱える下半身種目。", 
    practice:"8–15回×3セット。膝の位置に注意。"},
  { id: "le-04", part:"legs", target:"quads", name:"ブルガリアンスクワット", equipment:"ダンベル", level:"中級",
    desc:"片脚種目の決定版。四頭筋と臀部に効く。", 
    practice:"8–12回×3セット（片側）。バランス重視。"},
  { id: "le-05", part:"legs", target:"hams", name:"ルーマニアンデッドリフト", equipment:"バーベル", level:"中級",
    desc:"ハムストリングとヒップアップに効果的。", 
    practice:"6–12回×3セット。膝は軽く曲げる程度で。"},
  { id: "le-06", part:"legs", target:"quads", name:"レッグエクステンション", equipment:"マシン", level:"初級",
    desc:"前ももの仕上げに最適。", 
    practice:"12–15回×3セット。膝の負担に注意。"},
  { id: "le-07", part:"legs", target:"hams", name:"レッグカール", equipment:"マシン", level:"初級",
    desc:"ハムストリングを集中して鍛える。", 
    practice:"10–15回×3セット。ゆっくり戻す。"},
  { id: "le-08", part:"legs", target:"calves", name:"カーフレイズ", equipment:"自重/マシン", level:"初級",
    desc:"ふくらはぎの強化。", 
    practice:"15–25回×3セット。フルレンジ。"},
  { id: "le-09", part:"legs", target:"hams", name:"ヒップスラスト", equipment:"バーベル", level:"中級",
    desc:"臀部の筋肥大に極めて有効。", 
    practice:"8–12回×3セット。腰を過伸展しない。"},
  { id: "le-10", part:"legs", target:"quads", name:"ハックスクワット", equipment:"マシン", level:"中級",
    desc:"背中を固定して四頭筋を攻める。", 
    practice:"8–12回×3セット。足幅と深さを調整。"},
  { id: "le-12", part:"legs", target:"quads", name:"ランジ", equipment:"自重/ダンベル", level:"初中級",
    desc:"片脚ずつ行うため、左右差の改善や体幹安定能力も向上する。", 
    practice:"10–12回×3セット（片側）。前膝が足首より前に出ないように注意。"},
  { id: "le-13", part:"legs", target:"calves", name:"シーテッドカーフレイズ", equipment:"マシン", level:"初級",
    desc:"座って行うことで、ヒラメ筋（下腿の横幅）をメインに強化する。", 
    practice:"15–25回×3セット。最大伸展と収縮を意識。"},

  // --- ABS (腹) ---
  { id: "ab-01", part:"abs", target:"front", name:"クランチ", equipment:"自重", level:"初級",
    desc:"腹直筋上部の基本的収縮種目。", 
    practice:"15–25回×3セット。首を無理に引かない。"},
  { id: "ab-02", part:"abs", target:"front", name:"レッグレイズ", equipment:"自重", level:"中級",
    desc:"下腹部への高負荷。腰を浮かせないこと。", 
    practice:"10–20回×3セット。腹筋の収縮を意識。"},
  { id: "ab-03", part:"abs", target:"core", name:"プランク", equipment:"自重", level:"初級",
    desc:"体幹（コア）を固める等尺性トレーニング。", 
    practice:"30–90秒×3セット。フォーム維持が最重要。"},
  { id: "ab-04", part:"abs", target:"front", name:"アブローラー", equipment:"器具", level:"中級",
    desc:"伸張・収縮ともに強烈な負荷。", 
    practice:"8–15回×3セット。腰を落とさない。"},
  { id: "ab-05", part:"abs", target:"side", name:"ロシアンツイスト", equipment:"自重/プレート", level:"初中級",
    desc:"腹斜筋（横腹）と回旋機能を強化。", 
    practice:"20回（左右合計）×3セット。腰を過度に捻らない。"},
  { id: "ab-06", part:"abs", target:"front", name:"ハンギングレッグレイズ", equipment:"鉄棒/器具", level:"上級",
    desc:"ぶら下がりながら行う最難関の腹筋種目。下腹部への刺激が極めて高い。", 
    practice:"できる回数で3セット。膝を曲げて行うと負荷を軽減できる。"},
  { id: "ab-07", part:"abs", target:"side", name:"サイドプランク", equipment:"自重", level:"初級",
    desc:"横向きで行う体幹種目。腹斜筋や側面の安定性を高める。", 
    practice:"30–60秒キープ×3セット（片側）。腰が落ちないよう一直線を維持。"},
];

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
    key: 'chest', title: '胸', subtitle: '厚い胸板を作る',
    zones: [
      { key: 'middle', label: '中部・全体（ベース）' },
      { key: 'upper', label: '上部（鎖骨側）' },
      { key: 'lower', label: '下部（腹側・輪郭）' }
    ]
  },
  { 
    key: 'shoulder', title: '肩', subtitle: '広い肩幅と立体感',
    zones: [
      { key: 'overall', label: '全体・プレス系' },
      { key: 'front', label: '前部（フロント）' },
      { key: 'side', label: '中部（サイド）' },
      { key: 'rear', label: '後部（リア）' }
    ]
  },
  { 
    key: 'back', title: '背中', subtitle: '逆三角形と厚み',
    zones: [
      { key: 'width', label: '広がり（広背筋）' },
      { key: 'thickness', label: '厚み（僧帽筋・中背部）' },
      { key: 'low', label: '下背部・全体' }
    ]
  },
  { 
    key: 'arms', title: '腕', subtitle: '太く逞しい腕',
    zones: [
      { key: 'biceps', label: '上腕二頭筋（力こぶ）' },
      { key: 'triceps', label: '上腕三頭筋（二の腕）' }
    ]
  },
  { 
    key: 'legs', title: '足', subtitle: '強靭な下半身',
    zones: [
      { key: 'overall', label: '全体・スクワット系' },
      { key: 'quads', label: '大腿四頭筋（前もも）' },
      { key: 'hams', label: 'ハム・臀部（裏もも・尻）' },
      { key: 'calves', label: 'ふくらはぎ' }
    ]
  },
  { 
    key: 'abs', title: '腹', subtitle: '割れた腹筋と体幹',
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
        // 小見出し作成
        const subHeader = document.createElement('h3');
        subHeader.style.fontSize = '0.95rem';
        subHeader.style.margin = '16px 0 8px 4px';
        subHeader.style.color = '#4b5563'; // var(--muted)に近い色
        subHeader.style.borderLeft = '4px solid #2563eb'; // var(--accent)
        subHeader.style.paddingLeft = '8px';
        subHeader.textContent = zone.label;
        area.appendChild(subHeader);

        // グリッド作成
        const grid = document.createElement('div');
        grid.className = 'grid';
        
        zoneItems.forEach(item => {
          grid.appendChild(createCard(item));
        });
        area.appendChild(grid);
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
    <p class="card-desc">${escapeHtml(item.desc)}</p>
    <div class="card-footer">
      <button class="small-btn" data-action="detail" data-id="${item.id}">詳細</button>
      <button class="small-btn" data-action="addprogram" data-id="${item.id}">プログラムに追加</button>
    </div>
  `;
  // ボタンイベント
  card.querySelector('[data-action="detail"]').addEventListener('click', ()=> openModal(item.id));
  card.querySelector('[data-action="addprogram"]').addEventListener('click', ()=> showTempMsg('（ダミー）プログラムに追加しました'));
  card.querySelector('.fav-btn').addEventListener('click', (e)=> {
    const id = e.currentTarget.dataset.id;
    toggleFav(id);
    updateFavUI();
  });
  return card;
}

// モーダルを開く
function openModal(id){
  const item = DATA.find(d => d.id === id);
  if(!item) return;
  
  // 部位表示用のマッピング
  const p = PARTS.find(x => x.key === item.part);
  const z = p ? p.zones.find(z => z.key === item.target) : null;
  const partLabel = p ? p.title : item.part;
  const zoneLabel = z ? z.label : '';

  modalBody.innerHTML = `
    <h3 style="margin:0 0 6px">${escapeHtml(item.name)}</h3>
    <div class="meta-list">
      <div class="meta-item">${partLabel} ${zoneLabel ? `(${zoneLabel})` : ''}</div>
      <div class="meta-item">${escapeHtml(item.level)}</div>
      <div class="meta-item">${escapeHtml(item.equipment)}</div>
    </div>
    <p class="hint">${escapeHtml(item.desc)}</p>
    <hr class="soft" />
    <h4 style="margin:6px 0">実践例（目安）</h4>
    <p class="hint">${escapeHtml(item.practice)}</p>
    <div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap">
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
function closeModal(){ modal.setAttribute('aria-hidden','true'); }

// 検索・フィルタ処理
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
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
(function(){
  toggleFavView.textContent = isFavView() ? '全てを表示' : 'お気に入りを表示';
  initialRender();
  updateFavUI();
  
  // URLハッシュスクロール
  const hash = window.location.hash; 
  if(hash) {
    const key = hash.replace('#', '');
    const targetId = 'part-' + key;
    const targetElement = document.getElementById(targetId);
    if(targetElement) {
      setTimeout(() => {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }
})();