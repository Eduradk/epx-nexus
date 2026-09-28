// Server-funktion: modtager ALLE lærerens input og lader Claude skrive et komplet forløbsforslag.
// Kører som Vercel-funktion (/api/generer) og lokalt via server.js.
const { FORSLAG_SKEMA, beskrivInput, kaldClaude, haandter, tjekInput } = require("../lib/forslag");

module.exports = (req, res) =>
  haandter(req, res, async ({ input }) => {
    tjekInput(input);
    const forslag = await kaldClaude("Lav et forløbsforslag ud fra disse input:\n\n" + beskrivInput(input), FORSLAG_SKEMA);
    return { forslag };
  });
