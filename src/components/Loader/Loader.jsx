import React from 'react';
import './Loader.css';

const Loader = ({ message = "Loading...", subtitle = "Please wait a moment..." }) => {
  return (
    <div className="loader-container">
      <div className="loader-card">
        {/* The Animated Loading Graphic */}
        <div className="spinner-wrapper">
          <div className="orbital-track"></div>
          <div className="orbital-comet"></div>
        </div>

        {/* Dynamic Text Section */}
        <div className="loader-text-group">
          <h3 className="loader-title">{message}</h3>
          <p className="loader-subtitle">{subtitle}</p>
        </div>
      </div>
    </div>
  );
};

export default Loader;