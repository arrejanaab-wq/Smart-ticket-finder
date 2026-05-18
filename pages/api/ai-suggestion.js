export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { from, to, date, selectedClass, route, segments } = req.body || {};

  if (!from || !to || !date || !selectedClass || !route || !segments) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const prompt = `
You are a helpful Indian Railway travel assistant. A traveler wants to go from "${from}" to "${to}" on ${date} in ${selectedClass} class.

Train: ${route.train}

Segment availability from origin:
- Origin segment (${segments[0]?.from.name} → ${segments[0]?.to.name}): ${segments[0]?.availability.status}${segments[0]?.availability.status === 'WL' ? ' WL' + segments[0]?.availability.waitlist : segments[0]?.availability.status === 'RAC' ? ' RAC' + segments[0]?.availability.seats : ' (' + segments[0]?.availability.seats + ' seats)'}

${segments.filter((s) => s.availability.status === 'AVAILABLE').length > 0
      ? `Available boarding alternatives: ${segments.filter((s) => s.availability.status === 'AVAILABLE').map((s) => `${s.from.name} (${s.from.time})`).join(', ')}`
      : 'No segments have confirmed availability.'}

Give a short, practical travel advice (3-4 sentences) suggesting the smartest booking strategy. Include which station to board from if origin is unavailable, and any tip about the journey. Be warm and helpful like a friend. Mention Indian Railway terminology naturally (RAC, WL, IRCTC, etc.).
  `;

  const apiKey = process.env.ANTHROPIC_API_KEY || '9b4afd95eamsh346f30e65302ca7p1d0e60jsnc035c6e8985d';

  const fallbackSuggestion = `If your origin segment is waitlisted, board from the first available station instead and keep checking IRCTC for cancellations. Use RAC as a practical backup if confirmed availability is not showing yet. Travel light, keep your tickets and PNR handy, and choose a safe boarding point on the route. This advice works even without the AI service.`;

  async function sendAnthropic() {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(body || 'AI service error');
    }

    const data = await response.json();
    return data.content?.filter((b) => b.type === 'text').map((b) => b.text).join('') || '';
  }

  if (!apiKey) {
    return res.status(200).json({ suggestion: fallbackSuggestion });
  }

  try {
    const text = await sendAnthropic();
    return res.status(200).json({ suggestion: text.trim() || fallbackSuggestion });
  } catch (error) {
    return res.status(200).json({ suggestion: fallbackSuggestion });
  }
}
