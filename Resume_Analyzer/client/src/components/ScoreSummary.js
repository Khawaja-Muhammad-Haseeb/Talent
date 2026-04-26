function weightedPercent(score, weightPercent) {
  return `${Math.max(0, Math.min(100, (score / 10) * weightPercent))}%`;
}

function badgeColor(level) {
  if (level === "Professional") return { background: "#f5f3ff", color: "#5925dc", borderColor: "#d9d6fe" };
  if (level === "Intermediate") return { background: "#eff8ff", color: "#175cd3", borderColor: "#b2ddff" };
  return { background: "#ecfdf3", color: "#067647", borderColor: "#abefc6" };
}

function ScoreSummary({ scoreData }) {
  if (!scoreData) return null;
  const level = scoreData.level || "N/A";

  return (
    <section className="card">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
        <div className="link-card">
          <strong>Resume Analysis</strong>
          <p>{scoreData.resumeScore}/10 - weight 20%</p>
        </div>
        <div className="link-card">
          <strong>GitHub Scan</strong>
          <p>{scoreData.githubScore}/10 - weight 30%</p>
        </div>
        <div className="link-card">
          <strong>Domain Challenge</strong>
          <p>{scoreData.challengeScore}/10 - weight 50%</p>
        </div>
      </div>

      <div style={{ marginTop: 14 }}>
        <div style={{ fontSize: 34, fontWeight: 700 }}>{scoreData.finalScore} / 10</div>
        <span
          className="experience-badge"
          style={{ ...badgeColor(level), borderStyle: "solid", borderWidth: 1 }}
        >
          {level}
        </span>
      </div>

      <div style={{ marginTop: 12 }}>
        <div style={{ marginBottom: 8 }}>
          <small>Resume contribution</small>
          <div style={{ background: "#f2f4f7", borderRadius: 999, height: 10 }}>
            <div
              style={{
                width: weightedPercent(scoreData.resumeScore, 20),
                height: "100%",
                borderRadius: 999,
                background: "#22c55e"
              }}
            />
          </div>
        </div>
        <div style={{ marginBottom: 8 }}>
          <small>GitHub contribution</small>
          <div style={{ background: "#f2f4f7", borderRadius: 999, height: 10 }}>
            <div
              style={{
                width: weightedPercent(scoreData.githubScore, 30),
                height: "100%",
                borderRadius: 999,
                background: "#3b82f6"
              }}
            />
          </div>
        </div>
        <div>
          <small>Challenge contribution</small>
          <div style={{ background: "#f2f4f7", borderRadius: 999, height: 10 }}>
            <div
              style={{
                width: weightedPercent(scoreData.challengeScore, 50),
                height: "100%",
                borderRadius: 999,
                background: "#7c3aed"
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default ScoreSummary;
