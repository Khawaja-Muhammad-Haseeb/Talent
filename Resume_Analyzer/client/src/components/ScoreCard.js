function getScoreColor(score) {
  if (score <= 4) return "score-red";
  if (score <= 6) return "score-amber";
  if (score <= 8) return "score-blue";
  return "score-green";
}

function ScoreCard({ report }) {
  return (
    <section className="card score-card">
      <h2>{report.name || "Unknown"}</h2>
      <p className="domain">{report.domain || "Unknown Domain"}</p>

      <div className={`score-number ${getScoreColor(report.score)}`}>
        {report.score} <span>/ 10</span>
      </div>

      <span className="experience-badge">{report.experienceLevel || "Unknown"}</span>

      <p className="rationale">{report.scoreRationale}</p>
    </section>
  );
}

export default ScoreCard;
