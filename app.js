const STORAGE_KEY = "worldTimelineClockState_v1";
const HOUR_WIDTH = 92;
const HOUR_COUNT = 24;
const HALF_HOUR_WIDTH = HOUR_WIDTH / 2;
const DEFAULT_WORK_START = 9;
const DEFAULT_WORK_END = 18;

const cityCatalog = [
  { id: "tokyo", label: "Japan", city: "Tokyo", country: "Japan", timezone: "Asia/Tokyo" },
  { id: "chicago", label: "USA", city: "Chicago", country: "United States", timezone: "America/Chicago" },
  { id: "new-york", label: "USA", city: "New York", country: "United States", timezone: "America/New_York" },
  { id: "milan", label: "Italy", city: "Milano", country: "Italy", timezone: "Europe/Rome" },
  { id: "london", label: "UK", city: "London", country: "United Kingdom", timezone: "Europe/London" },
  { id: "vietnam", label: "Vietnam", city: "Ho Chi Minh", country: "Vietnam", timezone: "Asia/Ho_Chi_Minh" },
  { id: "beijing", label: "China", city: "Beijing", country: "China", timezone: "Asia/Shanghai" },
  { id: "shanghai", label: "China", city: "Shanghai", country: "China", timezone: "Asia/Shanghai" },
  { id: "singapore", label: "Singapore", city: "Singapore", country: "Singapore", timezone: "Asia/Singapore" },
  { id: "berlin", label: "Germany", city: "Berlin", country: "Germany", timezone: "Europe/Berlin" },
  { id: "paris", label: "France", city: "Paris", country: "France", timezone: "Europe/Paris" },
  { id: "los-angeles", label: "USA", city: "Los Angeles", country: "United States", timezone: "America/Los_Angeles" },
  { id: "bangkok", label: "Thailand", city: "Bangkok", country: "Thailand", timezone: "Asia/Bangkok" },
  { id: "delhi", label: "India", city: "Delhi", country: "India", timezone: "Asia/Kolkata" },
  { id: "sydney", label: "Australia", city: "Sydney", country: "Australia", timezone: "Australia/Sydney" },
];

const defaultCities = ["tokyo", "chicago", "milan", "london", "vietnam"];

const state = {
  cities: [],
  offsetMinutes: 0,
  dragCityId: null,
  timelineDrag: {
    active: false,
    startX: 0,
    startOffset: 0,
  },
};

const refs = {
  rowsContainer: document.getElementById("rowsContainer"),
  rowTemplate: document.getElementById("rowTemplate"),
  timelineHours: document.getElementById("timelineHours"),
  nowBtn: document.getElementById("nowBtn"),
  addCityBtn: document.getElementById("addCityBtn"),
  addCityModal: document.getElementById("addCityModal"),
  closeModalBtn: document.getElementById("closeModalBtn"),
  citySearchInput: document.getElementById("citySearchInput"),
  citySearchResults: document.getElementById("citySearchResults"),
};

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      state.cities = defaultCities.map(getCatalogItemById).filter(Boolean);
      return;
    }
    const parsed = JSON.parse(raw);
    state.offsetMinutes = Number(parsed.offsetMinutes ?? 0);
    state.cities = (parsed.cities ?? [])
      .map((item) => {
        if (item.id) {
          const found = getCatalogItemById(item.id);
          if (found) return found;
        }
        if (item.timezone && item.city) return item;
        return null;
      })
      .filter(Boolean);
    if (!state.cities.length) {
      state.cities = defaultCities.map(getCatalogItemById).filter(Boolean);
    }
  } catch (err) {
    console.error("Failed to load state", err);
    state.cities = defaultCities.map(getCatalogItemById).filter(Boolean);
  }
}

function saveState() {
  const payload = {
    offsetMinutes: Math.round(state.offsetMinutes),
    cities: state.cities.map((c) => ({
      id: c.id,
      label: c.label,
      city: c.city,
      country: c.country,
      timezone: c.timezone,
    })),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

function getCatalogItemById(id) {
  return cityCatalog.find((item) => item.id === id);
}

function pad2(value) {
  return String(value).padStart(2, "0");
}

function getCenterTime() {
  return new Date(Date.now() + state.offsetMinutes * 60_000);
}

function getZonedParts(date, timezone) {
  const dtf = new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = dtf.formatToParts(date);
  const map = {};
  parts.forEach((p) => {
    if (p.type !== "literal") map[p.type] = p.value;
  });
  return map;
}

function getHourAt(date, timezone) {
  return Number(getZonedParts(date, timezone).hour);
}

function formatDigital(date, timezone) {
  const parts = getZonedParts(date, timezone);
  return {
    time: `${parts.hour}:${parts.minute}`,
    date: `${parts.weekday} ${parts.day}/${parts.month}/${parts.year}`,
  };
}

function renderTimelineHeader() {
  refs.timelineHours.innerHTML = "";
  const centerTime = getCenterTime();
  const totalWidth = HOUR_WIDTH * HOUR_COUNT;
  const startUtcMs = centerTime.getTime() - 12 * 60 * 60 * 1000;
  for (let i = 0; i <= HOUR_COUNT; i++) {
    const ms = startUtcMs + i * 60 * 60 * 1000;
    const dt = new Date(ms);
    const hh = pad2(dt.getHours());
    const label = document.createElement("div");
    label.className = "hour-label";
    label.style.left = `${i * HOUR_WIDTH}px`;
    label.textContent = `${hh}:00`;
    refs.timelineHours.appendChild(label);
  }
  refs.timelineHours.style.width = `${totalWidth}px`;
}

function createTimelineRow(city) {
  const wrapper = document.createElement("div");
  wrapper.className = "timeline-row";
  wrapper.style.width = `${HOUR_WIDTH * HOUR_COUNT}px`;

  const centerTime = getCenterTime();
  const startUtcMs = centerTime.getTime() - 12 * 60 * 60 * 1000;

  for (let i = 0; i < HOUR_COUNT; i++) {
    const segDate = new Date(startUtcMs + i * 60 * 60 * 1000);
    const localHour = getHourAt(segDate, city.timezone);

    const seg = document.createElement("div");
    seg.className = `segment ${localHour >= 6 && localHour < 18 ? "day" : "night"}`;
    seg.style.left = `${i * HOUR_WIDTH}px`;
    seg.style.width = `${HOUR_WIDTH}px`;
    wrapper.appendChild(seg);

    const hourLine = document.createElement("div");
    hourLine.className = "hour-line";
    hourLine.style.left = `${i * HOUR_WIDTH}px`;
    wrapper.appendChild(hourLine);

    const halfLine = document.createElement("div");
    halfLine.className = "half-hour-line";
    halfLine.style.left = `${i * HOUR_WIDTH + HALF_HOUR_WIDTH}px`;
    wrapper.appendChild(halfLine);
  }

  const lastLine = document.createElement("div");
  lastLine.className = "hour-line";
  lastLine.style.left = `${HOUR_WIDTH * HOUR_COUNT}px`;
  wrapper.appendChild(lastLine);

  const workBlock = document.createElement("div");
  workBlock.className = "work-block";

  const centerLocal = getZonedParts(centerTime, city.timezone);
  const centerDate = {
    year: Number(centerLocal.year),
    month: Number(centerLocal.month),
    day: Number(centerLocal.day),
  };

  const startOffsetHours = computeRelativeHourOffset(
    centerTime,
    city.timezone,
    centerDate.year,
    centerDate.month,
    centerDate.day,
    DEFAULT_WORK_START,
    0
  );

  const endOffsetHours = computeRelativeHourOffset(
    centerTime,
    city.timezone,
    centerDate.year,
    centerDate.month,
    centerDate.day,
    DEFAULT_WORK_END,
    0
  );

  const left = (HOUR_COUNT / 2 + startOffsetHours) * HOUR_WIDTH;
  const width = (endOffsetHours - startOffsetHours) * HOUR_WIDTH;

  workBlock.style.left = `${left}px`;
  workBlock.style.width = `${Math.max(width, 18)}px`;
  workBlock.textContent = "Work";
  wrapper.appendChild(workBlock);

  const centerLine = document.createElement("div");
  centerLine.className = "center-line";
  wrapper.appendChild(centerLine);

  const chip = document.createElement("div");
  chip.className = "current-chip";
  chip.textContent = `${city.city}`;
  wrapper.appendChild(chip);

  return wrapper;
}

function computeRelativeHourOffset(baseUtcDate, timezone, year, month, day, hour, minute) {
  const targetUtc = zonedDateTimeToUtc(year, month, day, hour, minute, timezone);
  return (targetUtc.getTime() - baseUtcDate.getTime()) / 3600000;
}

function zonedDateTimeToUtc(year, month, day, hour, minute, timezone) {
  const approxUtc = new Date(Date.UTC(year, month - 1, day, hour, minute, 0));
  const offsetMinutes = getTimezoneOffsetMinutes(approxUtc, timezone);
  return new Date(Date.UTC(year, month - 1, day, hour, minute, 0) - offsetMinutes * 60000);
}

function getTimezoneOffsetMinutes(date, timezone) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(date).reduce((acc, part) => {
    if (part.type !== "literal") acc[part.type] = part.value;
    return acc;
  }, {});

  const asUTC = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second)
  );

  return (asUTC - date.getTime()) / 60000;
}

function renderRows() {
  refs.rowsContainer.innerHTML = "";
  const centerTime = getCenterTime();

  state.cities.forEach((city) => {
    const fragment = refs.rowTemplate.content.cloneNode(true);
    const row = fragment.querySelector(".city-row");
    const cityLabel = fragment.querySelector(".city-label");
    const timezoneLabel = fragment.querySelector(".timezone-label");
    const digitalTime = fragment.querySelector(".digital-time");
    const digitalDate = fragment.querySelector(".digital-date");
    const timelineCell = fragment.querySelector(".timeline-cell");
    const timelineMount = fragment.querySelector(".timeline-row");
    const deleteBtn = fragment.querySelector(".delete-btn");

    row.dataset.cityId = city.id || `${city.timezone}_${city.city}`;
    cityLabel.textContent = `${city.label} (${city.city})`;
    timezoneLabel.textContent = city.timezone;

    const digital = formatDigital(centerTime, city.timezone);
    digitalTime.textContent = digital.time;
    digitalDate.textContent = digital.date;

    timelineMount.replaceWith(createTimelineRow(city));

    deleteBtn.addEventListener("click", () => {
      state.cities = state.cities.filter((item) => item !== city);
      saveState();
      renderApp();
    });

    attachTimelineDrag(timelineCell);

    row.addEventListener("dragstart", () => {
      state.dragCityId = row.dataset.cityId;
      row.classList.add("dragging");
    });

    row.addEventListener("dragend", () => {
      state.dragCityId = null;
      row.classList.remove("dragging");
      document.querySelectorAll(".city-row").forEach((el) => el.classList.remove("drag-over"));
    });

    row.addEventListener("dragover", (event) => {
      event.preventDefault();
      row.classList.add("drag-over");
    });

    row.addEventListener("dragleave", () => {
      row.classList.remove("drag-over");
    });

    row.addEventListener("drop", (event) => {
      event.preventDefault();
      row.classList.remove("drag-over");
      reorderCities(state.dragCityId, row.dataset.cityId);
    });

    refs.rowsContainer.appendChild(fragment);
  });
}

function reorderCities(sourceId, targetId) {
  if (!sourceId || !targetId || sourceId === targetId) return;
  const fromIndex = state.cities.findIndex((c) => (c.id || `${c.timezone}_${c.city}`) === sourceId);
  const toIndex = state.cities.findIndex((c) => (c.id || `${c.timezone}_${c.city}`) === targetId);
  if (fromIndex < 0 || toIndex < 0) return;
  const [moved] = state.cities.splice(fromIndex, 1);
  state.cities.splice(toIndex, 0, moved);
  saveState();
  renderApp();
}

function attachTimelineDrag(timelineCell) {
  const onPointerDown = (event) => {
    if (event.button !== undefined && event.button !== 0) return;
    state.timelineDrag.active = true;
    state.timelineDrag.startX = event.clientX ?? event.touches?.[0]?.clientX ?? 0;
    state.timelineDrag.startOffset = state.offsetMinutes;
    timelineCell.classList.add("dragging-timeline");
  };

  const onPointerMove = (event) => {
    if (!state.timelineDrag.active) return;
    const clientX = event.clientX ?? event.touches?.[0]?.clientX ?? 0;
    const deltaX = clientX - state.timelineDrag.startX;
    state.offsetMinutes = state.timelineDrag.startOffset - (deltaX / HOUR_WIDTH) * 60;
    renderApp();
  };

  const onPointerUp = () => {
    if (!state.timelineDrag.active) return;
    state.timelineDrag.active = false;
    document.querySelectorAll(".timeline-cell").forEach((el) => el.classList.remove("dragging-timeline"));
    saveState();
  };

  timelineCell.onmousedown = onPointerDown;
  timelineCell.ontouchstart = onPointerDown;
  window.addEventListener("mousemove", onPointerMove);
  window.addEventListener("touchmove", onPointerMove, { passive: true });
  window.addEventListener("mouseup", onPointerUp);
  window.addEventListener("touchend", onPointerUp);
}

function renderApp() {
  renderTimelineHeader();
  renderRows();
}

function openModal() {
  refs.addCityModal.classList.remove("hidden");
  refs.addCityModal.setAttribute("aria-hidden", "false");
  refs.citySearchInput.value = "";
  renderSearchResults("");
  refs.citySearchInput.focus();
}

function closeModal() {
  refs.addCityModal.classList.add("hidden");
  refs.addCityModal.setAttribute("aria-hidden", "true");
}

function renderSearchResults(query) {
  const q = query.trim().toLowerCase();
  const existingIds = new Set(state.cities.map((c) => c.id));
  const filtered = cityCatalog.filter((city) => {
    if (existingIds.has(city.id)) return false;
    if (!q) return true;
    return [
      city.label,
      city.city,
      city.country,
      city.timezone,
    ].join(" ").toLowerCase().includes(q);
  });

  refs.citySearchResults.innerHTML = "";
  if (!filtered.length) {
    refs.citySearchResults.innerHTML = `<div class="empty-state">該当する都市がありません。地球は広いけど、検索語は狭かったようです。</div>`;
    return;
  }

  filtered.forEach((city) => {
    const item = document.createElement("button");
    item.className = "search-item";
    item.type = "button";
    item.innerHTML = `
      <div>
        <strong>${city.label} (${city.city})</strong>
        <div class="meta">${city.country} · ${city.timezone}</div>
      </div>
      <div class="badge">Add</div>
    `;
    item.addEventListener("click", () => {
      state.cities.push(city);
      saveState();
      renderApp();
      renderSearchResults(refs.citySearchInput.value);
    });
    refs.citySearchResults.appendChild(item);
  });
}

function bindEvents() {
  refs.nowBtn.addEventListener("click", () => {
    state.offsetMinutes = 0;
    saveState();
    renderApp();
  });

  refs.addCityBtn.addEventListener("click", openModal);
  refs.closeModalBtn.addEventListener("click", closeModal);

  refs.addCityModal.addEventListener("click", (event) => {
    if (event.target === refs.addCityModal) closeModal();
  });

  refs.citySearchInput.addEventListener("input", (event) => {
    renderSearchResults(event.target.value);
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeModal();
  });
}

function startClockLoop() {
  setInterval(() => {
    renderApp();
  }, 1000);
}

function init() {
  loadState();
  bindEvents();
  renderApp();
  startClockLoop();
}

init();
