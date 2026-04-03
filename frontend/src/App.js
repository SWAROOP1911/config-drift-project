import React, { useState } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

// IMPORTANT: Your Render backend URL
const API_URL = "https://config-drift-project.onrender.com";

function App() {
  const [baselineFile, setBaselineFile] = useState(null);
  const [currentFile, setCurrentFile] = useState(null);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);

  const compareConfigs = async () => {
    if (!baselineFile || !currentFile) {
      alert("Please upload both configuration files");
      return;
    }

    const formData = new FormData();
    formData.append("baseline", baselineFile);
    formData.append("current", currentFile);

    const response = await fetch(`${API_URL}/detect-drift`, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    setResult(data);
  };

  const getHistory = async () => {
    const response = await fetch(`${API_URL}/history`);
    const data = await response.json();
    setHistory(data);
  };

  let chartData = null;

  if (result) {
    const high = result.changes.filter((c) => c.risk === "HIGH").length;
    const medium = result.changes.filter((c) => c.risk === "MEDIUM").length;
    const low = result.changes.filter((c) => c.risk === "LOW").length;

    chartData = {
      labels: ["High Risk", "Medium Risk", "Low Risk"],
      datasets: [
        {
          data: [high, medium, low],
          backgroundColor: ["red", "orange", "green"],
        },
      ],
    };
  }

  return (
    <div style={{ textAlign: "center", marginTop: "80px" }}>
      <h1>Configuration Drift Detection</h1>

      <h3>Select Baseline Config</h3>
      <input type="file" onChange={(e) => setBaselineFile(e.target.files[0])} />

      <h3>Select Current Config</h3>
      <input type="file" onChange={(e) => setCurrentFile(e.target.files[0])} />

      <br />
      <br />

      <button onClick={compareConfigs}>Compare Configurations</button>

      <button onClick={getHistory} style={{ marginLeft: "10px" }}>
        Show Drift History
      </button>

      {result && (
        <div style={{ marginTop: "40px" }}>
          <h2>Drift Results</h2>

          <p>
            <b>Total Changes:</b> {result.changes.length}
          </p>

          <p style={{ color: "red" }}>
            High Risk:{" "}
            {result.changes.filter((c) => c.risk === "HIGH").length}
          </p>

          <p style={{ color: "orange" }}>
            Medium Risk:{" "}
            {result.changes.filter((c) => c.risk === "MEDIUM").length}
          </p>

          <p style={{ color: "green" }}>
            Low Risk:{" "}
            {result.changes.filter((c) => c.risk === "LOW").length}
          </p>

          {chartData && (
            <div style={{ width: "300px", margin: "20px auto" }}>
              <Pie data={chartData} />
            </div>
          )}

          <hr style={{ width: "400px" }} />

          {result.changes.map((change, index) => {
            let color = "green";
            if (change.risk === "HIGH") color = "red";
            else if (change.risk === "MEDIUM") color = "orange";

            return (
              <p key={index}>
                <b>{change.setting}</b> changed from{" "}
                {String(change.oldValue)} to {String(change.newValue)} (
                <span style={{ color: color }}>Risk: {change.risk}</span>)
              </p>
            );
          })}
        </div>
      )}

      {history.length > 0 && (
        <div style={{ marginTop: "40px" }}>
          <h2>Drift History</h2>

          {history.map((record, index) => (
            <div key={index} style={{ marginBottom: "10px" }}>
              <b>Date:</b> {new Date(record.createdAt).toLocaleString()}
              <br />
              <b>Changes Detected:</b> {record.changes.length}
              <hr style={{ width: "300px" }} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;