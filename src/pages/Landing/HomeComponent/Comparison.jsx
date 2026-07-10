import React from "react";
import "./Comparison.css";
import BLogo from "../../../assets/logo/f_logo.png";

const comparisonRows = [
  {
    others: "Gathers basic text entries",
    briefora: "Extracts true creative intent",
  },
  {
    others: "Forced signups or account setup",
    briefora: "Zero login, zero friction",
  },
  {
    others: "Hours of manual brief drafting",
    briefora: "Instant AI-generated blueprints",
  },
  {
    others: "Ignores aesthetic context",
    briefora: "Translates stylistic adjectives",
  },
  {
    others: "Overwhelming, endless form fields",
    briefora: "10 plain-language visual prompts",
  },
  {
    others: "Invites vague, unbilled direction edits",
    briefora: "Halts early scope creep completely",
  },
  {
    others: "Messy email text or raw spreadsheets",
    briefora: "Live workspace & clean PDF exports",
  },
  {
    others: "Generic, low-end template feel",
    briefora: "Premium high-ticket studio vibe",
  },
];

export default function Comparison() {
  return (
    <div className="comparison-section">
      {/* Header Layout */}
      <div className="comparison-header">
        <h2>
          Stop Collecting Raw Data. <br />
          Start Extracting Creative Direction
        </h2>
        <p>
          Generic forms collect raw data. Briefora extracts actionable creative
          direction. See the difference.
        </p>
      </div>

      {/* Comparison Grid Table Wrapper */}
      <div className="table-container">
        <table className="comparison-table">
          <thead>
            <tr>
              <th className="col-others">Others</th>
              <th className="col-briefora">
                <div className="brand-header-cell">
                  {/* <svg className="brand-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-4 6h-4v2h4v2h-4v2h4v2H9V7h6v2z"/>
                  </svg> */}
                  <img
                    src={BLogo}
                    width={20}
                    alt="Breifora Logo"
                    // className="brand-icon"
                  />
                  <span>Briefora</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {comparisonRows.map((row, index) => (
              <tr key={index}>
                <td className="cell-others">
                  <div className="cell-content">
                    <span className="icon-cross">⊗</span>
                    <span>{row.others}</span>
                  </div>
                </td>
                <td className="cell-briefora">
                  <div className="cell-content">
                    <span className="icon-check">✓</span>
                    <span>{row.briefora}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
