import React from 'react';
import './Features.css';

const featuresData = [
  {
    id: 1,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
    title: "Zero-Friction Client Discovery",
    description: "Clients answer 10 smart, plain-language questions. No signup, no confusing design jargon. Just pure, raw data collection."
  },
  {
    id: 2,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <polyline points="9 11 11 13 15 9" />
      </svg>
    ),
    title: "Kill Scope Creep",
    description: "Locks the client into a concrete, signed-off strategy before a single pixel is touched."
  },
  {
    id: 3,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
    ),
    title: "No Client Accounts. Ever.",
    description: "Absolute lowest friction possible. You send a link, they click it, they fill it. Done."
  },
  {
    id: 4,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
        <path d="M12 6v12M6 12h12" />
      </svg>
    ),
    title: "AI-Powered Brand Mapping",
    description: "Gemini transforms messy client thoughts into a structured brand brief containing targeted insights like core audience demographics, typography style recommendations, and design directions."
  }
];

export default function Features() {
  return (
    <div className="features-grid">
      {featuresData.map((feature) => (
        <div key={feature.id} className="feature-card">
          <div className="feature-icon-wrapper">
            {feature.icon}
          </div>
          <h3 className="feature-title">{feature.title}</h3>
          <p className="feature-description">{feature.description}</p>
        </div>
      ))}
    </div>
  );
}