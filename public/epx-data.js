// Fælles data og state for EPX Nexus-prototypen. Indlæses før side-specifikke scripts.

const EPX_GRENE = [
  {
    id: "samfund",
    navn: "Samfund, sikkerhed og sundhed",
    ikon: "🛡️",
    accent: "navy",
    beskrivelse: "Det pædagogiske og socialfaglige område samt sundheds- og sikkerhedsområdet.",
    erhverv: ["Pædagog", "Socialrådgiver", "Sygeplejerske", "Politibetjent", "Beredskabsmedarbejder", "Ergoterapeut", "Fysioterapeut", "Bioanalytiker"]
  },
  {
    id: "natur",
    navn: "Natur, teknologi og forbrug",
    ikon: "🌱",
    accent: "green",
    beskrivelse: "Jordbrug, skovbrug, naturforvaltning, teknik og miljø, biotek samt fødevareområdet.",
    erhverv: ["Jordbrugsteknolog", "Skov- og naturtekniker", "Fødevareingeniør", "Miljøteknolog", "Veterinærsygeplejerske", "Ernæringsassistent", "Bioteknolog", "Anlægsgartner"]
  },
  {
    id: "business",
    navn: "Business og innovation",
    ikon: "💼",
    accent: "purple",
    beskrivelse: "Det merkantile område – handel, markedsføring, økonomi og innovation.",
    erhverv: ["Detailhandelsassistent", "Markedsføringsøkonom", "Finansøkonom", "Eventkoordinator", "Erhvervsjurist", "Iværksætter", "Kontoruddannet", "International handel og shipping"]
  },
  {
    id: "haandvaerk",
    navn: "Håndværk, resurser og design",
    ikon: "🛠️",
    accent: "blue",
    beskrivelse: "Byggeri, industri, energiforsyning, design og kunsthåndværk.",
    erhverv: ["Tømrer", "Snedker", "Elektriker", "VVS'er", "Bygningskonstruktør", "Møbelsnedker", "Designteknolog", "Smed"]
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

// Rækkefølge for "Guide mig igennem forløbet" på tværs af "Dine input"-undersiderne
const DINE_INPUT_REKKEFOLGE = ["erhverv", "lokaler", "paedagogisk", "didaktisk", "formaal", "forudsaetninger"];

function dineInputUrl(key, guided) {
  const base = key === "erhverv" ? "erhverv.html" : "dine-input.html?felt=" + key;
  if (!guided) return base;
  return base + (base.indexOf("?") > -1 ? "&" : "?") + "guided=1";
}

function naesteDineInputTrin(nuvaerendeKey) {
  const i = DINE_INPUT_REKKEFOLGE.indexOf(nuvaerendeKey);
  return i > -1 && i < DINE_INPUT_REKKEFOLGE.length - 1 ? DINE_INPUT_REKKEFOLGE[i + 1] : null;
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

// Billede pr. gren til "Dit forslag" – udelades hvis intet erhvervsområde er valgt
const GREN_BILLEDER = {
  samfund: "https://images.unsplash.com/photo-1584515933487-779824d29309?w=700&auto=format&fit=crop&q=60",
  natur: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=700&auto=format&fit=crop&q=60",
  business: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=700&auto=format&fit=crop&q=60",
  haandvaerk: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=700&auto=format&fit=crop&q=60"
};

// Det (dummy) genererede forslag – delt mellem forsiden (resuméer) og detaljesiden (fuldt indhold)
const FORSLAG_SEKTIONER = [
  {
    id: "vejledning",
    ikon: "🧭",
    titel: "Vejledning og afklaring",
    resume: "Forløbet indeholder refleksionsspørgsmål og møder med erhverv, der hjælper delvist afklarede elever med at koble deres interesse for byggeri til konkrete erhverv og videre uddannelsesveje.",
    krop: [
      "Eleverne arbejder undervejs i forløbet med korte refleksionsspørgsmål, der kobler det faglige indhold til deres egen afklaringsproces.",
      "Efter byggeprojektet præsenteres eleverne for konkrete erhverv inden for det valgte hovedområde, så de kan spejle egne interesser i virkelige jobfunktioner.",
      "Forløbet afsluttes med en kort samtale i grupper om, hvilke dele af arbejdet der føltes mest meningsfulde – og hvorfor."
    ]
  },
  {
    id: "laeringsmaal",
    ikon: "➕",
    titel: "Læringsmål",
    resume: "Eleverne kan anvende matematik til at løse virkelighedsnære problemer inden for mål, beregninger og økonomi.",
    krop: [
      "Eleven kan opstille og løse praktiske beregninger af areal, volumen og vinkler.",
      "Eleven kan omsætte et budget til konkrete materialevalg og vurdere konsekvenser af ændringer.",
      "Eleven kan formidle en faglig løsning mundtligt for en ekstern modtager."
    ]
  },
  {
    id: "erhverv",
    ikon: "🏗️",
    titel: "Erhverv",
    resume: "Tømrer, bygningskonstruktør, projektleder, murer m.fl.",
    krop: [
      "Tømrer – arbejder med konstruktion og opførelse af bygninger i træ.",
      "Bygningskonstruktør – projekterer og planlægger byggeprojekter.",
      "Projektleder (bygge og anlæg) – koordinerer tid, budget og fagfolk på en byggeplads.",
      "Murer – opfører og renoverer bygningers murværk og facader."
    ]
  },
  {
    id: "case",
    ikon: "📄",
    titel: "Case",
    resume: "Eleverne arbejder med et byggeprojekt og skal beregne materialeforbrug, areal, volumen, vinkler og pris.",
    krop: [
      "Eleverne får udleveret en plantegning for et mindre udhus og skal beregne det samlede materialeforbrug.",
      "Eleverne udarbejder et prisoverslag ud fra aktuelle materialepriser og sammenligner tre forskellige løsninger.",
      "Casen afsluttes med en kort præsentation af den løsning, gruppen vurderer bedst balancerer pris, holdbarhed og æstetik."
    ]
  },
  {
    id: "aktiviteter",
    ikon: "⚙️",
    titel: "Aktiviteter",
    resume: "Analyse af plantegning, beregning af materialeforbrug, budget og tidsestimat.",
    liste: ["Analyse af plantegning", "Beregning af materialeforbrug", "Budget og tidsestimat"],
    krop: [
      "Forløbet veksler mellem klasseundervisning, gruppearbejde og praktisk arbejde i værksted eller udendørs, hvor det er muligt.",
      "Undervejs indgår korte oplæg fra læreren om centrale matematiske begreber, som eleverne straks omsætter i deres eget arbejde med casen."
    ]
  },
  {
    id: "udstyr",
    ikon: "🧰",
    titel: "Udstyr og materialer",
    resume: "7 varer – kan bruges som bestillingsliste til de aktiviteter, der kræver særligt udstyr.",
    udstyr: [
      { navn: "Målebånd", antal: "1 pr. gruppe", kategori: "Værktøj" },
      { navn: "Vinkelmåler / tømrervinkel", antal: "1 pr. gruppe", kategori: "Værktøj" },
      { navn: "Lommeregner eller adgang til regneark", antal: "1 pr. elev", kategori: "Udstyr" },
      { navn: "Karton eller balsatræ til model", antal: "2 plader pr. gruppe", kategori: "Materiale" },
      { navn: "Limpistol", antal: "1 pr. gruppe", kategori: "Værktøj" },
      { navn: "Beskyttelsesbriller", antal: "1 pr. elev", kategori: "Sikkerhedsudstyr" },
      { navn: "Plantegning (print)", antal: "1 pr. elev", kategori: "Materiale" }
    ]
  },
  {
    id: "evaluering",
    ikon: "✅",
    titel: "Evaluering",
    resume: "Produkt, fremlæggelse og refleksion.",
    krop: [
      "Eleverne evalueres på deres skriftlige beregninger, den mundtlige fremlæggelse af løsningen samt en kort skriftlig refleksion over egen arbejdsproces.",
      "Der gives løbende feedback undervejs i forløbet, så eleverne kan justere deres løsning inden den afsluttende fremlæggelse."
    ]
  },
  {
    id: "videre",
    ikon: "⭐",
    titel: "Videre muligheder",
    resume: "Se relaterede erhvervsuddannelser og jobmuligheder.",
    krop: [
      "Forløbet kan udvides med et besøg på den lokale erhvervsskoles bygge- og anlægsafdeling.",
      "Eleverne kan invitere en tømrer eller bygningskonstruktør ind som gæstelærer til en kort spørgerunde.",
      "Relaterede erhvervsuddannelser: Tømrer, Snedker, Bygningsstruktør (EUX)."
    ]
  }
];
