const stepItems = document.querySelectorAll("#stepList li");
const generateBtn = document.getElementById("generateBtn");
const suggestionEmpty = document.getElementById("suggestionEmpty");
const suggestionContent = document.getElementById("suggestionContent");
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

// ---- Dine input: vis gemte valg for Erhverv og håndter tilbageløb fra guiden ----
(function () {
  const erhvervTile = document.getElementById("tile-erhverv");
  const erhvervSub = document.getElementById("erhvervTileSub");
  if (!erhvervTile) return;

  function renderErhvervTile() {
    const data = EpxState.get().erhverv;
    if (data && data.hovedomraade) {
      const gren = EPX_GRENE.find((g) => g.id === data.hovedomraade);
      const antal = (data.specifikke || []).length;
      erhvervSub.textContent = gren
        ? gren.navn + (antal ? " · " + antal + " erhverv valgt" : "")
        : "Udfyldt";
      erhvervTile.classList.add("filled");
    } else {
      erhvervSub.textContent = "Vælg et eller flere erhvervsområder";
      erhvervTile.classList.remove("filled");
    }
  }
  renderErhvervTile();

  const params = new URLSearchParams(window.location.search);
  if (params.get("justCompleted") === "erhverv") {
    const dineInputCard = document.getElementById("dineInputCard");
    const banner = document.createElement("div");
    banner.className = "toast-banner";
    const text = document.createElement("span");
    text.textContent =
      params.get("guided") === "1"
        ? "✅ Erhverv er gemt. De næste trin i guiden (Lokaler og udstyr m.fl.) er under opbygning – vælg selv videre for nu."
        : "✅ Erhverv er gemt.";
    banner.appendChild(text);
    const closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.textContent = "✕";
    closeBtn.addEventListener("click", () => banner.remove());
    banner.appendChild(closeBtn);
    dineInputCard.parentNode.insertBefore(banner, dineInputCard);

    dineInputCard.scrollIntoView({ behavior: "smooth", block: "start" });
    erhvervTile.classList.add("pulse");
    setTimeout(() => erhvervTile.classList.remove("pulse"), 3000);

    window.history.replaceState({}, "", window.location.pathname);
  }
})();

// ---- Byg "Dit forslag": hero-billede (kun hvis erhvervsområde er valgt) + klikbare afsnit ----
function renderForslag() {
  const erhvervData = EpxState.get().erhverv;
  const gren = erhvervData && erhvervData.hovedomraade
    ? EPX_GRENE.find((g) => g.id === erhvervData.hovedomraade)
    : null;

  const heroCard = document.getElementById("heroCard");
  const heroImg = document.getElementById("heroImg");
  const heroTag = document.getElementById("heroTag");
  const heroTitle = document.getElementById("heroTitle");
  const heroSubtitle = document.getElementById("heroSubtitle");

  heroTitle.textContent = "Beregninger i praksis";
  heroSubtitle.textContent = "Matematik brugt i byggeprocesser";

  if (gren && GREN_BILLEDER[gren.id]) {
    heroCard.classList.remove("no-image");
    heroImg.src = GREN_BILLEDER[gren.id];
    heroImg.alt = gren.navn;
    heroTag.textContent = gren.navn;
    heroTag.hidden = false;
  } else {
    // Intet erhvervsområde valgt endnu – undlad billede frem for et misvisende ét
    heroCard.classList.add("no-image");
    heroImg.removeAttribute("src");
    heroTag.hidden = true;
  }

  const list = document.getElementById("suggestionSections");
  list.innerHTML = "";
  FORSLAG_SEKTIONER.forEach((sektion) => {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.className = "section-link";
    a.href = "forslag-detalje.html?sektion=" + sektion.id;
    const resume = sektion.id === "udstyr"
      ? (sektion.udstyr.length + " varer – kan bruges som bestillingsliste til de aktiviteter, der kræver særligt udstyr.")
      : sektion.resume;
    a.innerHTML =
      '<div class="section-title">' + sektion.ikon + " " + sektion.titel + '<span class="tile-chev">›</span></div>' +
      "<p>" + resume + "</p>";
    li.appendChild(a);
    list.appendChild(li);
  });
}

// Viser det genererede forslag i UI'et – bruges både ved klik på "Generér forslag" og ved genindlæsning af siden
function showForslag(scrollTil) {
  renderForslag();
  suggestionEmpty.hidden = true;
  suggestionContent.hidden = false;
  genBadge.hidden = false;
  document.getElementById("printAllBtn").hidden = false;
  document.getElementById("newForlobBtn").hidden = false;
  document.getElementById("printDate").textContent = new Date().toLocaleDateString("da-DK");
  stepItems.forEach((item) => {
    if (Number(item.dataset.step) === 2 || Number(item.dataset.step) === 5) {
      item.classList.add("done");
    }
  });
  if (scrollTil) {
    suggestionContent.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

// Genindlæs et allerede genereret forslag, hvis man navigerer tilbage til forsiden
if (EpxState.get().forslagGenereret) {
  showForslag(false);
}

// "Generér forslag" viser det (dummy) forslag
generateBtn.addEventListener("click", () => {
  EpxState.set("forslagGenereret", true);
  showForslag(true);

  // Info om manglende login vises kun første gang, man genererer et forslag for dette forløb – og slet ikke hvis man er logget ind
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

// ---- "Opret nyt forløb": rydder alle input, så man kan starte forfra ----
document.getElementById("newForlobBtn").addEventListener("click", () => {
  if (!confirm("Er du sikker? Dine nuværende input bliver ryddet, så du kan starte et nyt forløb.")) return;
  EpxState.clearAll();
  document.getElementById("fag").value = "Matematik";
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
  suggestionContent.hidden = true;
  suggestionEmpty.hidden = false;
  genBadge.hidden = true;
  document.getElementById("printAllBtn").hidden = true;
  document.getElementById("newForlobBtn").hidden = true;
  stepItems.forEach((item) => item.classList.remove("done"));
  document.getElementById("saveModalOverlay").hidden = true;
  window.scrollTo({ top: 0, behavior: "smooth" });
  markProgress();
  document.getElementById("erhvervTileSub").textContent = "Vælg et eller flere erhvervsområder";
  document.getElementById("tile-erhverv").classList.remove("filled");
});
