export const STAGES = [
  { stage: 1, title: "Stage 1 — Story chapters in order", why: "Play the campaign from Gone Fishing through Chapters 1–4 and the named story missions to the final mission. These trophies unlock by finishing missions, so they come first. Make a manual save before the final mission so missable windows stay reachable." },
  { stage: 2, title: "Stage 2 — Missables before points of no return", why: "Earn these during the story while their windows are open: partner trophies while your partner is available, VCIA and Rhino story beats, the early Ocean Beach moment, the showroom exit, and the vague story-moment trophies. They are flagged MISSABLE in both views. Do not start the final mission until this stage is clear." },
  { stage: 3, title: "Stage 3 — Collectibles sweep", why: "Clear the location and collection trophies area by area: meditation spots, card sets, WAiNK It locations, vehicle discovery, full Leonida exploration, garage properties and Scooter Bros registrations. Combine sweeps so one trip covers several trophies." },
  { stage: 4, title: "Stage 4 — Activities, strangers & cleanup to 100%", why: "Finish everything left: stunts, shooting range golds, races, drone races, fishing, arcade, all stranger strands, challenges, robberies, money grinds and combat feats. End this stage with 100% completion (A Long Road)." },
  { stage: 5, title: "Stage 5 — Platinum", why: "Vice Got a Price! unlocks automatically when the other 54 trophies are earned. Nothing extra to do — it is always last." },
];

export function renderRoadmap(el, trophies, earned, spoilerOn, onSelect) {
  el.replaceChildren();
  for (const s of STAGES) {
    const items = trophies.filter((t) => t.stage === s.stage);
    const done = items.filter((t) => earned.has(t.name)).length;
    const box = document.createElement("section");
    box.className = "roadmap-stage";
    const h = document.createElement("h2");
    h.textContent = `${s.title} — ${done}/${items.length} earned`;
    const why = document.createElement("p");
    why.className = "why";
    why.textContent = s.why;
    const grid = document.createElement("div");
    grid.className = "roadmap-grid";
    for (const t of items) {
      const card = document.createElement("div");
      card.className = "roadmap-item";
      const hide = spoilerOn && t.hidden && !earned.has(t.name);
      const rn = document.createElement("div");
      rn.className = "rn";
      rn.textContent = `${earned.has(t.name) ? "✓ " : ""}${hide ? "Hidden trophy" : t.name} (${t.grade})`;
      const rd = document.createElement("div");
      rd.className = "rd";
      rd.textContent = hide ? "Hidden until earned." : t.description;
      card.append(rn, rd);
      if (t.missable) {
        const f = document.createElement("span");
        f.className = "flag miss";
        f.textContent = "MISSABLE";
        card.append(f);
      }
      card.addEventListener("click", () => onSelect(t.name));
      grid.append(card);
    }
    box.append(h, why, grid);
    el.append(box);
  }
}
