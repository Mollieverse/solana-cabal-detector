const HELIUS_API_KEY = process.env.HELIUS_API_KEY;
const GROQ_API_KEY = process.env.GROQ_API_KEY;

async function getWalletTransactions(walletAddress) {
  const url = `https://api.helius.xyz/v0/addresses/${walletAddress}/transactions?api-key=${HELIUS_API_KEY}&limit=50`;
  const res = await fetch(url);
  const data = await res.json();
  return data;
}

async function getWalletTokens(walletAddress) {
  const url = `https://api.helius.xyz/v0/addresses/${walletAddress}/balances?api-key=${HELIUS_API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  return data;
}

async function getAIAnalysis(walletData, tokenData, walletAddress) {
  const topTokens = tokenData?.tokens?.slice(0, 10).map(t => ({
    mint: t.mint,
    amount: t.amount,
  })) || [];

  const recentTxs = walletData?.slice(0, 20).map(tx => ({
    type: tx.type,
    timestamp: tx.timestamp,
    source: tx.source,
    fee: tx.fee,
  })) || [];

  const prompt = `You are an expert Solana blockchain analyst. Analyze this wallet and respond in EXACTLY this format:

Degen Score: [0-100]
Risk Level: [Low/Medium/High/Extreme]
Cabal Connection: [None/Weak/Moderate/Strong]
Insider Score: [0-100]
Trading Pattern: [one line description]
Biggest Red Flag: [one line]
Roast: [2-3 savage but funny sentences roasting their trading behavior]
Alpha Advice: [2-3 sentences of genuine advice to improve]
Verdict: [one powerful closing sentence]

Wallet: ${walletAddress}
Recent transactions: ${JSON.stringify(recentTxs)}
Token holdings: ${JSON.stringify(topTokens)}

Be savage with the roast but educational with the advice.`;

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: "llama3-70b-8192",
      messages: [
        {
          role: "system",
          content: "You are a savage but educational Solana blockchain analyst. You roast wallets based on their on-chain behavior but always provide genuine value."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 1024,
      temperature: 0.7,
    })
  });

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { walletAddress } = req.body;

  if (!walletAddress) {
    return res.status(400).json({ error: "Wallet address required" });
  }

  try {
    const [txData, tokenData] = await Promise.all([
      getWalletTransactions(walletAddress),
      getWalletTokens(walletAddress),
    ]);

    if (!txData || txData.error) {
      return res.status(400).json({ error: "Invalid wallet address or no data found" });
    }

    const analysis = await getAIAnalysis(txData, tokenData, walletAddress);

    return res.status(200).json({
      result: analysis,
      txCount: txData.length || 0,
      tokenCount: tokenData?.tokens?.length || 0,
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
