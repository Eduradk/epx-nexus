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
  gren.erhverv.forEach((navn) => {
    const id = "erhverv-" + navn.replace(/[^a-zA-Z0-9]/g, "");
    const label = document.createElement("label");
    label.className = "checkbox-item";
    label.innerHTML =
      '<input type="checkbox" value="' + navn + '" id="' + id + '"' +
      (checkedList.includes(navn) ? " checked" : "") + "> <span>" + navn + "</span>";
    checkboxList.appendChild(label);
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
  const params = new URLSearchParams(window.location.search);
  const guided = params.get("guided") === "1";
  const naeste = guided ? naesteDineInputTrin("erhverv") : null;
  if (naeste) {
    window.location.href = dineInputUrl(naeste, true);
  } else if (guided) {
    window.location.href = "index.html?justCompleted=erhverv&guided=1&guideFaerdig=1";
  } else {
    window.location.href = "index.html?justCompleted=erhverv";
  }
});
