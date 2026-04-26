import { useState } from "react";

function difficultyColors(level) {
  if (level === "Beginner") return { background: "#ecfdf3", borderColor: "#abefc6", color: "#067647" };
  if (level === "Professional") return { background: "#f5f3ff", borderColor: "#d9d6fe", color: "#5925dc" };
  return { background: "#eff8ff", borderColor: "#b2ddff", color: "#175cd3" };
}

function ChallengeCard({ challenge }) {
  const [showHints, setShowHints] = useState(false);
  const levelStyle = difficultyColors(challenge?.difficulty);

  return (
    <section className="card">
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
        <span className="skill-pill">{challenge?.domain}</span>
        <span className="skill-pill" style={{ ...levelStyle, borderWidth: 1, borderStyle: "solid" }}>
          {challenge?.difficulty}
        </span>
        <span className="skill-pill">{challenge?.type}</span>
        <span className="skill-pill">{challenge?.estimatedMinutes} min</span>
      </div>

      <h2 style={{ marginTop: 0 }}>{challenge?.title}</h2>
      <p style={{ lineHeight: 1.7 }}>{challenge?.problemStatement}</p>

      <h3>Requirements</h3>
      <ol className="bullet-list">
        {(challenge?.requirements || []).map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ol>

      <div className="warning-section" style={{ marginTop: 14 }}>
        <strong>Real-world scenario</strong>
        <p style={{ marginBottom: 0 }}>{challenge?.exampleScenario}</p>
      </div>

      <h3 style={{ marginTop: 18 }}>You will be evaluated on</h3>
      <ul className="bullet-list">
        {(challenge?.evaluationCriteria || []).map((item) => (
          <li key={item}>☑ {item}</li>
        ))}
      </ul>

      <button className="analyze-btn" onClick={() => setShowHints((prev) => !prev)}>
        {showHints ? "Hide hints" : "Show hints"}
      </button>
      {showHints ? (
        <div style={{ marginTop: 10 }}>
          <strong>Hints - only reveal if stuck</strong>
          <ul className="bullet-list">
            {(challenge?.hints || []).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <p style={{ marginTop: 14, color: "#475467" }}>{challenge?.languageNote}</p>
    </section>
  );
}

export default ChallengeCard;
