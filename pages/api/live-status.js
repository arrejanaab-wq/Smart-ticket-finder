import { configure, trackTrain } from 'irctc-connect';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { trainNo, date } = req.body || {};

  if (!trainNo) {
    return res.status(400).json({ error: 'Missing trainNo parameter' });
  }

  const apiKey = 'irctc_1673dd27de28351da10c2b6e891f75f0125dbe76524f1d99';
  configure(apiKey);
  
  const cleanTrainNo = trainNo.toString().replace(/\D/g, ''); 
  
  // Default to today if date not provided
  let formattedDate = date;
  if (!formattedDate) {
    const now = new Date();
    formattedDate = `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`;
  } else if (formattedDate.includes('-') && formattedDate.split('-')[0].length === 4) {
    // YYYY-MM-DD to DD-MM-YYYY
    const parts = formattedDate.split('-');
    formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
  }

  console.log(`[irctc-connect] Fetching live status for train: ${cleanTrainNo} on ${formattedDate}`);

  try {
    const result = await trackTrain(cleanTrainNo, formattedDate);

    if (result.success) {
      // Mapping to frontend format for live-status.jsx
      const rawData = result.data || {};
      const mappedData = {
        trainName: rawData.train_name || 'Train',
        trainNo: rawData.train_no || cleanTrainNo,
        lastUpdate: rawData.last_updated || new Date().toLocaleTimeString(),
        statusNote: rawData.status_note || 'Running on time',
        currentStationCode: rawData.current_station_code || '',
        timeline: (rawData.route || rawData.timeline || []).map(s => ({
          stationName: s.station_name,
          stationCode: s.station_code,
          status: s.has_arrived ? 'passed' : (s.has_departed ? 'passed' : 'upcoming'),
          platform: s.platform_no,
          arrival: {
            actual: s.actual_arrival || s.scheduled_arrival,
            delay: s.arrival_delay || 'On Time'
          },
          departure: {
            actual: s.actual_departure || s.scheduled_departure,
            delay: s.departure_delay || 'On Time'
          }
        }))
      };

      return res.status(200).json({ 
        success: true, 
        data: mappedData 
      });
    } else {
      console.error(`[irctc-connect] Live Status API Error:`, result.message || result.error);
      return res.status(500).json({ error: result.message || 'Failed to fetch live status' });
    }
  } catch (error) {
    console.error(`[irctc-connect] Live Status Unexpected Error:`, error);
    return res.status(500).json({ error: 'An unexpected error occurred while fetching live status' });
  }
}
