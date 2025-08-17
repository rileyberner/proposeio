// src/views/ImageSelection.js
import React, { useContext, useEffect, useState } from "react";
import { ProposalContext } from "../context/ProposalContext";
import { supabase } from "../supabaseClient";

// make a storage-safe unique name
const stamped = (name) => `${Date.now()}_${name.replace(/\s+/g, "_")}`;

async function listUnitPdfs(unitId) {
  const { data, error } = await supabase
    .storage
    .from("unit-files")
    .list(unitId, { limit: 100, sortBy: { column: "name", order: "asc" } });

  if (error) {
    console.warn(`[${unitId}] list error`, error);
    return [];
  }

  // build public URLs
  return data
    .filter((f) => f?.name?.toLowerCase().endsWith(".pdf"))
    .map((f) => {
      const { data: urlData } = supabase
        .storage
        .from("unit-files")
        .getPublicUrl(`${unitId}/${f.name}`);
      return { name: f.name, url: urlData.publicUrl };
    });
}

export default function ImageSelection() {
  const { selectedUnits } = useContext(ProposalContext);

  // unitId -> [{name, url, pending?}]
  const [pdfUploads, setPdfUploads] = useState({});
  // unitId -> [name]
  const [selectedPdfs, setSelectedPdfs] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("selectedPdfs")) || {};
    } catch {
      return {};
    }
  });
  const [errors, setErrors] = useState({});

  // persist selections
  useEffect(() => {
    localStorage.setItem("selectedPdfs", JSON.stringify(selectedPdfs));
  }, [selectedPdfs]);

  // initial load / when units change
  useEffect(() => {
    (async () => {
      const loaded = {};
      for (const unitId of selectedUnits) {
        loaded[unitId] = await listUnitPdfs(unitId);
      }
      setPdfUploads(loaded);
    })();
  }, [selectedUnits]);

  // refresh a single unit from bucket
  const refresh = async (unitId) => {
    const list = await listUnitPdfs(unitId);
    setPdfUploads((prev) => ({ ...prev, [unitId]: list }));
  };

  const handleFileUpload = async (unitId, fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;

    // optimistic "pending" tiles
    const pendings = files.map((f) => ({ name: stamped(f.name), url: "", pending: true }));
    setPdfUploads((prev) => ({ ...prev, [unitId]: [...(prev[unitId] || []), ...pendings] }));
    setErrors((e) => ({ ...e, [unitId]: "" }));

    // upload sequentially (simple & reliable)
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type !== "application/pdf") continue;

      const placeholder = pendings[i];
      const path = `${unitId}/${placeholder.name}`;

      const { error } = await supabase
        .storage
        .from("unit-files")
        .upload(path, file, { upsert: true, contentType: "application/pdf" });

      if (error) {
        console.error(`[${unitId}] upload failed`, error);
        setErrors((e) => ({ ...e, [unitId]: `Upload failed: ${error.message}` }));
        // remove failed pending tile
        setPdfUploads((prev) => {
          const list = (prev[unitId] || []).filter((x) => x.name !== placeholder.name);
          return { ...prev, [unitId]: list };
        });
        continue;
      }

      // swap pending → real (with public URL)
      const { data: urlData } = supabase
        .storage
        .from("unit-files")
        .getPublicUrl(path);

      setPdfUploads((prev) => {
        const list = [...(prev[unitId] || [])];
        const idx = list.findIndex((x) => x.name === placeholder.name);
        if (idx >= 0) list[idx] = { name: placeholder.name, url: urlData.publicUrl, pending: false };
        return { ...prev, [unitId]: list };
      });
    }

    // final reconcile with bucket
    await refresh(unitId);
  };

  const toggleSelect = (unitId, name) => {
    setSelectedPdfs((prev) => {
      const cur = prev[unitId] || [];
      const next = cur.includes(name)
        ? cur.filter((n) => n !== name)
        : [...cur, name].slice(0, 10);
      return { ...prev, [unitId]: next };
    });
  };

  const removeFile = async (unitId, file) => {
    const path = `${unitId}/${file.name}`;
    const { error } = await supabase.storage.from("unit-files").remove([path]);
    if (error) {
      setErrors((e) => ({ ...e, [unitId]: `Delete failed: ${error.message}` }));
      return;
    }
    setPdfUploads((prev) => {
      const list = (prev[unitId] || []).filter((f) => f.name !== file.name);
      return { ...prev, [unitId]: list };
    });
    setSelectedPdfs((prev) => {
      const list = (prev[unitId] || []).filter((n) => n !== file.name);
      return { ...prev, [unitId]: list };
    });
  };

  const bucket = process.env.REACT_APP_SUPABASE_URL || "(Supabase)";

  return (
    <div style={{ padding: "2rem" }}>
      <h2 style={{ color: "#0a225f", marginBottom: "1.25rem" }}>Select PDFs for Export</h2>
      <div style={{ fontSize: 12, color: "#666", marginBottom: 6 }}>
        Bucket: <code>{bucket}/storage/v1/object/public/unit-files</code>
      </div>

      {selectedUnits.map((unitId) => {
        const files = pdfUploads[unitId] || [];
        const chosen = selectedPdfs[unitId] || [];

        return (
          <div key={unitId} style={{ marginBottom: "2rem", borderBottom: "1px solid #eee", paddingBottom: "1rem" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
              <h3 style={{ color: "#0a225f", marginBottom: 6 }}>{unitId}</h3>
              <button
                type="button"
                onClick={() => refresh(unitId)}
                style={{ fontSize: 12, padding: "2px 8px", borderRadius: 6, border: "1px solid #ccc", background: "#fff" }}
              >
                Refresh from bucket
              </button>
            </div>

            <label style={{ display: "block", fontWeight: 700, marginBottom: 6 }}>
              Upload PDF Deck(s)
            </label>
            <input
              type="file"
              accept=".pdf,application/pdf"
              multiple
              onChange={(e) => {
                const fl = e.target.files;
                handleFileUpload(unitId, fl).finally(() => (e.target.value = ""));
              }}
              style={{ marginBottom: 8 }}
            />

            {!!errors[unitId] && (
              <div style={{ color: "#c00", fontSize: 13, marginBottom: 6 }}>{errors[unitId]}</div>
            )}

            {files.length === 0 ? (
              <div style={{ color: "#777", fontSize: 14 }}>No PDFs uploaded yet.</div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                  gap: "1rem",
                  marginTop: 6,
                }}
              >
                {files.map((f) => {
                  const pending = f.pending && !f.url;
                  const selected = chosen.includes(f.name);
                  return (
                    <div
                      key={f.name}
                      onClick={() => !pending && toggleSelect(unitId, f.name)}
                      style={{
                        border: selected ? "2px solid #0a225f" : "1px solid #ccc",
                        padding: "0.85rem",
                        borderRadius: 8,
                        background: "#fafafa",
                        boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
                        position: "relative",
                        cursor: pending ? "default" : "pointer",
                        opacity: pending ? 0.75 : 1,
                      }}
                      title={f.name}
                    >
                      <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 6 }}>{f.name}</div>
                      {pending ? (
                        <div style={{ fontSize: 12, color: "#555" }}>Uploading…</div>
                      ) : (
                        <a
                          href={f.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          style={{ fontSize: 13, color: "#0a66c2", textDecoration: "none" }}
                        >
                          View PDF
                        </a>
                      )}
                      {!pending && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile(unitId, f);
                          }}
                          aria-label="Delete"
                          style={{
                            position: "absolute",
                            top: 6,
                            right: 8,
                            border: "none",
                            background: "transparent",
                            fontWeight: 700,
                            color: "#888",
                            cursor: "pointer",
                            fontSize: "1rem",
                            lineHeight: 1,
                          }}
                        >
                          ×
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <p style={{ marginTop: 8, fontSize: 14, color: "#444" }}>
              {chosen.length} selected (max 10)
            </p>
          </div>
        );
      })}
    </div>
  );
}
