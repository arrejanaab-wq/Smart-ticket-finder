import { configure, searchTrainBetweenStations } from 'irctc-connect';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { fromStationCode, toStationCode } = req.body || {};

  if (!fromStationCode || !toStationCode) {
    return res.status(400).json({ error: 'Missing fromStationCode or toStationCode' });
  }

  const apiKey = 'irctc_1673dd27de28351da10c2b6e891f75f0125dbe76524f1d99';
  configure(apiKey);
  
  const cleanFrom = fromStationCode.trim().toUpperCase();
  const cleanTo = toStationCode.trim().toUpperCase();

  console.log(`[irctc-connect] Searching trains between ${cleanFrom} and ${cleanTo}...`);

  try {
    const result = await searchTrainBetweenStations(cleanFrom, cleanTo);

    if (result.success) {
      // Mapping irctc-connect format to the frontend's expected format
      const mappedTrains = (result.data || []).map(t => ({
        trainNumber: t.train_no,
        trainName: t.train_name,
        fromStation: t.from_stn_code,
        toStation: t.to_stn_code,
        departureTime: t.from_time,
        arrivalTime: t.to_time,
        duration: t.duration,
        classes: t.classes || ["SL", "3A", "2A", "1A"], // Defaulting if not present
        runningDays: t.running_days
      }));

      return res.status(200).json({ 
        success: true, 
        trains: mappedTrains 
      });
    } else {
      console.error(`[irctc-connect] API Error:`, result.message || result.error);
      return res.status(500).json({ error: result.message || 'Failed to fetch trains' });
    }
  } catch (error) {
    console.error(`[irctc-connect] Unexpected Error:`, error);
    return res.status(500).json({ error: 'An unexpected error occurred while searching trains' });
  }
}
