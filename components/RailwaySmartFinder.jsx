import { useState } from "react";
import Link from "next/link";

const INDIAN_ROUTES = {
  "Delhi-Mumbai": {
    train: "12951 - Rajdhani Express",
    duration: "15h 35m",
    stations: [
      { code: "NDLS", name: "New Delhi", time: "16:55", day: 1 },
      { code: "MTJ", name: "Mathura Junction", time: "18:45", day: 1 },
      { code: "AGC", name: "Agra Cantonment", time: "19:20", day: 1 },
      { code: "GWL", name: "Gwalior", time: "20:45", day: 1 },
      { code: "JHS", name: "Jhansi", time: "22:10", day: 1 },
      { code: "BPL", name: "Bhopal", time: "01:15", day: 2 },
      { code: "ET", name: "Itarsi", time: "03:00", day: 2 },
      { code: "KNW", name: "Khandwa", time: "04:55", day: 2 },
      { code: "BCT", name: "Mumbai Central", time: "08:35", day: 2 },
    ],
  },
  "Delhi-Chennai": {
    train: "12621 - Tamil Nadu Express",
    duration: "33h 30m",
    stations: [
      { code: "NDLS", name: "New Delhi", time: "22:30", day: 1 },
      { code: "AGC", name: "Agra Cantonment", time: "01:00", day: 2 },
      { code: "JHS", name: "Jhansi", time: "03:40", day: 2 },
      { code: "BPL", name: "Bhopal", time: "07:00", day: 2 },
      { code: "NGP", name: "Nagpur", time: "13:00", day: 2 },
      { code: "BZA", name: "Vijayawada", time: "22:30", day: 2 },
      { code: "MAS", name: "Chennai Central", time: "07:45", day: 3 },
    ],
  },
  "Mumbai-Kolkata": {
    train: "12809 - Mumbai Mail",
    duration: "26h 55m",
    stations: [
      { code: "CSTM", name: "Mumbai CSMT", time: "21:35", day: 1 },
      { code: "KYN", name: "Kalyan", time: "22:30", day: 1 },
      { code: "IGP", name: "Igatpuri", time: "00:15", day: 2 },
      { code: "NGP", name: "Nagpur", time: "08:55", day: 2 },
      { code: "G", name: "Gondia", time: "11:10", day: 2 },
      { code: "R", name: "Raipur", time: "15:30", day: 2 },
      { code: "BSP", name: "Bilaspur", time: "17:10", day: 2 },
      { code: "HWH", name: "Howrah", time: "00:30", day: 3 },
    ],
  },
  "Delhi-Bangalore": {
    train: "12627 - Karnataka Express",
    duration: "40h 45m",
    stations: [
      { code: "NDLS", name: "New Delhi", time: "21:00", day: 1 },
      { code: "JHS", name: "Jhansi", time: "02:10", day: 2 },
      { code: "BPL", name: "Bhopal", time: "05:55", day: 2 },
      { code: "NGP", name: "Nagpur", time: "12:10", day: 2 },
      { code: "SC", name: "Secunderabad", time: "21:30", day: 2 },
      { code: "GTL", name: "Guntakal", time: "02:00", day: 3 },
      { code: "YPR", name: "Yesvantpur", time: "10:05", day: 3 },
      { code: "SBC", name: "KSR Bangalore", time: "10:45", day: 3 },
    ],
  },
};

const CLASS_TYPES = ["SL", "3A", "2A", "1A"];

function generateAvailability(stationIndex, totalStations, classType) {
  const seed = stationIndex * 7 + CLASS_TYPES.indexOf(classType) * 13;
  const rand = (Math.sin(seed) * 10000) % 1;
  const absRand = Math.abs(rand);

  if (classType === "1A") {
    if (absRand < 0.3) return { status: "AVAILABLE", seats: Math.floor(absRand * 20) + 1 };
    if (absRand < 0.55) return { status: "RAC", seats: Math.floor(absRand * 5) + 1 };
    return { status: "WL", waitlist: Math.floor(absRand * 30) + 1 };
  }
  if (classType === "2A") {
    if (absRand < 0.35) return { status: "AVAILABLE", seats: Math.floor(absRand * 30) + 2 };
    if (absRand < 0.6) return { status: "RAC", seats: Math.floor(absRand * 8) + 1 };
    return { status: "WL", waitlist: Math.floor(absRand * 50) + 1 };
  }
  if (classType === "3A") {
    if (absRand < 0.4) return { status: "AVAILABLE", seats: Math.floor(absRand * 60) + 5 };
    if (absRand < 0.65) return { status: "RAC", seats: Math.floor(absRand * 10) + 1 };
    return { status: "WL", waitlist: Math.floor(absRand * 80) + 5 };
  }
  // SL
  if (absRand < 0.45) return { status: "AVAILABLE", seats: Math.floor(absRand * 100) + 10 };
  if (absRand < 0.7) return { status: "RAC", seats: Math.floor(absRand * 15) + 1 };
  return { status: "WL", waitlist: Math.floor(absRand * 120) + 10 };
}

function StatusBadge({ avail }) {
  if (avail.status === "AVAILABLE")
    return (
      <span className="badge available">
        ✓ {avail.seats} Avail
      </span>
    );
  if (avail.status === "RAC")
    return (
      <span className="badge rac">
        ◑ RAC {avail.seats}
      </span>
    );
  return (
    <span className="badge wl">
      ✗ WL {avail.waitlist}
    </span>
  );
}

export default function App() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");
  const [selectedClass, setSelectedClass] = useState("3A");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [isLiveMode, setIsLiveMode] = useState(true); // Default to Live Mode

  // Expanded major Indian station codes
  const allStations = [
    "NDLS - New Delhi", 
    "CSMT - Mumbai CSMT", 
    "BCT - Mumbai Central",
    "HWH - Kolkata Howrah", 
    "SBC - KSR Bangalore", 
    "MAS - Chennai Central",
    "PNBE - Patna JN", 
    "LKO - Lucknow Charbagh",
    "ADI - Ahmedabad JN",
    "HYB - Hyderabad JN",
    "AGC - Agra Cantt", 
    "BPL - Bhopal JN", 
    "NGP - Nagpur JN", 
    "SEC - Secunderabad",
    "MTJ - Mathura JN", 
    "GWL - Gwalior JN",
    "JHS - Jhansi JN", 
    "ET - Itarsi JN", 
    "KNW - Khandwa JN", 
    "VGA - Vijayawada JN", 
    "YPR - Yesvantpur JN", 
    "GTL - Guntakal JN",
    "KYN - Kalyan JN", 
    "BSP - Bilaspur JN",
    "R - Raipur JN",
    "G - Gondia JN",
    "IGP - Igatpuri"
  ];

  const [trainList, setTrainList] = useState([]);
  const [selectedTrain, setSelectedTrain] = useState(null);
  const [searchWarning, setSearchWarning] = useState("");
  const [routeLoading, setRouteLoading] = useState(false);

  // Search real trains between station codes
  async function handleSearch() {
    if (!from || !to || !date) return;
    setLoading(true);
    setResult(null);
    setAiSuggestion("");
    setTrainList([]);
    setSelectedTrain(null);
    setSearchWarning("");

    const cleanFrom = from.includes(" - ") ? from.split(" - ")[0].trim() : from.trim();
    const cleanTo = to.includes(" - ") ? to.split(" - ")[0].trim() : to.trim();

    try {
      const response = await fetch('/api/search-trains', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromStationCode: cleanFrom,
          toStationCode: cleanTo
        })
      });

      if (!response.ok) {
        throw new Error("Failed to search trains");
      }

      const data = await response.json();
      
      if (data.warning) {
        setSearchWarning(data.warning);
      }

      if (data.trains && data.trains.length > 0) {
        setTrainList(data.trains);
      } else {
        setResult({ 
          error: true, 
          message: `No trains found running between "${cleanFrom}" and "${cleanTo}". Please verify station codes.` 
        });
      }
    } catch (err) {
      console.error("Search trains error:", err);
      setResult({ 
        error: true, 
        message: "Failed to connect to the train lookup service. Please check your connection." 
      });
    }
    setLoading(false);
  }

  // Load real route of selected train and query segment seat availability in parallel
  async function handleSelectTrain(train) {
    setRouteLoading(true);
    setSelectedTrain(train);
    setAiSuggestion("");
    setResult(null);

    const cleanFrom = from.includes(" - ") ? from.split(" - ")[0].trim().toUpperCase() : from.trim().toUpperCase();
    const cleanTo = to.includes(" - ") ? to.split(" - ")[0].trim().toUpperCase() : to.trim().toUpperCase();

    try {
      // Step 1: Fetch Intermediate Stations Route schedule
      const routeRes = await fetch('/api/train-route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trainNo: train.trainNumber })
      });

      if (!routeRes.ok) throw new Error("Failed to load train route stop schedule");
      const routeData = await routeRes.json();
      
      const stations = routeData.stations;
      
      // Find start and end indices of user's query in the train's stops list
      const fromIdx = stations.findIndex(s => s.code.toUpperCase() === cleanFrom);
      const toIdx = stations.findIndex(s => s.code.toUpperCase() === cleanTo);
      
      const start = fromIdx === -1 ? 0 : fromIdx;
      const end = toIdx === -1 ? stations.length - 1 : toIdx;

      // Step 2: Fetch Live seat availability for every intermediate segment in parallel
      const segmentPromises = [];
      for (let i = start; i < end; i++) {
        const fromStation = stations[i];
        const toStation = stations[i + 1];
        
        const promise = fetch('/api/availability', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            trainNo: train.trainNumber,
            fromCode: fromStation.code,
            toCode: toStation.code,
            date,
            classType: selectedClass
          })
        })
        .then(res => {
          if (!res.ok) throw new Error("API error");
          return res.json();
        })
        .then(data => ({
          from: fromStation,
          to: toStation,
          availability: data.availability || generateAvailability(i + date.charCodeAt(0) % 10, stations.length, selectedClass),
          isLiveResponse: !!data.live
        }))
        .catch(err => {
          console.error("Live segment fetch error:", err);
          const avail = generateAvailability(i + date.charCodeAt(0) % 10, stations.length, selectedClass);
          return {
            from: fromStation,
            to: toStation,
            availability: avail,
            isLiveResponse: false
          };
        });

        segmentPromises.push(promise);
      }

      const resolvedSegments = await Promise.all(segmentPromises);

      const route = {
        train: `${train.trainNumber} - ${train.trainName}`,
        duration: train.duration
      };

      setResult({ route, segments: resolvedSegments, stations, start, end, date });

      // Step 3: Trigger AI Travel Advice proxy call
      setAiLoading(true);
      try {
        const response = await fetch('/api/ai-suggestion', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            from: cleanFrom, 
            to: cleanTo, 
            date, 
            selectedClass, 
            route, 
            segments: resolvedSegments 
          }),
        });
        const data = await response.json();
        setAiSuggestion(data.suggestion || data.error || 'We could not generate an AI suggestion right now.');
      } catch (e) {
        setAiSuggestion('We could not generate an AI suggestion right now.');
      }
      setAiLoading(false);

    } catch (error) {
      console.error("Error setting up train route schedule:", error);
      setResult({ 
        error: true, 
        message: "Failed to map intermediate station schedules for this train. Please try again." 
      });
    }
    setRouteLoading(false);
  }

  const originBlocked =
    result && !result.error && result.segments[0]?.availability.status === "WL";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Sora:wght@300;400;600;800&display=swap');

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
          width: 100%;
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

        .train-list-container {
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-height: 480px;
          overflow-y: auto;
          padding-right: 4px;
          margin-top: 14px;
        }
        .train-list-container::-webkit-scrollbar {
          width: 6px;
        }
        .train-list-container::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.1);
          border-radius: 10px;
        }
        .train-card {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 14px;
          padding: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          flex-direction: column;
        }
        .train-card:hover {
          background: rgba(255,255,255,0.05);
          border-color: rgba(126,184,247,0.3);
          transform: translateY(-2px);
        }
        .train-card-main {
          display: flex;
          align-items: center;
          gap: 12px;
          justify-content: space-between;
          width: 100%;
        }
        .train-card-icon {
          font-size: 24px;
          background: rgba(126,184,247,0.06);
          padding: 6px 10px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .train-card-info {
          flex: 1;
          margin-left: 8px;
        }
        .train-card-num {
          font-family: 'Space Mono', monospace;
          font-size: 0.78rem;
          color: #7eb8f7;
          font-weight: 700;
        }
        .train-card-name {
          font-weight: 600;
          font-size: 0.94rem;
          color: #e8eaf6;
          margin-top: 2px;
        }
        .train-card-schedule {
          font-family: 'Space Mono', monospace;
          font-size: 0.84rem;
          color: #e8eaf6;
          text-align: right;
        }
        .train-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 12px;
          padding-top: 10px;
          border-top: 1px solid rgba(255,255,255,0.05);
        }
        .train-card-classes {
          font-size: 0.72rem;
          color: #94a3b8;
          font-family: 'Space Mono', monospace;
        }
        .train-card-btn {
          background: transparent;
          border: none;
          color: #7eb8f7;
          font-size: 0.78rem;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .train-card:hover .train-card-btn {
          color: #a78bfa;
        }
        
        .station-helper-container {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.04);
          border-radius: 10px;
          padding: 8px 12px;
          margin-top: 12px;
          font-size: 0.72rem;
          color: #64748b;
          line-height: 1.5;
        }

        .toggle-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 12px;
          padding: 8px 12px;
          margin-bottom: 18px;
        }
        .toggle-label {
          font-size: 0.72rem;
          font-weight: 700;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-family: 'Space Mono', monospace;
        }
        .toggle-buttons {
          display: flex;
          gap: 6px;
        }
        .toggle-btn {
          background: transparent;
          border: 1px solid rgba(255,255,255,0.08);
          padding: 6px 14px;
          border-radius: 8px;
          color: #94a3b8;
          font-size: 0.78rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: 'Sora', sans-serif;
        }
        .toggle-btn:hover {
          background: rgba(255,255,255,0.05);
          color: #e8eaf6;
        }
        .toggle-btn.active {
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          border-color: transparent;
          color: white;
          box-shadow: 0 0 12px rgba(139,92,246,0.3);
        }
        
        .pulse-live {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 0.68rem;
          background: rgba(239, 68, 68, 0.15);
          color: #ef4444;
          border: 1px solid rgba(239,68,68,0.3);
          padding: 2px 8px;
          border-radius: 20px;
          font-weight: 700;
          font-family: 'Space Mono', monospace;
          margin-left: 10px;
          animation: pulse-dot 1.5s infinite;
        }
        .simulated-label {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 0.68rem;
          background: rgba(100, 116, 139, 0.15);
          color: #94a3b8;
          border: 1px solid rgba(100,116,139,0.3);
          padding: 2px 8px;
          border-radius: 20px;
          font-weight: 700;
          font-family: 'Space Mono', monospace;
          margin-left: 10px;
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: #0a0f1e;
          color: #e8eaf6;
          font-family: 'Sora', sans-serif;
          min-height: 100vh;
        }

        .app {
          min-height: 100vh;
          background: radial-gradient(ellipse at 20% 20%, #0d1b4b 0%, #0a0f1e 60%),
                      radial-gradient(ellipse at 80% 80%, #1a0d3d 0%, transparent 50%);
          padding: 24px 16px 60px;
        }

        .header {
          text-align: center;
          margin-bottom: 36px;
          animation: fadeDown 0.6s ease;
        }

        .header-icon {
          font-size: 48px;
          margin-bottom: 8px;
          display: block;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        .header h1 {
          font-size: clamp(1.6rem, 5vw, 2.4rem);
          font-weight: 800;
          background: linear-gradient(135deg, #7eb8f7, #a78bfa, #f472b6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -0.5px;
        }

        .header p {
          color: #94a3b8;
          font-size: 0.9rem;
          margin-top: 8px;
          font-weight: 300;
        }

        .card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          padding: 24px;
          backdrop-filter: blur(12px);
          margin-bottom: 20px;
          max-width: 680px;
          margin-left: auto;
          margin-right: auto;
        }

        .search-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
          margin-bottom: 14px;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .input-group label {
          font-size: 0.72rem;
          font-weight: 600;
          color: #7eb8f7;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-family: 'Space Mono', monospace;
        }

        .input-group input, .input-group select {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(126,184,247,0.2);
          border-radius: 10px;
          padding: 12px 14px;
          color: #e8eaf6;
          font-size: 0.9rem;
          font-family: 'Sora', sans-serif;
          outline: none;
          transition: border-color 0.2s, background 0.2s;
          width: 100%;
        }

        .input-group input:focus, .input-group select:focus {
          border-color: #7eb8f7;
          background: rgba(126,184,247,0.08);
        }

        .input-group input::placeholder { color: #475569; }
        .input-group select option { background: #1e293b; }

        .search-row {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 14px;
          margin-bottom: 14px;
        }

        .btn-search {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          border: none;
          border-radius: 12px;
          color: white;
          font-size: 1rem;
          font-weight: 700;
          font-family: 'Sora', sans-serif;
          cursor: pointer;
          transition: transform 0.15s, opacity 0.15s;
          letter-spacing: 0.3px;
        }

        .btn-search:hover { transform: translateY(-1px); opacity: 0.92; }
        .btn-search:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

        .chip-row {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 14px;
        }

        .chip {
          background: rgba(126,184,247,0.08);
          border: 1px solid rgba(126,184,247,0.15);
          border-radius: 20px;
          padding: 4px 12px;
          font-size: 0.75rem;
          color: #94a3b8;
          cursor: pointer;
          transition: all 0.15s;
          font-family: 'Space Mono', monospace;
        }

        .chip:hover { background: rgba(126,184,247,0.15); color: #e8eaf6; }

        .loader {
          text-align: center;
          padding: 40px;
          color: #7eb8f7;
          font-size: 0.9rem;
          animation: fadeIn 0.3s ease;
        }

        .loader-dots {
          display: inline-flex;
          gap: 6px;
          margin-top: 14px;
        }

        .loader-dots span {
          width: 8px; height: 8px;
          background: #7eb8f7;
          border-radius: 50%;
          animation: bounce 0.9s infinite;
        }

        .loader-dots span:nth-child(2) { animation-delay: 0.15s; }
        .loader-dots span:nth-child(3) { animation-delay: 0.3s; }

        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-8px); opacity: 1; }
        }

        .train-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
          padding-bottom: 16px;
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }

        .train-icon {
          width: 44px; height: 44px;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          flex-shrink: 0;
        }

        .train-name {
          font-weight: 700;
          font-size: 1rem;
          color: #e8eaf6;
        }

        .train-meta {
          font-size: 0.78rem;
          color: #64748b;
          font-family: 'Space Mono', monospace;
          margin-top: 2px;
        }

        .alert {
          display: flex;
          gap: 12px;
          padding: 14px 16px;
          border-radius: 12px;
          margin-bottom: 20px;
          font-size: 0.85rem;
          line-height: 1.5;
          animation: fadeIn 0.4s ease;
        }

        .alert.warning {
          background: rgba(251,191,36,0.08);
          border: 1px solid rgba(251,191,36,0.2);
          color: #fde68a;
        }

        .alert.success {
          background: rgba(52,211,153,0.08);
          border: 1px solid rgba(52,211,153,0.2);
          color: #a7f3d0;
        }

        .alert-icon { font-size: 1.2rem; flex-shrink: 0; margin-top: 1px; }

        .timeline {
          position: relative;
          padding-left: 20px;
        }

        .timeline::before {
          content: '';
          position: absolute;
          left: 8px; top: 20px; bottom: 20px;
          width: 2px;
          background: linear-gradient(to bottom, #3b82f6, #8b5cf6, #f472b6);
          border-radius: 2px;
        }

        .segment {
          position: relative;
          margin-bottom: 12px;
          animation: slideIn 0.3s ease both;
        }

        .segment:nth-child(1) { animation-delay: 0.05s; }
        .segment:nth-child(2) { animation-delay: 0.1s; }
        .segment:nth-child(3) { animation-delay: 0.15s; }
        .segment:nth-child(4) { animation-delay: 0.2s; }
        .segment:nth-child(5) { animation-delay: 0.25s; }

        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }

        .segment-dot {
          position: absolute;
          left: -16px;
          top: 14px;
          width: 10px; height: 10px;
          border-radius: 50%;
          border: 2px solid;
          background: #0a0f1e;
        }

        .segment-dot.available { border-color: #34d399; }
        .segment-dot.rac { border-color: #fbbf24; }
        .segment-dot.wl { border-color: #f87171; }

        .segment-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 12px;
          padding: 12px 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          transition: background 0.15s;
        }

        .segment-card:hover { background: rgba(255,255,255,0.06); }

        .segment-card.highlighted {
          border-color: rgba(52,211,153,0.3);
          background: rgba(52,211,153,0.05);
        }

        .seg-stations {
          flex: 1;
          min-width: 0;
        }

        .seg-from {
          font-size: 0.88rem;
          font-weight: 600;
          color: #e2e8f0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .seg-arrow {
          font-size: 0.72rem;
          color: #475569;
          margin: 2px 0;
        }

        .seg-to {
          font-size: 0.78rem;
          color: #64748b;
        }

        .seg-time {
          font-family: 'Space Mono', monospace;
          font-size: 0.72rem;
          color: #7eb8f7;
          text-align: right;
          flex-shrink: 0;
        }

        .best-tag {
          background: linear-gradient(135deg, #059669, #34d399);
          color: #ecfdf5;
          font-size: 0.65rem;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 20px;
          font-family: 'Space Mono', monospace;
          letter-spacing: 0.5px;
          flex-shrink: 0;
        }

        .badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 10px;
          border-radius: 8px;
          font-size: 0.72rem;
          font-weight: 600;
          font-family: 'Space Mono', monospace;
          flex-shrink: 0;
        }

        .badge.available {
          background: rgba(52,211,153,0.12);
          color: #34d399;
          border: 1px solid rgba(52,211,153,0.2);
        }

        .badge.rac {
          background: rgba(251,191,36,0.12);
          color: #fbbf24;
          border: 1px solid rgba(251,191,36,0.2);
        }

        .badge.wl {
          background: rgba(248,113,113,0.12);
          color: #f87171;
          border: 1px solid rgba(248,113,113,0.2);
        }

        .ai-box {
          background: linear-gradient(135deg, rgba(59,130,246,0.08), rgba(139,92,246,0.08));
          border: 1px solid rgba(139,92,246,0.2);
          border-radius: 14px;
          padding: 16px;
          margin-top: 20px;
          animation: fadeIn 0.5s ease;
        }

        .ai-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 10px;
          font-size: 0.78rem;
          font-weight: 700;
          color: #a78bfa;
          font-family: 'Space Mono', monospace;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .ai-text {
          font-size: 0.87rem;
          line-height: 1.65;
          color: #cbd5e1;
        }

        .legend {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
          font-size: 0.72rem;
          color: #64748b;
          font-family: 'Space Mono', monospace;
          margin-bottom: 16px;
        }

        .legend-item { display: flex; align-items: center; gap: 5px; }
        .legend-dot { width: 8px; height: 8px; border-radius: 50%; }
        .legend-dot.g { background: #34d399; }
        .legend-dot.y { background: #fbbf24; }
        .legend-dot.r { background: #f87171; }

        .error-box {
          text-align: center;
          padding: 40px 20px;
          color: #64748b;
        }

        .error-box h3 { color: #94a3b8; margin-bottom: 8px; font-size: 1rem; }
        .error-box p { font-size: 0.85rem; line-height: 1.6; }

        @keyframes fadeDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .section-title {
          font-size: 0.72rem;
          font-weight: 700;
          color: #7eb8f7;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          font-family: 'Space Mono', monospace;
          margin-bottom: 16px;
        }

        @media (max-width: 480px) {
          .search-grid { grid-template-columns: 1fr; }
          .search-row { grid-template-columns: 1fr 1fr; }
          .seg-from { font-size: 0.82rem; }
        }
      `}</style>

      <div className="app">
        {/* Top Navigation Header Navbar */}
        <nav className="navbar">
          <Link href="/" className="nav-logo">
            🚄 <span>Smart Rail Finder</span>
          </Link>
          <div className="nav-links">
            <Link href="/" className="nav-btn active">
              🔍 Finder
            </Link>
            <Link href="/pnr" className="nav-btn">
              🎫 PNR Status
            </Link>
            <Link href="/live-status" className="nav-btn">
              📡 Live Tracking
            </Link>
          </div>
        </nav>

        <div className="header">
          <span className="header-icon">🚆</span>
          <h1>Smart Rail Finder</h1>
          <p>Find tickets across your entire route — never miss your journey</p>
        </div>

        <div className="card">
          <div className="toggle-container">
            <span className="toggle-label">Data Source</span>
            <div className="toggle-buttons">
              <button 
                className={`toggle-btn ${!isLiveMode ? 'active' : ''}`}
                onClick={() => setIsLiveMode(false)}
              >
                🤖 Simulated
              </button>
              <button 
                className={`toggle-btn ${isLiveMode ? 'active' : ''}`}
                onClick={() => setIsLiveMode(true)}
              >
                ⚡ Live IRCTC API
              </button>
            </div>
          </div>

          <div className="search-grid">
            <div className="input-group">
              <label>🚉 From Station Code</label>
              <input
                type="text"
                placeholder="e.g. NDLS"
                value={from}
                onChange={(e) => setFrom(e.target.value.toUpperCase())}
                list="stations"
              />
            </div>
            <div className="input-group">
              <label>🏁 To Station Code</label>
              <input
                type="text"
                placeholder="e.g. CSMT"
                value={to}
                onChange={(e) => setTo(e.target.value.toUpperCase())}
                list="stations"
              />
            </div>
          </div>

          <datalist id="stations">
            {allStations.map((s) => <option key={s} value={s} />)}
          </datalist>

          <div className="station-helper-container">
            💡 <strong>Quick Code Tips:</strong> NDLS = Delhi · CSMT/BCT = Mumbai · HWH = Kolkata · SBC = Bangalore · MAS = Chennai · PNBE = Patna
          </div>

          <div className="search-row">
            <div className="input-group">
              <label>📅 Date</label>
              <input
                type="date"
                value={date}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="input-group">
              <label>💺 Class</label>
              <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
                <option value="SL">Sleeper (SL)</option>
                <option value="3A">3rd AC (3A)</option>
                <option value="2A">2nd AC (2A)</option>
                <option value="1A">1st AC (1A)</option>
              </select>
            </div>
            <div className="input-group">
              <label>&nbsp;</label>
              <button
                className="btn-search"
                onClick={handleSearch}
                disabled={loading || !from || !to || !date}
              >
                {loading ? "Searching..." : "🔍 Search"}
              </button>
            </div>
          </div>

          <div className="chip-row">
            <span style={{ fontSize: "0.72rem", color: "#475569", alignSelf: "center" }}>Try Codes:</span>
            {[["NDLS", "CSMT"], ["NDLS", "HWH"], ["PNBE", "NDLS"], ["NDLS", "SBC"]].map(([f, t]) => (
              <span key={f + t} className="chip" onClick={() => { setFrom(f); setTo(t); }}>
                {f} → {t}
              </span>
            ))}
          </div>
        </div>

        {loading && (
          <div className="card loader">
            <div>🔍 Searching real trains on route...</div>
            <div className="loader-dots">
              <span /><span /><span />
            </div>
          </div>
        )}

        {routeLoading && (
          <div className="card loader">
            <div>🚄 Fetching route stop schedules & checking live seat availabilities...</div>
            <div className="loader-dots">
              <span /><span /><span />
            </div>
          </div>
        )}

        {/* Train Selector list card */}
        {trainList.length > 0 && !result && !loading && !routeLoading && (
          <div className="card" style={{ animation: "fadeIn 0.4s ease" }}>
            <div className="section-title">Available Trains Found ({trainList.length})</div>
            {searchWarning && (
              <div className="alert warning" style={{ marginBottom: 16 }}>
                <span className="alert-icon">⚠️</span>
                <span>{searchWarning}</span>
              </div>
            )}
            <div className="train-list-container">
              {trainList.map((train, i) => (
                <div key={i} className="train-card" onClick={() => handleSelectTrain(train)}>
                  <div className="train-card-main">
                    <span className="train-card-icon">🚄</span>
                    <div className="train-card-info">
                      <div className="train-card-num">{train.trainNumber}</div>
                      <div className="train-card-name">{train.trainName}</div>
                    </div>
                    <div className="train-card-schedule">
                      <div>{train.departureTime} → {train.arrivalTime}</div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', textAlign: 'right', marginTop: 2 }}>{train.duration}</div>
                    </div>
                  </div>
                  <div className="train-card-footer">
                    <span className="train-card-classes">Classes: {train.classes.join(', ')}</span>
                    <button className="train-card-btn">Select & Check Seats ➔</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {result && !loading && !routeLoading && (
          <div className="card" style={{ animation: "fadeIn 0.4s ease" }}>
            {result.error ? (
              <div className="error-box">
                <h3>🚫 Search Failed</h3>
                <p>
                  {result.message || "No trains found. Please check station codes and try again."}
                </p>
                {trainList.length === 0 && (
                  <button 
                    className="btn-search" 
                    style={{ marginTop: 16, maxWidth: 200, marginInline: 'auto' }}
                    onClick={() => { setFrom(""); setTo(""); setResult(null); }}
                  >
                    Reset Form
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="train-header">
                  <div className="train-icon">🚄</div>
                  <div>
                    <div className="train-name" style={{ display: 'flex', alignItems: 'center' }}>
                      {result.route.train}
                      {result.segments.some(s => s.isLiveResponse) ? (
                        <span className="pulse-live">● LIVE API</span>
                      ) : (
                        <span className="simulated-label">● SIMULATED</span>
                      )}
                    </div>
                    <div className="train-meta">
                      {result.segments[0]?.from.name} → {result.segments[result.segments.length - 1]?.to.name}
                      &nbsp;·&nbsp;{result.route.duration}&nbsp;·&nbsp;{selectedClass}&nbsp;·&nbsp;{result.date}
                    </div>
                  </div>
                </div>

                {originBlocked && (
                  <div className="alert warning">
                    <span className="alert-icon">⚠️</span>
                    <span>
                      <strong>Origin is Waitlisted.</strong> Scroll below to find the nearest available boarding station on your route.
                    </span>
                  </div>
                )}

                {!originBlocked && result.segments[0]?.availability.status === "AVAILABLE" && (
                  <div className="alert success">
                    <span className="alert-icon">✅</span>
                    <span>
                      <strong>Tickets available from your origin!</strong> You can book directly from {result.segments[0].from.name}.
                    </span>
                  </div>
                )}

                <div className="legend">
                  <span className="legend-item"><span className="legend-dot g" /> Available</span>
                  <span className="legend-item"><span className="legend-dot y" /> RAC</span>
                  <span className="legend-item"><span className="legend-dot r" /> Waitlist</span>
                </div>

                <div className="section-title">Route Segment Availability</div>

                <div className="timeline">
                  {result.segments.map((seg, i) => {
                    const isFirst = i === 0;
                    const availStatus = seg.availability?.status || "WL";
                    const isFirstAvail = originBlocked &&
                      availStatus === "AVAILABLE" &&
                      result.segments.slice(0, i).every((s) => (s.availability?.status || "WL") !== "AVAILABLE");
                    const dotClass = availStatus === "AVAILABLE" ? "available"
                      : availStatus === "RAC" ? "rac" : "wl";

                    return (
                      <div key={i} className="segment">
                        <div className={`segment-dot ${dotClass}`} />
                        <div className={`segment-card ${isFirstAvail ? "highlighted" : ""}`}>
                          <div className="seg-stations">
                            <div className="seg-from">
                              {isFirstAvail && "⭐ "}{seg.from.name}
                              {isFirst && <span style={{ fontSize: "0.68rem", color: "#3b82f6", marginLeft: 6 }}>ORIGIN</span>}
                            </div>
                            <div className="seg-arrow">↓</div>
                            <div className="seg-to">{seg.to.name}</div>
                          </div>
                          <div className="seg-time">
                            {seg.from.time} D{seg.from.day}
                            <br />→ {seg.to.time} D{seg.to.day}
                          </div>
                          <StatusBadge avail={seg.availability || { status: 'WL', waitlist: 0 }} />
                          {isFirstAvail && <span className="best-tag">BOARD HERE</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {(aiSuggestion || aiLoading) && (
                  <div className="ai-box">
                    <div className="ai-header">
                      <span>🤖</span> AI Travel Advisor
                    </div>
                    {aiLoading ? (
                      <div style={{ color: "#64748b", fontSize: "0.84rem" }}>
                        Generating smart suggestion...
                        <div className="loader-dots" style={{ marginTop: 8 }}>
                          <span /><span /><span />
                        </div>
                      </div>
                    ) : (
                      <div className="ai-text">{aiSuggestion}</div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}
