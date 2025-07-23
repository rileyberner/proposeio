import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import ProposalBuilder from "./views/ProposalBuilder";
import Homepage from "./views/Homepage";
import CampaignBrief from "./views/CampaignBrief";
import SelectedMedia from "./views/SelectedMedia";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/proposal" element={<ProposalBuilder />} />
        <Route path="/selected-media" element={<SelectedMedia />} />
        <Route path="/campaign-brief" element={<CampaignBrief />} />
      </Routes>
    </Router>
  );
}

export default App;
