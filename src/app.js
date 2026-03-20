import { loadState, state } from "./core/state.js";
import { renderApp } from "./ui/renderRows.js";
import { initCitySearch } from "./features/citySearch.js";
import { initTimelineDrag } from "./features/dragTimeline.js";

/* =========================
   NOWボタン
   ========================= */
function initNowButton() {
  const nowBtn = document.getElementById("nowBtn");
  if (!nowBtn) return;

  nowBtn.addEventListener("click", () => {
    state.offsetMinutes = 0;
    renderApp();
  });
}

/* =========================
   時計更新
   ========================= */
function startClockLoop() {
  setInterval(() => {
    // ドラッグ中は再描画しない（重要）
    if (!state.isDragging) {
      renderApp();
    }
  }, 250);
}

/* =========================
   ローカル都市
   ========================= */
function addLocalCity() {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // 重複防止
  const exists = state.cities.find(c => c.id === "local");
  if (exists) return;

  state.cities.unshift({
    id: "local",
    city: "Local",
    timezone: tz
  });
}

/* =========================
   モバイル用タイムラインドラッグ
   ========================= */
function initMobileTimelineDrag() {
  let isDragging = false;
  let lastX = 0;
  let velocityPx = 0;
  let activeTimeline = null;
  let rafId = null;

  function getHourWidth() {
    return window.innerWidth <= 768 ? 48 : 92;
  }

  function getMinutePerPixel() {
    return 60 / getHourWidth();
  }

  function requestRender() {
    if (rafId) return;

    rafId = requestAnimationFrame(() => {
      rafId = null;
      renderApp();
    });
  }

  document.addEventListener("touchstart", (e) => {
    if (state.isReorderMode) return; // ★超重要
    const timeline = e.target.closest(".timeline-col");
    if (!timeline) return;

    activeTimeline = timeline;
    isDragging = true;
    state.isDragging = true;

    lastX = e.touches[0].clientX;
    velocityPx = 0;
  }, { passive: true });

  document.addEventListener("touchmove", (e) => {
    if (state.isReorderMode) return; // ★超重要
    if (!isDragging || !activeTimeline) return;

    const x = e.touches[0].clientX;
    const dx = x - lastX;
    lastX = x;

    velocityPx = dx;

    state.offsetMinutes -= dx * getMinutePerPixel();
    requestRender();
  }, { passive: true });

  document.addEventListener("touchend", () => {
    if (state.isReorderMode) return; // ★超重要
    if (!isDragging) return;

    isDragging = false;
    state.isDragging = false;
    activeTimeline = null;

    const decay = 0.92;

    function inertia() {
      if (Math.abs(velocityPx) < 0.15) {
        velocityPx = 0;
        return;
      }

      state.offsetMinutes -= velocityPx * getMinutePerPixel();
      velocityPx *= decay;

      renderApp();
      requestAnimationFrame(inertia);
    }

    inertia();
  }, { passive: true });
}

/* =========================
   並び替えモード切替
   ========================= */
function initReorderButton() {
  const btn = document.getElementById("reorderBtn");
  if (!btn) return;

  btn.onclick = () => {
    state.isReorderMode = !state.isReorderMode;

    btn.textContent = state.isReorderMode ? "Done" : "Reorder";

    // 見た目用クラス（任意）
    document.body.classList.toggle("reorder-mode", state.isReorderMode);

    renderApp();
  };
}

/* =========================
   INIT
   ========================= */
function init() {
  loadState();
  
  // 🔥 起動時は必ず現在時刻
  state.offsetMinutes = 0;

  if (state.cities.length === 0) {
    addLocalCity();
  }

  window.__APP__ = {
    state,
  };

  initCitySearch();
  initTimelineDrag();
  initMobileTimelineDrag(); // ←常に有効でOK（内部で分岐）

  initNowButton();
  initReorderButton();

  renderApp();
  startClockLoop();
}

init();