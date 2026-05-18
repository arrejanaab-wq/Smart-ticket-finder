import React, { useState } from 'react';
import Link from 'next/link';

export default function PnrChecker() {
  const [pnrNo, setPnrNo] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  async function handleCheckPnr(e) {
    e.preventDefault();
    if (!pnrNo || pnrNo.trim().length !== 10) {
      setError("Please enter a valid 10-digit PNR number.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch('/api/pnr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pnrNo: pnrNo.trim() })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to fetch PNR status");
      }

      const resData = await response.json();
      setResult(resData);
    } catch (err) {
      console.error(err);
      setError(err.message || "An unexpected network error occurred.");
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
          max-width: 800px;
          margin: 0 auto;
          padding: 20px 16px;
        }

        /* Top Navigation Header Navbar */
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

        /* Header Intro */
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
          letter-spacing: -0.5px;
        }
        .header p {
          color: #64748b;
          font-size: 0.94rem;
        }

        /* Search Card Form */
        .card {
          background: rgba(15, 23, 42, 0.3);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 20px;
          padding: 24px;
          margin-bottom: 24px;
          box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.5);
        }
        .pnr-form {
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
          letter-spacing: 1px;
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
          letter-spacing: 2px;
          outline: none;
          transition: all 0.2s ease;
        }
        .input-group input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 12px rgba(59, 130, 246, 0.2);
          background: rgba(255, 255, 255, 0.05);
        }
        .btn-check {
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          border: none;
          color: white;
          padding: 14px 28px;
          border-radius: 12px;
          font-size: 0.94rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 8px;
          height: 48px;
        }
        .btn-check:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(139, 92, 246, 0.4);
        }
        .btn-check:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Error box */
        .error-box {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          color: #f87171;
          padding: 12px 16px;
          border-radius: 12px;
          margin-bottom: 24px;
          font-size: 0.88rem;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        /* Loader */
        .loader {
          text-align: center;
          padding: 40px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 14px;
        }
        .loader-dots {
          display: flex;
          gap: 8px;
        }
        .loader-dots span {
          width: 8px;
          height: 8px;
          background: #7eb8f7;
          border-radius: 50%;
          animation: bounce 1.4s infinite ease-in-out both;
        }
        .loader-dots span:nth-child(1) { animation-delay: -0.32s; }
        .loader-dots span:nth-child(2) { animation-delay: -0.16s; }
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }

        /* BOARDING PASS TICKET UI */
        .ticket {
          background: linear-gradient(135deg, rgba(21, 30, 54, 0.6) 0%, rgba(13, 19, 36, 0.6) 100%);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.6);
          margin-top: 10px;
          animation: fadeIn 0.4s ease;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Ticket Header */
        .ticket-header {
          background: rgba(255, 255, 255, 0.02);
          border-bottom: 1px dashed rgba(255, 255, 255, 0.1);
          padding: 20px 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .ticket-train-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .ticket-train-icon {
          font-size: 26px;
          background: rgba(126, 184, 247, 0.08);
          padding: 8px;
          border-radius: 10px;
        }
        .ticket-train-name {
          font-weight: 700;
          font-size: 1.05rem;
          color: #e8eaf6;
        }
        .ticket-train-meta {
          font-family: 'Space Mono', monospace;
          font-size: 0.72rem;
          color: #7eb8f7;
          font-weight: 700;
          margin-top: 2px;
        }
        .ticket-pnr-badge {
          text-align: right;
        }
        .ticket-pnr-label {
          font-size: 0.68rem;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .ticket-pnr-num {
          font-family: 'Space Mono', monospace;
          font-size: 1.05rem;
          font-weight: 700;
          color: #a78bfa;
          letter-spacing: 1px;
        }

        /* Ticket Journey Segment Body */
        .ticket-body {
          padding: 24px;
        }
        .journey-line {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 28px;
          position: relative;
        }
        .station-node {
          text-align: center;
          min-width: 80px;
        }
        .station-code {
          font-family: 'Space Mono', monospace;
          font-size: 2.1rem;
          font-weight: 800;
          color: #e8eaf6;
          letter-spacing: -1px;
        }
        .station-name {
          font-size: 0.76rem;
          color: #94a3b8;
          margin-top: 2px;
        }
        .rail-track {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          height: 2px;
          background: rgba(255, 255, 255, 0.06);
          margin: 0 16px;
        }
        .rail-track::before, .rail-track::after {
          content: '';
          position: absolute;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.15);
        }
        .rail-track::before { left: 0; }
        .rail-track::after { right: 0; }
        .train-dot-icon {
          font-size: 16px;
          position: absolute;
          animation: drive 3s infinite linear;
          transform: translateY(-8px);
        }
        @keyframes drive {
          0% { left: 5%; }
          100% { left: 90%; }
        }

        /* Ticket Meta Grid */
        .ticket-meta-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          background: rgba(255, 255, 255, 0.01);
          border: 1px solid rgba(255, 255, 255, 0.03);
          border-radius: 16px;
          padding: 16px;
          margin-bottom: 24px;
        }
        .meta-item {
          display: flex;
          flex-direction: column;
        }
        .meta-label {
          font-size: 0.68rem;
          color: #64748b;
          text-transform: uppercase;
          font-weight: 700;
          letter-spacing: 0.5px;
        }
        .meta-val {
          font-weight: 600;
          font-size: 0.88rem;
          color: #e8eaf6;
          margin-top: 4px;
        }

        /* Passenger Grid details */
        .passenger-section-title {
          font-size: 0.76rem;
          font-weight: 700;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .passenger-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 24px;
        }
        .passenger-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          padding: 12px 18px;
        }
        .passenger-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .passenger-badge {
          background: rgba(126, 184, 247, 0.1);
          color: #7eb8f7;
          font-family: 'Space Mono', monospace;
          font-weight: 700;
          font-size: 0.74rem;
          padding: 4px 8px;
          border-radius: 6px;
        }
        .passenger-name {
          font-weight: 600;
          font-size: 0.9rem;
          color: #e8eaf6;
        }
        .passenger-seats {
          text-align: right;
          font-family: 'Space Mono', monospace;
        }
        .status-badge {
          font-size: 0.72rem;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 6px;
        }
        .status-cnf {
          background: rgba(52, 211, 153, 0.12);
          color: #34d399;
          border: 1px solid rgba(52, 211, 153, 0.2);
        }
        .status-wl {
          background: rgba(245, 158, 11, 0.12);
          color: #f59e0b;
          border: 1px solid rgba(245, 158, 11, 0.2);
        }
        .seat-location {
          font-size: 0.72rem;
          color: #94a3b8;
          margin-top: 3px;
        }

        /* CSS Rendered Barcode Graphic */
        .ticket-barcode-section {
          background: rgba(255, 255, 255, 0.02);
          border-top: 1px dashed rgba(255, 255, 255, 0.1);
          padding: 24px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }
        .barcode-lines {
          width: 260px;
          height: 52px;
          background: #e8eaf6;
          display: flex;
          padding: 0 4px;
          align-items: stretch;
          justify-content: space-between;
          border-radius: 4px;
        }
        .barcode-bar {
          background: #0b0f19;
          width: 2px;
        }
        .barcode-bar.w-1 { width: 1px; }
        .barcode-bar.w-3 { width: 3px; }
        .barcode-bar.w-4 { width: 4px; }
        .barcode-bar.space { background: transparent; }

        .data-source-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.7rem;
          color: #475569;
          font-family: 'Space Mono', monospace;
          margin-top: 10px;
          padding: 0 8px;
        }
        .live-tag {
          color: #ef4444;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .sim-tag {
          color: #64748b;
        }
      `}</style>

      {/* Top Header Navbar */}
      <nav className="navbar">
        <Link href="/" className="nav-logo">
          🚄 <span>Smart Rail Finder</span>
        </Link>
        <div className="nav-links">
          <Link href="/" className="nav-btn">
            🔍 Finder
          </Link>
          <Link href="/pnr" className="nav-btn active">
            🎫 PNR Status
          </Link>
        </div>
      </nav>

      {/* Header Intro */}
      <div className="header">
        <h1>PNR Status Board</h1>
        <p>Enter your 10-digit ticket number to check instant real-time boarding status</p>
      </div>

      {/* Input Search card */}
      <div className="card">
        <form onSubmit={handleCheckPnr} className="pnr-form">
          <div className="input-group">
            <label htmlFor="pnr-input">🎫 PNR Number</label>
            <input
              id="pnr-input"
              type="text"
              maxLength="10"
              placeholder="e.g. 4321987650"
              value={pnrNo}
              onChange={(e) => setPnrNo(e.target.value.replace(/\D/g, ''))} // Digits only
            />
          </div>
          <button type="submit" className="btn-check" disabled={loading || pnrNo.trim().length !== 10}>
            {loading ? "Verifying..." : "Check Status ➔"}
          </button>
        </form>
      </div>

      {/* Error Box */}
      {error && (
        <div className="error-box">
          <span>🚫</span>
          <span>{error}</span>
        </div>
      )}

      {/* Loader */}
      {loading && (
        <div className="card loader">
          <div style={{ color: '#7eb8f7', fontWeight: 600, fontSize: '0.94rem' }}>
            🛰️ Establishing secure satellite connection with IRCTC server...
          </div>
          <div className="loader-dots">
            <span /><span /><span />
          </div>
        </div>
      )}

      {/* dynamic PNR ticket output */}
      {result && result.status && result.data && !loading && (
        <>
          <div className="ticket">
            {/* Header info */}
            <div className="ticket-header">
              <div className="ticket-train-info">
                <span className="ticket-train-icon">🚄</span>
                <div>
                  <div className="ticket-train-name">{result.data.trainName}</div>
                  <div className="ticket-train-meta">TRAIN {result.data.trainNo} · CLASS {result.data.classType}</div>
                </div>
              </div>
              <div className="ticket-pnr-badge">
                <div className="ticket-pnr-label">PNR Number</div>
                <div className="ticket-pnr-num">{result.data.pnr}</div>
              </div>
            </div>

            {/* Journey Details */}
            <div className="ticket-body">
              <div className="journey-line">
                <div className="station-node">
                  <div className="station-code">{result.data.from}</div>
                  <div className="station-name">Origin</div>
                </div>
                <div className="rail-track">
                  <span className="train-dot-icon">🚄</span>
                </div>
                <div className="station-node">
                  <div className="station-code">{result.data.to}</div>
                  <div className="station-name">Destination</div>
                </div>
              </div>

              {/* Grid data */}
              <div className="ticket-meta-grid">
                <div className="meta-item">
                  <span className="meta-label">Journey Date</span>
                  <span className="meta-val">{result.data.journeyDate}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Boarding Station</span>
                  <span className="meta-val">{result.data.boarding}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Chart Status</span>
                  <span className="meta-val" style={{ color: result.data.chartPrepared ? '#34d399' : '#f59e0b' }}>
                    {result.data.chartPrepared ? "● PREPARED" : "● NOT PREPARED"}
                  </span>
                </div>
              </div>

              {/* Passengers details list */}
              <div className="passenger-section-title">
                👥 Passenger Allocation
              </div>
              <div className="passenger-list">
                {result.data.passengers.map((p) => {
                  const isCnf = p.bookingStatus.toUpperCase().includes('CNF') || p.bookingStatus.toUpperCase().includes('CONFIRMED');
                  return (
                    <div key={p.number} className="passenger-row">
                      <div className="passenger-info">
                        <span className="passenger-badge">P{p.number}</span>
                        <span className="passenger-name">{p.name || `Passenger ${p.number}`}</span>
                      </div>
                      <div className="passenger-seats">
                        <span className={`status-badge ${isCnf ? 'status-cnf' : 'status-wl'}`}>
                          {p.bookingStatus}
                        </span>
                        {isCnf && (
                          <div className="seat-location">
                            Coach: {p.coach} · Berth: {p.berth}
                          </div>
                        )}
                        {!isCnf && (
                          <div className="seat-location" style={{ color: '#f59e0b' }}>
                            Current: {p.currentStatus}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CSS Barcode Graphic */}
            <div className="ticket-barcode-section">
              <div className="barcode-lines">
                <div className="barcode-bar w-3" />
                <div className="barcode-bar space w-1" />
                <div className="barcode-bar w-1" />
                <div className="barcode-bar space w-3" />
                <div className="barcode-bar w-4" />
                <div className="barcode-bar space w-2" />
                <div className="barcode-bar w-2" />
                <div className="barcode-bar space w-1" />
                <div className="barcode-bar w-3" />
                <div className="barcode-bar space w-2" />
                <div className="barcode-bar w-1" />
                <div className="barcode-bar space w-1" />
                <div className="barcode-bar w-4" />
                <div className="barcode-bar space w-2" />
                <div className="barcode-bar w-2" />
                <div className="barcode-bar space w-2" />
                <div className="barcode-bar w-1" />
                <div className="barcode-bar space w-1" />
                <div className="barcode-bar w-3" />
                <div className="barcode-bar space w-1" />
                <div className="barcode-bar w-4" />
                <div className="barcode-bar space w-3" />
                <div className="barcode-bar w-2" />
              </div>
              <div style={{ fontSize: '0.62rem', color: '#475569', letterSpacing: 3, fontFamily: 'Space Mono, monospace' }}>
                INDIAN RAILWAYS DIGITAL BOARDING PASS
              </div>
            </div>
          </div>

          {/* Data source indicators */}
          <div className="data-source-footer">
            {result.live ? (
              <span className="live-tag">● LIVE REAL-TIME DATA</span>
            ) : (
              <span className="sim-tag">● SIMULATION FALLBACK ACTIVE</span>
            )}
            <span>QUOTA: GENERAL (GN)</span>
          </div>
        </>
      )}
    </div>
  );
}
