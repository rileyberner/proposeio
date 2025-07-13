// src/views/Homepage.js
import React, { useState } from "react";
import "./Homepage.css";

export default function Homepage() {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);
  const closeDropdown = () => setDropdownOpen(false);

  return (
    <div className="homepage" onClick={closeDropdown}>
      <nav className="nav" onClick={(e) => e.stopPropagation()}>
        <div className="logo">Propose.io</div>
        <div className="menu">
          <button className="menu-button" onClick={toggleDropdown}>☰</button>
          {dropdownOpen && (
            <div className="dropdown">
              <a href="#">Tools</a>
              <a href="#">Resources</a>
              <a href="#">Pricing</a>
              <a href="#">About</a>
            </div>
          )}
        </div>
      </nav>

      <section className="hero">
        <h1>Automate proposal workflow<br />and take back your time.</h1>
        <p>
          Free your team from repetitive tasks.
          <br />
          Streamline proposals in seconds.
        </p>
        <button className="cta-button">Get Started</button>
      </section>

      <section className="features-section">
        <h2>Generate better proposals in minutes</h2>
        <p>No more manual formatting. No more folder digging. Just select, export, and go.</p>
      </section>

      <section className="page2">
        <img src="/path-to-your-image.jpg" alt="Propose.io preview" className="page2-image" />
        <div className="page2-text">
          <h2>Everything you need to pitch faster</h2>
          <p>
            Propose.io helps media vendors streamline how they build proposals — from grids and photosheets to custom maps — all in one place.
          </p>
        </div>
      </section>

      <section className="page3">
        <h2>Ready to simplify your workflow?</h2>
        <p>Get started with Propose.io and stop wasting time on formatting proposals.</p>
        <button className="cta-button large">Get Started</button>
      </section>

      <footer className="footer">
        <div className="footer-left">
          <h3>The fastest way to build a proposal</h3>
        </div>
        <div className="footer-links">
          <div>
            <h4>Company</h4>
            <a href="#">About</a>
            <a href="#">Careers</a>
            <a href="#">Blog</a>
          </div>
          <div>
            <h4>Product</h4>
            <a href="#">Pricing</a>
            <a href="#">Demo</a>
            <a href="#">Features</a>
          </div>
          <div>
            <h4>Support</h4>
            <a href="#">Help</a>
            <a href="#">Contact</a>
            <a href="#">Docs</a>
          </div>
          <div>
            <h4>Legal</h4>
            <a href="#">Terms</a>
            <a href="#">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}