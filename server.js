const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const detectDrift = require("./driftEngine");

const app = express();
app.use(cors());
app.use(express.json());

// API route
app.post("/upload", (req, res) => {
  const baseline = JSON.parse(fs.readFileSync("baseline.json"));
  const current = JSON.parse(fs.readFileSync("current.json"));
  const drift = detectDrift(baseline, current);
  res.json({ drift });
});

// Serve React build
const buildPath = path.join(__dirname, "frontend", "build");
app.use(express.static(buildPath));

// Home route
app.get("/", (req, res) => {
  res.sendFile(path.join(buildPath, "index.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server running on port", PORT));