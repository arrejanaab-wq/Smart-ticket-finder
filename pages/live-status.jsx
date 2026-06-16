import React, { useState } from 'react';
import Link from 'next/link';

export default function LiveStatus() {
  const [trainNo, setTrainNo] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  async function handleCheckStatus(e) {
    e.preventDefault();
    if (!trainNo || trainNo.trim().length < 5) {
      setError("Please enter a valid 5-digit train number.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch('/api/live-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trainNo: trainNo.trim() })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to fetch live status");
      }

      const resData = await response.json();
      setResult(resData.data);
    } catch (err) {
      console.error(err);
      setError(err.message || "An unexpected error occurred.");
    }
    setLoading(false);
  }

  return (
    <div className="container">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Sora:wght@300;400;600;800&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background-color: #0b0f19;
          color: #e8eaf6;
          font-family: 'Sora', sans-serif;
          min-height: 100vh;
          background-image: 
            radial-gradient(at 0% 0%, rgba(59, 130, 246, 0.1) 0, transparent 50%),
            radial-gradient(at 100% 100%, rgba(139, 92, 246, 0.1) 0, transparent 50%);
        }

        .container {
          max-width: 900px;
          margin: 0 auto;
          padding: 20px 16px;
        }

        .navbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          padding: 12px 24px;
          margin-bottom: 30px;
        }
        .nav-logo {
          font-weight: 800;
          font-size: 1.1rem;
          color: #e8eaf6;
          display: flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
        }
        .nav-logo span {
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .nav-links {
          display: flex;
          gap: 8px;
        }
        .nav-btn {
          color: #94a3b8;
          text-decoration: none;
          font-size: 0.82rem;
          font-weight: 600;
          padding: 8px 16px;
          border-radius: 8px;
          transition: all 0.2s ease;
          border: 1px solid transparent;
        }
        .nav-btn:hover {
          color: #e8eaf6;
          background: rgba(255, 255, 255, 0.03);
        }
        .nav-btn.active {
          color: white;
          background: rgba(139, 92, 246, 0.1);
          border-color: rgba(139, 92, 246, 0.2);
        }

        .header {
          text-align: center;
          margin-bottom: 26px;
        }
        .header h1 {
          font-size: 2.2rem;
          font-weight: 800;
          background: linear-gradient(135deg, #e8eaf6 30%, #a78bfa 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 8px;
        }
        .header p {
          color: #64748b;
          font-size: 0.94rem;
        }

        .card {
          background: rgba(15, 23, 42, 0.3);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 20px;
          padding: 24px;
          margin-bottom: 24px;
        }
        .form {
          display: flex;
          gap: 12px;
          align-items: flex-end;
        }
        .input-group {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .input-group label {
          font-size: 0.76rem;
          font-weight: 700;
          color: #94a3b8;
          text-transform: uppercase;
        }
        .input-group input {
          width: 100%;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 12px 16px;
          color: white;
          font-size: 1.1rem;
          font-family: 'Space Mono', monospace;
          outline: none;
        }
        .btn {
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          border: none;
          color: white;
          padding: 14px 28px;
          border-radius: 12px;
          font-size: 0.94rem;
          font-weight: 700;
          cursor: pointer;
          height: 48px;
        }

        .status-summary {
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.2);
          padding: 16px;
          border-radius: 16px;
          margin-bottom: 20px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .status-note {
          font-size: 1.1rem;
          font-weight: 600;
          color: #7eb8f7;
        }
        .status-update {
          font-size: 0.75rem;
          color: #64748b;
          font-family: 'Space Mono', monospace;
        }

        .timeline {
          position: relative;
          padding-left: 30px;
          margin-top: 30px;
        }
        .timeline::before {
          content: '';
          position: absolute;
          left: 10px;
          top: 0;
          bottom: 0;
          width: 2px;
          background: rgba(255, 255, 255, 0.1);
        }
        .station-item {
          position: relative;
          padding-bottom: 30px;
        }
        .station-dot {
          position: absolute;
          left: -25px;
          top: 5px;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #1e293b;
          border: 2px solid #64748b;
          z-index: 1;
        }
        .station-dot.passed {
          background: #34d399;
          border-color: #34d399;
          box-shadow: 0 0 10px rgba(52, 211, 153, 0.4);
        }
        .station-dot.current {
          background: #3b82f6;
          border-color: #3b82f6;
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
          70% { transform: scale(1.2); box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
        }

        .station-card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          padding: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .station-name {
          font-weight: 700;
          font-size: 1rem;
        }
        .station-code {
          font-size: 0.75rem;
          color: #64748b;
          font-family: 'Space Mono', monospace;
        }
        .time-info {
          text-align: right;
        }
        .arrival-time {
          font-size: 0.85rem;
          font-weight: 600;
          color: #e8eaf6;
        }
        .delay {
          font-size: 0.7rem;
          font-family: 'Space Mono', monospace;
          margin-top: 2px;
        }
        .delay.on-time { color: #34d399; }
        .delay.late { color: #f87171; }

        .loader {
          text-align: center;
          padding: 40px;
        }
        .error-box {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          color: #f87171;
          padding: 12px 16px;
          border-radius: 12px;
          margin-bottom: 24px;
        }
      `}</style>

      <nav className="navbar">
        <Link href="/" className="nav-logo">
          🚄 <span>Smart Rail Finder</span>
        </Link>
        <div className="nav-links">
          <Link href="/" className="nav-btn">🔍 Finder</Link>
          <Link href="/pnr" className="nav-btn">🎫 PNR Status</Link>
          <Link href="/live-status" className="nav-btn active">📡 Live Tracking</Link>
        </div>
      </nav>

      <div className="header">
        <h1>Where is my Train?</h1>
        <p>Get real-time GPS location and delay status of any Indian Railway train</p>
      </div>

      <div className="card">
        <form onSubmit={handleCheckStatus} className="form">
          <div className="input-group">
            <label>🚆 Train Number</label>
            <input
              type="text"
              maxLength="5"
              placeholder="e.g. 12951"
              value={trainNo}
              onChange={(e) => setTrainNo(e.target.value.replace(/\D/g, ''))}
            />
          </div>
          <button type="submit" className="btn" disabled={loading || trainNo.length < 5}>
            {loading ? "Tracking..." : "Track Live ➔"}
          </button>
        </form>
      </div>

      {error && <div className="error-box">{error}</div>}

      {loading && (
        <div className="loader">
          🛰️ Tracking train via GPS satellites...
        </div>
      )}

      {result && (
        <>
          <div className="status-summary">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="station-name" style={{ fontSize: '1.2rem' }}>{result.trainName} ({result.trainNo})</div>
              <div className="status-update">Last Update: {result.lastUpdate}</div>
            </div>
            <div className="status-note">📍 {result.statusNote}</div>
          </div>

          <div className="timeline">
            {result.timeline.map((station, idx) => {
              const isPassed = station.status === 'passed';
              const isCurrent = station.stationCode === result.currentStationCode;
              
              return (
                <div key={idx} className="station-item">
                  <div className={`station-dot ${isCurrent ? 'current' : isPassed ? 'passed' : ''}`} />
                  <div className="station-card" style={{ opacity: isPassed && !isCurrent ? 0.6 : 1 }}>
                    <div>
                      <div className="station-name">{station.stationName}</div>
                      <div className="station-code">{station.stationCode} · PF {station.platform || 'N/A'}</div>
                    </div>
                    <div className="time-info">
                      <div className="arrival-time">
                        {station.arrival?.actual && station.arrival.actual !== 'SRC' 
                          ? station.arrival.actual 
                          : (station.departure?.actual && station.departure.actual !== 'DEST' ? station.departure.actual : '---')}
                      </div>
                      <div className={`delay ${(station.arrival?.delay || station.departure?.delay) === 'On Time' ? 'on-time' : 'late'}`}>
                        {station.arrival?.delay || station.departure?.delay || '---'}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
