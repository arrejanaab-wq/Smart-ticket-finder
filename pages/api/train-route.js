import { configure, getTrainInfo } from 'irctc-connect';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { trainNo } = req.body || {};

  if (!trainNo) {
    return res.status(400).json({ error: 'Missing trainNo parameter' });
  }

  const apiKey = 'irctc_1673dd27de28351da10c2b6e891f75f0125dbe76524f1d99';
  configure(apiKey);
  
  const cleanTrainNo = trainNo.toString().replace(/\D/g, ''); // Extract digits only

  console.log(`[irctc-connect] Fetching route for train: ${cleanTrainNo}`);

  try {
    const result = await getTrainInfo(cleanTrainNo);

    if (result.success) {
      // Mapping to frontend format if necessary. 
      // The logged response shows result.data.route is the array.
      const rawStations = result.data.route || result.data.stations || result.data || [];
      const mappedStations = Array.isArray(rawStations) ? rawStations.map(s => ({
        code: s.stnCode || s.station_code || s.code,
        name: s.stnName || s.station_name || s.name,
        time: s.arrival || s.arrival_time || s.time || (s.departure || s.departure_time || '00:00'),
        day: s.day || s.day_count || 1
      })) : [];

      return res.status(200).json({ 
        success: true, 
        stations: mappedStations 
      });
    } else {
      console.error(`[irctc-connect] Route API Error:`, result.message || result.error);
      return res.status(500).json({ error: result.message || 'Failed to fetch train route' });
    }
  } catch (error) {
    console.error(`[irctc-connect] Route Unexpected Error:`, error);
    return res.status(500).json({ error: 'An unexpected error occurred while fetching train route' });
  }
}
