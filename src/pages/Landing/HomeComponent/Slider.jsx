import React from 'react';
import './Slider.css';

// SVG Assets for the Logoipsum placeholders to match the image precisely
const Logos = [
  { id: 1, color: '#009688', icon: <polygon points="5,15 15,5 25,15 15,25" /> },
  { id: 2, color: '#FF9800', icon: <polygon points="15,5 25,10 25,20 15,25 5,20 5,10" /> },
  { id: 3, color: '#673AB7', icon: <path d="M15,5 L19,11 L25,9 L21,15 L25,21 L19,19 L15,25 L11,19 L5,21 L9,15 L5,9 L11,11 Z" /> },
  { id: 4, color: '#E53935', icon: <polygon points="15,5 25,22 5,22" /> },
  { id: 5, color: '#004D40', icon: <polygon points="15,5 25,10 25,20 15,25 5,20 5,10" /> }
];

export default function Slider() {
  return (
    <div className="briefora-container">
      {/* Top Ticker Bar */}
      <div className="logo-ticker">
        {Logos.map((logo) => (
          <div key={logo.id} className="logo-item">
            <svg viewBox="0 0 30 30" width="24" height="24" fill={logo.color}>
              {logo.icon}
            </svg>
            <span className="logo-text">Logoipsum</span>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="hero-content">
        <p className="hero-description">
          <span className="brand-badge">Briefora</span> is an AI-powered strategy engine built for high-ticket creative operators. It automatically transforms vague, chaotic client ideas into structured, production-ready design briefs and comprehensive scope documents in seconds locking down your strategy before you ever open Figma.
        </p>
      </div>
    </div>
  );
}