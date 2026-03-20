export function pad2(v) {
  return String(v).padStart(2, "0");
}

export function getCenterTime(offsetMinutes = 0) {
  return new Date(Date.now() + offsetMinutes * 60000);
}

export function getZonedParts(date, timezone) {
  const dtf = new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  });

  const parts = dtf.formatToParts(date);
  const map = {};

  for (const p of parts) {
    if (p.type !== "literal") {
      map[p.type] = p.value;
    }
  }

  return map;
}

export function formatDigitalTime(centerTime, timezone) {
  const date = new Date(centerTime);

  const formatter = new Intl.DateTimeFormat("ja-JP", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const dateFormatter = new Intl.DateTimeFormat("ja-JP", {
    timeZone: timezone,
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  });

  const timeStr = formatter.format(date);
  const dateStr = dateFormatter.format(date);

  return `${timeStr} | ${dateStr}`;
}

export function formatOffsetLabel(timezone) {
  const now = new Date();

  const tzFormatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    timeZoneName: "shortOffset",
    hour: "2-digit"
  });

  const parts = tzFormatter.formatToParts(now);
  const tzName = parts.find((p) => p.type === "timeZoneName")?.value || timezone;

  return `${timezone} (${tzName})`;
}