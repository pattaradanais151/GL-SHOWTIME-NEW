import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './NotFound.css';

function StarField() {
  const starsRef = useRef(null);

  useEffect(() => {
    const container = starsRef.current;
    if (!container) return;
    container.innerHTML = '';

    const count = 80;
    for (let i = 0; i < count; i++) {
      const star = document.createElement('div');
      star.className = 'star';
      const size = Math.random() * 2.5 + 0.5;
      star.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        top: ${Math.random() * 100}%;
        left: ${Math.random() * 100}%;
        --duration: ${Math.random() * 4 + 2}s;
        --delay: ${Math.random() * 5}s;
        --max-opacity: ${Math.random() * 0.5 + 0.2};
      `;
      container.appendChild(star);
    }
  }, []);

  return <div className="stars" ref={starsRef} aria-hidden="true" />;
}

export default function NotFound() {
  return (
    <div className="not-found-wrapper">
      {/* Ambient glow blobs */}
      <div className="blob blob-pink" aria-hidden="true" />
      <div className="blob blob-blue" aria-hidden="true" />
      <div className="blob blob-purple" aria-hidden="true" />

      {/* Twinkling star field */}
      <StarField />

      <div className="liquid-glass-card">
        {/* Corner accent marks */}
        <span className="card-corner card-corner--tl" aria-hidden="true" />
        <span className="card-corner card-corner--tr" aria-hidden="true" />
        <span className="card-corner card-corner--bl" aria-hidden="true" />
        <span className="card-corner card-corner--br" aria-hidden="true" />

        {/* Glitch 404 */}
        <div className="glitch-wrapper">
          <h1 className="glitch-text" aria-label="404">404</h1>
        </div>

        <div className="glitch-divider" aria-hidden="true" />

        <h2 className="title">Lost in the Showtime</h2>
        <p className="subtitle">
          Oops! It looks like the webpage or series you're looking for
          has been moved or no longer exists in the system.
        </p>

        <Link to="/" className="liquid-btn">
          <span>กลับสู่หน้าแรก</span>
          <em className="btn-arrow" aria-hidden="true">→</em>
        </Link>
      </div>
    </div>
  );
}