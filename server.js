const express = require("express");
const path = require("path");
const generer = require("./api/generer");
const juster = require("./api/juster");
const produkt = require("./api/produkt");

const app = express();
const PORT = process.env.PORT || 3003;

app.use(express.json({ limit: "200kb" }));
app.post("/api/generer", generer);
app.post("/api/juster", juster);
app.post("/api/produkt", produkt);
app.use(express.static(path.join(__dirname, "public")));

app.listen(PORT, () => {
  console.log(`EPX Nexus kører på http://localhost:${PORT}`);
});
