import { state, saveState } from "../core/state.js";
import { renderApp } from "../ui/renderRows.js";

export function initCitySearch() {
  const btn = document.getElementById("addCityBtn");
  if (!btn) return;

  btn.addEventListener("click", () => {
    const city = prompt("都市名を入力してください\n例: Paris");
    if (!city) return;

    const timezone = prompt(
      "IANA Timezone を入力してください\n例: Europe/Paris"
    );
    if (!timezone) return;

    try {
      new Intl.DateTimeFormat("ja-JP", { timeZone: timezone }).format(new Date());
    } catch {
      alert("Timezone が不正です。例: Europe/Paris");
      return;
    }

    state.cities.push({
      id: crypto.randomUUID(),
      city: city.trim(),
      timezone: timezone.trim()
    });

    saveState();
    renderApp();
  });
}