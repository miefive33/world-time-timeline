import { state, saveState } from "../core/state.js";
import { renderApp } from "../ui/renderRows.js";

const PIXELS_PER_MINUTE = 0.8;

export function initTimelineDrag() {
  const container = document.getElementById("rowsContainer");
  if (!container) return;

  let isDragging = false;
  let startX = 0;
  let startOffset = 0;
  let activePointerId = null;

  container.addEventListener("pointerdown", (e) => {
    const track = e.target.closest(".timeline-track");
    if (!track) return;

    e.preventDefault();

    isDragging = true;
    state.isDragging = true;

    startX = e.clientX;
    startOffset = state.offsetMinutes;

    activePointerId = e.pointerId;
    container.setPointerCapture(activePointerId);
  });

  container.addEventListener("pointermove", (e) => {
    if (!isDragging) return;
    if (e.pointerId !== activePointerId) return;

    const dx = e.clientX - startX;

    // ✅ ここが最重要修正ポイント
    const minutes = dx * -PIXELS_PER_MINUTE;
    state.offsetMinutes = startOffset + minutes;

    // ✅ transformは使わない（ズレの原因になる）
    renderApp();
  });

  container.addEventListener("pointerup", finish);
  container.addEventListener("pointercancel", finish);
  container.addEventListener("pointerleave", finish);

  function finish(e) {
    if (!isDragging) return;
    if (e.pointerId !== activePointerId) return;

    isDragging = false;
    state.isDragging = false;

    try {
      container.releasePointerCapture(activePointerId);
    } catch {}

    // ✅ 最終状態を保存
    saveState();

    activePointerId = null;
  }
}