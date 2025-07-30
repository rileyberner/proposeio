// src/views/CampaignBrief.js
import React, { useContext, useState, useEffect } from "react";
import { ProposalContext } from "../context/ProposalContext";
import config from "../config";
import * as XLSX from "xlsx";
import { storage } from "../firebase";

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
  const { masterVendorData, setMasterVendorData } = useContext(ProposalContext);
  const [lastUploadedInfo, setLastUploadedInfo] = useState(null);
  const [manualMarkets, setManualMarkets] = useState(campaignBrief.manualMarkets || []);
  const [manualNeighborhoods, setManualNeighborhoods] = useState(campaignBrief.manualNeighborhoods || []);
  const [manualFormats, setManualFormats] = useState(campaignBrief.manualFormats || []);
  const [manualDates, setManualDates] = useState(campaignBrief.manualDates || { start: "", end: "" });

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
      const rawRows = XLSX.utils.sheet_to_json(worksheet, { raw: true, defval: "" });
      const cleanedData = rawRows.map((row) => {
        const cleanedRow = {};
        Object.entries(row).forEach(([key, val]) => {
          cleanedRow[key.trim()] = val;
        });
        return cleanedRow;
      });
      setMasterVendorData(cleanedData);
      localStorage.setItem("masterVendorData", JSON.stringify(cleanedData));
      alert("✅ Master Vendor Grid uploaded and saved.");
    };
    reader.readAsArrayBuffer(file);
  };

  useEffect(() => {
    const stored = localStorage.getItem("masterVendorData");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setMasterVendorData(parsed);
      } catch (err) {
        console.warn("Could not load saved vendor data:", err);
      }
    }
  }, []);

  useEffect(() => {
    setCampaignBrief({
      ...campaignBrief,
      manualMarkets,
      manualNeighborhoods,
      manualFormats,
      manualDates,
    });
  }, [manualMarkets, manualNeighborhoods, manualFormats, manualDates]);

  const uniqueMarkets = [...new Set(masterVendorData.map(row => row.Market || row.market).filter(Boolean))];
  const uniqueFormats = [...new Set(masterVendorData.map(row => row.Format || row.format).filter(Boolean))];
  const allNeighborhoods = masterVendorData
    .filter(row => manualMarkets.includes(row.Market || row.market))
    .map(row => row.Neighborhood || row.Submarket || row.neighborhood || row.submarket)
    .filter(Boolean);
  const uniqueNeighborhoods = [...new Set(allNeighborhoods.filter((v, i, a) => a.indexOf(v) === i))];

  const toggleSelection = (value, currentList, setter, isMarket = false) => {
    let updatedList;
    if (currentList.includes(value)) {
      updatedList = currentList.filter((item) => item !== value);
      setter(updatedList);
      if (isMarket) {
        const allNeighborhoods = masterVendorData
          .filter(row => updatedList.includes(row.Market || row.market))
          .map(row => row.Neighborhood || row.Submarket || row.neighborhood || row.submarket)
          .filter(Boolean);
        setManualNeighborhoods([...new Set(allNeighborhoods)]);
      }
    } else {
      updatedList = [...currentList, value];
      setter(updatedList);
      if (isMarket) {
        const newNeighborhoods = masterVendorData
          .filter(row => (row.Market || row.market) === value)
          .map(row => row.Neighborhood || row.Submarket || row.neighborhood || row.submarket)
          .filter(Boolean);
        setManualNeighborhoods(prev => [...new Set([...prev, ...newNeighborhoods])]);
      }
    }
  };

  const listItemStyle = (selected) => ({
    padding: "0.5rem 0.75rem",
    border: "1px solid #ccc",
    margin: "0.25rem",
    borderRadius: "6px",
    background: selected ? "#0077cc" : "#fff",
    color: selected ? "#fff" : "#000",
    cursor: "pointer",
    fontWeight: selected ? "bold" : "normal",
    display: "inline-block",
    minWidth: "120px",
    textAlign: "center"
  });

  const labelStyle = {
    color: "#ff6600",
    fontWeight: "bold",
    fontSize: "1.1rem",
    margin: "1rem 0 0.5rem 0",
    display: "block",
  };

  return (
    <div style={{ padding: "2rem", paddingBottom: "4rem" }}>
      <h1 style={{ color: "#0a225f" }}>Campaign Brief</h1>

      <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap", alignItems: "flex-start", marginBottom: "1.5rem" }}>
        <div style={{ flex: 1 }}>
          <label>Upload Media Grid</label>
          <br />
          <input type="file" onChange={handleFileChange} />
        </div>

        <div style={{ flex: 1 }}>
          <label>Master Vendor File</label>
          <br />
          <input type="file" accept=".xlsx,.csv" onChange={handleMasterVendorUpload} />
        </div>
      </div>

      <div style={{ marginTop: "1rem" }}>
        <label>Or Select Saved Media Grid</label>
        <br />
        <select
          value={selectedTemplate}
          onChange={(e) => setSelectedTemplate(e.target.value)}
          style={{ width: "30%", padding: "0.5rem" }}
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

      <h2 style={{ color: "#0a225f" }}>Manual Input</h2>

      <div style={{ display: "flex", gap: "2rem" }}>
        <div style={{ width: "50%" }}>
          <label style={labelStyle}>Select Market(s)</label>
          <div>
            {uniqueMarkets.map((market) => (
              <div
                key={market}
                style={listItemStyle(manualMarkets.includes(market))}
                onClick={() => toggleSelection(market, manualMarkets, setManualMarkets, true)}
              >
                {market}
              </div>
            ))}
          </div>
        </div>

        <div style={{ width: "50%" }}>
          <label style={labelStyle}>Select Neighborhood</label>
          <div>
            {uniqueNeighborhoods.map((sub) => (
              <div
                key={sub}
                style={listItemStyle(manualNeighborhoods.includes(sub))}
                onClick={() => toggleSelection(sub, manualNeighborhoods, setManualNeighborhoods)}
              >
                {sub}
              </div>
            ))}
          </div>
        </div>
      </div>

      <label style={labelStyle}>Formats</label>
      <div style={{ width: "100%", marginBottom: "1rem" }}>
        {uniqueFormats.map((format) => (
          <div
            key={format}
            style={listItemStyle(manualFormats.includes(format))}
            onClick={() => toggleSelection(format, manualFormats, setManualFormats)}
          >
            {format}
          </div>
        ))}
      </div>

      <label style={{ fontWeight: "bold" }}>Flight Start:</label>
      <input
        type="date"
        value={manualDates.start}
        onChange={(e) => setManualDates({ ...manualDates, start: e.target.value })}
        style={{ marginLeft: "0.5rem", marginBottom: "1rem" }}
      />
      <br />
      <label style={{ fontWeight: "bold" }}>Flight End:</label>
      <input
        type="date"
        value={manualDates.end}
        onChange={(e) => setManualDates({ ...manualDates, end: e.target.value })}
        style={{ marginLeft: "0.5rem" }}
      />
    </div>
  );
}
