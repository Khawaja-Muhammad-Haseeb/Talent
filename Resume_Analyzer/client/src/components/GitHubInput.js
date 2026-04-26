function GitHubInput({
  mode,
  inputValue,
  onChange,
  onSubmit,
  loading,
  error
}) {
  const isGithub = mode === "github";

  return (
    <section className="card">
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        <button
          type="button"
          className="analyze-btn"
          style={{
            marginTop: 0,
            opacity: isGithub ? 1 : 0.75
          }}
          onClick={() => onChange("", "github", true)}
        >
          GitHub Profile
        </button>
        <button
          type="button"
          className="analyze-btn"
          style={{
            marginTop: 0,
            opacity: !isGithub ? 1 : 0.75
          }}
          onClick={() => onChange("", "portfolio", true)}
        >
          Portfolio Website
        </button>
      </div>

      <label style={{ display: "block", fontWeight: 600, marginBottom: 8 }}>
        {isGithub ? "GitHub Username" : "Portfolio URL"}
      </label>
      <input
        value={inputValue}
        onChange={(event) => onChange(event.target.value, mode)}
        placeholder={isGithub ? "e.g. torvalds" : "https://yourportfolio.com"}
        style={{
          width: "100%",
          padding: "10px 12px",
          borderRadius: 8,
          border: "1px solid #d0d5dd"
        }}
      />

      {error ? <div className="inline-error">{error}</div> : null}

      <button className="analyze-btn" onClick={onSubmit} disabled={loading}>
        Scan Profile
      </button>
    </section>
  );
}

export default GitHubInput;
