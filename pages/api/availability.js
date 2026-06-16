import { configure, getAvailability } from 'irctc-connect';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { trainNo, fromCode, toCode, date, classType } = req.body || {};

  if (!trainNo || !fromCode || !toCode || !date || !classType) {
    return res.status(400).json({ error: 'Missing required parameters: trainNo, fromCode, toCode, date, classType' });
  }

  const apiKey = 'irctc_1673dd27de28351da10c2b6e891f75f0125dbe76524f1d99';
  configure(apiKey);
  
  // Normalize date format from YYYY-MM-DD to DD-MM-YYYY if needed
  let formattedDate = date;
  if (date.includes('-')) {
    const parts = date.split('-');
    if (parts[0].length === 4) { // YYYY-MM-DD
      formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
  }

  console.log(`[irctc-connect] Checking availability for ${trainNo} on ${formattedDate} (${classType})...`);

  try {
    // irctc-connect: getAvailability(trainNo, from, to, date, coach, quota)
    // Defaulting quota to 'GN' (General) if not provided
    const result = await getAvailability(trainNo, fromCode, toCode, formattedDate, classType, 'GN');

    if (result.success) {
      // result.data.availability is an array of dates
      const availabilityArray = result.data.availability || [];
      const requestedDate = formattedDate; // DD-MM-YYYY

      // Try to find the exact date or default to the first one
      const availData = availabilityArray.find(a => a.date === requestedDate) || availabilityArray[0] || {};
      
      let status = 'WL';
      let seats = 0;
      let waitlist = 0;

      const availText = (availData.availabilityText || availData.status || '').toUpperCase();
      
      if (availText.includes('AVL') || availText.includes('AVAILABLE')) {
        status = 'AVAILABLE';
        // Extract number from "AVL 103" or "AVAILABLE-0103"
        const match = availText.match(/\d+/);
        seats = match ? parseInt(match[0]) : 0;
      } else if (availText.includes('RAC')) {
        status = 'RAC';
        const match = availText.match(/\d+/);
        seats = match ? parseInt(match[0]) : 0;
      } else if (availText.includes('WL') || availText.includes('WAITLIST')) {
        status = 'WL';
        const match = availText.match(/\d+/);
        waitlist = match ? parseInt(match[0]) : 0;
      }

      return res.status(200).json({ 
        success: true, 
        availability: { status, seats, waitlist },
        live: true
      });
    } else {
      console.error(`[irctc-connect] Availability API Error:`, result.message || result.error);
      return res.status(500).json({ error: result.message || 'Failed to fetch availability' });
    }
  } catch (error) {
    console.error(`[irctc-connect] Availability Unexpected Error:`, error);
    return res.status(500).json({ error: 'An unexpected error occurred while fetching availability' });
  }
}
