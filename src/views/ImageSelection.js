// src/views/Images.js
import React, { useContext, useState } from "react";
import { ProposalContext } from "../context/ProposalContext";

// Placeholder PDF URLs per unit (mock data for now)
const mockPdfData = {
  "M-58": [
    {
      name: "M-58_Canal_St_Lafayette_St.pdf",
      url: "https://example.com/pdfs/M-58_Canal_St_Lafayette_St.pdf",
      selected: true,
      isMaster: true
    },
    {
      name: "M-58_Valentino-1.pdf",
      url: "https://example.com/pdfs/M-58_Valentino-1.pdf",
      selected: true,
      isMaster: false
    },
    {
      name: "M-58_ExtraView.pdf",
      url: "https://example.com/pdfs/M-58_ExtraView.pdf",
      selected: false,
      isMaster: false
    }
  ]
};

export default function Images() {
  const { selectedUnits } = useContext(ProposalContext);
  const [pdfSelections, setPdfSelections] = useState(mockPdfData);

  const togglePdf = (unitId, index) => {
    const updated = [...pdfSelections[unitId]];
    const selectedCount = updated.filter((f) => f.selected).length;
    const current = updated[index];
    if (current.selected || selectedCount < 10) {
      updated[index].selected = !current.selected;
      setPdfSelections({ ...pdfSelections, [unitId]: updated });
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2 style={{ color: "#0a225f" }}>Images (PDF Selection)</h2>
      <p>Only showing units selected in your proposal.</p>

      {selectedUnits.map((unitId) => {
        const pdfs = pdfSelections[unitId] || [];
        return (
          <div key={unitId} style={{ marginBottom: "2rem" }}>
            <h3 style={{ color: "#0a225f", marginBottom: "0.5rem" }}>{unitId}</h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "1rem"
              }}
            >
              {pdfs.map((file, index) => (
                <div
                  key={index}
                  onClick={() => togglePdf(unitId, index)}
                  style={{
                    cursor: "pointer",
                    border: file.selected ? "3px solid #0077cc" : "1px solid #ccc",
                    padding: "1rem",
                    borderRadius: "8px",
                    background: file.isMaster ? "#f1f9ff" : "#fff"
                  }}
                >
                  <p style={{ fontWeight: file.isMaster ? "bold" : "normal" }}>{file.name}</p>
                  <a href={file.url} target="_blank" rel="noreferrer">
                    🔍 View
                  </a>
                  <p style={{ marginTop: "0.5rem", fontSize: "0.85rem", color: "gray" }}>
                    {file.selected ? "✔ Included in Export" : "Click to Include"}
                  </p>
                </div>
              ))}
            </div>
            <p style={{ marginTop: "0.5rem", fontSize: "0.85rem", color: "#666" }}>
              {pdfs.filter((f) => f.selected).length}/10 selected
            </p>
          </div>
        );
      })}
    </div>
  );
}
