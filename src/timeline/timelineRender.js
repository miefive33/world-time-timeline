import { state } from "../core/state.js";
import { getCenterTime, getZonedParts } from "../core/timeUtils.js";

/* ========================= */

function getConfig() {
  const isMobile = window.innerWidth <= 768;

  return {
    HOUR_WIDTH: isMobile ? 48 : 92,
    HOUR_COUNT: isMobile ? 9 : 13
  };
}

let { HOUR_WIDTH, HOUR_COUNT } = getConfig();

const WORK_START = 9;
const WORK_END = 18;

/* =========================
   共通
   ========================= */

function getTimelineWidth() {
  return HOUR_WIDTH * HOUR_COUNT;
}

function getCenterTimeRounded() {
  const t = getCenterTime(state.offsetMinutes);
  t.setSeconds(0, 0);
  return t;
}

function getXFromTime(targetTime, centerTime) {
  const minutePx = HOUR_WIDTH / 60;
  const centerPx = getTimelineWidth() / 2;
  const diffMinutes = (targetTime.getTime() - centerTime.getTime()) / 60000;
  return centerPx + diffMinutes * minutePx;
}

function buildHourAnchors(centerTime) {
  const anchors = [];

  const start = new Date(centerTime);
  start.setMinutes(0, 0, 0);
  start.setHours(start.getHours() - Math.floor(HOUR_COUNT / 2) - 2);

  const end = new Date(centerTime);
  end.setMinutes(0, 0, 0);
  end.setHours(end.getHours() + Math.ceil(HOUR_COUNT / 2) + 2);

  for (let d = new Date(start); d <= end; d.setHours(d.getHours() + 1)) {
    anchors.push(new Date(d));
  }

  return anchors;
}

/* =========================
   ヘッダー
   ========================= */

export function renderTimelineHeader() {
  const header = document.getElementById("timelineHours");
  if (!header) return;

  header.innerHTML = "";

  const baseCity = state.cities[0];
  if (!baseCity) return;

  const centerTime = getCenterTimeRounded();
  const timelineWidth = getTimelineWidth();

  const headerInner = document.querySelector(".timeline-header-inner");
  if (headerInner) {
    headerInner.style.width = `${timelineWidth}px`;
  }

  const anchors = buildHourAnchors(centerTime);

  anchors.forEach((d) => {
    const x = getXFromTime(d, centerTime);

    if (x < -40 || x > timelineWidth + 40) return;

    const parts = getZonedParts(d, baseCity.timezone);

    const label = document.createElement("div");
    label.className = "hour-label";
    label.style.left = `${x}px`;
    label.textContent = `${parts.hour}:00`;

    header.appendChild(label);
  });
}

/* =========================
   行
   ========================= */

export function createTimelineRow(city) {
  const wrapper = document.createElement("div");
  wrapper.className = "timeline-track";
  wrapper.style.width = `${getTimelineWidth()}px`;

  const centerTime = getCenterTimeRounded();
  const timelineWidth = getTimelineWidth();
  const anchors = buildHourAnchors(centerTime);

  anchors.forEach((d) => {
    const x = getXFromTime(d, centerTime);

    if (x > timelineWidth || x + HOUR_WIDTH < 0) return;

    const parts = getZonedParts(d, city.timezone);
    const hour = Number(parts.hour);

    let cls = "night";
    if (hour >= 6 && hour < 22) cls = "day";
    if (hour >= WORK_START && hour < WORK_END) cls = "work";

    const seg = document.createElement("div");
    seg.className = `segment ${cls}`;
    seg.style.left = `${x}px`;
    seg.style.width = `${HOUR_WIDTH}px`;
    wrapper.appendChild(seg);

    const hourLine = document.createElement("div");
    hourLine.className = "hour-line";
    hourLine.style.left = `${x}px`;
    wrapper.appendChild(hourLine);

    const halfLine = document.createElement("div");
    halfLine.className = "half-hour-line";
    halfLine.style.left = `${x + HOUR_WIDTH / 2}px`;
    wrapper.appendChild(halfLine);
  });

  const centerLine = document.createElement("div");
  centerLine.className = "center-line";
  wrapper.appendChild(centerLine);

  return wrapper;
}

/* ========================= */

window.addEventListener("resize", () => {
  const config = getConfig();
  HOUR_WIDTH = config.HOUR_WIDTH;
  HOUR_COUNT = config.HOUR_COUNT;

  renderTimelineHeader();
});