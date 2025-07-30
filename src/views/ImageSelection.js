// src/views/ImageSelection.js
import React, { useContext, useState, useEffect } from "react";
import { ProposalContext } from "../context/ProposalContext";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "../firebase";

export default function ImageSelection() {
  const { selectedUnits } = useContext(ProposalContext);
  const [pdfUploads, setPdfUploads] = useState({});
  const [selectedPdfs, setSelectedPdfs] = useState({});

  // Load from localStorage on mount
  useEffect(() => {
    const storedUploads = localStorage.getItem("pdfUploads");
    const storedSelections = localStorage.getItem("selectedPdfs");
    if (storedUploads) setPdfUploads(JSON.parse(storedUploads));
    if (storedSelections) setSelectedPdfs(JSON.parse(storedSelections));
  }, []);

  // Persist changes
  useEffect(() => {
    localStorage.setItem("pdfUploads", JSON.stringify(pdfUploads));
  }, [pdfUploads]);

  useEffect(() => {
    localStorage.setItem("selectedPdfs", JSON.stringify(selectedPdfs));
  }, [selectedPdfs]);

  const handleFileUpload = async (unitId, files) => {
    const newFiles = Array.from(files);
    const uploadedFiles = [];

    for (let file of newFiles) {
      try {
        const storageRef = ref(storage, `unit_files/${unitId}/${file.name}`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        uploadedFiles.push({ name: file.name, url });
        console.log("✅ Uploaded:", file.name, "→", url);
      } catch (err) {
        console.error("❌ Upload error for", file.name, err);
      }
    }

    if (uploadedFiles.length > 0) {
      setPdfUploads((prev) => {
        const combined = [...(prev[unitId] || []), ...uploadedFiles];
        const unique = Array.from(new Map(combined.map(f => [f.name, f])).values());
        const updated = { ...prev, [unitId]: unique };
        console.log("📦 Updated pdfUploads:", updated);
        return updated;
      });
    }

    const input = document.querySelector(`input[data-unit="${unitId}"]`);
    if (input) input.value = "";
  };

  const togglePdfSelection = (unitId, fileName) => {
    setSelectedPdfs((prev) => {
      const current = prev[unitId] || [];
      const isSelected = current.includes(fileName);
      const updated = isSelected
        ? current.filter((f) => f !== fileName)
        : [...current, fileName].slice(0, 10);
      return { ...prev, [unitId]: updated };
    });
  };

  const handleDelete = async (unitId, fileObj) => {
    try {
      const path = `unit_files/${unitId}/${fileObj.name}`;
      const fileRef = ref(storage, path);
      await deleteObject(fileRef);

      setPdfUploads((prev) => {
        const updated = (prev[unitId] || []).filter((f) => f.name !== fileObj.name);
        return { ...prev, [unitId]: updated };
      });

      setSelectedPdfs((prev) => {
        const updated = (prev[unitId] || []).filter((f) => f !== fileObj.name);
        return { ...prev, [unitId]: updated };
      });
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2 style={{ color: "#0a225f", marginBottom: "1.5rem" }}>Select PDFs for Export</h2>
      {selectedUnits.map((unitId) => (
        <div
          key={unitId}
          style={{
            marginBottom: "2.5rem",
            borderBottom: "1px solid #ddd",
            paddingBottom: "1.5rem",
          }}
        >
          <h3 style={{ color: "#0a225f", marginBottom: "0.5rem" }}>{unitId}</h3>

          <p style={{ fontSize: "0.8rem", color: "gray" }}>
            Debug: {JSON.stringify(pdfUploads[unitId])}
          </p>

          <input
            type="file"
            accept="application/pdf"
            multiple
            data-unit={unitId}
            onChange={(e) => handleFileUpload(unitId, e.target.files)}
            style={{ marginBottom: "1rem" }}
          />

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: "1rem",
              marginTop: "0.5rem",
            }}
          >
            {(pdfUploads[unitId] || []).map((fileObj, index) => (
              <div
                key={fileObj.name + index}
                style={{
                  border: selectedPdfs[unitId]?.includes(fileObj.name)
                    ? "2px solid #0a225f"
                    : "1px solid #ccc",
                  padding: "1rem",
                  borderRadius: "8px",
                  cursor: "pointer",
                  backgroundColor: "#fafafa",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
                  position: "relative",
                }}
                onClick={() => togglePdfSelection(unitId, fileObj.name)}
              >
                <p style={{ margin: 0, fontWeight: "bold", fontSize: "0.95rem" }}>{fileObj.name}</p>
                <iframe
                  src={fileObj.url + "#toolbar=0&view=FitH"}
                  style={{ width: "100%", height: "180px", marginTop: "0.5rem", border: "none" }}
                  title={`Preview-${fileObj.name}`}
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(unitId, fileObj);
                  }}
                  style={{
                    position: "absolute",
                    top: "6px",
                    right: "8px",
                    border: "none",
                    background: "transparent",
                    fontWeight: "bold",
                    color: "#888",
                    cursor: "pointer",
                    fontSize: "1rem",
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <p style={{ marginTop: "0.5rem", fontSize: "0.9rem" }}>
            {selectedPdfs[unitId]?.length || 0} selected (max 10)
          </p>
        </div>
      ))}
    </div>
  );
}
