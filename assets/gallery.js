async function loadProjects() {
  const grid = document.getElementById("grid");
  const emptyState = document.getElementById("empty-state");
  const countEl = document.getElementById("project-count");

  let projects = [];
  try {
    const res = await fetch("projects.json", { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    projects = await res.json();
  } catch (err) {
    grid.hidden = true;
    emptyState.hidden = false;
    emptyState.textContent =
      "projects.json konnte nicht geladen werden. Lokal? Starte einen kleinen Server (siehe README) statt die Datei direkt zu öffnen.";
    console.error("Konnte projects.json nicht laden:", err);
    return;
  }

  if (projects.length === 0) {
    grid.hidden = true;
    emptyState.hidden = false;
    return;
  }

  countEl.textContent = `${projects.length} Projekt${projects.length === 1 ? "" : "e"}`;

  const fragment = document.createDocumentFragment();
  for (const project of projects) {
    fragment.appendChild(renderCard(project));
  }
  grid.appendChild(fragment);
}

function renderCard(project) {
  const card = document.createElement("a");
  card.className = "card";
  card.href = project.url;

  const thumb = document.createElement("div");
  thumb.className = "card-thumb";
  if (project.thumbnail) {
    const img = document.createElement("img");
    img.src = project.thumbnail;
    img.alt = "";
    img.loading = "lazy";
    thumb.appendChild(img);
  } else {
    thumb.classList.add("card-thumb--placeholder");
    thumb.style.setProperty("--hue", String(hueFromString(project.title)));
    thumb.textContent = initials(project.title);
  }

  const body = document.createElement("div");
  body.className = "card-body";

  const title = document.createElement("h2");
  title.className = "card-title";
  title.textContent = project.title;

  body.appendChild(title);

  if (project.description) {
    const desc = document.createElement("p");
    desc.className = "card-desc";
    desc.textContent = project.description;
    body.appendChild(desc);
  }

  if (project.tags && project.tags.length > 0) {
    const tags = document.createElement("div");
    tags.className = "card-tags";
    for (const tag of project.tags) {
      const chip = document.createElement("span");
      chip.className = "tag";
      chip.textContent = tag;
      tags.appendChild(chip);
    }
    body.appendChild(tags);
  }

  card.appendChild(thumb);
  card.appendChild(body);
  return card;
}

function initials(title) {
  return title
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

function hueFromString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % 360;
}

loadProjects();
