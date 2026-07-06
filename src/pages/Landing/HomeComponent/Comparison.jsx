import React from 'react';
import './Comparison.css';

const comparisonRows = [
  { others: "Gathers basic text entries", breifora: "Extracts true creative intent" },
  { others: "Forced signups or account setup", breifora: "Zero login, zero friction" },
  { others: "Hours of manual brief drafting", breifora: "Instant Al-generated blueprints" },
  { others: "Ignores aesthetic context", breifora: "Translates stylistic adjectives" },
  { others: "Overwhelming, endless form fields", breifora: "10 plain-language visual prompts" },
  { others: "Invites vague, unbilled direction edits", breifora: "Halts early scope creep completely" },
  { others: "Messy email text or raw spreadsheets", breifora: "Live workspace & clean PDF exports" },
  { others: "Generic, low-end template feel", breifora: "Premium high-ticket studio vibe" }
];

export default function Comparison() {
  return (
    <div className="comparison-section">
      {/* Header Layout */}
      <div className="comparison-header">
        <h2>Stop Collecting Raw Data. <br />Start Extracting Creative Direction</h2>
        <p>Generic forms collect raw data. Briefora extracts actionable creative direction. See the difference.</p>
      </div>

      {/* Comparison Grid Table Wrapper */}
      <div className="table-container">
        <table className="comparison-table">
          <thead>
            <tr>
              <th className="col-others">Others</th>
              <th className="col-breifora">
                <div className="brand-header-cell">
                  <svg className="brand-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-4 6h-4v2h4v2h-4v2h4v2H9V7h6v2z"/>
                  </svg>
                  <span>Breifora</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {comparisonRows.map((row, index) => (
              <tr key={index}>
                <td className="cell-others">
                  <span className="icon-cross">⊗</span>
                  {row.others}
                </td>
                <td className="cell-breifora">
                  <span className="icon-check">✓</span>
                  {row.breifora}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}