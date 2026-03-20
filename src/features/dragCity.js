import { state, saveState } from "../core/state.js";
import { renderApp } from "../ui/renderRows.js";

export function enableCityDrag() {
  const rows = document.querySelectorAll(".city-row");
  
  /* =========================
     PC（HTML5 Drag）
     ========================= */
  rows.forEach((row) => {
    const dragHandle = row.querySelector(".drag-handle");
    const cityId = row.dataset.cityId;

    if (!dragHandle || !cityId) return;

    // 🔥 重要：setAttributeじゃなくプロパティで制御
    dragHandle.draggable = state.isReorderMode;

    dragHandle.style.cursor = state.isReorderMode ? "grab" : "default";

    dragHandle.addEventListener("dragstart", (e) => {
      if (!state.isReorderMode) {
        e.preventDefault();
        return;
      }

      state.dragCityId = cityId;
      row.classList.add("dragging-city");

      if (e.dataTransfer) {
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", cityId);
      }
    });

    dragHandle.addEventListener("dragend", () => {
      row.classList.remove("dragging-city");
      rows.forEach((r) => r.classList.remove("drag-over"));
      trash?.classList.remove("active");
    });

    row.addEventListener("dragover", (e) => {
      if (!state.isReorderMode) return;
      if (!state.dragCityId || state.dragCityId === cityId) return;

      e.preventDefault();
      row.classList.add("drag-over");
    });

    row.addEventListener("dragleave", () => {
      row.classList.remove("drag-over");
    });

    row.addEventListener("drop", (e) => {
      if (!state.isReorderMode) return;

      e.preventDefault();
      row.classList.remove("drag-over");

      const fromId = state.dragCityId;
      const toId = cityId;

      if (!fromId || fromId === toId) return;

      const fromIndex = state.cities.findIndex((c) => c.id === fromId);
      const toIndex = state.cities.findIndex((c) => c.id === toId);

      if (fromIndex < 0 || toIndex < 0) return;

      const moved = state.cities.splice(fromIndex, 1)[0];
      state.cities.splice(toIndex, 0, moved);

      state.dragCityId = null;
      saveState();
      renderApp();
    });
  });

  
  /* =========================
     モバイル（タッチドラッグ）
     ========================= */
  let touchDraggingId = null;
  let lastSwapY = 0;
  const SWAP_THRESHOLD = 30; // ←ここで感度調整

  rows.forEach((row) => {
    const handle = row.querySelector(".drag-handle");
    const cityId = row.dataset.cityId;

    if (!handle) return;

    // ===== タッチ開始 =====
    handle.addEventListener("touchstart", (e) => {
      if (!state.isReorderMode) return;

      touchDraggingId = cityId;
      row.classList.add("dragging-city");

      lastSwapY = e.touches[0].clientY; // ←初期位置
    });

    // ===== タッチ移動 =====
    handle.addEventListener("touchmove", (e) => {
      if (!touchDraggingId) return;

      const touch = e.touches[0];
      const currentY = touch.clientY;

      // 🔥 しきい値（これが今回の改善）
      if (Math.abs(currentY - lastSwapY) < SWAP_THRESHOLD) return;

      const elem = document.elementFromPoint(touch.clientX, currentY);
      const targetRow = elem?.closest(".city-row");

      if (!targetRow) return;

      const targetId = targetRow.dataset.cityId;

      if (targetId && targetId !== touchDraggingId) {
        const fromIndex = state.cities.findIndex(c => c.id === touchDraggingId);
        const toIndex = state.cities.findIndex(c => c.id === targetId);

        if (fromIndex < 0 || toIndex < 0) return;

        const moved = state.cities.splice(fromIndex, 1)[0];
        state.cities.splice(toIndex, 0, moved);

        touchDraggingId = targetId;
        lastSwapY = currentY; // ←更新（重要）

        renderApp();
      }
    });

    // ===== タッチ終了 =====
    handle.addEventListener("touchend", () => {
      if (!touchDraggingId) return;

      touchDraggingId = null;
      saveState();
      renderApp();
    });
  });
}