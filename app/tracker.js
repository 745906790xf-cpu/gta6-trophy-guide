const STORAGE_KEY = "leonida-trophy-progress-v1";

export function loadEarned() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(list) ? list : []);
  } catch {
    return new Set();
  }
}

export function saveEarned(earned) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...earned]));
}

export function gradeCounts(trophies, earned) {
  const grades = ["platinum", "gold", "silver", "bronze"];
  const out = {};
  for (const g of grades) {
    const total = trophies.filter((t) => t.grade === g).length;
    const got = trophies.filter((t) => t.grade === g && earned.has(t.name)).length;
    out[g] = { got, total };
  }
  return out;
}

export function renderProgress(el, trophies, earned) {
  const total = trophies.length;
  const got = earned.size;
  const pct = total ? Math.round((got / total) * 100) : 0;
  const counts = gradeCounts(trophies, earned);
  el.innerHTML = "";
  const big = document.createElement("div");
  big.className = "big";
  big.textContent = `${got} of ${total} earned · ${pct}%`;
  const bar = document.createElement("div");
  bar.className = "bar";
  const fill = document.createElement("div");
  fill.className = "fill";
  fill.style.width = `${pct}%`;
  bar.append(fill);
  const grades = document.createElement("div");
  grades.className = "grades";
  grades.innerHTML = `Platinum <b>${counts.platinum.got}/${counts.platinum.total}</b> · Gold <b>${counts.gold.got}/${counts.gold.total}</b> · Silver <b>${counts.silver.got}/${counts.silver.total}</b> · Bronze <b>${counts.bronze.got}/${counts.bronze.total}</b> · Remaining <b>${total - got}</b>`;
  el.append(big, bar, grades);
}

export function isSpoilerHidden(trophy, earned, spoilerOn) {
  if (!spoilerOn) return false;
  if (earned.has(trophy.name)) return false;
  return Boolean(trophy.hidden);
}

export function matchesFilters(trophy, filters, earned) {
  if (filters.kind !== "all" && trophy.kind !== filters.kind) return false;
  if (filters.grade !== "all" && trophy.grade !== filters.grade) return false;
  if (filters.status === "earned" && !earned.has(trophy.name)) return false;
  if (filters.status === "remaining" && earned.has(trophy.name)) return false;
  if (filters.query) {
    const q = filters.query.toLowerCase();
    const hay = `${trophy.name} ${trophy.description} ${trophy.guide}`.toLowerCase();
    if (!hay.includes(q)) return false;
  }
  return true;
}

export function renderRows(tbody, trophies, earned, filters, selectedName, onToggle, onSelect) {
  tbody.replaceChildren();
  const visible = trophies.filter((t) => matchesFilters(t, filters, earned));
  for (const t of visible) {
    const tr = document.createElement("tr");
    if (earned.has(t.name)) tr.classList.add("earned");
    if (t.name === selectedName) tr.classList.add("selected");
    const tdCheck = document.createElement("td");
    tdCheck.className = "c-earned";
    const box = document.createElement("input");
    box.type = "checkbox";
    box.checked = earned.has(t.name);
    box.setAttribute("aria-label", `Mark ${t.name} earned`);
    box.addEventListener("click", (e) => e.stopPropagation());
    box.addEventListener("change", () => onToggle(t.name, box.checked));
    tdCheck.append(box);
    const tdName = document.createElement("td");
    const hide = isSpoilerHidden(t, earned, filters.spoiler);
    const nameEl = document.createElement("div");
    nameEl.className = "tname";
    nameEl.textContent = hide ? "Hidden trophy" : t.name;
    const descEl = document.createElement("div");
    descEl.className = "tdesc";
    descEl.textContent = hide ? "Name and description hidden until earned (spoiler-safe is on)." : t.description;
    tdName.append(nameEl, descEl);
    const tdGrade = document.createElement("td");
    const pill = document.createElement("span");
    pill.className = `pill ${t.grade}`;
    pill.textContent = t.grade;
    tdGrade.append(pill);
    const tdKind = document.createElement("td");
    const kp = document.createElement("span");
    kp.className = "pill kindpill";
    kp.textContent = t.kind;
    tdKind.append(kp);
    const tdFlag = document.createElement("td");
    if (t.missable) {
      const f = document.createElement("span");
      f.className = "flag miss";
      f.textContent = "MISSABLE";
      tdFlag.append(f);
    }
    if (t.hidden) {
      const f = document.createElement("span");
      f.className = "flag hid";
      f.textContent = "HIDDEN";
      tdFlag.append(f);
    }
    tr.append(tdCheck, tdName, tdGrade, tdKind, tdFlag);
    tr.addEventListener("click", () => onSelect(t.name));
    tbody.append(tr);
  }
  return visible.length;
}

export function exportProgress(earned) {
  const payload = JSON.stringify({ earned: [...earned], exportedAt: "leonida-trophy-guide" }, null, 2);
  const url = URL.createObjectURL(new Blob([payload], { type: "application/json" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = "leonida-trophy-progress.json";
  a.click();
  URL.revokeObjectURL(url);
}

export async function importProgress(file, validNames) {
  const text = await file.text();
  const data = JSON.parse(text);
  const list = Array.isArray(data) ? data : data.earned;
  if (!Array.isArray(list)) throw new Error("bad file");
  return new Set(list.filter((n) => validNames.has(n)));
}
