export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { trainNo } = req.body || {};

  if (!trainNo) {
    return res.status(400).json({ error: 'Missing trainNo parameter' });
  }

  const apiKey = '9b4afd95eamsh346f30e65302ca7p1d0e60jsnc035c6e8985d';
  const cleanTrainNo = trainNo.toString().replace(/\D/g, ''); // Extract digits only

  // RapidAPI Multi-Host Proxy Chain for maximum compatibility
  const hosts = [
    { name: 'irctc-indian-railway.p.rapidapi.com', path: `/api/v1/getRoute?trainNo=${cleanTrainNo}` },
    { name: 'indian-railway-irctc.p.rapidapi.com', path: `/api/v1/getRoute?trainNo=${cleanTrainNo}` },
    { name: 'indianrailways.p.rapidapi.com', path: `/index.php?action=getRoute&trainNo=${cleanTrainNo}` }
  ];

  console.log(`[API Proxy] Fetching real route details for Train ${cleanTrainNo}...`);

  let data = null;
  let successHost = '';

  for (const host of hosts) {
    try {
      console.log(`[API Proxy] Attempting route fetch on host: ${host.name}...`);
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
        console.log(`[API Proxy] Route connection SUCCESS on host: ${host.name}`);
        break; // Stop trying other hosts
      } else {
        console.warn(`[API Proxy] Route Host ${host.name} returned status code: ${apiResponse.status}`);
      }
    } catch (error) {
      console.error(`[API Proxy] Error trying route host ${host.name}:`, error.message);
    }
  }

  // Parse stations route from whichever host succeeded
  if (data && data.status && data.data) {
    const rawRoute = Array.isArray(data.data.route) ? data.data.route : (data.route || []);
    if (rawRoute.length > 0) {
      const formattedRoute = rawRoute.map(station => ({
        code: station.station_code || station.stationCode || station.code || '',
        name: station.station_name || station.stationName || station.name || '',
        time: station.scheduled_departure || station.scheduled_arrival || station.departure_time || '--:--',
        day: parseInt(station.day || '1', 10),
      }));

      console.log(`[API Proxy] Route success! Loaded ${formattedRoute.length} stops via ${successHost}.`);
      return res.status(200).json({ status: true, live: true, stations: formattedRoute });
    }
  }

  // Resilient offline/limit fallback: Generate 5-7 realistic intermediate stations
  console.warn(`[API Proxy] Route fetch failed or empty. Generating realistic intermediate stations dynamically.`);
  
  const seed = parseInt(cleanTrainNo, 10) || 12345;
  const stationCodes = ['NDLS', 'MTJ', 'AGC', 'GWL', 'JHS', 'BPL', 'ET', 'KNW', 'BSL', 'KYN', 'CSMT'];
  const stationNames = [
    'New Delhi', 'Mathura JN', 'Agra Cantt', 'Gwalior JN', 
    'Jhansi JN', 'Bhopal JN', 'Itarsi JN', 'Khandwa JN', 
    'Bhusaval JN', 'Kalyan JN', 'Mumbai CSMT'
  ];

  const totalStops = 5 + (seed % 3); // 5 to 7 stops
  const dynamicStations = [];

  for (let i = 0; i < totalStops; i++) {
    const index = Math.floor((i / (totalStops - 1)) * (stationCodes.length - 1));
    dynamicStations.push({
      code: stationCodes[index],
      name: stationNames[index],
      time: `${String(8 + i * 2).padStart(2, '0')}:${String((i * 15) % 60).padStart(2, '0')}`,
      day: i > 4 ? 2 : 1,
    });
  }

  return res.status(200).json({ 
    status: true, 
    live: false, 
    stations: dynamicStations,
    warning: 'Mock route generated (API Limit Reached or Subscriptions Unresolved)' 
  });
}
