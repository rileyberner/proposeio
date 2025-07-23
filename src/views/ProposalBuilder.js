// src/views/ProposalBuilder.js
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

  return (
    <div>
      <div style={{ display: "flex", borderBottom: "2px solid #eee", marginBottom: "1rem" }}>
        {tabs.map((label, index) => (
          <div
            key={label}
            onClick={() => setActiveTab(index)}
            style={{
              padding: "1rem",
              cursor: "pointer",
              fontWeight: activeTab === index ? "bold" : "normal",
              color: activeTab === index ? "#0a225f" : "#666",
              borderBottom: activeTab === index ? "3px solid #0a225f" : "none"
            }}
          >
            {index + 1}. {label}
          </div>
        ))}
      </div>
      <div>{renderTab()}</div>
    </div>
  );
}
