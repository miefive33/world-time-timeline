import { state, saveState } from "../core/state.js";
import { renderApp } from "../ui/renderRows.js";

export function enableCityDrag() {
  const rows = document.querySelectorAll(".city-row");
  const trash = document.getElementById("trashBin");

  rows.forEach((row) => {
    const dragHandle = row.querySelector(".drag-handle");
    const cityId = row.dataset.cityId;

    if (!dragHandle || !cityId) return;

    dragHandle.setAttribute("draggable", "true");

    dragHandle.addEventListener("dragstart", (e) => {
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
      if (!state.dragCityId || state.dragCityId === cityId) return;
      e.preventDefault();
      row.classList.add("drag-over");
    });

    row.addEventListener("dragleave", () => {
      row.classList.remove("drag-over");
    });

    row.addEventListener("drop", (e) => {
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

  if (trash) {
    trash.addEventListener("dragover", (e) => {
      if (!state.dragCityId) return;
      e.preventDefault();
      trash.classList.add("active");
    });

    trash.addEventListener("dragleave", () => {
      trash.classList.remove("active");
    });

    trash.addEventListener("drop", (e) => {
      e.preventDefault();
      trash.classList.remove("active");

      if (!state.dragCityId) return;

      state.cities = state.cities.filter((c) => c.id !== state.dragCityId);
      state.dragCityId = null;
      saveState();
      renderApp();
    });
  }
}