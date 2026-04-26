import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDeveloper } from "../context/DeveloperContext";
import GitHubInput from "../components/GitHubInput";
import EnrichedProfile from "../components/EnrichedProfile";

const GITHUB_STEPS = [
  "Connecting to GitHub API...",
  "Fetching repositories...",
  "Analyzing language breakdown...",
  "Checking activity history...",
  "Enriching profile with AI..."
];

const PORTFOLIO_STEPS = [
  "Reading portfolio website...",
  "Extracting project information...",
  "Following internal links...",
  "Enriching profile with AI..."
];

function useStepTicker(running, steps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!running) {
      setIndex(0);
      return undefined;
    }
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % steps.length);
    }, 2500);
    return () => clearInterval(id);
  }, [running, steps]);

  return index;
}

function GitHubPage() {
  const navigate = useNavigate();
  const { developerProfile, updateStage } = useDeveloper();
  const stage1 = developerProfile.stage1;

  const [mode, setMode] = useState("github");
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const activeSteps = mode === "github" ? GITHUB_STEPS : PORTFOLIO_STEPS;
  const stepIndex = useStepTicker(loading, activeSteps);

  if (!stage1) {
    return (
      <main className="app">
        <section className="container">
          <div className="card">
            <h2>Please complete the Resume Analysis first.</h2>
            <button className="continue-btn" onClick={() => navigate("/")}>
              Go to Resume Analysis
            </button>
          </div>
        </section>
      </main>
    );
  }

  const handleScan = async () => {
    if (!inputValue.trim()) {
      setError(mode === "github" ? "Please enter a GitHub username." : "Please enter a portfolio URL.");
      return;
    }

    setError("");
    setLoading(true);
    setResult(null);
    try {
      const endpoint =
        mode === "github"
          ? "http://localhost:8001/api/stage2/github"
          : "http://localhost:8001/api/stage2/portfolio";
      const payload =
        mode === "github"
          ? { username: inputValue.trim(), stage1_context: stage1 }
          : { url: inputValue.trim(), stage1_context: stage1 };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) {
        const detail = data.detail || "Analysis failed. Please try again.";
        if (detail.includes("GitHub user not found")) {
          throw new Error("We couldn't find that GitHub username. Double check and try again.");
        }
        if (detail.includes("rate limit")) {
          throw new Error("GitHub rate limit reached. Add a GitHub token to your .env to increase limits.");
        }
        if (detail.includes("Could not fetch portfolio")) {
          throw new Error("We couldn't read that portfolio URL. Make sure it is public and not behind a login.");
        }
        throw new Error(detail);
      }

      setResult(data);
      updateStage("stage2", data);
    } catch (scanError) {
      setError(scanError.message || "Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="app">
      <section className="container">
        <h1>Stage 2: GitHub and Portfolio Scanner</h1>
        <div className="card">
          <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
            {["Resume", "GitHub", "Challenge", "Certificate"].map((step) => (
              <span
                key={step}
                className="skill-pill"
                style={{
                  background: step === "Resume" ? "#ecfdf3" : step === "GitHub" ? "#eff8ff" : "#f9fafb"
                }}
              >
                {step}
              </span>
            ))}
          </div>
          <small style={{ color: "#475467" }}>Resume analysis complete</small>
          <h3 style={{ marginBottom: 4 }}>{stage1.name}</h3>
          <p className="domain">{stage1.domain}</p>
          <strong>
            {stage1.score}/10 - {stage1.experienceLevel}
          </strong>
        </div>

        <GitHubInput
          mode={mode}
          inputValue={inputValue}
          loading={loading}
          error={error}
          onChange={(value, nextMode, forceModeChange) => {
            setInputValue(value);
            if (forceModeChange && nextMode) {
              setMode(nextMode);
              setError("");
              setResult(null);
            }
          }}
          onSubmit={handleScan}
        />

        {loading ? (
          <section className="card">
            <h3 style={{ marginTop: 0 }}>Scanning profile</h3>
            <ul className="loading-steps">
              {activeSteps.map((step, idx) => (
                <li key={step} className={stepIndex === idx ? "active-step" : ""}>
                  <span className="dot" /> {step}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {result ? (
          <EnrichedProfile
            stage1={stage1}
            result={result}
            onContinue={(enrichedProfile) => {
              updateStage("stage3", { previewFromStage2: enrichedProfile });
              navigate("/challenge");
            }}
          />
        ) : null}
      </section>
    </main>
  );
}

export default GitHubPage;
