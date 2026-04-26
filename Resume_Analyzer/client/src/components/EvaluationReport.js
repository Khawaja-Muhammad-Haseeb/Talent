function scoreColor(score) {
  if (score <= 4) return "#b42318";
  if (score === 5) return "#b54708";
  if (score <= 7) return "#175cd3";
  return "#067647";
}

function bar(total, value, color) {
  const width = `${Math.max(0, Math.min(100, (value / total) * 100))}%`;
  return (
    <div style={{ background: "#f2f4f7", borderRadius: 999, height: 10, overflow: "hidden" }}>
      <div style={{ width, height: "100%", background: color }} />
    </div>
  );
}

function badgeStyle(value) {
  if (value === "Recommended" || value === true) return { background: "#ecfdf3", color: "#067647", borderColor: "#abefc6" };
  if (value === "Borderline" || value === "amber") return { background: "#fffaeb", color: "#b54708", borderColor: "#fedf89" };
  return { background: "#fef3f2", color: "#b42318", borderColor: "#fecdca" };
}

function EvaluationReport({ evaluation }) {
  const score = evaluation?.score ?? 0;
  const breakdown = evaluation?.breakdown || {};
  const pass = !!evaluation?.passed;

  return (
    <section className="card">
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 42, fontWeight: 700, color: scoreColor(score) }}>{score} / 10</div>
        <span className="experience-badge" style={badgeStyle(pass)}>
          {pass ? "Challenge Passed" : "Not Passed"}
        </span>
        <p style={{ fontWeight: 600 }}>{evaluation?.verdict}</p>
        <span
          className="experience-badge"
          style={{ ...badgeStyle(evaluation?.certificationRecommendation), borderWidth: 1, borderStyle: "solid" }}
        >
          {evaluation?.certificationRecommendation}
        </span>
        <p style={{ color: "#475467" }}>{evaluation?.certificationNote}</p>
      </div>

      <h3>Score Breakdown</h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        <div>
          <strong>Problem Understanding</strong>
          <p>{breakdown.problemUnderstanding ?? 0} / 3</p>
          {bar(3, breakdown.problemUnderstanding ?? 0, "#175cd3")}
        </div>
        <div>
          <strong>Solution Correctness</strong>
          <p>{breakdown.solutionCorrectness ?? 0} / 4</p>
          {bar(4, breakdown.solutionCorrectness ?? 0, "#067647")}
        </div>
        <div>
          <strong>Code Quality / Clarity</strong>
          <p>{breakdown.codeQualityOrClarity ?? 0} / 3</p>
          {bar(3, breakdown.codeQualityOrClarity ?? 0, "#b54708")}
        </div>
      </div>

      <h3>Detailed Feedback</h3>
      <div className="warning-section">
        <p style={{ margin: 0 }}>{evaluation?.feedback}</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 14 }}>
        <div>
          <h4>What you did well</h4>
          <ul className="bullet-list">
            {(evaluation?.strongAspects || []).map((item) => (
              <li key={item}>✅ {item}</li>
            ))}
          </ul>
        </div>
        <div>
          <h4>Areas to improve</h4>
          <ul className="bullet-list">
            {(evaluation?.improvements || []).map((item) => (
              <li key={item}>⚠ {item}</li>
            ))}
          </ul>
        </div>
      </div>

      <div style={{ marginTop: 10 }}>
        <span className="experience-badge" style={badgeStyle(evaluation?.levelAppropriate)}>
          {evaluation?.levelAppropriate
            ? "Solution matched expected level"
            : "Solution below expected level"}
        </span>
      </div>
    </section>
  );
}

export default EvaluationReport;
