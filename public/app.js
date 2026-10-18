// Print af et gemt forløb låner midlertidigt kladden. Lå der en sikkerhedskopi fra sidst (fx lukket fane midt i print),
// lægges den tilbage, INDEN noget andet læser kladden.
(function () {
  const backup = localStorage.getItem("epxNexusPrintBackup");
  if (backup !== null && new URLSearchParams(window.location.search).get("utskrift") !== "1") {
    if (backup === "__none__") localStorage.removeItem("epxNexusData");
    else localStorage.setItem("epxNexusData", backup);
    localStorage.removeItem("epxNexusPrintBackup");
  }
})();

const stepItems = document.querySelectorAll("#stepList li");
const generateBtn = document.getElementById("generateBtn");
const suggestionEmpty = document.getElementById("suggestionEmpty");
const suggestionContent = document.getElementById("suggestionContent");
const suggestionEmptyHTML = suggestionEmpty.innerHTML;
// Download-menu (Word / PowerPoint / PDF) ved siden af print-knappen – vises først, når der er et forslag
const downloadMenu = EpxExport.attachMenu(document.getElementById("printAllBtn"), bygForslagEksport, {
  btnClass: "btn-icon-print",
  html: "⬇️",
  title: "Download hele forslaget som Word, PowerPoint eller PDF"
});
downloadMenu.hidden = true;
const genBadge = document.getElementById("genBadge");
const saerligeOensker = document.getElementById("saerligeOensker");
const charCount = document.getElementById("charCount");
const afklaringCard = document.getElementById("afklaringCard");
const afklaringSkipBtn = document.getElementById("afklaringSkipBtn");
let afklaringSkipped = false;

// Klik på trin i venstre menu markerer trinet som aktivt og scroller til tilhørende kort
stepItems.forEach((item) => {
  item.addEventListener("click", () => {
    stepItems.forEach((el) => el.classList.remove("active"));
    item.classList.add("active");
  });
});

// ---- Gem/genindlæs formularfelter, så de ikke nulstilles ved navigation til en underside og tilbage ----
function saveFormState() {
  EpxState.set("fag", document.getElementById("fag").value);
  EpxState.set("fagAndet", document.getElementById("fagAndet").value);
  EpxState.set("saerligeOensker", saerligeOensker.value);
  EpxState.set("afklaringsgrad", document.getElementById("afklaringsgrad").value);
  EpxState.set(
    "afklaringsfokus",
    Array.from(document.querySelectorAll('input[name="afklaringsfokus"]:checked')).map((cb) => cb.value)
  );
  EpxState.set("afklaringSkipped", afklaringSkipped);
}

function restoreFormState() {
  const data = EpxState.get();
  if (data.fag) {
    document.getElementById("fag").value = data.fag;
    document.getElementById("fagAndetWrap").hidden = data.fag !== "Andet fag";
  }
  if (data.fagAndet) document.getElementById("fagAndet").value = data.fagAndet;
  if (data.saerligeOensker) {
    saerligeOensker.value = data.saerligeOensker;
    charCount.textContent = data.saerligeOensker.length;
  }
  if (data.afklaringsgrad) document.getElementById("afklaringsgrad").value = data.afklaringsgrad;
  if (data.afklaringsfokus) {
    data.afklaringsfokus.forEach((val) => {
      const cb = document.querySelector('input[name="afklaringsfokus"][value="' + val + '"]');
      if (cb) cb.checked = true;
    });
  }
  if (data.afklaringSkipped) {
    afklaringSkipped = true;
    afklaringCard.classList.add("skipped");
    afklaringSkipBtn.classList.add("active");
    afklaringSkipBtn.textContent = "Fortryd – afklaring er relevant";
  }
}
restoreFormState();

// Tæller tegn i "Særlige ønsker"
saerligeOensker.addEventListener("input", () => {
  charCount.textContent = saerligeOensker.value.length;
  saveFormState();
});

// Markér trin som "gjort" når felterne udfyldes
function markProgress() {
  const afklaringsgrad = document.getElementById("afklaringsgrad").value;
  const afklaringsfokusValgt = document.querySelectorAll('input[name="afklaringsfokus"]:checked').length > 0;
  const fag = document.getElementById("fag").value;
  const fagAndet = document.getElementById("fagAndet").value.trim();
  const fagUdfyldt = fag && (fag !== "Andet fag" || fagAndet);
  stepItems.forEach((item) => {
    const step = Number(item.dataset.step);
    if (step === 1) item.classList.toggle("done", !!fagUdfyldt);
    if (step === 4) {
      if (afklaringSkipped || (afklaringsgrad && afklaringsfokusValgt)) {
        item.classList.add("done");
      } else {
        item.classList.remove("done");
      }
    }
  });
}
document.getElementById("afklaringsgrad").addEventListener("change", () => { markProgress(); saveFormState(); });
document.querySelectorAll('input[name="afklaringsfokus"]').forEach((cb) => {
  cb.addEventListener("change", () => { markProgress(); saveFormState(); });
});
document.getElementById("fag").addEventListener("change", () => { markProgress(); saveFormState(); });
document.getElementById("fagAndet").addEventListener("input", () => { markProgress(); saveFormState(); });
markProgress();

// "Dit fag": vis fritekstfelt, når "Andet fag" vælges
(function () {
  const fagSelect = document.getElementById("fag");
  const fagAndetWrap = document.getElementById("fagAndetWrap");
  const fagAndetInput = document.getElementById("fagAndet");

  fagSelect.addEventListener("change", () => {
    const erAndet = fagSelect.value === "Andet fag";
    fagAndetWrap.hidden = !erAndet;
    if (erAndet) {
      fagAndetInput.focus();
    } else {
      fagAndetInput.value = "";
    }
    markProgress();
  });
})();

// "Ikke relevant" markerer Afklaring som sprunget over for dette forløb
afklaringSkipBtn.addEventListener("click", () => {
  afklaringSkipped = !afklaringSkipped;
  afklaringCard.classList.toggle("skipped", afklaringSkipped);
  afklaringSkipBtn.classList.toggle("active", afklaringSkipped);
  afklaringSkipBtn.textContent = afklaringSkipped ? "Fortryd – afklaring er relevant" : "Ikke relevant";
  markProgress();
  saveFormState();
});

// ---- Dine input: vis gemte valg for alle felter (genbruges også efter "Ryd alle felter") ----
const DINE_INPUT_LABELS = {
  erhverv: { titel: "Erhverv", standard: "Vælg et eller flere erhvervsområder" },
  lokaler: { titel: "Lokaler og udstyr", standard: "Vælg tilgængelige faciliteter og udstyr" },
  paedagogisk: { titel: "Pædagogisk tilgang", standard: "Vælg den tilgang, der passer til din undervisning" },
  didaktisk: { titel: "Didaktisk tilgang", standard: "Vælg den didaktiske tilgang til forløbet" },
  formaal: { titel: "Formål og tidsramme", standard: "Vælg formål med forløbet og antal lektioner" },
  forudsaetninger: { titel: "Elevernes forudsætninger", standard: "Vælg holdets faglige niveau" }
};

function summarizeDineInput(key, data) {
  if (key === "erhverv") {
    if (!data || !data.hovedomraade) return null;
    const gren = EPX_GRENE.find((g) => g.id === data.hovedomraade);
    const antal = (data.specifikke || []).length;
    return gren ? gren.navn + (antal ? " · " + antal + " erhverv valgt" : "") : "Udfyldt";
  }
  const felt = DINE_INPUT_FELTER[key];
  if (!felt || !data) return null;
  if (felt.type === "checkbox") {
    const valgt = data.valgt || [];
    if (!valgt.length) return data.fritekst ? "Note tilføjet" : null;
    return valgt.length + " valgt: " + valgt.slice(0, 2).join(", ") + (valgt.length > 2 ? " m.fl." : "");
  }
  if (felt.type === "select-group") {
    const vaerdier = felt.felter.map((f) => data[f.id]).filter(Boolean);
    return vaerdier.length ? vaerdier.join(" · ") : null;
  }
  return "Udfyldt";
}

function renderDineInputTile(key) {
  const tile = document.getElementById("tile-" + key);
  const sub = document.getElementById(key + "TileSub");
  if (!tile || !sub) return;
  const resume = summarizeDineInput(key, EpxState.get()[key]);
  if (resume) {
    sub.textContent = resume;
    tile.classList.add("filled");
  } else {
    sub.textContent = DINE_INPUT_LABELS[key].standard;
    tile.classList.remove("filled");
  }
}

function renderAlleDineInputTiles() {
  DINE_INPUT_REKKEFOLGE.forEach(renderDineInputTile);

  // "Guide mig igennem forløbet" peger altid på det første felt, der endnu ikke er udfyldt
  const guideBtn = document.getElementById("guideBtn");
  if (guideBtn) {
    const foerste = foersteUdfyldelsesTrin();
    guideBtn.href = foerste ? dineInputUrl(foerste) : "erhverv.html";
  }
}
renderAlleDineInputTiles();

// Er der overhovedet noget gemt fra et tidligere besøg?
function harGemtUdkast() {
  const data = EpxState.get();
  if (data.fag || data.saerligeOensker || data.afklaringsgrad || data.afklaringSkipped) {
    return true;
  }
  return DINE_INPUT_REKKEFOLGE.some((key) => erFeltUdfyldt(key));
}

(function () {
  const params = new URLSearchParams(window.location.search);
  const justCompleted = params.get("justCompleted");
  if (justCompleted && DINE_INPUT_LABELS[justCompleted]) {
    const dineInputCard = document.getElementById("dineInputCard");
    const banner = document.createElement("div");
    banner.className = "toast-banner";
    const text = document.createElement("span");
    const alleFaerdig = params.get("alleFaerdig") === "1";
    text.textContent = alleFaerdig
      ? "🎉 " + DINE_INPUT_LABELS[justCompleted].titel + " er gemt – du har nu udfyldt alle \"Dine input\"!"
      : "✅ " + DINE_INPUT_LABELS[justCompleted].titel + " er gemt.";
    banner.appendChild(text);
    const closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.textContent = "✕";
    closeBtn.addEventListener("click", () => banner.remove());
    banner.appendChild(closeBtn);
    dineInputCard.parentNode.insertBefore(banner, dineInputCard);

    dineInputCard.scrollIntoView({ behavior: "smooth", block: "start" });
    const justTile = document.getElementById("tile-" + justCompleted);
    if (justTile) {
      justTile.classList.add("pulse");
      setTimeout(() => justTile.classList.remove("pulse"), 3000);
    }

    window.history.replaceState({}, "", window.location.pathname);
  } else if (params.get("aabnet") === "1") {
    // Et gemt forløb er lige åbnet fra "Gemte forløb" – ingen "ikke-afsluttet forløb"-banner
    const aktivt = hentAktivtForloeb();
    const t = (aktivt && aktivt.titel) || "forløbet";
    visToast(aktivt && aktivt.gemtId
      ? "✏️ \"" + t + "\" er åbnet under \"Mine forløb\", og du ændrer i det gemte forløb. Tryk 💾 for at gemme ændringerne."
      : "➕ Nyt forløb oprettet ud fra \"" + t.replace(/ \(kopi\)$/, "") + "\". Det gemte forløb er uændret. Tryk 💾 for at gemme det nye.");
    window.history.replaceState({}, "", window.location.pathname);
  } else if (params.get("utskrift") === "1") {
    // Print af et gemt forløb: kladden er midlertidigt byttet ud – ryd op, når printdialogen lukkes
    window.addEventListener("afterprint", () => { window.location.href = "index.html"; });
    setTimeout(() => window.print(), 700);
  } else if (params.get("vis")) {
    // Tilbage fra et punkt i en lærervejledning – håndteres nederst, når forløbene er tegnet
  } else if (harGemtUdkast()) {
    // Intet lige gemt via en underside, men der findes et ældre, ikke-afsluttet udkast
    document.getElementById("draftBanner").hidden = false;
  }
})();

// Kort besked øverst i formularen (forsvinder af sig selv)
function visToast(tekst) {
  const banner = document.createElement("div");
  banner.className = "toast-banner";
  const span = document.createElement("span");
  span.textContent = tekst;
  banner.appendChild(span);
  const luk = document.createElement("button");
  luk.type = "button";
  luk.textContent = "✕";
  luk.addEventListener("click", () => banner.remove());
  banner.appendChild(luk);
  document.querySelector(".form-panel").prepend(banner);
  setTimeout(() => banner.remove(), 10000);
}

document.getElementById("draftContinueBtn").addEventListener("click", () => {
  document.getElementById("draftBanner").hidden = true;
});
document.getElementById("ryddeFelterBtn").addEventListener("click", nulstilAlt);

// ---- Byg "Dit forslag" (til højre): hero-billede (kun hvis erhvervsområde er valgt) + klikbare afsnit ----
function renderForslag() {
  // Mens der genereres, bruges felternes valg – ellers det aktive forløbs egne valg
  const erhvervData = (forslagUdkast ? EpxState.get() : forloebRaa()).erhverv;
  const gren = erhvervData && erhvervData.hovedomraade
    ? EPX_GRENE.find((g) => g.id === erhvervData.hovedomraade)
    : null;

  const heroCard = document.getElementById("heroCard");
  const heroImg = document.getElementById("heroImg");
  const heroTag = document.getElementById("heroTag");
  const heroTitle = document.getElementById("heroTitle");
  const heroSubtitle = document.getElementById("heroSubtitle");

  const forslag = hentForslag();
  heroTitle.textContent = forslag.titel || "";
  heroSubtitle.textContent = forslag.undertitel || "";

  if (gren && GREN_BILLEDER[gren.id]) {
    heroCard.classList.remove("no-image");
    heroImg.src = GREN_BILLEDER[gren.id];
    heroImg.alt = gren.navn;
    heroTag.textContent = gren.navn;
    heroTag.hidden = false;
  } else {
    // Intet erhvervsområde valgt – undlad billede frem for et misvisende ét
    heroCard.classList.add("no-image");
    heroImg.removeAttribute("src");
    heroTag.hidden = true;
  }

  const aktivt = forslagUdkast ? null : hentAktivtForloeb();
  const list = document.getElementById("suggestionSections");
  list.innerHTML = "";
  hentForslagSektioner().forEach((sektion) => {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.className = "section-link";
    a.href = detaljeUrl(sektion.id, aktivt);
    let resume = sektion.resume;
    if (sektion.id === "udstyr") {
      resume = sektion.udstyr ? sektion.udstyr.length + " varer – kan bruges som bestillingsliste til de aktiviteter, der kræver særligt udstyr." : "";
    } else if (sektion.dynamisk) {
      const materialer = genererMaterialer();
      resume = materialer.length ? materialer.length + " AI-genererede materialer klar til brug" + (materialer.some((m) => m.id === "afklaring") ? ", inkl. en afklaringsøvelse" : "") + "." : "";
    }
    // Mens forslaget skrives, er de sidste afsnit endnu ikke nået
    if (!resume && forslagUdkast) resume = "✍️ Skrives …";
    // AI-tekst indsættes som tekst (ikke HTML)
    a.innerHTML = '<div class="section-title">' + sektion.ikon + " " + sektion.titel + '<span class="tile-chev">›</span></div><p></p>';
    a.querySelector("p").textContent = resume || "";
    li.appendChild(a);
    list.appendChild(li);
  });
}

function detaljeUrl(sektionId, forloeb) {
  return "forslag-detalje.html?sektion=" + sektionId + (forloeb ? "&forloeb=" + forloeb.id : "");
}

// Viser det aktive forslag til højre – bruges efter generering, ved skift af forløb og ved genindlæsning
function showForslag(scrollTil) {
  renderForslag();
  suggestionEmpty.hidden = true;
  suggestionContent.hidden = false;
  genBadge.hidden = false;
  document.getElementById("gemForloebBtn").hidden = false;
  document.getElementById("printAllBtn").hidden = false;
  downloadMenu.hidden = false;
  document.getElementById("newForlobBtn").hidden = false;
  document.getElementById("printDate").textContent = new Date().toLocaleDateString("da-DK");
  if (scrollTil) {
    suggestionContent.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

// Intet forløb at vise til højre
function visTomtForslag() {
  suggestionContent.hidden = true;
  suggestionEmpty.innerHTML = suggestionEmptyHTML;
  suggestionEmpty.hidden = false;
  genBadge.hidden = true;
  document.getElementById("gemForloebBtn").hidden = true;
  document.getElementById("printAllBtn").hidden = true;
  downloadMenu.hidden = true;
  document.getElementById("newForlobBtn").hidden = true;
}

function visFejlTilHoejre(tekst) {
  visTomtForslag();
  suggestionEmpty.innerHTML = "";
  const p = document.createElement("p");
  p.textContent = tekst;
  p.style.color = "#b42318";
  suggestionEmpty.appendChild(p);
}

/* ---------------------------------------------------------
   Punkt 5 genererer en ny lærervejledning. Under det ligger "Mine forløb" med én boks
   pr. færdig lærervejledning, som kan foldes ud i hele sidens bredde.
--------------------------------------------------------- */
const laesningPanel = document.getElementById("laesningPanel");
let foldetUdId = null;

function forloebTitel(f) {
  return f.titel || (f.forslag && f.forslag.titel) || "Lærervejledning";
}

function renderForloebKort() {
  const liste = hentForloebListe();
  const aktivt = hentAktivtForloeb();
  const holder = document.getElementById("forloebKortListe");
  holder.innerHTML = "";

  liste.forEach((f) => {
    const kort = document.createElement("div");
    kort.className = "form-card forloeb-kort" + (aktivt && aktivt.id === f.id ? " aktiv" : "");

    const h2 = document.createElement("h2");
    h2.innerHTML = '<span>📘</span> <span class="forloeb-titel"></span>';
    h2.querySelector(".forloeb-titel").textContent = forloebTitel(f);

    const meta = document.createElement("p");
    meta.className = "forloeb-meta";
    const dele = [];
    if (f.forslag && f.forslag.undertitel) dele.push(f.forslag.undertitel);
    const resume = forloebResume(f.raa || {});
    if (resume) dele.push(resume);
    dele.push("Lavet " + datoTekst(f.oprettet));
    meta.textContent = dele.join(" · ");

    const knapper = document.createElement("div");
    knapper.className = "forloeb-knapper";
    const erUdfoldet = foldetUdId === f.id && !laesningPanel.hidden;
    const fold = document.createElement("button");
    fold.type = "button";
    fold.className = "btn-tool fold";
    fold.textContent = erUdfoldet ? "▴ Fold sammen" : "▾ Fold ud og læs";
    fold.addEventListener("click", () => (erUdfoldet ? foldSammen() : foldUd(f.id)));
    const fjern = document.createElement("button");
    fjern.type = "button";
    fjern.className = "btn-tool farlig";
    fjern.textContent = "🗑️ Fjern";
    fjern.addEventListener("click", () => fjernFraForsiden(f));
    knapper.appendChild(fold);
    knapper.appendChild(fjern);

    kort.appendChild(h2);
    kort.appendChild(meta);
    kort.appendChild(knapper);
    holder.appendChild(kort);
  });

  // "Mine forløb" vises kun, når der er noget i den – og knappen øverst viser antallet
  const harForloeb = liste.length > 0;
  document.getElementById("mineForloeb").hidden = !harForloeb;
  const antal = document.getElementById("mineForloebAntal");
  antal.textContent = liste.length;
  antal.hidden = !harForloeb;
  if (harForloeb) document.getElementById("ingenForloebBesked").hidden = true;
  stepItems.forEach((item) => {
    if (Number(item.dataset.step) === 5) item.classList.toggle("done", harForloeb);
  });
}

// Ruller blødt ned til et element. Har browseren slået blød rulning fra, hoppes der direkte i stedet.
function rulTil(el) {
  const foer = window.scrollY;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
  setTimeout(() => {
    if (window.scrollY === foer && Math.abs(el.getBoundingClientRect().top) > 40) el.scrollIntoView({ block: "start" });
  }, 600);
}

// "Mine forløb" øverst: hop ned til forløbene – eller sig, at der ikke er nogen endnu (uden at flytte siden)
let ingenForloebTimer = null;
document.getElementById("mineForloebBtn").addEventListener("click", () => {
  if (hentForloebListe().length) {
    rulTil(document.getElementById("mineForloeb"));
    return;
  }
  const besked = document.getElementById("ingenForloebBesked");
  besked.hidden = false;
  clearTimeout(ingenForloebTimer);
  ingenForloebTimer = setTimeout(() => { besked.hidden = true; }, 6000);
});

// Folder et forløb ud. Med sektionId rulles der direkte til det punkt (bruges, når man kommer tilbage fra et punkt).
function foldUd(id, sektionId) {
  saetAktivtForloeb(id);
  foldetUdId = id;
  renderLaesning();
  laesningPanel.hidden = false;
  showForslag(false);
  renderForloebKort();
  const punkt = sektionId && document.getElementById("laes-" + sektionId);
  if (punkt) punkt.scrollIntoView({ block: "start" });
  else rulTil(laesningPanel);
}

function foldSammen() {
  const id = foldetUdId;
  foldetUdId = null;
  laesningPanel.hidden = true;
  laesningPanel.innerHTML = "";
  renderForloebKort();
  const kort = document.getElementById("forloebKortListe").children[hentForloebListe().findIndex((f) => f.id === id)];
  if (kort) kort.scrollIntoView({ behavior: "smooth", block: "center" });
}

function fjernFraForsiden(f) {
  const gemtTekst = f.gemtId ? " Den gemte udgave under \"Gemte forløb\" påvirkes ikke." : " Den er ikke gemt, så den forsvinder helt.";
  if (!confirm("Fjern \"" + forloebTitel(f) + "\" fra forsiden?" + gemtTekst)) return;
  fjernForloeb(f.id);
  if (foldetUdId === f.id) {
    foldetUdId = null;
    laesningPanel.hidden = true;
    laesningPanel.innerHTML = "";
  }
  renderForloebKort();
  if (hentForslag()) showForslag(false);
  else visTomtForslag();
}

// Hele lærervejledningen som læsbar tekst – AI-tekst indsættes altid som tekst (ikke HTML)
function renderLaesning() {
  const aktivt = hentAktivtForloeb();
  const forslag = hentForslag();
  laesningPanel.innerHTML = "";
  if (!aktivt || !forslag) return;

  const el = (tag, klasse, tekst) => {
    const e = document.createElement(tag);
    if (klasse) e.className = klasse;
    if (tekst !== undefined) e.textContent = tekst;
    return e;
  };
  const foldKnap = () => {
    const b = el("button", "btn-tool", "▴ Fold sammen");
    b.type = "button";
    b.addEventListener("click", foldSammen);
    return b;
  };

  const top = el("div", "laesning-top");
  const titler = el("div");
  titler.appendChild(el("h2", "", "📘 " + forslag.titel));
  if (forslag.undertitel) titler.appendChild(el("p", "", forslag.undertitel));
  top.appendChild(titler);
  top.appendChild(foldKnap());
  laesningPanel.appendChild(top);

  const meta = eksportMeta().map((r) => r[0] + ": " + r[1]).join(" · ");
  laesningPanel.appendChild(el("p", "laesning-meta", meta));

  // Hent eller print: vælg indhold (hele forløbet, kun lærerens del eller kun elevernes opgaver) og derefter filtype
  const eksport = el("div", "laesning-eksport");
  eksport.appendChild(el("span", "laesning-eksport-label", "Hent eller print:"));
  let anker = el("span");
  eksport.appendChild(anker);
  laesningPanel.appendChild(eksport);
  [
    ["hele", "📘 Hele forløbet"],
    ["vejledning", "🧑‍🏫 Kun lærervejledningen"],
    ["elev", "✏️ Opgaver til eleverne"]
  ].forEach(([variant, tekst]) => {
    anker = EpxExport.attachMenu(anker, () => bygForslagEksport(variant), { html: tekst + " ▾" });
  });

  hentForslagSektioner().forEach((s) => {
    const blok = el("div", "laesning-sektion");
    blok.id = "laes-" + s.id;
    const hoved = el("div", "laesning-sektion-top");
    hoved.appendChild(el("h3", "", s.ikon + " " + s.titel));
    const juster = el("a", "btn-tool", "✏️ Justér dette punkt");
    juster.href = detaljeUrl(s.id, aktivt);
    hoved.appendChild(juster);
    blok.appendChild(hoved);

    (s.krop || []).forEach((a) => blok.appendChild(el("p", "", a)));
    const punkter = (s.liste || [])
      .concat((s.udstyr || []).map((v) => v.navn + " – " + v.antal + " (" + v.kategori + ")"))
      .concat((s.henvisninger || []).map((h) => h.titel + " – " + h.kilde + " (" + h.type + ")"));
    if (punkter.length) {
      const ul = el("ul");
      punkter.forEach((p) => ul.appendChild(el("li", "", p)));
      blok.appendChild(ul);
    }
    if (s.dynamisk) {
      genererMaterialer().forEach((m) => {
        blok.appendChild(el("h4", "", m.ikon + " " + m.type + ": " + m.titel));
        m.krop.forEach((a) => blok.appendChild(el("p", "", a)));
      });
    }
    laesningPanel.appendChild(blok);
  });

  const bund = el("div", "laesning-bund");
  bund.appendChild(foldKnap());
  laesningPanel.appendChild(bund);
}

/* ---------------------------------------------------------
   "Nu genereres lærervejledning" + ventebjælke. Bjælken følger, hvor meget tekst der er
   modtaget (et forslag er typisk ca. 18.000 tegn) eller tiden (typisk under 2 min.) –
   det, der er længst fremme – og stopper ved 95 %, indtil forslaget er helt færdigt.
--------------------------------------------------------- */
const FORVENTET_TEGN = 18000;
const FORVENTET_SEKUNDER = 110;
let fremdriftTimer = null;
let fremdriftStart = 0;
let fremdriftTegn = 0;

function saetFremdrift(procent) {
  document.querySelectorAll(".gen-bar-fyld").forEach((e) => { e.style.width = procent + "%"; });
  document.querySelectorAll(".gen-procent").forEach((e) => { e.textContent = Math.round(procent) + " %"; });
}

function visFremdrift(vis) {
  document.querySelectorAll(".gen-progress").forEach((e) => { e.hidden = !vis; });
}

function startFremdrift() {
  fremdriftStart = Date.now();
  fremdriftTegn = 0;
  saetFremdrift(2);
  visFremdrift(true);
  clearInterval(fremdriftTimer);
  fremdriftTimer = setInterval(() => {
    const sek = (Date.now() - fremdriftStart) / 1000;
    const andel = Math.max(fremdriftTegn / FORVENTET_TEGN, sek / FORVENTET_SEKUNDER);
    saetFremdrift(Math.min(95, 2 + andel * 93));
  }, 300);
}

function stopFremdrift(lykkedes) {
  clearInterval(fremdriftTimer);
  if (lykkedes) {
    saetFremdrift(100);
    setTimeout(() => visFremdrift(false), 900);
  } else {
    visFremdrift(false);
  }
}

// Viser det halvfærdige forslag, mens AI'en skriver. Afsnittene kan først åbnes, når forslaget er færdigt.
function visUdkast(udkast) {
  if (!udkast.sektioner) udkast.sektioner = {};
  forslagUdkast = udkast;
  renderForslag();
  document.getElementById("suggestionSections").classList.add("skrives");
  suggestionEmpty.hidden = true;
  suggestionContent.hidden = false;
}

// "Generér lærervejledning" sender ALLE input til AI'en. Når forslaget er færdigt, kommer det under "Mine forløb"
// med sine egne valg, og felterne ryddes til et nyt forløb.
generateBtn.addEventListener("click", async () => {
  const raaValg = kopierInput(EpxState.get());
  const aiInput = samlInputTilAI(raaValg);
  const knapTekst = generateBtn.textContent;
  generateBtn.disabled = true;
  generateBtn.textContent = "⏳ Genererer lærervejledning …";
  visTomtForslag();
  suggestionEmpty.hidden = true;
  startFremdrift();
  document.getElementById("genProgress").scrollIntoView({ behavior: "smooth", block: "start" });

  let svar = null;
  try {
    const res = await fetch("/api/generer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input: aiInput })
    });
    if (!res.ok || !res.body) {
      svar = await res.json().catch(() => ({}));
      if (!svar.fejl) svar.fejl = "Serveren svarede med fejl " + res.status + ".";
    } else {
      // Forslaget kommer som en strøm af linjer – vis det, mens det bliver skrevet
      const reader = res.body.getReader();
      const dekoder = new TextDecoder();
      let buffer = "";
      let raa = "";
      let sidstTegnet = 0;
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += dekoder.decode(value, { stream: true });
        const linjer = buffer.split("\n");
        buffer = linjer.pop();
        linjer.filter(Boolean).forEach((l) => {
          const besked = JSON.parse(l);
          if (besked.d) raa += besked.d;
          else svar = besked;
        });
        fremdriftTegn = raa.length;
        if (!svar && Date.now() - sidstTegnet > 300) {
          sidstTegnet = Date.now();
          const udkast = parseDelvisJson(raa);
          if (udkast && udkast.titel) visUdkast(udkast);
        }
      }
      if (!svar) svar = { fejl: "Forbindelsen blev afbrudt, før forslaget var færdigt. Prøv igen." };
    }
  } catch (e) {
    svar = { fejl: "Kunne ikke få forbindelse til serveren. Tjek din internetforbindelse, og prøv igen." };
  } finally {
    forslagUdkast = null;
    document.getElementById("suggestionSections").classList.remove("skrives");
    generateBtn.disabled = false;
    generateBtn.textContent = knapTekst;
  }

  if (!svar.forslag) {
    stopFremdrift(false);
    // Felterne og et eventuelt tidligere forløb bevares
    if (hentForslag()) {
      showForslag(false);
      visToast("⚠️ " + svar.fejl + " Dine felter er ikke ryddet, så du kan prøve igen.");
    } else {
      visFejlTilHoejre("⚠️ " + svar.fejl);
    }
    return;
  }

  stopFremdrift(true);
  tilfoejForloeb({ forslag: svar.forslag, raa: raaValg, input: aiInput });
  rydInput();
  renderForloebKort();
  showForslag(true);
  visToast("✅ Lærervejledningen \"" + svar.forslag.titel + "\" er klar under \"Mine forløb\". Felterne er ryddet, så du kan lave et nyt forløb. Vil du ændre noget i den færdige, så åbn de enkelte punkter og brug \"Justér med AI\" eller \"Rediger manuelt\".");

  // Info om manglende login vises kun første gang – og slet ikke, hvis man er logget ind
  if (!EpxAuth.isLoggedIn() && !EpxState.get().harVistGemPopup) {
    EpxState.set("harVistGemPopup", true);
    const saveModal = document.getElementById("saveModalOverlay");
    setTimeout(() => { saveModal.hidden = false; }, 900);
  }
});

// ---- Modal: info om manglende login ----
(function () {
  const saveModal = document.getElementById("saveModalOverlay");
  const closeBtn = document.getElementById("modalCloseBtn");

  function closeModal() { saveModal.hidden = true; }
  closeBtn.addEventListener("click", closeModal);
  saveModal.addEventListener("click", (e) => { if (e.target === saveModal) closeModal(); });
})();

document.getElementById("printAllBtn").addEventListener("click", () => window.print());

// ---- "Ryd alle felter": rydder punkt 1-4. De færdige lærervejledninger under "Mine forløb" bliver liggende. ----
function nulstilAlt() {
  if (!confirm("Er du sikker? Felterne i punkt 1-4 bliver ryddet, så du kan starte et nyt forløb. Dine færdige lærervejledninger under \"Mine forløb\" bliver liggende.")) return;
  rydInput();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Selve nulstillingen af felterne (uden spørgsmål) – bruges også, når en lærervejledning er færdig
function rydInput() {
  INPUT_NOEGLER.forEach((k) => EpxState.clearKey(k));
  document.getElementById("fag").value = "";
  document.getElementById("fagAndet").value = "";
  document.getElementById("fagAndetWrap").hidden = true;
  document.getElementById("saerligeOensker").value = "";
  charCount.textContent = "0";
  document.getElementById("afklaringsgrad").value = "";
  document.querySelectorAll('input[name="afklaringsfokus"]').forEach((cb) => { cb.checked = false; });
  afklaringSkipped = false;
  afklaringCard.classList.remove("skipped");
  afklaringSkipBtn.classList.remove("active");
  afklaringSkipBtn.textContent = "Ikke relevant";
  document.getElementById("draftBanner").hidden = true;
  stepItems.forEach((item) => {
    if (Number(item.dataset.step) <= 4) item.classList.remove("done");
  });
  markProgress();
  renderAlleDineInputTiles();
}

// ➕ i "Dit forslag": hop op til punkt 1 for at lave et nyt forløb
document.getElementById("newForlobBtn").addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
  document.getElementById("fag").focus({ preventScroll: true });
});

// ---- Gem forløb + "Gemte forløb" ----
const gemModal = document.getElementById("gemModalOverlay");
const gemTitelInput = document.getElementById("gemTitel");
const aabnModal = document.getElementById("aabnModalOverlay");
let forloebDerSkalAabnes = null;

function lukModal(el) { el.hidden = true; }
[["gemModalClose", gemModal], ["aabnModalClose", aabnModal]].forEach(([id, modal]) => {
  document.getElementById(id).addEventListener("click", () => lukModal(modal));
  modal.addEventListener("click", (e) => { if (e.target === modal) lukModal(modal); });
});

// 💾 gemmer det forløb, der vises til højre. Kræver login.
document.getElementById("gemForloebBtn").addEventListener("click", () => {
  if (!EpxAuth.isLoggedIn()) {
    document.getElementById("saveModalOverlay").hidden = false;
    return;
  }
  const aktivt = hentAktivtForloeb();
  if (!aktivt) return;
  const findes = aktivt.gemtId && EpxForloeb.hent(aktivt.gemtId);
  gemTitelInput.value = aktivt.titel || foreslaaForloebTitel(aktivt.raa || {});
  document.getElementById("gemModalTekst").textContent = findes
    ? "Forløbet er gemt før. Ændringerne overskriver den gemte udgave."
    : "Giv forløbet et navn, så du kan finde det igen under \"Gemte forløb\".";
  gemModal.hidden = false;
  gemTitelInput.focus();
  gemTitelInput.select();
});

function gemNu() {
  const aktivt = hentAktivtForloeb();
  if (!aktivt) return;
  const titel = gemTitelInput.value.trim() || foreslaaForloebTitel(aktivt.raa || {});
  // Gemmes i samme form som før (valgene øverst), så "Gemte forløb" kan vise fag og erhvervsområde
  const data = Object.assign({}, aktivt.raa, { forslag: aktivt.forslag, forslagInput: aktivt.input });
  const id = EpxForloeb.gem(titel, data, aktivt.gemtId);
  if (!id) {
    alert("Forløbet kunne ikke gemmes – browserens lager er muligvis fuldt. Prøv at slette et gammelt forløb.");
    return;
  }
  opdaterForloeb(aktivt.id, { gemtId: id, titel: titel });
  lukModal(gemModal);
  renderGemte();
  renderForloebKort();
  if (foldetUdId) renderLaesning();
  visToast("✅ \"" + titel + "\" er gemt under \"Gemte forløb\".");
}
document.getElementById("gemBekraeftBtn").addEventListener("click", gemNu);
gemTitelInput.addEventListener("keydown", (e) => { if (e.key === "Enter") gemNu(); });

function datoTekst(ms) {
  const d = new Date(ms);
  return d.toLocaleDateString("da-DK") + " kl. " + d.toLocaleTimeString("da-DK", { hour: "2-digit", minute: "2-digit" });
}

function forloebResume(data) {
  const dele = [];
  if (data.fag) dele.push(data.fag === "Andet fag" ? (data.fagAndet || "Andet fag") : data.fag);
  const gren = data.erhverv && data.erhverv.hovedomraade
    ? EPX_GRENE.find((g) => g.id === data.erhverv.hovedomraade)
    : null;
  if (gren) dele.push(gren.navn);
  return dele.join(" · ");
}

function renderGemte() {
  const panel = document.getElementById("gemtePanel");
  const ul = document.getElementById("gemteListe");
  const liste = EpxForloeb.liste();
  ul.innerHTML = "";
  panel.hidden = liste.length === 0;
  liste.forEach((f) => {
    const li = document.createElement("li");
    li.className = "gemt-item";

    const titel = document.createElement("div");
    titel.className = "gemt-titel";
    titel.textContent = f.titel;
    const meta = document.createElement("div");
    meta.className = "gemt-meta";
    const resume = forloebResume(f.data);
    meta.textContent = "Gemt " + datoTekst(f.gemt) + (resume ? " · " + resume : "");

    const knapper = document.createElement("div");
    knapper.className = "gemt-knapper";
    [
      ["Åbn", "", () => bedOmAtAabne(f)],
      ["🖨️ Print/PDF", "", () => printGemt(f)],
      ["🗑️ Slet", " farlig", () => sletGemt(f)]
    ].forEach(([tekst, ekstra, handler]) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "btn-tool" + ekstra;
      b.textContent = tekst;
      b.addEventListener("click", handler);
      knapper.appendChild(b);
    });

    li.appendChild(titel);
    li.appendChild(meta);
    li.appendChild(knapper);
    ul.appendChild(li);
  });
}

// Åbn: først et valg – ændr det gemte forløb, eller opret et nyt ud fra det
function bedOmAtAabne(f) {
  forloebDerSkalAabnes = f;
  document.getElementById("aabnModalTekst").textContent =
    "\"" + f.titel + "\" er gemt. Vil du ændre i det gemte forløb, eller skal der oprettes et nyt forløb ud fra det, så det gemte forbliver uændret? Det åbnes under \"Mine forløb\" på forsiden.";
  aabnModal.hidden = false;
}

// Et gemt forløb som et forløb på forsiden (virker både med ældre og nye gemte forløb)
function forloebFraGemt(data) {
  const raa = kopierInput(data);
  return { forslag: data.forslag, raa: raa, input: data.forslagInput || samlInputTilAI(raa) };
}

function aabnForloeb(aendrDetGemte) {
  const f = forloebDerSkalAabnes;
  if (!f) return;
  const data = JSON.parse(JSON.stringify(f.data));
  if (!data.forslag) {
    // Meget gammelt gemt forløb uden færdigt forslag: læg valgene i felterne, så det kan genereres
    INPUT_NOEGLER.forEach((k) => { if (data[k] !== undefined) EpxState.set(k, data[k]); });
  } else {
    tilfoejForloeb(Object.assign(forloebFraGemt(data), {
      gemtId: aendrDetGemte ? f.id : null,
      titel: aendrDetGemte ? f.titel : f.titel + " (kopi)"
    }));
  }
  window.location.href = "index.html?aabnet=1";
}
document.getElementById("aabnAendrBtn").addEventListener("click", () => aabnForloeb(true));
document.getElementById("aabnNytBtn").addEventListener("click", () => aabnForloeb(false));

// Print/PDF af et gemt forløb: kladden byttes midlertidigt ud, og en sikkerhedskopi lægges tilbage bagefter
function printGemt(f) {
  const raw = localStorage.getItem("epxNexusData");
  localStorage.setItem("epxNexusPrintBackup", raw === null ? "__none__" : raw);
  const midlertidig = Object.assign({ id: "print", oprettet: f.gemt, titel: f.titel }, forloebFraGemt(f.data));
  localStorage.setItem("epxNexusData", JSON.stringify({ forloeb: [midlertidig], aktivtForloebId: "print" }));
  window.location.href = "index.html?utskrift=1";
}

function sletGemt(f) {
  if (!confirm("Slet \"" + f.titel + "\" for altid? Det kan ikke fortrydes.")) return;
  EpxForloeb.slet(f.id);
  // Forløb på forsiden, der pegede på det slettede, er ikke længere gemt
  hentForloebListe().filter((x) => x.gemtId === f.id).forEach((x) => opdaterForloeb(x.id, { gemtId: null }));
  renderGemte();
}

// ---- Ved sidens indlæsning ----
renderForloebKort();
if (hentForslag()) showForslag(false);
renderGemte();
document.addEventListener("epx-auth-changed", renderGemte);

// Tilbage fra et punkt: fold lærervejledningen ud igen og vis det punkt, man kom fra
(function () {
  const params = new URLSearchParams(window.location.search);
  const visId = params.get("vis");
  if (!visId) return;
  window.history.replaceState({}, "", window.location.pathname);
  if (!hentForloebListe().some((f) => f.id === visId)) return;
  // Vent, til siden er tegnet færdig, så rulningen lander det rigtige sted
  requestAnimationFrame(() => foldUd(visId, params.get("sektion")));
})();
