const WebSocket = require('ws');

const INDIAN_ROUTES = {
  "Delhi-Mumbai": {
    stations: [
      { name: "New Delhi", time: "16:55", day: 1 },
      { name: "Mathura Junction", time: "18:45", day: 1 },
      { name: "Agra Cantonment", time: "19:20", day: 1 },
      { name: "Gwalior", time: "20:45", day: 1 },
      { name: "Jhansi", time: "22:10", day: 1 },
      { name: "Bhopal", time: "01:15", day: 2 },
      { name: "Itarsi", time: "03:00", day: 2 },
      { name: "Khandwa", time: "04:55", day: 2 },
      { name: "Mumbai Central", time: "08:35", day: 2 },
    ],
  }
};

const wss = new WebSocket.Server({ port: 4000 }, () => {
  console.log('Realtime WS server running on ws://localhost:4000');
});

function randomAvail(i) {
  const r = Math.random();
  if (r < 0.5) return { status: 'AVAILABLE', seats: Math.floor(Math.random() * 50) + 1 };
  if (r < 0.8) return { status: 'RAC', seats: Math.floor(Math.random() * 8) + 1 };
  return { status: 'WL', waitlist: Math.floor(Math.random() * 60) + 1 };
}

function buildSegments() {
  const stations = INDIAN_ROUTES['Delhi-Mumbai'].stations;
  const segments = [];
  for (let i = 0; i < stations.length - 1; i++) {
    segments.push({
      from: stations[i],
      to: stations[i + 1],
      availability: randomAvail(i)
    });
  }
  return segments;
}

function broadcastUpdate() {
  const msg = JSON.stringify({ type: 'updateSegments', segments: buildSegments() });
  wss.clients.forEach((c) => {
    if (c.readyState === WebSocket.OPEN) c.send(msg);
  });
}

wss.on('connection', (ws) => {
  ws.send(JSON.stringify({ type: 'hello', hello: 'welcome' }));
});

setInterval(broadcastUpdate, 5000);
