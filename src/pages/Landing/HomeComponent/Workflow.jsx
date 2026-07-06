import React from 'react';
import './Workflow.css';

export default function Workflow() {
  return (
    <div className="workflow-section">
      {/* Header Area */}
      <div className="workflow-header">
        <h2>Lock Down the Strategy Before You Open Figma</h2>
        <p>
          Vague client expectations drain your energy and project margins. Send a single link, no client login 
          required and let AI transform raw thoughts into a definitive strategic blueprint.
        </p>
      </div>

      {/* Steps Column Grid */}
      <div className="workflow-grid">
        
        {/* Step 1 */}
        <div className="workflow-card">
          <div className="card-preview-area mockup-s1">
            <div className="mock-sidebar">
              <div className="mock-label">MAIN</div>
              <div className="mock-nav-item active">
                <span className="icon">⌂</span> Home
              </div>
              <div className="mock-nav-item">
                <span className="icon">✉</span> Inbox <span className="badge">3</span>
              </div>
              <div className="mock-nav-item dimmed">
                <span className="icon">🔗</span> Sequences
              </div>
            </div>
          </div>
          <div className="card-info-area">
            <span className="step-badge">Step 1</span>
            <h3>Share a Unique Link</h3>
            <p>Absolute lowest friction possible. You send a link, they click it, they fill it. Done.</p>
          </div>
        </div>

        {/* Step 2 */}
        <div className="workflow-card">
          <div className="card-preview-area mockup-s2">
            <div className="mock-dashboard-widget">
              <div className="widget-header">
                <span className="widget-title">CONVERSIONS</span>
                <span className="dots">•••</span>
              </div>
              <div className="widget-stats">
                <div className="stat-box">
                  <span className="stat-label">BOOKED</span>
                  <div className="stat-val">7 <span className="stat-trend up">+1%</span></div>
                </div>
                <div className="stat-box">
                  <span className="stat-label">IGNORED</span>
                  <div className="stat-val">16 <span className="stat-trend down">-5%</span></div>
                </div>
              </div>
            </div>
          </div>
          <div className="card-info-area">
            <span className="step-badge">Step 2</span>
            <h3>Client Fills the Intake</h3>
            <p>Your client answers 10 smart, plain-language questions on any device. No account creation or confusing design jargon required.</p>
          </div>
        </div>

        {/* Step 3 */}
        <div className="workflow-card">
          <div className="card-preview-area mockup-s3">
            <div className="mock-messages-header">
              <span className="title">messages</span>
              <div className="mock-dropdown">Tags: All ▾</div>
            </div>
            <table className="mock-table">
              <thead>
                <tr>
                  <th><input type="checkbox" readOnly checked /></th>
                  <th>LEAD NAME</th>
                  <th>EMAIL ADDRESS</th>
                  <th>MESSAGE</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><input type="checkbox" readOnly /></td>
                  <td className="user-cell"><div className="avatar">MT</div> Maya Tran</td>
                  <td className="email-cell">maya@zenli.io</td>
                  <td className="text-cell">Thanks for reaching out — this...</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="card-info-area">
            <span className="step-badge">Step 3</span>
            <h3>AI Writes the Brief</h3>
            <p>Gemini instantly structures raw thoughts into a strategic blueprint. View it online or export to PDF to design with certainty.</p>
          </div>
        </div>

      </div>
    </div>
  );
}