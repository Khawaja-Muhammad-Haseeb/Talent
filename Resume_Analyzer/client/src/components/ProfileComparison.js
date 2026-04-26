function ProfileComparison({ resumeSkills = [], githubLanguages = [] }) {
  const resumeSet = new Set(resumeSkills.map((item) => item.toLowerCase()));

  return (
    <section className="card">
      <h3 style={{ marginTop: 0 }}>Resume vs GitHub consistency check</h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div>
          <h4 style={{ marginBottom: 8 }}>From Resume</h4>
          {resumeSkills.map((skill) => (
            <div key={skill} className="skill-pill" style={{ marginBottom: 8 }}>
              {skill}
            </div>
          ))}
        </div>
        <div>
          <h4 style={{ marginBottom: 8 }}>From GitHub</h4>
          {githubLanguages.map((lang) => {
            const matched = resumeSet.has(lang.toLowerCase());
            return (
              <div
                key={lang}
                className="skill-pill"
                style={{
                  marginBottom: 8,
                  background: matched ? "#ecfdf3" : "#fffaeb",
                  borderColor: matched ? "#abefc6" : "#fedf89"
                }}
              >
                {lang}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default ProfileComparison;
