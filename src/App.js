import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Homepage from "./views/Homepage";
import ProposalBuilder from "./views/ProposalBuilder";
import SelectedMedia from "./views/SelectedMedia";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/proposal-builder" element={<ProposalBuilder />} />
        <Route path="/selected-media" element={<SelectedMedia />} />
      </Routes>
    </Router>
  );
}

export default App;