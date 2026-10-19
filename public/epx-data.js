// Fælles data og state for EPX Nexus-prototypen. Indlæses før side-specifikke scripts.

const EPX_GRENE = [
  {
    id: "samfund",
    navn: "Samfund, sikkerhed og sundhed",
    ikon: "🛡️",
    accent: "navy",
    beskrivelse: "Det pædagogiske og socialfaglige område samt sundheds- og sikkerhedsområdet.",
    erhverv: ["Pædagogisk assistent", "Social- og sundhedsassistent", "Social- og sundhedshjælper", "Ambulancebehandler", "Sikkerhedsvagt", "Tandklinikassistent", "Audiologi- og neurofysiologitekniker", "Serviceassistent"],
    // Professionsbacheloruddannelser (PBA) – navne som på ug.dk
    pba: ["Pædagog", "Socialrådgiver", "Diakoni og socialpædagogik", "Lærer i folkeskolen", "Sygeplejerske", "Jordemoder", "Fysioterapeut", "Ergoterapeut", "Psykomotorisk terapeut", "Bioanalytiker", "Radiograf", "Tandplejer", "Klinisk tandtekniker", "Optometrist", "Protese- og ortoseteknologi", "Ernæring og sundhed", "Sundhedsteknologi (diplomingeniør)", "Dansk tegnsprogstolk", "Civilsamfundsudvikling", "Offentlig administration", "Katastrofe- og risikomanager", "Cybersikkerhed", "Cybersikkerhed (diplomingeniør)"]
  },
  {
    id: "natur",
    navn: "Natur, teknologi og forbrug",
    ikon: "🌱",
    accent: "green",
    beskrivelse: "Jordbrug, skovbrug, naturforvaltning, teknik og miljø, biotek samt fødevareområdet.",
    erhverv: ["Landbrugsuddannelsen (landmand)", "Skov- og naturtekniker", "Anlægsgartner", "Dyrepasser", "Veterinærsygeplejerske", "Ernæringsassistent", "Gastronom (kok)", "Bager og konditor", "Mejerist", "Procesoperatør"],
    // Professionsbacheloruddannelser (PBA) – navne som på ug.dk
    pba: ["Natur og jordbrugsproduktion", "Skov- og landskabsingeniør", "Urban landskabsingeniør", "Fødevareteknologi og applikation", "Fødevareteknologi (diplomingeniør)", "Fødevaresikkerhed og -kvalitet (diplomingeniør)", "Fiskeriteknologi (diplomingeniør)", "Bioteknologi (diplomingeniør)", "Kemi- og bioteknologi (diplomingeniør)", "Kemiteknologi (diplomingeniør)", "Kemiteknik og international business (diplomingeniør)", "Bæredygtig energiteknik (diplomingeniør)", "Klima- og forsyningsteknik (diplomingeniør)", "Proces og innovation (diplomingeniør)"]
  },
  {
    id: "business",
    navn: "Business og innovation",
    ikon: "💼",
    accent: "purple",
    beskrivelse: "Det merkantile område – handel, markedsføring, økonomi og innovation.",
    erhverv: ["Kontoruddannelsen", "Detailhandelsuddannelsen (salgsassistent)", "Handelsuddannelsen (handelsassistent)", "Finansuddannelsen", "Eventkoordinator", "Hotelreceptionist", "Mediegrafiker", "Webudvikler"],
    // Professionsbacheloruddannelser (PBA) – navne som på ug.dk
    pba: ["Finans", "Skat", "E-commerce og digital marketing", "Event management og økonomi", "Eksport og teknologi", "Fremmedsprog og digital markedskommunikation", "Kommunikation", "Journalist", "Fotojournalist", "Medieproduktion og ledelse", "Business og vandteknologi", "Procesøkonomi og værdikædeledelse", "It-arkitektur", "Økonomi og informationsteknologi", "It og økonomi (diplomingeniør)", "Forretningsudvikling (diplomingeniør)", "Global business og teknologi (diplomingeniør)", "Global ledelse og design af produktionsnetværk (diplomingeniør)", "Globale forretningssystemer (diplomingeniør)"]
  },
  {
    id: "haandvaerk",
    navn: "Håndværk, resurser og design",
    ikon: "🛠️",
    accent: "blue",
    beskrivelse: "Byggeri, industri, energiforsyning, design og kunsthåndværk.",
    erhverv: ["Tømrer", "Bygningssnedker", "Møbelsnedker", "Murer", "Elektriker", "VVS-energiuddannelsen (vvs'er)", "Smed", "Industritekniker", "Teknisk designer", "Beklædningshåndværker", "Guld- og sølvsmed"],
    // Professionsbacheloruddannelser (PBA) – navne som på ug.dk
    pba: ["Bygningskonstruktør", "Bygning (diplomingeniør)", "Bygningsdesign (diplomingeniør)", "Arktisk byggeri og infrastruktur (diplomingeniør)", "Maskinmester", "Maskinteknik (diplomingeniør)", "Produktion (diplomingeniør)", "Industriel teknologi (diplomingeniør)", "Mechatronics (diplomingeniør)", "Robotteknologi (diplomingeniør)", "Elektrisk energiteknologi (diplomingeniør)", "Elektronik (diplomingeniør)", "Elektroteknologi (diplomingeniør)", "Computer engineering (diplomingeniør)", "Softwareteknologi (diplomingeniør)", "Design og anvendelse af kunstig intelligens (diplomingeniør)", "Integreret design (diplomingeniør)", "Mobilitet, transport og logistik (diplomingeniør)", "Skibsfører", "Skibsofficer", "Skibsteknik og maritimt design (diplomingeniør)", "Smykker, teknologi og business", "Tekstildesign, -håndværk og formidling", "Crafts in Glass and Ceramics", "Visuel kommunikation", "Grafisk kommunikation", "Graphic Storytelling", "Animation", "Lyddesign", "Multiplatform Storytelling and Production", "Filmproduktionsledelse", "Tv- og medietilrettelæggelse"]
  }
];

const EpxState = {
  get() {
    try {
      return JSON.parse(localStorage.getItem("epxNexusData")) || {};
    } catch (e) {
      return {};
    }
  },
  set(key, value) {
    const data = EpxState.get();
    data[key] = value;
    localStorage.setItem("epxNexusData", JSON.stringify(data));
  },
  clearKey(key) {
    const data = EpxState.get();
    delete data[key];
    localStorage.setItem("epxNexusData", JSON.stringify(data));
  },
  clearAll() {
    localStorage.removeItem("epxNexusData");
  }
};

// Meget forenklet mock-login til prototypen – ingen rigtig konto/backend
const EpxAuth = {
  getUser() {
    try {
      return JSON.parse(localStorage.getItem("epxNexusAuth"));
    } catch (e) {
      return null;
    }
  },
  isLoggedIn() {
    return !!EpxAuth.getUser();
  },
  login(navn) {
    const initialer = navn
      .split(" ")
      .map((del) => del[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
    localStorage.setItem("epxNexusAuth", JSON.stringify({ navn: navn, initialer: initialer }));
  },
  logout() {
    localStorage.removeItem("epxNexusAuth");
  }
};

// Gemte forløb – pr. (demo-)bruger, i en SEPARAT nøgle, så "Ryd alle felter" aldrig sletter dem.
// Ligger kun i denne browser, indtil der er en rigtig backend.
const EpxForloeb = {
  KEY: "epxNexusForloeb",
  laes() {
    try {
      return JSON.parse(localStorage.getItem(EpxForloeb.KEY)) || {};
    } catch (e) {
      return {};
    }
  },
  liste() {
    const bruger = EpxAuth.getUser();
    if (!bruger) return [];
    return (EpxForloeb.laes()[bruger.navn] || []).slice().sort((a, b) => b.gemt - a.gemt);
  },
  hent(id) {
    return EpxForloeb.liste().find((f) => f.id === id) || null;
  },
  // Gemmer en komplet kopi af kladden. Med id overskrives et eksisterende forløb. Returnerer id, eller null hvis det fejlede.
  gem(titel, data, id) {
    const bruger = EpxAuth.getUser();
    if (!bruger) return null;
    try {
      const alle = EpxForloeb.laes();
      const liste = alle[bruger.navn] || [];
      const kopi = JSON.parse(JSON.stringify(data));
      delete kopi.aabentForloebId;
      delete kopi.forslagTitel;
      const nu = Date.now();
      let post = id ? liste.find((f) => f.id === id) : null;
      if (post) {
        post.titel = titel;
        post.data = kopi;
        post.gemt = nu;
      } else {
        post = { id: "f" + nu + Math.random().toString(36).slice(2, 6), titel: titel, data: kopi, gemt: nu };
        liste.push(post);
      }
      alle[bruger.navn] = liste;
      localStorage.setItem(EpxForloeb.KEY, JSON.stringify(alle));
      return post.id;
    } catch (e) {
      return null;
    }
  },
  slet(id) {
    const bruger = EpxAuth.getUser();
    if (!bruger) return;
    const alle = EpxForloeb.laes();
    alle[bruger.navn] = (alle[bruger.navn] || []).filter((f) => f.id !== id);
    localStorage.setItem(EpxForloeb.KEY, JSON.stringify(alle));
  }
};

// Foreslår et navn til et forløb ud fra fag, erhvervsområde og dato
function foreslaaForloebTitel(data) {
  const dele = [];
  if (data.fag) dele.push(data.fag === "Andet fag" ? (data.fagAndet || "Andet fag") : data.fag);
  const gren = data.erhverv && data.erhverv.hovedomraade
    ? EPX_GRENE.find((g) => g.id === data.erhverv.hovedomraade)
    : null;
  if (gren) dele.push(gren.navn);
  const d = new Date();
  dele.push(d.getDate() + "/" + (d.getMonth() + 1));
  return dele.join(" – ");
}

// Tegner login-status i topbaren (kaldes automatisk på alle sider, der indlæser epx-data.js)
function renderTopbarAuth() {
  const area = document.getElementById("userArea");
  if (!area) return;
  const user = EpxAuth.getUser();
  area.innerHTML = "";
  if (user) {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "user-chip";
    chip.title = "Log ud";
    chip.innerHTML = '<span class="user-avatar">' + user.initialer + "</span> " + user.navn;
    chip.addEventListener("click", () => {
      if (confirm("Vil du logge ud?")) {
        EpxAuth.logout();
        renderTopbarAuth();
        document.dispatchEvent(new Event("epx-auth-changed"));
      }
    });
    area.appendChild(chip);
  } else {
    const loginLink = document.createElement("a");
    loginLink.className = "login-link";
    loginLink.href = "opret-bruger.html";
    loginLink.innerHTML = "🔑 Log ind";
    area.appendChild(loginLink);
  }
}
document.addEventListener("DOMContentLoaded", renderTopbarAuth);

// Rækkefølge for "Dine input"-undersiderne, når man klikker "Gem og fortsæt"
const DINE_INPUT_REKKEFOLGE = ["erhverv", "lokaler", "paedagogisk", "didaktisk", "formaal", "forudsaetninger"];

function dineInputUrl(key) {
  return key === "erhverv" ? "erhverv.html" : "dine-input.html?felt=" + key;
}

// Konfiguration for de generiske "Dine input"-undersider (alle undtagen Erhverv, som har sin egen side)
const DINE_INPUT_FELTER = {
  lokaler: {
    titel: "Lokaler og udstyr",
    ikon: "🏢",
    intro: "Vælg de faciliteter og det udstyr, I har adgang til, så forslaget tilpasses jeres muligheder.",
    type: "checkbox",
    muligheder: [
      { navn: "Værksted (træ/metal)", ikon: "🔨" },
      { navn: "Naturfagslokale/laboratorium", ikon: "🧪" },
      { navn: "Idrætshal/gymnastiksal", ikon: "🏀" },
      { navn: "Udendørsareal/have", ikon: "🌳" },
      { navn: "IT-lokale/computere", ikon: "💻" },
      { navn: "Køkken", ikon: "🍳" },
      { navn: "3D-printer/digital fabrikation", ikon: "🖨️" },
      { navn: "Kun almindeligt klasselokale", ikon: "🪑" }
    ],
    fritekstLabel: "Andet udstyr eller lokale",
    fritekstPlaceholder: "Fx adgang til et bestemt værksted eller udlånt udstyr ..."
  },
  paedagogisk: {
    titel: "Pædagogisk tilgang",
    ikon: "🧑‍🏫",
    intro: "Vælg den eller de tilgange, der passer bedst til din undervisning (vælg gerne flere).",
    type: "checkbox",
    muligheder: [
      { navn: "Projektbaseret læring", ikon: "📁" },
      { navn: "Undersøgelsesbaseret / eksperimenterende", ikon: "🔍" },
      { navn: "Cases og virkelighedsnære problemstillinger", ikon: "🧩" },
      { navn: "Klasseundervisning med praktiske øvelser", ikon: "📝" },
      { navn: "Gruppearbejde og samarbejde", ikon: "🤝" },
      { navn: "Individuel fordybelse", ikon: "🎯" }
    ],
    fritekstLabel: "Andre pædagogiske overvejelser",
    fritekstPlaceholder: "Fx særlige hensyn til klassens sammensætning ..."
  },
  didaktisk: {
    titel: "Didaktisk tilgang",
    ikon: "📄",
    intro: "Vælg den didaktiske tilgang til forløbet (vælg gerne flere).",
    type: "checkbox",
    muligheder: [
      { navn: "Praksis før teori", ikon: "🛠️" },
      { navn: "Teori før praksis", ikon: "📖" },
      { navn: "Induktiv tilgang (fra eksempel til teori)", ikon: "🔄" },
      { navn: "Tværfagligt samspil", ikon: "🔗" },
      { navn: "Stilladsering (trinvis stigende sværhedsgrad)", ikon: "🪜" }
    ],
    fritekstLabel: "Andre didaktiske overvejelser",
    fritekstPlaceholder: "Fx ønsker til progression i forløbet ..."
  },
  formaal: {
    titel: "Formål og tidsramme",
    ikon: "🎯",
    intro: "Vælg formålet med forløbet, og hvor mange lektioner det skal fylde.",
    type: "select-group",
    felter: [
      {
        id: "formaalValg",
        label: "Formål med forløbet",
        muligheder: ["Introduktion til nyt emne", "Fordybelse", "Repetition", "Prøveforberedelse"]
      },
      {
        id: "tidsrammeValg",
        label: "Tidsramme",
        muligheder: ["1-2 lektioner", "3-5 lektioner", "Et helt forløb (6+)"]
      }
    ]
  },
  forudsaetninger: {
    titel: "Elevernes forudsætninger",
    ikon: "📊",
    intro: "Vælg holdets faglige niveau i faget.",
    type: "select-group",
    felter: [
      {
        id: "niveauValg",
        label: "Fagligt niveau",
        muligheder: ["Nybegyndere", "Har grundlæggende viden", "Øvede", "Blandet niveau"]
      }
    ],
    fritekstLabel: "Særlige opmærksomhedspunkter",
    fritekstPlaceholder: "Fx elever med behov for ekstra støtte eller ekstra udfordring ..."
  }
};

// Har brugeren reelt udfyldt noget i dette "Dine input"-felt?
function erFeltUdfyldt(key) {
  const data = EpxState.get()[key];
  if (!data) return false;
  if (key === "erhverv") return !!data.hovedomraade;
  const felt = DINE_INPUT_FELTER[key];
  if (!felt) return !!data;
  if (felt.type === "checkbox") return !!((data.valgt && data.valgt.length) || data.fritekst);
  if (felt.type === "select-group") return felt.felter.some((f) => !!data[f.id]);
  return true;
}

// Finder det næste IKKE-udfyldte "Dine input"-felt (springer over dem, der allerede er udfyldt).
// Returnerer null, når alle felter er udfyldt.
function naesteUdfyldelsesTrin(nuvaerendeKey) {
  const startIndex = DINE_INPUT_REKKEFOLGE.indexOf(nuvaerendeKey);
  for (let i = 1; i <= DINE_INPUT_REKKEFOLGE.length; i++) {
    const key = DINE_INPUT_REKKEFOLGE[(startIndex + i) % DINE_INPUT_REKKEFOLGE.length];
    if (key === nuvaerendeKey) continue;
    if (!erFeltUdfyldt(key)) return key;
  }
  return null;
}

// Første udfyldte felt overhovedet – bruges af "Guide mig igennem forløbet" på forsiden
function foersteUdfyldelsesTrin() {
  for (let i = 0; i < DINE_INPUT_REKKEFOLGE.length; i++) {
    if (!erFeltUdfyldt(DINE_INPUT_REKKEFOLGE[i])) return DINE_INPUT_REKKEFOLGE[i];
  }
  return null;
}

// Billede pr. gren til "Dit forslag" – udelades hvis intet erhvervsområde er valgt
const GREN_BILLEDER = {
  samfund: "https://images.unsplash.com/photo-1584515933487-779824d29309?w=700&auto=format&fit=crop&q=60",
  natur: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=700&auto=format&fit=crop&q=60",
  business: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=700&auto=format&fit=crop&q=60",
  haandvaerk: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=700&auto=format&fit=crop&q=60"
};

// Standardvarsel, der altid vises ved AI-genereret indhold
const AI_VARSEL = "🤖 AI-genereret materiale. Indholdet er automatisk genereret ud fra dine input og skal gennemgås og kvalitetssikres af underviseren, før det tages i brug.";

// Samler en kort, læsbar liste over de valg, brugeren rent faktisk har tastet ind – bruges til at vise gennemsigtighed i AI-materialer
function samlBrugerValg(data) {
  data = data || EpxState.get();
  const dele = [];
  if (data.fag) {
    dele.push(data.fag === "Andet fag" ? (data.fagAndet || "Andet fag") : data.fag);
  }
  if (data.erhverv && data.erhverv.hovedomraade) {
    const gren = EPX_GRENE.find((g) => g.id === data.erhverv.hovedomraade);
    if (gren) {
      const specifik = (data.erhverv.specifikke || [])[0];
      dele.push(gren.navn + (specifik ? " (" + specifik + ")" : ""));
    }
  }
  if (data.paedagogisk && data.paedagogisk.valgt && data.paedagogisk.valgt.length) {
    dele.push(data.paedagogisk.valgt[0]);
  }
  if (data.didaktisk && data.didaktisk.valgt && data.didaktisk.valgt.length) {
    dele.push(data.didaktisk.valgt[0]);
  }
  if (data.formaal && data.formaal.formaalValg) {
    dele.push(data.formaal.formaalValg);
  }
  if (data.saerligeOensker) {
    dele.push('"' + data.saerligeOensker + '" (Særlige ønsker)');
  }
  return dele;
}


// Afsnittene i "Dit forslag". Indholdet skrives af AI'en ud fra lærerens input (se api/generer.js)
const FORSLAG_SEKTIONER = [
  { id: "vejledning", ikon: "🧭", titel: "Vejledning og afklaring" },
  { id: "laeringsmaal", ikon: "➕", titel: "Læringsmål" },
  { id: "erhverv", ikon: "💼", titel: "Erhverv" },
  { id: "projekt", ikon: "📄", titel: "Projekt" },
  { id: "aktiviteter", ikon: "⚙️", titel: "Aktiviteter" },
  { id: "materialer", ikon: "📚", titel: "Øvelser, cases og opgaver", dynamisk: true },
  { id: "udstyr", ikon: "🧰", titel: "Udstyr og materialer" },
  { id: "evaluering", ikon: "✅", titel: "Evaluering" },
  { id: "videre", ikon: "⭐", titel: "Videre muligheder" }
];

const MATERIALE_IKONER = { "Øvelse": "✏️", "Case": "📄", "Opgave": "📝", "Afklaringsøvelse": "🧭" };
const HENVISNING_IKONER = { PDF: "📄", Web: "🔗", Video: "🎬" };

// Halvfærdigt forslag, der vises mens AI'en skriver (gemmes ikke, før det er færdigt)
let forslagUdkast = null;

// Læser JSON, der endnu ikke er skrevet færdig: lukker åbne tekster, lister og objekter.
// Returnerer null, hvis der ikke er noget brugbart endnu.
function parseDelvisJson(tekst) {
  const stak = [];
  let iTekst = false;
  let escape = false;
  let sikker = null; // seneste sted, hvor alt før er komplet (lige før et komma)
  for (let i = 0; i < tekst.length; i++) {
    const c = tekst[i];
    if (iTekst) {
      if (escape) escape = false;
      else if (c === "\\") escape = true;
      else if (c === '"') iTekst = false;
    } else if (c === '"') iTekst = true;
    else if (c === "{" || c === "[") stak.push(c === "{" ? "}" : "]");
    else if (c === "}" || c === "]") stak.pop();
    else if (c === ",") sikker = { i: i, luk: stak.slice().reverse().join("") };
  }
  const forsoeg = [tekst.replace(/\\$/, "") + (iTekst ? '"' : "") + stak.slice().reverse().join("")];
  if (sikker) forsoeg.push(tekst.slice(0, sikker.i) + sikker.luk);
  for (const f of forsoeg) {
    try {
      return JSON.parse(f);
    } catch (e) { /* prøv næste */ }
  }
  return null;
}

/* ---------------------------------------------------------
   Genererede forløb. Hvert forløb gemmer sine EGNE valg (raa = felterne, input = til AI'en), så
   felterne på forsiden kan ryddes til et nyt forløb, mens justeringer af et færdigt forløb stadig
   bygger på de valg, det blev lavet ud fra. Ét forløb ad gangen er "aktivt" (vises til højre og
   åbnes på detaljesiden).
--------------------------------------------------------- */
const INPUT_NOEGLER = ["fag", "fagAndet", "erhverv", "lokaler", "paedagogisk", "didaktisk", "formaal",
  "forudsaetninger", "afklaringsgrad", "afklaringsfokus", "afklaringSkipped", "saerligeOensker"];

// En uafhængig kopi af felternes værdier
function kopierInput(d) {
  const kopi = {};
  INPUT_NOEGLER.forEach((k) => {
    if (d[k] !== undefined) kopi[k] = JSON.parse(JSON.stringify(d[k]));
  });
  return kopi;
}

function hentForloebListe() {
  const d = EpxState.get();
  if (Array.isArray(d.forloeb)) return d.forloeb;
  // Ældre kladde med ét forslag direkte i kladden: lav det om til et forløb
  const liste = [];
  if (d.forslag && d.forslag.sektioner) {
    const raa = kopierInput(d);
    liste.push({ id: "f" + Date.now(), forslag: d.forslag, raa: raa, input: samlInputTilAI(raa),
      oprettet: Date.now(), gemtId: d.aabentForloebId || null, titel: d.forslagTitel || null });
    EpxState.set("aktivtForloebId", liste[0].id);
    EpxState.clearKey("forslag");
  }
  EpxState.set("forloeb", liste);
  return liste;
}

function hentAktivtForloeb() {
  const liste = hentForloebListe();
  const id = EpxState.get().aktivtForloebId;
  return liste.find((f) => f.id === id) || liste[liste.length - 1] || null;
}

function saetAktivtForloeb(id) {
  EpxState.set("aktivtForloebId", id);
}

function tilfoejForloeb(felter) {
  const liste = hentForloebListe();
  const nyt = Object.assign({ id: "f" + Date.now() + Math.random().toString(36).slice(2, 6), oprettet: Date.now() }, felter);
  liste.push(nyt);
  EpxState.set("forloeb", liste);
  saetAktivtForloeb(nyt.id);
  return nyt;
}

function opdaterForloeb(id, aendringer) {
  const liste = hentForloebListe();
  const f = liste.find((x) => x.id === id);
  if (!f) return;
  Object.assign(f, aendringer);
  EpxState.set("forloeb", liste);
}

function fjernForloeb(id) {
  EpxState.set("forloeb", hentForloebListe().filter((f) => f.id !== id));
  if (EpxState.get().aktivtForloebId === id) EpxState.clearKey("aktivtForloebId");
}

// Gemmer et justeret forslag i det aktive forløb
function opdaterForslag(forslag) {
  const aktivt = hentAktivtForloeb();
  if (aktivt) opdaterForloeb(aktivt.id, { forslag: forslag });
}

// Det aktive forløbs egne valg – bruges ved justering, PowerPoint/Word og download
function forloebInput() {
  const aktivt = hentAktivtForloeb();
  return (aktivt && aktivt.input) || samlInputTilAI();
}

function forloebRaa() {
  const aktivt = hentAktivtForloeb();
  return (aktivt && aktivt.raa) || EpxState.get();
}

// Det aktive forløbs forslag (eller det halvfærdige, mens AI'en skriver) – null, hvis der ikke er noget
function hentForslag() {
  if (forslagUdkast) return forslagUdkast;
  const aktivt = hentAktivtForloeb();
  return aktivt && aktivt.forslag && aktivt.forslag.sektioner ? aktivt.forslag : null;
}

// Afsnittene flettet sammen med det genererede indhold – bruges af forsiden og detaljesiden
function hentForslagSektioner() {
  const forslag = hentForslag();
  if (!forslag) return [];
  return FORSLAG_SEKTIONER.map((s) => {
    const indhold = forslag.sektioner[s.id] || {};
    const sektion = Object.assign({}, s, indhold);
    if (sektion.henvisninger) {
      sektion.henvisninger = sektion.henvisninger.map((h) => Object.assign({ ikon: HENVISNING_IKONER[h.type] || "🔗" }, h));
    }
    return sektion;
  });
}

// Øvelser, cases og opgaver fra det genererede forslag
function genererMaterialer() {
  const forslag = hentForslag();
  if (!forslag) return [];
  const valgListe = samlBrugerValg(forslagUdkast ? EpxState.get() : forloebRaa());
  const baseretPaa = valgListe.length ? valgListe.join(" · ") : "ingen valg fra \"Dine input\"";
  return (forslag.materialer || []).map((m, i) => ({
    id: m.type === "Afklaringsøvelse" ? "afklaring" : "materiale" + i,
    type: m.type,
    ikon: MATERIALE_IKONER[m.type] || "📝",
    titel: m.titel,
    krop: m.krop || [],
    baseretPaa: baseretPaa
  }));
}

// Samler ALLE lærerens input til AI'en – med læsbare navne i stedet for interne id'er
function samlInputTilAI(d) {
  d = d || EpxState.get();
  const gren = d.erhverv && d.erhverv.hovedomraade ? EPX_GRENE.find((g) => g.id === d.erhverv.hovedomraade) : null;
  return {
    fag: d.fag === "Andet fag" ? d.fagAndet : d.fag,
    erhverv: {
      omraade: gren ? gren.navn : "",
      omraadeBeskrivelse: gren ? gren.beskrivelse : "",
      // Kun uddannelser, der stadig findes på listen (ældre gemte valg kan indeholde udgåede navne).
      // Valgene ligger samlet i specifikke og deles her op i erhvervsuddannelser (EUD) og professionsbachelorer (PBA).
      specifikke: ((d.erhverv && d.erhverv.specifikke) || []).filter((navn) => gren && gren.erhverv.includes(navn)),
      pba: ((d.erhverv && d.erhverv.specifikke) || []).filter((navn) => gren && (gren.pba || []).includes(navn)),
      fritekst: (d.erhverv && d.erhverv.fritekst) || ""
    },
    lokaler: d.lokaler || null,
    paedagogisk: d.paedagogisk || null,
    didaktisk: d.didaktisk || null,
    formaal: d.formaal || null,
    forudsaetninger: d.forudsaetninger || null,
    afklaringSkipped: !!d.afklaringSkipped,
    afklaringsgrad: d.afklaringsgrad || "",
    afklaringsfokus: d.afklaringsfokus || [],
    saerligeOensker: d.saerligeOensker || ""
  };
}

/* ---------------------------------------------------------
   Download som Word, PowerPoint og PDF (filerne bygges i export.js)
   Her beskrives kun INDHOLDET, så de tre filtyper altid indeholder det samme.
--------------------------------------------------------- */
function eksportMeta() {
  const i = forloebInput();
  return [
    ["Fag", i.fag || ""],
    ["Erhvervsområde", i.erhverv.omraade],
    ["Erhvervsuddannelser", i.erhverv.specifikke.join(", ")],
    ["Professionsbachelorer", (i.erhverv.pba || []).join(", ")],
    ["Tidsramme", (i.formaal && i.formaal.tidsrammeValg) || ""],
    ["Dato", new Date().toLocaleDateString("da-DK", { day: "numeric", month: "long", year: "numeric" })]
  ].filter((r) => r[1]);
}

// Ét afsnit som almindelig tekst: brødtekst først, derefter punkter (linjer med "- " bliver til punktopstilling)
function eksportSektionTekst(sektion) {
  const linjer = [];
  if (sektion.resume && !(sektion.krop || []).length) linjer.push(sektion.resume);
  (sektion.krop || []).forEach((a) => linjer.push(a));
  (sektion.liste || []).forEach((p) => linjer.push(/^\d+[.)]/.test(p) ? p : "- " + p));
  (sektion.udstyr || []).forEach((v) => linjer.push("- " + v.navn + " (" + v.antal + ") – " + v.kategori));
  (sektion.henvisninger || []).forEach((h) => linjer.push("- " + h.titel + " – " + h.kilde + " (" + h.type + ")"));
  return linjer.join("\n");
}

// Elevudgaven har ingen note til underviseren på hver opgave
function eksportMaterialer(tilElever) {
  return genererMaterialer().map((m) => ({
    title: m.type + ": " + m.titel,
    source: tilElever ? "" : "AI-genereret materiale – skal gennemgås af underviseren før brug",
    content: m.krop.join("\n")
  }));
}

// Hvad der kommer med i filen: "hele" forløbet, kun "vejledning" (lærerens del) eller "elev" (opgaver til eleverne)
const EKSPORT_VARIANTER = {
  hele: { kind: "Forløbsforslag", filnavn: "Forløb" },
  vejledning: { kind: "Lærervejledning", filnavn: "Lærervejledning" },
  elev: { kind: "Opgaver til eleverne", filnavn: "Elevopgaver" }
};

function bygForslagEksport(variant) {
  const forslag = hentForslag();
  if (!forslag || forslagUdkast) return null;
  const v = EKSPORT_VARIANTER[variant] ? variant : "hele";
  const sektioner = hentForslagSektioner()
    .filter((s) => !s.dynamisk)
    .map((s) => ({ heading: s.titel, body: eksportSektionTekst(s) }));
  return {
    filename: EKSPORT_VARIANTER[v].filnavn + " " + forslag.titel,
    kind: EKSPORT_VARIANTER[v].kind,
    title: forslag.titel,
    subtitle: forslag.undertitel || "",
    // Eleverne skal kun se fag og dato – ikke lærerens planlægningsoplysninger
    meta: v === "elev" ? eksportMeta().filter((r) => r[0] === "Fag" || r[0] === "Dato") : eksportMeta(),
    sections: v === "elev" ? [] : sektioner,
    materials: v === "vejledning" ? [] : eksportMaterialer(v === "elev"),
    // Elevudgaven: én opgave pr. side / slide, så den kan bruges direkte
    materialeSider: v === "elev"
  };
}

// Ét afsnit (detaljesiden)
function bygSektionEksport(sektionId) {
  const forslag = hentForslag();
  const sektion = hentForslagSektioner().find((s) => s.id === sektionId);
  if (!forslag || !sektion) return null;
  return {
    filename: sektion.titel + " " + forslag.titel,
    kind: sektion.titel,
    title: forslag.titel,
    subtitle: forslag.undertitel || "",
    meta: eksportMeta(),
    sections: sektion.dynamisk ? [] : [{ heading: sektion.titel, body: eksportSektionTekst(sektion) }],
    materials: sektion.dynamisk ? eksportMaterialer() : []
  };
}
