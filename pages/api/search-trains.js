export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { fromStationCode, toStationCode } = req.body || {};

  if (!fromStationCode || !toStationCode) {
    return res.status(400).json({ error: 'Missing fromStationCode or toStationCode' });
  }

  const apiKey = '9b4afd95eamsh346f30e65302ca7p1d0e60jsnc035c6e8985d';
  
  const cleanFrom = fromStationCode.trim().toUpperCase();
  const cleanTo = toStationCode.trim().toUpperCase();

  // RapidAPI Multi-Host Proxy Chain for maximum compatibility
  const hosts = [
    { name: 'irctc-indian-railway.p.rapidapi.com', path: `/api/v1/searchTrain?fromStationCode=${cleanFrom}&toStationCode=${cleanTo}` },
    { name: 'indian-railway-irctc.p.rapidapi.com', path: `/api/v1/searchTrain?fromStationCode=${cleanFrom}&toStationCode=${cleanTo}` },
    { name: 'indianrailways.p.rapidapi.com', path: `/index.php?action=searchTrain&fromStationCode=${cleanFrom}&toStationCode=${cleanTo}` }
  ];

  console.log(`[API Proxy] Searching real trains between ${cleanFrom} and ${cleanTo}...`);

  let data = null;
  let successHost = '';

  for (const host of hosts) {
    try {
      console.log(`[API Proxy] Attempting connection to host: ${host.name}...`);
      const apiResponse = await fetch(`https://${host.name}${host.path}`, {
        method: 'GET',
        headers: {
          'x-rapidapi-key': apiKey,
          'x-rapidapi-host': host.name
        }
      });

      if (apiResponse.ok) {
        data = await apiResponse.json();
        successHost = host.name;
        console.log(`[API Proxy] Connection SUCCESS on host: ${host.name}`);
        break; // Stop trying other hosts
      } else {
        console.warn(`[API Proxy] Host ${host.name} returned status code: ${apiResponse.status}`);
      }
    } catch (error) {
      console.error(`[API Proxy] Error trying host ${host.name}:`, error.message);
    }
  }

  // Parse response from whichever host succeeded
  if (data && data.status) {
    const rawTrains = Array.isArray(data.data) ? data.data : (data.trains || []);
    const formattedTrains = rawTrains.map(train => ({
      trainNumber: train.train_number || train.train_no || train.trainNumber || '',
      trainName: train.train_name || train.trainName || '',
      fromStation: train.from_station_name || train.from_station_code || cleanFrom,
      toStation: train.to_station_name || train.to_station_code || cleanTo,
      duration: train.duration || train.travel_time || '12h 00m',
      classes: train.classes || ['SL', '3A', '2A', '1A'],
      departureTime: train.departure_time || train.from_sta_time || '--:--',
      arrivalTime: train.arrival_time || train.to_sta_time || '--:--',
    }));

    console.log(`[API Proxy] Success! Found ${formattedTrains.length} real trains via ${successHost}.`);
    return res.status(200).json({ status: true, live: true, trains: formattedTrains });
  }

  // Resilient offline/limit fallback in case all API queries fail or returned empty data
  console.warn(`[API Proxy] All RapidAPI queries failed. Serving high-quality simulated dynamic trains.`);
  
  // Generating a beautiful list of mock dynamic trains based on station codes so the user always has data
  const seed = cleanFrom.charCodeAt(0) + cleanTo.charCodeAt(0);
  const totalTrains = (seed % 3) + 2; // 2 to 4 trains
  
  const mockPrefixes = ['Express', 'Superfast', 'Rajdhani', 'Shatabdi', 'Mail'];
  const mockTrains = [];

  for (let i = 0; i < totalTrains; i++) {
    const trainNum = (12000 + (seed * (i + 1)) % 9000).toString();
    const type = mockPrefixes[(seed + i) % mockPrefixes.length];
    
    mockTrains.push({
      trainNumber: trainNum,
      trainName: `${cleanFrom}-${cleanTo} ${type}`,
      fromStation: `${cleanFrom} JN`,
      toStation: `${cleanTo} JN`,
      duration: `${10 + (seed + i) % 15}h ${(seed * (i + 2)) % 60}m`,
      classes: ['SL', '3A', '2A', '1A'],
      departureTime: `${String(8 + i * 4).padStart(2, '0')}:15`,
      arrivalTime: `${String((8 + i * 4 + 14) % 24).padStart(2, '0')}:45`,
    });
  }

  return res.status(200).json({ 
    status: true, 
    live: false, 
    trains: mockTrains, 
    warning: 'Mock fallback triggered (API Limit Reached or Subscriptions Unresolved)' 
  });
}
