import { configure, checkPNRStatus } from 'irctc-connect';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { pnrNo } = req.body || {};

  if (!pnrNo || pnrNo.toString().trim().length !== 10) {
    return res.status(400).json({ error: 'Please enter a valid 10-digit PNR number' });
  }

  const apiKey = 'irctc_1673dd27de28351da10c2b6e891f75f0125dbe76524f1d99';
  configure(apiKey);
  
  const cleanPnr = pnrNo.toString().trim();

  console.log(`[irctc-connect] Checking PNR status for: ${cleanPnr}`);

  try {
    const result = await checkPNRStatus(cleanPnr);

    if (result.success) {
      // Return the data directly as it's already well-structured
      return res.status(200).json({ 
        success: true, 
        data: result.data 
      });
    } else {
      console.error(`[irctc-connect] PNR API Error:`, result.message || result.error);
      return res.status(500).json({ error: result.message || 'Failed to fetch PNR status' });
    }
  } catch (error) {
    console.error(`[irctc-connect] PNR Unexpected Error:`, error);
    return res.status(500).json({ error: 'An unexpected error occurred while checking PNR' });
  }
}
