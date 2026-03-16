import { state, saveState } from "../core/state.js";
import {
  formatDigitalTime,
  formatOffsetLabel,
  getCenterTime
} from "../core/timeUtils.js";
import { createTimelineRow, renderTimelineHeader } from "../timeline/timelineRender.js";
import { enableCityDrag } from "../features/dragCity.js";

export function renderApp() {
  const container = document.getElementById("rowsContainer");
  if (!container) return;

  container.innerHTML = "";
  renderTimelineHeader();

  const centerTime = getCenterTime(state.offsetMinutes);

  for (const city of state.cities) {
    const row = document.createElement("div");
    row.className = "city-row";
    row.dataset.cityId = city.id;

    const cityCell = document.createElement("div");
    cityCell.className = "city-col";

    const dragHandle = document.createElement("div");
    dragHandle.className = "drag-handle";
    dragHandle.title = "ドラッグして並び替え";
    dragHandle.textContent = "⋮⋮";

    const cityInfo = document.createElement("div");
    cityInfo.className = "city-info";

    const cityLabel = document.createElement("div");
    cityLabel.className = "city-label";
    cityLabel.textContent = city.city;

    const timezoneLabel = document.createElement("div");
    timezoneLabel.className = "timezone-label";
    timezoneLabel.textContent = formatOffsetLabel(city.timezone);

    cityInfo.appendChild(cityLabel);
    cityInfo.appendChild(timezoneLabel);

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-btn";
    deleteBtn.type = "button";
    deleteBtn.title = `${city.city} を削除`;
    deleteBtn.textContent = "×";

    deleteBtn.addEventListener("click", () => {
      const ok = confirm(`${city.city} を削除しますか？`);
      if (!ok) return;

      state.cities = state.cities.filter((c) => c.id !== city.id);
      saveState();
      renderApp();
    });

    cityCell.appendChild(dragHandle);
    cityCell.appendChild(cityInfo);
    cityCell.appendChild(deleteBtn);

    const digitalCell = document.createElement("div");
    digitalCell.className = "digital-col";
    digitalCell.textContent = formatDigitalTime(centerTime, city.timezone);

    const timelineCell = document.createElement("div");
    timelineCell.className = "timeline-col";
    timelineCell.appendChild(createTimelineRow(city));

    row.appendChild(cityCell);
    row.appendChild(digitalCell);
    row.appendChild(timelineCell);

    container.appendChild(row);
  }

  enableCityDrag();
}