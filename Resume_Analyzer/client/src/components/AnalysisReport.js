import SkillTags from "./SkillTags";

function AnalysisReport({ report }) {
  return (
    <section className="card analysis-report">
      <section>
        <h3>Summary</h3>
        <p>{report.summary}</p>
      </section>

      <section>
        <h3>Strong Points</h3>
        <ul className="bullet-list">
          {(report.strongPoints || []).map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section>
        <h3>Top Skills</h3>
        <SkillTags skills={report.topSkills || []} />
      </section>

      <section>
        <h3>Verified Links</h3>
        <div className="link-cards">
          {(report.verifiedLinks || []).map((link) => (
            <article key={link.url} className="link-card">
              <a href={link.url} target="_blank" rel="noreferrer">
                {link.url}
              </a>
              <div className="link-meta">
                <span className="type-badge">{link.type}</span>
                <span className={link.verified ? "verified" : "unverified"}>
                  {link.verified ? "Verified" : "Unverified"}
                </span>
              </div>
              <p>{link.summary}</p>
            </article>
          ))}
        </div>
      </section>

      {(report.redFlags || []).length ? (
        <section className="warning-section">
          <h3>Red Flags</h3>
          <ul className="bullet-list">
            {report.redFlags.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* <button
        className="continue-btn"
        onClick={() => {
          console.log("nextStageContext", report.nextStageContext);
        }}
      >
        Continue to GitHub Analysis →
      </button> */}
    </section>
  );
}

export default AnalysisReport;
