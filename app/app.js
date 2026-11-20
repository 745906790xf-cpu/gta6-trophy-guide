import { loadEarned, saveEarned, renderProgress, renderRows, exportProgress, importProgress } from "./tracker.js";
import { renderRoadmap } from "./roadmap.js";
import { renderDetail } from "./detail.js";

const rowsEl = document.getElementById("rows");
const detailEl = document.getElementById("detail");
const progressEl = document.getElementById("progressbox");
const roadmapEl = document.getElementById("roadmap");
const kindEl = document.getElementById("kind");
const gradeEl = document.getElementById("grade");
const statusEl = document.getElementById("status");
const searchEl = document.getElementById("search");
const spoilerEl = document.getElementById("spoiler");
const hintEl = document.getElementById("listhint");
const viewTracker = document.getElementById("view-tracker");
const viewRoadmap = document.getElementById("view-roadmap");
const tabTracker = document.getElementById("tab-tracker");
const tabRoadmap = document.getElementById("tab-roadmap");

let earned = loadEarned();
let trophies = [];
let selectedName = null;
let view = "tracker";

function currentFilters() {
  return {
    kind: kindEl.value,
    grade: gradeEl.value,
    status: statusEl.value,
    query: searchEl.value.trim(),
    spoiler: spoilerEl.checked,
  };
}

function selectedTrophy() {
  return trophies.find((t) => t.name === selectedName) || null;
}

function refresh() {
  renderProgress(progressEl, trophies, earned);
  const filters = currentFilters();
  const shown = renderRows(rowsEl, trophies, earned, filters, selectedName, onToggle, onSelect);
  hintEl.textContent = `Showing ${shown} of ${trophies.length} trophies. Tick to mark earned (saved in this browser). Click a row for its guide and sources.`;
  renderDetail(detailEl, selectedTrophy(), earned, filters.spoiler);
  renderRoadmap(roadmapEl, trophies, earned, filters.spoiler, onSelect);
  viewTracker.classList.toggle("hidden", view !== "tracker");
  viewRoadmap.classList.toggle("hidden", view !== "roadmap");
  tabTracker.classList.toggle("active", view === "tracker");
  tabRoadmap.classList.toggle("active", view === "roadmap");
}

function onToggle(name, checked) {
  if (checked) earned.add(name);
  else earned.delete(name);
  saveEarned(earned);
  refresh();
}

function onSelect(name) {
  selectedName = name;
  if (view === "roadmap") view = "tracker";
  refresh();
}

tabTracker.addEventListener("click", () => { view = "tracker"; refresh(); });
tabRoadmap.addEventListener("click", () => { view = "roadmap"; refresh(); });
for (const el of [kindEl, gradeEl, statusEl]) el.addEventListener("change", refresh);
searchEl.addEventListener("input", refresh);
spoilerEl.addEventListener("change", refresh);

document.getElementById("export").addEventListener("click", () => exportProgress(earned));
document.getElementById("import").addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    earned = await importProgress(file, new Set(trophies.map((t) => t.name)));
    saveEarned(earned);
    refresh();
  } catch {
    hintEl.textContent = "Import failed: that file was not valid progress JSON.";
  }
});
document.getElementById("reset").addEventListener("click", () => {
  earned = new Set();
  saveEarned(earned);
  refresh();
});

function applyShotScene() {
  const params = new URLSearchParams(location.search);
  const shot = params.get("shot");
  if (!shot) return;
  const seed = ["Just Like Paradise", "Paradise Lost", "T**s Ass Drug Money", "Trust", "Break the Bank", "Master of None", "Stick Fiddler", "Whip It Good", "Gunslinger", "A Classic Blitz Play", "Treat Yo Self", "Ten Pin"];
  earned = new Set(seed.filter((n) => trophies.some((t) => t.name === n)));
  if (shot === "checklist") {
    view = "tracker";
    selectedName = "The Shootist";
  } else if (shot === "roadmap") {
    view = "roadmap";
  } else if (shot === "spoiler") {
    view = "tracker";
    spoilerEl.checked = true;
    selectedName = "Snow Storm";
  } else if (shot === "collectibles") {
    view = "tracker";
    kindEl.value = "collectibles";
    selectedName = "Don't Touch My Deck";
  }
}

async function boot() {
  const doc = await (await fetch("data/trophies.json")).json();
  trophies = doc.trophies;
  applyShotScene();
  if (!selectedName && trophies.length) selectedName = "The Shootist";
  refresh();
}

boot();
