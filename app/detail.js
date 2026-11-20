export function renderDetail(el, trophy, earned, spoilerOn) {
  el.replaceChildren();
  if (!trophy) {
    const p = document.createElement("p");
    p.className = "empty";
    p.textContent = "Select a trophy to see its full guide and sources here.";
    el.append(p);
    return;
  }
  const hide = spoilerOn && trophy.hidden && !earned.has(trophy.name);
  const h = document.createElement("h2");
  h.textContent = hide ? "Hidden trophy" : trophy.name;
  const meta = document.createElement("div");
  meta.className = "meta";
  meta.textContent = hide
    ? `Grade: ${trophy.grade} · Kind: ${trophy.kind} · Stage ${trophy.stage} · Hidden on PlayStation`
    : `"${trophy.description}" · Grade: ${trophy.grade} · Kind: ${trophy.kind} · Stage ${trophy.stage}${trophy.missable ? " · MISSABLE" : ""}${trophy.hidden ? " · Hidden on PlayStation" : ""} · ${earned.has(trophy.name) ? "Earned ✓" : "Not earned yet"}`;
  const guide = document.createElement("p");
  guide.textContent = hide
    ? "Spoiler-safe is on, so this hidden trophy's name, description and guide stay concealed until you earn it. Tick it off in the checklist once earned, or turn spoiler-safe off to read ahead."
    : trophy.guide;
  el.append(h, meta, guide);
  if (!hide) {
    const src = document.createElement("div");
    src.className = "src";
    const sh = document.createElement("h3");
    sh.textContent = "Sources for this guide";
    const ul = document.createElement("ul");
    for (const s of trophy.sources || []) {
      const li = document.createElement("li");
      li.textContent = s;
      ul.append(li);
    }
    const note = document.createElement("p");
    note.textContent = "Guide written in original words for this entry from the official description; sources are cited by name and are not fetched by the app.";
    src.append(sh, ul, note);
    el.append(src);
  }
}
