// src/views/SelectedMedia.js
import React, { useContext, useState, useEffect } from "react";
import { ProposalContext } from "../context/ProposalContext";

export default function SelectedMedia() {
  const { campaignBrief } = useContext(ProposalContext);
  const [filteredUnits, setFilteredUnits] = useState([]);

  useEffect(() => {
    const storedData = localStorage.getItem("masterVendorData");
    if (storedData) {
      try {
        const units = JSON.parse(storedData);
        const matchMarket = campaignBrief.manualMarkets || [];
        const matchNeighborhood = campaignBrief.manualNeighborhoods || [];
        const matchFormat = campaignBrief.manualFormats || [];

        const filtered = units.filter((unit) => {
          const market = unit.Market || unit.market;
          const hood = unit.Neighborhood || unit.Submarket || unit.neighborhood || unit.submarket;
          const format = unit.Format || unit.format;

          return (
            (!matchMarket.length || matchMarket.includes(market)) &&
            (!matchNeighborhood.length || matchNeighborhood.includes(hood)) &&
            (!matchFormat.length || matchFormat.includes(format))
          );
        });

        setFilteredUnits(filtered);
      } catch (err) {
        console.error("Error parsing vendor data:", err);
      }
    }
  }, [campaignBrief]);

  return (
    <div style={{ padding: "2rem" }}>
      <h1 style={{ color: "#0a225f" }}>Selected Media</h1>
      <p>Showing units matching your campaign brief.</p>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ backgroundColor: "#eee" }}>
            <th style={{ padding: "8px" }}></th>
            <th style={{ padding: "8px" }}>Unit ID</th>
            <th style={{ padding: "8px" }}>Market</th>
            <th style={{ padding: "8px" }}>Neighborhood</th>
            <th style={{ padding: "8px" }}>Format</th>
            <th style={{ padding: "8px" }}>Timing</th>
            <th style={{ padding: "8px" }}>Price</th>
            <th style={{ padding: "8px", width: "30%" }}>Notes</th>
          </tr>
        </thead>
        <tbody>
          {filteredUnits.map((unit, i) => (
            <tr key={i}>
              <td style={{ padding: "8px" }}>
                <input type="checkbox" />
              </td>
              <td style={{ padding: "8px" }}>{unit["Unit ID"]}</td>
              <td style={{ padding: "8px" }}>{unit.Market || unit.market}</td>
              <td style={{ padding: "8px" }}>{unit.Neighborhood || unit.Submarket}</td>
              <td style={{ padding: "8px" }}>{unit.Format}</td>
              <td style={{ padding: "8px" }}>
                <input type="text" placeholder="Add timing" style={{ width: "100%" }} />
              </td>
              <td style={{ padding: "8px" }}>
                <input type="text" placeholder="$0.00" style={{ width: "100%" }} />
              </td>
              <td style={{ padding: "8px" }}>
                <input type="text" placeholder="Add notes..." style={{ width: "100%" }} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
