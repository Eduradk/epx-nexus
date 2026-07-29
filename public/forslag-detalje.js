const params = new URLSearchParams(window.location.search);
const sektionId = params.get("sektion");
const sektion = FORSLAG_SEKTIONER.find((s) => s.id === sektionId);

const sektionTitelEl = document.getElementById("sektionTitel");
const detailBody = document.getElementById("detailBody");
const detailToolbar = document.getElementById("detailToolbar");
const aiBadgeHolder = document.getElementById("aiBadgeHolder");
document.getElementById("printDate").textContent = new Date().toLocaleDateString("da-DK");

function getOverride() {
  const overrides = EpxState.get().forslagOverrides || {};
  return overrides[sektionId] || null;
}

function saveOverride(patch) {
  const data = EpxState.get();
  const overrides = data.forslagOverrides || {};
  overrides[sektionId] = Object.assign({}, overrides[sektionId], patch);
  EpxState.set("forslagOverrides", overrides);
}

function getUdstyrChecked() {
  return EpxState.get().udstyrChecked || {};
}

function setUdstyrChecked(navn, checked) {
  const map = getUdstyrChecked();
  map[navn] = checked;
  EpxState.set("udstyrChecked", map);
}

function renderKrop() {
  const override = getOverride();
  const krop = (override && override.krop) || sektion.krop || [];

  detailBody.innerHTML = "";
  aiBadgeHolder.innerHTML = "";

  if (override && override.aiJustering) {
    const badge = document.createElement("span");
    badge.className = "ai-badge";
    badge.textContent = "✨ AI-justeret";
    aiBadgeHolder.appendChild(badge);
  }

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
  } else {
    renderKrop();
  }
}
render();

// ---- Print ----
document.getElementById("printBtn").addEventListener("click", () => window.print());

// ---- AI-justering (mock) ----
const aiToggleBtn = document.getElementById("aiToggleBtn");
const aiAssist = document.getElementById("aiAssist");
const aiGenerateBtn = document.getElementById("aiGenerateBtn");
const aiInstruction = document.getElementById("aiInstruction");

if (aiToggleBtn) {
  aiToggleBtn.addEventListener("click", () => {
    aiAssist.hidden = !aiAssist.hidden;
    aiToggleBtn.classList.toggle("active", !aiAssist.hidden);
    document.getElementById("editArea").hidden = true;
    document.getElementById("editToggleBtn").classList.remove("active");
  });

  aiGenerateBtn.addEventListener("click", () => {
    const instruktion = aiInstruction.value.trim();
    if (!instruktion) {
      aiInstruction.focus();
      return;
    }
    aiGenerateBtn.disabled = true;
    aiGenerateBtn.textContent = "Genererer …";
    setTimeout(() => {
      const override = getOverride();
      const nuvaerendeKrop = (override && override.krop) || sektion.krop || [];
      const nyKrop = nuvaerendeKrop.concat([
        "AI-tilpasning ud fra din instruktion (\"" + instruktion + "\"): I den fulde version vil Claude her generere en ny, tilpasset tekst til dette afsnit."
      ]);
      saveOverride({ krop: nyKrop, aiJustering: true });
      renderKrop();
      aiAssist.hidden = true;
      aiToggleBtn.classList.remove("active");
      aiInstruction.value = "";
      aiGenerateBtn.disabled = false;
      aiGenerateBtn.textContent = "✨ Generér justering";
    }, 900);
  });
}

// ---- Manuel redigering ----
const editToggleBtn = document.getElementById("editToggleBtn");
const editArea = document.getElementById("editArea");
const editTextarea = document.getElementById("editTextarea");

if (editToggleBtn) {
  editToggleBtn.addEventListener("click", () => {
    const override = getOverride();
    const krop = (override && override.krop) || sektion.krop || [];
    editTextarea.value = krop.join("\n\n");
    editArea.hidden = false;
    editToggleBtn.classList.add("active");
    aiAssist.hidden = true;
    aiToggleBtn.classList.remove("active");
  });

  document.getElementById("cancelEditBtn").addEventListener("click", () => {
    editArea.hidden = true;
    editToggleBtn.classList.remove("active");
  });

  document.getElementById("saveEditBtn").addEventListener("click", () => {
    const nyKrop = editTextarea.value
      .split(/\n\s*\n/)
      .map((s) => s.trim())
      .filter(Boolean);
    saveOverride({ krop: nyKrop });
    renderKrop();
    editArea.hidden = true;
    editToggleBtn.classList.remove("active");
  });
}
