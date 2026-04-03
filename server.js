const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const detectDrift = require("./driftEngine");

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ dest: "uploads/" });

app.post("/upload", upload.single("file"), (req, res) => {
  const baseline = JSON.parse(fs.readFileSync("baseline.json"));
  const current = JSON.parse(fs.readFileSync("current.json"));

  const drift = detectDrift(baseline, current);
  res.json({ drift });
});

// Serve React build
app.use(express.static(path.join(__dirname, "frontend", "build")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "build", "index.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server running on port", PORT));