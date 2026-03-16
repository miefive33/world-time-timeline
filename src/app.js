import { loadState, state } from "./core/state.js";
import { renderApp } from "./ui/renderRows.js";
import { initCitySearch } from "./features/citySearch.js";
import { initTimelineDrag } from "./features/dragTimeline.js";

function initNowButton() {
  const nowBtn = document.getElementById("nowBtn");
  if (!nowBtn) return;

  nowBtn.addEventListener("click", () => {
    state.offsetMinutes = 0;
    renderApp();
  });
}

function startClockLoop() {
  setInterval(() => {
    if (!state.timelineDrag.active) {
      renderApp();
    }
  }, 250);
}

function addLocalCity(){

  const tz =
    Intl.DateTimeFormat()
      .resolvedOptions()
      .timeZone

  state.cities.unshift({

    id:"local",
    city:"Local",
    timezone:tz

  })

}

function init() {
  addLocalCity()
  loadState();
  initCitySearch();
  initTimelineDrag();
  initNowButton();
  renderApp();
  startClockLoop();
}

init();