const { Pool } = require("pg");

const pool = new Pool({
  user: "avnadmin",
  host: "drift-db-tt-project.f.aivencloud.com",
  database: "defaultdb",
  password: "AVNS_bM0jBFrNSZZ7vz6FOCg",
  port: 22696,
  ssl: {
    rejectUnauthorized: false
  }
});

module.exports = pool;