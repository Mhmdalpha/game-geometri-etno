const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

const STORAGE_KEY = "geo_rpg_current_progress_v5_mongodb";
const PLAYERS_KEY = "geo_rpg_players_v5_mongodb";
const LEADERBOARD_KEY = "geo_rpg_leaderboard_v5_mongodb";
const AUDIO_PREF_KEY = "geo_rpg_audio_muted_v6";
const QUIZ_TIME_LIMIT_SECONDS = 120;
const API_BASE = String(window.GAME_API_BASE || "").replace(/\/+$/, "");

function createDefaultProgress(name = "Penjelajah", className = "-") {
  return {
    id: makePlayerId(name, className),
    name,
    className,
    score: 0,
    games: {},
    updatedAt: new Date().toISOString()
  };
}

const state = {
  screen: "start",
  player: { x: 50, y: 82, px: 0, py: 0, speed: 265, facing: "right", moving: false },
  lastFrameTime: 0,
  keys: new Set(),
  joystick: { active: false, x: 0, y: 0, startX: 0, startY: 0 },
  nearbyCave: null,
  currentQuiz: null,
  leaderboard: [],
  progress: createDefaultProgress(),
  audio: { muted: localStorage.getItem(AUDIO_PREF_KEY) === "1", currentMusic: null, cache: {}, unlocked: false },
  guideIndex: 0
};


const AUDIO_FILES = {
  start: "assets/audio/start-theme.mp3",
  caveEnter: "assets/audio/cave-enter.mp3",
  caveJaring: "assets/audio/cave-jaring-theme.mp3",
  caveCiri: "assets/audio/cave-ciri-theme.mp3",
  caveHitung: "assets/audio/cave-hitung-theme.mp3",
  correct: "assets/audio/correct-ding.mp3",
  wrong: "assets/audio/wrong-buzz.mp3",
  question5: "assets/audio/question-5.mp3",
  finish: "assets/audio/finish-theme.mp3"
};

const GUIDE_SLIDES = [
  {
    title: "Petunjuk Utama",
    subtitle: "Kenali alur permainan utama dulu sebelum masuk ke salah satu goa.",
    media: [
      { src: "assets/caves/cave-jaring.png", label: "Goa 1" },
      { src: "assets/caves/cave-ciri.png", label: "Goa 2" },
      { src: "assets/caves/cave-hitung.png", label: "Goa 3" }
    ],
    body: `
      <ol class="guide-list">
        <li>Isi <b>nama</b> dan <b>kelas</b>, lalu tekan <b>Mulai Petualangan</b>.</li>
        <li>Gerakkan karakter dengan <b>WASD</b>, <b>tombol panah</b>, atau <b>joystick</b>.</li>
        <li>Dekati goa sampai tombol <b>Masuk Game</b> muncul, lalu tekan <b>ENTER</b> atau klik tombolnya.</li>
        <li>Setiap goa berisi <b>5 soal</b> dan ada batas waktu <b>2 menit</b>.</li>
        <li>Jawaban benar bernilai <b>10 poin</b>. Kalau waktu habis, skor sementara tetap dihitung.</li>
      </ol>
    `,
    note: "Sesudah memahami petunjuk utama, geser ke kanan untuk melihat penjelasan khusus Goa 1, Goa 2, dan Goa 3."
  },
  {
    title: "Goa 1 – Tebak Jaring-Jaring",
    subtitle: "Di goa ini kamu memilih jaring-jaring yang cocok dengan bangun ruang dari objek budaya.",
    media: [
      { src: "assets/objects/obj-prisma-fort.svg", label: "Contoh objek: atap Benteng Fort Willem I" },
      { src: "assets/nets/net-prisma.svg", label: "Contoh jawaban benar: jaring-jaring prisma" }
    ],
    body: `
      <div class="guide-explain">
        <p><b>Cara main:</b> baca nama objek atau lihat gambarnya, lalu cocokkan dengan pilihan jaring-jaring di bawah soal.</p>
        <ul class="guide-list">
          <li>Kalau bangunnya <b>prisma</b>, pilih jaring-jaring yang memiliki <b>2 sisi alas/atap sama</b> dan beberapa sisi tegak persegi panjang.</li>
          <li>Perhatikan perbedaan antara <b>kerucut</b>, <b>limas</b>, <b>tabung</b>, dan <b>prisma</b>.</li>
          <li>Klik jawaban yang paling sesuai. Setelah itu baca umpan balik hijau/merah lalu lanjut ke soal berikutnya.</li>
        </ul>
      </div>
    `,
    note: "Tips benar: kalau objek berbentuk prisma segitiga, jawaban benarnya adalah jaring-jaring dengan 2 segitiga dan 3 persegi panjang."
  },
  {
    title: "Goa 2 – Tebak Bangun dari Ciri-Ciri",
    subtitle: "Di goa ini kamu menebak nama bangun ruang berdasarkan sifat, ciri, atau gambar objek budayanya.",
    media: [
      { src: "assets/objects/obj-bola-bollard.svg", label: "Contoh objek: bollard Kota Lama" },
      { src: "assets/objects/obj-tabung-tank.svg", label: "Bandingkan dengan tabung" }
    ],
    body: `
      <div class="guide-explain">
        <p><b>Cara main:</b> baca ciri-ciri dengan teliti, lalu pilih nama bangun yang paling cocok.</p>
        <ul class="guide-list">
          <li>Kalau tertulis <b>tidak punya rusuk dan titik sudut</b>, jawabannya biasanya <b>bola</b>.</li>
          <li>Kalau punya <b>alas lingkaran dan satu puncak</b>, jawabannya <b>kerucut</b>.</li>
          <li>Kalau punya <b>dua lingkaran sejajar dan satu selimut</b>, jawabannya <b>tabung</b>.</li>
          <li>Pakai gambar sebagai petunjuk tambahan sebelum memilih jawaban.</li>
        </ul>
      </div>
    `,
    note: "Tips benar: fokus pada kata kunci seperti rusuk, titik sudut, alas lingkaran, titik puncak, dan sisi lengkung."
  },
  {
    title: "Goa 3 – Hitung Volume dan Luas",
    subtitle: "Di goa ini kamu menghitung volume atau luas permukaan dari objek geometri yang ditampilkan.",
    media: [
      { src: "assets/objects/obj-tabung-tank.svg", label: "Contoh objek: tabung" },
      { src: "assets/objects/obj-limas-roof.svg", label: "Contoh objek: limas" }
    ],
    body: `
      <div class="guide-explain">
        <p><b>Cara main:</b> baca ukuran pada soal, lalu hitung menggunakan rumus yang tepat sebelum memilih jawaban.</p>
        <ul class="guide-list">
          <li><b>Volume tabung</b> = π × r × r × t</li>
          <li><b>Volume kerucut</b> = ⅓ × π × r × r × t</li>
          <li><b>Volume prisma</b> = luas alas × tinggi</li>
          <li><b>Luas permukaan bola</b> = 4 × π × r²</li>
          <li>Cocokkan hasil hitunganmu dengan opsi yang tersedia lalu klik jawabannya.</li>
        </ul>
      </div>
    `,
    note: "Tips benar: kerjakan cepat tapi teliti. Perhatikan satuan, jari-jari, diameter, dan tinggi bangun sebelum memilih jawaban."
  }
];

function getAudio(name) {
  if (!AUDIO_FILES[name]) return null;
  if (!state.audio.cache[name]) {
    const audio = new Audio(AUDIO_FILES[name]);
    audio.preload = "auto";
    audio.volume = name.includes("cave") || name === "start" ? 0.28 : 0.55;
    state.audio.cache[name] = audio;
  }
  return state.audio.cache[name];
}

function unlockAudio() {
  if (state.audio.unlocked) return;
  state.audio.unlocked = true;
  Object.keys(AUDIO_FILES).forEach(name => {
    const audio = getAudio(name);
    if (audio) audio.load();
  });
  updateSoundButton();
}

function playSfx(name) {
  if (state.audio.muted) return;
  const base = getAudio(name);
  if (!base) return;
  const sfx = base.cloneNode(true);
  sfx.volume = base.volume;
  sfx.currentTime = 0;
  sfx.play().catch(() => {});
}

function playMusic(name, { loop = true } = {}) {
  if (state.audio.muted) return;
  const audio = getAudio(name);
  if (!audio) return;
  if (state.audio.currentMusic && state.audio.currentMusic !== audio) {
    state.audio.currentMusic.pause();
    state.audio.currentMusic.currentTime = 0;
  }
  state.audio.currentMusic = audio;
  audio.loop = loop;
  audio.volume = name === "finish" ? 0.48 : 0.28;
  audio.currentTime = 0;
  audio.play().catch(() => {});
}

function stopMusic() {
  if (!state.audio.currentMusic) return;
  state.audio.currentMusic.pause();
  state.audio.currentMusic.currentTime = 0;
  state.audio.currentMusic = null;
}

function toggleSound() {
  state.audio.muted = !state.audio.muted;
  localStorage.setItem(AUDIO_PREF_KEY, state.audio.muted ? "1" : "0");
  if (state.audio.muted) stopMusic();
  else {
    unlockAudio();
    if (state.screen === "game") playMusic("start");
    if (state.screen === "quiz" && state.currentQuiz) playCaveTheme(state.currentQuiz.gameId);
  }
  updateSoundButton();
}

function updateSoundButton() {
  const btn = $("#btnSoundMap");
  if (!btn) return;
  btn.textContent = state.audio.muted ? "🔇" : "🔊";
  btn.classList.toggle("muted", state.audio.muted);
  btn.title = state.audio.muted ? "Nyalakan musik" : "Matikan musik";
}

function playCaveTheme(gameId) {
  const musicMap = { jaring: "caveJaring", ciri: "caveCiri", hitung: "caveHitung" };
  playMusic(musicMap[gameId] || "caveJaring");
}

function loadJson(key, fallback) {
  try {
    const parsed = JSON.parse(localStorage.getItem(key));
    return parsed ?? fallback;
  } catch (_) {
    return fallback;
  }
}

function saveJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function hasApi() {
  return Boolean(API_BASE);
}

async function apiRequest(path, options = {}) {
  if (!hasApi()) throw new Error("API belum diatur. Isi GAME_API_BASE di src/api-config.js");
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `API error ${res.status}`);
  return data;
}

async function fetchOnlineLeaderboard() {
  if (!hasApi()) return false;
  try {
    const data = await apiRequest("/api/leaderboard");
    state.leaderboard = sortLeaderboard(data.items || []);
    saveJson(LEADERBOARD_KEY, state.leaderboard);
    renderLeaderboard();
    updateStorageModeLabel("online");
    return true;
  } catch (err) {
    console.warn("Gagal mengambil leaderboard online:", err.message);
    updateStorageModeLabel("offline");
    return false;
  }
}

async function fetchOnlinePlayer(id) {
  if (!hasApi() || !id) return null;
  try {
    const data = await apiRequest(`/api/players/${encodeURIComponent(id)}`);
    return data.player || null;
  } catch (err) {
    console.warn("Gagal mengambil data user online:", err.message);
    updateStorageModeLabel("offline");
    return null;
  }
}

async function syncProgressOnline(progress) {
  if (!hasApi()) return;
  try {
    await apiRequest("/api/players", {
      method: "POST",
      body: JSON.stringify(progress)
    });
    await fetchOnlineLeaderboard();
  } catch (err) {
    console.warn("Gagal menyimpan progres online:", err.message);
    updateStorageModeLabel("offline");
  }
}

async function deleteOnlinePlayer(id) {
  if (!hasApi() || !id) return;
  try {
    await apiRequest(`/api/players/${encodeURIComponent(id)}`, { method: "DELETE" });
    await fetchOnlineLeaderboard();
  } catch (err) {
    console.warn("Gagal menghapus user online:", err.message);
    updateStorageModeLabel("offline");
  }
}

async function clearOnlinePlayers() {
  if (!hasApi()) return;
  try {
    await apiRequest("/api/players", { method: "DELETE" });
    await fetchOnlineLeaderboard();
  } catch (err) {
    console.warn("Gagal menghapus semua data online:", err.message);
    updateStorageModeLabel("offline");
  }
}

function updateStorageModeLabel(mode) {
  const label = $("#storageStatus");
  if (!label) return;
  if (!hasApi()) {
    label.textContent = "Mode lokal: data tersimpan di browser ini.";
    label.className = "save-note local";
    return;
  }
  if (mode === "online") {
    label.textContent = "Mode online: leaderboard tersambung ke MongoDB.";
    label.className = "save-note online";
  } else {
    label.textContent = "Mode fallback: API belum tersambung, data sementara tersimpan lokal.";
    label.className = "save-note offline";
  }
}

function makePlayerId(name, className) {
  return `${String(name || "Penjelajah").trim().toLowerCase()}__${String(className || "-").trim().toLowerCase()}`
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9_\-]/g, "");
}

function loadPlayers() {
  return loadJson(PLAYERS_KEY, {});
}

function savePlayers(players) {
  saveJson(PLAYERS_KEY, players);
}

function loadProgress() {
  const saved = loadJson(STORAGE_KEY, null);
  if (saved && typeof saved === "object") {
    state.progress = { ...createDefaultProgress(saved.name, saved.className), ...saved };
  }
  state.leaderboard = loadLeaderboard();
}

function loadLeaderboard() {
  const data = loadJson(LEADERBOARD_KEY, []);
  return Array.isArray(data) ? data : [];
}

function saveProgress({ updateLeaderboard = true } = {}) {
  state.progress.id = makePlayerId(state.progress.name, state.progress.className);
  state.progress.updatedAt = new Date().toISOString();
  saveJson(STORAGE_KEY, state.progress);

  const players = loadPlayers();
  players[state.progress.id] = { ...state.progress };
  savePlayers(players);

  if (updateLeaderboard) updateLeaderboardEntry(state.progress);
}

function updateLeaderboardEntry(progress) {
  const entry = {
    id: progress.id,
    name: progress.name,
    className: progress.className,
    score: Number(progress.score) || 0,
    badgeCount: Object.values(progress.games || {}).filter(g => g?.finished).length,
    updatedAt: progress.updatedAt || new Date().toISOString()
  };
  const list = loadLeaderboard().filter(item => item.id !== entry.id);
  list.push(entry);
  state.leaderboard = sortLeaderboard(list);
  saveJson(LEADERBOARD_KEY, state.leaderboard);
  renderLeaderboard();
  syncProgressOnline(progress);
}

function sortLeaderboard(list) {
  return [...list].sort((a, b) => {
    const scoreDiff = (Number(b.score) || 0) - (Number(a.score) || 0);
    if (scoreDiff) return scoreDiff;
    return String(b.updatedAt || "").localeCompare(String(a.updatedAt || ""));
  });
}

function resetProgress() {
  if (!confirm("Reset skor dan badge pemain ini? Data leaderboard pemain ini juga akan diperbarui, termasuk online jika API aktif.")) return;
  state.progress.score = 0;
  state.progress.games = {};
  saveProgress();
  renderHud();
  renderCaves();
  renderLeaderboard();
}

async function deleteLeaderboardUser(id) {
  const entry = loadLeaderboard().find(item => item.id === id);
  const label = entry ? `${entry.name} (${entry.className})` : "user ini";
  if (!confirm(`Hapus data leaderboard ${label}?`)) return;

  const players = loadPlayers();
  delete players[id];
  savePlayers(players);

  state.leaderboard = loadLeaderboard().filter(item => item.id !== id);
  saveJson(LEADERBOARD_KEY, state.leaderboard);

  if (state.progress.id === id) {
    state.progress = createDefaultProgress();
    saveJson(STORAGE_KEY, state.progress);
    $("#studentName").value = "";
    $("#studentClass").value = "";
    renderHud();
    renderCaves();
  }
  renderLeaderboard();
  await deleteOnlinePlayer(id);
}

async function clearLeaderboard() {
  if (!confirm("Hapus semua data leaderboard dan progres semua user? Jika API aktif, data MongoDB juga akan dihapus.")) return;
  state.leaderboard = [];
  saveJson(LEADERBOARD_KEY, []);
  saveJson(PLAYERS_KEY, {});
  state.progress = createDefaultProgress();
  saveJson(STORAGE_KEY, state.progress);
  $("#studentName").value = "";
  $("#studentClass").value = "";
  renderLeaderboard();
  renderHud();
  renderCaves();
  await clearOnlinePlayers();
}

function init() {
  loadProgress();
  renderStartFields();
  renderCaves();
  renderHud();
  renderLeaderboard();
  updateSoundButton();
  updateStorageModeLabel(hasApi() ? "offline" : "local");
  fetchOnlineLeaderboard();
  bindUI();
  resizePlayerPixels();
  state.lastFrameTime = performance.now();
  requestAnimationFrame(gameLoop);
}

function bindUI() {
  $("#btnStart").addEventListener("click", startGame);
  $("#btnShowGuide").addEventListener("click", openGuideModal);
  $("#btnClearLeaderboard").addEventListener("click", clearLeaderboard);
  $("#btnGuideMap").addEventListener("click", openGuideModal);
  $("#guidePrev").addEventListener("click", () => changeGuideSlide(-1));
  $("#guideNext").addEventListener("click", () => changeGuideSlide(1));
  $("#btnSoundMap")?.addEventListener("click", toggleSound);
  $("#btnReset").addEventListener("click", resetProgress);
  $("#btnHomeMap").addEventListener("click", () => goHome(false));
  $("#btnHomeQuiz").addEventListener("click", () => goHome(true));
  $("#btnEnterCave").addEventListener("click", enterNearbyCave);
  $("#btnActionMobile").addEventListener("click", enterNearbyCave);
  $("#btnCloseQuiz").addEventListener("click", closeQuiz);
  $("#btnNext").addEventListener("click", nextQuestion);

  $$('[data-close]').forEach(btn => {
    btn.addEventListener("click", () => hideModal(btn.dataset.close));
  });

  window.addEventListener("keydown", (e) => {
    const key = e.key.toLowerCase();
    const movementKeys = ["arrowup","arrowdown","arrowleft","arrowright","w","a","s","d"];

    // Jangan ganggu pengetikan nama/kelas atau input lain.
    // Bug sebelumnya: huruf W/A/S/D tertahan karena dianggap tombol gerak.
    if (isTypingTarget(e.target)) return;

    if (state.screen === "game" && movementKeys.includes(key)) {
      state.keys.add(key);
      e.preventDefault();
    }
    if (state.screen === "game" && (key === "enter" || key === "e")) {
      enterNearbyCave();
      e.preventDefault();
    }
  });
  window.addEventListener("keyup", (e) => state.keys.delete(e.key.toLowerCase()));
  window.addEventListener("resize", resizePlayerPixels);

  const base = $("#joystickBase");
  const stick = $("#joystickStick");

  function pointerStart(e) {
    const p = getPointer(e);
    state.joystick.active = true;
    const rect = base.getBoundingClientRect();
    state.joystick.startX = rect.left + rect.width / 2;
    state.joystick.startY = rect.top + rect.height / 2;
    moveStick(p.x, p.y);
    e.preventDefault();
  }
  function pointerMove(e) {
    if (!state.joystick.active) return;
    const p = getPointer(e);
    moveStick(p.x, p.y);
    e.preventDefault();
  }
  function pointerEnd() {
    state.joystick.active = false;
    state.joystick.x = 0;
    state.joystick.y = 0;
    stick.style.transform = "translate(-50%, -50%)";
  }
  function moveStick(x, y) {
    const dx = x - state.joystick.startX;
    const dy = y - state.joystick.startY;
    const max = 42;
    const dist = Math.hypot(dx, dy);
    const limited = dist > max ? max / dist : 1;
    const lx = dx * limited;
    const ly = dy * limited;
    state.joystick.x = lx / max;
    state.joystick.y = ly / max;
    stick.style.transform = `translate(calc(-50% + ${lx}px), calc(-50% + ${ly}px))`;
  }
  function getPointer(e) {
    const t = e.touches ? e.touches[0] : e;
    return { x: t.clientX, y: t.clientY };
  }

  base.addEventListener("pointerdown", pointerStart);
  window.addEventListener("pointermove", pointerMove);
  window.addEventListener("pointerup", pointerEnd);
  base.addEventListener("touchstart", pointerStart, { passive: false });
  window.addEventListener("touchmove", pointerMove, { passive: false });
  window.addEventListener("touchend", pointerEnd);
}

async function startGame() {
  clearMovementInput();
  unlockAudio();
  playMusic("start");
  const name = $("#studentName").value.trim() || "Penjelajah";
  const className = $("#studentClass").value.trim() || "-";
  const id = makePlayerId(name, className);
  const players = loadPlayers();
  const onlinePlayer = await fetchOnlinePlayer(id);

  if (onlinePlayer) {
    state.progress = { ...createDefaultProgress(name, className), ...onlinePlayer, name, className, id };
  } else if (players[id]) {
    state.progress = { ...createDefaultProgress(name, className), ...players[id], name, className, id };
  } else {
    state.progress = createDefaultProgress(name, className);
  }

  saveProgress();
  hideAllModals();
  $("#startScreen").classList.add("hidden");
  $("#gameScreen").classList.remove("hidden");
  state.screen = "game";
  renderHud();
  renderLeaderboard();
  resizePlayerPixels();
  setTimeout(() => $("#map").focus(), 50);
}

function goHome(fromQuiz) {
  if (fromQuiz && state.currentQuiz) {
    const ok = confirm("Pulang ke tampilan awal? Skor mini game yang belum selesai tidak akan disimpan.");
    if (!ok) return;
  }
  clearMovementInput();
  clearQuizTimer();
  state.currentQuiz = null;
  hideAllModals();
  $("#gameScreen").classList.add("hidden");
  $("#startScreen").classList.remove("hidden");
  state.screen = "start";
  stopMusic();
  renderHud();
  renderLeaderboard();
}

function renderCaves() {
  const layer = $("#cavesLayer");
  layer.innerHTML = "";
  GAME_DATA.caves.forEach(cave => {
    const el = document.createElement("div");
    el.className = "cave" + (state.progress.games[cave.id]?.finished ? " completed" : "");
    el.dataset.caveId = cave.id;
    el.style.left = `${cave.x}%`;
    el.style.top = `${cave.y}%`;
    el.innerHTML = `
      <img src="${cave.caveImage}" alt="${cave.shortTitle}">
      <span class="cave-title">${cave.shortTitle}</span>
    `;
    el.addEventListener("click", () => {
      if (state.nearbyCave?.id === cave.id) startMiniGame(cave.id);
      else showHint(`Dekati goa ${cave.shortTitle} dulu dengan karakter.`);
    });
    layer.appendChild(el);
  });
}

function renderHud() {
  $("#hudName").textContent = state.progress.name || "Penjelajah";
  $("#hudClass").textContent = `Kelas ${state.progress.className || "-"}`;
  $("#hudScore").textContent = state.progress.score || 0;

  const badgeRow = $("#badgeRow");
  badgeRow.innerHTML = "";
  const icons = { jaring: "🧩", ciri: "🔎", hitung: "📐" };
  GAME_DATA.caves.forEach(cave => {
    const b = document.createElement("div");
    b.className = "badge" + (state.progress.games[cave.id]?.finished ? " done" : "");
    b.title = cave.badge;
    b.textContent = icons[cave.id] || "⭐";
    badgeRow.appendChild(b);
  });
}

function renderStartFields() {
  if ($("#studentName")) $("#studentName").value = state.progress.name === "Penjelajah" ? "" : (state.progress.name || "");
  if ($("#studentClass")) $("#studentClass").value = state.progress.className === "-" ? "" : (state.progress.className || "");
}

function renderLeaderboard() {
  const listEl = $("#leaderboardList");
  if (!listEl) return;
  state.leaderboard = sortLeaderboard(loadLeaderboard());

  if (!state.leaderboard.length) {
    listEl.innerHTML = `<div class="leaderboard-empty">Belum ada data skor.<br>Mulai game dulu, skor akan tersimpan otomatis di sini.</div>`;
    return;
  }

  listEl.innerHTML = state.leaderboard.map((item, index) => {
    const date = item.updatedAt ? new Date(item.updatedAt).toLocaleDateString("id-ID") : "-";
    const badges = `${item.badgeCount || 0}/3 badge`;
    return `
      <div class="leaderboard-item" data-player-id="${escapeHtml(item.id)}">
        <div class="leaderboard-rank">${index + 1}</div>
        <div>
          <div class="leaderboard-name">${escapeHtml(item.name || "Penjelajah")}</div>
          <div class="leaderboard-meta">Kelas ${escapeHtml(item.className || "-")} • ${badges} • ${date}</div>
        </div>
        <div class="leaderboard-score">${Number(item.score) || 0}</div>
        <button class="leaderboard-delete" type="button" data-delete-id="${escapeHtml(item.id)}">Hapus</button>
      </div>`;
  }).join("");

  $$("[data-delete-id]").forEach(btn => {
    btn.addEventListener("click", () => deleteLeaderboardUser(btn.dataset.deleteId));
  });
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function resizePlayerPixels() {
  const map = $("#map");
  const rect = map.getBoundingClientRect();
  state.player.px = rect.width * state.player.x / 100;
  state.player.py = rect.height * state.player.y / 100;
  updatePlayerStyle();
}

function gameLoop(now) {
  const dt = Math.min(0.04, Math.max(0.001, (now - state.lastFrameTime) / 1000));
  state.lastFrameTime = now;
  if (state.screen === "game") {
    updateMovement(dt);
    detectNearbyCave();
  }
  requestAnimationFrame(gameLoop);
}

function updateMovement(dt) {
  let vx = 0;
  let vy = 0;
  if (state.keys.has("arrowleft") || state.keys.has("a")) vx -= 1;
  if (state.keys.has("arrowright") || state.keys.has("d")) vx += 1;
  if (state.keys.has("arrowup") || state.keys.has("w")) vy -= 1;
  if (state.keys.has("arrowdown") || state.keys.has("s")) vy += 1;
  vx += state.joystick.x;
  vy += state.joystick.y;
  const len = Math.hypot(vx, vy);
  if (len > 0.05) {
    vx /= Math.max(1, len);
    vy /= Math.max(1, len);
    const rect = $("#map").getBoundingClientRect();
    const marginX = 44;
    const minY = rect.height * 0.47;
    const maxY = rect.height - 28;
    state.player.px = clamp(state.player.px + vx * state.player.speed * dt, marginX, rect.width - marginX);
    state.player.py = clamp(state.player.py + vy * state.player.speed * dt, minY, maxY);
    state.player.x = state.player.px / rect.width * 100;
    state.player.y = state.player.py / rect.height * 100;
    state.player.moving = true;
    if (Math.abs(vx) > 0.08) state.player.facing = vx < 0 ? "left" : "right";
    updatePlayerStyle();
  } else if (state.player.moving) {
    state.player.moving = false;
    updatePlayerStyle();
  }
}

function updatePlayerStyle() {
  const player = $("#player");
  player.style.left = `${state.player.px}px`;
  player.style.top = `${state.player.py}px`;
  player.classList.toggle("walking", state.player.moving);
  player.classList.toggle("facing-left", state.player.facing === "left");
  player.classList.toggle("facing-right", state.player.facing !== "left");
}

function detectNearbyCave() {
  const mapRect = $("#map").getBoundingClientRect();
  let nearest = null;
  let nearestDist = Infinity;
  GAME_DATA.caves.forEach(cave => {
    const cx = cave.x / 100 * mapRect.width;
    const cy = cave.y / 100 * mapRect.height;
    const dist = Math.hypot(cx - state.player.px, cy - state.player.py);
    if (dist < nearestDist) {
      nearestDist = dist;
      nearest = cave;
    }
  });
  const threshold = Math.min(230, Math.max(145, mapRect.width * 0.13));
  state.nearbyCave = nearestDist < threshold ? nearest : null;
  const panel = $("#interaction");
  const action = $("#btnActionMobile");
  if (state.nearbyCave) {
    $("#interactionTitle").textContent = state.nearbyCave.title;
    $("#interactionSubtitle").textContent = state.nearbyCave.description;
    $("#btnEnterCave").classList.remove("hidden");
    panel.classList.remove("hidden");
    action.disabled = false;
    action.textContent = "MASUK";
  } else {
    panel.classList.add("hidden");
    action.disabled = true;
    action.textContent = "DEKATI";
  }
}

function enterNearbyCave() {
  if (!state.nearbyCave || state.screen !== "game") return;
  startMiniGame(state.nearbyCave.id);
}

function shuffleArray(items) {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function shuffleQuestionOptions(question) {
  const paired = question.options.map((option, index) => ({ option, correct: index === question.correct }));
  const shuffled = shuffleArray(paired);
  return {
    ...question,
    options: shuffled.map(item => item.option),
    correct: shuffled.findIndex(item => item.correct)
  };
}

function prepareQuizQuestions(gameId) {
  const source = GAME_DATA.questions[gameId] || [];
  return shuffleArray(source).slice(0, 5).map(shuffleQuestionOptions);
}

function startMiniGame(gameId) {
  clearMovementInput();
  unlockAudio();
  playSfx("caveEnter");
  playCaveTheme(gameId);
  const cave = GAME_DATA.caves.find(c => c.id === gameId);
  state.currentQuiz = {
    gameId,
    cave,
    questions: prepareQuizQuestions(gameId),
    index: 0,
    score: 0,
    answered: false,
    timerSeconds: QUIZ_TIME_LIMIT_SECONDS,
    timerInterval: null,
    timeUp: false,
    finalQuestionSoundPlayed: false
  };
  state.screen = "quiz";
  showModal("quizModal");
  renderQuestion();
  startQuizTimer();
}

function renderQuestion() {
  const quiz = state.currentQuiz;
  const q = quiz.questions[quiz.index];
  quiz.answered = false;

  $("#quizMiniTitle").textContent = quiz.cave.shortTitle;
  $("#quizTitle").textContent = quiz.cave.title;
  $("#quizProgress").textContent = `Soal ${quiz.index + 1}/${quiz.questions.length}`;
  $("#quizScore").textContent = quiz.score;
  $("#progressFill").style.width = `${(quiz.index) / quiz.questions.length * 100}%`;
  const answersLocked = false;
  $("#questionText").textContent = q.question;
  $("#feedback").className = "feedback hidden";
  $("#feedback").textContent = "";
  $("#btnNext").classList.add("hidden");

  const imgWrap = $("#questionImageWrap");
  const img = $("#questionImage");
  if (q.image) {
    img.src = q.image;
    img.alt = "Gambar objek budaya atau geometri";
    imgWrap.classList.remove("hidden");
  } else {
    imgWrap.classList.add("hidden");
  }

  const grid = $("#answerGrid");
  grid.innerHTML = "";
  q.options.forEach((opt, i) => {
    const btn = document.createElement("button");
    btn.className = "answer-btn" + (answersLocked ? " locked" : "");
    btn.disabled = answersLocked;
    const option = typeof opt === "string" ? { text: opt } : opt;
    btn.innerHTML = `${option.image ? `<img src="${option.image}" alt="Pilihan ${i+1}">` : ""}<span>${String.fromCharCode(65+i)}. ${option.text}</span>`;
    btn.addEventListener("click", () => chooseAnswer(i));
    grid.appendChild(btn);
  });

  if (quiz.index === quiz.questions.length - 1 && !quiz.finalQuestionSoundPlayed) {
    quiz.finalQuestionSoundPlayed = true;
    playSfx("question5");
  }

  renderQuizTimer();
}

function chooseAnswer(index) {
  const quiz = state.currentQuiz;
  if (!quiz || quiz.answered || quiz.timeUp) return;
  const q = quiz.questions[quiz.index];
  quiz.answered = true;
  const buttons = $$(".answer-btn");
  buttons.forEach((btn, i) => {
    btn.disabled = true;
    if (i === q.correct) btn.classList.add("correct");
    if (i === index && index !== q.correct) btn.classList.add("wrong");
  });
  const feedback = $("#feedback");
  if (index === q.correct) {
    playSfx("correct");
    quiz.score += GAME_DATA.scoring.correct;
    feedback.className = "feedback good";
    feedback.innerHTML = `Benar! +${GAME_DATA.scoring.correct} poin.<br>${q.explanation}`;
  } else {
    playSfx("wrong");
    feedback.className = "feedback bad";
    feedback.innerHTML = `Belum tepat. Jawaban yang benar adalah pilihan ${String.fromCharCode(65 + q.correct)}.<br>${q.explanation}`;
  }
  $("#quizScore").textContent = quiz.score;
  $("#btnNext").textContent = quiz.index === quiz.questions.length - 1 ? "Selesai" : "Lanjut";
  $("#btnNext").classList.remove("hidden");
}

function nextQuestion() {
  const quiz = state.currentQuiz;
  if (!quiz) return;
  if (quiz.index < quiz.questions.length - 1) {
    quiz.index += 1;
    $("#progressFill").style.width = `${quiz.index / quiz.questions.length * 100}%`;
    renderQuestion();
  } else {
    finishQuiz();
  }
}


function formatQuizTime(seconds) {
  const safe = Math.max(0, Number(seconds) || 0);
  const m = String(Math.floor(safe / 60)).padStart(2, "0");
  const sec = String(safe % 60).padStart(2, "0");
  return `${m}:${sec}`;
}

function startQuizTimer() {
  const quiz = state.currentQuiz;
  if (!quiz) return;
  clearQuizTimer();
  quiz.timerSeconds = QUIZ_TIME_LIMIT_SECONDS;
  quiz.timeUp = false;
  renderQuizTimer();
  quiz.timerInterval = setInterval(() => {
    if (!state.currentQuiz || state.currentQuiz !== quiz) return;
    quiz.timerSeconds -= 1;
    renderQuizTimer();
    if (quiz.timerSeconds <= 0) {
      handleQuizTimeUp();
    }
  }, 1000);
}

function renderQuizTimer() {
  const quiz = state.currentQuiz;
  const el = $("#quizCountdown");
  if (!el || !quiz) return;
  el.className = quiz.timerSeconds <= 10 ? "quiz-countdown urgent" : "quiz-countdown";
  el.innerHTML = `Waktu: <b>${formatQuizTime(quiz.timerSeconds)}</b>`;
}

function handleQuizTimeUp() {
  const quiz = state.currentQuiz;
  if (!quiz || quiz.timeUp) return;
  quiz.timeUp = true;
  clearQuizTimer();
  $$(".answer-btn").forEach(btn => { btn.disabled = true; btn.classList.add("locked"); });
  const feedback = $("#feedback");
  if (feedback) {
    feedback.className = "feedback bad";
    feedback.innerHTML = `Waktu habis! Skor langsung dihitung: <b>${quiz.score}</b> poin.`;
  }
  setTimeout(() => {
    if (state.currentQuiz === quiz) finishQuiz({ timedOut: true });
  }, 900);
}

function clearQuizTimer() {
  const quiz = state.currentQuiz;
  if (quiz?.timerInterval) {
    clearInterval(quiz.timerInterval);
    quiz.timerInterval = null;
  }
}


function finishQuiz(options = {}) {
  clearQuizTimer();
  const quiz = state.currentQuiz;
  if (!quiz) return;
  const oldScore = state.progress.games[quiz.gameId]?.score || 0;
  const delta = Math.max(0, quiz.score - oldScore);
  state.progress.score += delta;
  state.progress.games[quiz.gameId] = {
    finished: true,
    score: Math.max(oldScore, quiz.score),
    finishedAt: new Date().toISOString()
  };
  saveProgress();
  hideModal("quizModal");
  state.screen = "game";
  state.currentQuiz = null;
  renderHud();
  renderCaves();

  const allDone = GAME_DATA.caves.every(c => state.progress.games[c.id]?.finished);
  if (allDone) showFinishModal();
  else {
    playMusic("start");
    const message = options.timedOut
      ? `Waktu habis! Skor ${quiz.score} poin di ${quiz.cave.shortTitle} sudah dihitung. Cari goa berikutnya!`
      : `Selesai! Kamu mendapat ${quiz.score} poin di ${quiz.cave.shortTitle}. Cari goa berikutnya!`;
    showHint(message);
  }
}

function closeQuiz() {
  if (!confirm("Kembali ke map? Skor mini game yang belum selesai tidak akan disimpan.")) return;
  clearQuizTimer();
  clearMovementInput();
  hideModal("quizModal");
  state.currentQuiz = null;
  state.screen = "game";
  playMusic("start");
}

function showFinishModal() {
  playMusic("finish", { loop: false });
  const maxScore = GAME_DATA.caves.length * 5 * GAME_DATA.scoring.correct;
  const score = state.progress.score;
  let pred = "Penjelajah Pemula";
  if (score >= maxScore * 0.9) pred = "Ahli Geometri Kota Lama";
  else if (score >= maxScore * 0.7) pred = "Penjelajah Hebat";
  else if (score >= maxScore * 0.5) pred = "Penjelajah Berkembang";
  $("#finishText").innerHTML = `${state.progress.name}, total skormu <b>${score}</b> dari ${maxScore}.<br>Predikat: <b>${pred}</b>.`;
  const wrap = $("#finishBadges");
  wrap.innerHTML = "";
  GAME_DATA.caves.forEach(cave => {
    const div = document.createElement("div");
    div.className = "finish-badge";
    div.textContent = cave.badge;
    wrap.appendChild(div);
  });
  showModal("finishModal");
}


function isTypingTarget(target) {
  if (!target) return false;
  const editable = target.closest?.('input, textarea, select, [contenteditable="true"]');
  return Boolean(editable);
}

function clearMovementInput() {
  state.keys.clear();
  state.joystick.active = false;
  state.joystick.x = 0;
  state.joystick.y = 0;
  const stick = $("#joystickStick");
  if (stick) stick.style.transform = "translate(-50%, -50%)";
  if (state.player.moving) {
    state.player.moving = false;
    updatePlayerStyle();
  }
}

function showHint(text) {
  const panel = $("#interaction");
  $("#interactionTitle").textContent = text;
  $("#interactionSubtitle").textContent = "";
  $("#btnEnterCave").classList.add("hidden");
  panel.classList.remove("hidden");
  setTimeout(() => {
    $("#btnEnterCave").classList.remove("hidden");
  }, 1300);
}

function openGuideModal() {
  state.guideIndex = 0;
  renderGuideSlide();
  showModal("guideModal");
}

function changeGuideSlide(direction) {
  state.guideIndex = clamp(state.guideIndex + direction, 0, GUIDE_SLIDES.length - 1);
  renderGuideSlide();
}

function renderGuideSlide() {
  const slide = GUIDE_SLIDES[state.guideIndex];
  if (!slide) return;
  $("#guideSlideIndex").textContent = `Slide ${state.guideIndex + 1} / ${GUIDE_SLIDES.length}`;
  $("#guideSlideTitle").textContent = slide.title;
  $("#guideSlideSubtitle").textContent = slide.subtitle || "";
  $("#guideSlideBody").innerHTML = slide.body || "";
  $("#guideSlideNote").textContent = slide.note || "";

  const mediaWrap = $("#guideSlideMedia");
  mediaWrap.innerHTML = "";
  (slide.media || []).forEach(item => {
    const fig = document.createElement("figure");
    fig.className = "guide-figure";
    const img = document.createElement("img");
    img.src = item.src;
    img.alt = item.label || slide.title;
    const cap = document.createElement("figcaption");
    cap.textContent = item.label || "";
    fig.appendChild(img);
    fig.appendChild(cap);
    mediaWrap.appendChild(fig);
  });

  const prev = $("#guidePrev");
  const next = $("#guideNext");
  prev.disabled = state.guideIndex === 0;
  next.disabled = state.guideIndex === GUIDE_SLIDES.length - 1;
}

function showModal(id) { $("#" + id).classList.remove("hidden"); }
function hideModal(id) { $("#" + id).classList.add("hidden"); }
function hideAllModals() { $$(".modal").forEach(m => m.classList.add("hidden")); }
function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }

window.addEventListener("load", init);
