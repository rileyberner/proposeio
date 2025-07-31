// src/views/ImageSelection.js
import React, { useContext, useState, useEffect } from "react";
import { ProposalContext } from "../context/ProposalContext";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  listAll
} from "firebase/storage";
import { storage } from "../firebase";

export default function ImageSelection() {
  const { selectedUnits } = useContext(ProposalContext);
  const [pdfUploads, setPdfUploads] = useState(() => {
    const stored = localStorage.getItem("pdfUploads");
    return stored ? JSON.parse(stored) : {};
  });

  const [selectedPdfs, setSelectedPdfs] = useState(() => {
    const stored = localStorage.getItem("selectedPdfs");
    return stored ? JSON.parse(stored) : {};
  });

  useEffect(() => {
    localStorage.setItem("pdfUploads", JSON.stringify(pdfUploads));
  }, [pdfUploads]);

  useEffect(() => {
    localStorage.setItem("selectedPdfs", JSON.stringify(selectedPdfs));
  }, [selectedPdfs]);

  useEffect(() => {
    const fetchUploads = async () => {
      const uploads = {};
      for (const unitId of selectedUnits) {
        const folderRef = ref(storage, `unit_files/${unitId}`);
        try {
          const list = await listAll(folderRef);
          const files = await Promise.all(
            list.items.map(async (itemRef) => {
              const url = await getDownloadURL(itemRef);
              return { name: itemRef.name, url };
            })
          );
          uploads[unitId] = files;
        } catch (err) {
          console.warn(`No files for ${unitId}`, err);
        }
      }
      setPdfUploads(uploads);
    };
    fetchUploads();
  }, [selectedUnits]);

  const handleFileUpload = async (unitId, files) => {
    const newFiles = Array.from(files);
    const uploads = [];

    for (let file of newFiles) {
      if (file.type !== "application/pdf") continue;
      try {
        const storageRef = ref(storage, `unit_files/${unitId}/${file.name}`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        uploads.push({ name: file.name, url });
      } catch (err) {
        console.error("Upload error for", file.name, err);
      }
    }

    try {
      const folderRef = ref(storage, `unit_files/${unitId}`);
      const list = await listAll(folderRef);
      const filesWithUrl = await Promise.all(
        list.items.map(async (itemRef) => {
          const url = await getDownloadURL(itemRef);
          return { name: itemRef.name, url };
        })
      );
      setPdfUploads((prev) => ({
        ...prev,
        [unitId]: filesWithUrl,
      }));
    } catch (err) {
      console.error("Error refreshing uploaded file list:", err);
    }
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

          <label style={{ display: "block", fontWeight: "bold", marginBottom: "0.5rem" }}>
            Upload PDF Deck(s)
          </label>

          <input
            type="file"
            accept="application/pdf"
            multiple
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
                <a
                  href={fileObj.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: "0.85rem", color: "#0077cc", textDecoration: "none" }}
                >
                  View PDF
                </a>
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
