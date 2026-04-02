const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const { Pool } = require("pg");

const detectDrift = require("./driftEngine");

const app = express();

app.use(cors());
app.use(express.json());

/* ---------------- DATABASE CONNECTION ---------------- */

const pool = new Pool({
  user: "avnadmin",
  host: "drift-db-tt-project.f.aivencloud.com",
  database: "defaultdb",
  password: "AVNS_bM0jBFrNSZZ7vz6FOCg", // <-- Replace with your Aiven password
  port: 22696,
  ssl: {
    rejectUnauthorized: false
  }
});

/* ---------------- CREATE TABLE ---------------- */

pool.query(`
CREATE TABLE IF NOT EXISTS drift_history (
  id SERIAL PRIMARY KEY,
  changes JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
`);

/* ---------------- FILE UPLOAD ---------------- */

const upload = multer({ dest: "uploads/" });

/* ---------------- TEST ROUTE ---------------- */

app.get("/", (req, res) => {
  res.send("Configuration Drift Detection Server Running");
});

/* ---------------- DRIFT DETECTION ---------------- */

app.post(
  "/detect-drift",
  upload.fields([
    { name: "baseline", maxCount: 1 },
    { name: "current", maxCount: 1 }
  ]),
  async (req, res) => {

    try {

      const baselinePath = req.files["baseline"][0].path;
      const currentPath = req.files["current"][0].path;

      const baseline = JSON.parse(fs.readFileSync(baselinePath));
      const current = JSON.parse(fs.readFileSync(currentPath));

      const changes = detectDrift(baseline, current);

      /* SAVE TO DATABASE */

      await pool.query(
        "INSERT INTO drift_history (changes) VALUES ($1)",
        [JSON.stringify(changes)]
      );

      res.json({
        message: "Drift Analysis Complete",
        changes: changes
      });

    } catch (error) {

      console.error(error);

      res.status(500).json({
        error: "Error processing configuration files"
      });

    }
  }
);

/* ---------------- HISTORY API ---------------- */

app.get("/history", async (req, res) => {

  try {

    const result = await pool.query(
      "SELECT * FROM drift_history ORDER BY created_at DESC"
    );

    res.json(result.rows);

  } catch (error) {

    console.error(error);
    res.status(500).json({ error: "Database error" });

  }

});

/* ---------------- SERVER ---------------- */

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});