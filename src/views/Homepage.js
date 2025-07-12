
// src/views/Homepage.js
import React from "react";
import "./Homepage.css";

export default function Homepage() {
  return (
    <div className="homepage-container">
      <section className="hero-section">
        <h1>Automate proposal workflow and take back your time.</h1>
      </section>

      <section className="benefits-section">
        <p>Proposal.io streamlines media grids, photo decks, location maps, and more.</p>
        <p>Cut repetitive tasks and focus on the people moving your business forward.</p>
      </section>

      <div className="bottom-cta">
        <button>Get Started</button>
      </div>
    </div>
  );
}