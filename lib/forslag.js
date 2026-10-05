// Fælles AI-logik for forløbsforslag: skema, systemprompt, beskrivelse af input og selve kaldet til Claude.
// Bruges af api/generer.js (nyt forslag) og api/juster.js (tilpas hele forslaget efter en ændring).
const Anthropic = require("@anthropic-ai/sdk");

const MODEL = "claude-opus-5";

const tekstListe = { type: "array", items: { type: "string" } };

function sektion(ekstra) {
  const props = Object.assign({ resume: { type: "string" }, krop: tekstListe }, ekstra || {});
  return { type: "object", properties: props, required: Object.keys(props), additionalProperties: false };
}

// Svaret har præcis de afsnit, som siden viser – så designet er uændret, men indholdet følger input
const FORSLAG_SKEMA = {
  type: "object",
  properties: {
    titel: { type: "string" },
    undertitel: { type: "string" },
    sektioner: {
      type: "object",
      properties: {
        vejledning: sektion(),
        laeringsmaal: sektion({ liste: tekstListe }),
        erhverv: sektion(),
        projekt: sektion({ liste: tekstListe }),
        aktiviteter: sektion({ liste: tekstListe }),
        udstyr: {
          type: "object",
          properties: {
            udstyr: {
              type: "array",
              items: {
                type: "object",
                properties: { navn: { type: "string" }, antal: { type: "string" }, kategori: { type: "string" } },
                required: ["navn", "antal", "kategori"],
                additionalProperties: false
              }
            }
          },
          required: ["udstyr"],
          additionalProperties: false
        },
        evaluering: sektion({ liste: tekstListe }),
        videre: sektion({
          henvisninger: {
            type: "array",
            items: {
              type: "object",
              properties: {
                titel: { type: "string" },
                kilde: { type: "string" },
                type: { type: "string", enum: ["PDF", "Web", "Video"] }
              },
              required: ["titel", "kilde", "type"],
              additionalProperties: false
            }
          }
        })
      },
      required: ["vejledning", "laeringsmaal", "erhverv", "projekt", "aktiviteter", "udstyr", "evaluering", "videre"],
      additionalProperties: false
    },
    materialer: {
      type: "array",
      items: {
        type: "object",
        properties: {
          type: { type: "string", enum: ["Øvelse", "Case", "Opgave", "Afklaringsøvelse"] },
          titel: { type: "string" },
          krop: tekstListe
        },
        required: ["type", "titel", "krop"],
        additionalProperties: false
      }
    }
  },
  required: ["titel", "undertitel", "sektioner", "materialer"],
  additionalProperties: false
};

const SYSTEM = `Du er en erfaren dansk didaktiker, der skriver undervisningsforløb til EPX (den erhvervsrettede ungdomsuddannelse). Du skriver på korrekt, klart dansk til en underviser.

Underviseren har udfyldt en række input. Forløbet skal bygges op fra ALLE input samlet – ikke kun ét af dem:
- Fag og erhverv er rammen: Faget bestemmer det faglige indhold, læringsmål og begreber. Erhvervene bestemmer den praksis, projektet og eksemplerne tager afsæt i. Kombinér dem, så faget bruges til at forstå eller løse noget i erhvervet.
- Lokaler og udstyr afgrænser, hvilke aktiviteter der er realistiske. Foreslå ikke udstyr eller lokaler, skolen ikke har, uden at nævne et alternativ.
- Pædagogisk og didaktisk tilgang styrer arbejdsformer, rækkefølge og progression.
- Formål og tidsramme bestemmer omfanget: Aktiviteterne skal passe præcist til det angivne antal lektioner.
- Elevernes forudsætninger bestemmer sværhedsgrad og stilladsering.
- Afklaring (hvis relevant) bestemmer vejledningsdelen og afklaringsøvelsen. Er afklaring markeret som ikke relevant, holdes vejledningsafsnittet kort og generelt, og der laves ingen afklaringsøvelse.
- Særlige ønsker skal tydeligt imødekommes.
Er et input ikke udfyldt, vælger du selv et fornuftigt udgangspunkt, der passer til de øvrige input.

Forløbet har udelukkende fokus på erhvervsuddannelser (EUD og EUX) og de faglærte job, de fører til:
- Alle erhverv og uddannelser, du nævner, skal være erhvervsuddannelser, som de står på ug.dk – fx pædagogisk assistent, social- og sundhedsassistent, tømrer, elektriker eller kontoruddannelsen.
- Nævn ikke professionsbacheloruddannelser (fx pædagog, sygeplejerske, socialrådgiver, bygningskonstruktør), erhvervsakademiuddannelser (fx finansøkonom, markedsføringsøkonom) eller universitetsuddannelser (fx erhvervsjurist) – hverken som erhverv, som eksempler, som gæstelærere eller som videre uddannelsesveje.
- Nævner læreren selv et erhverv, der ikke er en erhvervsuddannelse, tager du i stedet afsæt i den nærmeste erhvervsuddannelse inden for samme område.

Krav til indholdet:
- titel: kort og konkret (maks. ca. 5 ord). undertitel: én linje, der viser koblingen mellem fag og erhverv.
- resume: 1-2 sætninger, der opsummerer afsnittet konkret for netop dette forløb.
- krop: 3-5 afsnit med konkret, brugbart indhold – ingen tomme floskler.
- laeringsmaal.liste: 3-4 tjekbare succeskriterier. projekt.liste: nummererede arbejdstrin. aktiviteter.liste: én linje pr. lektion eller lektionsblok. evaluering.liste: evalueringskriterier.
- udstyr: 4-10 konkrete varer med antal og kategori (fx Værktøj, Materiale, Udstyr, Sikkerhedsudstyr).
- erhverv: beskriv de valgte erhverv og hvad de laver i praksis, og hvordan faget bruges i dem.
- videre.henvisninger: 2-4 henvisninger til reelle, velkendte danske kilder (fx emu.dk, ug.dk, uvm.dk, relevante erhvervsskoler eller faglige organisationer). Opfind ikke specifikke dokumenttitler eller webadresser, du ikke er sikker på findes – beskriv hellere kilden generelt.
- materialer: præcis én Øvelse, én Case og én Opgave, klar til brug med konkrete opgaveformuleringer. Tilføj en Afklaringsøvelse, hvis afklaring er relevant.
Brug ikke markdown-formatering i teksterne.`;

// Gør lærerens input læseligt for Claude (tomme felter skrives eksplicit som "ikke udfyldt")
function beskrivInput(i) {
  const v = (x) => (x && String(x).trim()) || "ikke udfyldt";
  const liste = (felt) => {
    if (!felt) return "ikke udfyldt";
    const dele = [];
    if (felt.valgt && felt.valgt.length) dele.push(felt.valgt.join(", "));
    if (felt.fritekst && felt.fritekst.trim()) dele.push("Note: " + felt.fritekst.trim());
    return dele.length ? dele.join(". ") : "ikke udfyldt";
  };
  const e = i.erhverv || {};
  const afklaring = i.afklaringSkipped
    ? "Ikke relevant for dette forløb"
    : "Afklaringsgrad: " + v(i.afklaringsgrad) + ". Fokus: " + ((i.afklaringsfokus || []).join(", ") || "ikke udfyldt");
  const f = i.formaal || {};
  const u = i.forudsaetninger || {};
  return [
    "Fag: " + v(i.fag),
    "Erhvervsområde: " + v(e.omraade) + (e.omraadeBeskrivelse ? " (" + e.omraadeBeskrivelse + ")" : ""),
    "Valgte erhverv: " + ((e.specifikke || []).join(", ") || "ikke udfyldt"),
    "Note om erhverv: " + v(e.fritekst),
    "Lokaler og udstyr: " + liste(i.lokaler),
    "Pædagogisk tilgang: " + liste(i.paedagogisk),
    "Didaktisk tilgang: " + liste(i.didaktisk),
    "Formål: " + v(f.formaalValg),
    "Tidsramme: " + v(f.tidsrammeValg),
    "Elevernes faglige niveau: " + v(u.niveauValg),
    "Særlige opmærksomhedspunkter om eleverne: " + v(u.fritekst),
    "Afklaring: " + afklaring,
    "Særlige ønsker: " + v(i.saerligeOensker)
  ].join("\n");
}


// Afsnittenes navne, som læreren ser dem – bruges når Claude får besked om, hvilket afsnit der er ændret
const SEKTION_NAVNE = {
  vejledning: "Vejledning og afklaring",
  laeringsmaal: "Læringsmål",
  erhverv: "Erhverv",
  projekt: "Projekt",
  aktiviteter: "Aktiviteter",
  materialer: "Øvelser, cases og opgaver",
  udstyr: "Udstyr og materialer",
  evaluering: "Evaluering",
  videre: "Videre muligheder"
};

class ForslagFejl extends Error {
  constructor(status, besked) {
    super(besked);
    this.status = status;
  }
}

// Kalder Claude og returnerer det strukturerede svar. Kaster ForslagFejl med en besked, læreren kan forstå.
// valg.effort: hvor grundigt Claude tænker (lavere = hurtigere). valg.vedTekst: kaldes løbende med hver ny stump tekst.
async function kaldClaude(brugerbesked, skema, valg) {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new ForslagFejl(500, "AI-nøglen (ANTHROPIC_API_KEY) er ikke sat op på serveren.");
  }
  const { effort = "medium", vedTekst } = valg || {};
  let response;
  try {
    const client = new Anthropic();
    const stream = client.beta.messages.stream({
      model: MODEL,
      max_tokens: 16000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      thinking: { type: "adaptive" },
      output_config: { effort: effort, format: { type: "json_schema", schema: skema } },
      system: SYSTEM,
      messages: [{ role: "user", content: brugerbesked }]
    });
    if (vedTekst) {
      for await (const event of stream) {
        if (event.type === "content_block_delta" && event.delta.type === "text_delta") vedTekst(event.delta.text);
      }
    }
    response = await stream.finalMessage();
  } catch (err) {
    console.error("Kald til Claude fejlede:", err);
    if (err instanceof Anthropic.RateLimitError) {
      throw new ForslagFejl(429, "AI-tjenesten er travl lige nu. Vent et øjeblik, og prøv igen.");
    }
    throw new ForslagFejl(502, "AI-tjenesten svarede ikke. Prøv igen om lidt.");
  }
  if (response.stop_reason === "refusal") {
    throw new ForslagFejl(502, "AI'en afviste forespørgslen. Prøv at omformulere dine ønsker.");
  }
  if (response.stop_reason === "max_tokens") {
    throw new ForslagFejl(502, "Svaret blev for langt og blev afbrudt. Prøv igen.");
  }
  const tekst = response.content.filter((b) => b.type === "text").map((b) => b.text).join("");
  return JSON.parse(tekst);
}

// Fælles svar-håndtering for API-funktionerne
async function haandter(req, res, arbejde) {
  if (req.method !== "POST") {
    res.status(405).json({ fejl: "Kun POST er tilladt." });
    return;
  }
  try {
    res.status(200).json(await arbejde(req.body || {}));
  } catch (err) {
    if (err instanceof ForslagFejl) {
      res.status(err.status).json({ fejl: err.message });
    } else {
      console.error("Uventet fejl:", err);
      res.status(500).json({ fejl: "Der opstod en uventet fejl. Prøv igen." });
    }
  }
}

function tjekInput(input) {
  if (!input || typeof input !== "object" || JSON.stringify(input).length > 20000) {
    throw new ForslagFejl(400, "Ugyldige input.");
  }
}

module.exports = { FORSLAG_SKEMA, SEKTION_NAVNE, ForslagFejl, beskrivInput, kaldClaude, haandter, tjekInput };
