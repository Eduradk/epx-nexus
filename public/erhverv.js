const grenInputs = document.querySelectorAll('input[name="gren"]');
const specifikkeSection = document.getElementById("specifikkeSection");
const checkboxList = document.getElementById("erhvervCheckboxList");
const fritekst = document.getElementById("erhvervFritekst");
const charCount = document.getElementById("erhvervCharCount");
const nextBtn = document.getElementById("erhvervNextBtn");

function renderErhvervOptions(grenId, checkedList) {
  const gren = EPX_GRENE.find((g) => g.id === grenId);
  if (!gren) return;
  checkboxList.innerHTML = "";
  // To grupper: erhvervsuddannelser (EUD) og professionsbacheloruddannelser (PBA)
  [
    ["Erhvervsuddannelser (EUD)", gren.erhverv],
    ["Professionsbacheloruddannelser (PBA)", gren.pba || []]
  ].forEach(([overskrift, navne]) => {
    if (!navne.length) return;
    const titel = document.createElement("h3");
    titel.className = "uddannelse-gruppe";
    titel.textContent = overskrift;
    checkboxList.appendChild(titel);
    navne.forEach((navn) => {
      const label = document.createElement("label");
      label.className = "checkbox-item";
      const input = document.createElement("input");
      input.type = "checkbox";
      input.value = navn;
      input.checked = checkedList.includes(navn);
      const span = document.createElement("span");
      span.textContent = navn;
      label.appendChild(input);
      label.appendChild(document.createTextNode(" "));
      label.appendChild(span);
      checkboxList.appendChild(label);
    });
  });
  specifikkeSection.hidden = false;
}

grenInputs.forEach((input) => {
  input.addEventListener("change", () => {
    document.querySelectorAll(".gren-card").forEach((c) => c.classList.remove("selected"));
    input.closest(".gren-card").classList.add("selected");
    renderErhvervOptions(input.value, []);
  });
});

fritekst.addEventListener("input", () => {
  charCount.textContent = fritekst.value.length;
});

// Genindlæs tidligere gemte valg
const saved = EpxState.get().erhverv;
if (saved && saved.hovedomraade) {
  const radio = document.querySelector('input[name="gren"][value="' + saved.hovedomraade + '"]');
  if (radio) {
    radio.checked = true;
    radio.closest(".gren-card").classList.add("selected");
    renderErhvervOptions(saved.hovedomraade, saved.specifikke || []);
  }
}
if (saved && saved.fritekst) {
  fritekst.value = saved.fritekst;
  charCount.textContent = fritekst.value.length;
}

nextBtn.addEventListener("click", () => {
  const checkedGren = document.querySelector('input[name="gren"]:checked');
  const specifikke = Array.from(checkboxList.querySelectorAll("input:checked")).map((i) => i.value);
  EpxState.set("erhverv", {
    hovedomraade: checkedGren ? checkedGren.value : null,
    specifikke: specifikke,
    fritekst: fritekst.value
  });
  const naeste = naesteUdfyldelsesTrin("erhverv");
  if (naeste) {
    window.location.href = dineInputUrl(naeste);
  } else {
    window.location.href = "index.html?justCompleted=erhverv&alleFaerdig=1";
  }
});
