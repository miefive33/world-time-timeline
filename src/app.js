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
    if (!state.timelineDrag?.active) {
      renderApp();
    }
  }, 250);
}

/* =========================
   ローカル都市
   ========================= */
function addLocalCity() {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

  state.cities.unshift({
    id: "local",
    city: "Local",
    timezone: tz
  });
}

/* =========================
   ★ モバイル専用ドラッグ（核心）
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
    const timeline = e.target.closest(".timeline-col");
    if (!timeline) return;

    activeTimeline = timeline;
    isDragging = true;
    lastX = e.touches[0].clientX;
    velocityPx = 0;
  }, { passive: true });

  document.addEventListener("touchmove", (e) => {
    if (!isDragging || !activeTimeline) return;

    const x = e.touches[0].clientX;
    const dx = x - lastX;
    lastX = x;

    velocityPx = dx;

    state.offsetMinutes -= dx * getMinutePerPixel();
    requestRender();
  }, { passive: true });

  document.addEventListener("touchend", () => {
    if (!isDragging) return;

    isDragging = false;
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
   INIT
   ========================= */
function init() {
  addLocalCity();
  loadState();

  window.__APP__ = {
    state,
  };

  initCitySearch();
  initTimelineDrag();

  if (window.innerWidth <= 768) {
    initMobileTimelineDrag();
  }

  initNowButton();
  renderApp();
  startClockLoop();
}

init();