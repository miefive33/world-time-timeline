import { state, saveState } from "../core/state.js";
import { renderApp } from "../ui/renderRows.js";

export function enableCityOrderButtons() {
  const rows = document.querySelectorAll(".city-row");

  rows.forEach((row, index) => {
    const cityId = row.dataset.cityId;

    const upBtn = row.querySelector(".move-up");
    const downBtn = row.querySelector(".move-down");

    if (upBtn) {
      upBtn.onclick = () => {
        if (index === 0) return;

        const tmp = state.cities[index];
        state.cities[index] = state.cities[index - 1];
        state.cities[index - 1] = tmp;

        saveState();
        renderApp();
      };
    }

    if (downBtn) {
      downBtn.onclick = () => {
        if (index === state.cities.length - 1) return;

        const tmp = state.cities[index];
        state.cities[index] = state.cities[index + 1];
        state.cities[index + 1] = tmp;

        saveState();
        renderApp();
      };
    }
  });
}