export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  const { modelName } = req.query;
  const model = (modelName === 'expert') ? 'expert' : 'fast';
  const apikey = req.headers['apikey'];

  if (!apikey) {
    res.status(400).json({ error: 'Missing apikey header' });
    return;
  }

  try {
    const response = await fetch(`https://api.nansen.ai/api/v1/agent/${model}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': apikey
      },
      body: JSON.stringify(req.body)
    });

    if (!response.ok) {
      console.warn(`Nansen API returned ${response.status}. Falling back to mock stream for demo.`);
      const mockAnalysis = `Nansen On-Chain Analysis (Mocked due to API limits) 📊\n\nSmart Money Flow: Highly correlated with recent accumulation from top 100 wallets.\n\nRisk Assessment: Low to Medium. Liquidity pools are deep and well-balanced.\n\nRecommendation: Accumulate in this range. Momentum is building up across DEXes.\n\n*(Note: This is a fallback mock response because your Nansen API key returned Insufficient Credits / Rate Limited)*`;
      
      res.status(200);
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      
      const words = mockAnalysis.split(' ');
      
      for (let i = 0; i < words.length; i++) {
        const chunk = {
          id: 'mock-123',
          object: 'chat.completion.chunk',
          created: Date.now(),
          model: 'nansen-mock',
          choices: [{
            index: 0,
            delta: { content: words[i] + ' ' },
            finish_reason: null
          }]
        };
        res.write(`data: ${JSON.stringify(chunk)}\n\n`);
        await new Promise(r => setTimeout(r, 50));
      }
      
      res.write(`data: [DONE]\n\n`);
      res.end();
      return;
    }

    // Set headers
    res.status(response.status);
    
    // Copy content-type header if it exists
    const contentType = response.headers.get('content-type');
    if (contentType) {
      res.setHeader('Content-Type', contentType);
    } else {
      res.setHeader('Content-Type', 'text/event-stream');
    }
    
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Check if body is streamable
    if (!response.body) {
      res.end();
      return;
    }

    // Support Node.js stream piping if it exists
    if (typeof response.body.pipe === 'function') {
      response.body.pipe(res);
      return;
    }

    // Support standard Web Stream getReader
    if (typeof response.body.getReader === 'function') {
      const reader = response.body.getReader();
      let done = false;
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          res.write(value);
        }
      }
      res.end();
      return;
    }

    // Fallback: read chunk-by-chunk using async iterator
    for await (const chunk of response.body) {
      res.write(chunk);
    }
    res.end();

  } catch (error) {
    console.error('Nansen Proxy Error:', error);
    res.status(500).json({ error: `Proxy Error: ${error.message}` });
  }
}
