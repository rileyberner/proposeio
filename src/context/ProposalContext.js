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
  objectives: "", // <--- ADD THIS
});
  const [selectedUnits, setSelectedUnits] = useState([]);

  return (
    <ProposalContext.Provider
      value={{
        campaignBrief,
        setCampaignBrief,
        selectedUnits,
        setSelectedUnits,
      }}
    >
      {children}
    </ProposalContext.Provider>
  );
};
