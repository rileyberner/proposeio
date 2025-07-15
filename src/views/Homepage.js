// src/views/Homepage.js
import React, { useState } from "react";
import "./Homepage.css";

export default function Homepage() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  return (
    <div className="homepage">
      <nav className="nav">
        <div className="logo">Propose.io</div>
        <button className="menu-button large" onClick={toggleDropdown}>≡</button>
        {dropdownOpen && (
          <div className="dropdown">
            <a href="#">Tools</a>
            <a href="#">Resources</a>
            <a href="#">Pricing</a>
            <a href="#">About</a>
          </div>
        )}
      </nav>

      <section className="hero">
        <h1>Automate proposal workflow<br />and take back your time.</h1>
        <p>Free your team from repetitive tasks.<br />Streamline proposals in seconds.</p>
        <button className="cta-button">Get Started</button>
      </section>

      <section className="page2">
        <img src="/flowchart.png" alt="Flowchart" className="page2-image" />
        <div className="page2-text">
          <h2>Everything you need to deliver faster</h2>
          <p>Ready to simplify your workflow?</p>
        </div>
        <a href="#" className="cta-button-large">
          <span>Get Started</span>
          <span className="arrow">→</span>
        </a>
      </section>

      <footer className="footer">
        <div className="footer-text">
          The fastest way<br />to build proposals
        </div>
        <div className="footer-links">
          <a href="#">Tools</a>
          <a href="#">Resources</a>
          <a href="#">Pricing</a>
          <a href="#">About</a>
        </div>
      </footer>
    </div>
  );
}

