const express = require("express");
const path = require("path");
const generer = require("./api/generer");

const app = express();
const PORT = process.env.PORT || 3003;

app.use(express.json({ limit: "100kb" }));
app.post("/api/generer", generer);
app.use(express.static(path.join(__dirname, "public")));

app.listen(PORT, () => {
  console.log(`EPX Nexus kører på http://localhost:${PORT}`);
});
