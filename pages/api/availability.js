export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { trainNo, fromCode, toCode, date, classType } = req.body || {};

  if (!trainNo || !fromCode || !toCode || !date || !classType) {
    return res.status(400).json({ error: 'Missing required parameters: trainNo, fromCode, toCode, date, classType' });
  }

  const apiKey = '9b4afd95eamsh346f30e65302ca7p1d0e60jsnc035c6e8985d';
  
  // Normalize date format from YYYY-MM-DD to DD-MM-YYYY (IRCTC default)
  let formattedDate = date;
  if (date.includes('-')) {
    const parts = date.split('-');
    if (parts[0].length === 4) { // YYYY-MM-DD
      formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
  }

  const cleanTrainNo = trainNo.toString().replace(/\D/g, ''); // Extract digits only
  const cleanFrom = fromCode.trim().toUpperCase();
  const cleanTo = toCode.trim().toUpperCase();

  // RapidAPI Multi-Host Proxy Chain for maximum compatibility
  const hosts = [
    { name: 'irctc-indian-railway.p.rapidapi.com', path: `/api/v1/checkSeatAvailability?classType=${classType}&fromStationCode=${cleanFrom}&toStationCode=${cleanTo}&date=${formattedDate}&trainNo=${cleanTrainNo}&quota=GN` },
    { name: 'indian-railway-irctc.p.rapidapi.com', path: `/api/v1/checkSeatAvailability?classType=${classType}&fromStationCode=${cleanFrom}&toStationCode=${cleanTo}&date=${formattedDate}&trainNo=${cleanTrainNo}&quota=GN` },
    { name: 'indianrailways.p.rapidapi.com', path: `/index.php?action=checkSeatAvailability&classType=${classType}&fromStationCode=${cleanFrom}&toStationCode=${cleanTo}&date=${formattedDate}&trainNo=${cleanTrainNo}&quota=GN` }
  ];

  console.log(`[API Proxy] Querying live IRCTC availability for Train ${cleanTrainNo} from ${cleanFrom} to ${cleanTo} on ${formattedDate}...`);

  let data = null;
  let successHost = '';

  for (const host of hosts) {
    try {
      console.log(`[API Proxy] Attempting availability fetch on host: ${host.name}...`);
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
        console.log(`[API Proxy] Availability connection SUCCESS on host: ${host.name}`);
        break; // Stop trying other hosts
      } else {
        console.warn(`[API Proxy] Availability Host ${host.name} returned status code: ${apiResponse.status}`);
      }
    } catch (error) {
      console.error(`[API Proxy] Error trying availability host ${host.name}:`, error.message);
    }
  }

  // Parse availability details from whichever host succeeded
  if (data && data.status) {
    const rawData = Array.isArray(data.data) ? data.data : (data.availability || []);
    if (rawData.length > 0) {
      const liveItem = rawData[0];
      const statusStr = (liveItem.current_status || liveItem.status || liveItem.availability || '').toUpperCase();
      
      let availability = { status: 'WL', waitlist: 10 }; // Default fallback

      if (statusStr.includes('AVAILABLE') || statusStr.includes('CURR_AVBL') || statusStr.includes('AVBL')) {
        const seatsMatch = statusStr.match(/\d+/);
        availability = {
          status: 'AVAILABLE',
          seats: seatsMatch ? parseInt(seatsMatch[0], 10) : 12
        };
      } else if (statusStr.includes('RAC')) {
        const seatsMatch = statusStr.match(/\d+/);
        availability = {
          status: 'RAC',
          seats: seatsMatch ? parseInt(seatsMatch[0], 10) : 6
        };
      } else if (statusStr.includes('WL') || statusStr.includes('WAITLIST') || statusStr.includes('REGRET')) {
        const wlMatch = statusStr.match(/\d+/);
        availability = {
          status: 'WL',
          waitlist: wlMatch ? parseInt(wlMatch[0], 10) : 18
        };
      }

      console.log(`[API Proxy] Success! Live Status for ${cleanFrom}->${cleanTo} via ${successHost}:`, availability);
      return res.status(200).json({ live: true, availability });
    }
  }

  // Resilient offline/limit fallback: Dynamic parameter-matched simulation
  console.warn(`[API Proxy] Availability fetch failed or empty. Serving parameter-matched simulation fallback.`);
  
  const seed = cleanFrom.charCodeAt(0) + cleanTo.charCodeAt(0) + classType.charCodeAt(0);
  const rand = Math.abs(Math.sin(seed) * 1000) % 1;

  let fallbackAvail = { status: 'WL', waitlist: Math.floor(rand * 45) + 2 };
  if (rand > 0.6) {
    fallbackAvail = { status: 'AVAILABLE', seats: Math.floor(rand * 30) + 3 };
  } else if (rand > 0.42) {
    fallbackAvail = { status: 'RAC', seats: Math.floor(rand * 6) + 1 };
  }

  return res.status(200).json({ 
    live: false, 
    availability: fallbackAvail,
    warning: 'Mock availability generated (API Limit Reached or Subscriptions Unresolved)' 
  });
}
