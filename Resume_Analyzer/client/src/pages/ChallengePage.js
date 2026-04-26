import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDeveloper } from "../context/DeveloperContext";
import ChallengeCard from "../components/ChallengeCard";
import CodeEditor from "../components/CodeEditor";
import EvaluationReport from "../components/EvaluationReport";

const GENERATE_STEPS = [
  "Reading your profile...",
  "Identifying your domain...",
  "Crafting your challenge...",
  "Almost ready..."
];

const EVAL_STEPS = [
  "Reading your solution...",
  "Checking correctness...",
  "Evaluating reasoning...",
  "Writing feedback..."
];

function useStepTicker(active, steps) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (!active) {
      setIndex(0);
      return undefined;
    }
    const timer = setInterval(() => setIndex((prev) => (prev + 1) % steps.length), 1800);
    return () => clearInterval(timer);
  }, [active, steps]);
  return index;
}

function ChallengePage() {
  const navigate = useNavigate();
  const { developerProfile, updateStage } = useDeveloper();
  const stage1 = developerProfile.stage1;
  const stage2 = developerProfile.stage2?.enrichedProfile;

  const [challenge, setChallenge] = useState(null);
  const [evaluation, setEvaluation] = useState(null);
  const [error, setError] = useState("");
  const [networkError, setNetworkError] = useState("");
  const [loadingGenerate, setLoadingGenerate] = useState(false);
  const [loadingEvaluate, setLoadingEvaluate] = useState(false);

  const generateStep = useStepTicker(loadingGenerate, GENERATE_STEPS);
  const evalStep = useStepTicker(loadingEvaluate, EVAL_STEPS);

  const activeSteps = useMemo(
    () => (loadingGenerate ? GENERATE_STEPS : loadingEvaluate ? EVAL_STEPS : []),
    [loadingGenerate, loadingEvaluate]
  );
  const activeIndex = loadingGenerate ? generateStep : evalStep;

  const generateChallenge = async () => {
    if (!stage1 || !stage2) return;
    setLoadingGenerate(true);
    setError("");
    setNetworkError("");
    try {
      const response = await fetch("http://localhost:8002/api/stage3/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stage1_context: stage1,
          stage2_context: stage2
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || "Challenge generation failed. Please try again.");
      }
      setChallenge(data.challenge);
    } catch (err) {
      const message = err.message || "";
      if (message.toLowerCase().includes("failed to fetch")) {
        setNetworkError(
          "Could not reach the challenge server. Make sure the Challenge backend is running on port 8002."
        );
      } else {
        setError("Challenge generation failed. Please try again.");
      }
    } finally {
      setLoadingGenerate(false);
    }
  };

  useEffect(() => {
    if (stage1 && stage2) {
      generateChallenge();
    }
  }, [stage1, stage2]);

  const submitSolution = async (solution) => {
    if (!solution.trim()) {
      setError("Please write your solution before submitting");
      return;
    }
    setError("");
    setNetworkError("");
    setLoadingEvaluate(true);
    try {
      const response = await fetch("http://localhost:8002/api/stage3/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          challenge,
          solution,
          stage1_context: stage1,
          stage2_context: stage2
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Evaluation failed. Please try again.");

      setEvaluation(data.evaluation);
      updateStage("stage3", { challenge, evaluation: data.evaluation });
    } catch (err) {
      const message = err.message || "";
      if (message.toLowerCase().includes("failed to fetch")) {
        setNetworkError(
          "Could not reach the challenge server. Make sure the Challenge backend is running on port 8002."
        );
      } else {
        setError("Evaluation failed. Please try again.");
      }
    } finally {
      setLoadingEvaluate(false);
    }
  };

  if (!stage1 || !stage2) {
    return (
      <main className="app">
        <section className="container">
          <div className="card">
            <h2>Please complete Resume Analysis and GitHub Scan first.</h2>
            <button className="continue-btn" onClick={() => navigate("/")}>
              Start Over
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="app">
      <section className="container">
        <h1>Stage 3: Domain Challenge</h1>
        <div className="card">
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {["Resume ✓", "GitHub ✓", "Challenge", "Certificate"].map((step) => (
              <span key={step} className="skill-pill">
                {step}
              </span>
            ))}
          </div>
          <div style={{ marginTop: 10, color: "#475467" }}>
            {stage1.name} - {stage2.domain} - {stage2.combinedScore}/10
          </div>
        </div>

        {loadingGenerate || loadingEvaluate ? (
          <section className="card">
            <h3 style={{ marginTop: 0 }}>
              {loadingGenerate ? "Generating Challenge" : "Evaluating Submission"}
            </h3>
            <ul className="loading-steps">
              {activeSteps.map((step, idx) => (
                <li key={step} className={activeIndex === idx ? "active-step" : ""}>
                  <span className="dot" /> {step}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {error ? (
          <section className="card">
            <div className="error-banner">{error}</div>
            {!challenge ? (
              <button className="analyze-btn" onClick={generateChallenge}>
                Retry Challenge Generation
              </button>
            ) : null}
          </section>
        ) : null}

        {networkError ? (
          <section className="card">
            <div className="error-banner">{networkError}</div>
          </section>
        ) : null}

        {challenge ? <ChallengeCard challenge={challenge} /> : null}
        {challenge ? <CodeEditor onSubmit={submitSolution} disabled={loadingEvaluate} /> : null}
        {evaluation ? <EvaluationReport evaluation={evaluation} challenge={challenge} /> : null}

        {evaluation ? (
          <section className="card">
            <button className="continue-btn" onClick={() => navigate("/certificate")}>
              Continue to Certificate →
            </button>
          </section>
        ) : null}
      </section>
    </main>
  );
}

export default ChallengePage;
