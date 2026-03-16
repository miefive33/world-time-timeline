import { state, saveState } from "../core/state.js";
import { renderApp } from "../ui/renderRows.js";

const PIXELS_PER_MINUTE = 0.8;

export function initTimelineDrag() {
  const container = document.getElementById("rowsContainer");
  if (!container) return;

  container.addEventListener("pointerdown", (e) => {
    const track = e.target.closest(".timeline-track");
    if (!track) return;

    state.timelineDrag.active = true;
    state.timelineDrag.pointerId = e.pointerId;
    state.timelineDrag.startX = e.clientX;
    state.timelineDrag.startOffset = state.offsetMinutes;

    track.classList.add("dragging-time");
    track.setPointerCapture(e.pointerId);
  });

  container.addEventListener("pointermove", (e) => {
    if (!state.timelineDrag.active) return;

    const dx = e.clientX - state.timelineDrag.startX;
    const minutes = Math.round(dx * -PIXELS_PER_MINUTE);

    state.offsetMinutes = state.timelineDrag.startOffset + minutes;
    renderApp();
  });

  container.addEventListener("pointerup", (e) => {
    finishTimelineDrag(e);
  });

  container.addEventListener("pointercancel", (e) => {
    finishTimelineDrag(e);
  });

  function finishTimelineDrag(e) {
    if (!state.timelineDrag.active) return;

    state.timelineDrag.active = false;
    state.timelineDrag.pointerId = null;
    saveState();

    const track = e.target.closest?.(".timeline-track");
    if (track) {
      track.classList.remove("dragging-time");
    }
  }
}