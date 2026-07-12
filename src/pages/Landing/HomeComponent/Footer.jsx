import React from "react";
import "./Footer.css";
import Logo from "../../../assets/logo/logo.png";
import BLogo from "../../../assets/logo/f_logo.png";

export default function Footer() {
  return (
    <footer className="footer-container">
      {/* Top Navigation Grid */}
      <div className="footer-top">
        {/* Brand Identity */}
        <div className="footer-brand">
          <div className="footer-logo">
            <img
              src={Logo}
              width={120}
              alt="Breifora Logo"
              className="navbar__logo"
            />

            {/* <svg className="logo-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
            <span className="logo-text">Breifora</span> */}
          </div>
          <p className="footer-tagline">
            From Client Chaos to{" "}
            <span className="highlight-text">Creative Clarity.</span>
          </p>
        </div>

        {/* Link Columns */}
        <div className="footer-links">
          <div className="footer-column">
            <h4>Pages</h4>
            <ul>
              <li>
                <a href="#benefits">Benefits</a>
              </li>
              <li>
                <a href="#how-it-works">How It Works</a>
              </li>
              <li>
                <a href="#why-breifora">Why Breifora</a>
              </li>
              <li>
                <a href="#pricing">Pricing</a>
              </li>
              <li>
                <a href="#testimonials">Testimonials</a>
              </li>
              <li>
                <a href="#faqs">FAQs</a>
              </li>
            </ul>
          </div>

          <div className="footer-column">
            <h4>Platforms</h4>
            <ul>
              <li>
                <a href="https://linkedin.com" target="_blank" rel="noreferrer">
                  Linkedin
                </a>
              </li>
              <li>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                >
                  Instagram
                </a>
              </li>
              <li>
                <a href="https://youtube.com" target="_blank" rel="noreferrer">
                  Youtube
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Large Watermark Brand Graphic */}
      <div className="footer-watermark">
        <div className="watermark-content">
          {/* <div className="watermark-icon-wrapper">
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="watermark-icon"
            >
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div> */}
          {/* <img
            src={BLogo}
            width={120}
            alt="Breifora Logo"
            className="navbar__logo"
          /> */}
          <span className="watermark-text">Breifora</span>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <p className="copyright">&copy; 2026 Breifora</p>

        <div className="social-icons">
          {/* X (Twitter) Icon */}
          <a href="#" aria-label="X (Twitter)">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
          {/* LinkedIn Icon */}
          <a href="#" aria-label="LinkedIn">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
            </svg>
          </a>
          {/* ProductHunt/Globe Icon */}
          <a href="#" aria-label="Website">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
}
