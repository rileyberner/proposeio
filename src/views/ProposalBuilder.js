import React, { useState } from "react";
import CampaignBrief from "./CampaignBrief";
import SelectedMedia from "./SelectedMedia";
import ImageSelection from "./ImageSelection";
import MapView from "./MapView";
import ExportView from "./ExportView";

const tabs = [
  "Campaign Brief",
  "Selected Media",
  "Images",
  "Map",
  "Export"
];

export default function ProposalBuilder() {
  const [activeTab, setActiveTab] = useState(0);

  const renderTab = () => {
    switch (activeTab) {
      case 0:
        return <CampaignBrief />;
      case 1:
        return <SelectedMedia />;
      case 2:
        return <ImageSelection />;
      case 3:
        return <MapView />;
      case 4:
        return <ExportView />;
      default:
        return null;
    }
  };

  const handleNewProposal = () => {
    const confirmed = window.confirm("Are you sure you want to start a new proposal?");
    if (confirmed) {
      const masterData = localStorage.getItem("masterVendorData");
      localStorage.clear();
      if (masterData) {
        localStorage.setItem("masterVendorData", masterData);
      }
      window.location.reload();
          }
      };

  return (
    <div>
      {/* Header with Tabs and New Proposal button */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid #eee", marginBottom: "1rem" }}>
        <div style={{ display: "flex" }}>
          {tabs.map((label, index) => (
            <div
              key={label}
              onClick={() => setActiveTab(index)}
              style={{
                padding: "1rem",
                cursor: "pointer",
                fontWeight: activeTab === index ? "bold" : "normal",
                color: activeTab === index ? "rgba(10, 34, 95, 1)" : "#666",
                borderBottom: activeTab === index ? "3px solid #0a225f" : "none"
              }}
            >
              {index + 1}. {label}
            </div>
          ))}
        </div>

        {/* Top-right Button */}
        <button
          onClick={handleNewProposal}
          style={{
            marginRight: "1.5rem",
            background: "#ff6600",
            color: "#fff",
            padding: "0.6rem 1.2rem",
            border: 'none',
            borderRadius: "24px",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          New Proposal
        </button>
      </div>

      <div>{renderTab()}</div>
    </div>
  );
}
