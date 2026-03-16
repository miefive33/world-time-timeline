import { state } from "../core/state.js";
import { getCenterTime, getZonedParts } from "../core/timeUtils.js";

const HOUR_WIDTH = 92;
const HOUR_COUNT = 13;
const HALF_HOUR_WIDTH = HOUR_WIDTH / 2;

const WORK_START = 9
const WORK_END = 18

function buildTimelineHours() {
  const centerTime = getCenterTime(state.offsetMinutes);
  const hours = [];

  const start = new Date(centerTime);
  start.setMinutes(0, 0, 0);
  start.setHours(start.getHours() - 6);

  for (let i = 0; i < HOUR_COUNT; i++) {
    const d = new Date(start);
    d.setHours(start.getHours() + i);
    hours.push(d);
  }

  return hours;
}

export function renderTimelineHeader() {
  const header = document.getElementById("timelineHours");
  if (!header) return;

  header.innerHTML = "";

  const baseCity = state.cities[0];
  if (!baseCity) return;

  const hours = buildTimelineHours();
  const centerTime = getCenterTime(state.offsetMinutes);
  const minuteOffset = centerTime.getMinutes();
  const minutePx = HOUR_WIDTH / 60;
  const offsetPx = minuteOffset * minutePx;

  hours.forEach((d, i) => {
    const parts = getZonedParts(d, baseCity.timezone);

    const label = document.createElement("div");
    label.className = "hour-label";
    label.style.left = `${i * HOUR_WIDTH + HOUR_WIDTH/2 - offsetPx}px`;
    label.textContent = `${parts.hour}:00`;

    header.appendChild(label);
  });
}

export function createTimelineRow(city) {
  const wrapper = document.createElement("div");
  wrapper.className = "timeline-track";

  const hours = buildTimelineHours();
  const centerTime = getCenterTime(state.offsetMinutes);
  const minuteOffset = centerTime.getMinutes();
  const minutePx = HOUR_WIDTH / 60;
  const offsetPx = minuteOffset * minutePx;

  hours.forEach((date, i) => {
    const parts = getZonedParts(date, city.timezone);
    const localHour = Number(parts.hour);

    const seg = document.createElement("div");

    let cls = "night"
    if(localHour >= 6 && localHour < 22)
    cls = "day"
    if(localHour >= WORK_START && localHour < WORK_END)
    cls = "work"
    seg.className = `segment ${cls}`

    seg.style.left = `${i * HOUR_WIDTH - offsetPx}px`;
    seg.style.width = `${HOUR_WIDTH}px`;
    wrapper.appendChild(seg);

    const hourLine = document.createElement("div");
    hourLine.className = "hour-line";
    hourLine.style.left = `${i * HOUR_WIDTH - offsetPx}px`;
    wrapper.appendChild(hourLine);

    const halfLine = document.createElement("div");
    halfLine.className = "half-hour-line";
    halfLine.style.left = `${i * HOUR_WIDTH + HALF_HOUR_WIDTH - offsetPx}px`;
    wrapper.appendChild(halfLine);
  });

  const lastLine = document.createElement("div");
  lastLine.className = "hour-line";
  lastLine.style.left = `${HOUR_WIDTH * HOUR_COUNT - offsetPx}px`;
  wrapper.appendChild(lastLine);

  const centerLine = document.createElement("div")
  centerLine.className = "center-line"
  wrapper.appendChild(centerLine)

  if(state.meetingHour !== null){
    const meet = document.createElement("div")
    meet.className = "meeting-line"
    meet.style.left =
        (state.meetingHour * HOUR_WIDTH) + "px"
    wrapper.appendChild(meet)
  }

  const chip = document.createElement("div");
  chip.className = "current-chip";
  chip.textContent = city.city;
  wrapper.appendChild(chip);

  wrapper.addEventListener("click",(e)=>{
    const rect = wrapper.getBoundingClientRect()
    const x = e.clientX - rect.left
    const hour = Math.floor(x / HOUR_WIDTH)
    state.meetingHour = hour
  })

  return wrapper; 

}