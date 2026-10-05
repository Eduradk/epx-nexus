// Server-funktion: modtager ALLE lærerens input og lader Claude skrive et komplet forløbsforslag.
// Kører som Vercel-funktion (/api/generer) og lokalt via server.js.
//
// Svaret streames som linjer af JSON, så siden kan vise forslaget, mens det bliver skrevet:
//   {"d":"..."}        en ny stump af forslaget (rå JSON-tekst)
//   {"forslag":{...}}  det færdige forslag (sidste linje)
//   {"fejl":"..."}     noget gik galt (sidste linje)
const { FORSLAG_SKEMA, ForslagFejl, beskrivInput, kaldClaude, tjekInput } = require("../lib/forslag");

module.exports = async function generer(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ fejl: "Kun POST er tilladt." });
    return;
  }
  const input = req.body && req.body.input;
  try {
    tjekInput(input);
  } catch (err) {
    res.status(err.status || 400).json({ fejl: err.message });
    return;
  }

  res.writeHead(200, {
    "Content-Type": "application/x-ndjson; charset=utf-8",
    "Cache-Control": "no-cache, no-transform",
    "X-Accel-Buffering": "no"
  });
  const linje = (obj) => res.write(JSON.stringify(obj) + "\n");

  try {
    const forslag = await kaldClaude(
      "Lav et forløbsforslag ud fra disse input:\n\n" + beskrivInput(input),
      FORSLAG_SKEMA,
      { effort: "low", vedTekst: (d) => linje({ d: d }) }
    );
    linje({ forslag: forslag });
  } catch (err) {
    if (!(err instanceof ForslagFejl)) console.error("Uventet fejl:", err);
    linje({ fejl: err instanceof ForslagFejl ? err.message : "Der opstod en uventet fejl. Prøv igen." });
  }
  res.end();
};
