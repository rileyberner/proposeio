// src/views/SelectedMedia.js
import React, { useContext, useEffect, useState } from "react";
import { ProposalContext } from "../context/ProposalContext";

console.log("🔥 SelectedMedia.js is running"); // ADD THIS

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
  console.log("📂 masterVendorData length:", masterVendorData?.length);
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
      console.log("🧪 Sample row from masterVendorData:", masterVendorData[0]);
      console.log("📌 Brief filters:", {
        markets: campaignBrief.manualMarkets,
        neighborhoods: campaignBrief.manualNeighborhoods,
        formats: campaignBrief.manualFormats,
      });
      console.log("✅ Filtered units:", filtered.length);

    setFilteredUnits(filtered);
    const ids = filtered.map((row) => row["Unit ID"] || row.UnitID);
    setSelectedUnits(ids); // preselect
  }, [campaignBrief, masterVendorData]);

  const toggleUnit = (id) => {
    if (selectedUnits.includes(id)) {
      setSelectedUnits(selectedUnits.filter((uid) => uid !== id));
    } else {
      setSelectedUnits([...selectedUnits, id]);
    }
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

  const getValue = (unitId, field, fallback) => {
    return unitEdits[unitId]?.[field] ?? fallback;
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2 style={{ color: "#0a225f" }}>Selected Media</h2>
      <p>Showing units matching your campaign brief.</p>

      <div style={{ overflowX: "auto", maxHeight: "70vh", border: "1px solid #ccc" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ position: "sticky", top: 0, background: "#f8f8f8", zIndex: 1 }}>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={
                    filteredUnits.length > 0 &&
                    filteredUnits.every((row) =>
                      selectedUnits.includes(row["Unit ID"])
                    )
                  }
                  onChange={toggleAll}
                />
              </th>
              <th>Unit ID</th>
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
              return (
                <tr key={id} style={{ borderBottom: "1px solid #ddd" }}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedUnits.includes(id)}
                      onChange={() => toggleUnit(id)}
                    />
                  </td>
                  <td>{id}</td>
                  <td>
                    <input
                      type="date"
                      value={getValue(id, "start", campaignBrief.manualDates?.start || "")}
                      onChange={(e) => handleEdit(id, "start", e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="date"
                      value={getValue(id, "end", campaignBrief.manualDates?.end || "")}
                      onChange={(e) => handleEdit(id, "end", e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={formatCurrency(getValue(id, "rateCard", row["Rate Card"]))}
                      onChange={(e) =>
                        handleEdit(id, "rateCard", e.target.value.replace(/[^\d.]/g, ""))
                      }
                    />
                  </td>
                  <td>
                  <input
                    type="text"
                    value={formatCurrency(getValue(id, "negotiated", row["Negotaiaetd Media"] || row["Negotiated Media"]))}
                    onChange={(e) =>
                      handleEdit(id, "negotiated", e.target.value.replace(/[^\d.]/g, ""))
                    }
                  />
                </td>
                  <td>
                    <input
                      type="text"
                      value={formatCurrency(getValue(id, "install", row["Install"]))}
                      onChange={(e) =>
                        handleEdit(id, "install", e.target.value.replace(/[^\d.]/g, ""))
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={formatCurrency(getValue(id, "production", row["Production"]))}
                      onChange={(e) =>
                        handleEdit(id, "production", e.target.value.replace(/[^\d.]/g, ""))
                      }
                    />
                  </td>
                  <td>
                    <textarea
                      style={{ width: "100%", maxHeight: "4rem" }}
                      value={getValue(id, "rationale", row["Rationale"] || "")}
                      onChange={(e) => handleEdit(id, "rationale", e.target.value)}
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
