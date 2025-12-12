// 型定義
export type Part =
  | "chest"
  | "shoulder"
  | "back"
  | "arms"
  | "legs"
  | "abs";

export interface Exercise {
  id: string;
  part: Part;
  target: string;
  name: string;
  description: string;      // desc + practice を統合して使う想定
  equipment: string;        // New
  level: string;            // New
  practice: string;         // New（必要であれば description に統合してもOK）
  image: string;
}

// 定数
const FAV_KEY = "favorite_exercises_v1";

// JSON データをまとめてロード
async function loadExercises(): Promise<Exercise[]> {
  const partFiles: Part[] = [
    "chest",
    "shoulder",
    "back",
    "arms",
    "legs",
    "abs",
  ];

  const promises = partFiles.map((p) =>
    fetch(`./data/${p}.json`).then((r) => r.json())
  );

  const results = await Promise.all(promises);

  // 二次元配列をフラット化
  return results.flat();
}

// LocalStorage 管理
function loadFavs(): Set<string> {
  const raw = localStorage.getItem(FAV_KEY);
  if (!raw) return new Set();
  try {
    const arr = JSON.parse(raw);
    return new Set(arr);
  } catch {
    return new Set();
  }
}

function saveFavs(favs: Set<string>) {
  localStorage.setItem(FAV_KEY, JSON.stringify([...favs]));
}

// レンダリング系
function renderExerciseCard(ex: Exercise, favs: Set<string>): string {
  const isFav = favs.has(ex.id);
  return `
    <div class="exercise-card" id="${ex.id}">
      <img src="${ex.image}" alt="${ex.name}" />
      <h3>${ex.name}</h3>
      <p>${ex.description}</p>
      <p class="equip">【器具】${ex.equipment}</p>
      <p class="level">【レベル】${ex.level}</p>
      <p class="practice">【方法】${ex.practice}</p>
      <button data-id="${ex.id}" class="fav-btn ${isFav ? "active" : ""}">
        ★
      </button>
    </div>
  `;
}

function renderZoneSection(
  exercises: Exercise[],
  target: string,
  favs: Set<string>
): string {
  const filtered = exercises.filter((e) => e.target === target);

  if (filtered.length === 0) return "";

  return `
    <section class="zone-section">
      <h2>${target}</h2>
      <div class="exercise-grid">
        ${filtered.map((ex) => renderExerciseCard(ex, favs)).join("")}
      </div>
    </section>
  `;
}

function renderPartSection(
  part: Part,
  exercises: Exercise[],
  favs: Set<string>
): string {
  const partExercises = exercises.filter((e) => e.part === part);
  if (partExercises.length === 0) return "";

  const zones = [...new Set(partExercises.map((e) => e.target))];

  return `
    <section class="part-section" id="${part}">
      <h1>${part.toUpperCase()}</h1>
      ${zones
        .map((z) => renderZoneSection(partExercises, z, favs))
        .join("")}
    </section>
  `;
}

// イベント設定
function bindFavoriteButtons(favs: Set<string>) {
  const buttons = document.querySelectorAll<HTMLButtonElement>(".fav-btn");
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id!;
      if (favs.has(id)) {
        favs.delete(id);
        btn.classList.remove("active");
      } else {
        favs.add(id);
        btn.classList.add("active");
      }
      saveFavs(favs);
    });
  });
}

function bindSearch(exercises: Exercise[]) {
  const input = document.getElementById("searchInput") as HTMLInputElement;

  input.addEventListener("input", () => {
    const keyword = input.value.toLowerCase();

    exercises.forEach((ex) => {
      const el = document.getElementById(ex.id);
      if (!el) return;

      const hits =
        ex.name.toLowerCase().includes(keyword) ||
        ex.description.toLowerCase().includes(keyword) ||
        ex.equipment.toLowerCase().includes(keyword) ||
        ex.level.toLowerCase().includes(keyword);

      el.style.display = hits ? "block" : "none";
    });
  });
}

function bindJump() {
  const select = document.getElementById("jumpTo") as HTMLSelectElement;

  select.addEventListener("change", () => {
    const val = select.value;
    if (!val) return;

    const section = document.getElementById(val);
    if (!section) return;

    section.scrollIntoView({ behavior: "smooth" });
  });
}

// 初期描画
async function init() {
  const container = document.getElementById("app");
  if (!container) return;

  const favs = loadFavs();
  const exercises = await loadExercises();

  const parts: Part[] = [
    "chest",
    "shoulder",
    "back",
    "arms",
    "legs",
    "abs",
  ];

  const html = parts
    .map((part) => renderPartSection(part, exercises, favs))
    .join("");

  container.innerHTML = html;

  bindFavoriteButtons(favs);
  bindSearch(exercises);
  bindJump();
}

init();