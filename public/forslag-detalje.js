const params = new URLSearchParams(window.location.search);
const sektionId = params.get("sektion");
let sektion = hentForslagSektioner().find((s) => s.id === sektionId);

const sektionTitelEl = document.getElementById("sektionTitel");
const detailBody = document.getElementById("detailBody");
const detailToolbar = document.getElementById("detailToolbar");
const aiBadgeHolder = document.getElementById("aiBadgeHolder");
document.getElementById("printDate").textContent = new Date().toLocaleDateString("da-DK");

function getUdstyrChecked() {
  return EpxState.get().udstyrChecked || {};
}

function setUdstyrChecked(navn, checked) {
  const map = getUdstyrChecked();
  map[navn] = checked;
  EpxState.set("udstyrChecked", map);
}

function renderKrop() {
  const krop = sektion.krop || [];

  detailBody.innerHTML = "";
  aiBadgeHolder.innerHTML = "";

  if (sektion.liste) {
    const ul = document.createElement("ul");
    sektion.liste.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      ul.appendChild(li);
    });
    detailBody.appendChild(ul);
  }

  krop.forEach((afsnit) => {
    const p = document.createElement("p");
    p.textContent = afsnit;
    detailBody.appendChild(p);
  });

  if (sektion.henvisninger) {
    const heading = document.createElement("h3");
    heading.className = "henvisninger-heading";
    heading.textContent = "Henvisninger";
    detailBody.appendChild(heading);

    const ul = document.createElement("ul");
    ul.className = "henvisning-list";
    sektion.henvisninger.forEach((h) => {
      const li = document.createElement("li");
      li.className = "henvisning-item";
      // AI-tekst indsættes som tekst (ikke HTML)
      li.innerHTML = '<span class="henvisning-ikon"></span><div><div class="henvisning-titel"></div><div class="henvisning-kilde"></div></div>';
      li.querySelector(".henvisning-ikon").textContent = h.ikon;
      li.querySelector(".henvisning-titel").textContent = h.titel;
      li.querySelector(".henvisning-kilde").textContent = h.kilde + " · " + h.type;
      ul.appendChild(li);
    });
    detailBody.appendChild(ul);
  }
}

function renderUdstyr() {
  aiBadgeHolder.innerHTML = "";
  const checkedMap = getUdstyrChecked();

  const intro = document.createElement("p");
  intro.textContent = "Krydsen af, hvad I allerede har på skolen. Det, der ikke er krydset af, kan hentes som en samlet indkøbsseddel.";
  detailBody.innerHTML = "";
  detailBody.appendChild(intro);

  const ul = document.createElement("ul");
  ul.className = "udstyr-list";
  sektion.udstyr.forEach((vare) => {
    const checked = !!checkedMap[vare.navn];
    const li = document.createElement("li");
    li.className = "udstyr-item" + (checked ? " checked" : "");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = checked;
    checkbox.addEventListener("change", () => {
      setUdstyrChecked(vare.navn, checkbox.checked);
      li.classList.toggle("checked", checkbox.checked);
      status.textContent = checkbox.checked ? "På lager" : "Skal bestilles";
    });

    const textWrap = document.createElement("div");
    textWrap.className = "udstyr-text";
    const name = document.createElement("div");
    name.className = "udstyr-name";
    name.textContent = vare.navn;
    const meta = document.createElement("div");
    meta.className = "udstyr-meta";
    meta.textContent = vare.antal;
    textWrap.appendChild(name);
    textWrap.appendChild(meta);

    const tagWrap = document.createElement("div");
    tagWrap.className = "udstyr-tags";

    const tag = document.createElement("span");
    tag.className = "udstyr-tag";
    tag.textContent = vare.kategori;

    const status = document.createElement("span");
    status.className = "udstyr-status";
    status.textContent = checked ? "På lager" : "Skal bestilles";

    tagWrap.appendChild(tag);
    tagWrap.appendChild(status);

    li.appendChild(checkbox);
    li.appendChild(textWrap);
    li.appendChild(tagWrap);
    ul.appendChild(li);
  });
  detailBody.appendChild(ul);

  const orderBtn = document.createElement("button");
  orderBtn.type = "button";
  orderBtn.className = "btn-tool";
  orderBtn.style.marginTop = "16px";
  orderBtn.textContent = "📋 Hent indkøbsseddel (kun manglende varer)";
  orderBtn.addEventListener("click", () => {
    document.body.classList.add("print-order-mode");
    window.print();
    setTimeout(() => document.body.classList.remove("print-order-mode"), 500);
  });
  detailBody.appendChild(orderBtn);
}

function renderMaterialer() {
  aiBadgeHolder.innerHTML = "";
  detailBody.innerHTML = "";

  const varsel = document.createElement("p");
  varsel.className = "ai-varsel";
  varsel.textContent = AI_VARSEL;
  detailBody.appendChild(varsel);

  genererMaterialer().forEach((m) => {
    const card = document.createElement("div");
    card.className = "materiale-kort";

    const header = document.createElement("div");
    header.className = "materiale-header";
    const typeTag = document.createElement("span");
    typeTag.className = "materiale-type";
    typeTag.textContent = m.ikon + " " + m.type;
    const aiTag = document.createElement("span");
    aiTag.className = "materiale-ai-tag";
    aiTag.textContent = "🤖 AI-genereret";
    header.appendChild(typeTag);
    header.appendChild(aiTag);
    card.appendChild(header);

    const titel = document.createElement("h3");
    titel.textContent = m.titel;
    card.appendChild(titel);

    m.krop.forEach((afsnit) => {
      const p = document.createElement("p");
      p.textContent = afsnit;
      card.appendChild(p);
    });

    const trace = document.createElement("p");
    trace.className = "materiale-baseret-paa";
    trace.textContent = "Baseret på dine valg: " + m.baseretPaa;
    card.appendChild(trace);

    detailBody.appendChild(card);
  });
}

function render() {
  if (!sektion) {
    sektionTitelEl.textContent = "Afsnit ikke fundet";
    detailToolbar.hidden = true;
    detailBody.innerHTML = "<p>Dette afsnit findes ikke (længere). Gå tilbage til forslaget for at prøve igen.</p>";
    return;
  }
  sektionTitelEl.textContent = sektion.ikon + " " + sektion.titel;
  if (sektion.id === "udstyr") {
    document.getElementById("editToggleBtn").hidden = true;
    renderUdstyr();
  } else if (sektion.id === "materialer") {
    document.getElementById("editToggleBtn").hidden = true;
    renderMaterialer();
  } else {
    renderKrop();
  }
}
render();

// ---- Print ----
document.getElementById("printBtn").addEventListener("click", () => window.print());

// ---- Justering: én ændring (AI eller manuel) tilpasser HELE forslaget, så alle afsnit passer sammen ----
const aiToggleBtn = document.getElementById("aiToggleBtn");
const aiAssist = document.getElementById("aiAssist");
const aiGenerateBtn = document.getElementById("aiGenerateBtn");
const aiInstruction = document.getElementById("aiInstruction");
const editToggleBtn = document.getElementById("editToggleBtn");
const editArea = document.getElementById("editArea");
const editTextarea = document.getElementById("editTextarea");
const saveEditBtn = document.getElementById("saveEditBtn");

function visBesked(tekst, punkter, erFejl) {
  aiBadgeHolder.innerHTML = "";
  const boks = document.createElement("div");
  boks.className = "toast-banner";
  if (erFejl) boks.style.borderColor = "#b42318";
  const indhold = document.createElement("div");
  const p = document.createElement("strong");
  p.textContent = tekst;
  indhold.appendChild(p);
  if (punkter && punkter.length) {
    const ul = document.createElement("ul");
    ul.style.margin = "6px 0 0 18px";
    punkter.forEach((t) => {
      const li = document.createElement("li");
      li.textContent = t;
      ul.appendChild(li);
    });
    indhold.appendChild(ul);
  }
  boks.appendChild(indhold);
  const luk = document.createElement("button");
  luk.type = "button";
  luk.textContent = "✕";
  luk.addEventListener("click", () => boks.remove());
  boks.appendChild(luk);
  aiBadgeHolder.appendChild(boks);
}

// Sender ændringen + hele forslaget til serveren og erstatter forslaget med det tilpassede
async function justerHeleForslaget(aendring) {
  const knapper = [aiGenerateBtn, saveEditBtn, aiToggleBtn, editToggleBtn];
  knapper.forEach((b) => { b.disabled = true; });
  aiAssist.hidden = true;
  editArea.hidden = true;
  aiToggleBtn.classList.remove("active");
  editToggleBtn.classList.remove("active");
  visBesked("⏳ Justerer hele forløbet, så alle afsnit passer sammen med ændringen. Det tager typisk 30-90 sekunder …");
  window.scrollTo({ top: 0, behavior: "smooth" });

  let svar;
  try {
    const res = await fetch("/api/juster", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.assign({ input: samlInputTilAI(), forslag: hentForslag(), sektion: sektionId }, aendring))
    });
    svar = await res.json().catch(() => ({ fejl: "Serveren svarede ikke som forventet (" + res.status + ")." }));
  } catch (e) {
    svar = { fejl: "Kunne ikke få forbindelse til serveren. Tjek din internetforbindelse, og prøv igen." };
  } finally {
    knapper.forEach((b) => { b.disabled = false; });
  }

  if (!svar.forslag) {
    visBesked("⚠️ " + (svar.fejl || "Justeringen mislykkedes.") + " Forslaget er uændret.", null, true);
    return false;
  }
  EpxState.set("forslag", svar.forslag);
  sektion = hentForslagSektioner().find((s) => s.id === sektionId);
  render();
  visBesked("✅ Hele forløbet er tilpasset. Det er ændret:", svar.aendringer);
  return true;
}

aiToggleBtn.addEventListener("click", () => {
  aiAssist.hidden = !aiAssist.hidden;
  aiToggleBtn.classList.toggle("active", !aiAssist.hidden);
  editArea.hidden = true;
  editToggleBtn.classList.remove("active");
  if (!aiAssist.hidden) aiInstruction.focus();
});

aiGenerateBtn.addEventListener("click", async () => {
  const instruktion = aiInstruction.value.trim();
  if (!instruktion) {
    aiInstruction.focus();
    return;
  }
  if (await justerHeleForslaget({ instruktion: instruktion })) aiInstruction.value = "";
});

editToggleBtn.addEventListener("click", () => {
  editTextarea.value = (sektion.krop || []).join("\n\n");
  editArea.hidden = false;
  editToggleBtn.classList.add("active");
  aiAssist.hidden = true;
  aiToggleBtn.classList.remove("active");
});

document.getElementById("cancelEditBtn").addEventListener("click", () => {
  editArea.hidden = true;
  editToggleBtn.classList.remove("active");
});

saveEditBtn.addEventListener("click", () => {
  const nyKrop = editTextarea.value
    .split(/\n\s*\n/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (!nyKrop.length) return;
  justerHeleForslaget({ manuelKrop: nyKrop });
});
