const express = require("express");

const app = express();
const PORT = 3000;
let gameState = {
  inventory: [],
  activeItem: null,
  world: {},
};

const hints = {
  raum1: [
    "Diagnostiziere alle drei Terminals.",
    "Alle drei Systeme müssen OK melden.",
  ],
  raum2: [
    "Nicht jedes Kabel führt Strom.",
    "Achte auf die richtige Energieleitung.",
  ],
  raum3: [
    "Die beschädigte Datei benötigt alle Fragmente.",
    "Manche Gegenstände sind schwer sichtbar.",
  ],
  raum4: [
    "Ohne Stromleiter-Kabel kann die CPU nicht stabilisiert werden.",
    "Nach dem Anschließen kann ein Energiechip entnommen werden.",
  ],
  raum5: ["Rechner denken in 0 und 1.", "1010 ist eine Binärzahl."],
  raum6: [
    "Der Ausgang benötigt Speicher-Stick und Energiechip.",
    "Aktiviere beide Komponenten, bevor du den Ausgang bestätigst.",
  ],
};

app.use(express.json());
app.use(express.static(__dirname));

app.get("/api/hello", (req, res) => {
  res.send("Hello from node");
});

app.get("/api/hints/:room", (req, res) => {
  res.status(200).json({
    hints: hints[req.params.room] ?? [],
  });
});

app.get("/api/state", (req, res) => {
  res.status(200).json(gameState);
});

app.post("/api/state", (req, res) => {
  gameState = req.body;

  res.status(200).json({
    success: true,
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
