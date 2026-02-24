import { useState } from "react";

export default function Home() {
  const [wallet, setWallet] = useState("");
  const [result, setResult] = useState("");
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const analyze = async () => {
    if (!wallet.trim()) {
      setError("Please enter a wallet address");
      return;
    }
    setLoading(true);
    setError("");
    setResult("");
    setStats(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress: wallet.trim() }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data.result);
      setStats({ txCount: data.txCount, tokenCount: data.tokenCount });
    } catch (err) {
      setError(err.message || "Analysis failed. Please try again.");
    }
    setLoading(false);
  };

  const lines = result.split("\n").filter(l => l.trim());

  const getValue = (keyword) => {
    const idx = lines.findIndex(l => l.toLowerCase().includes(keyword.toLowerCase()));
    if (idx === -1) return null;
    const firstLine = lines[idx].split(":").slice(1).join(":").trim();
    const extraLines = [];
    for (let i = idx + 1; i < lines.length; i++) {
      if (lines[i].includes(":")) break;
      extraLines.push(lines[i].trim());
    }
    return [firstLine, ...extraLines].filter(Boolean).join(" ");
  };

  const degenScore = getValue("degen score");
  const riskLevel = getValue("risk level");
  const cabalConnection = getValue("cabal connection");
  const insiderScore = getValue("insider score");
  const tradingPattern = getValue("trading pattern");
  const redFlag = getValue("biggest red flag");
  const roast = getValue("roast");
  const advice = getValue("alpha advice");
  const verdict = getValue("verdict");

  const scoreNum = parseInt(degenScore) || 0;
  const insiderNum = parseInt(insiderScore) || 0;

  const getDegenColor = (score) => {
    if (score < 30) return "#00e5a0";
    if (score < 60) return "#f5c542";
    if (score < 80) return "#ff9900";
    return "#ff4d6d";
  };

  const getCabalColor = (level) => {
    if (!level) return "#5a6070";
    if (level.toLowerCase().includes("none")) return "#00e5a0";
    if (level.toLowerCase().includes("weak")) return "#f5c542";
    if (level.toLowerCase().includes("moderate")) return "#ff9900";
    return "#ff4d6d";
  };

  const degenColor = getDegenColor(scoreNum);
  const cabalColor = getCabalColor(cabalConnection);

  return (
    <div style={s.app}>
      <div style={s.container}>

        <div style={s.header}>
          <div style={s.badge}>👁 SOLANA INTELLIGENCE SYSTEM</div>
          <h1 style={s.title}>Cabal<br /><span style={{ color: "#9945ff" }}>Detector</span></h1>
          <p style={s.subtitle}>Paste any Solana wallet. Expose their cabal connections, degen score and insider activity.</p>
        </div>

        <div style={s.card}>
          <div style={s.sectionLabel}>▸ Wallet Analysis</div>
          <div style={{ marginBottom: 14 }}>
            <div style={s.label}>Solana Wallet Address</div>
            <input
              value={wallet}
              onChange={e => setWallet(e.target.value)}
              placeholder="Enter any Solana wallet address..."
              style={s.input}
            />
          </div>
          <button onClick={analyze} disabled={loading} style={{ ...s.btn, background: loading ? "#5a6070" : "#9945ff" }}>
            {loading ? "Analyzing Wallet..." : "Expose This Wallet →"}
          </button>
          {error && <div style={s.errorBox}>⚠ {error}</div>}
        </div>

        {loading && (
          <div style={s.card}>
            <div style={s.loadingWrap}>
              <div style={{ ...s.spinner, borderTopColor: "#9945ff" }} />
              <div style={{ fontSize: 11, letterSpacing: 3, color: "#5a6070" }}>SCANNING BLOCKCHAIN...</div>
              <div style={{ fontSize: 10, color: "#5a6070", marginTop: 8 }}>Checking cabal connections, insider activity and degen behavior</div>
            </div>
          </div>
        )}

        {stats && !loading && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            <div style={{ ...s.card, textAlign: "center", padding: 16 }}>
              <div style={s.label}>Transactions Analyzed</div>
              <div style={{ fontSize: 32, fontWeight: 800, color: "#9945ff" }}>{stats.txCount}</div>
            </div>
            <div style={{ ...s.card, textAlign: "center", padding: 16 }}>
              <div style={s.label}>Tokens Held</div>
              <div style={{ fontSize: 32, fontWeight: 800, color: "#9945ff" }}>{stats.tokenCount}</div>
            </div>
          </div>
        )}

        {result && !loading && (
          <>
            <div style={s.card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
                <div>
                  <div style={s.label}>Degen Score</div>
                  <div style={{ fontSize: 64, fontWeight: 900, color: degenColor, lineHeight: 1 }}>
                    {degenScore || "—"}
                    <span style={{ fontSize: 20, color: "#5a6070" }}>/100</span>
                  </div>
                  <div style={{ height: 4, background: "#1e2330", marginTop: 8, width: 140 }}>
                    <div style={{ height: "100%", width: `${scoreNum}%`, background: degenColor, transition: "width 1s ease" }} />
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={s.label}>Insider Score</div>
                  <div style={{ fontSize: 64, fontWeight: 900, color: cabalColor, lineHeight: 1 }}>
                    {insiderScore || "—"}
                    <span style={{ fontSize: 20, color: "#5a6070" }}>/100</span>
                  </div>
                  <div style={{ height: 4, background: "#1e2330", marginTop: 8, width: 140, marginLeft: "auto" }}>
                    <div style={{ height: "100%", width: `${insiderNum}%`, background: cabalColor, transition: "width 1s ease" }} />
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
                <div style={s.metricBox}>
                  <div style={s.metricName}>Risk Level</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: degenColor }}>{riskLevel || "—"}</div>
                </div>
                <div style={s.metricBox}>
                  <div style={s.metricName}>Cabal Connection</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: cabalColor }}>{cabalConnection || "—"}</div>
                </div>
              </div>

              {tradingPattern && (
                <div style={{ marginBottom: 16 }}>
                  <div style={s.metricName}>Trading Pattern</div>
                  <div style={{ fontSize: 12, color: "#b0b8c8", marginTop: 4 }}>{tradingPattern}</div>
                </div>
              )}

              {redFlag && (
                <div style={{ background: "rgba(255,77,109,0.08)", border: "1px solid rgba(255,77,109,0.2)", padding: "12px 16px", marginBottom: 16 }}>
                  <div style={s.metricName}>🚩 Biggest Red Flag</div>
                  <div style={{ fontSize: 12, color: "#ff4d6d", marginTop: 4 }}>{redFlag}</div>
                </div>
              )}
            </div>

            {roast && (
              <div style={{ ...s.card, borderColor: "#9945ff" }}>
                <div style={{ fontSize: 10, letterSpacing: 3, color: "#9945ff", marginBottom: 12 }}>🔥 THE ROAST</div>
                <div style={{ fontSize: 14, lineHeight: 1.9, color: "#e8ecf0", fontStyle: "italic" }}>"{roast}"</div>
              </div>
            )}

            {advice && (
              <div style={{ ...s.card, borderColor: "#00e5a0" }}>
                <div style={{ fontSize: 10, letterSpacing: 3, color: "#00e5a0", marginBottom: 12 }}>💡 ALPHA ADVICE</div>
                <div style={{ fontSize: 13, lineHeight: 1.85, color: "#b0b8c8" }}>{advice}</div>
              </div>
            )}

            {verdict && (
              <div style={{ background: "#9945ff", padding: "20px 24px", textAlign: "center" }}>
                <div style={{ fontSize: 10, letterSpacing: 3, color: "rgba(255,255,255,0.6)", marginBottom: 8 }}>FINAL VERDICT</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "white", lineHeight: 1.6 }}>{verdict}</div>
              </div>
            )}
          </>
        )}

      </div>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0a0c0f; }
        input::placeholder { color: #3a4050; }
        input:focus { outline: none; border-color: #9945ff !important; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

const s = {
  app: { minHeight: "100vh", background: "#0a0c0f", padding: "36px 16px 80px", fontFamily: "'DM Mono', monospace", color: "#e8ecf0" },
  container: { maxWidth: 700, margin: "0 auto" },
  header: { textAlign: "center", marginBottom: 40 },
  badge: { display: "inline-block", border: "1px solid #9945ff", color: "#9945ff", fontSize: 10, letterSpacing: 3, padding: "4px 14px", textTransform: "uppercase", marginBottom: 18 },
  title: { fontSize: "clamp(34px, 8vw, 60px)", fontWeight: 900, lineHeight: 1.05, letterSpacing: -2, color: "#e8ecf0" },
  subtitle: { marginTop: 12, fontSize: 12, color: "#5a6070", lineHeight: 1.7 },
  card: { background: "#111318", border: "1px solid #1e2330", padding: "24px 20px", marginBottom: 16 },
  sectionLabel: { fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "#9945ff", marginBottom: 20 },
  label: { fontSize: 9, letterSpacing: 2, textTransform: "uppercase", color: "#5a6070", marginBottom: 6 },
  input: { width: "100%", background: "#0a0c0f", border: "1px solid #1e2330", color: "#e8ecf0", fontFamily: "'DM Mono', monospace", fontSize: 13, padding: "13px 16px" },
  btn: { width: "100%", padding: 16, color: "white", border: "none", fontSize: 14, fontWeight: 800, letterSpacing: 1, textTransform: "uppercase", cursor: "pointer", marginTop: 8 },
  errorBox: { background: "rgba(255,77,109,0.1)", border: "1px solid rgba(255,77,109,0.3)", color: "#ff4d6d", padding: "12px 16px", fontSize: 12, marginTop: 12 },
  loadingWrap: { textAlign: "center", padding: "32px 0" },
  spinner: { width: 28, height: 28, border: "2px solid #1e2330", borderTopColor: "#9945ff", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" },
  metricBox: { background: "#0a0c0f", border: "1px solid #1e2330", padding: "14px 12px" },
  metricName: { fontSize: 8, letterSpacing: 2, textTransform: "uppercase", color: "#5a6070", marginBottom: 6 },
};
