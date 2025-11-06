import React from "react";
import "./GiantHubCard.css";

export default function GiantHubCard() {
  return (
    <div className="giant-hub-card">
      <div className="giant-hub-icon">
        {/* כאן אפשר להכניס SVG או תמונה של האייקון */}
        <svg width="48" height="48" viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="24" fill="#3ecfcf"/>
          <path d="M24 14a10 10 0 0 1 10 10c0 7-10 14-10 14s-10-7-10-14a10 10 0 0 1 10-10zm0 5a5 5 0 1 0 0.001 10.001A5 5 0 0 0 24 19z" fill="#222"/>
        </svg>
      </div>
      <div className="giant-hub-title">גיאונט HUB</div>
      <div className="giant-hub-subtitle">פורטל היישומים של גיאונט</div>
    </div>
  );
}
