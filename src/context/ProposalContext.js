// src/context/ProposalContext.js
import React, { createContext, useState } from "react";

export const ProposalContext = createContext();

export const ProposalProvider = ({ children }) => {
  const [campaignBrief, setCampaignBrief] = useState({
    clientEmail: "",
    market: "",
    submarket: "",
    flightDates: { start: "", end: "" },
    gridFile: null,
    objectives: "",
    manualMarkets: [],
    manualNeighborhoods: [],
    manualFormats: [],
    manualDates: { start: "", end: "" },
  });

  const [selectedUnits, setSelectedUnits] = useState([]);
  const [unitEdits, setUnitEdits] = useState({});
  const [masterVendorData, setMasterVendorData] = useState([]);

  return (
    <ProposalContext.Provider
      value={{
        campaignBrief,
        setCampaignBrief,
        selectedUnits,
        setSelectedUnits,
        unitEdits,
        setUnitEdits,
        masterVendorData,
        setMasterVendorData,
      }}
    >
      {children}
    </ProposalContext.Provider>
  );
};
