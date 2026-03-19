// Vercel Serverless Function — Portfolio Chat API
// Proxies messages to OpenAI GPT-4o-mini with a system prompt about Roman

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages, messageCount } = req.body;

    // Rate limit
    const MAX_MESSAGES = 10;
    if (messageCount > MAX_MESSAGES) {
      return res.status(200).json({
        reply: "Thanks for your curiosity! Let's continue in person — mailtotheroman@gmail.com",
        limitReached: true
      });
    }

    const SYSTEM_PROMPT = `You are a friendly AI assistant on Roman Kryzhanovskyi's portfolio website.
You help visitors learn about Roman's experience, skills, and projects.
Keep responses concise (2-3 sentences max).
Be warm and professional.

About Roman:
[PLACEHOLDER — заполнить информацией о Романе: опыт, навыки, проекты, образование]`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages.slice(-6)
        ],
        max_tokens: 200,
        temperature: 0.7,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({
        error: data.error?.message || 'OpenAI API error'
      });
    }

    const reply = data.choices?.[0]?.message?.content || 'Sorry, something went wrong.';
    return res.status(200).json({ reply });

  } catch (err) {
    return res.status(500).json({ error: 'Internal error: ' + err.message });
  }
}
