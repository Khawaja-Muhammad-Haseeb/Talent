function levelStyle(level) {
  if (level === "Professional") return { background: "#f5f3ff", color: "#5925dc", borderColor: "#d9d6fe" };
  if (level === "Intermediate") return { background: "#eff8ff", color: "#175cd3", borderColor: "#b2ddff" };
  return { background: "#ecfdf3", color: "#067647", borderColor: "#abefc6" };
}

function CertificateCard({ credential }) {
  if (!credential) return null;
  const projects = (credential.notableProjects || []).slice(0, 3);
  const levelBadge = levelStyle(credential.level);

  return (
    <section
      id="certificate-card"
      style={{
        background: "#fff",
        border: "1.5px solid #BA7517",
        borderRadius: 14,
        padding: 24,
        position: "relative"
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: 40,
          height: 40,
          background: "#f9d39f",
          borderTopRightRadius: 12,
          borderBottomLeftRadius: 40
        }}
      />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 12, letterSpacing: 1.2, color: "#475467" }}>TALENTMAP PROTOCOL</span>
        <span style={{ color: "#BA7517", fontSize: 20 }}>◈</span>
      </div>
      <hr style={{ borderColor: "#f2f4f7", margin: "14px 0" }} />

      <div style={{ textAlign: "center" }}>
        <h2 style={{ margin: "8px 0" }}>Certificate of Verified Skill</h2>
        <span
          style={{
            ...levelBadge,
            border: `1px solid ${levelBadge.borderColor}`,
            borderRadius: 999,
            padding: "6px 12px",
            fontWeight: 700
          }}
        >
          {String(credential.level || "").toUpperCase()}
        </span>
      </div>

      <hr style={{ borderColor: "#f2f4f7", margin: "16px 0" }} />

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 20 }}>
        <div>
          <small style={{ color: "#667085" }}>ISSUED TO</small>
          <h3 style={{ margin: "6px 0" }}>{credential.name}</h3>
          <p className="domain">{credential.domain}</p>
          <p style={{ lineHeight: 1.6 }}>{credential.certificateSummary}</p>
        </div>
        <div>
          <div style={{ fontSize: 36, fontWeight: 700, color: "#1f2937" }}>{credential.finalScore} / 10</div>
          <ul className="bullet-list" style={{ marginTop: 10 }}>
            <li>Resume: {credential.resumeScore}/10</li>
            <li>GitHub: {credential.githubScore}/10</li>
            <li>Challenge: {credential.challengeScore}/10</li>
          </ul>
        </div>
      </div>

      <div style={{ marginTop: 14 }}>
        <small style={{ color: "#667085" }}>VERIFIED SKILLS</small>
        <div className="skill-tags">
          {(credential.topSkills || []).map((skill) => (
            <span key={skill} className="skill-pill">
              {skill}
            </span>
          ))}
        </div>
      </div>

      {projects.length ? (
        <div style={{ marginTop: 14 }}>
          <small style={{ color: "#667085" }}>NOTABLE PROJECTS</small>
          <ul className="bullet-list">
            {projects.map((project) => (
              <li key={project.name}>
                <a href={project.url} target="_blank" rel="noreferrer">
                  {project.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div style={{ marginTop: 14 }}>
        <small style={{ color: "#667085" }}>CHALLENGE COMPLETED</small>
        <p style={{ margin: "6px 0" }}>
          {credential.challengeCompleted?.title} ({credential.challengeCompleted?.domain} /{" "}
          {credential.challengeCompleted?.difficulty}) - Score {credential.challengeCompleted?.score}/10
        </p>
      </div>

      <hr style={{ borderColor: "#f2f4f7", margin: "16px 0" }} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, fontSize: 13 }}>
        <div>
          <strong>Credential ID</strong>
          <div style={{ fontFamily: "Consolas, monospace" }}>{credential.credentialId}</div>
        </div>
        <div>
          <strong>Validity</strong>
          <div>
            {credential.issuedDate} - {credential.expiryDate}
          </div>
        </div>
        <div>
          <strong>Anchor</strong>
          <div>Anchored on IPFS · W3C Verifiable Credential</div>
        </div>
      </div>
      <div style={{ marginTop: 10, fontFamily: "Consolas, monospace", fontSize: 11, color: "#667085" }}>
        {credential.ipfsHash || "IPFS hash unavailable"}
      </div>
    </section>
  );
}

export default CertificateCard;
