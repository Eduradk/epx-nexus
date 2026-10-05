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

// ---- Download dette afsnit som Word / PowerPoint / PDF ----
if (sektion) EpxExport.attachMenu(document.getElementById("printBtn"), () => bygSektionEksport(sektionId));

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

// ---- Udarbejd dit eget med AI: PowerPoint eller Word-dokument, der passer til forløbet ----
// AI'en skriver indholdet (api/produkt.js), og filen bygges i browseren af export.js.
const PRODUKT_TYPER = {
  powerpoint: {
    hint: "Beskriv, hvad PowerPointen skal handle om. AI'en udarbejder en præsentation, der passer til forløbet. Du henter den som .pptx-fil og kan selv redigere den i PowerPoint bagefter.",
    placeholder: "Fx: En præsentation, der introducerer forløbet og de vigtigste begreber for eleverne",
    btn: "📊 Udarbejd PowerPoint",
    busy: "📊 Udarbejder PowerPoint …",
    faerdig: (t) => "✅ PowerPointen \"" + t + "\" er hentet ned til din computer (kig i mappen \"Overførsler\"/\"Downloads\"). Åbn den i PowerPoint for at redigere."
  },
  word: {
    hint: "Beskriv, hvad dokumentet skal handle om. AI'en udarbejder et dokument, der passer til forløbet. Du henter det som .docx-fil og kan selv redigere det i Word bagefter.",
    placeholder: "Fx: Et opgaveark til eleverne med fem spørgsmål til casen",
    btn: "📄 Udarbejd Word-dokument",
    busy: "📄 Udarbejder Word-dokument …",
    faerdig: (t) => "✅ Word-dokumentet \"" + t + "\" er hentet ned til din computer (kig i mappen \"Overførsler\"/\"Downloads\"). Åbn det i Word for at redigere."
  }
};

(function () {
  const blok = document.getElementById("produktBlok");
  if (!sektion || sektionId !== "materialer") return;
  blok.hidden = false;

  const vaelger = document.getElementById("produktVaelger");
  const hint = document.getElementById("produktHint");
  const beskrivelse = document.getElementById("produktBeskrivelse");
  const knap = document.getElementById("produktBtn");
  const status = document.getElementById("produktStatus");
  let valgt = "powerpoint";

  function vaelg(type) {
    valgt = type;
    vaelger.querySelectorAll("button").forEach((b) => b.classList.toggle("active", b.dataset.type === type));
    hint.textContent = PRODUKT_TYPER[type].hint;
    beskrivelse.placeholder = PRODUKT_TYPER[type].placeholder;
    knap.textContent = PRODUKT_TYPER[type].btn;
    status.hidden = true;
  }
  vaelger.querySelectorAll("button").forEach((b) => b.addEventListener("click", () => vaelg(b.dataset.type)));
  vaelg(valgt);

  function visStatus(tekst, erFejl) {
    status.textContent = tekst;
    status.style.color = erFejl ? "#b42318" : "";
    status.hidden = false;
  }

  knap.addEventListener("click", async () => {
    const tekst = beskrivelse.value.trim();
    if (!tekst) {
      beskrivelse.focus();
      return;
    }
    const type = valgt;
    const cfg = PRODUKT_TYPER[type];
    knap.disabled = true;
    knap.textContent = cfg.busy;
    visStatus("⏳ AI'en skriver indholdet. Det tager typisk under et minut …");

    try {
      const res = await fetch("/api/produkt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: samlInputTilAI(), forslag: hentForslag(), format: type, beskrivelse: tekst })
      });
      const svar = await res.json().catch(() => ({}));
      if (!res.ok || !svar.produkt) throw new Error(svar.fejl || "Serveren svarede med fejl " + res.status + ".");

      const p = svar.produkt;
      const dok = {
        filename: p.title,
        kind: type === "powerpoint" ? "Præsentation" : "Undervisningsmateriale",
        title: p.title,
        subtitle: p.subtitle || "",
        meta: eksportMeta(),
        // Samme opbygning til begge filtyper: hvert slide/afsnit er en overskrift med tekst (punkter starter med "- ")
        sections: type === "powerpoint"
          ? p.slides.map((s) => ({ heading: s.heading, body: (s.bullets || []).map((b) => "- " + b).join("\n") }))
          : p.sections.map((s) => ({ heading: s.heading, body: s.body }))
      };
      await (type === "powerpoint" ? EpxExport.toPowerPoint(dok) : EpxExport.toWord(dok));
      visStatus(cfg.faerdig(p.title));
      beskrivelse.value = "";
    } catch (err) {
      visStatus("⚠️ " + (err.message || "Kunne ikke udarbejde materialet. Prøv igen om lidt."), true);
    } finally {
      knap.disabled = false;
      knap.textContent = PRODUKT_TYPER[valgt].btn;
    }
  });
})();
