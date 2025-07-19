// src/views/CampaignBrief.js
import React, { useContext, useState, useEffect } from "react";
import { ProposalContext } from "../context/ProposalContext";
import config from "../config";
import * as XLSX from "xlsx";

export default function CampaignBrief() {
  const { campaignBrief, setCampaignBrief } = useContext(ProposalContext);
  const [savedTemplates, setSavedTemplates] = useState([
    { name: "Overall Murals Proposal Grid (2025)", isVendorDefault: true },
    { name: "Talon Master Grid", isVendorDefault: false },
    { name: "OOH Standard Template", isVendorDefault: false },
  ]);
  const [selectedTemplate, setSelectedTemplate] = useState("Overall Murals Proposal Grid (2025)");
  const [loading, setLoading] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [masterVendorData, setMasterVendorData] = useState([]);
  const [manualMarket, setManualMarket] = useState("");
  const [manualSubmarket, setManualSubmarket] = useState("");
  const [manualFormats, setManualFormats] = useState([]);
  const [manualDates, setManualDates] = useState({ start: "", end: "" });
  const [inputMode, setInputMode] = useState("manual");

  const gridInUse = campaignBrief.gridFile ? campaignBrief.gridFile.name : selectedTemplate;

  const handleChange = (field, value) => {
    setCampaignBrief({ ...campaignBrief, [field]: value });
  };

  const handleFileChange = (e) => {
    setCampaignBrief({ ...campaignBrief, gridFile: e.target.files[0] });
  };

  const handleMasterVendorUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const parsedData = XLSX.utils.sheet_to_json(worksheet);
      setMasterVendorData(parsedData);
      localStorage.setItem("masterVendorData", JSON.stringify(parsedData));
      console.log("Parsed master vendor data:", parsedData);
    };

    reader.readAsArrayBuffer(file);
  };

  useEffect(() => {
    const stored = localStorage.getItem("masterVendorData");
    if (stored) {
      try {
        setMasterVendorData(JSON.parse(stored));
      } catch (err) {
        console.warn("Could not load saved vendor data:", err);
      }
    }
  }, []);

  const uniqueMarkets = [...new Set(masterVendorData.map(row => row.Market || row.market).filter(Boolean))];
  const uniqueFormats = [...new Set(masterVendorData.map(row => row.Format || row.format).filter(Boolean))];
  const submarketsForSelectedMarket = masterVendorData
    .filter(row => (row.Market || row.market) === manualMarket)
    .map(row => row.Submarket || row.submarket)
    .filter(Boolean);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Campaign Brief</h1>

      <div style={{ marginBottom: "1rem" }}>
        <label><strong>Choose Input Mode:</strong></label>
        <br />
        <label>
          <input
            type="radio"
            value="email"
            checked={inputMode === "email"}
            onChange={() => setInputMode("email")}
          /> Email
        </label>
        <label style={{ marginLeft: "2rem" }}>
          <input
            type="radio"
            value="manual"
            checked={inputMode === "manual"}
            onChange={() => setInputMode("manual")}
          /> Manual
        </label>
      </div>

      {inputMode === "email" && (
        <>
          <label>Proposal Brief</label>
          <br />
          <textarea
            rows={10}
            value={campaignBrief.clientEmail}
            onChange={(e) => handleChange("clientEmail", e.target.value)}
            style={{ width: "100%", border: "1px solid green" }}
            placeholder="Paste agency email here..."
          />

          <button onClick={() => alert("Extract AI temporarily disabled")}>Extract Brief Info</button>
        </>
      )}

      <br />
      <label>Upload Media Grid</label>
      <br />
      <input type="file" onChange={handleFileChange} />

      <div style={{ marginTop: "1rem" }}>
        <label>Or Select Saved Media Grid</label>
        <br />
        <select
          value={selectedTemplate}
          onChange={(e) => setSelectedTemplate(e.target.value)}
          style={{ width: "60%", padding: "0.5rem" }}
        >
          {savedTemplates
            .sort((a, b) => (b.isVendorDefault ? -1 : 1))
            .map((template) => (
              <option key={template.name} value={template.name}>
                {template.name} {template.isVendorDefault ? "(Vendor Default)" : ""}
              </option>
            ))}
        </select>
      </div>

      <p style={{ marginTop: "1rem" }}>
        <strong>Active Grid:</strong> {gridInUse}
      </p>

      <hr style={{ margin: "2rem 0" }} />

      <h2>Master Vendor File</h2>
      <p>Upload a full inventory sheet so the system can reference all available units by market, submarket, and format.</p>
      <input type="file" accept=".xlsx,.csv" onChange={handleMasterVendorUpload} />

      {inputMode === "manual" && (
        <>
          <hr style={{ margin: "2rem 0" }} />
          <h2>Manual Input (Optional)</h2>

          <label>Select Market</label>
          <br />
          <select
            value={manualMarket}
            onChange={(e) => setManualMarket(e.target.value)}
            style={{ width: "50%", marginBottom: "1rem" }}
          >
            <option value="">-- Select a Market --</option>
            {uniqueMarkets.map((market) => (
              <option key={market} value={market}>{market}</option>
            ))}
          </select>

          <br />
          <label>Select Submarket</label>
          <br />
          <select
            value={manualSubmarket}
            onChange={(e) => setManualSubmarket(e.target.value)}
            style={{ width: "50%", marginBottom: "1rem" }}
          >
            <option value="">-- Select a Submarket --</option>
            {submarketsForSelectedMarket.map((sub) => (
              <option key={sub} value={sub}>{sub}</option>
            ))}
          </select>

          <br />
          <label>Requested Formats</label>
          <br />
          <select
            multiple
            value={manualFormats}
            onChange={(e) => setManualFormats([...e.target.selectedOptions].map(o => o.value))}
            style={{ width: "60%", height: "5rem" }}
          >
            {uniqueFormats.map((format) => (
              <option key={format} value={format}>{format}</option>
            ))}
          </select>

          <br /><br />
          <label>Flight Start:</label>
          <input
            type="date"
            value={manualDates.start}
            onChange={(e) => setManualDates({ ...manualDates, start: e.target.value })}
            style={{ marginLeft: "0.5rem" }}
          />
          <br />
          <label>Flight End:</label>
          <input
            type="date"
            value={manualDates.end}
            onChange={(e) => setManualDates({ ...manualDates, end: e.target.value })}
            style={{ marginLeft: "0.5rem" }}
          />
        </>
      )}
    </div>
  );
}
