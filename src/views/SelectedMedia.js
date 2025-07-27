// src/views/SelectedMedia.js
import React, { useContext, useEffect, useState } from "react";
import { ProposalContext } from "../context/ProposalContext";

console.log("🔥 SelectedMedia.js is running");

export default function SelectedMedia() {
  const {
    masterVendorData,
    campaignBrief,
    selectedUnits,
    setSelectedUnits,
    unitEdits,
    setUnitEdits,
  } = useContext(ProposalContext);

  const [filteredUnits, setFilteredUnits] = useState([]);

  useEffect(() => {
    if (!masterVendorData || masterVendorData.length === 0) return;

    const normalize = (val) => (val || "").toString().trim().toLowerCase();
    const selectedMarkets = campaignBrief.manualMarkets.map(normalize);
    const selectedNeighborhoods = campaignBrief.manualNeighborhoods.map(normalize);
    const selectedFormats = campaignBrief.manualFormats.map(normalize);

    const filtered = masterVendorData.filter((row) => {
      const market = normalize(row.Market || row.market);
      const neighborhood = normalize(
        row.Neighborhood || row.Submarket || row.neighborhood || row.submarket
      );
      const format = normalize(row.Format || row.format);
      return (
        selectedMarkets.includes(market) &&
        selectedNeighborhoods.includes(neighborhood) &&
        selectedFormats.includes(format)
      );
    });

    setFilteredUnits(filtered);

    const savedSelections = localStorage.getItem("selectedUnits");
    if (savedSelections) {
      setSelectedUnits(JSON.parse(savedSelections));
    } else {
      const ids = filtered.map((row) => row["Unit ID"] || row.UnitID);
      setSelectedUnits(ids);
    }
  }, [campaignBrief, masterVendorData]);

  useEffect(() => {
    localStorage.setItem("selectedUnits", JSON.stringify(selectedUnits));
  }, [selectedUnits]);

  const toggleUnit = (id) => {
    const updated = selectedUnits.includes(id)
      ? selectedUnits.filter((uid) => uid !== id)
      : [...selectedUnits, id];
    setSelectedUnits(updated);
  };

  const toggleAll = () => {
    const allIds = filteredUnits.map((row) => row["Unit ID"]);
    const isAllSelected = allIds.every((id) => selectedUnits.includes(id));
    setSelectedUnits(isAllSelected ? [] : allIds);
  };

  const formatCurrency = (value) => {
    const num = parseFloat(value?.toString().replace(/[^0-9.]/g, ""));
    if (isNaN(num)) return "$0.00";
    return `$${num.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
  };

  const handleEdit = (unitId, field, value) => {
    setUnitEdits((prev) => ({
      ...prev,
      [unitId]: {
        ...prev[unitId],
        [field]: value,
      },
    }));
  };

  const resetProposal = () => {
    const confirmed = window.confirm("Are you sure you want to start a new proposal?");
    if (!confirmed) return;
    localStorage.removeItem("selectedUnits");
    setSelectedUnits([]);
    setUnitEdits({});
  };

  useEffect(() => {
    const button = document.createElement("button");
    button.innerText = "New Proposal";
    Object.assign(button.style, {
      position: "fixed",
      top: "20px",
      right: "20px",
      zIndex: 9999,
      padding: "0.6rem 1.2rem",
      backgroundColor: "#ff6600",
      color: "white",
      border: "none",
      borderRadius: "20px",
      fontWeight: "bold",
      cursor: "pointer",
      boxShadow: "0 2px 6px rgba(0,0,0,0.15)"
    });
    button.onclick = resetProposal;
    document.body.appendChild(button);
    return () => document.body.removeChild(button);
  }, []);

  return (
    <div style={{ padding: "2rem" }}>
      <h2 style={{ color: "#0a225f" }}>Selected Media</h2>
      <p>Showing units matching your campaign brief.</p>

      <div style={{ overflowX: "auto", maxHeight: "70vh", border: "4px solid #ccc", borderRadius: "8px" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
          <thead style={{ position: "sticky", top: 0, background: "#f8f8f8ff", zIndex: 2 }}>
            <tr>
              <th style={{ position: "sticky", left: 0, background: "#f8f8f8", zIndex: 3 }}>
                <input
                  type="checkbox"
                  checked={
                    filteredUnits.length > 0 &&
                    filteredUnits.every((row) => selectedUnits.includes(row["Unit ID"]))
                  }
                  onChange={toggleAll}
                />
              </th>
              <th style={{ position: "sticky", left: "2rem", background: "#f8f8f8", zIndex: 3 }}>Unit ID</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Rate Card</th>
              <th>Negotiated Media</th>
              <th>Install</th>
              <th>Production</th>
              <th>Rationale</th>
            </tr>
          </thead>
          <tbody>
            {filteredUnits.map((row) => {
              const id = row["Unit ID"];
              const edits = unitEdits[id] || {};
              const getVal = (key, fallback = 0) => edits[key] ?? row[key] ?? fallback;
              return (
                <tr key={id} style={{ borderBottom: "1px solid #ddd", height: "3.5rem" }}>
                  <td style={{ position: "sticky", left: 0, background: "white", zIndex: 1 }}>
                    <input
                      type="checkbox"
                      checked={selectedUnits.includes(id)}
                      onChange={() => toggleUnit(id)}
                    />
                  </td>
                  <td style={{ position: "sticky", left: "2rem", background: "white", zIndex: 1 }}>{id}</td>
                  <td>
                    <input
                      type="date"
                      value={edits.start ?? campaignBrief.manualDates?.start ?? ""}
                      onChange={(e) => handleEdit(id, "start", e.target.value)}
                      style={{ width: "90%", textAlign: "center" }}
                    />
                  </td>
                  <td>
                    <input
                      type="date"
                      value={edits.end ?? campaignBrief.manualDates?.end ?? ""}
                      onChange={(e) => handleEdit(id, "end", e.target.value)}
                      style={{ width: "90%", textAlign: "center" }}
                    />
                  </td>
                  {["Rate Card", "Negotiated Media", "Install", "Production"].map((field, idx) => (
                    <td key={idx}>
                      <input
                        type="text"
                        value={formatCurrency(getVal(field))}
                        onChange={(e) =>
                          handleEdit(id, field, e.target.value.replace(/[^\d.]/g, ""))
                        }
                        style={{ width: "80%", textAlign: "center" }}
                      />
                    </td>
                  ))}
                  <td>
                    <textarea
                      value={edits.Rationale ?? row["Rationale"] ?? ""}
                      onChange={(e) => handleEdit(id, "Rationale", e.target.value)}
                      style={{ width: "90%", resize: "vertical", minHeight: "1.8rem" }}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
