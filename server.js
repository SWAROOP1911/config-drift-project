const express = require("express");
const cors = require("cors");
const fs = require("fs");

const detectDrift = require("./driftEngine");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/upload", (req, res) => {
  const baseline = JSON.parse(fs.readFileSync("baseline.json"));
  const current = JSON.parse(fs.readFileSync("current.json"));
  const drift = detectDrift(baseline, current);
  res.json({ drift });
});

app.use(express.static("frontend/build"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/frontend/build/index.html");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server running on port", PORT));