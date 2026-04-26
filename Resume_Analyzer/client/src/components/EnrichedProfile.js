import RepoCard from "./RepoCard";
import ProfileComparison from "./ProfileComparison";

function scoreBannerStyle(resumeScore, combinedScore) {
  if (combinedScore > resumeScore) {
    return { background: "#ecfdf3", border: "1px solid #abefc6", color: "#067647" };
  }
  if (combinedScore < resumeScore) {
    return { background: "#fffaeb", border: "1px solid #fedf89", color: "#b54708" };
  }
  return { background: "#eff8ff", border: "1px solid #b2ddff", color: "#175cd3" };
}

function consistencyStyle(level) {
  if (level === "High") return { background: "#ecfdf3", color: "#067647", borderColor: "#abefc6" };
  if (level === "Medium") return { background: "#fffaeb", color: "#b54708", borderColor: "#fedf89" };
  return { background: "#fef3f2", color: "#b42318", borderColor: "#fecdca" };
}

function EnrichedProfile({ stage1, result, onContinue }) {
  const profile = result?.enrichedProfile || {};
  const githubData = result?.githubData || {};
  const resumeScore = profile.resumeScore ?? stage1?.score ?? 0;
  const combinedScore = profile.combinedScore ?? resumeScore;

  return (
    <section style={{ marginTop: 16 }}>
      <section className="card" style={scoreBannerStyle(resumeScore, combinedScore)}>
        <div style={{ fontWeight: 700, fontSize: 20 }}>
          {resumeScore} → {combinedScore}
        </div>
        <p style={{ margin: "8px 0 0" }}>{profile.scoreChangeReason}</p>
      </section>

      <section className="card">
        <h2 style={{ marginTop: 0 }}>{profile.name}</h2>
        <p className="domain">{profile.domain}</p>
        <div className="score-number score-blue">
          {combinedScore} <span>/ 10</span>
        </div>
        <span className="experience-badge">{profile.experienceLevel}</span>
        <p>{profile.updatedSummary}</p>
        <span
          className="experience-badge"
          style={{ ...consistencyStyle(profile.profileConsistency), borderStyle: "solid", borderWidth: 1 }}
        >
          {profile.profileConsistency} Consistency
        </span>
        <p style={{ marginTop: 8 }}>{profile.consistencyNote}</p>
      </section>

      <section className="card">
        <h3 style={{ marginTop: 0 }}>Updated Strong Points</h3>
        <ul className="bullet-list">
          {(profile.updatedStrongPoints || []).map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
        {(profile.newDiscoveries || []).length ? (
          <div className="warning-section" style={{ marginTop: 12 }}>
            <strong>Newly discovered from GitHub/Portfolio</strong>
            <ul className="bullet-list">
              {profile.newDiscoveries.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

      {Object.keys(githubData.language_breakdown || {}).length ? (
        <section className="card">
          <h3 style={{ marginTop: 0 }}>Language Breakdown</h3>
          {Object.entries(githubData.language_breakdown).map(([lang, percent], index) => (
            <div key={lang} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span>{lang}</span>
                <span>{percent}%</span>
              </div>
              <div style={{ background: "#f2f4f7", borderRadius: 8, overflow: "hidden", height: 10 }}>
                <div
                  style={{
                    height: "100%",
                    width: `${percent}%`,
                    background: ["#1d4ed8", "#16a34a", "#9333ea", "#ea580c", "#0f766e"][index % 5]
                  }}
                />
              </div>
            </div>
          ))}
        </section>
      ) : null}

      <section className="card">
        <h3 style={{ marginTop: 0 }}>Notable Projects</h3>
        <div className="link-cards">
          {(profile.notableProjects || []).map((project) => (
            <RepoCard key={`${project.name}-${project.url}`} project={project} />
          ))}
        </div>
      </section>

      <section className="card">
        <h3 style={{ marginTop: 0 }}>Activity Insight</h3>
        <p>{profile.activityInsight}</p>
        <span className="experience-badge">{githubData.activity_level || "Unknown"} Activity</span>
      </section>

      <ProfileComparison
        resumeSkills={stage1?.topSkills || []}
        githubLanguages={profile.topLanguages || []}
      />

      <section className="card">
        <h3 style={{ marginTop: 0 }}>Stage 3 Preview</h3>
        <p>Recommended challenge domain: {profile.recommendedChallengeDomain}</p>
        <button className="continue-btn" onClick={() => onContinue(profile)}>
          Continue to Challenge →
        </button>
      </section>
    </section>
  );
}

export default EnrichedProfile;
