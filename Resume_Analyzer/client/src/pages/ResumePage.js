import { useState } from "react";
import { useNavigate } from "react-router-dom";
import UploadZone from "../components/UploadZone";
import LoadingState from "../components/LoadingState";
import ScoreCard from "../components/ScoreCard";
import AnalysisReport from "../components/AnalysisReport";
import { useDeveloper } from "../context/DeveloperContext";

function ResumePage() {
  const navigate = useNavigate();
  const { updateStage } = useDeveloper();
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);

  const handleFileSelect = (file) => {
    setError("");
    setReport(null);
    setSelectedFile(file);
  };

  const analyzeResume = async () => {
    if (!selectedFile) {
      setError("Please select a PDF or DOCX resume first.");
      return;
    }

    setLoading(true);
    setError("");
    setReport(null);

    try {
      const formData = new FormData();
      formData.append("resume", selectedFile);

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || data.detail || "Analysis failed. Please try again.");

      setReport(data);
      updateStage("stage1", data);
    } catch (err) {
      setError(err.message || "Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="app">
      <section className="container">
        <h1>Talent Resume Analyzer</h1>
        <p className="subtitle">
          Upload your resume to receive a structured technical profile and score.
        </p>

        <UploadZone
          selectedFile={selectedFile}
          onFileSelect={handleFileSelect}
          onAnalyze={analyzeResume}
          disabled={loading}
        />

        {error ? <div className="error-banner">{error}</div> : null}
        {loading ? <LoadingState /> : null}

        {report ? (
          <section>
            <div className="report-layout">
              <ScoreCard report={report} />
              <AnalysisReport report={report} />
            </div>
            <div className="card" style={{ marginTop: 12 }}>
              <p style={{ margin: 0, color: "#475467" }}>
                Review your Stage 1 summary, then continue when ready.
              </p>
              <button className="continue-btn" onClick={() => navigate("/github")}>
                Continue to GitHub Scanner →
              </button>
            </div>
          </section>
        ) : null}
      </section>
    </main>
  );
}

export default ResumePage;
