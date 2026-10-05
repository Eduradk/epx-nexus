// Server-funktion: Claude udarbejder indholdet til en PowerPoint eller et Word-dokument ud fra lærerens
// beskrivelse og det aktuelle forløb. Selve filen (.pptx/.docx) bygges bagefter i browseren (public/export.js).
const { ForslagFejl, beskrivInput, kaldClaude, haandter, tjekInput } = require("../lib/forslag");

const tekst = { type: "string" };
const FORMATER = {
  powerpoint: {
    navn: "PowerPoint-præsentationen",
    skema: {
      type: "object",
      properties: {
        title: tekst,
        subtitle: tekst,
        slides: {
          type: "array",
          items: {
            type: "object",
            properties: { heading: tekst, bullets: { type: "array", items: tekst } },
            required: ["heading", "bullets"],
            additionalProperties: false
          }
        }
      },
      required: ["title", "subtitle", "slides"],
      additionalProperties: false
    },
    krav: `Lav en klar, praksisnær præsentation, der er klar til at vise i undervisningen:
- title: kort forside-titel (maks. 8 ord). subtitle: én linje.
- slides: 4-6 indholdsslides i logisk rækkefølge (fx introduktion, centrale begreber, kobling til erhvervet, opgave/øvelse, opsamling). Saml hellere flere emner på ét slide end at lave flere slides.
- Hvert slide har en kort overskrift (heading) og 2-5 korte punkter (bullets). Hvert punkt er én kort sætning.`,
    erFaerdig: (p) => Array.isArray(p.slides) && p.slides.length > 0
  },
  word: {
    navn: "Word-dokumentet",
    skema: {
      type: "object",
      properties: {
        title: tekst,
        subtitle: tekst,
        sections: {
          type: "array",
          items: {
            type: "object",
            properties: { heading: tekst, body: tekst },
            required: ["heading", "body"],
            additionalProperties: false
          }
        }
      },
      required: ["title", "subtitle", "sections"],
      additionalProperties: false
    },
    krav: `Lav et klart, praksisnært dokument, der er klar til brug i undervisningen (fx et opgaveark eller en elevvejledning):
- title: kort titel (maks. 8 ord). subtitle: én linje.
- sections: 3-5 afsnit, hvert med en kort overskrift (heading) og en brødtekst (body) på højst ca. 120 ord.
- Skriv brødteksten som almindelig tekst med linjeskift mellem afsnit. Til opremsning skrives hvert punkt på sin egen linje, der begynder med "- ".`,
    erFaerdig: (p) => Array.isArray(p.sections) && p.sections.length > 0
  }
};

function system(format) {
  return `Du er en erfaren dansk didaktiker, der udarbejder undervisningsmateriale til EPX (den erhvervsrettede ungdomsuddannelse). Skriv i et enkelt, konkret og letlæst dansk, der passer til elevernes niveau.

${format.krav}

Materialet skal passe til lærerens forløb (fag, erhvervsuddannelser, niveau og tidsramme), som du får oplyst.
Fokus er udelukkende på erhvervsuddannelser (EUD og EUX): nævn ikke professionsbachelor-, erhvervsakademi- eller universitetsuddannelser.
Brug ikke markdown-symboler som **, # eller * i teksten.`;
}

module.exports = (req, res) =>
  haandter(req, res, async ({ input, forslag, format, beskrivelse }) => {
    tjekInput(input);
    const valgt = FORMATER[format];
    if (!valgt) throw new ForslagFejl(400, "Vælg PowerPoint eller Word-dokument.");
    if (typeof beskrivelse !== "string" || !beskrivelse.trim()) {
      throw new ForslagFejl(400, "Beskriv, hvad materialet skal handle om.");
    }

    // Kun det vigtigste fra forløbet sendes med, så materialet passer til det
    const f = forslag && typeof forslag === "object" ? forslag : {};
    const s = f.sektioner || {};
    const forloeb = [
      f.titel ? "Forløbets titel: " + String(f.titel).slice(0, 200) : "",
      s.laeringsmaal && s.laeringsmaal.resume ? "Læringsmål: " + String(s.laeringsmaal.resume).slice(0, 600) : "",
      s.projekt && s.projekt.resume ? "Projekt: " + String(s.projekt.resume).slice(0, 600) : ""
    ].filter(Boolean).join("\n");

    const besked =
      "Lærerens input til forløbet:\n\n" + beskrivInput(input) +
      (forloeb ? "\n\nForløbet, materialet hører til:\n" + forloeb : "") +
      "\n\nLærerens ønske til " + valgt.navn + ":\n" + beskrivelse.trim().slice(0, 2000);

    const produkt = await kaldClaude(besked, valgt.skema, { system: system(valgt), effort: "low" });
    if (!valgt.erFaerdig(produkt)) {
      throw new ForslagFejl(502, "Materialet blev ikke færdigt. Prøv igen, eventuelt med en kortere beskrivelse.");
    }
    return { produkt };
  });
