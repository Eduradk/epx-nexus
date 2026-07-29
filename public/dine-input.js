const params = new URLSearchParams(window.location.search);
const feltKey = params.get("felt");
const felt = DINE_INPUT_FELTER[feltKey];

const feltTitelEl = document.getElementById("feltTitel");
const feltIntroEl = document.getElementById("feltIntro");
const feltIndholdEl = document.getElementById("feltIndhold");
const nextBtn = document.getElementById("dineInputNextBtn");

if (!felt) {
  feltTitelEl.textContent = "Ukendt felt";
  feltIntroEl.textContent = "Dette input findes ikke. Gå tilbage til forsiden og prøv igen.";
  nextBtn.hidden = true;
} else {
  feltTitelEl.textContent = felt.ikon + " " + felt.titel;
  feltIntroEl.textContent = felt.intro;

  const gemt = EpxState.get()[feltKey] || {};

  if (felt.type === "checkbox") {
    const list = document.createElement("div");
    list.className = "checkbox-list";
    list.id = "muligheder";
    felt.muligheder.forEach((m) => {
      const label = document.createElement("label");
      label.className = "checkbox-item";
      const checked = (gemt.valgt || []).indexOf(m.navn) > -1;
      label.innerHTML =
        '<input type="checkbox" value="' + m.navn + '"' + (checked ? " checked" : "") + "> <span>" + m.ikon + " " + m.navn + "</span>";
      list.appendChild(label);
    });
    feltIndholdEl.appendChild(list);
  } else if (felt.type === "select-group") {
    felt.felter.forEach((f) => {
      const wrap = document.createElement("div");
      wrap.style.marginBottom = "16px";
      const label = document.createElement("label");
      label.setAttribute("for", f.id);
      label.textContent = f.label;
      const select = document.createElement("select");
      select.id = f.id;
      const emptyOpt = document.createElement("option");
      emptyOpt.value = "";
      emptyOpt.textContent = "Vælg " + f.label.toLowerCase();
      select.appendChild(emptyOpt);
      f.muligheder.forEach((m) => {
        const opt = document.createElement("option");
        opt.textContent = m;
        if (gemt[f.id] === m) opt.selected = true;
        select.appendChild(opt);
      });
      wrap.appendChild(label);
      wrap.appendChild(select);
      feltIndholdEl.appendChild(wrap);
    });
  }

  if (felt.fritekstLabel) {
    const wrap = document.createElement("div");
    wrap.style.marginTop = "16px";
    const label = document.createElement("label");
    label.setAttribute("for", "feltFritekst");
    label.textContent = felt.fritekstLabel;
    const textarea = document.createElement("textarea");
    textarea.id = "feltFritekst";
    textarea.placeholder = felt.fritekstPlaceholder || "";
    textarea.value = gemt.fritekst || "";
    wrap.appendChild(label);
    wrap.appendChild(textarea);
    feltIndholdEl.appendChild(wrap);
  }

  nextBtn.addEventListener("click", () => {
    let data = {};
    if (felt.type === "checkbox") {
      data.valgt = Array.from(document.querySelectorAll("#muligheder input:checked")).map((i) => i.value);
    } else if (felt.type === "select-group") {
      felt.felter.forEach((f) => {
        data[f.id] = document.getElementById(f.id).value;
      });
    }
    if (felt.fritekstLabel) {
      data.fritekst = document.getElementById("feltFritekst").value;
    }
    EpxState.set(feltKey, data);

    const naeste = naesteUdfyldelsesTrin(feltKey);
    if (naeste) {
      window.location.href = dineInputUrl(naeste);
    } else {
      window.location.href = "index.html?justCompleted=" + feltKey + "&alleFaerdig=1";
    }
  });
}
