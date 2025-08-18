import React, { useContext, useEffect, useMemo, useState } from 'react';
import { ProposalContext } from '../context/ProposalContext';
import { supabase, BUCKET } from '../lib/supabaseClient';

const MAX_PER_UNIT = 10;

export default function ImageSelection() {
  const { selectedUnits } = useContext(ProposalContext);

  // unitId -> [{ name, path, url }]
  const [pdfUploads, setPdfUploads] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('pdfUploads') || '{}');
    } catch { return {}; }
  });

  // unitId -> [selected file names]
  const [selectedPdfs, setSelectedPdfs] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('selectedPdfs') || '{}');
    } catch { return {}; }
  });

  // Persist to localStorage
  useEffect(() => localStorage.setItem('pdfUploads', JSON.stringify(pdfUploads)), [pdfUploads]);
  useEffect(() => localStorage.setItem('selectedPdfs', JSON.stringify(selectedPdfs)), [selectedPdfs]);

  // Load files for each selected unit on mount / change
  useEffect(() => {
    (async () => {
      const next = {};
      for (const unitId of selectedUnits) {
        next[unitId] = await listUnit(unitId);
      }
      setPdfUploads(next);
    })();
  }, [selectedUnits]);

  // Helpers
  const listUnit = async (unitId) => {
    const prefix = `unit_files/${unitId}`;
    const { data, error } = await supabase.storage.from(BUCKET).list(prefix, { limit: 100 });
    if (error) {
      console.warn('List error', unitId, error);
      return [];
    }
    // Only files in this “folder”
    const files = data?.filter((d) => d.id || d.name)?.filter((d) => !d.metadata?.isFolder) || [];
    // Map to path + public URL
    return files.map(({ name }) => {
      const path = `${prefix}/${name}`;
      const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
      return { name, path, url: pub.publicUrl };
    });
  };

  const refreshUnit = async (unitId) => {
    const files = await listUnit(unitId);
    setPdfUploads((prev) => ({ ...prev, [unitId]: files }));
  };

  const handleUpload = async (unitId, fileList) => {
    const files = Array.from(fileList).filter(f => f.type === 'application/pdf');
    if (!files.length) return;

    // upload each file with a safe/unique key
    for (const file of files) {
      const key = `unit_files/${unitId}/${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
      const { error: upErr } = await supabase
        .storage
        .from(BUCKET)
        .upload(key, file, { cacheControl: '3600', contentType: 'application/pdf', upsert: false });

      if (upErr && upErr.message?.includes('The resource already exists')) {
        // try a different key (extremely unlikely when using Date.now())
        continue;
      } else if (upErr) {
        console.error('Upload error:', upErr);
      }
    }

    await refreshUnit(unitId);
  };

  const toggleSelect = (unitId, fileName) => {
    setSelectedPdfs((prev) => {
      const current = prev[unitId] || [];
      const isOn = current.includes(fileName);
      const updated = isOn ? current.filter(n => n !== fileName)
                           : [...current, fileName].slice(0, MAX_PER_UNIT);
      return { ...prev, [unitId]: updated };
    });
  };

  const removeFile = async (unitId, fileObj) => {
    const { error } = await supabase.storage.from(BUCKET).remove([fileObj.path]);
    if (error) {
      console.error('Delete error:', error);
      return;
    }
    setPdfUploads((prev) => ({
      ...prev,
      [unitId]: (prev[unitId] || []).filter(f => f.name !== fileObj.name),
    }));
    setSelectedPdfs((prev) => ({
      ...prev,
      [unitId]: (prev[unitId] || []).filter(n => n !== fileObj.name),
    }));
  };

  const bucketUrl = useMemo(() => {
    // Helpful debug banner
    return process.env.REACT_APP_SUPABASE_URL ? new URL(process.env.REACT_APP_SUPABASE_URL).host : '(missing env)';
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h2 style={{ color: '#0a225f', marginBottom: '1.0rem' }}>Select PDFs for Export</h2>
      <p style={{ color: '#666', marginTop: 0, marginBottom: '1.5rem' }}>
        Bucket: <code>{bucketUrl}</code>
      </p>

      {selectedUnits.map((unitId) => (
        <div key={unitId} style={{ marginBottom: '2.4rem', borderBottom: '1px solid #eee', paddingBottom: '1.4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <h3 style={{ color: '#0a225f', margin: 0 }}>{unitId}</h3>
            <button
              type="button"
              onClick={() => refreshUnit(unitId)}
              style={{ fontSize: 12, padding: '4px 8px', borderRadius: 6, border: '1px solid #ccc', background: '#f6f6f6' }}
            >
              Refresh from bucket
            </button>
          </div>

          <label style={{ display: 'block', fontWeight: 'bold', margin: '0.75rem 0 0.5rem' }}>
            Upload PDF Deck(s)
          </label>
          <input
            type="file"
            accept="application/pdf"
            multiple
            onChange={(e) => handleUpload(unitId, e.target.files)}
          />

          {(pdfUploads[unitId]?.length ?? 0) === 0 ? (
            <p style={{ color: '#777', marginTop: '0.75rem' }}>No PDFs uploaded yet.</p>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                gap: '0.75rem',
                marginTop: '0.75rem',
              }}
            >
              {pdfUploads[unitId].map((file) => {
                const selected = (selectedPdfs[unitId] || []).includes(file.name);
                return (
                  <div
                    key={file.path}
                    style={{
                      border: selected ? '2px solid #0a225f' : '1px solid #ccc',
                      borderRadius: 10,
                      padding: '0.75rem',
                      background: '#fafafa',
                      position: 'relative',
                      cursor: 'pointer',
                    }}
                    onClick={() => toggleSelect(unitId, file.name)}
                    title={file.name}
                  >
                    <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {file.name}
                    </div>
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noreferrer"
                      style={{ fontSize: 13, color: '#0a66c2', textDecoration: 'none' }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      View PDF
                    </a>

                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removeFile(unitId, file); }}
                      style={{
                        position: 'absolute', top: 6, right: 8, border: 'none', background: 'transparent',
                        fontWeight: 700, color: '#888', cursor: 'pointer'
                      }}
                      aria-label="Remove"
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
            {(selectedPdfs[unitId]?.length || 0)} selected (max {MAX_PER_UNIT})
          </p>
        </div>
      ))}
    </div>
  );
}
