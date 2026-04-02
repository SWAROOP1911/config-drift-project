function detectDrift(baseline, current) {

  const changes = [];

  Object.keys(baseline).forEach(key => {

    if (baseline[key] !== current[key]) {

      let risk = "LOW";

      if (key === "firewall") risk = "HIGH";
      else if (key === "port") risk = "MEDIUM";

      changes.push({
        setting: key,
        oldValue: String(baseline[key]),
        newValue: String(current[key]),
        risk: risk
      });

    }

  });

  return changes;
}

module.exports = detectDrift;