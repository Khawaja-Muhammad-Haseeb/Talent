import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useDeveloper } from "../context/DeveloperContext";
import ScoreSummary from "../components/ScoreSummary";
import CertificateCard from "../components/CertificateCard";

const STEPS = [
  "Calculating your final score...",
  "Generating your credential...",
  "Writing certificate summary...",
  "Uploading to IPFS...",
  "Issuing your certificate..."
];

function CertificatePage() {
  const navigate = useNavigate();
  const { developerProfile, updateStage } = useDeveloper();
  const stage1 = developerProfile.stage1;
  const stage2 = developerProfile.stage2?.enrichedProfile;
  const stage3 = developerProfile.stage3;

  const [loading, setLoading] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");
  const [data, setData] = useState(null);
  const [ineligibleReason, setIneligibleReason] = useState("");
  const onceRef = useRef(false);

  useEffect(() => {
    if (!loading) return undefined;
    const id = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % STEPS.length);
    }, 1800);
    return () => clearInterval(id);
  }, [loading]);

  useEffect(() => {
    if (!stage1 || !stage2 || !stage3 || onceRef.current) return;
    onceRef.current = true;

    const run = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch("http://localhost:8003/api/stage5/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            stage1_context: stage1,
            stage2_context: stage2,
            stage3_context: stage3
          })
        });
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.detail || "Could not generate certificate.");
        }
        if (!payload.eligible) {
          setIneligibleReason(payload.reason || "Certificate cannot be issued at this time.");
          return;
        }
        setData(payload);
        if (payload.warning) setWarning(payload.warning);
        updateStage("stage5", payload);
      } catch (err) {
        const message = err.message || "";
        if (message.toLowerCase().includes("failed to fetch")) {
          setError(
            "Could not reach the certificate server. Make sure the Certificate backend is running on port 8003."
          );
        } else {
          setError(message || "Could not generate certificate.");
        }
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [stage1, stage2, stage3, updateStage]);

  if (!stage1 || !stage2 || !stage3) {
    return (
      <main className="app">
        <section className="container">
          <div className="card">
            <h2>Please complete all previous stages first.</h2>
            <button className="continue-btn" onClick={() => navigate("/")}>
              Start Over
            </button>
          </div>
        </section>
      </main>
    );
  }

  const credential = data?.credential;
  const verifyUrl = credential
    ? `${window.location.origin}/verify/${credential.credentialId}`
    : "";

  const downloadPdf = async () => {
    if (!credential?.credentialId) return;
    try {
      const card = document.getElementById("certificate-card");
      if (!card) throw new Error("Certificate card not found");

      const canvas = await html2canvas(card, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "pt", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const ratio = Math.min(pageWidth / canvas.width, pageHeight / canvas.height);
      const imgWidth = canvas.width * ratio;
      const imgHeight = canvas.height * ratio;
      const x = (pageWidth - imgWidth) / 2;
      const y = 20;

      pdf.addImage(imgData, "PNG", x, y, imgWidth, imgHeight, undefined, "FAST");
      pdf.save(`${credential.credentialId}.pdf`);
    } catch (err) {
      setError("Could not download the certificate PDF. Please try again.");
    }
  };

  return (
    <main className="app">
      <section className="container">
        <div className="card">
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {["Resume ✓", "GitHub ✓", "Challenge ✓", "Certificate ✓"].map((step) => (
              <span className="skill-pill" key={step}>
                {step}
              </span>
            ))}
          </div>
        </div>

        {loading ? (
          <section className="card">
            <h3>Issuing your credential</h3>
            <ul className="loading-steps">
              {STEPS.map((step, idx) => (
                <li key={step} className={idx === stepIndex ? "active-step" : ""}>
                  <span className="dot" /> {step}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {error ? <div className="error-banner">{error}</div> : null}
        {warning ? <div className="warning-section">{warning}</div> : null}
        {ineligibleReason ? <div className="error-banner">{ineligibleReason}</div> : null}

        {credential ? (
          <>
            <section className="card">
              <h1 style={{ marginTop: 0 }}>Certificate Issued</h1>
              <span className="experience-badge">{credential.level}</span>
            </section>

            <ScoreSummary
              scoreData={{
                resumeScore: credential.resumeScore,
                githubScore: credential.githubScore,
                challengeScore: credential.challengeScore,
                finalScore: credential.finalScore,
                level: credential.level
              }}
            />

            <CertificateCard credential={credential} />

            <section className="card no-print">
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button
                  className="analyze-btn"
                  onClick={() => navigator.clipboard.writeText(credential.credentialId)}
                >
                  Copy Credential ID
                </button>
                <button
                  className="analyze-btn"
                  onClick={() => {
                    if (credential.ipfsUrl) window.open(credential.ipfsUrl, "_blank", "noreferrer");
                  }}
                >
                  View on IPFS
                </button>
                <button className="analyze-btn" onClick={downloadPdf}>
                  Download Certificate
                </button>
              </div>
            </section>

            <section className="card no-print">
              <h3>Share your credential</h3>
              <p>Give recruiters your Credential ID: {credential.credentialId}</p>
              <p>They can verify it at: {verifyUrl}</p>
              <input
                value={verifyUrl}
                readOnly
                style={{ width: "100%", border: "1px solid #d0d5dd", borderRadius: 8, padding: 10 }}
              />
            </section>
          </>
        ) : null}
      </section>
      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background: #fff !important;
          }
          #certificate-card {
            box-shadow: none !important;
            margin: 0 !important;
          }
        }
      `}</style>
    </main>
  );
}

export default CertificatePage;
