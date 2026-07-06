import React from 'react';
import './BrieforaCTA.css';

export default function BrieforaCTA() {
  return (
    <div className="briefora-cta-section">
      <div className="cta-card">
        <h2 className="cta-title">
          Ready to Turn Client <br />
          Chaos into <span className="sparkle-text"><span className="sparkle-icon">✦</span>Creative Clarity?</span>
        </h2>
        <p className="cta-subtitle">
          Automate intake. Kill scope creep. Protect your margins. Join hundreds <br />
          of elite creators for free today.
        </p>
        <button className="cta-primary-btn">
          Start Free
        </button>
      </div>
    </div>
  );
}