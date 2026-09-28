// Server-funktion: læreren har ændret ét afsnit (med AI-instruktion eller manuelt).
// Claude udfører ændringen og tilpasser ALLE øvrige afsnit, så forløbet hænger sammen.
const { FORSLAG_SKEMA, SEKTION_NAVNE, ForslagFejl, beskrivInput, kaldClaude, haandter, tjekInput } = require("../lib/forslag");

// Samme skema som et nyt forslag + en kort liste over, hvad der er ændret, så læreren kan se det
const JUSTER_SKEMA = Object.assign({}, FORSLAG_SKEMA, {
  properties: Object.assign({}, FORSLAG_SKEMA.properties, {
    aendringer: { type: "array", items: { type: "string" } }
  }),
  required: FORSLAG_SKEMA.required.concat(["aendringer"])
});

module.exports = (req, res) =>
  haandter(req, res, async ({ input, forslag, sektion, instruktion, manuelKrop }) => {
    tjekInput(input);
    const navn = SEKTION_NAVNE[sektion];
    if (!navn || !forslag || typeof forslag !== "object" || JSON.stringify(forslag).length > 80000) {
      throw new ForslagFejl(400, "Ugyldigt forslag eller afsnit.");
    }

    let aendring;
    if (Array.isArray(manuelKrop)) {
      aendring =
        'Læreren har selv omskrevet brødteksten (krop) i afsnittet "' + navn + '" til følgende afsnit:\n' +
        manuelKrop.map((a, i) => i + 1 + ". " + a).join("\n") +
        "\n\nBrug lærerens tekst ordret som krop i det afsnit. Tilpas afsnittets resume og alle øvrige afsnit, så de passer til lærerens tekst.";
    } else if (typeof instruktion === "string" && instruktion.trim()) {
      aendring =
        'Læreren beder om denne justering af afsnittet "' + navn + '":\n"' + instruktion.trim().slice(0, 2000) + '"' +
        "\n\nUdfør justeringen i det afsnit. Tilpas derefter alle øvrige afsnit, så de passer til ændringen.";
    } else {
      throw new ForslagFejl(400, "Beskriv, hvad der skal justeres.");
    }

    const besked =
      "Lærerens input:\n\n" + beskrivInput(input) +
      "\n\nDet nuværende forløbsforslag (JSON):\n" + JSON.stringify(forslag) +
      "\n\nÆndring:\n" + aendring +
      "\n\nHele forslaget skal hænge sammen efter ændringen: Projekt, aktiviteter, øvelser/cases/opgaver, udstyrslisten, læringsmål, evaluering, titel og undertitel skal passe til hinanden." +
      " Bevar ordret alt, der ikke påvirkes af ændringen – ændr kun det, der er nødvendigt for sammenhængen." +
      " I aendringer skriver du 1-6 korte punkter på dansk om, hvad du har ændret og i hvilke afsnit.";

    const nyt = await kaldClaude(besked, JUSTER_SKEMA);
    const aendringer = nyt.aendringer;
    delete nyt.aendringer;
    // Lærerens egen tekst bevares under alle omstændigheder præcis som skrevet
    if (Array.isArray(manuelKrop) && nyt.sektioner[sektion]) {
      nyt.sektioner[sektion].krop = manuelKrop;
    }
    return { forslag: nyt, aendringer };
  });
